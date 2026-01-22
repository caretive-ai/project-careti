# F05 - Careti Account System (ClineAccount 대체)

**상태**: ✅ Phase 4 완료 | **영향 범위**: Backend(Controller/Service), Webview(Account/Settings), gRPC | **우선순위**: 🔴 High

## 📋 개요
Careti 계정 + 프로바이더 스택은 Cline 코드를 그대로 보존하고 진입점에서 분기한다. Careti/Cline 계정은 공존하며, UI/라우팅에서 Careti 우선 경로를 선택한다. Careti 프로바이더와 이미지 생성은 Careti 액세스 토큰을 사용해 `CaretEnv.config().apiBaseUrl`(프로덕션 `https://api.careti.ai`)로 호출한다.

## ✅ 의의
- **사용자 가치**: Careti 전용 모델, 사용량/결제 가시화, 이미지 생성 기능을 Cline 호환성을 유지한 채 제공.
- **머지 안정성**: Cline 로직은 보존하고 진입점에만 Careti 기능을 주입해 충돌 위험을 낮춤.
- **운영 일관성**: 계정 UI, 프로바이더 호출, 이미지 생성이 동일 토큰 흐름을 공유.

## ✨ 추가 기능 요약
- Careti/Cline 듀얼 계정 라우팅.
- Careti Auth API(`/v1/auth/*`) 기반 JWT 인증.
- OpenAI 호환 Careti 프로바이더(`/v1/chat/completions`).
- 이미지 생성(`/v1/generate/image`) 및 워크스페이스 생성 자산 저장.
- @멘션 이미지 첨부(옵션) 및 reference_images 경로/데이터 URL 지원.
- 업로드/멘션/레퍼런스 공통 이미지 최적화(리사이즈 + webp).

## 🆚 Cline 대비 개선점
| 영역 | Cline | Careti |
| --- | --- | --- |
| 계정 모델 | 단일 ClineAccount | **듀얼 계정 시스템**(Careti + Cline) + 진입점 분기 |
| 통신 | REST `cline.bot` | **gRPC + REST** (`api.careti.ai`), 프로토 타입 안전성 |
| 인증 | Auth0(Cline 테넌트) | **Careti Auth API**(`/v1/auth/authorize → /v1/auth/token → /v1/auth/refresh`) + JWT |
| UI | Cline Account 웹뷰 | **Careti 통합 뷰**(Account/Settings에서 잔액·사용량 카드 제공) |

## 🏗 코드 범위 (현재)
- **Backend 컨트롤러**: `src/core/controller/caretAccount/*`(gRPC 핸들러) → `careti-src/services/account/CaretAccountService.ts`(REST; `CaretEnv.config().apiBaseUrl` 사용), `proto/careti/account.proto`.
- **Auth 서비스**: `careti-src/services/auth/CaretAuthService.ts`, `careti-src/services/auth/providers/CaretAuthProvider.ts`(authorize/token/refresh).
- **Careti API 엔드포인트**: `careti-src/shared/careti/api.ts`(`/v1/auth/*`, `/v1/profile/*`).
- **Provider 런타임**: `src/core/api/index.ts` → `careti-src/core/api/providers/careti.ts`(`CaretHandler`, `${apiBaseUrl}/v1/chat/completions`).
- **이미지 생성 도구**: `careti-src/core/task/tools/handlers/GenerateImageToolHandler.ts`(`/v1/generate/image`, 파일 저장 + reference_images 처리).
- **이미지 스코프/레지스트리**: `careti-src/core/task/images/*`(첨부 스코프/레지스트리, size cap 포함).
- **이미지 최적화**: `careti-src/utils/image-optimization.ts`(1024px 리사이즈 + webp, 7500px 초과 거부).
- **멘션 이미지 전송**: `proto/careti/system.proto`(Get/Set/Resolve/Optimize), `src/core/controller/persona/*`, `webview-ui/src/careti/components/MentionImageSendToggle.tsx`, `webview-ui/src/careti/utils/mention-image.ts`.
- **Webview**: `webview-ui/src/components/account/AccountView.tsx`, `webview-ui/src/careti/components/CaretAccountView.tsx`, `webview-ui/src/context/CaretAuthContext.tsx`, `webview-ui/src/components/settings/providers/CaretiProvider.tsx`, `CaretModelPicker.tsx`, `webview-ui/src/careti/utils/imageOptimization.ts`(백엔드 최적화 위임).
- **CLI**: `cli/pkg/cli/auth/auth_caret_provider.go`(로그인/기본 모델 설정, 조직 선택은 현재 비활성).

