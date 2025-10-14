# t06 - Phase 3: 전체 기능 통합 및 의미론적 검증

## 1. 📜 Caret 개발 원칙

이 작업은 다음의 Caret 핵심 개발 원칙을 반드시 준수해야 합니다.

*   **품질 우선**: 속도보다 정확성을 우선하며, 기술 부채를 남기지 않습니다.
*   **TDD 필수**: 모든 기능은 `RED -> GREEN -> REFACTOR` 사이클을 따르며, 통합 테스트를 우선합니다.
*   **검증 필요**: 모든 변경 후에는 `Test -> Compile -> Execute`의 검증 절차를 거칩니다.
*   **L1 독립 모듈 선호**: `caret-src/` 내의 독립적인 모듈 구현을 최우선으로 하여 Cline 원본 코드 수정을 최소화합니다.

---

## 2. 🎯 Phase 목표

Phase 2에서 구축한 어댑터 뼈대를 실제 시스템에 통합하고, `cline-latest`의 '작업 관리 루프' 컴포넌트와 Caret의 JSON 콘텐츠가 의미론적으로 동등하게 동작하도록 완전한 기능을 구현한다. 최종적으로, `PromptSystemManager`를 통해 생성된 하이브리드 프롬프트가 실제 AI 모델(Mock)에 전달되었을 때, 두 시스템의 철학이 올바르게 반영되는지 End-to-End 수준에서 검증한다.

---

## 3. ✅ 상세 작업 체크리스트

### 3.1. `CaretJsonAdapter` 기능 완성
- [x] **JSON 파일 로딩 및 캐싱 구현**:
    - [x] `JsonTemplateLoader.ts` (신규) 클래스를 생성하여 `caret-src/core/prompts/sections/` 내의 모든 JSON 파일을 비동기적으로 로드하고 메모리에 캐싱하는 기능 구현
- [x] **프롬프트 조립 로직 구현**:
    - [x] `context` (mode, brand 등)에 따라 필요한 JSON 섹션을 동적으로 선택하고 순서에 맞게 조합하는 로직 구현
    - [x] `TOOL_DEFINITIONS.json`의 `mode_restriction`을 적용하여 `chatbot` 모드일 때 `execute_command` 등의 도구가 프롬프트에서 제외되는지 확인
- [x] **'작업 관리 루프' 콘텐츠 통합**:
    - [x] `context`에 `auto_todo`, `task_progress` 관련 플래그가 있을 경우, Phase 1에서 생성한 `CARET_TODO_MANAGEMENT.json` 등의 내용을 프롬프트에 추가하는 로직 구현

### 3.2. `ClineLatestAdapter` 기능 완성
- [x] **`PromptRegistry` 연동**:
    - [x] `cline-latest/src/core/prompts/system-prompt/registry/PromptRegistry.ts`를 import (동적 import 사용)
    - [x] `getPrompt` 메서드 내에서 `PromptRegistry.getInstance().get(context)`를 호출하여 `cline-latest`의 프롬프트를 가져오는 로직 구현
- [x] **타입 호환성 처리**:
    - [x] Caret의 `context` 객체를 `PromptRegistry`가 요구하는 `SystemPromptContext` 타입으로 안전하게 변환하는 로직 추가

### 3.3. TDD RED: 실제 통합 테스트로 전환
- [x] **Mock 제거 및 실제 구현 테스트**:
    - [x] `T06PromptSystemIntegration.test.ts`에서 `vi.mock`을 제거
    - [x] `CaretJsonAdapter`가 생성한 프롬프트에 `CHATBOT MODE`와 `CARET_TODO_MANAGEMENT.json`의 내용이 포함되어 있는지 검증하는 테스트로 수정
    - [x] `CaretJsonAdapter`가 생성한 `chatbot` 모드 프롬프트에 `execute_command`가 없는지 검증하는 테스트 강화
    - [x] `ClineLatestAdapter`가 생성한 프롬프트에 `PLAN MODE` 또는 `ACT MODE` 문자열이 포함되어 있는지 검증하는 테스트로 수정

