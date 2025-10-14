# 페르소나 버그 fix 및 개선

## 최종 분석 및 작업 내역

### 1. [버그 수정] 페르소나 재시작 시 초기화 문제
- **최종 원인 분석**: 진짜 원인은 백엔드의 `UpdatePersona` gRPC 핸들러(`src/core/controller/persona/UpdatePersona.ts`)에 있었습니다. 이 핸들러는 프론트엔드에서 `data:image/...` 형태의 Base64 URI로 이미지를 받을 때만 `globalStorage`에 파일을 저장하도록 되어 있었습니다. 하지만 템플릿에서 페르소나를 선택할 경우, 프론트엔드는 `asset:/...` 형태의 경로를 전송했고, 백엔드는 이 경로를 처리하지 못해 이미지 파일 저장을 누락했습니다. 이로 인해 `persona.md`만 업데이트되고 이미지는 없는 상태가 되어, 웹뷰 리로드 시 `CaretProviderWrapper.ts`가 `globalStorage`에 이미지가 없다고 판단하고 기본 캐럿 이미지로 되돌리는 현상이 발생했습니다.
- **수정 내역**: `src/core/controller/persona/UpdatePersona.ts` 파일을 수정하여, `asset:/` 형태의 이미지 경로도 처리할 수 있도록 로직을 추가했습니다. 이제 `asset:/` 경로를 실제 파일 시스템 경로로 변환하여 이미지를 읽고, `globalStorage`에 정상적으로 저장하도록 문제를 해결했습니다.

### 2. [기능 개선] 초기 설정(Welcome) 흐름 변경
- **개선 목표**: 사용자가 앱을 처음 설정할 때 페르소나 기능을 인지하고 직접 선택하는 경험을 제공하기 위해 초기 설정 흐름을 변경했습니다.
- **수정 내역**:
    - `CaretStateContext.tsx`: 페르소나 선택 창을 제어하는 `showPersonaSelector` 상태를 추가했습니다.
    - `WelcomeView.tsx`: API 키 설정이 완료되면 `showPersonaSelector` 상태를 `true`로 변경하여 페르소나 선택 창을 호출하도록 수정했습니다.
    - `PersonaTemplateSelector.tsx`: 모달 뿐만 아니라 전체 화면 뷰로도 동작할 수 있도록 컴포넌트를 수정하고, 페르소나 선택이 완료되면 `showPersonaSelector` 상태를 `false`로 변경하여 홈 화면(ChatView)으로 이동하도록 로직을 구현했습니다.
    - `App.tsx`: `showPersonaSelector` 상태에 따라 `PersonaTemplateSelector`를 전체 화면으로 렌더링하도록 수정했습니다.

### 3. [기능 개선] 페르소나 선택 창 안내 문구 수정 (UX 개선)
- **개선 목표**: 사용자에게 페르소나 커스터마이징 방법과 나중에 변경할 수 있다는 사실을 명확하고 간결하게 안내하기 위해 문구를 수정했습니다.
- **수정 내역**:
    - `webview-ui/src/caret/locale/ko/persona.json`: 페르소나 선택 창의 설명 문구를 "원하는 캐릭터를 선택하세요. 선택한 페르소나는 '규칙' 메뉴에서 편집하고 '일반 설정' 에서 켜고 끌 수 있습니다."로 수정했습니다.
    - `webview-ui/src/caret/locale/en/persona.json`: 한국어 번역과 일관성을 맞추기 위해 영어 번역("Select the character you want. You can edit the selected persona in the 'Rules' menu and toggle it on/off in 'General Settings'.")도 수정했습니다.

### 4. [빌드 에러 수정]
- **원인 분석**: `scripts/generate-protobus-setup.mjs` 빌드 스크립트가 `CaretSystemService`의 핸들러 경로를 `caretSystem`이라는 존재하지 않는 디렉토리로 잘못 생성하고 있었습니다.
- **수정 내역**: 해당 스크립트의 `getDirName` 함수를 수정하여, `CaretSystemService`의 경우 `persona` 디렉토리를 참조하도록 경로를 수정하여 빌드 에러를 해결했습니다.

---

# 단계
 * 긴급
# 현상
 1) [크리티컬 버그] 페르소나 변경 후 앱을 재실행시 페르소나 이미지가 Caret으로 변경됨
  - 이전에 초기화 로직 구현 되었던것이 항상 실행되는것이 아닌가 추정됨

 2) [새시작 화면 기능 변경] 초기화 후 시작화면    
  As-is : WelComeView -> API설정 -> Home으로 이동함
  To-be : WelcomeView -> API설정 -> 페르소나 설정 템플릿 캐릭터 창 팝업으로 이동, 선택하게함 -> Home
   => 페르소나의 특징을 강조 하기 위함 
  
 3) 페르소나 템플릿 설정창 상단 설명 내용 수정
   설명변경 : 원하는 캐릭터를 선택하세요. 선택한 캐릭터는 자유롭게 편집하여 나만의 퍼스나로 쓸 수 있습니다.
    ->  원하는 캐릭터를 선택하세요. 선택한 캐릭터는 규칙의 persona.md 파일을 편집하거나 이미지를 변경하여 나만의 페르소나로 쓸 수 있습니다. 설정에서 페르소나 이미지는 설정에서 토글 하여 사용여부를 끌 수 도 있습니다.
