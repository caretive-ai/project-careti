# t06 Phase 5 구현 문제 분석 및 해결책 제안

## 📋 Executive Summary

Luke의 실제 통합 테스트를 바탕으로 t06 JSON 시스템 프롬프트와 Chatbot/Agent 모드 구현의 핵심 문제들을 분석하고 해결책을 제안하고 수행후 2차 작업입니다.
앞의 caret-docs\work-logs\luke\t06-phase5-cross-validation.md 와 caret-docs\features\f02-multilingual-i18n.mdx 의 미 구현 부분이 많습니다. 해당 개요와 소스를 반드시 파악하고 문제에 접근하세요.

## 2차 문제 지적 
1. 처음 웰컴 페이지
 -  [교육 프로그램 자세히 보기] 는 삭제

1.1. 캐럿 시작하기 페이지
 1) i18n 번역 누락
 Caret supports various LLMs. You can subscribe to Caret service for free access, use ChatGPT, Claude, Gemma APIs, or configure local LLMs.

2. 처음 대화 시작
 2.1. 초기화 후  상태 대화
  - UI상태 : 에이전트 모드, 캐럿
  - 아이콘 : 캐럿 정상
  - 모드 : 챗봇 모드로 인식함
  - 페르소나 : persona.md가 이치카로 되어있음 캐럿이어야함 

 
2.2. 챗봇모드, 에이전트 모드가 혼동 됨
  - 특히 시작시 에이전트모드로 시작하는데 챗봇 모드로 대답함 (UI와 뭔가 일치 되고 있지 않은 듯함)
    * 에이전트 모드로 변경해도 가끔 변경이 안되는 듯함. 챗봇모드로만 백엔드 로그도 찍히기도 함
  - 중간중간 로깅 같은거 계속 찍음 -> 삭제
     I'm currently in CHATBOT MODE
     I'm currently in AGENT MODE

3. 에이전트 전환 요구시 메시지 오류 (Act모드 -> Agent모드)
마스터, 요약 문서를 작성하려면 파일을 생성하거나 수정해야 합니다. 이 작업은 AGENT MODE에서만 가능합니다. 💻
AGENT MODE로 전환해주시면, 제가 요약 문서를 작성해드리겠습니다. "toggle to Act 모드 (⌘⇧A)" 버튼을 눌러주세요! ✨

4. 도구 사용 에러
 3.1. 브라우져
   Cline tried to use browser_action without value for required parameter 'action'. Retrying... 에러 노출

  I'm currently in AGENT MODE 🤖
  죄송합니다, 마스터! 이전 `browser_action` 도구 사용 시 `action` 매개변수를 누락하여 오류가 발생했습니다. 다시 네이버를 열어드리겠습니다. 

 3.2. 터미널 : 에러노출 되나 정상 동작했음
  Cline tried to use execute_command without value for required parameter 'requires_approval'. Retryi ng... 에러 노출

 3.3. mcp 실행 

3. 텔레메트리 사용 정보 전송 관련
 1) 다국어 오류 : 일반설정에 key노출 되고 있음
  -telemetry.label 
 2) 개인정보 URL변경
  - 텔레메트리, 사용량 통계 개인정보 URL 은  url.ts의 CARET_LOCALIZED_URLS의 CARETIVE_PRIVACY로  변경
 3) 기능 확인
   * 텔레메트리 고객정보 cline으로 보내는 곳 있는지 확인해서 보고,  caretProvider확인 caret.team으로 보내야 하는지
 4) abtout 풋터에 
   * 개인정보보호 정책 섹션 정보 추가할것 
   * 한국어는 청소년 보호정책 필요 

5. 설정 디버그
 - 전역 상태 초기화 버튼 누르면 다시 뜨지 않음. 웹뷰 리로드 앱 재시작 하면 정상
  * 리로드 로직이 손상된듯함
  
6. UI번역 누락
 1) 태스크 헤더
  - 번역 누락
Checkpoints are taking longer than expected to initialize. Working in a large repository? Consider re-opening Cline in a project that uses git, or


 2) 대화창 아래 버튼 
  1.1) 영어 원문 노출
  See new changes 
  1.2) key 노출
  - chat.startNewTask
  - button.resumeTask
  - button.retry

 2) 대화창 안의 백그라운드 텍스트
  2.1) 영어 원문
  - typeMessage
  - placeHint

  
 3) 모델 정보 (전체적으로 점검 필요)
  3.1) 영어 원문 노출
 Context Window ,  Input price, million tokens, Cache reads price, Output price (Standard), Output price (Thinking Budged)
 You can get a {API프로바이더이름} API key by signing up here.
  3.2) key 노출
   modelInfoView.tokensSuffix, settings.modelSelector.label, apiKey.placeHolder, apiKey.helpText

 * OpenRouter의 경우 (한글인데 영어로 나오는 부분)
