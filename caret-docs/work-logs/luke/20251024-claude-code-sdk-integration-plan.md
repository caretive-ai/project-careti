# Claude Code TypeScript SDK 적용 작업 계획

**작성일**: 2025-10-24  
**작성자**: Luke  
**브랜치**: `feature/claude-code-sdk-integration`

## 1. 작업 목표

Claude Code Provider를 TypeScript SDK 기반으로 전환하여 다음을 지원:
- ✅ Subagent 완벽 지원
- ✅ Context Management 자동화
- ✅ Scalability 제약 해결 (timeout, buffer, output tokens)
- ✅ Hooks system 통한 progress tracking
- ✅ 모든 Claude Code 기능 (Slash Commands, Memory, etc.)

## 2. 현황 분석

### 2.1 SDK 출시 상태
- **현재**: SDK 미출시 (문서만 존재)
- **패키지명**: `@anthropic-ai/claude-agent-sdk` (구 `@anthropic-ai/claude-code`)
- **출시 시기**: 불명확

### 2.2 현재 구현 분석

#### AnthropicHandler (`src/core/api/providers/anthropic.ts`)
- 직접 Anthropic SDK 사용
- Streaming 지원
- Cache control 구현
- Extended thinking 지원

#### ClaudeCodeHandler (`src/core/api/providers/claude-code.ts`)
- CLI 방식으로 `runClaudeCode()` 호출
- Usage tracking 구현
- Error handling 구현
- 이미지 필터링

#### runClaudeCode (`src/integrations/claude-code/run.ts`)
- `execa`로 claude CLI 실행
- **제약사항**:
  ```typescript
  const CLAUDE_CODE_TIMEOUT = 600000        // 10분 고정
  const BUFFER_SIZE = 20_000_000           // 20MB 고정
  const CLAUDE_CODE_MAX_OUTPUT_TOKENS = "32000"  // 32000 tokens 고정
  ```
- Tool 비활성화: `--disallowedTools` 사용
- Max turns: `--max-turns 1` (Caret가 재귀 처리)

### 2.3 Scalability 문제

| Issue | CLI 방식 (현재) | SDK 방식 (미래) |
|-------|----------------|----------------|
| **Timeout** | ❌ 10분 고정 | ✅ AbortController로 완전 제어 |
| **Buffer** | ❌ 20MB 고정 | ✅ Streaming으로 무제한 |
| **Output Tokens** | ❌ 32000 제한 | ✅ Model 자연 제한만 |
| **Progress** | ❌ Black box | ✅ Hook system으로 실시간 |
| **Subagents** | ❌ 불투명 | ✅ 완전 제어 가능 |
| **Error Handling** | ❌ Generic | ✅ Detailed error types |

## 3. 작업 전략

### 3.1 Short-term (SDK 출시 전)
현재 작업으로는 **준비만** 진행:
1. ✅ 문서 분석 완료
2. ✅ 현재 구조 분석 완료
3. 📝 작업 계획 수립
4. 📦 아키텍처 설계 (SDK 출시 대비)
5. 📋 제약사항 문서화

### 3.2 Medium-term (SDK 출시 직후)
실제 구현:
1. SDK 패키지 설치
2. `ClaudeCodeSDKHandler` 구현
3. Feature flag로 선택적 활성화
4. 단계적 마이그레이션

### 3.3 Long-term (SDK 안정화 후)
완전 전환:
1. SDK를 기본 provider로 설정
2. CLI 방식 deprecated
3. Advanced features 활성화

## 4. 아키텍처 설계

### 4.1 새로운 파일 구조
```
src/core/api/providers/
├── anthropic.ts              (기존)
├── claude-code.ts            (기존 - CLI 방식)
├── claude-code-sdk.ts        (신규 - SDK 방식)
└── __tests__/
    ├── claude-code.test.ts   (기존)
    └── claude-code-sdk.test.ts (신규)

src/integrations/claude-code/
├── run.ts                    (기존 - CLI)
├── sdk.ts                    (신규 - SDK wrapper)
├── message-adapter.ts        (신규 - Message 변환)
└── types.ts                  (기존)
```

