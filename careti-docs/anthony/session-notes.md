# Session Notes (Full Detail)

## 1) /auth 콜백 → 계정 화면까지 전체 흐름
1. VS Code 확장에서 외부 로그인 시작: 웹뷰의 `handleSignIn`(`webview-ui/src/context/ClineAuthContext.tsx`) 등에서 `AccountServiceClient.accountLoginClicked` 호출 → 컨트롤러 gRPC 핸들러 `accountLoginClicked` → `AuthService.createAuthRequest`가 `/auth` 콜백 URL을 포함한 로그인 URL을 만들고 외부 브라우저를 연다.
2. 로그인 완료 후 리다이렉트: `/auth?...` 콜백이 확장 측 `SharedUriHandler.handleUri`(`src/services/uri/SharedUriHandler.ts`)에서 처리된다. 쿼리의 `token/refreshToken/idToken/code`와 `provider`를 파싱해 `visibleWebview.controller.handleAuthCallback(token, provider || "careti")` 호출.
3. 컨트롤러 처리(`src/core/controller/index.ts:455`):
   - `provider !== "careti"`이면 `AuthService.handleAuthCallback` → 코드→토큰 교환, `_clineAuthInfo` 세팅, `_authenticated=true`, `sendAuthStatusUpdate`.
   - `provider === "careti"`이면 Careti 토큰 저장 후 API provider 기본값을 feature-config 기본 provider로 설정하고 상태 저장.
   - 두 경우 모두 `stateManager.setApiConfiguration` 갱신, `welcomeViewCompleted=true`, `postStateToWebview`로 상태 broadcast.
4. Auth 상태 스트림: `AuthService.sendAuthStatusUpdate`가 `AuthState`(uid/email/displayName/appBaseUrl 포함)를 모든 구독자에 push. `AccountServiceClient.subscribeToAuthStatusUpdate`가 웹뷰에서 수신.
5. 웹뷰 계정 컨텍스트: `ClineAuthProvider`(`webview-ui/src/context/ClineAuthContext.tsx`)가 위 스트림을 구독하여 `clineUser`를 세팅하고 새 유저 등장 시 `getUserOrganizations` RPC로 조직 리스트를 가져와 `activeOrganization`을 계산.
6. 전체 확장 상태: `ExtensionStateContext`(`webview-ui/src/context/ExtensionStateContext.tsx`)가 `StateServiceClient.subscribeToState`로 API 설정·featureConfig·`apiConfiguration.caretUserProfile` 등을 hydrate. 여기서 `showAccount` 플래그도 관리.
7. 계정 화면 렌더: `App.tsx`가 `showAccount`일 때 `AccountView` 렌더(`webview-ui/src/App.tsx`). `AccountView`(`webview-ui/src/components/account/AccountView.tsx`)는 우선순위로 (1) `caretUserProfile` 존재 → `CaretAccountView`, (2) `clineUser.uid` 존재 → `ClineAccountView`, (3) 둘 다 없으면 `AccountWelcomeView`(로그인 유도).
8. `ClineAccountView`는 `AccountServiceClient`를 통해 크레딧/사용량/조직 전환을 gRPC로 요청하며, 로그아웃은 `handleSignOut`(`ClineAuthContext`)으로 수행.

## 2) 채팅 입력 → API 호출(스트리밍) 흐름
1. 웹뷰 입력: `ChatTextArea`(`webview-ui/src/components/chat/ChatTextArea.tsx`)에서 Enter(Shift 없이) 시 `onSend()` 호출 → `InputSection`이 전달한 `messageHandlers.handleSendMessage` 실행.
2. 메시지 전송 로직(`useMessageHandlers`, `webview-ui/src/components/chat/chat-view/hooks/useMessageHandlers.ts`):
   - Quote가 있으면 `[context] ... [/context]` 포맷으로 본문에 붙인다.
   - 대화가 비어 있으면 `TaskServiceClient.newTask(NewTaskRequest)` 호출 → 컨트롤러 gRPC `newTask`(`src/core/controller/task/newTask.ts`) → `controller.initTask`로 새 `Task` 생성.
   - 진행 중 ask(`clineAsk`) 상태면 `TaskServiceClient.askResponse`를 `responseType: "messageResponse"`로 호출하여 답변 전달.
   - 전송 후 입력/첨부 초기화, `sendingDisabled` 등 UI 상태 업데이트.
3. 확장 측 Task 초기화(`src/core/task/index.ts`):
   - 생성자에서 `buildApiHandler`로 현재 모드(plan/act)와 `apiConfiguration`에 맞는 provider 핸들러 결정. provider가 `cline`이면 `new ClineHandler(...)`.
   - Task의 `startTask`/`ask`에서 시스템 프롬프트(`getSystemPrompt`)와 잘린 대화 히스토리(`ContextManager.getNewContextMessagesAndMetadata`)를 준비한 뒤 `this.api.createMessage(systemPrompt, truncatedHistory)` 호출.
4. 스트림 소비(`Task.ask` at `src/core/task/index.ts:1438`):
   - `createMessage`의 async iterator를 순회하며 chunk 단위로 `say`/`sendPartialMessageEvent`를 통해 `clineMessages`에 partial/완료 메시지를 기록하고 웹뷰로 전송.
   - 오류나 context-window 초과 시 재시도/ask 흐름을 수행, 사용량 chunk 누락 시 `getApiStreamUsage`(ClineHandler)로 보완.
