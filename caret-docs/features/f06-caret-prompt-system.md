# F06 - Caret Prompt System
## Chatbot/Agent 모드와 하이브리드 프롬프트 아키텍처

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: 100% 완료
**우선순위**: HIGH - 핵심 사용자 경험

---

## 📋 개요

**F06 (기술 인프라)**: JSON + Cline 하이브리드 프롬프트 시스템
**F07 (사용자 경험)**: Chatbot/Agent 모드, 직관적 용어, 도구 제한

**통합 이유**: F06과 F07은 단일 시스템의 양면 - 기술적으로는 하이브리드(F06), 사용자에게는 Chatbot/Agent(F07)

---

## 🤔 Cline vs Caret 차이

### Plan/Act (Cline) vs Chatbot/Agent (Caret)

| 구분 | Cline Plan/Act | Caret Chatbot/Agent |
|------|---------------|---------------------|
| **경험** | 분절된 (계획→승인→실행) | 단일 연속 (자연스러운 대화) |
| **AI 역할** | 도구 사용 중심 | 대화와 협업 중심 |
| **용어** | 기술적 (Plan/Act) | 직관적 (Chatbot/Agent) |

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 수정

**1. system-prompt/index.ts** (+17 lines)
```typescript
// CARET MODIFICATION: Caret mode branching
const currentMode = await StateManager.getMode() // "caret" or "cline"

if (currentMode === "caret") {
    // Caret: Chatbot/Agent 시스템
    const { CaretPromptWrapper } = await import("@caret/core/prompts/CaretPromptWrapper")
    return await CaretPromptWrapper.getCaretSystemPrompt(context)
} else {
    // Cline: 기존 Plan/Act 시스템 (100% 보존)
    return await registry.get(context)
}
```

**2. CaretPromptWrapper (Caret 전용)**
```
caret-src/core/prompts/CaretPromptWrapper.ts
- 하이브리드 프롬프트 생성
- JSON + Cline 도구 결합
- 모드별 도구 필터링
```

**3. CaretModeManager (Caret 전용)**
```
caret-src/core/prompts/CaretModeManager.ts
- Chatbot/Agent 모드 관리
- 도구 제한 시스템
- 모드 전환 로직
```

---

## 🤖 Chatbot vs Agent 모드

### Chatbot Mode (읽기 전용)

**허용 도구**:
- ✅ read_file, search_files (분석)
- ✅ ask_followup_question (대화)
- ✅ web_fetch (조사)

**차단 도구**:
- ❌ write_to_file (수정)
- ❌ execute_command (실행)

**사용 예시**:
```
"이 함수의 성능 문제점 분석해줘"
"코드 스타일 관점에서 리뷰해줘"
```

### Agent Mode (전체 권한)

**모든 도구 허용**:
- ✅ 읽기 + 쓰기
- ✅ 명령 실행
- ✅ 파일 조작

**사용 예시**:
```
"JWT 인증 시스템 구현해줘"
"버그 찾아서 수정하고 테스트까지 완료해줘"
```

### 도구 제한 시스템

```typescript
// CaretModeManager.ts
static isToolAllowed(toolName: string): boolean {
    if (this.caretMode === "agent") return true

    if (this.caretMode === "chatbot") {
        const allowedInChatbot = [
            "read_file", "list_files", "search_files",
            "ask_followup_question", "web_fetch"
        ]
        return allowedInChatbot.includes(toolName)
    }

    return false
}
```

---

## 🔧 하이브리드 아키텍처 (F06)

### JSON + Cline 결합

**JSON 영역** (정적 컨텐츠):
```
caret-src/core/prompts/json/
├── AGENT_BEHAVIOR_DIRECTIVES.json  # Agent 행동 지침
├── CHATBOT_BEHAVIOR_DIRECTIVES.json # Chatbot 행동 지침
└── CARET_SYSTEM_INFO.json           # 시스템 정보
```

