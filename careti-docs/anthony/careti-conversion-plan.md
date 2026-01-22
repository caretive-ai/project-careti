# Careti Provider 전환 상세 가이드 (Auth → 계정 → 채팅 전체 플로우 일치)

목표: `provider === "careti"`일 때도 Cline 플로우와 동일하게 로그인/토큰 저장/계정 조회/채팅 스트리밍이 동작하도록 구현. 모든 신규 소스는 `careti-src/` 아래에 Cline과 동일한 경로 구조로 배치.

## 1) 환경 설정
- `careti-src/config`에 `caretEnvConfig` 추가: `apiBaseUrl`, `/auth`, `/token`(코드→토큰 교환), `/refresh`(refresh token), `/chat/transcriptions` 등 careti 전용 엔드포인트 정의.
- FeatureConfig 기본 provider가 careti일 때 위 설정을 사용하도록 분기.

## 2) Auth Provider 계층
- `careti-src/services/auth/providers/CaretAuthProvider.ts`를 `ClineAuthProvider` 기반으로 복제:
  - `secretKeyId = "careti:caretAccountId"` 등 별도 키 사용.
  - 토큰 교환/리프레시 엔드포인트를 careti용으로 교체.
  - WorkOS prefix 필요 시 동일 규칙 유지(없으면 빈 prefix).
- `careti-src/services/auth/AuthService`를 Cline 버전과 동일한 인터페이스로 두되, provider `"careti"`일 때 `CaretAuthProvider`를 선택하도록 작성.
- Secret 스키마: `careti-src/core/storage/state-keys.ts`에 `careti:caretAccountId` 추가, bulk loader(`careti-src/core/storage/utils/state-helpers.ts`)에서 `context.secrets.get(secretKeyId)`로 읽어 초기 상태에 주입.

## 3) URI 핸들러 (SharedUriHandler 재사용)
- 기존 `SharedUriHandler.handleUri` `/auth` 분기에 `provider === "careti"` 처리 추가: 토큰 파싱 → `visibleWebview.controller.handleAuthCallback(token, "careti")`.
- 별도 핸들러를 만들지 않고 동일 페이지를 사용하되, careti provider를 허용하도록 분기만 확장.

## 4) 컨트롤러/상태 매니저
- `Controller.handleAuthCallback` careti 분기: 토큰 저장/기본 provider 설정/`welcomeViewCompleted=true`/`postStateToWebview` 동일 적용.
- `StateManager` careti 버전(`careti-src/core/storage/StateManager.ts` 등)을 Cline과 동일하게 복제해 API 설정/secret 읽기/쓰기 지원.
- `postStateToWebview`: 기존 필드 유지(별도 `caretUserProfile` 사용 안 함).

## 5) API Handler (채팅 스트림)
- `careti-src/core/api/providers/careti-cline.ts`로 `ClineHandler` 복제:
  - baseURL을 `caretEnvConfig.apiBaseUrl`로 교체.
  - `ensureClient`에서 `AuthService.getAuthToken` 호출, Authorization prefix/extra headers를 careti용으로 설정.
  - 사용량 보완(`getApiStreamUsage`)도 careti 엔드포인트로 호출.
- `careti-src/core/api/index.ts`에서 provider `"careti"`이면 위 핸들러를 반환하도록 팩토리 복제.

## 6) 계정/크레딧 서비스 및 gRPC
- `careti-src/services/account/CaretAccountService.ts`: `ClineAccountService` 복제, REST 엔드포인트만 careti용으로 교체.
- gRPC 핸들러 세트(`careti-src/core/controller/account/...`):
  - `getUserCredits`, `getOrganizationCredits`, `getUserOrganizations`, `setUserOrganization`, `accountLoginClicked`, `accountLogoutClicked`, `subscribeToAuthStatusUpdate` 등을 careti 서비스와 매핑.
- gRPC client 코드: `careti-src/webview-ui/src/services/grpc-client.ts`에 careti serviceName을 추가(필요 시 별도 네임스페이스).

## 7) 웹뷰 적용
- `AccountView`는 `clineUser`만으로 렌더해도 되므로, careti도 동일 구조의 `clineUser` 형태를 주입하거나 `caretUser`를 `clineUser` 타입으로 맵핑해 전달. `caretUserProfile`는 사용하지 않음.
- 필요 시 careti 전용 auth 컨텍스트를 만들되, 최종적으로 `AccountView` props(`clineUser`, `organizations`, `activeOrganization`)에 호환되게 공급.
- 채팅 UI는 동일 gRPC 스트림(`StateServiceClient.subscribeToState`, `UiServiceClient.subscribeToPartialMessage`)을 그대로 사용하므로 추가 UI 변경 불필요.

## 8) 토큰 저장/복구/갱신
- 로그인 성공 시 `stateManager.setSecret("careti:caretAccountId", JSON.stringify(authInfo))`.
- `retrieveCaretAuthInfo`: Secret 읽기 → JSON 파싱 → `shouldRefreshIdToken` 검사 → 필요 시 refresh. 실패 시 secret 클리어 후 로그아웃 방송.
- `getAuthToken`: careti provider에서도 동일 경로를 타며 최신 토큰을 반환; prefix 규칙 반영.

## 9) 통합 흐름 점검 체크리스트
1) `/auth` callback `provider=careti` → `handleAuthCallback` → Secret 저장 → `sendAuthStatusUpdate`/`postStateToWebview` 수신.
2) `AccountServiceClient.getUserCredits` 등 gRPC가 careti REST로 위임되고 조직 전환 시 토큰 리프레시 수행.
3) 채팅 시작 시 `buildApiHandler`가 careti 핸들러 선택, `Task.ask`에서 `createMessage` 스트림 수신 → partial/full 메시지가 웹뷰에 표시.
4) SecretStorage(`careti:caretAccountId`) 저장/복구/리프레시, 토큰 만료 시 로그아웃 방송까지 동작 확인.
