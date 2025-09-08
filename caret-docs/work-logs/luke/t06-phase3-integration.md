# t06 - Phase 3: 전체 기능 통합 및 의미론적 검증

## 1. 📜 Caret 개발 원칙

이 작업은 다음의 Caret 핵심 개발 원칙을 반드시 준수해야 합니다.

*   **품질 우선**: 속도보다 정확성을 우선하며, 기술 부채를 남기지 않습니다.
*   **TDD 필수**: 모든 기능은 `RED -> GREEN -> REFACTOR` 사이클을 따르며, 통합 테스트를 우선합니다.
*   **검증 필요**: 모든 변경 후에는 `Test -> Compile -> Execute`의 검증 절차를 거칩니다.
*   **L1 독립 모듈 선호**: `caret-src/` 내의 독립적인 모듈 구현을 최우선으로 하여 Cline 원본 코드 수정을 최소화합니다.

---

## 2. 🎯 Phase 목표

Phase 2에서 구축한 어댑터 뼈대를 확장하여, **모든 프롬프트 컴포넌트**(`cline-latest`의 신규 '작업 관리 루프' 포함)를 JSON 기반으로 전환한다. 또한, `mode_restriction`을 완벽하게 구현하고, 단순 텍스트 비교를 넘어선 **의미론적/기능적 검증**을 통해 두 시스템이 의도대로 동작함을 증명한다.

---

## 3. ✅ 상세 작업 체크리스트

### 3.1. [TDD] 전체 컴포넌트 어댑터 구현
- [ ] **'작업 관리 루프' 어댑터 구현:**
    - [ ] `[RED]` `auto_todo` 컴포넌트가 CHATBOT/AGENT 모드에 따라 다른 스타일의 TODO를 생성하는지 검증하는 테스트 작성.
    - [ ] `[GREEN]` Phase 1에서 생성한 `CARET_TODO_MANAGEMENT.json`을 참조하여 `adaptAutoTodo()` 메서드 구현.
    - [ ] `task_progress`, `feedback` 컴포넌트에 대해서도 위 TDD 사이클 반복.
- [ ] **`mode_restriction` 구현 및 테스트:**
    - [ ] `[RED]` `context.mode`가 'chatbot'일 때, `TOOL_DEFINITIONS.json` (영어, 토큰 효율적 내용)의 `mode_restriction: "agent_only"` 설정이 적용되어 `execute_command`가 프롬프트에서 제외되는지 검증하는 테스트 작성.
    - [ ] `[GREEN]` `adaptToolDefinitions()` 메서드에 `mode_restriction` 필터링 로직을 추가하여 테스트 통과.
- [ ] **나머지 컴포넌트 어댑터 구현:**
    - [ ] `OBJECTIVE`, `SYSTEM_INFORMATION` 등 나머지 모든 컴포넌트에 대해 TDD 사이클을 반복하여 어댑터 메서드 구현.

### 3.2. 의미론적 검증
- [ ] **검증 문서 생성**: `t06-phase3-verification.md` 문서 생성.
- [ ] **프롬프트 생성 및 비교:**
    - [ ] 동일한 테스트 컨텍스트를 사용하여 'Caret 모드'와 'Cline 모드' 각각에서 전체 시스템 프롬프트를 생성하고, 그 결과를 `t06-phase3-verification.md`에 기록.
- [ ] **의도 및 기능 관점 분석:**
    - [ ] **(철학적 차이)** Caret 프롬프트에는 'AGENT MODE' 철학이, Cline 프롬프트에는 'ACT MODE' 규칙이 명시되는지 비교 분석.
    - [ ] **(기능적 차이)** Caret 프롬프트의 '작업 관리 루프' 섹션이 CHATBOT/AGENT 모드에 따라 내용이 변경되는지 분석.
    - [ ] **(도구 제한)** CHATBOT 모드의 Caret 프롬프트에서 `execute_command`와 같은 위험한 도구가 실제로 제외되었는지 확인.
    - [ ] 모든 분석 결과를 `t06-phase3-verification.md`에 상세히 기록.