**Cline 영역** (동적 로직):
```typescript
// Cline 도구 시스템 재사용
const toolPrompts = await PromptBuilder.getToolsPrompts(mockVariant, context)

// Caret 모드별 필터링
return this.filterToolsByMode(toolPrompts, isChatbotMode)
```

### 기술 선택 기준

| 영역 | 기술 | 이유 |
|------|------|------|
| **모드 설명** | JSON | 쉬운 관리 |
| **도구 정의** | Cline 원본 | 복잡한 파라미터 |
| **행동 규칙** | JSON | 동적 수정 가능 |

---

## 🔄 용어 교체 시스템 (Terminology Replacement)

### 핵심 원칙

**사용자는 자신의 모드 용어만 봐야 합니다**:
- **Cline 모드**: Plan/Act 용어만 표시
- **Caret 모드**: Chatbot/Agent 용어만 표시

### 구현 방법: 시스템 프롬프트 레벨 교체

**위치**: `CaretJsonAdapter.ts:207-224`

```typescript
// CARET MODIFICATION: Replace PLAN/ACT terminology with CHATBOT/AGENT in tool descriptions
// This ensures users only see Caret terminology (CHATBOT/AGENT) and never Cline terminology (PLAN/ACT)
filteredTools = filteredTools.map((toolPrompt: string) => {
    return toolPrompt
        .replace(/\bPLAN MODE\b/g, "CHATBOT MODE")
        .replace(/\bACT MODE\b/g, "AGENT MODE")
        .replace(/\bPlan MODE\b/g, "Chatbot MODE")
        .replace(/\bAct MODE\b/g, "Agent MODE")
        .replace(/\bplan mode\b/g, "chatbot mode")
        .replace(/\bact mode\b/g, "agent mode")
        .replace(/\bPlan mode\b/g, "Chatbot mode")
        .replace(/\bAct mode\b/g, "Agent mode")
        // Handle phrases like "toggle to Act mode", "switch to PLAN MODE"
        .replace(/toggle to (Act|ACT) mode/gi, "toggle to AGENT mode")
        .replace(/switch to (Act|ACT) mode/gi, "switch to AGENT mode")
        .replace(/toggle to (Plan|PLAN) mode/gi, "toggle to CHATBOT mode")
        .replace(/switch to (Plan|PLAN) mode/gi, "switch to CHATBOT mode")
})
```

### 교체 대상

**1. Cline 도구 설명에서 교체되는 내용**:
```typescript
// Before (Cline 원본)
"This tool is only available in PLAN MODE"
"Remember, you can explore the project with tools like read_file in PLAN MODE without the user having to toggle to ACT MODE"
"NEVER include an option to toggle to Act mode"

// After (Caret 사용자에게 보이는 것)
"This tool is only available in CHATBOT MODE"
"Remember, you can explore the project with tools like read_file in CHATBOT MODE without the user having to toggle to AGENT MODE"
"NEVER include an option to toggle to Agent mode"
```

**2. 교체 범위**:
- ✅ 모든 대소문자 조합 (PLAN MODE, Plan mode, plan mode)
- ✅ 문맥 기반 구문 (toggle to, switch to)
- ✅ 도구 설명 및 파라미터 설명
- ❌ Cline 원본 코드는 수정하지 않음 (최소 침습)

### 왜 시스템 프롬프트에서 교체하는가?

**장점**:
1. **Cline 원본 보존**: Cline 도구 파일 (`src/core/prompts/system-prompt/tools/*.ts`)을 전혀 수정하지 않음
2. **최소 침습**: Caret 코드에서만 교체 로직 실행
3. **자동 업데이트**: Cline이 도구를 업데이트해도 자동으로 교체 적용
4. **런타임 변환**: 각 모드 사용자에게 맞는 용어를 동적으로 제공

