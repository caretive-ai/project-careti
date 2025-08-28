# Task 002: 페르소나 설정 기능 복원 - Action Checklist

## Phase 0: [실패 및 원상 복구] Rules 시스템 변경

- [!] **목표**: `.clinerules`를 `.caretrules`로 변경하고 우선순위 로딩 적용.
- **결과**: Cline 핵심 로직(`src`) 수정 후, 테스트 환경(`mocha`, `ts-node`)의 ESM/CJS 호환성 문제로 `npm test` 실패.
- **조치**: 안정적인 상태에서 다시 시작하기 위해, 관련된 모든 수정 사항을 백업 파일로 원상 복구 진행 중.

## Phase 1: 프로젝트 원상 복구

- [x] `package.json` 복원 완료.
- [x] `.mocharc.json` 복원 완료.
- [x] `tsconfig.unit-test.json` 복원 완료.
- [x] `src/core/task/index.ts` 복원 완료.
- [ ] `src/core/context/instructions/user-instructions/cline-rules.ts` 복원.
- [ ] 임시 생성 파일 (`.caretrules`, 백업 파일 등) 삭제.
- [ ] `tasks-status.md`의 Task #010 삭제 및 이 문서(002-02) 정리.

## Phase 2: Rules 우선순위 로딩 구현 ✅ 완료

- [x] **우선순위 로직 구현**: Cline 원본의 `addUserInstructions` 함수 수정하여 규칙 파일 우선순위 로딩 구현
    - **우선순위**: `.caretrules` (`.clinerules`) > `.cursorrules` > `.windsurfrules`
    - **로직**: 하나의 규칙 파일이 존재하면 나머지는 무시
    - **백업 필수**: Cline 원본 파일 수정 시 `.cline` 백업 생성
- [x] **파일 수정 목록**:
    - [x] `src/core/prompts/system.ts` 백업 및 수정
    - [x] `src/core/prompts/model_prompts/claude4.ts` 백업 및 수정 (중복 함수)
- [x] **테스트 코드 작성**: `caret-src/__tests__/rule-priority.test.ts` 추가 (6개 테스트 모두 통과)
- [x] **검증**: 빌드 및 컴파일 성공 확인

## Phase 3: 설정 시스템 확장 ❌ **실패 - 근본 원인 분석 완료**

### **구현 완료 부분**:
- [x] **General Settings에 UI 언어 설정(i18n) 추가**:
    - [x] SettingsView 컴포넌트 구조 분석
    - [x] 기존 ChatSettings 인터페이스 확장 (uiLanguage 필드 추가)
    - [x] 언어 선택 UI 컴포넌트 구현 (CaretUILanguageSetting.tsx)
    - [x] SettingsView에 UI 언어 설정 통합
    - [x] 백업 생성 (ChatSettings-ts.cline, SettingsView-tsx.cline)
- [x] **테스트 및 검증**:
    - [x] TypeScript 컴파일 성공 확인
    - [x] webview-ui 빌드 성공 확인  
    - [x] 전체 테스트 스위트 통과 (프론트엔드 80개, 백엔드 30개)

### **❌ 실제 동작 실패 - 근본 원인 발견 (2025-06-22)**:

**1. 저장소 불일치 (가장 심각)**:
- `updateSettings.ts`: globalState에 저장
- `state.ts`: workspaceState에서 로드
- **결과**: 저장한 곳과 다른 곳에서 로드하여 설정이 사라짐

**2. ExtensionStateContext 반응성 저하**:
- Cline 원본: UI 먼저 업데이트 → 백엔드 저장
- Caret 수정: 백엔드 먼저 저장 → UI 업데이트
- **결과**: 네트워크 지연 시 UI 멈춤

**3. TDD 원칙 위반**:
- 테스트 없이 구현부터 진행
- 복잡성 폭발: 한 번에 너무 많은 변경
- **결과**: 근본 문제를 놓쳐 실패

### **Phase 3 재작업 필요**:
- [ ] **저장소 불일치 해결** (최우선)
- [ ] **ExtensionStateContext 원복**
- [ ] **통합 테스트 추가**
- [ ] **TDD 방식으로 재구현**

## Phase 4: 페르소나 UI 구현 📅 **다음 세션 예정**

- [x] `PersonaTemplateSelector.tsx` 컴포넌트 기본 구조 작성 (임시 완료)
- [ ] 실제 `template_characters.json` 파일 로드 로직 구현
- [ ] WelcomeView와 연동 완성
- [ ] 다국어 지원 (i18n 키 추가)

## Phase 4: Core Extension 로직 구현 (`caret-src`)

- [ ] `CaretProvider.ts` (또는 `Controller`)에 웹뷰로부터 메시지를 수신할 핸들러 추가
    - `case 'SET_PERSONA':` 와 같은 메시지 타입 처리 로직 구현
- [ ] 수신한 `customInstruction` JSON 객체를 포맷에 맞게 문자열로 변환
- [ ] 전역 규칙 파일 경로(`C:/Users/luke/Documents/Cline/Rules/custom_instructions.md`)에 변환된 문자열을 저장하는 함수 구현
    - `vscode.workspace.fs.writeFile` API 사용

## Phase 5: 상태 관리 및 연동

- [ ] `ExtensionStateContext.tsx`의 `useExtensionState` 훅을 사용하여 `chatSettings.preferredLanguage` 상태 가져오기
- [ ] `PersonaTemplateSelector.tsx`에서 '선택' 버튼 클릭 시, `preferredLanguage`에 맞는 언어의 `customInstruction`을 선택하여 백엔드로 전송
    - (예: `preferredLanguage`가 'Korean'이면 `ko.customInstruction` 전송)
- [ ] 페르소나 적용 후, Rules UI에 변경 사항이 반영되도록 `vscode.postMessage({ type: 'REFRESH_RULES' });`와 같은 메시지 전송 로직 추가 (필요시)

## Phase 6: 테스트 및 검증

- [ ] UI: 페르소나 선택 및 정보 표시 기능 테스트
- [ ] 기능: '선택' 버튼 클릭 시 `custom_instructions.md` 파일이 정상적으로 업데이트되는지 확인
ㄴ- [ ] 기능: 언어 설정 변경 시 해당 언어의 페르소나가 올바르게 적용되는지 확인
- [ ] 전체: 기능 구현 후 `npm test`를 실행하여 모든 테스트가 통과하는지 확인
