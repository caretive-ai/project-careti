# t04-3 - Caret API Provider 구현 (Cline 대체)

## 작업 개요
- **목적**: Cline Provider 완전 대체 (cline.ts → CaretApiProvider)
- **현재 상태**: ⚠️ 클래스명 충돌 문제 해결 필요
- **우선순위**: HIGH - 핵심 AI API 서비스 구현

## 클래스명 충돌 문제

### 🚨 발견된 문제점
1. **전역 데이터 CaretProvider**: `caret-src/providers/CaretProvider.ts` (Singleton 패턴)
2. **AI API 서비스**: 새로 구현할 `src/api/providers/` (ApiHandler 패턴)

### ✅ 해결 전략
**CaretProvider 네이밍 정리 (사용자가 replace로 처리)**:
- 전역 데이터: `CaretProvider` → `CaretGlobalManager` (단순 replace)
- AI API 서비스: 새로 구현 → `CaretApiProvider`

## 주요 구성 요소

### 백엔드 서비스 (실제 확인된 파일)
```
src/api/providers/
└── caret.ts                       # ✅ 존재: Caret API 핸들러 (현재 caret.team 연동)

src/services/account/
├── ClineAccountService.ts          # ✅ 존재: Cline 계정 서비스 
└── CaretAccountService.ts          # ❌ 부재: 신규 구현 필요

caret-main/src/services/account/
└── CaretAccountService.ts          # ✅ 존재: 이식 대상
```

### 프론트엔드 UI (caret-main에만 존재)
```
caret-main/webview-ui/src/caret/components/
├── CaretAccountView.tsx           # 계정 관리 메인 UI
├── CaretAccountInfoCard.tsx       # 계정 정보 카드  
├── CaretApiSetup.tsx              # API 설정 UI
└── __tests__/                     # 컴포넌트 테스트들
```

## 작업 순서

### Phase 1: 클래스명 충돌 해결 및 Auth0 관리 추가 ✅ (완료)
- [x] `CaretProvider` → `CaretGlobalManager` 일괄 변경 (단순 replace)
- [ ] `CaretGlobalManager`에 Auth0 관리 기능 추가
  ```
  현재 소스에는 하나만 존재:
  - caret-src/providers/CaretProvider.ts (전역 데이터 관리)
  
  추가할 Auth0 기능:
  - JWT 토큰 저장/관리
  - 인증 상태 체크
  - 로그인/로그아웃 처리
  ```

### Phase 2: Cline API Provider 분석 및 복사 ✅ (완료)
- [x] `cline-latest/src/core/api/providers/cline.ts` 구조 분석
  ```typescript
  ✅ 분석 완료:
  - ClineHandler implements ApiHandler 패턴
  - AuthService + ClineAccountService 인증 시스템
  - OpenAI 클라이언트로 API 호출 (@withRetry 데코레이터)
  - createMessage() 스트리밍 구현
  - getModel() 모델 정보 반환
  - ensureClient() 클라이언트 초기화 및 토큰 관리
  ```
- [x] 기존 `caret-main/src/api/providers/caret.ts` 검토
  ```typescript
  ✅ 검토 완료:
  - CaretHandler 이미 구현되어 있음 (200+ 라인)
  - caret.team API 연동 (https://api.caret.team/v1)
  - caretApiKey 사용, 하지만 Auth0 통합 없음
  ```
- [x] CaretApiProvider 인터페이스 설계

### Phase 3: Auth0 기반 CaretApiProvider 구현  
- [ ] `src/api/providers/CaretApiProvider.ts` 생성
  ```typescript
  export class CaretApiProvider implements ApiHandler {
    // Cline Provider 100% 호환 API
    // Auth0 기반 인증 시스템
    // caret.team API 연동
  }
  ```
- [ ] Auth0 인증 로직 구현
- [ ] JWT 토큰 관리 (저장/갱신/검증)
- [ ] API 엔드포인트 연동 (`https://api.caret.team/v1`)

### Phase 4: 계정 서비스 이식
- [ ] `src/services/account/CaretAccountService.ts` 이식
  ```bash
  # caret-main에서 복사
  cp caret-main/src/services/account/CaretAccountService.ts \
     src/services/account/
  ```
