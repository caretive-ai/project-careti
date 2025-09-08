# t06 - Phase 1: 신규 기능 분석 및 JSON 확장

## 1. 📜 Caret 개발 원칙

이 작업은 다음의 Caret 핵심 개발 원칙을 반드시 준수해야 합니다.

*   **품질 우선**: 속도보다 정확성을 우선하며, 기술 부채를 남기지 않습니다.
*   **TDD 필수**: 모든 기능은 `RED -> GREEN -> REFACTOR` 사이클을 따르며, 통합 테스트를 우선합니다.
*   **검증 필요**: 모든 변경 후에는 `Test -> Compile -> Execute`의 검증 절차를 거칩니다.
*   **L1 독립 모듈 선호**: `caret-src/` 내의 독립적인 모듈 구현을 최우선으로 하여 Cline 원본 코드 수정을 최소화합니다.

---

## 2. 🎯 Phase 목표

`cline-latest`의 구조적 발전, 특히 **'작업 관리 루프'(`auto_todo`, `task_progress`, `feedback`)**를 코드 레벨에서 완벽하게 분석하고, 그 기능과 철학을 수용할 수 있도록 기존 Caret JSON 시스템을 확장하여 두 시스템 간의 **기능적 동등성(Functional Parity)**을 확보한다.

---

## 3. ✅ 상세 작업 체크리스트

### 3.1. `cline-latest` 신규 컴포넌트 심층 분석
- [ ] **`auto_todo.ts` 분석**
    - [ ] `PLAN` -> `ACT` 모드 전환 시 TODO 생성이 트리거되는 조건 분석
    - [ ] 10번째 API 요청마다 TODO 검토 프롬프트가 추가되는 로직 분석
    - [ ] 생성되는 Markdown 체크리스트의 정확한 형식 파악
- [ ] **`task_progress.ts` 분석**
    - [ ] `task_progress` 파라미터가 모든 도구 사용에 어떻게 전달되는지 분석
    - [ ] `attempt_completion` 전 최종 체크리스트를 검증하는 로직 확인
- [ ] **`feedback.ts` 분석**
    - [ ] 피드백 요청 프롬프트가 생성되는 구체적인 조건 분석
    - [ ] 사용자 피드백을 처리하는 방식 연구

### 3.2. Caret JSON 확장 설계
- [ ] **'작업 관리 루프' JSON 스키마 설계**
    - [ ] `auto_todo` 기능을 위한 `CARET_TODO_MANAGEMENT.json` 스키마 정의:
      ```json
      {
        "chatbot_mode": {
          "title": "분석 작업 계획",
          "style": "분석 제안 중심",
          "template": "다음 분석 단계를 제안드립니다:\n- {분석항목1}\n- {분석항목2}"
        },
        "agent_mode": {
          "title": "실행 작업 계획", 
          "style": "실행 계획 중심",
          "template": "다음 작업을 순차적으로 실행하겠습니다:\n- {실행항목1}\n- {실행항목2}"
        }
      }
      ```
    - [ ] `task_progress` 기능을 위한 `CARET_TASK_PROGRESS.json` 스키마 정의:
      ```json
      {
        "chatbot_mode": {
          "progress_style": "분석 진행 상황",
          "completion_prompt": "분석이 완료되었습니다. 추가 분석이 필요한 영역이 있는지 검토해주세요."
        },
        "agent_mode": {
          "progress_style": "작업 진행 상황",
          "completion_prompt": "작업이 완료되었습니다. 결과를 확인하고 다음 단계를 진행하겠습니다."
        }
      }
      ```
    - [ ] `feedback` 기능을 위한 `CARET_FEEDBACK_SYSTEM.json` 스키마 정의:
      ```json
      {
        "chatbot_mode": {
          "feedback_request": "이 분석에 대한 의견이나 추가 질문이 있으시나요?",
          "approach": "대화형 상담"
        },
        "agent_mode": {
          "feedback_request": "작업 결과에 수정이 필요한 부분이 있다면 알려주세요.",
          "approach": "협업 개발"
        }
      }
      ```
- [ ] **CHATBOT/AGENT 모드별 내용 차별화 설계**
    - [ ] CHATBOT 모드: '분석 제안' 스타일의 TODO, '분석 진행 상황' 보고 등
    - [ ] AGENT 모드: '실행 계획' 스타일의 TODO, '작업 진행 상황' 보고 등

### 3.3. 신규 JSON 파일 생성
- [ ] `caret-src/core/prompts/sections/` 디렉토리 존재 여부 확인 및 생성
- [ ] 위 스키마를 바탕으로 `CARET_TODO_MANAGEMENT.json` 파일 생성 및 내용 작성
- [ ] 위 스키마를 바탕으로 `CARET_TASK_PROGRESS.json` 파일 생성 및 내용 작성
- [ ] 위 스키마를 바탕으로 `CARET_FEEDBACK_SYSTEM.json` 파일 생성 및 내용 작성
- [ ] JSON 파일 문법 검증: `node -e "JSON.parse(require('fs').readFileSync('파일경로', 'utf8'))"`

