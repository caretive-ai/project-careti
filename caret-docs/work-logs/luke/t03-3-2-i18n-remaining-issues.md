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


## 4. i18n 누락 범위 분석 결과 (f02-multilingual-i18n.mdx 기반)
`f02-multilingual-i18n.mdx` 와 현재 작업 로그(`t03-3`)를 교차 검증하여 다음과 같이 누락된 i18n 범위를 분석했습니다. 이 내용은 `Step4` 작업을 위한 구체적인 지침이 됩니다.

#### 1. 네임스페이스 불일치 문제
- **기준**: `f02-multilingual-i18n.mdx`는 총 **11개**의 표준 네임스페이스를 정의하고 있습니다.
  - `common`, `chat`, `welcome`, `settings`, `history`, `persona`, `models`, `announcement`, `browser`, `menu`, `validate-api-conf`
- **현황**: 현재 작업 브랜치에는 일부 네임스페이스(예: `history`)가 누락되었거나, 병렬 브랜치(`webview-ui-luke-parallel`)에만 존재합니다 (`browser`, `menu`).
- **필요 작업**:
  - [ ] 4개 언어(ko, en, ja, zh) 모두에 대해 11개 표준 네임스페이스 JSON 파일이 모두 존재하는지 확인하고, 누락된 파일은 생성해야 합니다.
  - [ ] `npm run report:i18n-namespace` 스크립트(f02 문서에 언급됨)를 실행하여 자동 검사를 수행하고 보고서를 기반으로 조치합니다.

#### 2. 컴포넌트 적용 범위
- **현황**: `report-i18n-missing-file.js` 스크립트 분석 결과, **총 146개 컴포넌트 파일**에 대한 i18n 적용이 필요합니다. (부분 적용 93개, 미적용 53개)
- **필요 작업**:
  - [ ] `Step4`에 명시된 주요 사용자 페이지(Settings, MCP, Account 등)를 최우선으로 작업합니다.
  - [ ] `i18n-missing-files-report.md`의 전체 목록을 기반으로 모든 컴포넌트에 i18n을 적용합니다.

#### 3. 번역 키 동기화
- **기준**: 기준 언어인 `en` 네임스페이스에 존재하는 모든 키는 다른 언어(ko, ja, zh)에도 동일하게 존재해야 합니다.
- **현황**: 병렬 작업 및 개별 작업으로 인해 언어 간 키 동기화가 깨졌을 가능성이 높습니다.
- **필요 작업**:
  - [ ] `npm run report:i18n-keys` 스크립트를 실행하여 언어별 누락 키를 식별합니다.
  - [ ] `npm run sync:i18n-keys` 스크립트를 사용하여 누락된 키를 자동으로 추가하고, 번역 작업을 진행합니다.

#### 4. 미사용 키 정리
- **현황**: 리팩토링 및 병합 과정에서 다수의 미사용 키가 발생했습니다 (`report-i18n-unused-key.js` 실행 결과 596개 미사용 키 발견).
- **필요 작업**:
  - [ ] 모든 i18n 적용이 완료된 후, `report-i18n-unused-key.js`를 최종 실행하여 코드베이스에서 더 이상 사용하지 않는 번역 키를 locale JSON 파일에서 제거합니다. 이는 번역 비용을 절감하고 유지보수성을 높입니다.

---