# 022: Caret 계정 구독 플랜 표시 및 'Pay as you go' 옵션 추가

## 1. 목표

Caret 계정 로그인 후, 기존의 'Personal' 플랜 대신 'Free', 'Basic' 구독 플랜을 표시하고, 'Pay as you go' 옵션을 추가합니다. 이 기능은 i18n을 완벽하게 지원해야 합니다.

## 2. 배경

현재 Caret은 Cline의 계정 시스템을 그대로 사용하고 있어 'Personal' 플랜만 표시됩니다. Caret의 요금 체계에 맞게 'Free', 'Basic' 구독 플랜과 'Pay as you go' 옵션을 추가하여 사용자에게 정확한 정보를 제공해야 합니다.

## 3. 요구사항

- **구독 플랜 표시 변경**:
    - 기존 'Personal' 플랜 드롭다운을 'Free', 'Basic'으로 변경합니다.
- **'Pay as you go' 옵션 추가**:
    - 'Pay as you go' 체크박스와 설명을 추가합니다.
    - 설명: "* 구독 사용량을 모두 소진 후 추가 과금 됩니다."
- **i18n 적용**:
    - 새로 추가되는 모든 UI 텍스트(구독 플랜 이름, 옵션 설명 등)는 다국어를 지원해야 합니다.
- **기능 구현**:
    - UI 변경 사항을 백엔드와 연동하여 실제 사용자 계정 정보에 반영되도록 합니다.

## 4. 분석 결과 (2025-07-11)

- **아키텍처**: Caret은 Cline의 원본 컴포넌트를 직접 수정하는 대신, 래핑(wrapping)하고 확장하는 방식을 사용합니다.
    - `webview-ui/src/components/account/AccountView.tsx`는 Caret 전용 컴포넌트인 `webview-ui/src/caret/components/CaretAccountView.tsx`를 렌더링합니다.
    - 따라서 실제 UI 수정은 `CaretAccountView.tsx`에서 이루어져야 합니다.
- **데이터 흐름**: 계정 정보(구독 플랜 포함)는 백엔드에서 프론트엔드로 단방향으로 전달됩니다.
    - **`src/core/controller/index.ts`**의 `Controller` 클래스가 핵심입니다. `postStateToWebview()` 메서드를 통해 `ExtensionState`를 웹뷰로 전달합니다.
    - `ExtensionState`에 포함된 `userInfo` 객체가 계정 정보를 담고 있으며, 이 객체를 확장하여 구독 플랜 정보를 전달해야 합니다.
    - `userInfo`는 `handleWebviewMessage`의 `authStateChanged` 핸들러를 통해 `globalState`에 저장됩니다.
- **수정 대상 파일 식별**:
    - **UI (프론트엔드)**: `webview-ui/src/caret/components/CaretAccountView.tsx`
    - **UI 테스트**: `webview-ui/src/caret/components/__tests__/CaretAccountView.test.tsx`
    - **상태 관리 (백엔드)**: `src/core/controller/index.ts`
    - **데이터 서비스 (백엔드)**: `src/services/account/ClineAccountService.ts` (Caret API와 통신하여 구독 플랜 정보를 가져오는 로직 추가 필요)
    - **다국어**: `webview-ui/src/caret/locale/` 하위의 `common.json` 파일들

## 5. 개발 계획 (상세)

### Phase 1: UI 구현 (TDD)

- **테스트 코드 작성 (RED)**:
    - `webview-ui/src/caret/components/__tests__/CaretAccountView.test.tsx` 파일을 수정합니다.
    - **(Test 1)** `userInfo`에 `subscription: 'Free'`가 포함된 mock 데이터를 제공했을 때, 'Free' 구독 플랜 드롭다운이 렌더링되는지 확인하는 테스트를 추가합니다.
    - **(Test 2)** `userInfo`에 `isPayAsYouGo: true`가 포함된 mock 데이터를 제공했을 때, 'Pay as you go' 체크박스와 설명이 렌더링되는지 확인하는 테스트를 추가합니다.
    - **(Test 3)** 새로 추가된 UI 요소들이 `t()` 함수를 통해 i18n 키를 올바르게 사용하는지 확인하는 테스트를 추가합니다.
- **UI 컴포넌트 수정 (GREEN)**:
    - `webview-ui/src/caret/components/CaretAccountView.tsx` 파일을 수정합니다.
    - `useExtensionState`에서 가져온 `userInfo` 객체에 `subscription`과 `isPayAsYouGo` 속성이 있다고 가정하고 UI를 구현합니다.
    - 기존 사용자 정보(`displayName`, `email`) 아래에 구독 플랜 드롭다운과 'Pay as you go' 체크박스를 추가합니다.
    - 모든 텍스트는 `t()` 함수를 사용하여 i18n을 적용합니다.