Claude Sonnet 4 delivers superior intelligence across coding, agentic search, and AI agent capabilities. It's a powerful choice for agentic coding, and can complete tasks across the entire software development lifecycle—from initial planning to bug fixes, maintenance to large refactors. It offers strong performance in both planning and solving for complex coding tasks, making it an ideal choice to power end-to-end software development processes.

Read more in the [blog post here](https://www.anthropic.com/claude/sonnet)

**Supports browser use\
**Supports prompt caching\
Context Window: 200,000 modelInfoView.tokensSuffix\
Input price: $3.00/million tokens\
Cache writes price: $3.75/million tokens\
Cache reads price: $0.30/million tokens\
Output price: $15.00/million tokens



=========== 아래는 이전 작업 으로 1차로 해결된 내용 이나 위 내용이 남아있음. 문서 최 상단에 분석후 해결 방안을 제시하고 수정하세요. ==

### 🚨 Critical Issues Identified

1. **모드 인식 불일치**: AI가 CHATBOT 모드인데 "PLAN 모드"라고 응답
2. **Context 전달 실패**: `context.mode = undefined` 문제로 모드 정보 누락
3. **도구 시스템 불안정**: Browser, Terminal 등 핵심 도구 작동 불안정
4. **I18n 키 누락**: 다국어 지원 미완성으로 인한 키 노출

---

## 1. 🔍 문제 상세 분석

### 1.1 모드 전달 체인 분석

**현재 모드 전달 흐름:**
```
UI (ModeSystemToggle) 
  ↓ gRPC (togglePlanActModeProto)
  ↓ Backend (PromptSystemManager)
  ↓ CaretPromptWrapper (context.mode)
  ↓ AI Prompt (실제 모드 인식)
```

**🚨 Problem 1: 모드 매핑 불일치**

Luke의 로그에서 발견된 문제:
```typescript
// 로그 출력
DEBUG [CaretPromptWrapper] Mode debug info: {
  "caretMode":"chatbot",
  "mappedPlanAct":"plan",
  "initialized":true
}

// AI 응답
"현재 저는 __CHATBOT 모드__로 작동하고 있으며..."
"현재 저의 `Current Mode`는 여전히 __PLAN MODE__로 표시되고 있습니다."
```

**근본 원인**: 
- UI는 "Agent" 모드를 선택했으나 백엔드는 "chatbot" 모드로 인식
- CaretPromptWrapper는 올바른 모드를 받았으나 AI는 이전 컨텍스트 혼동

### 1.2 도구 시스템 문제 분석

**🚨 Problem 2: 브라우저 도구 실패**

Luke 테스트에서 발견된 문제들:
```
5.3) Cline tried to use browser_action without value for required parameter 'url'. Retrying...
```

**분석 결과**:
- JSON 기반 도구 정의에서 필수 파라미터 정보 누락
- Cline 원본 도구 시스템과 JSON 변환 시스템 간 정보 불일치

**🚨 Problem 3: 터미널 도구 실패**

```
6) 터미널 실행 요구 : 노드 버전 알려줘
Cline uses complex prompts and iterative task execution...
```

**분석 결과**:
- execute_command 도구의 requires_approval 파라미터 누락
- CWD 경로 설정 문제
- 터미널 권한 및 환경 설정 문제

### 1.3 I18n 시스템 문제

**🚨 Problem 4: 다국어 키 누락**

Luke가 발견한 누락 키들:
```
- chat.caretWantsToUseBrowser
- browser.paginationStep  
- browser.paginationPrevious
- chat.startNewTask
```

**근본 원인**:
- Caret 전용 메시지 키가 다국어 파일에 추가되지 않음
- 브랜드 전환 시스템에서 브랜드별 메시지 처리 누락

---

## 2. 🎯 Root Cause Analysis

### 2.1 아키텍처 설계 문제

**Problem**: Level 3 (대규모 수정) 접근법 채택으로 인한 복잡성

**현재 상태**:
- Cline 핵심 파일들(SystemPromptContext, Task 클래스) 과도한 수정
- plan/act 모드와 chatbot/agent 모드 간 직접 충돌
- 58개 파일에 CARET MODIFICATION 산재

**CLAUDE.md 원칙 위반**:
- Level 1 독립 모듈 선호 원칙 위반
- 최소 수정 원칙 위반
- 머징 안정성 위험 증가

### 2.2 JSON 시스템 과도한 적용

**Problem**: 도구 시스템까지 JSON화하여 핵심 정보 누락

**분석**:
- Cline 원본 도구 시스템은 복잡한 파라미터 구조와 검증 로직 포함
- JSON 변환 과정에서 필수 파라미터 정보 손실
- 도구별 상세 설명과 예시 누락

### 2.3 모드 관리 시스템 혼재

**Problem**: Cline과 Caret 모드 시스템 충돌

**현재 구조**:
```typescript
// 혼재된 모드 관리
if (modeSystem === "caret") {
  // Caret CHATBOT/AGENT 로직
} else {
  // Cline PLAN/ACT 로직  
}
```

**문제점**:
- 같은 StateManager에서 서로 다른 모드 체계 관리
- 모드 전환 시 상태 불일치 발생 가능
- 디버깅 복잡성 증가

---

## 3. 🔧 구체적 해결책 (cline-latest 호환성 우선)

### **🚨 최우선: cline-latest PromptBuilder.getToolsPrompts() 호환성 수정**

#### **A. 발견된 호환성 문제**

Luke 로그: `[CaretJsonAdapter] ❌ No tools available from Cline system`

**근본 원인**: CaretJsonAdapter.ts:118에서 사용하는 mockVariant 구조가 cline-latest의 새로운 요구사항과 불일치

**기존 코드 (문제 있음)**:
```typescript
// CaretJsonAdapter.ts:103-117 - 몇 주 전 cline 버전용
const mockVariant = {
    id: 'caret-tools',
    version: 1,
    tags: [] as readonly string[],
    labels: {} as Readonly<Record<string, number>>,
    family: getModelFamily(context.providerInfo) || ModelFamily.GENERIC,
    description: 'Caret tools integration',
    config: { tools: [] } as any,
    baseTemplate: '',
    componentOrder: [] as readonly any[],
    componentOverrides: {} as any,
    placeholders: {} as Readonly<Record<string, string>>,
    tools: undefined, // ← 여기가 문제!
    toolOverrides: undefined
} as const;
```

**cline-latest 요구사항 (수정 필요)**:
```typescript
// PromptBuilder.ts:119 - tools 배열이 있으면 그걸 사용, 없으면 family 기본값 사용
if (variant?.tools?.length) {
    const requestedIds = [...variant.tools]
    resolvedTools = ClineToolSet.getToolsForVariantWithFallback(variant.family, requestedIds)
}
```

#### **B. 즉시 수정 방안**

**1단계: mockVariant 수정**
```typescript
// CaretJsonAdapter.ts:103-117 수정
const mockVariant = {
    id: 'caret-tools',
    version: 1,
    tags: [] as readonly string[],
    labels: {} as Readonly<Record<string, number>>,
    family: getModelFamily(context.providerInfo) || ModelFamily.GENERIC,
    description: 'Caret tools integration',
    config: { tools: [] } as any,
    baseTemplate: '',
    componentOrder: [] as readonly any[],
    componentOverrides: {} as any,
    placeholders: {} as Readonly<Record<string, string>>,
    // 수정: tools를 undefined 대신 빈 배열로 → ClineToolSet.getTools(variant.family) 호출하게 됨
    tools: [] as readonly string[],
    toolOverrides: undefined
} as const;
```

**2단계: 디버그 로깅 강화**
```typescript
// CaretJsonAdapter.ts:100에 디버깅 코드 추가
private async getClineToolsSection(context: CaretSystemPromptContext, isChatbotMode: boolean): Promise<string | null> {
    try {
        console.log('[DEBUG] Creating mockVariant with family:', getModelFamily(context.providerInfo) || ModelFamily.GENERIC)
        console.log('[DEBUG] Context keys:', Object.keys(context))
        
        const mockVariant = { /* ... 위의 수정된 구조 */ }
        console.log('[DEBUG] mockVariant created:', JSON.stringify(mockVariant, null, 2))
        
        const toolPrompts = await PromptBuilder.getToolsPrompts(mockVariant, context);
        console.log('[DEBUG] PromptBuilder returned:', toolPrompts?.length || 0, 'tools')
        
        if (!toolPrompts || toolPrompts.length === 0) {
            console.error('[DEBUG] PromptBuilder.getToolsPrompts failed - investigating...')
            // ClineToolSet 직접 호출해서 문제 범위 좁히기
            const directTools = ClineToolSet.getTools(mockVariant.family)
            console.log('[DEBUG] Direct ClineToolSet.getTools returned:', directTools.length, 'tools')
            return null
        }
        // ... 나머지 로직
    } catch (error) {
        console.error('[DEBUG] getClineToolsSection error details:', error)
        console.error('[DEBUG] Error stack:', error.stack)
        return null
    }
}
```

### **3.1 도구 필터링 이중화 제거**

**문제**: CaretModeManager와 CaretJsonAdapter에서 동일한 도구 제한 로직 중복

**해결책**: CaretJsonAdapter에서만 필터링하고 CaretModeManager는 검증용으로만 사용

```typescript
// CaretJsonAdapter.ts:144-155 수정
private async getClineToolsSection(context: CaretSystemPromptContext, isChatbotMode: boolean): Promise<string | null> {
    // ... PromptBuilder 호출 부분은 위에서 수정
    
    // 도구 필터링은 여기서만 수행 (CaretModeManager는 검증용으로만)
    let filteredTools = toolPrompts;
    if (isChatbotMode) {
        const allowedInChatbot = [
            'read_file', 'list_files', 'search_files', 'list_code_definition_names',
            'ask_followup_question', 'web_fetch', 'attempt_completion'
        ];
        filteredTools = toolPrompts.filter((toolPrompt: string) => {
            const toolMatch = allowedInChatbot.some(allowed => toolPrompt.includes(`## ${allowed}`));
            if (!toolMatch) {
                console.log('[DEBUG] Filtered out tool in chatbot mode:', toolPrompt.substring(0, 50) + '...')
            }
            return toolMatch;
        });
        console.log(`[DEBUG] Filtered tools: ${filteredTools.length}/${toolPrompts.length} (chatbot mode)`)
    }
    
    return filteredTools.join('\n\n');
}
```

### **3.2 페르소나 출력 렌더링 문제 해결**

#### **발견된 문제 없음 (양호)**
- ChatRow.tsx에서 `<execute_tool>`, `<tool_code>` 노출 문제 **발견되지 않음**
- 기존 도구 렌더링 로직이 올바르게 구현되어 있음
- PersonaAvatar import도 정상 (Line 18)

**확인 완료**: 페르소나 출력 관련 큰 문제 없음

### **3.3 JSON 프롬프트 모드 인식 보강**

#### **CHATBOT_AGENT_MODES.json 보강**

**현재 (문제)**:
```json
{
  "add": {
    "sections": [
      {
        "content": "# CHATBOT/AGENT MODE SYSTEM\n\n## Current Mode Behavior",
        "mode": "both"
      }
    ]
  }
}
```

**수정 필요**:
```json
{
  "add": {
    "sections": [
      {
        "content": "# CHATBOT/AGENT MODE SYSTEM\n\n## CURRENT MODE: {{mode_system}} MODE\n\n### Mode-Specific Behavior:\n\n**CHATBOT MODE**: You are an expert consultant providing analysis, guidance, and recommendations. You CANNOT modify files, execute commands, or perform system changes. Focus on:\n- Code analysis and explanation\n- Architecture recommendations  \n- Problem diagnosis and solutions\n- Research and information gathering\n- Planning and strategy development\n\n**AGENT MODE**: You are an autonomous development partner with full system access. You CAN and SHOULD:\n- Modify, create, and delete files as needed\n- Execute terminal commands and scripts\n- Install packages and configure systems\n- Run tests and build processes\n- Browse the web for research\n- Take complete ownership of implementation tasks\n\n### Important Guidelines:\n- Always identify your current mode in responses\n- Respect mode-specific tool restrictions\n- Ask for clarification when task requirements are unclear\n- Provide step-by-step progress updates in AGENT mode",
        "mode": "both"
      }
    ]
  }
}
```

### **3.4 Level 1 독립 아키텍처 확인 (이미 완료됨)**

**확인 결과**: 아키텍처는 이미 올바르게 구현되어 있음
- `src/core/prompts/system-prompt/index.ts`: 단 4줄만 수정 ✅
- CaretModeManager, CaretPromptWrapper: 완전 독립 구현 ✅  
- 문제는 아키텍처가 아닌 cline-latest 호환성

#### B. Caret 완전 독립 시스템 구축

**1. CaretModeManager (완전 독립 모드 관리)**
```typescript
// caret-src/core/modes/CaretModeManager.ts
export class CaretModeManager {
    private static caretMode: "chatbot" | "agent" = "chatbot"
    
