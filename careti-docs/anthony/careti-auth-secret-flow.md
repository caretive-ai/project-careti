# Careti Auth Secret Flow & Fix

## 배경
- `CaretAuthProvider.signIn`은 `controller.stateManager.setSecret(CaretAuthProvider.secretKeyId, JSON.stringify(caretAuthInfo))`로 토큰을 저장함. `secretKeyId`는 `"careti:caretAccountId"`.
- 웹뷰는 시크릿에 직접 접근 불가. 확장 백엔드가 시크릿을 읽어 Auth 상태를 gRPC 스트림으로 웹뷰에 전달하고, 웹뷰 `ClineAuthContext`가 이를 구독해 `clineUser` 상태를 만듦.
- 문제: 재시작/웹뷰 재오픈 시 `clineUser`가 비어 AccountView에 사용자 정보가 안 뜸.

## 정상 동작 경로
1) 확장 활성화 → `StateManager.initialize`가 `readSecretsFromDisk` 호출해 VS Code Secret Storage 값을 캐시에 적재.
2) `Controller` 생성자 → `AuthService.restoreRefreshTokenAndRetrieveAuthInfo()` 실행.
3) `CaretAuthProvider.retrieveClineAuthInfo`가 캐시된 `careti:caretAccountId`를 읽어 토큰 복원.
4) `AuthService.sendAuthStatusUpdate`가 gRPC 스트림 `subscribeToAuthStatusUpdate`로 `AuthState` push.
5) 웹뷰 `ClineAuthContext`가 스트림 구독 후 `clineUser` 설정 → `AccountView`에 전달.

## 원인
- `readSecretsFromDisk`가 `context.secrets.get(CaretAuthProvider.secretKeyId)`를 읽지 않고, `careti:caretAccountId` 필드에 `clineAccountId`(다른 키) 값을 재사용함.
- 결과적으로 캐시에 Careti 시크릿이 비어 복원이 실패 → `AuthState.user`가 null → `AccountView`에서 `clineUser`가 없음.

## 수정 내용
- `readSecretsFromDisk`에서 `context.secrets.get(CaretAuthProvider.secretKeyId)`를 읽어 별도 변수(`caretAccountId`)에 담고, 반환 객체의 `[CaretAuthProvider.secretKeyId]`에 그대로 매핑.
- 불필요한 `caretApiKey`, `caretAuthToken` 읽기/매핑 제거.

## 현재 상태
- 저장 키는 여전히 `"careti:caretAccountId"`; 변수명만 로컬에서 읽은 값을 담는 용도.
- 이제 확장 재시작 시 Careti 토큰이 캐시에 로드되어 `AuthService`가 복원, 웹뷰 `AccountView`에서 사용자 정보를 받을 수 있음.

## 추가 수정 (2024-XX-XX)
- 문제: 리프레시 시 `CaretAuthProvider.refreshToken`은 새 토큰을 반환하지만 `stateManager`에 다시 저장하지 않아, 만료된 refreshToken으로 반복 호출 → 401/루프 가능.
- 해결: `retrieveClineAuthInfo`에서 `shouldRefreshIdToken`이 `true`인 경우 `refreshToken` 호출 후 반환된 `authInfo`를 `controller.stateManager.setSecret(CaretAuthProvider.secretKeyId, JSON.stringify(authInfo))`로 갱신 저장하도록 변경.
- 영향: 리프레시 후 항상 최신 access/refresh 토큰과 만료 시각이 시크릿에 저장되어 다음 복원/검증 시 최신 상태를 사용.

## 관련 파일/라인
- 저장: `careti-editor/careti-src/services/auth/providers/CaretAuthProvider.ts` (`signIn`, `secretKeyId`)
- 리프레시 후 저장: `careti-editor/careti-src/services/auth/providers/CaretAuthProvider.ts` (`retrieveClineAuthInfo` → `refreshToken`)
- 시크릿 로드/수정: `careti-editor/src/core/storage/utils/state-helpers.ts` (`readSecretsFromDisk`)
- 캐시/퍼시스트: `careti-editor/src/core/storage/StateManager.ts` (`setSecret`, `persistSecretsBatch`)
- Auth 복원/브로드캐스트: `careti-editor/src/services/auth/AuthService.ts`
- 웹뷰 구독: `careti-editor/webview-ui/src/context/ClineAuthContext.tsx`
