# SDK vs CLI Integration Comparison

**Date**: 2025-10-18 00:08  
**Purpose**: SDK 적용 시 scalability 문제 해결 가능 여부 분석  
**Reference**: `caret-docs/work-logs/luke/references/claude-code-typescript-sdk.md`

## Executive Summary

**결론**: SDK를 사용하면 현재 CLI 방식의 모든 scalability 문제가 해결됩니다.

하지만 **현재 SDK는 아직 출시되지 않았습니다**. 문서는 미래 API 스펙을 보여주는 것으로 보입니다.

## 비교 분석

### 1. Timeout 관리

#### ❌ 현재 CLI 방식
```typescript
// run.ts - Hard-coded
const CLAUDE_CODE_TIMEOUT = 600000 // 10 minutes 고정

const claudeCodeProcess = execa(claudePath, args, {
    timeout: CLAUDE_CODE_TIMEOUT  // 변경 불가
})
```

**문제**: 
- 사용자 설정 불가
- 모든 작업에 동일한 timeout 적용
- 복잡한 작업은 무조건 10분 제한

#### ✅ SDK 방식
```typescript
import { query } from '@anthropic-ai/claude-agent-sdk'

const result = query({
    prompt: "복잡한 분석 작업",
    options: {
        // 사용자가 자유롭게 설정 가능!
        abortController: customAbortController,  // 직접 제어
        // timeout은 AbortController로 구현
    }
})

// 언제든 중단 가능
await result.interrupt()
```

**장점**:
- `AbortController`로 완전한 제어
- `interrupt()` 메서드로 언제든 중단
- 작업별로 다른 timeout 설정 가능

### 2. Buffer 크기 관리

#### ❌ 현재 CLI 방식
```typescript
const BUFFER_SIZE = 20_000_000 // 20 MB 고정

const claudeCodeProcess = execa(claudePath, args, {
    maxBuffer: BUFFER_SIZE  // 변경 불가
})
```

**문제**:
- 20MB 초과 시 에러
- 대용량 결과 처리 불가

#### ✅ SDK 방식
```typescript
// SDK는 streaming으로 처리하므로 buffer 제약 없음!
for await (const message of result) {
    if (message.type === 'assistant') {
        // 메시지를 하나씩 처리
        // Memory는 현재 메시지만 차지
        processMessage(message)
    }
}
```

**장점**:
- Streaming으로 메모리 효율적
- 크기 제한 없음
- Progressive processing 가능

### 3. Output Token Limit

#### ❌ 현재 CLI 방식
```typescript
const CLAUDE_CODE_MAX_OUTPUT_TOKENS = "32000"  // ~128KB text

const env: NodeJS.ProcessEnv = {
    CLAUDE_CODE_MAX_OUTPUT_TOKENS: process.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS || "32000"
}
```

**문제**:
- 32000 tokens 제한
- 복잡한 작업 결과가 잘림

#### ✅ SDK 방식
```typescript
const result = query({
    prompt: "대규모 분석",
    options: {
        maxTurns: undefined,  // 무제한
        // Output token limit은 model 자체 제한만 적용
    }
})
```

**장점**:
- Model의 자연스러운 제한만 적용
- 환경변수 설정 필요 없음

### 4. Progress Reporting

#### ❌ 현재 CLI 방식
```typescript
// 진행 상황 알 수 없음
for await (const line of rl) {
    const chunk = parseChunk(line, processState)
    yield chunk  // 무엇이 진행 중인지 모름
}
```

**문제**:
- 사용자는 기다리기만 함
- 어떤 subtask가 실행 중인지 모름
- 진행률 알 수 없음

#### ✅ SDK 방식
```typescript
const result = query({
    prompt: "여러 subtask 실행",
    options: {
        hooks: {
            // 모든 이벤트 추적 가능!
            'PreToolUse': [{
                hooks: [async (input) => {
                    console.log(`Starting tool: ${input.tool_name}`)
                    updateProgressUI(input.tool_name)
                }]
            }],
            'PostToolUse': [{
                hooks: [async (input) => {
                    console.log(`Completed: ${input.tool_name}`)
                    updateProgress(input.tool_response)
                }]
            }],
            'SessionEnd': [{
                hooks: [async (input) => {
                    console.log('Task completed!')
                }]
            }]
        }
    }
})
```

