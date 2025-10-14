# Caret API Provider 구현 보고서

## 개요

Cline Provider를 완전 대체하는 **CaretApiProvider**를 성공적으로 구현했습니다. 이 보고서는 caret.team 서버 개발팀을 위한 API 연동 가이드입니다.

## 구현된 CaretApiProvider 구조

### 클래스 구조
```typescript
export class CaretApiProvider implements ApiHandler {
  private options: CaretApiHandlerOptions
  private globalManager = CaretGlobalManager.get()
  private client: OpenAI | undefined
  private readonly _baseUrl = "https://api.caret.team"
  lastGenerationId?: string
}
```

### 주요 구현 메소드

#### 1. 인증 시스템
```typescript
private async ensureClient(): Promise<OpenAI>
```
- Auth0 JWT 토큰 또는 caretApiKey를 자동 선택
- CaretGlobalManager를 통한 토큰 갱신 감지
- OpenAI 클라이언트 자동 초기화

#### 2. 스트리밍 API
```typescript
@withRetry()
async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
```
- Cline Provider 100% 호환 API
- OpenRouter 스트림 포맷 활용
- 실시간 에러 처리 및 복구

#### 3. 사용량 추적
```typescript
async getApiStreamUsage(): Promise<ApiStreamUsageChunk | undefined>
```
- Generation ID 기반 사용량 조회
- 토큰 사용량 및 비용 계산
- 무료 모델 비용 제외 처리

## API 엔드포인트 요구사항

### 1. 채팅 완료 엔드포인트
- **URL**: `https://api.caret.team/api/v1/chat/completions`
- **Method**: POST
- **Format**: OpenAI 호환 스트리밍 API
- **Headers**:
  ```javascript
  {
    "Authorization": "Bearer {JWT_TOKEN_OR_API_KEY}",
    "HTTP-Referer": "https://caret.team",
    "X-Title": "Caret",
    "X-Task-ID": "{TASK_ULID}",
    "X-Caret-Version": "{EXTENSION_VERSION}"
  }
  ```

### 2. 사용량 조회 엔드포인트
- **URL**: `https://api.caret.team/generation?id={GENERATION_ID}`
- **Method**: GET
- **Response**:
  ```json
  {
    "native_tokens_cached": 0,
    "native_tokens_prompt": 1500,
    "native_tokens_completion": 800,
    "total_cost": 0.024
  }
  ```

### 3. 인증 검증 엔드포인트 (선택사항)
- **URL**: `https://api.caret.team/v1/auth/verify`
- **Method**: POST
- **Purpose**: JWT 토큰 유효성 검증

## 데이터 형식

### 요청 스키마 (OpenAI 호환)
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "messages": [
    {
      "role": "system",
      "content": "You are an AI assistant..."
    },
    {
      "role": "user", 
      "content": "Hello, world!"
    }
  ],
  "stream": true,
  "max_tokens": 4096
}
```

### 스트리밍 응답 형식
```json
{
  "id": "gen_abc123",
  "choices": [{
    "delta": {
      "content": "Hello! How can I help you today?"
    }
  }],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 20,
    "total_tokens": 70,
    "cost": 0.015
  }
}
```

### 에러 응답 형식
```json
{
  "error": {
    "code": "insufficient_quota",
    "message": "API quota exceeded",
    "metadata": {
      "current_usage": 1000,
      "limit": 1000
    }
  }
}
```

## Auth0 통합 시스템

### CaretGlobalManager Auth0 기능
```typescript
// Auth0 클라이언트 초기화
await CaretGlobalManager.initAuth0(auth0Client)

// 로그인 처리
const jwtToken = await CaretGlobalManager.login()

// 토큰 조회
const token = CaretGlobalManager.authToken

// 인증 상태 확인
const isLoggedIn = CaretGlobalManager.isAuthenticated
```

### JWT 토큰 형식 요구사항
- **Algorithm**: RS256 또는 HS256
- **Issuer**: caret.auth0.com
- **Audience**: api.caret.team
- **Claims**: 
  ```json
  {
    "sub": "user_id",
    "email": "user@example.com",
    "exp": 1700000000,
    "iat": 1600000000
  }
  ```

## 무료 모델 지원

CaretApiProvider는 다음 무료 모델들을 지원합니다:
- `caret/sonic`: 고속 응답 모델 (비용 0)
- `caret/free`: 일반 무료 모델 (비용 0)

무료 모델 사용 시 `totalCost = 0`으로 자동 설정됩니다.

## 에러 처리 시스템

### 1. 인증 에러
```typescript
throw new Error("Caret API authentication required. Please login or provide API key.")
```

### 2. API 에러
```typescript
throw new Error(`Caret API Error ${error.code}: ${error.message}`)
```

### 3. 중간 스트림 에러
```typescript
throw new Error(`Caret Mid-Stream Error: ${error.code} - ${error.message}`)
```

## 성능 최적화

### 1. 토큰 캐싱
- 토큰 변경 감지 시에만 OpenAI 클라이언트 재생성
- CaretGlobalManager를 통한 중앙화된 토큰 관리

### 2. 재시도 메커니즘
- `@withRetry()` 데코레이터 활용
- 네트워크 오류 시 자동 재시도

### 3. 사용량 fallback
- 스트림에서 usage 청크 누락 시 generation 엔드포인트 호출
- 15초 타임아웃으로 hanging request 방지

## 개발 환경 설정

### TypeScript 타입 정의
```typescript
// shared/api.ts에 추가됨
export type ApiProvider = "caret" | /* ... 기존 providers */

interface ApiHandlerOptions {
  caretApiKey?: string
  // ... 기존 options
}
```

### 환경 변수
```bash
# Auth0 설정
AUTH0_DOMAIN=caret.auth0.com
AUTH0_CLIENT_ID=your_client_id

# API 엔드포인트
CARET_API_ENDPOINT=https://api.caret.team

# 디버깅용 Cline Provider 노출 (기본값: false)
CARET_SHOW_CLINE_PROVIDER=true
```

## 배포 확인사항

### 1. API 호환성 검증
- [x] ApiHandler 인터페이스 100% 구현
- [x] OpenRouter 스트림 형식 호환
- [x] Cline Provider와 동일한 응답 구조

### 2. 인증 시스템 테스트
- [x] Auth0 JWT 토큰 처리
- [x] API 키 fallback 지원
- [x] 토큰 갱신 자동 감지

### 3. UI 통합 완료
- [x] Cline Provider 기본 노출 제거
- [x] 환경 변수 기반 선택적 노출
- [x] 로그인/로그아웃 메시지 Caret 브랜딩

## 서버 개발 체크리스트

- [ ] `/api/v1/chat/completions` 엔드포인트 구현
- [ ] `/generation?id={id}` 사용량 조회 API 구현
- [ ] Auth0 JWT 토큰 검증 로직 구현
- [ ] OpenAI 호환 요청/응답 형식 지원
- [ ] 스트리밍 응답 청크 구현
- [ ] 에러 처리 및 상태 코드 정의
- [ ] 무료 모델 비용 계산 로직
- [ ] CORS 설정 (https://caret.team 도메인)

## 마무리

CaretApiProvider는 Cline Provider를 완전 대체하는 Auth0 기반 API 시스템으로 성공적으로 구현되었습니다. caret.team 서버팀에서는 위 명세서에 따라 API 엔드포인트를 구현하면 즉시 연동이 가능합니다.

추가 질문이나 API 명세 변경이 필요한 경우 개발팀에 연락 주시기 바랍니다.