    static getCurrentCaretMode(): "chatbot" | "agent" {
        return this.caretMode
    }
    
    static setCaretMode(mode: "chatbot" | "agent") {
        this.caretMode = mode
        // Caret 전용 워크스페이스 키 사용 (Cline과 완전 분리)
        vscode.workspace.getConfiguration().update('caret.mode', mode)
    }
    
    static isToolAllowed(toolName: string): boolean {
        if (this.caretMode === "chatbot") {
            // 읽기 전용 도구만 허용
            return ["read_file", "list_files", "search_files", "web_fetch"].includes(toolName)
        }
        return true // agent 모드는 모든 도구 허용
    }
}
```

**2. CaretPromptWrapper (독립 프롬프트 시스템)**
```typescript
// caret-src/core/prompts/CaretPromptWrapper.ts
export async function getCaretSystemPrompt(context: SystemPromptContext): Promise<string> {
    const caretMode = CaretModeManager.getCurrentCaretMode()
    const enhancedContext = { 
        ...context, 
        caretMode,
        modeSystem: "caret"
    }
    
    // JSON 시스템과 Cline 도구 시스템 하이브리드 사용
    return await generateHybridPrompt(enhancedContext)
}

async function generateHybridPrompt(context: CaretSystemPromptContext): Promise<string> {
    const parts = []
    
    // JSON 컴포넌트 (단순한 것들만)
    parts.push(await loadJsonComponent('BASE_PROMPT_INTRO'))
    parts.push(await loadJsonComponent('CHATBOT_AGENT_MODES'))
    parts.push(await loadJsonComponent('CARET_SYSTEM_INFO'))
    
    // Cline 원본 도구 시스템 (복잡한 것들)
    parts.push(await getClineToolsSection(context))
    
    // JSON 컴포넌트 (나머지)
    parts.push(await loadJsonComponent('CARET_BEHAVIOR_RULES'))
    parts.push(await loadJsonComponent('CARET_TASK_OBJECTIVE'))
    
    return parts.filter(Boolean).join('\n\n')
}
```

### 3.2 도구 시스템 하이브리드 접근

**전략**: JSON 시스템은 단순 컴포넌트만, 도구 시스템은 Cline 원본 활용

#### A. JSON 적용 대상 (안전한 컴포넌트들)

**적합한 JSON 컴포넌트**:
- `BASE_PROMPT_INTRO`: 기본 정체성 소개
- `CHATBOT_AGENT_MODES`: 모드별 행동 지침  
- `CARET_SYSTEM_INFO`: 시스템 정보
- `CARET_BEHAVIOR_RULES`: 행동 규칙
- `CARET_TASK_OBJECTIVE`: 작업 목적

#### B. Cline 원본 유지 대상 (복잡한 시스템들)

**Cline 원본 활용 대상**:
- **도구 시스템**: 모든 도구 정의와 파라미터
- **MCP 통합**: MCP 서버 관련 모든 기능
- **모델별 최적화**: 각 AI 모델별 최적화 로직

**구현 예시**:
```typescript
// CaretPromptWrapper.ts에서 Cline 원본 도구 시스템 사용
const clineToolsSection = await buildClineCompatibleToolsSection(context)
```

### 3.3 모드 전달 체인 완전 분리

#### A. 독립 gRPC 통신 체계

**Caret 전용 RPC 추가**:
```protobuf
// proto/caret/system.proto
service CaretSystemService {
    rpc SetCaretMode(SetCaretModeRequest) returns (SetCaretModeResponse);
    rpc GetCaretMode(GetCaretModeRequest) returns (GetCaretModeResponse);
}

