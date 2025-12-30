# F05 - Caret Account System (ClineAccount 대체)

**상태**: ✅ Phase 4 완료 | **영향 범위**: Backend(Controller/Service), Webview(Account/Settings), gRPC | **우선순위**: 🔴 High

## 📋 개요
Caret 계정 + 프로바이더 스택은 Cline 코드를 그대로 보존하고 진입점에서 분기한다. Caret/Cline 계정은 공존하며, UI/라우팅에서 Caret 우선 경로를 선택한다. Caret 프로바이더와 이미지 생성은 Caret 액세스 토큰을 사용해 `CaretEnv.config().apiBaseUrl`(프로덕션 `https://api.caret.team`)로 호출한다.

## ✅ 의의
- **사용자 가치**: Caret 전용 모델, 사용량/결제 가시화, 이미지 생성 기능을 Cline 호환성을 유지한 채 제공.
- **머지 안정성**: Cline 로직은 보존하고 진입점에만 Caret 기능을 주입해 충돌 위험을 낮춤.
- **운영 일관성**: 계정 UI, 프로바이더 호출, 이미지 생성이 동일 토큰 흐름을 공유.

## ✨ 추가 기능 요약
- Caret/Cline 듀얼 계정 라우팅.
- Caret Auth API(`/v1/auth/*`) 기반 JWT 인증.
- OpenAI 호환 Caret 프로바이더(`/v1/chat/completions`).
- 이미지 생성(`/v1/generate/image`) 및 워크스페이스 생성 자산 저장.

## 🆚 Cline 대비 개선점
| 영역 | Cline | Caret |
| --- | --- | --- |
| 계정 모델 | 단일 ClineAccount | **듀얼 계정 시스템**(Caret + Cline) + 진입점 분기 |
| 통신 | REST `cline.bot` | **gRPC + REST** (`api.caret.team`), 프로토 타입 안전성 |
| 인증 | Auth0(Cline 테넌트) | **Caret Auth API**(`/v1/auth/authorize → /v1/auth/token → /v1/auth/refresh`) + JWT |
| UI | Cline Account 웹뷰 | **Caret 통합 뷰**(Account/Settings에서 잔액·사용량 카드 제공) |

## 🏗 코드 범위 (현재)
- **Backend 컨트롤러**: `src/core/controller/caretAccount/*`(gRPC 핸들러) → `caret-src/services/account/CaretAccountService.ts`(REST; `CaretEnv.config().apiBaseUrl` 사용), `proto/caret/account.proto`.
- **Auth 서비스**: `caret-src/services/auth/CaretAuthService.ts`, `caret-src/services/auth/providers/CaretAuthProvider.ts`(authorize/token/refresh).
- **Caret API 엔드포인트**: `caret-src/shared/caret/api.ts`(`/v1/auth/*`, `/v1/profile/*`).
- **Provider 런타임**: `src/core/api/index.ts` → `caret-src/core/api/providers/caret.ts`(`CaretHandler`, `${apiBaseUrl}/v1/chat/completions`).
- **이미지 생성 도구**: `src/core/task/tools/handlers/GenerateImageToolHandler.ts`(`/v1/generate/image`, 파일 저장).
- **Webview**: `webview-ui/src/components/account/AccountView.tsx`, `webview-ui/src/caret/components/CaretAccountView.tsx`, `webview-ui/src/context/CaretAuthContext.tsx`, `webview-ui/src/components/settings/providers/CaretProvider.tsx`, `CaretModelPicker.tsx`.
- **CLI**: `cli/pkg/cli/auth/auth_caret_provider.go`(로그인/기본 모델 설정, 조직 선택은 현재 비활성).

## 🎯 목표
- Cline 로직 보존, Caret 계정/프로바이더만 진입점 분기.
- Caret 토큰을 계정 UI 데이터와 프로바이더 호출에 공통 사용.

## 🔧 아키텍처 & 플로우
- **계정 진입점 분기**(`webview-ui/src/components/account/AccountView.tsx`)
  ```tsx
  {caretUser?.uid ? <CaretAccountView caretUser={caretUser} /> : clineUser?.uid ? <ClineAccountView /> : <AccountWelcomeView />}
  ```
- **계정 데이터**: Webview gRPC → `CaretAccountServiceClient.*` → `CaretAccountService` → REST `${apiBaseUrl}/v1/profile/*`.
- **인증 상태**: `CaretAuthContext`가 Caret auth 스트림을 구독, `CaretAuthService.getAuthToken()`으로 토큰 제공.
- **Provider 실행**: `CaretHandler`가 `${apiBaseUrl}/v1` OpenAI 호환 API 호출 + `X-AnyLLM-Key` 헤더 적용.
- **이미지 결과 저장**: `generate_image`가 `<workspace>/.agents/generated-assets/`에 저장.
  - `.agents/generated-assets/<request_id>.<ext>` (이미지)
  - `.agents/generated-assets/<request_id>.md` (프롬프트/메타데이터)

## 🌐 API 표면 (caret.team)
- Base URL: `CaretEnv.config().apiBaseUrl` (프로덕션 `https://api.caret.team`).
- Auth: `GET /v1/auth/authorize`, `POST /v1/auth/token`, `POST /v1/auth/refresh`.
- Profile: `GET /v1/profile/balance`, `GET /v1/profile/logs`, `GET /v1/profile/payments`, `GET /v1/auth/me`.
- Provider: `POST /v1/chat/completions`(OpenAI 호환).
- Image: `POST /v1/generate/image`(streamed).

## 🧩 모델 (Caret provider)
- 정적 목록: `src/shared/api.ts`(`caretModels`, `caretDefaultModelId`)
  - `gemini/gemini-3-pro-preview`
  - `gemini/gemini-2.5-pro`
  - `gemini/gemini-2.5-flash`(기본)
- CLI 정적 정의는 `npm run cli-providers`로 갱신(`cli/pkg/generated/providers.go`).

## 🧪 테스트 체크리스트
1) Webview: F5 → Account 탭 → CaretAccountView 렌더 + 잔액/사용량 확인.
2) Settings: Caret 로그인 버튼/모델 선택 동작 확인.
3) Provider: Caret 프로바이더로 대화 → 토큰/모델 반영 확인.
4) Image: 이미지 생성 → `.agents/generated-assets/<request_id>.*` 생성 및 경로 표시 확인.
5) CLI: `cline auth` → Caret 로그인 + 기본 모델 설정 확인.

## 🧭 유지보수 메모
- Cline 로직은 건드리지 않고 `caret-src/**` 경로로 확장한다.
- 모델 추가 시 `src/shared/api.ts` + `npm run cli-providers` 갱신.
- Proto 변경 시 `npm run protos` + `npm run protos-go` 실행.

## 🔗 관련 문서
- F12 - Caret CLI
- F10 - Enhanced Provider Setup
