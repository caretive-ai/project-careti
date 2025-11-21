# t06 - Phase 2: 어댑터 뼈대 구축 및 핵심 철학 이식

## 1. 📜 Caret 개발 원칙

이 작업은 다음의 Caret 핵심 개발 원칙을 반드시 준수해야 합니다.

*   **품질 우선**: 속도보다 정확성을 우선하며, 기술 부채를 남기지 않습니다.
*   **TDD 필수**: 모든 기능은 `RED -> GREEN -> REFACTOR` 사이클을 따르며, 통합 테스트를 우선합니다.
*   **검증 필요**: 모든 변경 후에는 `Test -> Compile -> Execute`의 검증 절차를 거칩니다.
*   **L1 독립 모듈 선호**: `caret-src/` 내의 독립적인 모듈 구현을 최우선으로 하여 Cline 원본 코드 수정을 최소화합니다.

---

## 2. 🎯 Phase 목표

`cline-latest`의 `PromptRegistry` 아키텍처와 Caret의 JSON 기반 시스템을 연결하는 **어댑터(Adapter)와 전략(Strategy) 패턴의 핵심 뼈대**를 `caret-src/` 내에 구축한다. 이 과정에서 Caret의 핵심 철학인 **CHATBOT/AGENT 모드 분리**와 **`mode_restriction` 기반 도구 제한** 로직을 새로운 구조에 이식하여, 시스템의 '영혼'을 불어넣는다.

---

## 3. ✅ 상세 작업 체크리스트

### 3.1. 아키텍처 설계 및 파일 구조 정의
- [x] **`PromptSystemManager` (전략 패턴) 설계**
    - [x] `caret-src/core/prompts/system/` 디렉토리 생성
    - [x] `PromptSystemManager.ts` 파일 생성: `cline` 또는 `caret` 시스템을 선택하고 위임하는 역할
    - [x] `IPromptSystem.ts` 인터페이스 정의: `getPrompt(context)` 메서드를 포함
- [x] **`CaretJsonAdapter` (어댑터 패턴) 설계**
    - [x] `caret-src/core/prompts/system/adapters/` 디렉토리 생성
    - [x] `CaretJsonAdapter.ts` 파일 생성: `IPromptSystem` 인터페이스를 구현하며, Phase 1에서 생성한 JSON 파일들을 조합하는 역할
- [x] **`ClineLatestAdapter` (어댑터 패턴) 설계**
    - [x] `ClineLatestAdapter.ts` 파일 생성: `IPromptSystem` 인터페이스를 구현하며, `cline-latest`의 `PromptRegistry`를 호출하는 역할

### 3.2. TDD RED: 통합 테스트 우선 작성
- [x] **테스트 파일 생성**
    - [x] `caret-src/__tests__/tdd/` 디렉토리에 `T06PromptSystemIntegration.test.ts` 파일 생성
- [x] **통합 시나리오 테스트 작성 (실패 예상)**
    - [x] `PromptSystemManager`가 'caret' 모드일 때 `CaretJsonAdapter`를 통해 CHATBOT/AGENT 모드별 프롬프트를 올바르게 생성하는지 검증하는 테스트 코드 작성
    - [x] `PromptSystemManager`가 'cline' 모드일 때 `ClineLatestAdapter`를 통해 기존 프롬프트를 정상적으로 반환하는지 검증하는 테스트 코드 작성
    - [x] CHATBOT 모드에서 `execute_command`가 `mode_restriction`에 의해 프롬프트에서 제외되는지 검증하는 테스트 코드 작성

### 3.3. GREEN: 최소 기능 구현으로 테스트 통과
- [x] **`IPromptSystem.ts` 인터페이스 구현**
- [x] **`PromptSystemManager.ts` 기본 로직 구현**
    - [x] 생성자에서 `CaretJsonAdapter`와 `ClineLatestAdapter`를 초기화
    - [x] `getPrompt(context)` 메서드에서 `context.modeSystem` 값에 따라 적절한 어댑터로 위임하는 로직 구현
- [x] **`CaretJsonAdapter.ts` 핵심 로직 구현**
    - [x] Phase 1에서 생성한 `CARET_TODO_MANAGEMENT.json`, `CARET_TASK_PROGRESS.json`, `CARET_FEEDBACK_SYSTEM.json` 파일을 로드하는 로직 구현
    - [x] `context.mode` (chatbot/agent)에 따라 다른 JSON 섹션을 조합하는 기본 로직 구현
    - [x] `TOOL_DEFINITIONS.json`의 `mode_restriction`을 읽어 CHATBOT 모드일 때 특정 도구를 필터링하는 로직 구현