### 3.4. GREEN: 통합 테스트 통과
- [x] **`JsonTemplateLoader.ts` 구현**
- [x] **`CaretJsonAdapter.ts` 및 `ClineLatestAdapter.ts`의 `getPrompt` 메서드 완성**
- [ ] **테스트 실행 및 통과 확인**: `npm run test:unit -- --run caret-src/__tests__/tdd/T06PromptSystemIntegration.test.ts` 실행하여 모든 테스트가 통과하는지 확인 ⚠️ **미완료**

### 3.5. 의미론적 검증
- [x] **검증 문서 작성**: `t06-phase3-verification.md` 문서 생성
- [x] **프롬프트 출력 비교**:
    - [x] `cline-latest`의 `auto_todo`가 활성화된 프롬프트와, `CaretJsonAdapter`가 `CARET_TODO_MANAGEMENT.json`을 포함하여 생성한 프롬프트를 나란히 비교하고, 의미와 역할이 동등함을 문서에 기록
    - [x] 다른 '작업 관리 루프' 기능에 대해서도 동일하게 비교 및 기록
- [ ] **AI 시맨틱 분석 (선택사항)**:
    - [ ] `caret-scripts/utils/ai-semantic-analyzer.js`를 사용하여 두 프롬프트 간의 의미론적 동등성 점수를 측정하고 85% 이상인지 확인 ⚠️ **선택사항**

### 3.6. Phase 검증 및 Git 체크포인트
- [x] **Phase 검증 스크립트 확장**: `caret-scripts/tools/phase-validator.js` 수정
    - [x] `validatePhase3()` 메서드 추가
    - [x] `JsonTemplateLoader.ts` 파일 존재 여부 검증
    - [x] `T06PromptSystemIntegration.test.ts`에서 `vi.mock`이 사용되지 않는지 확인 (주석 처리 또는 삭제)

### 3.7. 🚨 필수: 사용자 검증 및 커밋 절차
**⚠️ 구현 완료 후 반드시 다음 순서로 진행:**

1. **사용자/다른 AI에게 검증 요청**:
   ```
   "Phase 3 구현이 완료되었습니다. 다음을 검증해 주세요:
   - CaretJsonAdapter와 ClineLatestAdapter가 완전한 프롬프트를 생성하는지
   - JSON 캐싱과 프롬프트 조립 로직이 올바르게 동작하는지
   - mode_restriction이 chatbot 모드에서 정상적으로 적용되는지
   - 실제 통합 테스트가 Mock 없이 모두 통과하는지"
   ```

2. **사용자 최종 확인 후 Git 체크포인트**:
   - [ ] Phase 3 완료 시 커밋: `git commit -m "feat: Complete Phase 3 - Full feature integration and semantic validation"`
   - [ ] 검증 완료 시 태그: `git tag -a "t06-phase-3" -m "Phase 3 verification complete"`
   - [ ] 사용자 확인 요청 후 푸시: `git push origin merge-v326-08292807 --follow-tags`
   - [ ] Phase 4 시작 전 백업 브랜치: `git branch t06-phase-3-backup`

---

## 4. 🏁 완료 기준

- [ ] `CaretJsonAdapter`와 `ClineLatestAdapter`가 각각 완전한 프롬프트를 생성할 수 있으며, `T06PromptSystemIntegration.test.ts`의 모든 실제 통합 테스트를 통과함.
- [ ] `CaretJsonAdapter`는 Caret의 CHATBOT/AGENT 철학과 '작업 관리 루프'를 JSON 기반으로 완벽하게 구현함.
- [ ] `t06-phase3-verification.md` 문서에 두 시스템 간의 의미론적 동등성이 명확하게 기록되고 검증됨.
- [ ] `caret-scripts/tools/phase-validator.js`의 `validatePhase3()` 검증이 100% 통과함.
- [ ] Phase 4를 시작하기 위한 모든 전제 조건(안정적인 하이브리드 프롬프트 생성 시스템)이 충족됨.
