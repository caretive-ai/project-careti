# T03-3-2: i18n 잔여 이슈 및 수정 사항

마스터의 피드백에 따라, 현재까지 해결되지 않은 i18n 관련 문제점들을 다음 작업 세션을 위해 정리합니다.

## 1. 번역 누락 및 수정 필요 항목

-   **[ ] 자동 승인 UI 번역 (하단 바)**
    -   **위치**: 채팅 입력창 위 자동 승인 바
    -   **누락 항목**: `Enabled`, `Read`, `Edit`, `Safe commands` 등 퀵 액세스 버튼 텍스트
    -   **파일**: `webview-ui/src/components/chat/auto-approve-menu/AutoApproveBar.tsx` 및 `constants.ts` 관련 로직 확인 필요.

-   **[ ] Plan/Act 버튼 번역 수정**
    -   **위치**: 채팅 입력창 우측 하단, API 설정 탭
    -   **수정 내용**: "계획" / "실행" 으로 번역 일괄 수정. (`planMode`/`actMode` 및 `mode.plan.label`/`mode.act.label` 키)

-   **[ ] 채팅 입력창 Placeholder 번역**
    -   **위치**: 메인 채팅 입력창
    -   **누락 항목**: `typeTaskHere`, `placeholderHint` 키에 대한 번역 필요.
    -   **파일**: `ko/chat.json` 및 `en/chat.json`에 해당 키 추가 및 번역.

-   **[ ] 설정 페이지 제목 및 메뉴 번역**
    -   **위치**: 설정 페이지(`SettingsView.tsx`) 상단 제목 및 좌측 탭 메뉴
    -   **문제**: `API Configuration`, `General`, `Features`, `Browser`, `Terminal`, `Debug` 등 제목과 메뉴가 영어로 하드코딩 되어 있거나 번역 키가 잘못 적용됨.
    -   **조치**: `SettingsView.tsx`에서 해당 부분 찾아 `t()` 함수 적용 및 `settings.json` 번역 확인.

-   **[ ] 계정(Account) 페이지 버튼 번역**
    -   **위치**: 계정 페이지(`AccountView.tsx`) 우측 상단
    -   **문제**: `button.done` 키가 `common` 네임스페이스에 없어 번역 누락.
    -   **조치**: `common.json`에 `button.done` 키 추가 및 번역.

## 2. 기능 및 구조 문제

-   **[ ] 설정 페이지 'About' 탭 복구**
    -   **문제**: 현재 설정 페이지에 `About` 탭이 없음.
    -   **요구사항**: `caret-main`과 동일하게 `About` 탭을 복구해야 함.
    -   **구현**: `SettingsView.tsx`의 `SETTINGS_TABS` 배열에 `About` 탭 정보를 다시 추가.
    -   `About` 탭의 내용은 `WelcomeView`에 사용된 `CaretFooter` 컴포넌트를 렌더링하도록 구현.

## 3. 아이콘 변경

-   **[ ] Welcome 페이지 아이콘 표시 방식 수정**
    -   **문제**: 현재 `WelcomeView.tsx`의 아이콘이 로컬 파일 경로로 하드코딩되어 있어 CORS 오류 발생 가능성이 있음.
    -   **요구사항**: `assets/agent_profile.png` 이미지를 Base64 인코딩된 데이터 URI로 변환하여 안전하게 로드해야 함.
    -   **참고**: 마스터께서 제공해주신 예제 코드(`convertAssetToBase64`)와 같이, 백엔드(Extension)에서 이미지를 읽어 Base64 문자열로 변환한 뒤, 이를 `window` 객체를 통해 웹뷰에 전달하는 방식 적용 필요.
