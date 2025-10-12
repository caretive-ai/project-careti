# F06-F07 - Caret Prompt System
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

## 🛡️ Cline 독립성 보장

### 완전한 분기 로직

```typescript
// system-prompt/index.ts
if (currentMode === "caret") {
    // Caret 사용자: 새로운 Chatbot/Agent 시스템
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
