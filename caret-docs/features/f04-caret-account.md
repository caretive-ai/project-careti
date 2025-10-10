# F04 - Caret Account System

**상태**: 🔄 Phase 5로 연기 (Frontend 필요)
**구현도**: Backend 준비 완료, Frontend 대기
**우선순위**: HIGH - Cline 계정 완전 대체

---

## 📋 개요

**목표**: ClineAccount 완전 대체 - Cline 코드 보존하면서 Caret 독립 계정 시스템 구축

**핵심 전략**: 진입점만 변경하여 최소 침습 달성
```typescript
// AccountView.tsx 진입점 분기
{caretUser?.uid ? (
    <CaretAccountView />     // 🎯 Caret 계정
) : clineUser?.uid ? (
    <ClineAccountView />     // ✅ Cline 계정 (보존)
) : (
    <AccountWelcomeView />   // ✅ 비로그인
)}
```

---

## 🏗️ Backend 구현 상태 (Phase 4)

### ✅ 완료된 Backend 인프라

**1. Proto 정의**
```
proto/caret/account.proto
├── CaretAccountService (8개 RPC)
├── CaretUserInfo, CaretAuthState
└── 1000+ 필드 오프셋 규칙 준수
```

**2. gRPC 핸들러**
```
src/core/controller/caretAccount/
├── caretAccountLoginClicked.ts      # Auth0 로그인
├── caretAccountLogoutClicked.ts     # 로그아웃
├── getCaretUserCredits.ts           # 크레딧 조회
├── subscribeToCaretAuthStatusUpdate.ts  # 인증 상태 구독
└── [4개 조직 관련 핸들러]
```

**3. CaretAccountService**
```
src/services/account/CaretAccountService.ts
- caret.team API 호출 로직 완성
- GET /api/v1/account/balance
- GET /api/v1/account/usage
- JWT 토큰 기반 인증
```

**4. 자동 생성 시스템**
```
scripts/build-proto.mjs
- Proto 후처리 자동화
- Namespace 오류 자동 수정
- npm run protos 완전 자동화
```

---

## 🔄 Phase 5에서 해야 할 작업

### ❌ Frontend 구현 필요

**1. CaretAccountView 컴포넌트**
```
webview-ui/src/caret/components/CaretAccountView.tsx
- gRPC 클라이언트 통신
- 잔액 표시, 사용량 히스토리
- 로그아웃, 대시보드 링크
```

**2. CaretAccountInfoCard**
```
webview-ui/src/caret/components/CaretAccountInfoCard.tsx
- Settings 페이지 통합
- 계정 상태 카드 표시
```

**3. AccountView 진입점 수정**
```
webview-ui/src/components/account/AccountView.tsx
- caretUser 상태 분기 추가
- CaretAccountView 연결
```

**4. 상태 관리**
```
webview-ui/src/context/ExtensionStateContext.tsx
- CaretUser 타입 추가
- Auth0 토큰 → caretUser 변환
```

---

## 🌐 API 요구사항 (서버팀)

### 핵심 엔드포인트

**1. 채팅 완성 API (최우선)**
```http
POST https://api.caret.team/api/v1/chat/completions
Authorization: Bearer {jwt_token}
```

**2. 잔액 조회 API**
```http
GET https://api.caret.team/api/v1/account/balance
Response: {currentBalance: number, currency: string}
```

**3. 사용량 조회 API**
```http
GET https://api.caret.team/api/v1/account/usage?limit=10
Response: [{id, timestamp, model, tokens, cost}]
```

---

## 📊 Cline vs Caret 분리

| 구분 | Cline | Caret |
|------|-------|-------|
| **서버** | clineEnvConfig.apiBaseUrl | https://api.caret.team |
| **인증** | ClineAccountService | CaretAccountService |
| **토큰** | clineAccountAuthToken | caretApiKey (Auth0 JWT) |
| **UI** | ClineAccountView | CaretAccountView |

---

## ⚠️ Phase 4에서 연기된 이유

**Frontend 의존성**:
- ✅ Backend gRPC 핸들러 완료
- ✅ Proto 정의 완료
- ✅ API 호출 로직 완료
- ❌ **React 컴포넌트 미구현** (Frontend 필요)
- ❌ **상태 관리 UI 미구현** (Frontend 필요)

**결론**: Backend는 100% 완료, Frontend 구현만 남음

---

## 📝 Modified Files (Phase 4)

**Backend만 수정** (Frontend 없음):
```
src/core/controller/caretAccount/*.ts     # 8개 gRPC 핸들러
proto/caret/account.proto                 # Proto 정의
src/services/account/CaretAccountService.ts  # API 서비스
scripts/build-proto.mjs                   # 빌드 자동화
```

**Phase 5 수정 예정** (Frontend):
```
webview-ui/src/caret/components/CaretAccountView.tsx
webview-ui/src/caret/components/CaretAccountInfoCard.tsx
webview-ui/src/components/account/AccountView.tsx
webview-ui/src/context/ExtensionStateContext.tsx
```

---

**작성일**: 2025-10-10
**Phase**: Phase 4 Backend (연기) → Phase 5 Frontend 예정
**최종 업데이트**: Phase 4 완료 후 문서화