### Phase 2: 백엔드 연동

- **`ClineAccountService.ts` 수정**:
    - Caret의 백엔드 API와 통신하여 사용자의 구독 플랜 정보(`subscription`, `isPayAsYouGo`)를 가져오는 로직을 추가합니다. (API가 준비되지 않았다면, 임시 mock 데이터를 반환하는 함수를 먼저 구현합니다.)
- **`Controller/index.ts` 수정**:
    - `setUserInfo` 또는 별도의 메서드에서 `ClineAccountService`를 통해 가져온 구독 플랜 정보를 기존 `userInfo` 객체에 병합합니다.
    - 확장된 `userInfo` 객체를 `updateGlobalState`를 통해 저장하여 웹뷰의 `ExtensionStateContext`로 전달되도록 합니다.

### Phase 3: i18n 적용 및 최종 테스트

- **언어 파일 수정**:
    - `locales/ko/translation.json`, `locales/en/translation.json` 등 필요한 모든 언어 파일에 다음 키를 추가합니다.
        - `account.subscription`: "구독 플랜"
        - `account.subscriptionFree`: "Free"
        - `account.subscriptionBasic`: "Basic"
        - `account.payAsYouGo`: "사용량만큼 지불"
        - `account.payAsYouGoDescription`: "* 구독 사용량을 모두 소진 후 추가 과금 됩니다."
- **전체 기능 테스트**:
    - 실제 로그인 후, API에서 받아온 구독 플랜 정보가 UI에 정확히 표시되는지 확인합니다.
    - 언어 설정을 변경했을 때, UI 텍스트가 해당 언어로 올바르게 표시되는지 확인합니다.

## 6. 다음 세션을 위한 가이드 (2025-07-11 업데이트)

**현재 상태**:
*   `plan`이라는 용어가 `mode`와 혼동될 우려가 있어, 모두 `subscription`으로 변경하는 작업을 진행했습니다.
*   관련 파일(`ExtensionMessage.ts`, `CaretAccountView.tsx`, `CaretAccountView.test.tsx`, i18n `common.json` 파일들)의 용어 변경을 완료했습니다.
*   i18n 파일의 실제 경로가 `webview-ui/src/caret/locale/` 하위인 것을 확인하고, 문서의 `수정 대상 파일 식별` 섹션을 수정했습니다.
*   **중요**: 이 작업은 `021-chat-block-bug` 해결을 위해 잠시 중단되었습니다.

**다음 작업자 가이드**:
다음 작업자는 아래 순서대로 작업을 재개해 주세요.

1.  **TDD (RED) 재검증**: `npm run test:webview`를 실행하여, `subscription`으로 변경된 테스트 케이스들이 여전히 의도대로 실패하는지 다시 한번 확인합니다. (UI 컴포넌트가 아직 완전히 구현되지 않았으므로 실패해야 정상입니다.)
2.  **Frontend (GREEN)**: `webview-ui/src/caret/components/CaretAccountView.tsx`를 수정하여 `Phase 1`에 명시된 UI를 완성합니다. mock 데이터를 사용하여 테스트를 통과시킵니다.
3.  **Backend**: `Phase 2` 계획에 따라 `ClineAccountService.ts`와 `Controller/index.ts`를 수정하여 실제 데이터가 프론트엔드로 전달되도록 구현합니다.
4.  **i18n**: `Phase 3` 계획에 따라 `webview-ui/src/caret/locale/` 하위의 모든 언어 파일(`ja`, `zh` 등)에 `subscription` 관련 키가 추가되었는지 확인하고, 누락되었다면 추가합니다.
5.  **Final Test**: 모든 기능이 통합된 상태에서 최종 테스트를 진행합니다.

## 7. 체크리스트

- [x] 2025-07-11 작업 로그 생성
- [x] 022번 작업 문서 생성 및 상세 계획 작성
- [x] 관련 소스 코드 및 개발 가이드 분석 완료
- [x] `plan` -> `subscription` 용어 변경 및 관련 파일 수정 완료
- [x] i18n 파일 경로 확인 및 문서 수정 완료
- [ ] UI 테스트 코드 재검증 (실패 확인)
- [ ] UI 컴포넌트 수정
- [ ] `ClineAccountService.ts` 수정
- [ ] `Controller/index.ts` 수정
- [x] i18n 모든 언어 파일 수정
- [ ] 최종 기능 테스트 완료