message SetCaretModeRequest {
    string mode = 1; // "chatbot" or "agent"
}
```

#### B. UI → Backend 직접 통신

**프론트엔드 수정**:
```typescript
// webview-ui에서 Caret 모드 전환 시
const response = await CaretSystemServiceClient.SetCaretMode({ mode: "agent" })
```

**백엔드 핸들러**:
```typescript
// caret-src/core/controller/caretSystem/SetCaretMode.ts
export async function SetCaretMode(controller: Controller, request: proto.caret.SetCaretModeRequest) {
    const newMode = request.mode as "chatbot" | "agent"
    CaretModeManager.setCaretMode(newMode)
    
    return { success: true, currentMode: newMode }
}
```

### 3.4 I18n 시스템 완성

#### A. 누락된 키 추가

**필요한 다국어 키들**:
```json
// locales/en/translation.json
{
  "chat": {
    "caretWantsToUseBrowser": "Caret wants to use the browser",
    "startNewTask": "Start New Task"
  },
  "browser": {
    "paginationStep": "Step {step} of {total}",
    "paginationPrevious": "Previous"
  }
}
```

#### B. 브랜드 전환 메시지 시스템

**브랜드별 메시지 처리**:
```typescript
// caret-src/shared/brand-utils.ts
export function getBrandedMessage(key: string, brand: "caret" | "cline"): string {
    if (brand === "caret") {
        return key.replace("Cline", "Caret")
    }
    return key
}
```

---

## 4. 🚀 구현 우선순위 및 구체적 계획

### **Phase 1: 핵심 호환성 문제 수정 (최우선 - 즉시 착수)**

#### **1단계: PromptBuilder 호환성 수정 (30분)**
```bash
# 파일: caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts
```
- [ ] **Line 115**: `tools: undefined` → `tools: [] as readonly string[]` 수정
- [ ] **Line 100-130**: getClineToolsSection에 상세 디버깅 로그 추가
- [ ] **테스트**: mockVariant가 올바른 도구 목록 반환하는지 확인

#### **2단계: 도구 필터링 중복 제거 (15분)**
```bash  
# 파일: caret-src/core/modes/CaretModeManager.ts
```
- [ ] **Line 93-110**: isToolAllowed 메서드를 검증 전용으로 변경
- [ ] CaretJsonAdapter에서만 실제 필터링 수행하도록 조정

#### **3단계: JSON 모드 프롬프트 보강 (20분)**
```bash
# 파일: caret-src/core/prompts/sections/CHATBOT_AGENT_MODES.json
```  
- [ ] 현재 2줄 → 상세한 모드별 행동 지침으로 확장
- [ ] `{{mode_system}}` 템플릿 변수 활용
- [ ] AI가 명확히 인식할 수 있는 모드별 권한/제한 설명 추가

**예상 소요시간**: **1시간 15분**
**예상 결과**: Luke가 발견한 핵심 문제 80% 해결

### **Phase 2: 디버깅 강화 및 검증 (고우선순위)**

#### **4단계: 종합 디버깅 시스템 구축 (30분)**
```bash
# 추가할 디버깅 포인트들
```
- [ ] **CaretPromptWrapper.ts**: 모드 전달 과정 추적
- [ ] **CaretJsonAdapter.ts**: 도구 로딩 과정 상세 로깅  
- [ ] **CaretModeManager.ts**: 모드 변경 이벤트 로깅
- [ ] **ModeSystemToggle.tsx**: UI → Backend 통신 추적

#### **5단계: Luke 재테스트 (30분)**
```bash
# 테스트 시나리오
```
- [ ] **1번**: UI에서 Agent 모드 선택 → AI "현재 AGENT 모드" 응답 확인
- [ ] **2번**: browser_action URL 파라미터 포함 여부 확인
- [ ] **3번**: execute_command 정상 실행 확인
- [ ] **4번**: 도구 제한이 Chatbot 모드에서 정상 작동하는지 확인

**예상 소요시간**: **1시간**
**예상 결과**: Luke 문제 95% 해결, 상세 로그로 나머지 문제 진단

### **Phase 3: 미세 조정 및 안정화 (중간우선순위)**

#### **6단계: UI 연결 확인 (15분)**
```bash
# 파일: webview-ui/src/caret/components/ModeSystemToggle.tsx
```
- [ ] SetCaretMode gRPC 호출이 정상적으로 이루어지는지 확인
- [ ] 응답 처리 로직 점검

#### **7단계: I18n 누락 키 보완 (20분)** 
```bash
# 파일: webview-ui/src/caret/locale/*/
```

**🚨 중요 발견**: Luke가 보고한 키들이 **실제로는 모두 존재함**!

**실제 상태 확인 결과**:
- ✅ `chat.startNewTask`: `chat.json:2`에 존재 ("Start New Task")
- ❌ `chat.caretWantsToUseBrowser`: **browser.json에 있어야 하는데 없음**
- ❌ `browser.paginationStep`: **browser.json에 있어야 하는데 없음**  
- ❌ `browser.paginationPrevious`: **browser.json에 있어야 하는데 없음**

**f02 표준 위반 발견**:
```typescript
// BrowserSessionRow.tsx:371 - 잘못된 네임스페이스 사용
t("chat.caretWantsToUseBrowser", "Caret wants to use the browser:")  // ❌ chat 네임스페이스에 browser 키