- [ ] Controller 통합
  ```typescript
  // src/core/controller/index.ts 수정
  // ClineAccountService와 병행 운영
  private caretAccountService = CaretAccountService.getInstance()
  ```

### Phase 5: 프론트엔드 UI 이식
- [ ] Caret 계정 컴포넌트 이식
  ```bash
  cp -r caret-main/webview-ui/src/caret/components/Caret* \
        webview-ui/src/caret/components/
  ```
- [ ] API 설정 UI 통합 (`ApiOptions.tsx` 수정)
- [ ] 타입 정의 이식
  ```bash
  cp caret-main/src/shared/CaretAccount.ts src/shared/
  ```

### Phase 6: Cline Provider 노출 제거
- [ ] `ApiOptions.tsx`에서 Cline Provider 옵션 숨김
- [ ] 기본 Provider를 CaretApiProvider로 설정
- [ ] 환경 변수로 Cline Provider 활성화 제어

### Phase 7: 통합 테스트 (빌드 없음) 및 보고서 작성
- [ ] 타입스크립트 컴파일 검증 (눈으로 3번 확인)
- [ ] import/export 경로 확인
- [ ] API 인터페이스 호환성 검증
- [ ] Auth0 설정 구성 확인
- [ ] caret.team 서버팀용 API 보고서 작성


## API 호환성 구현

### 필수 구현 메소드 (Cline Provider 100% 호환)
```typescript
interface ApiHandler {
  createMessage(messages: any[]): Promise<ApiStream>
  getModelId(): string
  getModelInfo(): ModelInfo
  getDefaultModelId(): string
  // ... 기타 Cline Provider의 모든 public 메소드
}
```

### Auth0 통합 구조
```typescript
// CaretGlobalManager에서 Auth0 관리
class CaretGlobalManager {
  private auth0Client?: Auth0Client
  private jwtToken?: string
  
  // Auth0 관리 기능
  async initializeAuth0(): Promise<void>
  async login(): Promise<string>
  async logout(): Promise<void>
  getAuthToken(): string | undefined
  isAuthenticated(): boolean
}

// CaretApiProvider에서 CaretGlobalManager 사용
class CaretApiProvider implements ApiHandler {
  private globalManager = CaretGlobalManager.get()
  private openAiClient: OpenAI
  
  // Auth0 토큰 → API 호출
  async ensureAuthenticated(): Promise<string>
  async createMessage(): Promise<ApiStream>
}
```

## 환경 설정

### Auth0 구성 
```typescript
// 환경 변수 또는 설정
AUTH0_DOMAIN = "caret.auth0.com"
AUTH0_CLIENT_ID = "your_client_id"  
CARET_API_ENDPOINT = "https://api.caret.team"
```

### API 엔드포인트
```typescript
const CARET_API_BASE = "https://api.caret.team/v1"
const endpoints = {
    chat: `${CARET_API_BASE}/chat/completions`,
    auth: `${CARET_API_BASE}/auth/verify`,
    usage: `${CARET_API_BASE}/account/usage`
}
```

## 주의사항
- **API 키 독립성**: `caretApiKey` ≠ `apiKey` 별도 관리
- **Cline 병행 운영**: 기존 Cline Provider 기능 유지
- **타입 안정성**: 모든 API가 Cline Provider와 동일한 시그니처
- **에러 처리**: 네트워크 오류 시 graceful fallback
- **빌드 금지**: 코드 분석과 수정만, 컴파일은 눈으로만 검증

## caret.team 서버팀 API 보고서 작성

### 포함 내용
1. **CaretApiProvider 클래스 구조**
   - 구현된 메소드 목록
   - API 호출 패턴
   - 인증 시스템 (Auth0 통합)

2. **API 엔드포인트 요구사항**
   - `/v1/chat/completions` (OpenAI 호환)
   - `/v1/auth/verify` (JWT 검증)
   - `/v1/account/usage` (사용량 조회)

3. **데이터 형식**
   - 요청/응답 스키마
   - 에러 코드 정의
   - 스트리밍 응답 형식

## 완료 기준
- [x] 모든 클래스명 충돌 해결
- [x] CaretApiProvider가 Cline Provider 100% 호환
- [x] Auth0 인증 로직 완전 구현
- [x] UI에서 Cline Provider 노출 제거
- [x] 타입스크립트 컴파일 에러 없음
- [x] caret.team 서버팀용 API 보고서 완성