### 3.3. 통합 시스템 성능 확인
- [ ] **성능 유지 확인**: Phase 1에서 검증된 토큰 효율성이 실제 통합 환경에서도 유지되는지 확인
    - [ ] 통합된 하이브리드 시스템의 프롬프트 생성 시간이 기존 대비 성능 저하 없는지 확인
    - [ ] 결과를 `t06-phase3-verification.md`에 간단히 기록

### 3.4. 백엔드 로직 검증
- [ ] **프롬프트 생성 로직 테스트**: 백엔드에서 하이브리드 시스템이 올바르게 동작하는지 검증
    - [ ] `PromptSystemManager.switchMode('caret')` 호출 시 올바른 컴포넌트들이 등록되는지 확인
    - [ ] `context.mode = 'chatbot'` 설정으로 프롬프트 생성 시 `mode_restriction`이 정상 작동하는지 확인  
    - [ ] `context.mode = 'agent'` 설정으로 프롬프트 생성 시 모든 도구가 포함되는지 확인
- [ ] **컴포넌트 어댑터 검증**: 모든 JSON 기반 컴포넌트가 예상대로 동작하는지 확인
    - [ ] CHATBOT/AGENT 모드별로 다른 내용이 생성되는지 확인
    - [ ] 기존 Cline 컴포넌트와 기능적으로 동등한 결과를 생성하는지 확인
- [ ] **모든 검증 결과를 `t06-phase3-verification.md`에 기록**

### 3.5. Phase 검증 및 Git 체크포인트
- [ ] **Phase 검증 스크립트 확장**: `caret-scripts/phase-validator.js`에 Phase 3 검증 추가
    ```javascript
    validatePhase3() {
        // 모든 컴포넌트 어댑터 동작 검증
        // mode_restriction 기능 검증
        // 토큰 효율성 유지 확인 (10% 이상)
        // E2E 테스트 통과 확인
    }
    ```
- [ ] **Git 체크포인트 설정**:
    - [ ] Phase 3 완료 시 커밋: `git commit -m "feat: Complete Phase 3 - Full system integration with semantic verification"`
    - [ ] 검증 완료 시 태그: `git tag -a "t06-phase-3" -m "Phase 3 integration complete"`
    - [ ] 사용자 확인 요청 후 푸시: `git push origin merge-v326-08292807 --follow-tags`
    - [ ] Phase 4 시작 전 백업 브랜치: `git branch t06-phase-3-backup`

### 3.6. 선택적 심화 검증 (여유 시 수행)
- [ ] **AI 시맨틱 분석** (선택사항): `caret-scripts/ai-semantic-analyzer.js` 활용
    - [ ] Caret 하이브리드 프롬프트 vs Cline 원본 프롬프트 의미론적 동등성 분석
    - [ ] 95% 이상 의미론적 동등성 확보 시 추가 검증 자료로 활용

---

## 4. 🏁 완료 기준

### 필수 완료 기준
- [ ] `cline-latest`의 모든 프롬프트 컴포넌트(신규 3개 포함)가 JSON 기반으로 성공적으로 전환됨.
- [ ] CHATBOT/AGENT 모드 및 `mode_restriction`에 따른 도구 제한이 TDD 테스트와 실제 동작 테스트에서 완벽하게 작동함.
- [ ] **성능 유지**: 토큰 효율성 10% 이상 개선 효과가 실제 환경에서도 확인됨.
- [ ] **검증 자동화**: `phase-validator.js`를 통한 Phase 3 자동 검증이 100% 통과함.
- [ ] **Git 체크포인트**: 안전한 롤백이 가능한 커밋 및 태그가 생성되어 사용자 확인 완료됨.
- [ ] `t06-phase3-verification.md` 문서에, 두 시스템의 프롬프트가 기능적으로 동등하며 의도된 철학적 차이점만 존재함이 명확하게 기록됨.
- [ ] Phase 4를 시작하기 위한 모든 기능 통합 및 검증이 완료됨.

### 선택적 완료 기준 (보너스)
- [ ] AI 시맨틱 분석을 통한 95% 이상 의미론적 동등성 확보 (여유 시 수행)
