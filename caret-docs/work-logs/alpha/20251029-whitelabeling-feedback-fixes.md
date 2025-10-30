# 2025-10-29: 코드센터 화이트 라벨링 피드백 개선 작업 (상세 보강)

## 작업 목표
1차 코드센터 화이트 라벨링 변환 후 전달된 피드백 문서를 기반으로, 미흡한 부분을 수정하고 브랜드별 기능 분리를 강화한다. 이 문서는 다른 AI 에이전트가 이미지를 보지 않고도 작업을 이어받을 수 있도록 상세한 설명을 포함한다.

## 주요 진행 상황

### 1. 작업 계획 수립
- 마스터로부터 전달받은 피드백 목록을 기반으로, `slexn-codecenter/work-plans/20251028-whitelabeling-feedback-analysis.md`에 각 항목의 원인을 분석하고 해결 계획을 수립했다.

### 2. 피드백 항목별 상세 설명 및 해결 내역

#### ✅ [완료] 2. `Caret` 계정 관련 기능 노출 문제
- **상세 설명**: 로그인/가입 UI에서 "Login & Sign Up" 버튼이 노출되는 문제. 코드센터 버전에서는 이 기능이 필요 없으므로 완전히 제거해야 한다.
- **요청**: 가입 버튼을 포함한 계정 관련 기능 전체 제거.
- **해결**: `enableCaretAccountFeatures`라는 새로운 기능 플래그를 `FeatureConfig` 시스템에 추가했다.
  - `FeatureConfig.ts` (백엔드/프론트엔드), `FeatureConfig.test.ts` 수정.
  - `feature-config.json` (Caret/CodeCenter)에 각기 다른 플래그 값(`true`/`false`) 설정.
  - `CaretStateContext.tsx`를 수정하여 UI 컴포넌트에 플래그를 전달하도록 변경.
  - `AccountWelcomeView.tsx`에서 이 플래그를 사용하여 계정 UI 전체를 조건부로 숨기도록 수정.

#### ✅ [완료] 3. 작업 공간 규칙 `caret` 노출 문제
- **상세 설명**: 설정 화면의 '규칙 관리' 섹션에서, 작업 공간 규칙 파일명이 `.caretrules`로 표시되는 문제. 이는 `CodeCenter` 브랜드에 맞게 `.codecenterrules`로 변경되어야 한다.
- **요청**: `.caretrules` 문자열을 브랜드에 맞게 변경.
- **해결**: `webview-ui/src/caret/locale` 내의 모든 언어(`ko`, `en`, `ja`, `zh`)의 `settings.json` 및 `common.json` 파일에서 하드코딩된 `.caretrules`를 `.codecenterrules`로, `Caret 규칙`을 `CodeCenter 규칙`으로 수정했다.

#### ✅ [완료] 4. MCP 서버 구성 파일명 `caret_mcp_settings.json` 문제
- **상세 설명**: 'MCP 서버 구성' UI에서, 로컬 서버 추가 시 참조하는 설정 파일명이 `caret_mcp_settings.json`으로 안내되는 문제. 이 또한 브랜드에 맞게 `codecenter_mcp_settings.json`으로 변경되어야 한다.
- **요청**: 파일명에 `caret`이 남지 않도록 수정.
- **해결**: 모든 언어의 `chat.json` 로케일 파일에서 하드코딩된 `caret_mcp_settings.json` 문자열을 `codecenter_mcp_settings.json`으로 수정했다.

#### ✅ [완료] 5. 백엔드 메시지에 `Caret` 노출 문제
- **상세 설명**: AI가 사용자에게 질문하거나 새 작업을 제안할 때, VS Code 알림창에 "Caret has a question" 또는 "Caret wants to start a new task"와 같이 `Caret` 브랜드명이 노출되는 문제.
- **요청**: 메시지 내 `Caret`을 `CodeCenter`로 수정.
- **해결**: `AskFollowupQuestionToolHandler.ts`와 `NewTaskHandler.ts` 파일에 하드코딩된 `Caret` 문자열을 `CodeCenter`로 직접 수정했다.

#### ✅ [완료] 6. 음성 입력 기능 비활성화
- **상세 설명**: 설정의 '기능' 탭에 있는 '음성 입력 활성화' 체크박스가 활성화되어 있는 문제. 코드센터에서는 이 기능이 제공되지 않으므로, 사용자가 체크할 수 없도록 비활성화(disabled) 상태로 만들어야 한다.
- **요청**: 음성 입력 체크 버튼 `disabled` 처리.
- **해결**: `enableDictationFeature` 기능 플래그를 `FeatureConfig` 시스템에 새로 추가하고, `FeatureSettingsSection.tsx`에서 이 플래그를 사용하여 체크박스를 비활성화하도록 수정했다.

#### ✅ [완료] 7. 페르소나 템플릿 제거 문제
- **상세 설명**: 설정의 '일반' 탭에서 '페르소나 시스템 활성화' 체크박스가 보이는 문제. 코드센터에서는 페르소나 기능이 제공되지 않으므로, 이 설정 UI 자체가 보이지 않아야 한다.
- **요청**: 기능 플래그가 동작하지 않는 문제 해결.
- **해결**: `CaretGeneralSettingsSection.tsx`의 조건부 렌더링 로직을 `featureConfig?.showPersonaSettings === true`로 명확하게 수정하여, `false` 또는 `undefined`일 때 페르소나 UI가 확실히 숨겨지도록 변경했다.

## 현재 상태 및 다음 단계 (Next Steps)

1.  **현재 상태**:
    - 위 모든 피드백 항목에 대한 코드 수정이 완료되었다.
    - 하지만, 수정 과정에서 발생한 타입스크립트 오류들이 해결되지 않은 채로 남아있어 **빌드가 실패하는 상태**이다.
    - 현재 작업 브랜치는 `CodeCenter`로 변환된 상태와 수정된 코드가 뒤섞여 있다.

2.  **내일 진행할 작업**:
    - **빌드 오류 해결**: `npm run compile` 실행 시 나타나는 타입스크립트 오류들을 모두 해결한다. (어제 마지막 단계에서 중단됨)
    - **코드 롤백 및 재적용**: `git`을 사용하여 어제 수정된 모든 파일을 원상 복구(`Caret` 상태)한 후, `brand-converter.js` 스크립트를 다시 실행하여 `CodeCenter`로 변환한다. 그 다음, 빌드 오류를 해결하기 위해 수정했던 `FeatureConfig` 관련 변경 사항들을 다시 적용한다.
    - **수동 테스트**: 컴파일 성공 후, 개발 환경에서 확장 프로그램을 실행하여 수정된 모든 피드백 항목이 코드센터 브랜드에서 올바르게 동작하는지 직접 확인한다.

---
**참조 문서**: `slexn-codecenter/work-plans/20251028-whitelabeling-feedback-analysis.md`