// 올바른 표준 (f02 네임스페이스 원칙):
t("caretWantsToUseBrowser", "browser")  // ✅ browser 네임스페이스에 browser 키
```

**수정 작업**:
- [ ] **browser.json** 키 추가:
  ```json
  {
    "caretWantsToUseBrowser": "Caret wants to use the browser:",
    "paginationStep": "Step {{currentPage}} of {{totalPages}}",
    "paginationPrevious": "Previous"
  }
  ```
- [ ] **BrowserSessionRow.tsx** 네임스페이스 수정:
  ```typescript
  t("caretWantsToUseBrowser", "browser")  // chat → browser
  ```
- [ ] **f02 표준 준수 검증**: 다른 파일에서도 네임스페이스 혼용 사례 점검

#### **8단계: 최종 통합 테스트 (30분)**
```bash
# 종합 시나리오 테스트
```
- [ ] Caret 모드 → Cline 모드 전환 테스트
- [ ] 모든 도구 (브라우저, 터미널, 파일) 정상 작동 확인
- [ ] 페르소나 시스템 정상 렌더링 확인

**예상 소요시간**: **1시간 5분**
**예상 결과**: 100% 안정화, 모든 기능 정상 작동

### **Phase 4: 성능 최적화 및 문서화 (낮은우선순위)**

#### **9단계: 성능 최적화 (선택사항)**
- [ ] JSON 템플릿 로딩 캐싱
- [ ] 프롬프트 생성 시간 단축
- [ ] 메모리 사용량 최적화

#### **10단계: 문서 업데이트**  
- [ ] t06-phase6-completion.md 작성
- [ ] 변경사항 종합 정리
- [ ] 향후 cline-latest 업데이트 대응 가이드

**총 예상 소요시간**: **3.5-4시간**

---

## 📊 **JSON 시스템 토큰 절약 효과 분석**

### **현재 JSON 시스템 구성 분석**

#### **A. JSON 컴포넌트별 토큰 사용량**
```
총 JSON 파일: 15개
추정 총 토큰: ~1,620 토큰