**장점**:
- 실시간 진행 상황 추적
- UI에 progress 표시 가능
- 사용자 경험 대폭 개선

### 5. Streaming & Partial Results

#### ❌ 현재 CLI 방식
```typescript
// Line-by-line streaming의 한계
const rl = readline.createInterface({
    input: cProcess.stdout
})

for await (const line of rl) {
    if (line.trim()) {
        const chunk = parseChunk(line, processState)
        // Partial data 처리가 복잡
    }
}
```

**문제**:
- Line 단위로만 처리
- Incomplete JSON 처리 복잡
- 대용량 메시지 reassembly 어려움

#### ✅ SDK 방식
```typescript
for await (const message of result) {
    switch (message.type) {
        case 'stream_event':
            // Partial message - SDK가 자동 처리
            updateUI(message.event)
            break
            
        case 'assistant':
            // Complete message
            processComplete(message)
            break
            
        case 'user':
            // Tool result
            handleToolResult(message)
            break
    }
}
```

**장점**:
- SDK가 streaming 완전 관리
- Partial message 자동 처리
- Type-safe message handling

### 6. Subtask Management

#### ❌ 현재 CLI 방식
```typescript
// Subtask 관리 기능 없음
// CLI가 알아서 하는 것을 기대하고 결과만 받음
const { exitCode } = await cProcess
```

**문제**:
- Subtask 진행 상황 알 수 없음
- Subtask 결과를 progressive하게 받을 수 없음
- Subtask 실패 시 전체 실패

#### ✅ SDK 방식
```typescript
const result = query({
    prompt: "Create 5 subtasks",
    options: {
        agents: {
            // Subtask 정의
            'analyzer': {
                description: "Code analysis agent",
                tools: ['Read', 'Grep', 'Glob'],
                prompt: "Analyze code quality",
                model: 'sonnet'
            },
            'refactorer': {
                description: "Code refactoring agent", 
                tools: ['Read', 'Write', 'Edit'],
                prompt: "Refactor code",
                model: 'opus'  // 다른 모델 사용 가능!
            }
        },
        hooks: {
            'SessionStart': [{
                hooks: [async (input) => {
                    if (input.source === 'subagent') {
                        console.log('Subtask started')
                    }
                }]
            }]
        }
    }
})
```

**장점**:
- Subtask별 설정 가능
- 진행 상황 추적
- 각 subtask에 다른 모델 사용 가능
- Partial result 처리

### 7. Error Handling

#### ❌ 현재 CLI 방식
```typescript
try {
    const { exitCode } = await cProcess
    if (exitCode !== 0) {
        throw new Error(`Process exited with code ${exitCode}`)
    }
} catch (err) {
    // Generic error handling
}
```

**문제**:
- 에러 원인 파악 어려움
- Recovery 방법 제한적
- 부분 성공 처리 불가

#### ✅ SDK 방식
```typescript
for await (const message of result) {
    if (message.type === 'result') {
        switch (message.subtype) {
            case 'success':
                handleSuccess(message.result)
                break
                
            case 'error_max_turns':
                // Max turns exceeded - partial results 사용 가능
                handlePartialResult(message)
                break
                
            case 'error_during_execution':
                // Execution error - retry 가능
                handleError(message)
                break
        }
        
        // Permission denials 확인
        if (message.permission_denials.length > 0) {
            handlePermissionIssues(message.permission_denials)
        }
    }
}
```

**장점**:
- 상세한 에러 타입 구분
- Partial success 처리 가능
- Permission issue 명확히 파악
- Recovery 전략 수립 가능

### 8. Configuration Flexibility

#### ❌ 현재 CLI 방식
```typescript
// 모든 설정이 hard-coded 또는 환경변수
const args = [
    "--system-prompt", systemPrompt,
    "--verbose",
    "--output-format", "stream-json",
    "--disallowedTools", tools,
    "--max-turns", "1",
    "--model", modelId,
    "-p"
]
```

**문제**:
- 설정 변경 어려움
- 환경변수 의존
- User customization 불가

