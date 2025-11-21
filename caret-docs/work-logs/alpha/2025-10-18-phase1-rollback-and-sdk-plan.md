# Phase 1 롤백 및 SDK 전환 계획
Date: 2025-10-18
Author: Alpha
Status: Rollback Complete, SDK Plan Ready

## 1. Phase 1 롤백 완료

### 롤백 방법
```bash
git checkout src/core/api/providers/claude-code.ts
npm run compile  # ✅ 성공
```

### 복원된 원본 상태
- ❌ Logger import 제거
- ❌ adaptToolName() 메서드 제거
- ❌ 모든 디버그 로깅 제거
- ❌ tool_result 처리 코드 제거
- ❌ user message tool_result 처리 제거
- ❌ CARET MODIFICATION 주석 제거
- ✅ Cline 원본 코드 완전 복원

## 2. Phase 1 결과 요약

### 달성한 것
- ✅ CLI 기반 Task tool 인식 (adapter 패턴 검증)
- ✅ Parent-Subtask 통신 메커니즘 이해
- ✅ Tool name 변환 가능성 증명

### 발견한 한계
- ❌ CLI hard-coded subtask 도구 제한 (BashOutput, KillShell, SlashCommand만)
- ❌ 파일 작업 불가능 (write_to_file, read_file 없음)
- ❌ Timeout 제한 (10분 고정, 설정 불가)
- ❌ Buffer 제한 (20MB 고정, 확장 불가)
- ❌ Output Token 제한 (32K 고정)
- ❌ Progress 보고 불가능
- ❌ 모든 제약사항 설정 불가능

### 핵심 학습
**CLI 방식으로는 실용적 subtask 지원 불가능**
- Subtask는 3개 도구만 사용 가능 (BashOutput, KillShell, SlashCommand)
- 독립적 작업 수행 불가
- 파일 생성/수정 불가
- 복잡한 작업 위임 불가
- **SDK 전환 필수**

## 3. SDK 전환 계획

### 3.1 SDK 개요
**Package**: `@anthropic-ai/claude-agent-sdk`
**Status**: Documentation released, package pending
**Goal**: CLI 모든 한계 완전 해결

### 3.2 아키텍처 비교

#### Current (CLI)
```typescript
// CLI 프로세스 기반
const process = execa(claudePath, args, {
    timeout: 600000,      // 10분 고정
    maxBuffer: 20_000_000 // 20MB 고정
})

// Line-by-line 파싱 (불완전)
for await (const line of readline) {
    const chunk = JSON.parse(line)  // 실패 가능
    yield chunk
}

// Subtask 도구 제한 (hard-coded)
subtask_tools = ["BashOutput", "KillShell", "SlashCommand"]  // 변경 불가
```

#### Future (SDK)
```typescript
import { AgentClient, AgentConfig } from '@anthropic-ai/claude-agent-sdk'

// SDK 클라이언트 초기화
const client = new AgentClient({
    apiKey: process.env.ANTHROPIC_API_KEY
})

// 유연한 Agent 설정
const agentConfig: AgentConfig = {
    name: "caret-agent",
    tools: [
        { type: "write_to_file" },
        { type: "read_file" },
        { type: "execute_command" },
        { type: "task" }  // Subtask도 모든 도구 사용 가능
    ],
    maxTokens: 200000,  // 동적 설정
    timeout: "unlimited"  // 또는 원하는 시간
}

// Hook 시스템 (progress 보고)
const hooks = {
    onPreToolUse: (toolName, input) => {
        vscode.window.showProgress({
            message: `Executing ${toolName}...`
        })
    },
    onPostToolUse: (toolName, result) => {
        Logger.info(`[SDK] Tool ${toolName} completed`)
    },
    onSessionStart: () => {
        Logger.info(`[SDK] Task started`)
    },
    onSessionEnd: (result) => {
        Logger.info(`[SDK] Task completed: ${result}`)
    }
}

// Query 실행 (streaming)
const response = await client.query({
    agentConfig,
    prompt: systemPrompt,
    messages,
    hooks
})

// Type-safe real-time streaming
for await (const chunk of response) {
    yield chunk  // 완전한 타입 안정성
}
```