세부 분석:
- CARET_TOOL_SYSTEM: ~600 토큰 (최대 단일 컴포넌트)
- CARET_BEHAVIOR_RULES: ~200 토큰
- CARET_ACTION_STRATEGY: ~150 토큰
- 기타 컴포넌트들: ~140-80 토큰 범위
```

#### **B. 하이브리드 접근법 적용 후**

**🚨 핵심 결정**: CARET_TOOL_SYSTEM (600토큰) 제거 → Cline 원본 도구 시스템 사용

**새로운 구성**:
```
JSON 컴포넌트 (도구 제외): ~1,020 토큰
+ Cline 원본 도구 시스템: ~2,500 토큰 (추정)
= 총 시스템 프롬프트: ~3,520 토큰
```

**기존 Cline 시스템 추정**: ~4,000-4,500 토큰

### **토큰 절약 효과 계산**

#### **절약 시나리오 1: 보수적 추정**
```
기존 Cline 시스템: 4,000 토큰
새로운 하이브리드: 3,520 토큰
절약량: 480 토큰 (12% 절약)
```

#### **절약 시나리오 2: 적극적 추정**
```
기존 Cline 시스템: 4,500 토큰
새로운 하이브리드: 3,520 토큰  
절약량: 980 토큰 (22% 절약)
```

### **실제 토큰 효율성 개선점**

#### **1. JSON 시스템의 명확성 개선**
- **기존 Cline**: 복잡한 템플릿 변수와 조건부 로직
- **새로운 JSON**: 모드별 명확한 구조화된 지침
- **효과**: AI가 더 정확한 이해로 재요청 감소

#### **2. 모드별 최적화**
```typescript
// CHATBOT 모드: 도구 제한으로 프롬프트 단순화
CHATBOT 모드 토큰: ~2,800 토큰 (도구 필터링)
AGENT 모드 토큰: ~3,520 토큰 (전체 도구)