**대안의 문제점**:
- ❌ Cline 파일 직접 수정: 업스트림 머지 시 충돌
- ❌ UI 레벨 교체: AI가 이미 잘못된 용어로 학습됨
- ❌ 포크 유지: Cline 업데이트 추적 불가능

### 실제 동작 예시

**Caret 모드 사용자가 받는 시스템 프롬프트**:
```
## ask_followup_question
Description: Ask the user a question to gather additional information needed to complete the task. This tool should be used when you encounter ambiguities, need clarification, or require more details to proceed effectively. It allows for interactive problem-solving by enabling direct communication with the user. The user may respond, take the requested action, or choose to ignore the question entirely. The tool will not be executed if the user ignores it.

Usage:
<ask_followup_question>
<question>Your question here</question>
<options>
<option>Option 1</option>
<option>Option 2</option>
</options>
</ask_followup_question>

Parameters:
- question: (required) The question to ask the user. This should be a clear, specific question...
- options: (optional) An array of 2-5 options for the user to choose from... IMPORTANT: NEVER include an option to toggle to AGENT mode, as this would be something you need to direct the user to do manually themselves if needed.
```

**주목**: 마지막 문장이 원래 "toggle to Act mode"에서 "toggle to AGENT mode"로 자동 교체되었습니다!

---

## 🛡️ Cline 독립성 보장

### 완전한 분기 로직

```typescript
// system-prompt/index.ts
if (currentMode === "caret") {
    // Caret 사용자: 새로운 Chatbot/Agent 시스템 (용어 자동 교체 포함)
    return await CaretPromptWrapper.getCaretSystemPrompt(context)
} else {
    // Cline 사용자: 기존 Plan/Act 시스템 100% 그대로
    return await registry.get(context)  // ← 원본 Cline 로직, 어떤 변경도 없음
}
```

### 독립성 검증

**1. Cline 모드 테스트**:
```bash
# StateManager.setMode("cline")
# 확인: registry.get() 호출 ✅
# 확인: CaretPromptWrapper 미호출 ✅
```

**2. Caret 격리 확인**:
```bash
# CaretPromptWrapper는 caret-src/에 완전 격리
# Cline 코드 0% 의존 ✅
```

---

## 📝 Modified Files (Phase 4)

**Cline 핵심 파일**:
```
src/core/prompts/system-prompt/index.ts  (+17 lines)
```

**Caret 전용 파일** (caret-src/):
```
caret-src/core/prompts/CaretPromptWrapper.ts
caret-src/core/prompts/CaretModeManager.ts
caret-src/core/prompts/CaretJsonAdapter.ts
caret-src/core/prompts/json/*.json
```

**최소 침습**: Cline 1개 파일만 수정 (+17 lines) ⭐

---

## 🚀 사용 방법

### 모드 전환

**1. 단축키**:
- macOS: `⌘⇧A`
- Windows/Linux: `Ctrl+Shift+A`

**2. 설정**:
```
Settings → Caret Mode → Chatbot/Agent 선택
```

### 실제 동작 검증

```bash
# 1. Chatbot 모드
"이 코드 분석해줘"
→ read_file 사용 ✅
→ write_to_file 차단 ✅

# 2. Agent 모드
"버그 수정해줘"
→ read_file 사용 ✅
→ write_to_file 사용 ✅
→ execute_command 사용 ✅
```

---

## 💡 핵심 장점

**1. 사용자 경험 (F07)**
- 직관적 용어 (Chatbot/Agent)
- 명확한 역할 구분
- 안전한 Chatbot 모드

**2. 기술 안정성 (F06)**
- Cline 코어 100% 보존
- 하이브리드 재사용
- 최소 침습 (1개 파일)

**3. 유지보수**
- JSON으로 쉬운 프롬프트 관리
- Cline 도구 자동 업데이트
- 독립적 Caret 진화 가능

---

**작성일**: 2025-10-10
**Phase**: Phase 4 Backend 완료
**통합 이유**: F06(기술)과 F07(UX)은 단일 시스템의 양면
