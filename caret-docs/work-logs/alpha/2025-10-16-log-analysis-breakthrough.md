# 🎯 Task Tool 로그 분석 - 근본 원인 발견!

**날짜**: 2025-10-16
**작성자**: Alpha
**상태**: **BREAKTHROUGH** - 문제 발견!

## 로그 분석 결과

### 실제 로그 (마스터 제공)

```
DEBUG [ClaudeCode] 🔍 Received chunk: {"type":"system","hasMessage":false}
DEBUG [ClaudeCode] 🔍 Received chunk: {"type":"assistant","hasMessage":true}
DEBUG [ClaudeCode] 📨 Processing assistant message: {"contentCount":1,"stopReason":null}
DEBUG [ClaudeCode] 📋 Processing content block: {"type":"thinking","hasToolResult":false}

DEBUG [ClaudeCode] 🔍 Received chunk: {"type":"assistant","hasMessage":true}
DEBUG [ClaudeCode] 📨 Processing assistant message: {"contentCount":1,"stopReason":null}
DEBUG [ClaudeCode] 📋 Processing content block: {"type":"tool_use","hasToolResult":false}

⚠️ DEBUG [ClaudeCode] 🔍 Received chunk: {"type":"user","hasMessage":true}
⚠️ DEBUG [ClaudeCode] 🔍 Received chunk: {"type":"result","hasMessage":false}

❌ LOG [NoOpTelemetryProvider] task.provider_api_error: {"errorMessage":"empty_assistant_message"}
```

## 🔥 근본 원인 발견

### 문제: `type: "user"` chunk를 처리하지 않음!

**현재 코드**:
```typescript
// src/core/api/providers/claude-code.ts (Line 75)
if (chunk.type === "assistant" && "message" in chunk) {
  const message = chunk.message
  // assistant message 처리
  for (const content of message.content) {
    // ...
  }
}

// ❌ user chunk는 무시됨!
```

**실제 응답 구조** (CLI 테스트 확인):
```json
{
  "type": "user",  // ← assistant가 아니라 user!
  "message": {
    "content": [{
      "type": "tool_result",
      "tool_use_id": "toolu_xxx",
      "content": [{           // ← 배열 형태
        "type": "text",
        "text": "## Task Completed..."
      }]
    }]
  }
}
```

**흐름 분석**:
1. ✅ AI가 Task tool 호출 (assistant message, tool_use)
2. ✅ Caret이 Tool 실행
3. ✅ Claude Code SDK가 tool_result 반환
4. ❌ **tool_result는 `type: "user"` chunk로 옴**
5. ❌ **우리 코드는 user chunk를 무시함**
6. ❌ 다음 assistant message가 비어있음
7. ❌ `empty_assistant_message` 에러 발생

## 해결 방법

### 수정 필요: user chunk 처리 추가

**현재 구조**:
```typescript
for await (const chunk of claudeProcess) {
  if (chunk.type === "system") { /* ... */ }
  
  if (chunk.type === "assistant" && "message" in chunk) {
    // assistant만 처리
  }
  
  if (chunk.type === "result") { /* ... */ }
  
  // ❌ user는 처리 안 함!
}
```

**수정 후**:
```typescript
for await (const chunk of claudeProcess) {
  if (chunk.type === "system") { /* ... */ }
  
  if (chunk.type === "assistant" && "message" in chunk) {
    // assistant 처리
  }
  
  // ✅ NEW: user chunk 처리 추가!
  if (chunk.type === "user" && "message" in chunk) {
    const message = chunk.message
    for (const content of message.content) {
      if ((content as any).type === "tool_result") {
        const toolResult = content as any
        if (Array.isArray(toolResult.content)) {
          for (const item of toolResult.content) {
            if (item.type === "text") {
              yield { type: "text", text: item.text }
            }
          }
        }
      }
    }
  }
  
  if (chunk.type === "result") { /* ... */ }
}
```

## 왜 이제야 발견했나?

### 잘못된 가정
- **가정**: tool_result는 assistant message에 포함될 것이다
- **실제**: tool_result는 user message로 온다

### Claude Code SDK의 특이점
- 일반 Claude API: tool_result를 user role로 API에 다시 보냄
- Claude Code SDK: tool_result를 streaming response의 user chunk로 반환

### CLI 테스트가 중요했던 이유
```bash
echo "Use the Task tool..." | \
  npx @anthropic-ai/claude-code -p --verbose \
  --output-format stream-json \
  --model claude-sonnet-4-20250514
```

이 테스트에서 우리는 `type: "user"` chunk를 봤지만, 
Caret 구현에서는 user chunk를 처리하지 않고 있었다!

## 다음 작업

1. **user chunk 처리 코드 추가**
   - `type: "user"` 조건 추가
   - tool_result 파싱 로직 적용
   - assistant와 동일한 처리

2. **테스트**
   - 컴파일
   - VS Code reload
   - Task tool 재시도

3. **검증**
   - tool_result가 제대로 yield되는지 확인
   - empty_assistant_message 에러 해결 확인

## 예상 결과

**수정 전**:
```
1. AI: tool_use → Task 호출
2. SDK: tool_result → user chunk (우리가 무시)
3. AI: 빈 응답 → empty_assistant_message 에러
```

**수정 후**:
```
1. AI: tool_use → Task 호출
2. SDK: tool_result → user chunk → 우리가 파싱 → text yield ✅
3. AI: tool_result를 받고 정상 응답 ✅
```

## 교훈

1. **로깅의 중요성**: 
   - 디버깅 로그가 없었다면 이 문제를 발견하지 못했을 것
   
2. **CLI 테스트의 중요성**:
   - 실제 SDK 동작을 확인할 수 있었음
   - 문서만으로는 알 수 없는 세부사항
   
3. **가정을 검증하라**:
   - "assistant message에 있을 것"이라는 가정이 틀렸음
   - 실제 로그를 보고 확인해야 함

---

**결론**: tool_result는 user chunk로 온다. user chunk 처리 코드를 추가하면 해결!
