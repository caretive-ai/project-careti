# t06 - Phase 5: cline-latest 교차검증 및 시스템 프롬프트 개선

## 0. Luke 통합 테스트 결과

1. 시작 
시작하면 챗봇,에이전트 모드인데 LLM에게는 plan과 act모드라고 대답함
하지만 [PromptSystemManager] 🎯 Selected adapter: caret (CaretJsonAdapter) 로그는 계속 나오고 있음
Mode : undefined, isChatbotMode: 항상 false 로 표기됨

2. Cline모드 전환 후 
- 별도의 PromptSystemManager 로그가 찍히지 않는걸 봐서는 정상으로 보임

3. 다시 Caret모드 전환 하고 Chatbot모드에서 Plan모드라고 대답함. 그리고 아래가 로그

[BACKEND] caretModeSystem changed: cline -> caret
extensionHostProcess.js:204 [Task 1757338934944] focus chain list: Could not load from markdown file: Error: ENOENT: no such file or directory, open 'c:\Users\Luke(양병석)\AppData\Roaming\Cursor\User\globalStorage\caretive.caret\tasks\1757338934944\focus_chain_taskid_1757338934944.md'
extensionHostProcess.js:204 [PromptSystemManager] 🔄 Adapter selection process started
extensionHostProcess.js:204 [PromptSystemManager] 📥 Input context: {modeSystem: 'caret', mode: undefined, providerInfo: 'unknown', mcpServers: 0, auto_todo: undefined, …}
extensionHostProcess.js:204 [PromptSystemManager] 🎯 Selected adapter: caret (CaretJsonAdapter)
extensionHostProcess.js:204 [CaretJsonAdapter] 🎯 Mode: undefined, isChatbotMode: false
extensionHostProcess.js:204 [CaretJsonAdapter] 📋 Selected sections: (10) ['BASE_PROMPT_INTRO', 'CHATBOT_AGENT_MODES', 'CARET_SYSTEM_INFO', 'CARET_CAPABILITIES', 'CARET_USER_INSTRUCTIONS', 'CARET_FILE_EDITING', 'CARET_BEHAVIOR_RULES', 'CARET_TASK_OBJECTIVE', 'CARET_ACTION_STRATEGY', 'CARET_FEEDBACK_SYSTEM']
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ BASE_PROMPT_INTRO: loaded (191 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CHATBOT_AGENT_MODES: loaded (53 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_SYSTEM_INFO: loaded (249 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_CAPABILITIES: loaded (461 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_USER_INSTRUCTIONS: loaded (436 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ Generated Cline tools section: 7/7 tools (6153 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ Cline tools section inserted after CARET_USER_INSTRUCTIONS
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_FILE_EDITING: loaded (521 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_BEHAVIOR_RULES: loaded (829 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_TASK_OBJECTIVE: loaded (647 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_ACTION_STRATEGY: loaded (720 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_FEEDBACK_SYSTEM: loaded (25 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] 🎉 Final prompt generated: 10305 characters, 11 sections
extensionHostProcess.js:204 [PromptSystemManager] ⚡ Prompt generation completed: 28ms, 10305 chars

4. 다시 Agent모드 전환후 물어보면 Act모드라고 대답함
[DEBUG] Using built in terminal manager
extensionHostProcess.js:204 [DEBUG] Registered request: fed80281-1866-4ec1-a054-ca6129cfd3bb
extensionHostProcess.js:204 [DEBUG] Setting up file subscription for c:\Users\Luke(양병석)\AppData\Roaming\Cursor\User\globalStorage\caretive.caret\tasks\1757338934944\focus_chain_taskid_1757338934944.md
extensionHostProcess.js:204 [DEBUG] Now watching file: c:\Users\Luke(양병석)\AppData\Roaming\Cursor\User\globalStorage\caretive.caret\tasks\1757338934944\focus_chain_taskid_1757338934944.md
extensionHostProcess.js:204 Error setting up file subscription: Error: ENOENT: no such file or directory, watch 'c:\Users\Luke(양병석)\AppData\Roaming\Cursor\User\globalStorage\caretive.caret\tasks\1757338934944\focus_chain_taskid_1757338934944.md'
_nativeConsoleLogMessage @ extensionHostProcess.js:204
_handleConsoleCall @ extensionHostProcess.js:200
(anonymous) @ extensionHostProcess.js:200
subscribeToFile @ extension.js:941158
handleStreamingRequest @ extension.js:940913
handleStreamingRequest @ extension.js:940921
handleStreamingRequest @ extension.js:941770
handleRequest @ extension.js:941709
(anonymous) @ extension.js:941794
(anonymous) @ extension.js:941816
setupFocusChainFileWatcher @ extension.js:877342
await in setupFocusChainFileWatcher
Task @ extension.js:885481
initTask @ extension.js:887623
await in initTask
cancelTask @ extension.js:887711
await in cancelTask
togglePlanActMode @ extension.js:887685
await in togglePlanActMode
togglePlanActModeProto @ extension.js:892422
handleUnaryRequest @ extension.js:938105
handleGrpcRequest @ extension.js:938099
handleWebviewMessage @ extension.js:942237
(anonymous) @ extension.js:942220
_deliver @ extensionHostProcess.js:29
_deliverQueue @ extensionHostProcess.js:29
fire @ extensionHostProcess.js:29
$onMessage @ extensionHostProcess.js:161
_doInvokeHandler @ extensionHostProcess.js:46
_invokeHandler @ extensionHostProcess.js:46
_receiveRequest @ extensionHostProcess.js:46
_receiveOneMessage @ extensionHostProcess.js:46
(anonymous) @ extensionHostProcess.js:46
_deliver @ extensionHostProcess.js:29
fire @ extensionHostProcess.js:29
fire @ extensionHostProcess.js:46
(anonymous) @ extensionHostProcess.js:222
_deliver @ extensionHostProcess.js:29
fire @ extensionHostProcess.js:29
fire @ extensionHostProcess.js:46
(anonymous) @ extensionHostProcess.js:222
emit @ node:events:524
MessagePortMain._internalPort.emit @ node:electron/js2c/utility_init:2
callbackTrampoline @ node:internal/async_hooks:130
extensionHostProcess.js:204 [PromptSystemManager] 🔄 Adapter selection process started
extensionHostProcess.js:204 [PromptSystemManager] 📥 Input context: {modeSystem: 'caret', mode: undefined, providerInfo: 'unknown', mcpServers: 0, auto_todo: undefined, …}
extensionHostProcess.js:204 [PromptSystemManager] 🎯 Selected adapter: caret (CaretJsonAdapter)
extensionHostProcess.js:204 [CaretJsonAdapter] 🎯 Mode: undefined, isChatbotMode: false
extensionHostProcess.js:204 [CaretJsonAdapter] 📋 Selected sections: (10) ['BASE_PROMPT_INTRO', 'CHATBOT_AGENT_MODES', 'CARET_SYSTEM_INFO', 'CARET_CAPABILITIES', 'CARET_USER_INSTRUCTIONS', 'CARET_FILE_EDITING', 'CARET_BEHAVIOR_RULES', 'CARET_TASK_OBJECTIVE', 'CARET_ACTION_STRATEGY', 'CARET_FEEDBACK_SYSTEM']
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ BASE_PROMPT_INTRO: loaded (191 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CHATBOT_AGENT_MODES: loaded (53 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_SYSTEM_INFO: loaded (249 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_CAPABILITIES: loaded (461 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_USER_INSTRUCTIONS: loaded (436 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ Generated Cline tools section: 7/7 tools (6153 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ Cline tools section inserted after CARET_USER_INSTRUCTIONS
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_FILE_EDITING: loaded (521 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_BEHAVIOR_RULES: loaded (829 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_TASK_OBJECTIVE: loaded (647 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_ACTION_STRATEGY: loaded (720 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] ✅ CARET_FEEDBACK_SYSTEM: loaded (25 chars)
extensionHostProcess.js:204 [CaretJsonAdapter] 🎉 Final prompt generated: 10305 characters, 11 sections
extensionHostProcess.js:204 [PromptSystemManager] ⚡ Prompt generation completed: 51ms, 10305 chars

5. Agent모드 브라우져 열기
 "브라우져 열어서 구글에 네이버 검색해봐"
 - buttun.approve라고 버튼 노출되고 클릭했는데 반응 없음. 버튼 자체의 액션이 문제가 있을 가능성이 있음
 
 로그 일부 : 
[CaretJsonAdapter] 📋 Selected sections: 
(10) ['BASE_PROMPT_INTRO', 'CHATBOT_AGENT_MODES', 'CARET_SYSTEM_INFO', 'CARET_CAPABILITIES', 'CARET_USER_INSTRUCTIONS', 'CARET_FILE_EDITING', 'CARET_BEHAVIOR_RULES', 'CARET_TASK_OBJECTIVE', 'CARET_ACTION_STRATEGY', 'CARET_FEEDBACK_SYSTEM']0: "BASE_PROMPT_INTRO"1: "CHATBOT_AGENT_MODES"2: "CARET_SYSTEM_INFO"3: "CARET_CAPABILITIES"4: "CARET_USER_INSTRUCTIONS"5: "CARET_FILE_EDITING"6: "CARET_BEHAVIOR_RULES"7: "CARET_TASK_OBJECTIVE"8: "CARET_ACTION_STRATEGY"9: "CARET_FEEDBACK_SYSTEM"length: 10[[Prototype]]: Array(0)

6. 노드 버전 알려줘
 - 터미널 열기 : 명령 실행하면 아래의 에러, 터미널 사용이 잘 안되는듯. 잠깐 열렸다 사라짐 (cline모드 동일)

The terminal process failed to launch: Starting directory (cwd) "C:\Users\Luke(양병석)\Desktop" does not exist.
onDidChangeNotification @ workbench.desktop.main.js:6946
(anonymous) @ workbench.desktop.main.js:6946
_deliver @ workbench.desktop.main.js:49
_deliverQueue @ workbench.desktop.main.js:49
fire @ workbench.desktop.main.js:49
addNotification @ workbench.desktop.main.js:5437
notify @ workbench.desktop.main.js:5437
_onProcessExit @ workbench.desktop.main.js:4673
await in _onProcessExit
(anonymous) @ workbench.desktop.main.js:4673
Promise.then
_createProcess @ workbench.desktop.main.js:4673
(anonymous) @ workbench.desktop.main.js:4671
Promise.then
_re @ workbench.desktop.main.js:4671
_createInstance @ workbench.desktop.main.js:5611
createInstance @ workbench.desktop.main.js:5611
createInstance @ workbench.desktop.main.js:6263
addInstance @ workbench.desktop.main.js:6263
ctr @ workbench.desktop.main.js:6263
_createInstance @ workbench.desktop.main.js:5611
createInstance @ workbench.desktop.main.js:5611
createGroup @ workbench.desktop.main.js:6263
_createTerminal @ workbench.desktop.main.js:6263
createTerminal @ workbench.desktop.main.js:6263
await in createTerminal
(anonymous) @ workbench.desktop.main.js:4806
await in (anonymous)
(anonymous) @ workbench.desktop.main.js:50
t @ workbench.desktop.main.js:50
$createTerminal @ workbench.desktop.main.js:4806
_doInvokeHandler @ workbench.desktop.main.js:488
_invokeHandler @ workbench.desktop.main.js:488
_receiveRequest @ workbench.desktop.main.js:488
_receiveOneMessage @ workbench.desktop.main.js:488
(anonymous) @ workbench.desktop.main.js:488
_deliver @ workbench.desktop.main.js:49
fire @ workbench.desktop.main.js:49
fire @ workbench.desktop.main.js:4801
(anonymous) @ workbench.desktop.main.js:6983
workbench.desktop.main.js:4784 [Extension Host] [TerminalManager Test] Shell integration timed out or failed for terminal 3: Promise timed out after 4000 milliseconds (at console.<anonymous> (file:///c:/Users/Luke(%EC%96%91%EB%B3%91%EC%84%9D)/AppData/Local/Programs/cursor/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:200:31986))
u4u @ workbench.desktop.main.js:4784
$logExtensionHostMessage @ workbench.desktop.main.js:4784
_doInvokeHandler @ workbench.desktop.main.js:488
_invokeHandler @ workbench.desktop.main.js:488
_receiveRequest @ workbench.desktop.main.js:488
_receiveOneMessage @ workbench.desktop.main.js:488
(anonymous) @ workbench.desktop.main.js:488
_deliver @ workbench.desktop.main.js:49
fire @ workbench.desktop.main.js:49
fire @ workbench.desktop.main.js:4801
(anonymous) @ workbench.desktop.main.js:6983
ExtensionStateContext.tsx:422 [DEBUG] returning new state in ESC

7. 에이전트모드에서 todolist는 잘 하는것 같음, 파일 쓰기 잘됨

**Luke 테스트 요약:**
✅ **정상 동작**: 파일 쓰기, Todo 관리
❌ **문제 동작**: 모드 인식 (Plan/Act로 잘못 응답), 브라우저 버튼, 터미널 실행
⚠️ **Cline 모드도 문제**: 원본과 동작 차이 추정

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
- [x] **cline-latest 컴포넌트 목록 작성**
  ```bash
  # src/core/prompts/system-prompt/components/ 디렉토리 전체 분석
  ls -la src/core/prompts/system-prompt/components/
  ```
- [x] **각 컴포넌트별 상세 분석 문서 작성**: `t06-component-analysis.md`
  - [x] 컴포넌트 목적과 기능 분석
  - [x] 토큰 사용량 측정
  - [x] Caret 철학과의 호환성 평가
  - [x] CHATBOT/AGENT 모드별 적용 가능성 검토

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

- [x] **비교 테스트 파일 생성**: `caret-src/__tests__/CrossValidationTest.test.ts`
- [x] **시나리오별 테스트 작성**:
  - [x] **시나리오 1: 컴포넌트 완전성**
    ```typescript
    // 모든 cline-latest 컴포넌트가 Caret JSON으로 변환되었는지 검증
    test('All cline-latest components have Caret JSON equivalents', async () => {
      const clineComponents = getAllClineComponents();
      const caretComponents = getAllCaretJsonComponents();
      
      expect(caretComponents.length).toBeGreaterThanOrEqual(clineComponents.length);
      // 각 cline 컴포넌트에 대응하는 caret 컴포넌트 존재 검증
    });
    ```
  - [x] **시나리오 2: 의미론적 동등성**
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
  - [x] **시나리오 3: 토큰 효율성**
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
- [x] **SYSTEM_INFO → CARET_SYSTEM_INFO.json**
  - [x] cline의 system_info 컴포넌트 분석
  - [x] Caret 스타일로 재작성 (영어, 축약형, 토큰 효율성)
  - [x] CHATBOT/AGENT 모드별 차별화 적용
  
- [x] **MCP → CARET_MCP_INTEGRATION.json**
  - [x] MCP(Model Context Protocol) 기능 분석
  - [x] Caret 환경에서의 필요성 검토
  - [x] 필요시 Caret 철학에 맞게 재구성

- [x] **USER_INSTRUCTIONS → CARET_USER_INSTRUCTIONS.json**
  - [x] 사용자 지시사항 처리 방식 분석
  - [x] CHATBOT 모드에서는 단순화, AGENT 모드에서는 상세화
  
- [x] **EDITING_FILES → CARET_FILE_EDITING.json**
  - [x] 파일 편집 관련 지시사항 분석
  - [x] mode_restriction 적용 (CHATBOT 모드에서는 제한적)
  
- [x] **CAPABILITIES → CARET_CAPABILITIES.json**
  - [x] AI 능력 설명 부분 분석  
  - [x] Caret의 CHATBOT/AGENT 구분에 맞게 재구성
  
- [x] **RULES → CARET_BEHAVIOR_RULES.json**
  - [x] 행동 규칙 분석
  - [x] Caret 철학(예의 바름, 효율성 등)과 통합
  
- [x] **OBJECTIVE → CARET_TASK_OBJECTIVE.json**
  - [x] 작업 목표 설정 부분 분석
  - [x] 기존 CARET_TODO_MANAGEMENT와의 중복 제거
  
- [x] **ACT_VS_PLAN → 분석 후 결정**
  - [x] cline의 ACT_VS_PLAN 모드가 Caret의 CHATBOT/AGENT와 충돌하는지 분석
  - [x] 충돌하지 않으면 CARET_ACTION_PLANNING.json으로 변환
  - [x] 충돌하면 Caret 철학에 맞게 완전 재설계

#### 3.3.2. 기존 컴포넌트 교차검증 및 개선
- [x] **CHATBOT_AGENT_MODES.json 개선**
  - [x] cline의 AGENT_ROLE 컴포넌트와 비교
  - [x] 누락된 중요 요소 추가
  - [x] 토큰 효율성 재검토
  
- [x] **TOOL_DEFINITIONS.json 전면 재설계**
  - [x] cline의 TOOL_USE 컴포넌트 완전 분석
  - [x] 현재 TOOL_DEFINITIONS가 너무 단순함을 인정
  - [x] cline 수준의 상세한 도구 설명 + Caret의 mode_restriction 결합
  
- [x] **CARET_TODO_MANAGEMENT.json 교차검증**
  - [x] cline의 TODO 컴포넌트와 비교
  - [x] 작업 관리 루프 기능 누락 부분 보완
  
- [x] **CARET_TASK_PROGRESS.json 교차검증**
  - [x] cline의 TASK_PROGRESS와 비교 분석
  - [x] 진행 상황 추적 기능 개선
  
- [x] **CARET_FEEDBACK_SYSTEM.json 교차검증**  
  - [x] cline의 FEEDBACK과 비교
  - [x] 피드백 수집 및 활용 방식 개선

### 3.4. [GREEN] 통합 및 검증

#### 3.4.1. JsonTemplateLoader 확장
- [x] **새로운 JSON 파일들을 지원하도록 JsonTemplateLoader 업데이트**
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
- [x] **모든 새 컴포넌트를 지원하도록 CaretJsonAdapter 확장**
- [x] **컴포넌트 간 의존성 및 순서 관리**
- [x] **CHATBOT/AGENT 모드별 컴포넌트 선택 로직 정교화**

### 3.5. [VERIFY] 최종 검증 및 비교

- [x] **`npm run test:webview` 실행**: 모든 교차검증 테스트 통과 확인
- [x] **토큰 효율성 재측정**
  ```bash
  # 기존 스크립트 업데이트하여 새 컴포넌트들 포함 측정
  node caret-scripts/token-efficiency-analyzer.js
  ```
- [x] **의미론적 동등성 수동 검증**
  - [x] 실제 대화에서 cline 모드 vs caret 모드 비교
  - [x] 핵심 기능 (파일 편집, 도구 사용, 작업 관리) 동등성 확인
- [x] **성능 비교**
  - [x] 프롬프트 생성 속도 비교
  - [x] 메모리 사용량 비교

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

## 5. 🚨 긴급: Luke 통합테스트 결과 - 도구 시스템 치명적 결함 발견

### 5.1 현재 상황
- **문제**: Luke의 통합테스트에서 모든 Cline 기본 기능 실패
- **원인**: JSON 시스템이 도구 파라미터 정보 누락으로 AI가 올바른 도구 호출 불가
- **영향**: 브라우저, 터미널, 파일 편집 등 핵심 기능 모두 작동 안함

### 5.2 📋 도구 시스템 긴급 수정 계획

#### 🎯 Phase 5 최종 완료를 위한 추가 작업

**5.2.1 [CRITICAL] 도구 시스템 문제 해결**
*(기존 3.3.2의 'JSON 재설계' 방안보다 더 근본적인 해결책으로, 도구 시스템에 한해 JSON화를 포기하고 Cline 원본을 사용하는 것으로 계획을 수정함)*

- [x] **문제 분석 완료**: `t06-phase6-tool-system-analysis.md` 보고서 작성 ✅
- [x] **해결 방안 결정**: 선택적 JSON 적용 (도구는 Cline 원본 사용) ✅
- [x] **CaretJsonAdapter 수정**: 도구 시스템을 Cline 원본으로 교체
  ```typescript
  // Concept Code - 구현 방향 예시
  // CARET_TOOL_SYSTEM 제거, Cline 원본 도구 시스템 통합
  const sectionNames = [
    'BASE_PROMPT_INTRO',
    'CHATBOT_AGENT_MODES', 
    'CARET_SYSTEM_INFO',
    'CARET_CAPABILITIES',
    'CARET_USER_INSTRUCTIONS',
    // CARET_TOOL_SYSTEM 제거 → Cline 원본 사용
    context.tools ? await getClineToolsSection(context) : null,
    'CARET_FILE_EDITING',
    'CARET_BEHAVIOR_RULES',
    'CARET_TASK_OBJECTIVE',
    'CARET_ACTION_STRATEGY',
    // ... 나머지 JSON 컴포넌트들
  ];
  ```

**5.2.2 [HIGH] 모드 전환 로직 수정 + 디버그 로깅**  
- [x] **모드 매핑 확인**: UI CHATBOT/AGENT ↔ 백엔드 프롬프트 시스템 연동
- [x] **포괄적 디버그 로깅 추가**:
  ```typescript
  // Concept Code - 디버그 로깅 구현 방향
  // CaretJsonAdapter.ts에 로깅 추가
  console.log(`[CaretJsonAdapter] 🎯 Mode: ${context.mode}, isChatbotMode: ${isChatbotMode}`);
  console.log(`[CaretJsonAdapter] 📋 Selected sections:`, sectionNames);
  
  // 각 섹션별 로딩 상태
  for (const name of sectionNames) {
    const template = this.loader.getTemplate<any>(name);
    console.log(`[CaretJsonAdapter] 📄 ${name}: ${template ? '✅ Loaded' : '❌ Missing'}`);
    if (template) {
      console.log(`[CaretJsonAdapter] 📝 ${name} content preview:`, 
        JSON.stringify(template).substring(0, 100) + '...');
    }
  }
  
  // 최종 프롬프트 정보
  console.log(`[CaretJsonAdapter] 🚀 Final prompt parts count: ${promptParts.length}`);
  console.log(`[CaretJsonAdapter] 📊 Final prompt length: ${finalPrompt.length} chars`);
  ```
- [ ] **모드 전환 플로우 로깅**:
  ```typescript
  // PromptSystemManager에서 모드 선택 로깅
  console.log(`[PromptSystemManager] 🔄 Mode selection - Input: ${mode}`);
  console.log(`[PromptSystemManager] 🔄 Using adapter: ${adapterName}`);
  
  // 프론트엔드 모드 전환 이벤트 로깅
  console.log(`[Frontend] 🎚️ Mode switched to: ${newMode}`);
  console.log(`[Frontend] 🎚️ Sending mode change to backend...`);
  ```
- [ ] **프롬프트 생성 전체 과정 로깅**:
  ```typescript
  // 프롬프트 생성 시작부터 완료까지 전체 흐름
  console.log(`[SystemPrompt] 🏁 Starting prompt generation`);
  console.log(`[SystemPrompt] 📋 Context:`, {
    mode: context.mode,
    providerInfo: context.providerInfo?.name,
    mcpServers: context.mcpHub?.getServers()?.length || 0,
    focusChain: context.focusChainSettings?.enabled
  });
  console.log(`[SystemPrompt] ✅ Prompt generation completed`);
  ```

**5.2.3 [VERIFY] 전체 시스템 검증**

**A. 도구 시스템 검증**
- [ ] **모든 19개 도구 파라미터 검증**:
  - [ ] `ask_followup_question` (question 필수)
  - [ ] `browser_action` (action 필수)
  - [ ] `execute_command` (command, requires_approval 필수)
  - [ ] `read_file` (path 필수)
  - [ ] `write_to_file` (path, content 필수)
  - [ ] `replace_in_file` (path, search, replace 필수)
  - [ ] `list_files` (path 필수)
  - [ ] `search_files` (path, pattern 필수)
  - [ ] `list_code_definition_names` (path 필수)
  - [ ] `attempt_completion` (result 필수)
  - [ ] `focus_chain` (Focus Chain 활성화 시)
  - [ ] 기타 MCP, 모델별 도구들

**B. 모드 시스템 전면 검증**
- [ ] **UI → 백엔드 모드 전환**:
  - [ ] UI에서 CHATBOT 선택 → 백엔드 CHATBOT 모드로 인식
  - [ ] UI에서 AGENT 선택 → 백엔드 AGENT 모드로 인식
  - [ ] 설정 영속성: 재시작 후에도 모드 유지
- [ ] **AI 모드 인식**:
  - [ ] CHATBOT 모드: AI가 "CHATBOT 모드" 또는 "대화형 모드"로 응답
  - [ ] AGENT 모드: AI가 "AGENT 모드" 또는 "자율 실행 모드"로 응답
  - [ ] ❌ Cline 모드로 응답하지 않음 (PLAN/ACT 언급 금지)

**C. JSON 프롬프트 시스템 검증**
- [ ] **모든 JSON 컴포넌트 로딩 확인**:
  - [ ] `CHATBOT_AGENT_MODES.json` 로딩 및 적용
  - [ ] `CARET_SYSTEM_INFO.json` 로딩 및 적용
  - [ ] `CARET_CAPABILITIES.json` 로딩 및 적용
  - [ ] `CARET_USER_INSTRUCTIONS.json` 로딩 및 적용
  - [ ] `CARET_FILE_EDITING.json` 로딩 및 적용
  - [ ] `CARET_BEHAVIOR_RULES.json` 로딩 및 적용
  - [ ] `CARET_TASK_OBJECTIVE.json` 로딩 및 적용
  - [ ] `CARET_ACTION_STRATEGY.json` 로딩 및 적용
  - [ ] `CARET_TODO_MANAGEMENT.json` 로딩 및 적용
  - [ ] `CARET_TASK_PROGRESS.json` 로딩 및 적용
  - [ ] `CARET_FEEDBACK_SYSTEM.json` 로딩 및 적용
  - [ ] `CARET_MCP_INTEGRATION.json` 로딩 및 적용 (MCP 서버 있을 시)

**D. 모드별 차별화 검증**
- [ ] **CHATBOT 모드 제한사항**:
  - [ ] 파일 수정 도구 사용 불가 (write_to_file, replace_in_file)
  - [ ] 명령 실행 불가 (execute_command)
  - [ ] 브라우저 사용 불가 (browser_action)
  - [ ] 읽기 전용 도구만 사용 (read_file, list_files, search_files)
- [ ] **AGENT 모드 전체 기능**:
  - [ ] 모든 도구 사용 가능
  - [ ] 파일 수정, 명령 실행, 브라우저 사용 모두 가능

**E. 통합 기능 검증**
- [ ] **실제 사용 시나리오 테스트**:
  - [ ] 파일 읽기 → 분석 → 수정 → 저장 전체 플로우
  - [ ] 웹 검색 → 브라우저 사용 → 정보 수집 플로우
  - [ ] 명령 실행 → 결과 확인 → 후속 작업 플로우
  - [ ] 사용자 질문 → 추가 질문 → 답변 제공 플로우

**F. 성능 및 안정성 검증**
- [ ] **프롬프트 생성 성능**:
  - [ ] 생성 시간 < 500ms
  - [ ] 메모리 사용량 정상
  - [ ] 에러 로그 없음
- [ ] **토큰 효율성**:
  - [ ] JSON 컴포넌트들이 원본 대비 토큰 절약 효과
  - [ ] 전체 프롬프트 크기 적정 수준 유지

**G. 디버그 로깅 검증**
- [ ] **로깅 출력 확인**:
  - [ ] CaretJsonAdapter 로깅: 모드, 섹션 선택, 로딩 상태 출력
  - [ ] PromptSystemManager 로깅: 어댑터 선택 과정 출력  
  - [ ] Frontend 로깅: 모드 전환 이벤트 출력
  - [ ] SystemPrompt 로깅: 전체 생성 과정 출력
- [ ] **로깅 정확성 확인**:
  - [ ] 로그 출력 시점이 올바른지
  - [ ] 로그 내용이 실제 동작과 일치하는지
  - [ ] 문제 발생 시 원인 추적 가능한지
- [ ] **Luke 로그 분석**:
  - [ ] Luke가 제공한 기존 로그와 비교
  - [ ] 새로운 로그로 문제점 명확히 식별 가능한지
  - [ ] "AGENT MODE" vs 실제 선택 모드 불일치 원인 파악

**5.2.4 [INTEGRATION] Luke 재테스트**
- [x] **수정사항 커밋**: 도구 시스템 긴급 수정 ✅
- [x] **Luke에게 재테스트 요청**: 모든 기능 정상 작동 확인 ✅
- [x] **Luke 피드백 수집**: 통합 테스트 결과 분석 완료 ✅

### 5.3 예상 소요 시간
- **도구 시스템 수정**: 2-3시간 (Cline 원본 통합)
- **모드 전환 수정**: 1-2시간 (디버깅 및 로직 수정)  
- **검증 및 테스트**: 1시간
- **총 예상 시간**: 4-6시간

### 5.4 ⚠️ Phase 5 완료 조건 (Luke 피드백 반영 수정)
- [x] cline-latest의 13개 컴포넌트 중 **단순한 것들만** Caret JSON으로 변환 ✅
- [x] **도구 시스템 구조**: Cline 원본 통합 (구조적으로 완료) ✅
- [x] **디버그 로깅**: CaretJsonAdapter, PromptSystemManager, ModeSystemToggle 상세 로깅 ✅
- [x] **코드 구현**: Phase 5.2.1, 5.2.2 완료 및 커밋 ✅
- [x] 교차검증 테스트 통과 (도구 부분 제외) ✅
- [x] 토큰 효율성 확보 (JSON 적용 부분만) ✅

**🚨 Luke 테스트에서 발견된 미완료 항목들:**
- [ ] **모드 전달 체인**: UI CHATBOT/AGENT → AI 모드 인식 (context.mode undefined 문제) ❌  
- [ ] **Cline 원본 호환성**: cline-latest와 실제 동작 비교 검증 (추정: 차이 존재) ❌
- [ ] **브라우저 액션**: button.approve 버튼 반응 없음 (Caret/Cline 공통) ❌
- [ ] **터미널 실행**: CWD 경로 문제로 터미널 즉시 종료 (Caret/Cline 공통) ❌

**📊 Phase 5 완료도**: **구조적 60% 완료** (코드/로깅 구조는 완성, 실제 기능 동작은 미완료)

---

## 6. 🚨 Luke 피드백 분석 및 대응 계획 (추가 문제 발견)

### 6.1 현황 분석: Phase 5 구현 한계 확인

**⚠️ 중요 발견**: Luke의 통합 테스트 결과, Phase 5에서 "100% 호환성 확보"라고 표시한 것이 **부정확**함을 확인. 
**Caret과 Cline 모드 모두에서 근본적인 문제들이 여전히 존재**함.

#### 6.1.1 Caret 모드 문제점
- **모드 전달 실패**: `Mode: undefined, isChatbotMode: 항상 false`
- **AI 모드 인식 오류**: CHATBOT 모드인데 "Plan 모드"라고 응답
- **모드 매핑 체인 단절**: UI CHATBOT/AGENT → 백엔드 context.mode 전달 실패

#### 6.1.2 Cline 모드 문제점  
- **로깅 부재**: PromptSystemManager 로그가 찍히지 않음
- **원본 대비 동작 차이**: cline-latest 원본과 비교 검증 필요

#### 6.1.3 공통 문제점 (Caret/Cline 모드 공통)
- **브라우저 액션**: button.approve 버튼 클릭 반응 없음
- **터미널 실행**: CWD 경로 문제로 터미널 즉시 종료
- **기능 안정성**: 파일 쓰기는 작동, 하지만 브라우저/터미널 불안정

### 6.2 근본 원인 분석

#### 6.2.1 모드 전달 체인 분석 필요
```
UI (ModeSystemToggle) 
  ↓ gRPC (SetPromptSystemMode)
  ↓ Backend (PromptSystemManager)
  ↓ CaretJsonAdapter (context.mode)
  ↓ AI Prompt (실제 모드 인식)
```
**추정 문제점**: UI → Backend 모드 전달 과정에서 `context.mode`가 undefined로 설정됨

#### 6.2.2 cline-latest 원본 비교 필요
- **Cline 어댑터**: 현재 ClineLatestAdapter가 실제 cline-latest와 동일한지 검증
- **도구 시스템**: 브라우저/터미널 도구가 cline-latest 원본과 동일하게 구현되었는지
- **프롬프트 구조**: 전체 시스템 프롬프트 구조가 원본과 일치하는지

### 6.3 🎯 다음 세션 작업 계획 (우선순위별)

#### [CRITICAL-1] 모드 전달 체인 수정
- [ ] **gRPC 서비스 분석**: SetPromptSystemMode 구현 확인
- [ ] **PromptSystemManager 수정**: modeSystem과 mode 분리 처리
- [ ] **CaretJsonAdapter 수정**: context.mode undefined 처리 로직
- [ ] **모드 매핑 로직**: UI CHATBOT/AGENT → context.mode 정확한 전달

#### [CRITICAL-2] cline-latest 원본 비교 분석
- [ ] **원본 Cline 설치**: 별도 환경에서 cline-latest 원본 테스트
- [ ] **동작 비교**: 브라우저, 터미널, 파일 작업 등 동일 시나리오 테스트
- [ ] **프롬프트 비교**: 원본 vs 현재 구현 시스템 프롬프트 diff 분석
- [ ] **차이점 식별**: 누락된 기능이나 구현 차이 문서화

#### [HIGH-3] Cline 어댑터 검증 및 수정
- [ ] **ClineLatestAdapter 분석**: 현재 구현이 원본과 일치하는지 확인
- [ ] **도구 파라미터 검증**: 브라우저, 터미널 도구 파라미터가 원본과 동일한지
- [ ] **승인 플로우 확인**: button.approve 버튼 액션이 올바르게 연결되었는지

#### [MEDIUM-4] 환경 설정 문제 해결
- [ ] **CWD 경로 문제**: 터미널 작업 디렉토리 설정 확인
- [ ] **권한 문제**: 브라우저 실행 권한 및 설정 확인
- [ ] **로깅 개선**: 모든 모드에서 일관된 디버그 로깅

### 6.4 검증 기준 (수정)

#### 6.4.1 Caret 모드 검증 기준
- [ ] **모드 인식**: AI가 "CHATBOT 모드" 또는 "AGENT 모드"로 정확히 응답
- [ ] **도구 제한**: CHATBOT 모드에서 파일 수정/명령 실행 제한 작동
- [ ] **로깅 정확성**: `context.mode`가 올바른 값으로 로그에 출력

#### 6.4.2 Cline 모드 검증 기준  
- [ ] **원본 동등성**: cline-latest 원본과 100% 동일한 동작
- [ ] **프롬프트 일치**: 시스템 프롬프트가 원본과 동일
- [ ] **도구 호환성**: 모든 도구 기능이 원본과 동일하게 작동

#### 6.4.3 공통 기능 검증 기준
- [ ] **브라우저 자동화**: "브라우저 열어서 구글 검색" 시나리오 완전 작동
- [ ] **터미널 명령**: "노드 버전 알려줘" 시나리오 완전 작동  
- [ ] **파일 작업**: 읽기/쓰기/수정 모든 파일 작업 안정적 동작

### 6.5 Phase 5 완료 조건 (최종 수정)

- [x] **도구 시스템 구조**: Cline 원본 통합 완료 ✅
- [x] **디버그 로깅**: 상세 로깅 시스템 구축 완료 ✅  
- [x] **JSON 컴포넌트**: 단순 컴포넌트들 JSON 변환 완료 ✅
- [ ] **모드 전달 체인**: UI → AI 모드 인식 완전 작동 ❌
- [ ] **Cline 호환성**: cline-latest 원본과 100% 동등성 확보 ❌
- [ ] **핵심 기능**: 브라우저/터미널/파일 작업 안정성 확보 ❌

**🚨 결론**: Phase 5는 **부분 완료** 상태이며, 모드 전달과 원본 호환성 문제가 **다음 세션에서 최우선 해결** 필요.

---

## 7. 🔄 Phase 6으로 이관

**Phase 5 완전 완료 후** 진행할 안정화 및 최적화 작업을 Phase 6으로 이관합니다.
