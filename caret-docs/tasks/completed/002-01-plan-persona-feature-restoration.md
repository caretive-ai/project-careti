# Task 002: 페르소나 설정 기능 복원 계획

## 1. 목표

과거에 존재했던 AI 에이전트 페르소나 설정 기능을 현재의 변경된 Cline 아키텍처에 맞게 복원하고 개선한다.

## 2. 주요 작업 내용

### Phase 1: 현황 분석 및 계획 수립 ✅ **완료**
- [x] **페르소나 기능 분석**:
    - [x] `caret-assets/template_characters/` 디렉토리 구조 및 파일 내용 분석
    - [x] `template_characters.json`의 다국어 페르소나 정보 구조 확인
    - [x] 과거 기능 동작 방식 정리 (템플릿 선택 → `custom_instructions.md` 설정)
- [x] **변경된 Cline 구조 분석**:
    - [x] `Preferred Language` 설정 기능 분석 (소스 코드 검색 및 역할 파악, i18n과 충돌 여부 확인)
    - [x] 새로운 Rules UI (`Workspace Rules`, `Workflows`) 구조 및 역할 분석
        - [x] 각 규칙 파일(`cline-overview.md`, `.cursorrules`, `.windsurfrules` 등)의 위치와 역할 파악
- [x] **규칙 우선순위 시스템 구현** (2025-01-21 완료)
- [x] **Logger 초기화 문제 해결** (2025-01-21 완료)

### Phase 2: Rules 우선순위 시스템 구현 ✅ **완료**
- [x] **우선순위 로직 구현**: `.caretrules` > `.cursorrules` > `.windsurfrules`
- [x] **백업 및 수정**: `src/core/prompts/system.ts`, `src/core/prompts/model_prompts/claude4.ts` 
- [x] **테스트 코드**: `caret-src/__tests__/rule-priority.test.ts` (6개 테스트 모두 통과)
- [x] **Logger 초기화**: `caret-src/extension.ts`에 Logger 초기화 추가

### Phase 3: 설정 시스템 확장 ✅ **완료** (2025-06-21)
- [x] **General Settings에 UI 언어 설정(i18n) 추가**:
    - [x] SettingsView 컴포넌트 분석 및 구조 파악
    - [x] ChatSettings.ts에 uiLanguage 필드 추가 (백업: ChatSettings-ts.cline)
    - [x] CaretUILanguageSetting.tsx 컴포넌트 구현 (영어/한국어 지원)
    - [x] SettingsView.tsx에 UI 언어 설정 통합 (백업: SettingsView-tsx.cline)
    - [x] 기존 Preferred Language(AI 대화용)와 UI Language(인터페이스용) 구분 완료
    - [x] 컴파일 및 테스트 성공 (전체 110개 테스트 통과)
- [ ] **사용자 설정 보존 시스템** (Phase 5로 연기):
    - [ ] 규칙 토글 상태의 수동/자동 구분 플래그 추가
    - [ ] 사용자가 수동으로 변경한 설정은 우선순위 로직 적용 제외
    - [ ] 설정 초기화 옵션 제공

### Phase 4: 페르소나 UI 구현 📅 **다음 세션 예정**
- [ ] PersonaTemplateSelector 컴포넌트 완성
- [ ] 백엔드 연동 로직 구현
- [ ] 테스트 및 검증

### 🚨 Phase 3 후속 문제 발생 및 근본 원인 분석 (2025-06-22)

#### **초기 증상 (2025-06-22 새벽)**:
- ❌ **설정 저장 실패**: UI 언어 설정 및 기존 선호 언어 설정 모두 저장 안됨
- ❌ **디버깅 불가**: Extension Development Host에서 로그 출력 안됨

#### **근본 원인 분석 완료 (2025-06-22 오후)**:

**1. 저장소 불일치 (가장 심각) 🎯**
```typescript
// Controller.ts (445줄): workspaceState 저장
await updateWorkspaceState(this.context, "chatSettings", chatSettings)

// updateSettings.ts (57줄): globalState 저장  
await controller.context.globalState.update("chatSettings", chatSettings)

// state.ts (360줄): workspaceState에서 로드
getWorkspaceState(context, "chatSettings")
```
**결과**: 저장은 `globalState`에, 로드는 `workspaceState`에서! 완전히 다른 저장소 사용