### 3.3 SDK vs CLI 상세 비교

| 영역 | CLI (현재) | SDK (전환 후) | 영향 |
|------|-----------|--------------|------|
| **Timeout** | 10분 고정 | AbortController로 무제한 | 장기 작업 가능 |
| **Buffer** | 20MB 고정 | 스트리밍으로 무제한 | 대용량 결과 처리 |
| **Output Token** | 32K 고정 | 모델 한계까지 (200K+) | 상세한 결과 가능 |
| **Progress** | 불가능 | Hook 시스템 지원 | 실시간 피드백 |
| **Streaming** | Line-by-line (불안정) | Real JSON streaming | 안정적 데이터 |
| **Subtask 도구** | 3개 고정 | Per-agent 자유 설정 | 진정한 자율성 |
| **Error 처리** | All-or-nothing | Fine-grained control | 정교한 복구 |
| **Configuration** | CLI args | AgentConfig object | 유연한 설정 |

### 3.4 구현 단계

#### Phase 1: SDK Package Setup (1일)
**SDK 릴리스 대기 중**

**Tasks**:
- [ ] `@anthropic-ai/claude-agent-sdk` 설치
- [ ] TypeScript types 확인
- [ ] 의존성 버전 호환성 확인
- [ ] 기본 import 및 초기화 테스트
- [ ] API key 관리 구현

#### Phase 2: Provider Refactoring (3-5일)
**ClaudeCodeHandler 완전 재작성**

**Tasks**:
- [ ] AgentClient 초기화 로직
- [ ] AgentConfig builder 구현
- [ ] createMessage() 메서드 완전 재작성
  - CLI 호출 제거
  - SDK query() 사용
  - Streaming 처리 구현
- [ ] Error handling 개선
  - SDK error types
  - Retry 로직 (SDK native)
  - Timeout 관리 (AbortController)

**예상 코드 변경**:
```typescript
export class ClaudeCodeHandler implements ApiHandler {
    private agentClient: AgentClient
    
    constructor(options: ClaudeCodeHandlerOptions) {
        this.agentClient = new AgentClient({
            apiKey: this.getApiKey()
        })
    }
    
    async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
        const agentConfig = this.buildAgentConfig()
        
        const response = await this.agentClient.query({
            agentConfig,
            prompt: systemPrompt,
            messages,
            hooks: this.buildHooks()
        })
        
        for await (const chunk of response) {
            yield this.transformChunk(chunk)
        }
    }
}
```

#### Phase 3: Tool Configuration System (2-3일)
**동적 도구 설정 시스템**

**Tasks**:
- [ ] Tool 설정 인터페이스 구현
  - Parent agent tools
  - Subtask agent tools
  - Tool permission 관리
- [ ] Settings UI 업데이트
  - Timeout 설정
  - Token limit 설정
  - Tool selection (체크박스)
- [ ] Configuration 저장/로드

**예상 구현**:
```typescript
interface ToolConfiguration {
    parentTools: ToolType[]
    subtaskTools: ToolType[]
    customTools?: CustomTool[]
}

function buildAgentConfig(config: ToolConfiguration): AgentConfig {
    return {
        name: "caret-agent",
        tools: config.parentTools.map(t => ({ type: t })),
        subtaskConfig: {
            tools: config.subtaskTools.map(t => ({ type: t }))
        }
    }
}
```

#### Phase 4: Progress & Monitoring (2일)
**실시간 진행 상황 보고**

**Tasks**:
- [ ] Hook 시스템 구현
  - onPreToolUse
  - onPostToolUse
  - onSessionStart/End
