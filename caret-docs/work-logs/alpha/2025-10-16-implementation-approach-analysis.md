# Claude Code 통합 방식 분석

작성일: 2025-10-16
작성자: Alpha Yang

## 마스터의 질문

> "아는분이 헤더를 이용하여 클로드 코드, 제미나이등과 소통한다고 듣긴했었어. 타입스크립트 sdk는 결국 캐럿 안에 이용해서 툴 인터페이스 만들고 이를 호출하게 해야 하는거 아닐까?"

## 두 가지 접근 방식

### 방식 1: CLI Subprocess (현재 구현)

**구조:**
```
Caret → subprocess (Claude Code CLI) → Anthropic API
       ↑ stdin (messages)
       ↓ stdout (JSON stream)
```

**현재 코드:**
```typescript
// src/integrations/claude-code/run.ts
const claudeCodeProcess = execa(claudePath, args, {
  stdin: "pipe",
  stdout: "pipe",
  stderr: "pipe",
  // ...
})

// args에 --disallowedTools 포함
const args = [
  "--system-prompt", systemPrompt,
  "--disallowedTools", disallowedTools,
  "--model", modelId,
  // ...
]
```

**Task 툴 처리:**
- Claude Code CLI의 내장 기능
- Caret은 `--disallowedTools`에서 "Task"를 제외만 함
- 실제 구현은 Claude Code CLI가 담당

**장점:**
- 구현 간단 (CLI만 실행)
- Claude Code의 모든 기능 자동 사용

**단점:**
- Task 툴 동작을 Caret이 제어 불가
- CLI 의존성

---

### 방식 2: HTTP API + Caret 구현 (마스터 제안)

**구조:**
```
Caret → HTTP API (헤더 통신) → Anthropic API
     ↓
  Task 툴 핸들러 (caret-src/)
```

**구현 예시:**
```typescript
// caret-src/core/task/tools/handlers/task.ts
export async function executeTaskTool(
  params: { description: string; prompt: string; subagent_type: string }
) {
  // 1. 서브에이전트 생성
  const subagent = new SubagentInstance({
    description: params.description,
    type: params.subagent_type,
  })
  
  // 2. 서브 태스크 실행
  const result = await subagent.execute(params.prompt)
  
  // 3. 결과 반환
  return {
    success: true,
    output: result
  }
}

// src/core/api/providers/claude-code.ts (HTTP 방식)
async *createMessage(systemPrompt: string, messages: MessageParam[]): ApiStream {
  const response = await fetch(claudeCodeApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Anthropic-Version": "2023-06-01",
      // ... 기타 헤더
    },
    body: JSON.stringify({
      model: this.options.modelId,
      system: systemPrompt,
      messages: messages,
    })
  })
  
  // Stream 파싱 및 tool_use 처리
  for await (const chunk of response.body) {
    if (chunk.type === "tool_use" && chunk.name === "Task") {
      // Caret의 Task 툴 핸들러 호출
      const result = await executeTaskTool(chunk.input)
      yield result
    }
  }
}
```

**Task 툴 처리:**
- Caret이 직접 구현 (`caret-src/core/task/tools/handlers/task.ts`)
- TypeScript SDK의 AgentInput 인터페이스 사용
- 완전한 제어 가능

**장점:**
- Task 툴을 Caret이 완전히 제어
- 서브에이전트 로직 커스터마이징 가능
- CLI 의존성 제거 가능

**단점:**
- HTTP API 스펙 파악 필요
- 구현 복잡도 높음
- Claude Code CLI의 다른 기능들도 재구현 필요

---

## 현재 상태 정리

### Cline의 원래 구현

Cline은 **방식 1 (CLI subprocess)**을 사용:
- `src/integrations/claude-code/run.ts` - subprocess 실행
- `src/core/api/providers/claude-code.ts` - stream 파싱만

### Caret의 현재 수정

Caret이 추가한 것:
1. `run.ts`: `getClaudeCodeDisallowedTools()` - Caret 모드 감지
2. `CaretPromptWrapper.ts`: Task 툴 설명 주입 시도

**문제점:**
- CLI 방식과 시스템 프롬프트 주입이 불일치
- Task 툴은 CLI가 처리하는데, 시스템 프롬프트에 설명을 추가하려 함

---

## 질문 정리

### Q1: 현재 방식이 맞나요?

**A:** CLI 방식으로는 시스템 프롬프트에 Task 툴 설명을 추가할 필요가 없습니다.
- `--disallowedTools`에서 "Task"만 제외하면 됨
- CLI가 알아서 Task 툴을 제공함

### Q2: 시스템 프롬프트 주입이 필요한가요?

**A:** CLI 방식에서는 불필요합니다.
- Claude Code CLI가 자체적으로 시스템 프롬프트 구성
- Caret의 추가 설명은 중복/충돌 가능

### Q3: Task 툴을 Caret이 구현해야 하나요?

**A:** 두 가지 선택지:

1. **CLI 방식 유지 (간단)**
   - 현재 구현 유지
   - `CaretPromptWrapper.ts`의 Task 툴 주입 제거
   - `run.ts`의 `--disallowedTools` 제어만 사용

2. **HTTP API 방식 전환 (복잡하지만 제어력 높음)**
   - Claude Code HTTP API 스펙 파악
   - Task 툴을 Caret에 구현
   - 서브에이전트 로직 완전 커스터마이징

---

## 추천 방향

### 단기 (F12 1차 구현)

**CLI 방식 유지 + 수정:**
1. `CaretPromptWrapper.ts`에서 Task 툴 주입 제거
2. `run.ts`의 `--disallowedTools` 제어만 사용
3. 테스트로 동작 확인

**이유:**
- 빠른 구현 가능
- Cline의 원래 구조 유지
- 최소 침습 원칙 준수

### 중장기 (향후 고도화)

**HTTP API 방식 전환 고려:**
1. Claude Code API 스펙 분석
2. Task 툴 핸들러 구현
3. 서브에이전트 고도화

**이유:**
- 완전한 제어
- Caret만의 서브에이전트 전략 구현
- CLI 의존성 제거

---

## 다음 단계

### 마스터 결정 필요:

1. **CLI 방식 유지?**
   - ✅ 빠름, 간단함
   - ❌ 제어력 낮음

2. **HTTP API 방식 전환?**
   - ✅ 완전한 제어
   - ❌ 복잡함, 시간 소요

### CLI 방식 선택 시:

```typescript
// CaretPromptWrapper.ts 수정
static async getCaretSystemPrompt(context: SystemPromptContext): Promise<string> {
  let prompt = await CaretPromptWrapper.promptManager.getPrompt(caretContext)
  
  // Task 툴 주입 제거 (CLI가 처리)
  // if (isClaudeCode) {
  //   const taskToolDescription = ...
  //   prompt = CaretPromptWrapper.injectTaskToolDescription(...)
  // }
  
  return prompt
}
```

### HTTP API 방식 선택 시:

```typescript
// caret-src/core/task/tools/handlers/task.ts 생성
export async function executeTaskTool(params: AgentInput) {
  // Task 툴 구현
}

// src/core/api/providers/claude-code.ts 대체
// HTTP API 방식으로 재작성
```

---

## 참고 자료

- `src/integrations/claude-code/run.ts` - 현재 CLI 방식
- `caret-docs/work-logs/luke/references/claude-code-cli-sdk.md` - CLI 플래그
- `caret-docs/work-logs/luke/references/claude-code-typescript-sdk.md` - HTTP API 스펙