### 3.4. 토큰 효율성 사전 검증
- [ ] **기존 토큰 측정 스크립트 확장**: `caret-main/caret-scripts/system-prompt-token-measurement.js` 수정
    - [ ] `measureSystemPrompts()` 함수에 하이브리드 모드 측정 로직 추가:
      ```javascript
      // 4. 하이브리드 모드 (cline-latest PromptRegistry + Caret JSON)
      console.log("📄 하이브리드 모드 측정 중...")
      const { PromptRegistry } = require("../src/core/prompts/system-prompt/registry/PromptRegistry")
      const hybridPrompt = await PromptRegistry.getInstance().get({
          cwd: mockParams.cwd,
          providerInfo: { model: { id: "claude-3-5-sonnet" } },
          supportsBrowserUse: mockParams.supportsBrowserUse
      })
      // 기존 토큰 측정 로직 적용하여 효율성 비교
      ```
    - [ ] 하이브리드 vs Cline vs Caret 3-way 비교 결과 출력
    - [ ] 토큰 절약률이 10% 이상인지 검증 (임계값 체크)

### 3.5. 기능적 동등성 검증
- [ ] **검증 문서 작성**: `t06-phase1-verification.md` 문서 생성
- [ ] 컴포넌트별 기능 대응표 작성:
    - [ ] `auto_todo.ts` → `CARET_TODO_MANAGEMENT.json` 기능 매핑
    - [ ] `task_progress.ts` → `CARET_TASK_PROGRESS.json` 기능 매핑  
    - [ ] `feedback.ts` → `CARET_FEEDBACK_SYSTEM.json` 기능 매핑
- [ ] 기능적 동등성 검증 결과를 `t06-phase1-verification.md`에 기록

### 3.6. Phase 검증 및 Git 체크포인트
- [ ] **Phase 검증 스크립트 생성**: `caret-scripts/phase-validator.js` 신규 생성
    ```javascript
    class PhaseValidator {
        validatePhase1() {
            // JSON 파일 3개 존재 여부 검증
            const requiredFiles = ['CARET_TODO_MANAGEMENT.json', 'CARET_TASK_PROGRESS.json', 'CARET_FEEDBACK_SYSTEM.json']
            requiredFiles.forEach(file => {
                if (!fs.existsSync(`caret-src/core/prompts/sections/${file}`)) {
                    throw new Error(`Missing required file: ${file}`)
                }
            })
            // JSON 스키마 유효성 검사
            // 토큰 효율성 임계값 검사 (10% 이상)
        }
    }
    ```
- [ ] **Git 체크포인트 설정**:
    - [ ] Phase 1 완료 시 커밋: `git commit -m "feat: Complete Phase 1 - JSON system expansion with functional parity"`
    - [ ] 검증 완료 시 태그: `git tag -a "t06-phase-1" -m "Phase 1 verification complete"`
    - [ ] 사용자 확인 요청 후 푸시: `git push origin merge-v326-08292807 --follow-tags`
    - [ ] Phase 2 시작 전 백업 브랜치: `git branch t06-phase-1-backup`

### 3.7. 선택적 심화 검증 (여유 시 수행)
- [ ] **AI 시맨틱 분석** (선택사항): `caret-scripts/ai-semantic-analyzer.js` 활용
    - [ ] `auto_todo.ts` vs `CARET_TODO_MANAGEMENT.json` 의미론적 동등성 분석
    - [ ] `task_progress.ts` vs `CARET_TASK_PROGRESS.json` 의미론적 동등성 분석  
    - [ ] `feedback.ts` vs `CARET_FEEDBACK_SYSTEM.json` 의미론적 동등성 분석
    - [ ] 80% 이상 의미론적 동등성 확보 시 추가 검증 자료로 활용

---

## 4. 🏁 완료 기준

### 필수 완료 기준
- [ ] `cline-latest`의 '작업 관리 루프' 3개 컴포넌트의 모든 기능이 Caret의 CHATBOT/AGENT 철학이 반영된 3개의 신규 JSON 파일로 완벽하게 재정의됨.
- [ ] **토큰 효율성**: 하이브리드 시스템이 기존 Cline 대비 최소 10% 이상 토큰 절약 효과 검증됨.
- [ ] **검증 자동화**: `phase-validator.js`를 통한 자동 검증이 100% 통과함.
- [ ] **Git 체크포인트**: 안전한 롤백이 가능한 커밋 및 태그가 생성되어 사용자 확인 완료됨.
- [ ] `t06-phase1-verification.md` 문서에 모든 검증 결과가 상세히 기록됨.
- [ ] Phase 2를 시작하기 위한 모든 전제 조건이 충족됨.

### 선택적 완료 기준 (보너스)
- [ ] AI 시맨틱 분석을 통한 80% 이상 의미론적 동등성 확보 (여유 시 수행)
