# t06 - Phase 5: cline-latest 교차검증 및 시스템 프롬프트 개선

## 0. Luke 피드백 반영

단순히 시스템 프롬프트를 복사해오는게 아니라 **cline의 최신 시스템프롬프트와 교차검증 개선**해야 합니다. 1:1로 맵핑이 불가능하다면 다시 만들어야 할 수도 있고, 이를 검토하고 개발하게 해야 합니다.

---

## 1. 📜 Caret 개발 원칙

이 작업은 다음의 Caret 핵심 개발 원칙을 반드시 준수해야 합니다.

*   **품질 우선**: 속도보다 정확성을 우선하며, 기술 부채를 남기지 않습니다.
*   **TDD 필수**: 모든 기능은 `RED -> GREEN -> REFACTOR` 사이클을 따르며, 통합 테스트를 우선합니다.
*   **검증 필요**: 모든 변경 후에는 `Test -> Compile -> Execute`의 검증 절차를 거칩니다.
*   **L1 독립 모듈 선호**: `caret-src/` 내의 독립적인 모듈 구현을 최우선으로 하여 Cline 원본 코드 수정을 최소화합니다.

---

## 2. 🎯 Phase 목표

**cline-latest의 13개 시스템 프롬프트 컴포넌트**와 **Caret의 CHATBOT/AGENT 철학**을 교차검증하여, 각 컴포넌트를 다음 기준으로 분석하고 개선합니다:

1. **호환성 분석**: Caret 철학과 호환되는지 검토
2. **개선 필요성 판단**: 1:1 매핑 가능 vs 재구현 필요
3. **토큰 효율성 최적화**: 영어 기반, 축약형 사용, 불필요한 표현 제거
4. **mode_restriction 적용**: CHATBOT/AGENT 모드별 차별화

---

## 3. ✅ 상세 작업 체크리스트

### 3.1. [ANALYZE] cline-latest 컴포넌트 전수 분석

#### 3.1.1. 현재 상황 파악
- [ ] **cline-latest 컴포넌트 목록 작성**
  ```bash
  # src/core/prompts/system-prompt/components/ 디렉토리 전체 분석
  ls -la src/core/prompts/system-prompt/components/
  ```
- [ ] **각 컴포넌트별 상세 분석 문서 작성**: `t06-component-analysis.md`
  - [ ] 컴포넌트 목적과 기능 분석
  - [ ] 토큰 사용량 측정
  - [ ] Caret 철학과의 호환성 평가
  - [ ] CHATBOT/AGENT 모드별 적용 가능성 검토

#### 3.1.2. 기존 Caret JSON과의 비교 매트릭스 작성
| cline-latest 컴포넌트 | 기존 Caret JSON | 호환성 | 개선 전략 |
|---------------------|----------------|--------|----------|
| AGENT_ROLE | CHATBOT_AGENT_MODES.json | ⭐⭐⭐ | 개선 필요 |
| SYSTEM_INFO | ❌ 누락 | ❓ | 신규 생성 |
| MCP | ❌ 누락 | ❓ | 분석 후 결정 |
| TODO | CARET_TODO_MANAGEMENT.json | ⭐⭐ | 교차검증 |
| USER_INSTRUCTIONS | ❌ 누락 | ❓ | 신규 생성 |
| TOOL_USE | TOOL_DEFINITIONS.json | ⭐ | 전면 재설계 |
| EDITING_FILES | ❌ 누락 | ❓ | 분석 후 결정 |
| CAPABILITIES | ❌ 누락 | ❓ | 분석 후 결정 |
| RULES | ❌ 누락 | ❓ | 중요도 분석 |
| OBJECTIVE | ❌ 누락 | ❓ | 분석 후 결정 |
| ACT_VS_PLAN | ❌ 누락 | ❓ | Caret 철학과 충돌 가능 |
| FEEDBACK | CARET_FEEDBACK_SYSTEM.json | ⭐⭐ | 교차검증 |
| TASK_PROGRESS | CARET_TASK_PROGRESS.json | ⭐⭐ | 교차검증 |

### 3.2. [RED] 교차검증 테스트 우선 작성