#### ✅ SDK 방식
```typescript
const result = query({
    prompt: userInput,
    options: {
        model: 'claude-sonnet-4-5-20250929',
        fallbackModel: 'claude-opus-4-20250929',  // 실패 시 대체
        
        maxTurns: 10,  // 작업에 따라 조절
        maxThinkingTokens: 5000,  // Thinking budget
        
        allowedTools: ['Read', 'Write', 'Bash'],  // 허용 도구
        disallowedTools: ['WebSearch'],  // 금지 도구
        
        permissionMode: 'acceptEdits',  // 자동 승인
        
        systemPrompt: {
            type: 'preset',
            preset: 'claude_code',
            append: 'Additional instructions'  // 추가 지침
        },
        
        settingSources: ['project', 'local'],  // 설정 소스
        
        cwd: customWorkingDirectory,
        additionalDirectories: ['/other/paths'],
        
        mcpServers: {
            // MCP 서버 설정
        },
        
        hooks: {
            // 이벤트 핸들러
        }
    }
})
```

**장점**:
- 모든 설정을 프로그래밍 방식으로 제어
- 작업별 최적화 가능
- User preference 완전 적용
- No 환경변수 의존

## Scalability 문제 해결 비교표

| Issue | CLI 방식 | SDK 방식 |
|-------|---------|---------|
| **Timeout 제한** | ❌ 10분 고정 | ✅ AbortController로 완전 제어 |
| **Buffer 크기** | ❌ 20MB 고정 | ✅ Streaming으로 무제한 |
| **Output Token** | ❌ 32000 제한 | ✅ Model 자연 제한만 |
| **Progress Reporting** | ❌ 없음 | ✅ Hook system으로 완전 지원 |
| **Partial Results** | ❌ All-or-nothing | ✅ Progressive streaming |
| **Subtask 관리** | ❌ 불투명 | ✅ 완전 제어 가능 |
| **Error Handling** | ❌ Generic error | ✅ Detailed error types |
| **Configuration** | ❌ Hard-coded | ✅ Fully configurable |
| **Memory 효율** | ❌ Buffer accumulation | ✅ Streaming processing |
| **User Experience** | ❌ Black box waiting | ✅ Real-time feedback |

## 실제 시나리오 비교

### Scenario: 대규모 코드 분석 (200+ files)

#### CLI 방식 (현재)
```typescript
// 예상 문제:
// 1. 10분 내 완료 못 할 수도 → TIMEOUT
// 2. 분석 결과 20MB 초과 → BUFFER OVERFLOW
// 3. 진행 상황 알 수 없음 → 사용자 불안
// 4. 중간에 중단 불가 → 답답함

try {
    const result = await runClaudeCode({
        systemPrompt: caretPrompt,
        messages: [{
            role: 'user',
            content: 'Analyze all TypeScript files in caret-src/'
        }],
        modelId: 'claude-sonnet-4',
        timeout: 600000  // 고정
    })
    
    // 성공 또는 실패 (binary)
} catch (error) {
    // "Process exited with code 1" 같은 generic error
    handleError(error)
}
```

#### SDK 방식 (미래)
```typescript
// 모든 문제 해결!

import { query } from '@anthropic-ai/claude-agent-sdk'

const abortController = new AbortController()
let filesProcessed = 0
let totalFiles = 0

const result = query({
    prompt: 'Analyze all TypeScript files in caret-src/',
    options: {
        model: 'claude-sonnet-4',
        fallbackModel: 'claude-opus-4',  // 실패 시 대체
        
        abortController,  // 사용자가 취소 버튼 누르면 abort
        
        maxTurns: 50,  // 충분한 turns
        
        allowedTools: ['Read', 'Glob', 'Grep'],
        
        hooks: {
            'PreToolUse': [{
                hooks: [async (input) => {
                    if (input.tool_name === 'Read') {
                        filesProcessed++
                        updateProgressUI({
                            current: filesProcessed,
                            total: totalFiles,
                            status: `Reading ${input.tool_input.file_path}`
                        })
                    }
                }]
            }],
            
            'PostToolUse': [{
                hooks: [async (input) => {
                    if (input.tool_name === 'Glob') {
                        totalFiles = input.tool_response.count
                    }
                    
                    // Partial result 즉시 표시
                    if (input.tool_response.analysis) {
                        appendResult(input.tool_response.analysis)
                    }
                }]
            }]
        }
    }
})

// Streaming 처리
for await (const message of result) {
    switch (message.type) {
        case 'assistant':
            // Assistant의 분석 내용
            displayAssistantMessage(message.message)
            break
            
        case 'result':
            if (message.subtype === 'success') {
                displayFinalResult(message.result)
                showCostInfo(message.total_cost_usd)
            } else if (message.subtype === 'error_max_turns') {
                // Partial success - 지금까지 분석한 것 표시
                displayPartialResult(message)
                offerToContinue()
            }
            break
    }
}

// 사용자가 취소 버튼 누르면
cancelButton.onclick = () => {
    abortController.abort()
    // SDK가 gracefully 종료하고 partial results 반환
}
```

