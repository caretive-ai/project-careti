# 화이트 라벨링에 대한 피드백
 * 피드백 URL : https://docs.slexn.com/s/ea9b344e-d1a6-459d-92e6-0721561e3501

## 1. 화면 크기에 따른 툴팁 레이아웃 오류
 * 범위 : 캐럿
 * 현상 : 가로 화면 크기가 작은 경우 우측 하단의 '에이전트' 버튼위에 마우스가 올린 경우 툴팁이 왼쪽 구석으로 잘려 노출되고 있음
 * 기대값 : 정상적으로 화면안에 툴팁이 노출되어야함
 * **원인**: `Tooltip.tsx`에서 `left: -180%` 고정값 사용으로 화면 경계 초과
 * **수정 내용**:
   - `webview-ui/src/components/common/Tooltip.tsx`:
     - `useRef`와 `getBoundingClientRect()` 사용하여 툴팁 오버플로우 감지
     - `$autoPosition` prop 추가로 동적 위치 조정 (left/right 자동 전환)
   - `webview-ui/src/components/chat/ChatTextArea.tsx` (line 1772-1776):
     - **수정 전**: `t("tooltip.agent", "common")` (잘못된 경로)
     - **수정 후**: `t("mode.tooltip.agent", "common")` (올바른 JSON 구조)
     - i18n JSON 구조: `common.json`의 `mode.tooltip.agent` 경로로 정의됨
     - 4개 언어(en/ko/ja/zh) 모두 정상 번역 확인 완료

## 2. 작업공간 규칙과 워크플로우 화이트 라벨링
 * 범위 : 코드센터 화이트 라벨링
 * 현상 : 작업공간 규칙/워크플로우를 만들면 .caretrules 아래 생성됩니다.
          또한 현재 규칙은 .caretrules에 만들어지는데 인식은 안 되고 있습니다.
 * 기대값 : 정상적으로 생성되고 인식도 해당 위치에서 되야함

## 3. MCP 파일명 caret노출
 * 범위 : 코드센터 화이트 라벨링
 * 현상 : caret_mcp_settings.json 파일로 노출, 
 * 기대값 : codecenter_mcp_settings.json 파일로 노출되어야함

## 4. LiteLLM/BizRouter 모델 드롭다운 UI 오버플로우
  * 범위 : 캐럿
  * 현상 1 : 모델이 많으면 (58개) 드롭다운이 UI를 밀어올려 "API제공자" 레이블이 위로 밀리고 스크롤 영역이 잘림
  * 현상 2 : 옵션 리스트가 화면 전체 가로를 차지하여 다른 요소들을 덮음
  * 현상 3 : 높이 제한이 없어 listbox가 화면을 넘어가면 잘림
  * 기대값 : 모델 가져오기 후 드롭다운을 클릭하면 58개 모델 리스트가 정상 표시되고, UI 레이아웃이 깨지지 않아야 함
  * **원인**:
    1. VSCodeDropdown의 옵션 리스트(listbox)가 document flow에 포함되어 다른 요소들을 밀어냄
       - 58개 모델 렌더링 시 listbox가 수직으로 확장되면서 상단 UI를 위로 밀어올림
    2. VSCodeDropdown의 listbox가 부모 컨테이너 크기를 무시하고 화면 전체 가로로 확장됨
    3. 높이 제한이 없어 listbox가 화면을 넘어가면 잘림
  * **수정 내용**:
    - `webview-ui/src/components/settings/providers/BizRouterProvider.tsx` (lines 93, 98, 117-126):
      - 모델 선택 영역 div에 `position: "relative"` 추가 (positioning context 생성)
      - VSCodeDropdown을 `.dropdown-container` div로 감싸기
      - CSS `::part(listbox)` 선택자로 listbox 스타일 직접 제어:
        - `position: absolute` - document flow에서 분리하여 다른 요소 밀어내지 않음
        - `z-index: 9999` - 다른 요소 위에 overlay
        - `left: 0, right: 0` - 부모 컨테이너 가로 크기에 맞춤
        - `max-height: 130px` - 최대 높이 제한으로 잘림 방지
        - `overflow-y: auto` - 스크롤 가능
    - `webview-ui/src/components/settings/providers/LiteLlmProvider.tsx` (lines 101, 106, 125-134):
      - BizRouter와 동일한 수정 적용
    - **핵심 해결책**: VSCodeDropdown의 Shadow DOM 내부 listbox를 `::part()` 선택자로 접근하여 absolute positioning으로 overlay 구현