- [ ] **비교 테스트 파일 생성**: `caret-src/__tests__/CrossValidationTest.test.ts`
- [ ] **시나리오별 테스트 작성**:
  - [ ] **시나리오 1: 컴포넌트 완전성**
    ```typescript
    // 모든 cline-latest 컴포넌트가 Caret JSON으로 변환되었는지 검증
    test('All cline-latest components have Caret JSON equivalents', async () => {
      const clineComponents = getAllClineComponents();
      const caretComponents = getAllCaretJsonComponents();
      
      expect(caretComponents.length).toBeGreaterThanOrEqual(clineComponents.length);
      // 각 cline 컴포넌트에 대응하는 caret 컴포넌트 존재 검증
    });
    ```
  - [ ] **시나리오 2: 의미론적 동등성**
    ```typescript
    // cline과 caret 프롬프트가 동등한 기능을 제공하는지 검증
    test('Caret prompts provide equivalent functionality to cline prompts', async () => {
      const clinePrompt = await getClinePrompt(mockContext);
      const caretPrompt = await getCaretPrompt(mockContext);
      
      // AI 능력, 도구 사용법, 규칙 등 핵심 요소가 모두 포함되어야 함
      expect(caretPrompt).toContain('tool usage');
      expect(caretPrompt).toContain('file editing');
      // ... 기타 핵심 요소들 검증
    });
    ```
  - [ ] **시나리오 3: 토큰 효율성**
    ```typescript
    // Caret JSON이 cline 대비 토큰 효율적인지 검증
    test('Caret JSON provides better token efficiency than cline', async () => {
      const clineTokens = countTokens(await getClinePrompt(mockContext));
      const caretTokens = countTokens(await getCaretPrompt(mockContext));
      
      const efficiency = (clineTokens - caretTokens) / clineTokens * 100;
      expect(efficiency).toBeGreaterThan(10); // 최소 10% 효율성 향상
    });
    ```

### 3.3. [GREEN] 누락된 컴포넌트 구현 및 기존 컴포넌트 개선

#### 3.3.1. 누락된 컴포넌트 신규 생성
- [ ] **SYSTEM_INFO → CARET_SYSTEM_INFO.json**
  - [ ] cline의 system_info 컴포넌트 분석
  - [ ] Caret 스타일로 재작성 (영어, 축약형, 토큰 효율성)
  - [ ] CHATBOT/AGENT 모드별 차별화 적용
  
- [ ] **MCP → CARET_MCP_INTEGRATION.json**
  - [ ] MCP(Model Context Protocol) 기능 분석
  - [ ] Caret 환경에서의 필요성 검토
  - [ ] 필요시 Caret 철학에 맞게 재구성

- [ ] **USER_INSTRUCTIONS → CARET_USER_INSTRUCTIONS.json**
  - [ ] 사용자 지시사항 처리 방식 분석
  - [ ] CHATBOT 모드에서는 단순화, AGENT 모드에서는 상세화
  
- [ ] **EDITING_FILES → CARET_FILE_EDITING.json**
  - [ ] 파일 편집 관련 지시사항 분석
  - [ ] mode_restriction 적용 (CHATBOT 모드에서는 제한적)
  
- [ ] **CAPABILITIES → CARET_CAPABILITIES.json**
  - [ ] AI 능력 설명 부분 분석  
  - [ ] Caret의 CHATBOT/AGENT 구분에 맞게 재구성
  
- [ ] **RULES → CARET_BEHAVIOR_RULES.json**
  - [ ] 행동 규칙 분석
  - [ ] Caret 철학(예의 바름, 효율성 등)과 통합
  
- [ ] **OBJECTIVE → CARET_TASK_OBJECTIVE.json**
  - [ ] 작업 목표 설정 부분 분석
  - [ ] 기존 CARET_TODO_MANAGEMENT와의 중복 제거
  
- [ ] **ACT_VS_PLAN → 분석 후 결정**
  - [ ] cline의 ACT_VS_PLAN 모드가 Caret의 CHATBOT/AGENT와 충돌하는지 분석
  - [ ] 충돌하지 않으면 CARET_ACTION_PLANNING.json으로 변환
  - [ ] 충돌하면 Caret 철학에 맞게 완전 재설계

#### 3.3.2. 기존 컴포넌트 교차검증 및 개선
- [ ] **CHATBOT_AGENT_MODES.json 개선**
  - [ ] cline의 AGENT_ROLE 컴포넌트와 비교
  - [ ] 누락된 중요 요소 추가
  - [ ] 토큰 효율성 재검토
  
- [ ] **TOOL_DEFINITIONS.json 전면 재설계**
  - [ ] cline의 TOOL_USE 컴포넌트 완전 분석
  - [ ] 현재 TOOL_DEFINITIONS가 너무 단순함을 인정
  - [ ] cline 수준의 상세한 도구 설명 + Caret의 mode_restriction 결합
  
- [ ] **CARET_TODO_MANAGEMENT.json 교차검증**
  - [ ] cline의 TODO 컴포넌트와 비교
  - [ ] 작업 관리 루프 기능 누락 부분 보완
  