**SDK 방식의 장점**:
1. ✅ Timeout 걱정 없음 (사용자가 원할 때까지)
2. ✅ 20MB 제한 없음 (streaming)
3. ✅ Real-time progress 표시 ("File 45/200 processing...")
4. ✅ 언제든 취소 가능
5. ✅ Partial results 즉시 확인
6. ✅ 비용 정보 투명하게 표시

## Migration 전략

### 현재 상태 (Phase 1)
```typescript
// src/core/api/providers/claude-code.ts
export class ClaudeCodeProvider {
    private adaptToolName(name: string): string {
        // Simple adapter pattern
    }
    
    async *streamMessage(options): AsyncGenerator {
        for await (const chunk of runClaudeCode(options)) {
            // CLI stdout parsing
            yield chunk
        }
    }
}
```

### SDK Migration (Future)
```typescript
// src/core/api/providers/claude-code-sdk.ts
import { query } from '@anthropic-ai/claude-agent-sdk'

export class ClaudeCodeSDKProvider {
    async *streamMessage(options): AsyncGenerator {
        const result = query({
            prompt: options.prompt,
            options: {
                // Full configuration from options
                model: options.model,
                abortController: options.abortController,
                hooks: this.setupHooks(options),
                // ... all other options
            }
        })
        
        // SDK가 모든 streaming 처리
        for await (const message of result) {
            // Type-safe message handling
            yield this.adaptSDKMessage(message)
        }
    }
    
    private setupHooks(options) {
        return {
            'PreToolUse': [{
                hooks: [async (input) => {
                    // Progress reporting
                    this.notifyProgress(input)
                }]
            }],
            'PostToolUse': [{
                hooks: [async (input) => {
                    // Result streaming
                    this.streamResult(input)
                }]
            }]
        }
    }
}
```

## 현실적 판단

### SDK의 현재 상태
- 📋 문서만 존재 (API specification)
- ❌ 실제 패키지 미출시
- ⏳ 출시 시기 불명확

### 권장 사항

**Short-term (현재 ~ SDK 출시 전)**:
- Phase 1 완료로 마무리
- CLI 방식의 한계 명확히 문서화
- "간단한 subtask만 지원" 명시
- 복잡한 작업은 Direct CLI 권장

**Medium-term (SDK 출시 직후)**:
- SDK Provider 구현
- Progressive migration (CLI → SDK)
- Feature flag로 선택적 활성화

**Long-term (SDK 안정화 후)**:
- SDK를 기본 provider로 전환
- Full scalability 지원
- Advanced features (progress UI, interrupts, etc.)

## 최종 결론

### 마스터의 질문에 대한 답변

> "복잡한 작업으로 엄청나게 많은 양의 결과가 리턴되면 현재 방식으로 처리 가능한가?"

**CLI 방식 (현재)**: ❌ 불가능
- Hard-coded limits로 인해 불가능
- 10분, 20MB, 32000 tokens 제약

**SDK 방식 (미래)**: ✅ 완전히 가능
- 모든 제약 해결
- Streaming으로 무제한 처리
- Progress tracking & control

### 현실적 선택

**지금 당장**: 
- SDK 사용 불가 (미출시)
- Phase 1 성공으로 마무리
- 제약 사항 명확히 문서화

**SDK 출시 시**: 
- 즉시 migration 시작
- 모든 scalability 문제 해결
- Caret의 killer feature로 발전 가능

---

**Related Documents**:
- Scalability Analysis: `2025-10-18-scalability-analysis.md`
- Phase 1 Implementation: `2025-10-17-phase1-adapter-implementation-complete.md`
- SDK Reference: `luke/references/claude-code-typescript-sdk.md`