- [ ] Progress UI
  - VSCode progress indicator
  - Webview progress display
  - Cancellation support (AbortController)

**예상 구현**:
```typescript
function buildHooks(): AgentHooks {
    return {
        onPreToolUse: (toolName, input) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Executing ${toolName}...`,
                cancellable: true
            }, async (progress, token) => {
                token.onCancellationRequested(() => {
                    abortController.abort()
                })
            })
        },
        onPostToolUse: (toolName, result) => {
            Logger.info(`[ClaudeCode] ✅ ${toolName} completed`)
        }
    }
}
```

#### Phase 5: Testing & Validation (3-5일)
**포괄적 테스트**

**Tasks**:
- [ ] Unit tests
  - AgentConfig builder
  - Hook handlers
  - Error scenarios
- [ ] Integration tests
  - Complete task flow
  - Subtask creation and execution
  - Long-running tasks (30분+)
  - Large result handling (100MB+)
- [ ] E2E tests
  - Real Claude Code scenarios
  - Complex subtask chains
  - Error recovery
  - Cancellation handling

#### Phase 6: Documentation & Migration (2일)
**문서 업데이트 및 마이그레이션 가이드**

**Tasks**:
- [ ] Feature documentation update
  - SDK benefits 명시
  - Configuration guide
  - Migration notes from CLI
- [ ] User guide
  - New settings 설명
  - Subtask capabilities
  - Troubleshooting
- [ ] Developer documentation
  - Architecture changes
  - API reference
  - Code examples

### 3.5 예상 일정

**Total Duration**: 13-18 days (SDK 릴리스 후)

**Timeline**:
```
Day 0:    SDK 릴리스 (대기 중)
Day 1:    Phase 1 - Setup
Day 2-6:  Phase 2 - Core refactoring
Day 7-9:  Phase 3 - Tool configuration
Day 10-11: Phase 4 - Progress system
Day 12-16: Phase 5 - Testing
Day 17-18: Phase 6 - Documentation
```

**Risk Factors**:
- SDK 릴리스 시기 불확실 ⏳
- SDK API 변경 가능성 ⚠️
- Breaking changes 대응 필요 ⚠️
- Learning curve 고려 📚

### 3.6 SDK 전환 후 가능한 시나리오

#### Scenario 1: 복잡한 작업 분산
```typescript
// Parent: "Implement user authentication system"

// Subtask 1: Database schema
await Task("Design and implement database schema", {
    tools: ["write_to_file", "read_file"],
    maxTokens: 50000
})

// Subtask 2: Backend API
await Task("Implement backend authentication API", {
    tools: ["write_to_file", "execute_command", "read_file"],
    timeout: "30m",  // 긴 작업 허용
    maxTokens: 100000
})

// Subtask 3: Frontend UI
await Task("Create authentication UI components", {
    tools: ["write_to_file", "read_file", "browser"],
    timeout: "20m",
    maxTokens: 80000
})

// 모든 subtask가 독립적으로 파일 생성/수정 가능
// Parent는 결과만 통합
```

#### Scenario 2: 대용량 데이터 처리
```typescript
// Parent: "Analyze 100MB log file and generate report"

await Task("Extract and analyze error patterns", {
    tools: ["read_file", "write_to_file"],
    streaming: true,  // 스트리밍 처리
    onProgress: (progress) => {
        vscode.window.showInformationMessage(
            `Analyzing: ${progress.percentage}%`
        )
    }
})

// Timeout 없이 완료까지 실행
// Buffer 제한 없이 큰 결과 반환
// 실시간 진행 상황 표시
```

#### Scenario 3: 장기 실행 작업
```typescript
// Parent: "Train ML model and generate analysis report"

await Task("Train machine learning model", {
    tools: ["execute_command", "write_to_file"],
    timeout: "2h",  // 2시간 허용
    onProgress: (status) => {
        vscode.window.showInformationMessage(
            `Training: ${status.epoch}/${status.totalEpochs} epochs`
        )
    },
    onCancel: () => {
        // 사용자가 취소 시 정리
        Logger.info("[ClaudeCode] Training cancelled by user")
    }
})