## 5. API요청에 격조사가 부자연스러운 번역 변경
  * 범위 : 캐럿
  * 현상 : Caret이 -> CodeCenter가
  * 기대값 : "CodeCenter이 파일을 편집하려고 합니다." ->   "CodeCenter가 파일을 편집하려고 합니다."
    i18n의 브랜딩 한글 조사 처리 적용
  * **발견**: `webview-ui/src/caret/utils/i18n.ts` (lines 254-334)에 이미 한글 조사 처리 시스템 구현되어 있음
    - `{{brandName|이}}`, `{{brandName|을}}`, `{{brandName|은}}` 등 자동 조사 변환 지원
    - `hasLastConsonant()` 함수로 받침 감지 (Unicode 44032-55203 범위)
  * **수정 내용**:
    - `webview-ui/src/caret/locale/ko/chat.json` (전체):
      - "Caret이" → "{{brandName|이}}" (자동으로 "이"/"가" 선택)
      - "Caret을" → "{{brandName|을}}" (자동으로 "을"/"를" 선택)
      - "Caret은" → "{{brandName|은}}" (자동으로 "은"/"는" 선택)
      - sed 명령어로 일괄 변경: `sed -i 's/Caret이/{{brandName|이}}/g; s/Caret을/{{brandName|을}}/g; s/Caret은/{{brandName|은}}/g'`
    - `webview-ui/src/caret/locale/en/chat.json` (전체):
      - 26곳의 "Caret" 하드코딩을 `{{brandName}}`으로 변경
      - sed 패턴: "Caret is", "Caret wants", "Caret may", "to Caret", "Improve Caret" 등
    - `webview-ui/src/caret/locale/ja/chat.json` (전체):
      - "Caretにサインイン", "Caretバージョン", "Caretの改善", "Caret MCP", "Caret専用" 등을 `{{brandName}}`으로 변경
    - `webview-ui/src/caret/locale/zh/chat.json` (전체):
      - "Caret遇到", "Caret将尝试", "Caret查看", "Caret版本", "Caret MCP", "Caret专属" 등을 `{{brandName}}`으로 변경
  * **검증**: `npm run compile` 성공 (타입 체크, 린트, 빌드 모두 통과)

## 6. 음성 입력 활성화 기능 삭제
  * 범위 : 캐럿
  * Cline의 음성입력 기능이 삭제되어 캐럿도 삭제 햇던 걸로 아는데 또 나왔다고 함, 다시 한번확인필요
  * **원인**:
    1. 백엔드: `updateSettings.ts`에서 `featureEnabled` 기본값이 `true`로 잘못 설정됨
    2. 프론트엔드: VoiceRecorder 컴포넌트와 관련 UI가 여전히 남아있음
  * **수정 내용**:
    - **백엔드** `src/core/controller/state/updateSettings.ts` (line 162):
      - `featureEnabled: request.dictationSettings.featureEnabled ?? false`로 변경
    - **프론트엔드** `webview-ui/src/components/chat/ChatTextArea.tsx`:
      - VoiceRecorder import 제거 (line 57)
      - PulsingBorder import 제거 (line 2)
      - useClineAuth import 제거 (line 29)
      - isVoiceRecording 상태 제거 (line 308)
      - clineUser 사용 제거 (line 304)
      - dictationSettings 사용 제거 (line 301)
      - 음성 녹음 애니메이션 제거 (lines 1510-1538)
      - isVoiceRecording 조건부 스타일 제거 (lines 1554, 1570-1573)
      - padding 고정값으로 변경 (line 1637: `28px`)
      - VoiceRecorder 컴포넌트 제거 (lines 1678-1714)
      - Send 버튼 조건 제거 (항상 표시)

## 7. CodeCenter 개발 지원하기
  * 범위 : 코드센터 화이트라벨링
  * 현상 : 설정내의 CodeCenter 개발 지원하기 노출, 오픈소스로 노출하지 않으므로 삭제 필요
  * 기대값 : 삭제

## 8. 챗봇 모드에서 경고 메시지 화이트라벨링
  * 범위 : 캐럿, 코드센터 화이트라벨링
  * 문구 : Cline uses complex prompts and iterative -> Caret uses complex prompts and iterative -> CodeCenter uses complex prompts and iterative
  * **원인**: locale 파일에 "Caret" 하드코딩되어 동적 브랜딩 미적용
  * **수정 내용**:
    - `webview-ui/src/caret/locale/en/common.json` (line 533):
      - `"Caret uses complex prompts"` → `"{{brandName}} uses complex prompts"`
    - `webview-ui/src/caret/locale/en/settings.json` (6곳):
      - `noteText`, `noteBody`, `apiKeyHelpText`에서 모두 `{{brandName}}` 플레이스홀더 사용
      - lines 563, 645, 901, 947, 971, 986
  * **백엔드 주석 추가**: `src/core/task/index.ts` (line 1682):
    - CARET MODIFICATION 주석 추가: "Use dynamic brand name instead of hardcoded Cline"
    - `getCurrentBrandName()` 함수로 동적 브랜딩 적용됨