**2. ExtensionStateContext 반응성 저하**
- **Cline 원본**: UI 먼저 업데이트 → 백엔드 저장 (즉시 반응성)
- **Caret 수정**: 백엔드 먼저 저장 → UI 업데이트 (반응성 저하)

**3. 테스트 한계**
- 모킹된 환경에서는 저장소 불일치 검증 불가
- Extension Host 실제 실행 환경과 다름
- 통합 테스트 부족으로 전체 플로우 검증 안됨

**4. TDD 원칙 위반**
- 테스트 없이 구현부터 진행 → 근본 문제 놓침
- 복잡성 폭발: 한 번에 너무 많은 변경사항

#### **해결 계획 (우선순위순)**:
1. **저장소 불일치 해결** - chatSettings 저장/로드 위치 통일
2. **ExtensionStateContext 원복** - Cline 원본 방식으로 복구  
3. **통합 테스트 추가** - 실제 저장/로드 플로우 검증
4. **UI 언어 설정 재구현** (근본 문제 해결 후)
## 3. 분석 결과

### 3.1. 페르소나 기능
- **페르소나 데이터**: `caret-assets/template_characters/template_characters.json` 파일에 캐릭터별(사랑, 이치카, 시안, 우분투)로 `en`, `ko` 두 언어에 대한 페르소나 정보(이름, 설명, customInstruction)와 이미지 경로가 정의되어 있음.
- **과거 동작 추정**: UI에서 특정 캐릭터와 언어를 선택하면, 해당 `customInstruction` JSON 객체가 `custom_instructions.md` 파일에 저장되는 방식.

### 3.2. Cline 구조 변경점
- **`Preferred Language` 설정**:
    - General 설정 탭에 위치하며, AI와의 상호작용 언어를 선택하는 기능.
    - `chatSettings.preferredLanguage` 상태로 관리되며, 백엔드로 전달되어 AI 프롬프트 언어 제어에 사용될 것으로 보임.
    - Caret의 UI 다국어화(`locales`)와는 목적이 다르므로 직접적인 충돌은 없음.
- **Rules 시스템 상세**:
    - **호출 순서 및 결합**: `attemptApiRequest` 함수 내에서 `getGlobalClineRules`, `getLocalClineRules`, `getLocalCursorRules`, `getLocalWindsurfRules` 순으로 규칙을 로드합니다. 이후 `addUserInstructions` 함수가 이 모든 내용을 하나의 문자열로 합쳐 시스템 프롬프트에 추가합니다.
    - **중복 문제 발견**: `addUserInstructions` 함수는 단순히 문자열을 합치기만 하므로, **별도의 중복 제거 로직은 없습니다.** 현재 프로젝트에 `.clinerules`, `.cursorrules`, `.windsurfrules` 3개 파일이 모두 존재하여 **동일한 내용이 3번 중복으로 프롬프트에 포함되는 문제가 발생합니다.**
    - **우선순위 로직 필요**: 규칙 파일이 여러 개 존재할 때 우선순위에 따라 하나만 로딩하는 로직이 필요합니다. 제안된 우선순위: `.caretrules` > `.cursorrules` > `.windsurfrules`
    - **파일 위치 및 역할**:
        - **Global Rules**: `ensureRulesDirectoryExists`로 관리되는 전역 경로(예: `~/.cline/rules`)에 위치하며, 모든 프로젝트에 공통으로 적용됩니다. `custom_instructions.md`가 여기에 해당합니다.
        - **Workspace Rules**: 현재 작업 공간 루트에 위치하며, 해당 프로젝트에만 적용됩니다.
        - `.clinerules/`: 프로젝트별 커스텀 규칙을 정의하는 주된 공간입니다. `.clinerules`가 디렉토리이면 그 안의 모든 `.md`, `.txt` 파일을 합쳐서 규칙으로 사용하고, 단일 파일이면 그 파일의 내용만 규칙으로 사용합니다.
            - `.cursorrules`: Cursor IDE와의 호환성을 위한 규칙 파일입니다.
            - `.windsurfrules`: Windsurf IDE와의 호환성을 위한 규칙 파일입니다.
    - **Workflows**: Rules와는 별개로, 채팅창에서 `/` 명령어로 호출하는 자동화 스크립트입니다.