### 4.2 ClaudeCodeSDKHandler 구조

```typescript
// src/core/api/providers/claude-code-sdk.ts
import { query } from '@anthropic-ai/claude-agent-sdk'
import type { Options, SDKMessage, Query } from '@anthropic-ai/claude-agent-sdk'

export class ClaudeCodeSDKHandler implements ApiHandler {
    private options: ClaudeCodeSDKHandlerOptions
    
    constructor(options: ClaudeCodeSDKHandlerOptions) {
        this.options = options
    }

    async *createMessage(
        systemPrompt: string, 
        messages: Anthropic.Messages.MessageParam[]
    ): ApiStream {
        // SDK query() 호출
        const result = query({
            prompt: this.convertToSDKPrompt(messages),
            options: this.buildSDKOptions(systemPrompt)
        })

        // SDK 메시지를 Caret 형식으로 변환
        for await (const message of result) {
            yield this.adaptSDKMessage(message)
        }
    }

    private buildSDKOptions(systemPrompt: string): Options {
        return {
            // System prompt 설정
            systemPrompt: {
                type: 'preset',
                preset: 'claude_code',
                append: systemPrompt
            },
            
            // Model 설정
            model: this.options.apiModelId,
            fallbackModel: this.options.fallbackModel,
            
            // Tool 설정
            allowedTools: this.options.allowedTools,
            disallowedTools: this.options.disallowedTools,
            
            // Subagent 설정
            agents: this.buildAgentDefinitions(),
            
            // Hooks 설정 (progress tracking)
            hooks: this.setupHooks(),
            
            // Settings 로드
            settingSources: ['project'],  // CLAUDE.md 로드
            
            // Abort control
            abortController: this.options.abortController,
            
            // Working directory
            cwd: this.options.cwd,
            
            // Permission mode
            permissionMode: 'acceptEdits',
            
            // Max turns (Caret가 관리)
            maxTurns: 1,
            
            // Thinking budget
            maxThinkingTokens: this.options.thinkingBudgetTokens,
        }
    }

    private setupHooks() {
        return {
            'PreToolUse': [{
                hooks: [async (input) => {
                    // Progress reporting
                    this.notifyProgress({
                        tool: input.tool_name,
                        status: 'starting'
                    })
                }]
            }],
            'PostToolUse': [{
                hooks: [async (input) => {
                    // Result streaming
                    this.streamToolResult(input)
                }]
            }],
            'SessionStart': [{
                hooks: [async (input) => {
                    if (input.source === 'subagent') {
                        this.notifySubagentStart()
                    }
                }]
            }]
        }
    }

    private buildAgentDefinitions(): Record<string, AgentDefinition> {
        return {
            'analyzer': {
                description: 'Code analysis specialist',
                tools: ['Read', 'Grep', 'Glob'],
                prompt: 'Analyze code quality and structure',
                model: 'sonnet'
            },
            'implementer': {
                description: 'Code implementation specialist',
                tools: ['Read', 'Write', 'Edit', 'Bash'],
                prompt: 'Implement features and fixes',
                model: 'opus'
            }
        }
    }

    private adaptSDKMessage(message: SDKMessage): ApiStreamChunk {
        switch (message.type) {
            case 'assistant':
                return this.adaptAssistantMessage(message)
            
            case 'result':
                return this.adaptResultMessage(message)
            
            case 'stream_event':
                return this.adaptStreamEvent(message)
            
            default:
                return null
        }
    }
}
```

### 4.3 Message Adapter

```typescript
// src/integrations/claude-code/message-adapter.ts

/**
 * SDK Message → Caret ApiStreamChunk 변환
 */
export function adaptSDKToCaretMessage(message: SDKMessage): ApiStreamChunk {
    // SDKAssistantMessage → text/reasoning chunks
    // SDKResultMessage → usage chunk
    // SDKPartialAssistantMessage → partial text chunks
}

/**
 * Caret Messages → SDK Prompt 변환
 */
export function adaptCaretToSDKPrompt(
    messages: Anthropic.Messages.MessageParam[]
): string | AsyncIterable<SDKUserMessage> {
    // Anthropic format → SDK format
}
```

