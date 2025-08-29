# f05 - Caret 계정 시스템 머징 작업

## 기능 개요
- **목적**: Cline 프로바이더 대체 (cline.bot → caret.team)
- **현재 상태**: ✅ 완전 구현 완료 (026번에서 핵심 완성)
- **우선순위**: HIGH - 비즈니스 로직 포함, 수익 모델

## 주요 구성 요소

### 백엔드 서비스
```
src/services/account/
├── CaretAccountService.ts         # 핵심 계정 서비스 로직
└── accountLoginClicked.ts         # 로그인 이벤트 처리

src/core/controller/
└── index.ts                       # Controller에 CaretAccountService 통합

src/api/providers/
└── caret.ts                       # Caret API 핸들러 (200+ 라인)
```

### 프론트엔드 UI
```
webview-ui/src/caret/components/
├── CaretAccountView.tsx           # 계정 관리 메인 UI
├── CaretAccountInfoCard.tsx       # 계정 정보 카드
├── CaretApiSetup.tsx              # API 설정 UI
├── CaretWelcomeSection.tsx        # 웰컴 섹션
└── __tests__/                     # 컴포넌트 테스트들
```

### 핵심 기능
- **Auth0 기반 인증**: 보안 강화된 로그인 및 JWT 토큰
- **Organization 관리**: 팀/조직 단위 계정 관리
- **요금제 시스템**: Free, Pro, Team, Enterprise 티어
- **사용량 대시보드**: 실시간 API 사용량 모니터링
- **투명한 과금**: 명확한 사용량 기반 과금 체계

## 차별화 포인트
- **Cline과 완전 분리**: 독립적인 API 시스템으로 충돌 없음
- **엔터프라이즈 지원**: 대규모 팀 및 조직 지원
- **투명한 과금**: 명확한 사용량 추적 및 요금 체계
- **API 키 분리**: `caretApiKey` ≠ `apiKey` 독립 관리

## 머징 계획

### Phase 1: TDD 테스트 환경 구축
- [ ] 테스트 디렉토리 이식
  ```bash
  cp -r caret-main/webview-ui/src/caret/components/__tests__/ \
        webview-ui/src/caret/components/__tests__/
  ```
- [ ] 테스트 실행 환경 확인
  ```bash
  npm run test:frontend
  ```
- [ ] 의존성 확인 (Auth0, API 모킹 등)

### Phase 2: 백엔드 서비스 이식
- [ ] 계정 서비스 디렉토리 생성
  ```bash
  mkdir -p src/services/account/
  ```
- [ ] CaretAccountService 이식
  ```bash
  cp caret-main/src/services/account/CaretAccountService.ts \
     src/services/account/
  ```
- [ ] Controller 통합 (ClineAccountService → CaretAccountService 교체)
- [ ] API Provider 이식
  ```bash
  cp caret-main/src/api/providers/caret.ts \
     src/api/providers/
  ```

### Phase 3: 프론트엔드 UI 이식
- [ ] Caret 컴포넌트 디렉토리 이식
  ```bash
  cp -r caret-main/webview-ui/src/caret/components/ \
        webview-ui/src/caret/components/
  ```
- [ ] 스타일 이식
  ```bash
  cp caret-main/webview-ui/src/caret/styles/* \
     webview-ui/src/caret/styles/
  ```
- [ ] 타입 정의 이식
  ```bash
  cp caret-main/src/shared/CaretAccount.ts \
     src/shared/
  ```

### Phase 4: 환경 설정 및 구성
- [ ] Auth0 설정
  ```typescript
  // .env 또는 설정 파일
  AUTH0_DOMAIN = "caret.auth0.com"
  AUTH0_CLIENT_ID = "your_client_id" 
  AUTH0_CLIENT_SECRET = "your_client_secret"
  CARET_API_ENDPOINT = "https://api.caret.dev"
  ```
- [ ] API 엔드포인트 구성
  ```typescript
  const CARET_API_BASE = process.env.CARET_API_ENDPOINT || "https://api.caret.dev"
  const endpoints = {
      login: `${CARET_API_BASE}/auth/login`,
      usage: `${CARET_API_BASE}/account/usage`,
      billing: `${CARET_API_BASE}/account/billing`,
      organization: `${CARET_API_BASE}/org`,
  }
  ```

### Phase 5: 통합 테스트
- [ ] 백엔드 단위 테스트 (`npm run test:backend -- account`)
- [ ] 프론트엔드 컴포넌트 테스트 (`npm run test:frontend -- account`)
- [ ] 통합 빌드 테스트
- [ ] E2E 테스트 (F5로 확장 실행 후 계정 기능 수동 테스트)

## 로그인 프로세스 흐름
```
1. CaretAccountInfoCard → accountLoginClicked → Auth0 → JWT Token
2. handleAuthCallback → caretApiKey 저장 → UserInfo 추출
3. CaretHandler → caretApiKey 검증 → API 호출
```

## API 키 관리 구조
```typescript
const apiConfiguration = {
    apiProvider: "gemini",         // 사용자가 선택한 AI 모델
    caretApiKey: "caret_xxx",      // Caret 계정 API 키 (별도)
    // ... 기타 AI 모델 설정들
}
```

## 주의사항
- **API 키 분리**: `caretApiKey` ≠ `apiKey` 혼동 주의
- **환경 변수**: Auth0 및 API 엔드포인트 설정 확인
- **의존성**: Auth0 관련 패키지 설치 확인
- **권한 설정**: VSCode 확장에서 외부 API 호출 권한
- **오류 처리**: 네트워크 오류 시 graceful fallback

## 완료 기준
- [ ] 모든 계정 관련 컴포넌트 테스트 통과
- [ ] Auth0 로그인 플로우 정상 동작
- [ ] caretApiKey 저장 및 검증 정상
- [ ] 사용량 대시보드 데이터 로딩 확인
- [ ] 다국어 UI 정상 표시
- [ ] 조직 관리 기능 동작 확인

## Cline 호환성
### 독립적 운영
- **Cline 계정 시스템**: 기존 그대로 유지
- **Caret 계정 시스템**: 완전 별도 운영  
- **선택적 사용**: 사용자가 Caret 계정 사용 여부 선택

### API Provider 선택권
```typescript
// 사용자는 AI 모델과 계정 시스템을 독립적으로 선택 가능
{
    apiProvider: "anthropic",     // AI 모델은 Anthropic 사용
    caretApiKey: "caret_xxx",     // 계정은 Caret 사용
}
```

## 비즈니스 가치
- **수익 모델**: 구독 기반 SaaS 수익 창출
- **사용자 락인**: 계정 기반 서비스 연결성
- **데이터 수집**: 사용 패턴 분석 및 서비스 개선
- **투명성**: 명확한 사용량 및 과금 정보

## 예상 소요 시간
- **총 시간**: 8-12시간
- **복잡도**: HIGH
- **위험도**: MEDIUM (외부 API 의존성)