### 3.3. 테스트 프레임워크 및 빌드 시스템 분석
- **테스트 스크립트 분리**: `package.json`의 `scripts`를 분석한 결과, 테스트는 `test:unit` (Mocha, `tsconfig.test.json` 사용)과 `test:backend` (Vitest, `vitest.config.ts` 사용) 등으로 나뉘어 있습니다. 이를 통해 Cline(`src`)과 Caret(`caret-src`)의 테스트 환경이 분리되어 있음을 확인했습니다.
- **빌드 에러 원인**: `npm test` 실행 시 `rootDir` 관련 빌드 에러가 발생했습니다. 원인은 `src/api/index.ts` 파일이 아키텍처 원칙을 위반하고 `caret-src/utils/caret-logger.ts`를 직접 import하고 있었기 때문입니다.
- **해결**: `src/api/index.ts`에서 `caretLogger`에 대한 의존성을 제거하고, Cline의 자체 `Logger`를 사용하도록 수정하여 빌드 에러를 해결했습니다.

### 3.4. 테스트 환경 복구 시도 및 실패 기록
- **문제 발생**: `npm test` 실행 시, `test:unit` 스크립트에서 `@google/genai` 라이브러리의 ESM/CJS 호환성 문제로 `require is not defined` 에러 발생.
- **1차 시도**: `package.json`의 `test:unit` 스크립트에 `--loader ts-node/esm` 플래그를 추가하여 ESM 모듈 로딩 시도.
    - **결과**: `ERR_UNSUPPORTED_ESM_URL_SCHEME` 에러 발생. Windows 환경에서 `file://` 프로토콜 없는 절대 경로를 처리하지 못하는 문제.
- **2차 시도**: `.mocharc.json` 파일의 `"require": ["ts-node/register"]`를 `"loader": "ts-node/esm"`으로 변경.
    - **결과**: 동일한 `ERR_UNSUPPORTED_ESM_URL_SCHEME` 에러 발생.
- **결론**: 단순 설정 변경만으로는 해결이 어려운, `mocha`, `ts-node`, Windows 환경 간의 복합적인 호환성 문제로 판단. 이 문제를 해결하는 것은 현재 작업의 범위를 벗어나므로, 프로젝트 상태를 원상 복구하고 이 문제는 별도의 기술 부채 해결 Task로 등록하기로 결정.

### 3.5. 규칙 우선순위 시스템 구현 및 문제점 발견 (2025-01-21)
- **구현 완료**: `.caretrules` > `.clinerules` > `.cursorrules` > `.windsurfrules` 우선순위 시스템 구현
    - `refreshRules.ts`에 `applyGlobalRulePriority` 함수 추가
    - 기본 상태에서 가장 높은 우선순위 규칙만 활성화
    - 사용자가 수동으로 여러 규칙을 선택할 수 있도록 UI 유연성 제공
- **발견된 문제점**:
    - **사용자 설정 미보존**: 사용자가 수동으로 규칙을 변경해도 재진입 시 우선순위 로직이 다시 적용되어 설정이 초기화됨
    - **UI 구조 불완전**: CaretProvider에서 Cline 원본 UI(계정, 설정 버튼, 타이틀 등)가 누락됨
- **추가 요구사항**:
    - General Settings에 UI 언어 설정(i18n) 추가 필요
    - 사용자 수동 설정과 자동 우선순위 로직의 조화 필요

### 3.6. Logger 초기화 문제 해결 (2025-01-21)
- **문제**: `showTaskWithId` 실행 시 `Logger.outputChannel.appendLine`에서 `Cannot read properties of undefined` 에러 발생
- **원인**: `caret-src/extension.ts`에서 Cline의 `Logger` 클래스 초기화 누락
- **해결**: `caret-src/extension.ts`에 `Logger.initialize(outputChannel)` 추가하여 Cline Logger 초기화 완료