### 4.4 Feature Flag 시스템

```typescript
// src/shared/api.ts
export const claudeCodeSDKEnabled = () => {
    return process.env.CARET_CLAUDE_CODE_SDK_ENABLED === 'true'
}

// src/core/api/index.ts
export function getApiHandler(config: ApiConfiguration): ApiHandler {
    switch (config.apiProvider) {
        case 'claude-code':
            if (claudeCodeSDKEnabled()) {
                return new ClaudeCodeSDKHandler(config)
            }
            return new ClaudeCodeHandler(config)
        // ... other providers
    }
}
```

## 5. 구현 계획

### Phase 1: 준비 작업 (현재)
- [x] 문서 분석
- [x] 현재 구조 분석
- [x] 작업 계획 수립
- [ ] 아키텍처 설계 문서화
- [ ] 제약사항 문서화

### Phase 2: SDK 출시 대기
- [ ] SDK 출시 모니터링
- [ ] 커뮤니티 피드백 확인
- [ ] 마이그레이션 가이드 업데이트

### Phase 3: SDK 구현 (SDK 출시 후)
- [ ] SDK 패키지 설치
- [ ] `ClaudeCodeSDKHandler` 구현
- [ ] Message adapter 구현
- [ ] Hook system 구현
- [ ] Subagent 설정 구현

### Phase 4: 테스트 및 검증
- [ ] Unit tests 작성
- [ ] Integration tests 작성
- [ ] Feature flag 테스트
- [ ] Performance 비교

### Phase 5: 점진적 롤아웃
- [ ] Beta testing with feature flag
- [ ] User feedback 수집
- [ ] Bug fixes
- [ ] Documentation 업데이트

### Phase 6: 완전 전환
- [ ] SDK를 기본으로 설정
- [ ] CLI 방식 deprecated 마킹
- [ ] Migration guide 제공

## 6. 위험 요소 및 대응

### 6.1 SDK 출시 지연
**위험**: SDK 출시 시기 불명확
**대응**: 
- 현재 CLI 방식 유지
- 제약사항 명확히 문서화
- 복잡한 작업은 Direct CLI 권장

### 6.2 Breaking Changes
**위험**: SDK API가 문서와 다를 수 있음
**대응**:
- Feature flag로 안전한 테스트
- Adapter pattern으로 변경 격리
- Rollback 계획 수립

### 6.3 Performance 이슈
**위험**: SDK overhead가 CLI보다 클 수 있음
**대응**:
- Benchmark 테스트 필수
- Performance monitoring
- 필요시 최적화

## 7. 성공 지표

- ✅ SDK 설치 및 기본 통합 완료
- ✅ Subagent 완벽 동작
- ✅ Timeout/Buffer 제약 해결
- ✅ Progress tracking 동작
- ✅ 기존 기능 100% 호환
- ✅ Performance 저하 없음

## 8. 다음 단계

### 즉시 실행 가능
1. 이 계획 문서 커밋 및 푸시
2. 제약사항 문서 작성 (`cli-limitations.md`)
3. SDK 출시 모니터링 설정

### SDK 출시 시
1. SDK 패키지 설치
2. `ClaudeCodeSDKHandler` 구현 시작
3. TDD 방식으로 개발

## 9. 참고 문서

- `caret-docs/work-logs/alpha/2025-10-18-sdk-vs-cli-comparison.md` - CLI vs SDK 상세 비교
- `caret-docs/work-logs/luke/references/claude-code-sdk-overview.md` - SDK 개요
- `caret-docs/work-logs/luke/references/claude-code-migration.md` - Migration 가이드
- `caret-docs/work-logs/luke/references/claude-code-typescript-sdk.md` - API 레퍼런스

## 10. 결론

**현재 단계**: SDK 미출시로 인해 실제 구현은 보류  
**준비 완료**: 아키텍처 설계 및 마이그레이션 전략 수립 완료  
**대기 상태**: SDK 출시 즉시 구현 시작 가능

이 계획은 SDK 출시와 함께 Caret의 killer feature가 될 것입니다!