5. 웹뷰 수신: `ExtensionStateContext`가 `StateServiceClient.subscribeToState`로 전체 메시지를 받고, 토큰 스트리밍은 `UiServiceClient.subscribeToPartialMessage`로 부분 메시지를 갱신. `ChatView`는 `clineMessages`를 기반으로 렌더/버튼 상태를 갱신.

## 3) ClineAccountService 사용처 (토큰 기반 REST 클라이언트)
- 파일: `src/services/account/ClineAccountService.ts` — WorkOS prefix 토큰으로 Cline REST 호출.
- 컨트롤러 gRPC 핸들러들:
  - `getUserCredits`, `getOrganizationCredits`, `getUserOrganizations`, `setUserOrganization`에서 각각 balance/usage/payments/조직 목록/조직 전환을 RPC variant로 호출해 웹뷰 `AccountServiceClient` 응답을 만든다.
- 기타:
  - 음성 전사 `VoiceTranscriptionService.transcribeAudio`가 `/api/v1/chat/transcriptions`를 호출.
  - `ClineHandler.getApiStreamUsage`가 스트리밍 사용량 누락 시 `/generation?id=...`로 토큰/비용을 재조회.

## 4) ClineHandler.createMessage 호출 경로와 동작
- 선택 경로: `buildApiHandler`(`src/core/api/index.ts`)에서 provider가 `cline`일 때 `new ClineHandler`. Task 생성/모드 전환 시마다 `Controller`가 `task.api = buildApiHandler(...)`로 핸들러를 교체/갱신.
- 호출 지점: `Task.ask`(`src/core/task/index.ts:1438`)가 시스템 프롬프트와 컨텍스트를 준비한 뒤 `this.api.createMessage(...)`를 호출해 스트림을 받는다.
- 내부 동작(`src/core/api/providers/cline.ts`):
  - `ensureClient`가 매번 `AuthService.getAuthToken`으로 최신 토큰을 확보, OpenAI 호환 클라이언트를 생성/갱신(baseURL=`{clineEnvConfig.apiBaseUrl}/api/v1`, WorkOS prefix 포함).
  - `createMessage`가 `createOpenRouterStream`으로 chunk를 순회하며 text/reasoning/usage를 `yield`. 첫 사용량 chunk가 없으면 `getApiStreamUsage`에서 `/generation?id=...`를 Authorization 헤더로 재조회.
  - 스트림 도중 `x-request-id` 헤더를 기록해 후속 사용량 조회에 활용.

## 5) 인증 토큰 처리 흐름
- 저장/교환:
  - `/auth` 콜백 → `SharedUriHandler.handleUri` → `Controller.handleAuthCallback` → (비 careti) `AuthService.handleAuthCallback`가 `IAuthProvider.signIn`(여기서는 `ClineAuthProvider.handleAuthCallback`)을 통해 `accessToken/refreshToken/expiresAt/userInfo`를 받아 `_clineAuthInfo` 저장.
  - 로그인 성공 후 `sendAuthStatusUpdate`가 웹뷰에 `AuthState` broadcast, `postStateToWebview`로 상태 전달.
- 조회/갱신(`AuthService.getAuthToken`):
  - 현재 provider의 `retrieveClineAuthInfo`로 시크릿에서 authInfo 로드.
  - `shouldRefreshIdToken`(만료 임박 5분) 시 `retrieveClineAuthInfo`→`refreshToken` 경로로 재발급 시도. 실패 시 `_authenticated=false`로 클리어하고 로그아웃 상태 방송.
  - 토큰 반환 시 `provider === "cline"`이면 `Bearer workos:<idToken>` 형태로 prefix를 붙여 백엔드가 WorkOS 검증을 하도록 함.
- 사용처: `ClineHandler.ensureClient`, `ClineAccountService.authenticatedRequest`, `VoiceTranscriptionService`, 조직 전환 후 `restoreRefreshTokenAndRetrieveAuthInfo` 등 모든 Cline API 경로가 `getAuthToken`을 통해 최신 토큰을 확보.

## 6) Secret 저장 키 `cline:clineAccountId`
- 정의: `ClineAuthProvider.secretKeyId = "cline:clineAccountId"`(`src/services/auth/providers/ClineAuthProvider.ts`).
- 저장: `ClineAuthProvider.handleAuthCallback`(토큰 교환)에서 `stateManager.setSecret(secretKeyId, JSON.stringify(clineAuthInfo))`.
- 로드/검증: `retrieveClineAuthInfo`가 `stateManager.getSecretKey(secretKeyId)`를 읽어 JSON 파싱, `refreshToken`/`idToken` 유효성 확인 후 필요 시 `refreshToken` 호출. 파싱 실패나 토큰 누락 시 시크릿을 undefined로 클리어.
- 스키마/불러오기: `Secrets` 인터페이스(`src/core/storage/state-keys.ts`)와 bulk secret 로더(`src/core/storage/utils/state-helpers.ts`)가 `context.secrets.get(ClineAuthProvider.secretKeyId)`로 읽어 초기 상태에 주입.