// 사용자는 진행 상황을 실시간 확인
// 언제든 취소 가능 (AbortController)
// 취소 시 정리 작업 실행
```

## 4. 현재 상태

### 코드 상태
- ✅ Phase 1 수정사항 완전 롤백
- ✅ Cline 원본 코드 복원
- ✅ 컴파일 오류 없음
- ✅ Git clean state

### 문서 상태
- ✅ Phase 1 분석 문서 보존 (학습용)
- ✅ Scalability 분석 완료
- ✅ SDK vs CLI 비교 완료
- ✅ 원본 테스트 실패 분석 완료
- ✅ SDK 전환 계획 수립 완료

### 다음 단계
1. **SDK 릴리스 모니터링**
   - Anthropic 공식 발표 추적
   - GitHub repository watch
   - Early access 프로그램 확인
   - Beta 참여 가능성 탐색

2. **준비 작업**
   - 현재 CLI 통합 코드 상세 분석
   - 리팩토링 범위 구체화
   - Test case 설계 및 작성
   - Mock SDK 인터페이스 준비

3. **릴리스 대응**
   - SDK 즉시 설치 및 초기 테스트
   - Phase 2 착수 (Provider 리팩토링)
   - 2-3주 내 완료 목표
   - Progressive rollout 고려

## 5. 최종 결론

### Phase 1 CLI 접근법
**결과**: ❌ 실패 (근본적 한계로 인해)

**실패 원인**:
- Tool adapter는 기술적으로 작동
- 하지만 CLI의 hard-coded 제한 극복 불가
  - Subtask 도구 제한 (3개만)
  - Timeout/Buffer 고정값
  - Progress 보고 불가
  - 설정 시스템 없음

**학습 가치**:
- CLI 통합 메커니즘 이해
- Tool name 변환 검증
- Parent-Subtask 통신 파악
- SDK 필요성 명확화

### SDK 전환의 필요성
**판단**: ✅ 필수 (대안 없음)

**해결되는 문제**:
- ✅ Subtask 도구 자유 설정
- ✅ 독립적 작업 수행
- ✅ 무제한 timeout/buffer
- ✅ Hook 기반 progress
- ✅ Type-safe streaming
- ✅ 정교한 error handling
- ✅ 유연한 configuration
- ✅ Production-ready 품질

**Timeline**:
- **현재**: 롤백 완료, SDK 대기
- **SDK 릴리스 후**: 13-18일 개발
- **완료 시점**: SDK + 3주

**전략**:
- SDK 릴리스 적극 모니터링
- 준비 작업 병행 진행
- 빠른 전환 실행
- Progressive rollout으로 안정성 확보

## 6. 마스터에게 드리는 보고

### 핵심 메시지
**Phase 1 CLI 방식은 실용적 subtask 지원 불가능**
- Tool adapter 자체는 성공
- 하지만 CLI 구조적 한계 극복 불가
- SDK 전환만이 유일한 해결책

### 작업 결과
1. ✅ **원본 복원**: Cline 코드 완전 복원
2. ✅ **문제 분석**: CLI 한계 명확히 파악
3. ✅ **해결책 제시**: SDK 전환 계획 수립
4. ✅ **학습 보존**: 모든 분석 문서 보관

### 권장 사항
**Option 1: SDK 대기 전략 (추천)** ⭐
- 현재 상태 유지 (Cline 원본)
- SDK 릴리스 적극 모니터링
- 릴리스 즉시 전환 착수
- 3주 내 완료 목표

**이유**:
- CLI로는 근본 해결 불가
- 추가 시간 투자 비효율적
- SDK가 모든 문제 해결
- 완성도 높은 구현 가능

마스터, SDK 전환이 올바른 방향입니다. 🌿