- [ ] **CARET_TASK_PROGRESS.json 교차검증**
  - [ ] cline의 TASK_PROGRESS와 비교 분석
  - [ ] 진행 상황 추적 기능 개선
  
- [ ] **CARET_FEEDBACK_SYSTEM.json 교차검증**  
  - [ ] cline의 FEEDBACK과 비교
  - [ ] 피드백 수집 및 활용 방식 개선

### 3.4. [GREEN] 통합 및 검증

#### 3.4.1. JsonTemplateLoader 확장
- [ ] **새로운 JSON 파일들을 지원하도록 JsonTemplateLoader 업데이트**
  ```typescript
  // JsonTemplateLoader.ts에 새 컴포넌트들 추가
  private readonly templateNames = [
    'CHATBOT_AGENT_MODES',
    'TOOL_DEFINITIONS', 
    'CARET_TODO_MANAGEMENT',
    'CARET_TASK_PROGRESS',
    'CARET_FEEDBACK_SYSTEM',
    'BASE_PROMPT_INTRO',
    // 새로 추가되는 컴포넌트들
    'CARET_SYSTEM_INFO',
    'CARET_MCP_INTEGRATION',
    'CARET_USER_INSTRUCTIONS',
    'CARET_FILE_EDITING',
    'CARET_CAPABILITIES',
    'CARET_BEHAVIOR_RULES',
    'CARET_TASK_OBJECTIVE',
    'CARET_ACTION_PLANNING' // 필요시
  ];
  ```

#### 3.4.2. CaretJsonAdapter 업데이트
- [ ] **모든 새 컴포넌트를 지원하도록 CaretJsonAdapter 확장**
- [ ] **컴포넌트 간 의존성 및 순서 관리**
- [ ] **CHATBOT/AGENT 모드별 컴포넌트 선택 로직 정교화**

### 3.5. [VERIFY] 최종 검증 및 비교

- [ ] **`npm run test:webview` 실행**: 모든 교차검증 테스트 통과 확인
- [ ] **토큰 효율성 재측정**
  ```bash
  # 기존 스크립트 업데이트하여 새 컴포넌트들 포함 측정
  node caret-scripts/token-efficiency-analyzer.js
  ```
- [ ] **의미론적 동등성 수동 검증**
  - [ ] 실제 대화에서 cline 모드 vs caret 모드 비교
  - [ ] 핵심 기능 (파일 편집, 도구 사용, 작업 관리) 동등성 확인
- [ ] **성능 비교**
  - [ ] 프롬프트 생성 속도 비교
  - [ ] 메모리 사용량 비교

### 3.6. 🚨 필수: 사용자 검증 및 커밋 절차

**⚠️ 구현 완료 후 반드시 다음 순서로 진행:**

1. **사용자/다른 AI에게 검증 요청**:
   ```
   "Phase 5 교차검증이 완료되었습니다. 다음을 검증해 주세요:
   - cline-latest의 모든 13개 컴포넌트가 Caret JSON으로 완전 구현되었는지
   - 의미론적 동등성이 유지되면서도 토큰 효율성이 개선되었는지
   - CHATBOT/AGENT 모드별 차별화가 올바르게 적용되었는지
   - 교차검증 테스트가 모두 통과하는지
   - 실제 사용 시 cline과 동등한 성능을 보이는지"
   ```

2. **사용자 최종 확인 후 Git 체크포인트**:
   - [ ] Phase 5 완료 시 커밋: `git commit -m "feat: Complete Phase 5 - Cross-validation and system prompt enhancement"`
   - [ ] 검증 완료 시 태그: `git tag -a "t06-phase-5" -m "Phase 5 cross-validation complete"`
   - [ ] 사용자 확인 요청 후 푸시: `git push origin merge-v326-08292807 --follow-tags`
   - [ ] Phase 6 준비: 기존 Phase 5를 Phase 6으로 변경

---

## 4. 🏁 완료 기준

- [ ] cline-latest의 모든 13개 컴포넌트가 Caret JSON으로 완전 변환됨
- [ ] 교차검증 테스트가 100% 통과함 (완전성, 의미론적 동등성, 토큰 효율성)
- [ ] `t06-component-analysis.md` 문서에 모든 분석 결과가 기록됨
- [ ] 실제 대화 테스트에서 cline 모드와 caret 모드가 동등한 성능을 보임
- [ ] 토큰 효율성 14% 이상 향상이 검증됨
- [ ] CHATBOT/AGENT 모드별 차별화가 올바르게 구현됨

---

## 5. 🔄 Phase 6으로 이관

기존 Phase 5 (안정화, 최적화, 문서화)를 **Phase 6**으로 변경하여 다음 단계로 이어지도록 합니다.