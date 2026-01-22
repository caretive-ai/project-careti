# Profile Photo Flow (Careti Auth → Webview AccountView)

## 요약
- 문제: 로그인/리프레시 후 `AccountView`에서 구글 프로필 이미지(`photoUrl`)가 표시되지 않음.
- 원인: `ClineAuthContext`가 auth 스트림의 `uid` 변경시에만 `clineUser`를 갱신 → `photoUrl`이 추가돼도 상태가 업데이트되지 않아 웹뷰에서 빈 값 유지.
- 해결: auth 스트림 payload 전체를 비교해 변경이 있으면 `clineUser`를 갱신하도록 수정.

## 데이터 흐름
1) **Backend** (`careti-new-router`)
   - `/v1/auth/token`, `/v1/auth/refresh` 응답의 `userInfo`에 `photoUrl` 추가 (`careti-new-router/src/any_llm/gateway/routes/auth.py`).

2) **Extension (Node)**
   - `CaretAuthProvider.signIn` / `refreshToken`에서 받은 `photoUrl`을 `authInfo.userInfo.photoUrl`로 저장 (`careti-editor/careti-src/services/auth/providers/CaretAuthProvider.ts`).
   - `AuthService.getInfo`가 `_clineAuthInfo.userInfo.photoUrl`을 `UserInfo` proto에 포함해 웹뷰로 전송 (`careti-editor/src/services/auth/AuthService.ts`).

3) **Webview (React)**
   - `ClineAuthContext`가 `AccountServiceClient.subscribeToAuthStatusUpdate` 스트림을 구독해 `clineUser` 상태를 관리.
   - **수정점**: `uid` 변경 시에만 업데이트하던 로직을, payload 전체 비교(`deepEqual`) 후 변경 시 항상 `setUser` 하도록 변경해 `photoUrl` 업데이트를 반영 (`careti-editor/webview-ui/src/context/ClineAuthContext.tsx`).
   - `AccountView`는 `clineUser.photoUrl`로 아바타를 렌더링.

## 영향
- 새 로그인/리프레시로 `photoUrl`이 포함된 auth payload가 오면 웹뷰 상태가 즉시 업데이트되어 아바타가 노출됨.
- 이전 세션(시크릿)에 `photoUrl`이 없던 경우, 재로그인 또는 리프레시 후 스트림 반영으로 해결.

## 변경 파일
- Backend: `careti-new-router/src/any_llm/gateway/routes/auth.py` (userInfo에 photoUrl 추가)
- Extension: `careti-editor/careti-src/services/auth/providers/CaretAuthProvider.ts` (signIn/refresh에서 photoUrl 저장), `careti-editor/src/services/auth/AuthService.ts` (UserInfo photoUrl 전파)
- Webview: `careti-editor/webview-ui/src/context/ClineAuthContext.tsx` (auth 스트림 변경 반영)