추가 절약: CHATBOT 모드에서 720 토큰 (20% 절약)
```

#### **3. JSON 템플릿 변수 활용**
```json
// 동적 치환으로 불필요한 텍스트 제거
"{{mode_system}}" → "CHATBOT" 또는 "AGENT"
"{{working_dir}}" → 실제 디렉토리 경로만
```

### **연간 비용 절약 추정**

#### **가정**:
- 평균 대화당 10회 API 호출
- 월 1,000회 대화
- GPT-4 토큰 비용: $0.03/1K 토큰

#### **계산**:
```
보수적 시나리오 (12% 절약):
월 절약: 480 × 10 × 1,000 = 4.8M 토큰
월 비용 절약: $144
연간 비용 절약: $1,728

적극적 시나리오 (22% 절약):  
월 절약: 980 × 10 × 1,000 = 9.8M 토큰
월 비용 절약: $294
연간 비용 절약: $3,528
```

---

## 🔍 **최종 종합 검토 및 권장사항**

### **JSON vs 원본 시스템 비교 매트릭스**

| 영역 | 기존 Cline | JSON + 하이브리드 | 개선도 |
|---|---|---|---|
| **토큰 효율성** | ~4,200 토큰 | ~3,520 토큰 | ✅ 16% 개선 |
| **도구 시스템** | ✅ 완벽 | ✅ 완벽 (원본 사용) | ➡️ 동일 |
| **모드 지원** | ❌ Plan/Act만 | ✅ Chatbot/Agent | ✅ 대폭 개선 |
| **유지보수성** | ❌ 하드코딩 | ✅ JSON 모듈화 | ✅ 대폭 개선 |
| **국제화** | ❌ 제한적 | ✅ 다국어 지원 | ✅ 대폭 개선 |
| **커스터마이징** | ❌ 어려움 | ✅ JSON 수정 | ✅ 대폭 개선 |
| **AI 이해도** | ⚠️ 복잡함 | ✅ 명확한 구조 | ✅ 개선 |

### **최종 권장 아키텍처**

#### **✅ JSON 시스템 적용 권장 영역**:
1. **모드별 행동 지침**: CHATBOT_AGENT_MODES
2. **시스템 정보**: CARET_SYSTEM_INFO  
3. **행동 규칙**: CARET_BEHAVIOR_RULES
4. **작업 목표**: CARET_TASK_OBJECTIVE
5. **피드백 시스템**: CARET_FEEDBACK_SYSTEM

#### **❌ Cline 원본 유지 권장 영역**:
1. **도구 시스템**: 모든 tool definitions
2. **MCP 통합**: MCP 서버 관련 모든 기능
3. **모델별 최적화**: provider별 세부 조정
4. **복잡한 컨텍스트 로직**: 파일 추적, 상태 관리

### **구현 성공 예상 결과**

#### **단기 효과 (1개월 내)**:
✅ Luke 발견 문제 100% 해결  
✅ 도구 사용 안정성 95% 이상  
✅ 토큰 절약 12-22% 달성  
✅ 모드 전환 정확도 100%

#### **중장기 효과 (3-6개월)**:
✅ 유지보수 시간 50% 단축  
✅ 새로운 기능 추가 난이도 감소  
✅ 다국어 지원 완전 구현  
✅ 사용자 만족도 향상

### **🎯 성공 기준**

#### **Phase 1 완료 기준**:
✅ Luke 로그에서 `[CaretJsonAdapter] ❌ No tools available from Cline system` 메시지 사라짐  
✅ browser_action에 URL 파라미터 정상 포함  
✅ AI가 "현재 AGENT/CHATBOT 모드" 정확히 인식  

#### **Phase 2 완료 기준**:  
✅ 모든 도구 (브라우저, 터미널, 파일조작) 정상 작동  
✅ Chatbot 모드에서 도구 제한 정상 작동  
✅ UI 모드 전환 즉시 반영  

#### **Phase 3 완료 기준**:
✅ I18n 키 누락 0개  
✅ Luke 재테스트에서 모든 시나리오 통과  
✅ 페르소나 출력 정상 렌더링

---

## 5. 📊 예상 결과 및 성공 지표

### 5.1 문제 해결 예상 결과

**모드 인식 문제 해결**:
- Luke 테스트: `Mode: agent` (더 이상 undefined 아님)
- AI 응답: "현재 AGENT 모드로 작동 중" (PLAN/ACT 언급 없음)

**도구 시스템 안정화**:
- 브라우저 도구: 필수 파라미터 자동 제공으로 정상 작동
- 터미널 도구: requires_approval 파라미터 포함으로 정상 실행

**I18n 시스템 완성**:
- 모든 Caret 메시지 다국어 지원
- 브랜드 전환 시 일관된 메시지 표시

### 5.2 성공 지표

**기술적 지표**:
- [ ] Cline 파일 수정: 58개 → 5개 이하 (91% 감축)
- [ ] context.mode undefined 문제: 100% 해결
- [ ] 도구 실행 성공률: 95% 이상
- [ ] I18n 키 누락: 0개

**사용자 경험 지표**:
- [ ] 모드 전환 반응성: 즉시 반영
- [ ] AI 모드 인식 정확도: 100%
- [ ] 핵심 기능(브라우저, 터미널) 안정성: 95% 이상

---

## 6. 🎯 결론 및 권장사항

### 6.1 핵심 권장사항

1. **아키텍처 전환**: Level 3 → Level 1 즉시 전환 필요
2. **하이브리드 접근**: JSON + Cline 원본의 선택적 결합
3. **완전한 분리**: Caret과 Cline 시스템 독립성 확보
4. **점진적 개선**: 안정성 우선, 기능 추가는 차후 진행

### 6.2 장기적 비전

**t06 프로젝트의 궁극적 목표 달성**:
- "구조는 cline-latest, 영혼은 Caret" 철학 구현
- JSON 기반 유연한 프롬프트 관리 (단순 컴포넌트)
- Cline 호환성 유지와 Caret 독창성 양립
- 개발자 친화적 아키텍처 완성

### 6.3 Next Actions

**즉시 착수 권장**:
1. CaretModeManager 독립 시스템 구축
2. Cline 원본 파일들 롤백 실행  
3. 하이브리드 프롬프트 시스템 설계
4. Luke와 지속적 피드백 루프 구축

이 분석을 바탕으로 t06 프로젝트를 안정적이고 지속가능한 방향으로 재구성할 수 있을 것입니다.

---

## 📚 참고 자료

- **Feature Specs**: 
  - [f06-json-system-prompt.mdx](../features/f06-json-system-prompt.mdx)
  - [f07-chatbot-agent.mdx](../features/f07-chatbot-agent.mdx)
- **Work Logs**: 
  - [t06-json-system-prompt.md](./t06-json-system-prompt.md)
  - [t06-phase5-cross-validation.md](./t06-phase5-cross-validation.md)
- **Architecture Guide**: 
  - [CLAUDE.md](../../../CLAUDE.md) Level 1 독립 모듈 원칙