## 🎯 목표
- Cline 로직 보존, Careti 계정/프로바이더만 진입점 분기.
- Careti 토큰을 계정 UI 데이터와 프로바이더 호출에 공통 사용.

## 🔧 아키텍처 & 플로우
- **계정 진입점 분기**(`webview-ui/src/components/account/AccountView.tsx`)
  ```tsx
  {caretUser?.uid ? <CaretAccountView caretUser={caretUser} /> : clineUser?.uid ? <ClineAccountView /> : <AccountWelcomeView />}
  ```
- **계정 데이터**: Webview gRPC → `CaretAccountServiceClient.*` → `CaretAccountService` → REST `${apiBaseUrl}/v1/profile/*`.
- **인증 상태**: `CaretAuthContext`가 Careti auth 스트림을 구독, `CaretAuthService.getAuthToken()`으로 토큰 제공.
- **Provider 실행**: `CaretHandler`가 `${apiBaseUrl}/v1` OpenAI 호환 API 호출 + `X-AnyLLM-Key` 헤더 적용.
- **이미지 결과 저장**: `generate_image`가 `<workspace>/.agents/generated-assets/`에 저장.
  - `.agents/generated-assets/<request_id>.<ext>` (이미지)
  - `.agents/generated-assets/<request_id>.md` (프롬프트/메타데이터)
- **reference_images 입력**: data URL 또는 워크스페이스 경로를 허용. 경로는 해석 후 최적화(webp/리사이즈)되고 사이즈 캡(2MB/장, 6MB/총합) 적용.
- **@멘션 입력**: 설정 ON 시 @ 경로를 data URL로 변환해 첨부, 최적화는 gRPC `OptimizeImageDataUrls`로 위임.
- **레지스트리 보존 한도**: 이미지 레지스트리 JSON에 저장되는 data URL은 2MB/장, 6MB/총합 제한.

## 🌐 API 표면 (careti.ai)
- Base URL: `CaretEnv.config().apiBaseUrl` (프로덕션 `https://api.careti.ai`).
- Auth: `GET /v1/auth/authorize`, `POST /v1/auth/token`, `POST /v1/auth/refresh`.
- Profile: `GET /v1/profile/balance`, `GET /v1/profile/logs`, `GET /v1/profile/payments`, `GET /v1/auth/me`.
- Provider: `POST /v1/chat/completions`(OpenAI 호환).
- Image: `POST /v1/generate/image`(streamed).

## 🧩 모델 (Careti provider)
- 정적 목록: `src/shared/api.ts`(`caretModels`, `caretDefaultModelId`)
  - `gemini/gemini-3-pro-preview`
  - `gemini/gemini-3-flash-preview`
  - `gemini/gemini-2.5-pro`
  - `gemini/gemini-2.5-flash`(기본)
- CLI 정적 정의는 `npm run cli-providers`로 갱신(`cli/pkg/generated/providers.go`).

## 🧪 테스트 체크리스트
1) Webview: F5 → Account 탭 → CaretAccountView 렌더 + 잔액/사용량 확인.
2) Settings: Careti 로그인 버튼/모델 선택 동작 확인.
3) Provider: Careti 프로바이더로 대화 → 토큰/모델 반영 확인.
4) Image: 이미지 생성 → `.agents/generated-assets/<request_id>.*` 생성 및 경로 표시 확인.
5) Reference images: data URL + 경로 입력 모두 작동, 최적화(webp) 및 사이즈 캡 확인.
6) 이미지 레지스트리: 대용량 data URL이 `image_registry.json`을 과도하게 키우지 않는지 확인.
7) CLI: `careti auth` → Careti 로그인 + 기본 모델 설정 확인.

## 🧭 유지보수 메모
- Cline 로직은 건드리지 않고 `careti-src/**` 경로로 확장한다.
- 모델 추가 시 `src/shared/api.ts` + `npm run cli-providers` 갱신.
- Proto 변경 시 `npm run protos` + `npm run protos-go` 실행.

## 🔗 관련 문서
- F12 - Careti CLI
- F10 - Enhanced Provider Setup
