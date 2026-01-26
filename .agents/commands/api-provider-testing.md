---
description: Guidelines for testing LLM API providers
argument-hint: "[provider-name]"
---

# API Provider Testing

Guidelines for testing LLM API providers when adding or modifying support in Caret.

## Test Categories

### 1. Basic Conversation Test
- Simple prompt → response verification
- Streaming chunk reception
- Token usage reporting

### 2. Tool Calling Test
Core verification for agentic capabilities.

**Test Flow:**
1. Send message with tool definitions
2. Verify `tool_calls` chunk received
3. Verify function name and arguments
4. Send tool result back
5. Verify final text response

**Provider-Specific Formats:**

| Provider | Tool Call Key | Arguments | Tool Result Key |
|----------|--------------|-----------|-----------------|
| OpenAI | `tool_calls` | string | `tool_call_id` |
| Naver Cloud | `toolCalls` | object | `toolCallId` |
| Upstage | `tool_calls` | string | `tool_call_id` |
| Gemini | `functionCall` | object | n/a |

### 3. Timeout Test
- Use `AbortController` with configurable timeout
- Default: 60 seconds recommended
- Verify timeout error is thrown correctly

### 4. Error Handling Test
- Invalid API key → 401/403 error
- Rate limiting → 429 error with retry
- Empty response → specific error message

## Test Script Template

Location: `scripts/test-{provider}-api.js`

```javascript
async function testBasicConversation() { ... }
async function testToolCalling() { ... }
async function testToolResultFlow() { ... }
async function testTimeout() { ... }

async function main() {
  const results = {
    basic: await testBasicConversation(),
    toolCall: await testToolCalling(),
    toolFlow: await testToolResultFlow(),
  }
  console.log('Results:', results)
}
```

## Existing Test Scripts

| Script | Provider | Tests |
|--------|----------|-------|
| `scripts/test-naver-cloud-api.js` | Naver Cloud | Basic, Timeout |
| `scripts/test-naver-tool-calling.js` | Naver Cloud | Tool calling |
| `scripts/test-upstage-api.js` | Upstage | Basic, Streaming |
| `scripts/test-glm47-streaming.js` | GLM4.7 | Thinking, Streaming |

## Key Files

| File | Purpose |
|------|---------|
| `src/core/api/providers/{provider}.ts` | Provider handler |
| `src/core/api/transform/tool-call-processor.ts` | Tool call parsing |
| `src/core/api/transform/stream.ts` | Stream types |
| `src/core/api/retry.ts` | Retry decorator |

## Checklist for New Provider

- [ ] Basic conversation works
- [ ] Streaming chunks parse correctly
- [ ] Tool calling triggers `tool_calls` type chunk
- [ ] Tool result → final response flow works
- [ ] Timeout with AbortController works
- [ ] Error messages are clear
- [ ] Token usage reported correctly
- [ ] Integration test added to `__tests__/`