- [x] **`ClineLatestAdapter.ts` 기본 로직 구현**
    - [x] `cline-latest`의 `PromptRegistry` 인스턴스를 가져와 `get()` 메서드를 호출하고 결과를 그대로 반환하는 로직 구현
- [x] **테스트 실행 및 통과 확인**: `npm run test:unit` (또는 해당 테스트 파일 지정) 실행하여 `T06PromptSystemIntegration.test.ts`가 통과하는지 확인

### 3.4. REFACTOR: 코드 개선 및 철학 이식
- [x] **상수화 및 타입 정의**
    - [x] `caret-src/shared/constants/`에 `PromptSystemConstants.ts` 파일 생성
    - [x] `"caret"`, `"cline"`, `"chatbot"`, `"agent"` 등 모든 문자열을 상수로 대체
- [x] **로직 분리**
    - [x] `CaretJsonAdapter` 내에서 JSON 파일을 로드하는 부분, 조합하는 부분, 필터링하는 부분을 명확한 private 메서드로 분리
- [x] **주석 및 문서화**
    - [x] 각 클래스와 주요 메서드에 JSDoc 형식으로 주석 추가 (역할, 파라미터, 반환값 명시)

### 3.5. Phase 검증 및 Git 체크포인트
- [x] **검증 문서 작성**: `t06-phase2-verification.md` 문서 생성 및 아래 내용 기록
    - [x] TDD 테스트 결과 (통과 스크린샷 또는 로그)
    - [x] `PromptSystemManager`가 두 시스템을 올바르게 전환하는 로직 흐름도
    - [x] CHATBOT 모드에서 도구가 성공적으로 필터링되었음을 보여주는 프롬프트 출력 예시
- [x] **Phase 검증 스크립트 확장**: `caret-scripts/tools/phase-validator.js` 수정
    - [x] `validatePhase2()` 메서드 추가
    - [x] `PromptSystemManager.ts`, `CaretJsonAdapter.ts`, `ClineLatestAdapter.ts` 파일 존재 여부 검증
    - [x] `T06PromptSystemIntegration.test.ts` 테스트 파일 존재 여부 검증

### 3.6. 🚨 필수: 사용자 검증 및 커밋 절차
**⚠️ 구현 완료 후 반드시 다음 순서로 진행:**

1. **사용자/다른 AI에게 검증 요청**:
   ```
   "Phase 2 구현이 완료되었습니다. 다음을 검증해 주세요:
   - PromptSystemManager가 caret/cline 모드를 올바르게 전환하는지
   - CaretJsonAdapter가 JSON 파일을 정상적으로 로드하고 조합하는지  
   - ClineLatestAdapter가 cline-latest PromptRegistry와 연동되는지
   - TDD 통합 테스트가 모두 통과하는지"
   ```

2. **사용자 최종 확인 후 Git 체크포인트**:
   - [x] Phase 2 완료 시 커밋: `git commit -m "feat: Complete Phase 2 - Build adapter skeleton and integrate core philosophy"`
   - [x] 검증 완료 시 태그: `git tag -a "t06-phase-2" -m "Phase 2 verification complete"`
   - [x] 사용자 확인 요청 후 푸시: `git push origin merge-v326-08292807 --follow-tags`
   - [x] Phase 3 시작 전 백업 브랜치: `git branch t06-phase-2-backup`

---

## 4. 🏁 완료 기준

- [ ] `PromptSystemManager`와 두 개의 어댑터(`CaretJsonAdapter`, `ClineLatestAdapter`) 파일이 `caret-src/` 내에 생성되고, TDD 통합 테스트를 통과함.
- [ ] `CaretJsonAdapter`는 CHATBOT/AGENT 모드에 따라 동적으로 JSON 프롬프트를 조합하며, `mode_restriction` 철학을 완벽하게 구현함.
- [ ] `caret-scripts/tools/phase-validator.js`의 `validatePhase2()` 검증이 100% 통과함.
- [ ] `t06-phase2-verification.md` 문서에 모든 검증 결과가 상세히 기록됨.
- [ ] Phase 3를 시작하기 위한 모든 전제 조건(안정적인 어댑터 뼈대)이 충족됨.
