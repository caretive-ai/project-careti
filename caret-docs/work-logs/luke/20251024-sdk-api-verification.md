# Claude Code SDK API 검증 및 계획 조정

**작성일**: 2025-10-24  
**작성자**: Luke  
**SDK 버전**: @anthropic-ai/claude-agent-sdk v0.1.25

## 1. SDK 설치 확인 ✅

```bash
npm install @anthropic-ai/claude-agent-sdk
# Added 5 packages successfully
# Package: @anthropic-ai/claude-agent-sdk@0.1.25
```

## 2. 실제 SDK API 구조

### 2.1 주요 진입점: `query()` 함수

**실제 API**:
```typescript
function query(params: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;

interface Query extends AsyncGenerator<SDKMessage, void> {
  // Control methods (스트리밍 중 제어)
  interrupt(): Promise<void>;
  setPermissionMode(mode: PermissionMode): Promise<void>;
  setModel(model?: string): Promise<void>;
  setMaxThinkingTokens(maxThinkingTokens: number | null): Promise<void>;
  supportedCommands(): Promise<SlashCommand[]>;
  supportedModels(): Promise<ModelInfo[]>;
  mcpServerStatus(): Promise<McpServerStatus[]>;
  accountInfo(): Promise<AccountInfo>;
}
```

**계획서에서 예상했던 API**:
```typescript
const sdk = new ClaudeCodeSDK({ apiKey });
const session = await sdk.createSession({ systemPrompt, maxTurns });
```

**차이점**:
- ❌ 클래스 기반이 아님 → ✅ 함수 기반 API
- ❌ 세션 객체가 없음 → ✅ AsyncGenerator 방식
- ✅ 스트리밍 우선 설계 (AsyncGenerator)
- ✅ 제어 메서드가 Query 인터페이스에 통합

### 2.2 Options - CLI 제약사항 해결 ✅

```typescript
type Options = {
  // 🎯 CLI 하드코딩 제약 해결
  maxTurns?: number;                    // CLI: 무제한 (메모리 부족 위험)
  maxThinkingTokens?: number;           // CLI: 32000 고정
  abortController?: AbortController;    // CLI: 10분 타임아웃 고정
  
  // 🚀 추가 제어 옵션
  permissionMode?: PermissionMode;      // 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'
  model?: string;                       // 모델 선택
  fallbackModel?: string;               // 폴백 모델
  
  // 🎣 Hook 시스템
  hooks?: Partial<Record<HookEvent, HookCallbackMatcher[]>>;
  
  // 🤖 Subagent 시스템
  agents?: Record<string, AgentDefinition>;
  
  // 🔧 MCP 서버 설정
  mcpServers?: Record<string, McpServerConfig>;
  
  // 🛠️ 도구 제어
  allowedTools?: string[];
  disallowedTools?: string[];
  canUseTool?: CanUseTool;              // 권한 콜백
  
  // 📁 작업 디렉토리 및 환경
  cwd?: string;
  env?: { [envVar: string]: string | undefined };
  additionalDirectories?: string[];
  
  // 🔄 세션 재개
  resume?: string;                      // 세션 ID
  resumeSessionAt?: string;             // 특정 메시지부터 재개
  forkSession?: boolean;                // 포크 생성
  
  // 💬 시스템 프롬프트
  systemPrompt?: string | {
    type: 'preset';
    preset: 'claude_code';
    append?: string;
  };
};
```

### 2.3 Hook 시스템 ✅

```typescript
const HOOK_EVENTS = [
  "PreToolUse",      // 도구 실행 전
  "PostToolUse",     // 도구 실행 후
  "Notification",    // 알림
  "UserPromptSubmit",// 사용자 입력 제출
  "SessionStart",    // 세션 시작
  "SessionEnd",      // 세션 종료
  "Stop",            // 중단
  "SubagentStop",    // Subagent 중단
  "PreCompact"       // 컨텍스트 압축 전
];

type HookCallback = (
  input: HookInput,
  toolUseID: string | undefined,
  options: { signal: AbortSignal }
) => Promise<HookJSONOutput>;
```

**계획서 대비 개선점**:
- ✅ 더 세분화된 Hook 이벤트
- ✅ AbortSignal 지원
- ✅ JSON 기반 출력 (async/sync 지원)

### 2.4 Subagent 시스템 ✅

```typescript
type AgentDefinition = {
  description: string;
  tools?: string[];
  prompt: string;
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
};

// 사용 예시
const agents = {
  'code-reviewer': {
    description: 'Code review specialist',
    tools: ['read_file', 'search_files'],
    prompt: 'You are a code reviewer...',
    model: 'opus'
  }
};
```

### 2.5 메시지 타입 시스템 ✅

```typescript
type SDKMessage = 
  | SDKAssistantMessage      // AI 응답
  | SDKUserMessage           // 사용자 메시지
  | SDKUserMessageReplay     // 재생 메시지
  | SDKResultMessage         // 최종 결과
  | SDKSystemMessage         // 시스템 메시지
  | SDKPartialAssistantMessage // 스트리밍 중 부분 메시지
  | SDKCompactBoundaryMessage  // 압축 경계
  | SDKHookResponseMessage;    // Hook 응답
```

## 3. 계획 조정

### 3.1 아키텍처 변경

**기존 계획**:
```typescript
class ClaudeCodeSDKHandler extends ClaudeCodeHandler {
  async *createMessage(systemPrompt, messages, abortSignal) {
    const sdk = new ClaudeCodeSDK({ apiKey });
    const session = await sdk.createSession({ ... });
    // ...
  }
}
```

**실제 구현**:
```typescript
class ClaudeCodeSDKHandler extends ClaudeCodeHandler {
  async *createMessage(systemPrompt, messages, abortSignal) {
    const abortController = new AbortController();
    
    const queryInstance = query({
      prompt: this.buildPrompt(messages),
      options: {
        systemPrompt,
        maxTurns: this.getMaxTurns(),
        maxThinkingTokens: this.getMaxThinkingTokens(),
        abortController,
        hooks: this.buildHooks(),
        agents: this.buildAgents(),
        model: this.apiConfiguration.apiModelId,
        permissionMode: 'bypassPermissions', // Caret 자체 권한 시스템 사용
        cwd: workspace.rootPath,
      }
    });
    
    for await (const message of queryInstance) {
      yield this.adaptMessage(message);
    }
  }
}
```

### 3.2 Message Adapter 간소화

**스트리밍 지원으로 인한 간소화**:
- SDK가 이미 스트리밍 제공 → Adapter는 메시지 포맷 변환만 담당
- `SDKMessage` → Caret `ApiStream` 변환

### 3.3 Hook System 통합 방안

**Caret의 기존 Hook과 SDK Hook 연결**:
```typescript
private buildHooks(): Options['hooks'] {
  return {
    PreToolUse: [{
      hooks: [async (input, toolUseID, { signal }) => {
        // Caret의 tool approval 시스템 호출
        const approved = await this.caretToolApproval(input.tool_name, input.tool_input);
        return {
          continue: approved,
          decision: approved ? 'approve' : 'block',
        };
      }]
    }],
    PostToolUse: [{
      hooks: [async (input, toolUseID) => {
        // Caret의 checkpoint 시스템 연동
        await this.caretCheckpoint.save(toolUseID);
        return { continue: true };
      }]
    }]
  };
}
```

## 4. 구현 우선순위 재조정

### Phase 4-1: 기본 통합 (Week 1)
1. ✅ SDK 설치 완료
2. ⬜ **ClaudeCodeSDKHandler 기본 구현**
   - `query()` 함수 호출
   - 기본 Options 설정
   - 스트리밍 메시지 처리
3. ⬜ **Message Adapter 구현**
   - `SDKMessage` → `ApiStream` 변환
   - 메시지 타입별 핸들링
4. ⬜ **단위 테스트**

### Phase 4-2: 제약사항 해결 (Week 2)
1. ⬜ **Timeout 제어**
   - `AbortController` 통합
   - 사용자 설정 가능한 타임아웃
2. ⬜ **MaxTurns 설정**
   - 사용자 정의 가능
3. ⬜ **MaxThinkingTokens 설정**
   - 32000 고정 → 사용자 설정 가능

### Phase 4-3: Hook 통합 (Week 3)
1. ⬜ PreToolUse Hook → Caret tool approval 연동
2. ⬜ PostToolUse Hook → Checkpoint 시스템 연동
3. ⬜ SessionStart/End → 세션 관리 연동

### Phase 4-4: Subagent 지원 (Week 4)
1. ⬜ AgentDefinition 빌더
2. ⬜ Subagent 메시지 처리
3. ⬜ 중첩 agent 지원

## 5. 주요 차이점 요약

| 항목 | 계획서 예상 | 실제 SDK |
|-----|-----------|----------|
| API 스타일 | 클래스 기반 | 함수 기반 |
| 스트리밍 | 수동 구현 필요 | AsyncGenerator 내장 |
| Timeout 제어 | 옵션 추가 필요 | AbortController 지원 |
| Hook 시스템 | 별도 구현 | 9가지 Hook 내장 |
| Subagent | 메시지 파싱 필요 | AgentDefinition 지원 |
| 권한 시스템 | 별도 구현 | canUseTool 콜백 지원 |
| MCP 통합 | 별도 구현 | createSdkMcpServer 지원 |

## 6. 다음 단계

### 즉시 실행 (오늘)
1. ⬜ `ClaudeCodeSDKHandler` 기본 구현
2. ⬜ `sdk.d.ts` 참고하여 타입 정의 작성
3. ⬜ 간단한 테스트 코드 작성

### Week 1 목표
- 기본적인 SDK 통합 완료
- Anthropic handler와 동일한 수준의 기본 기능 구현
- 스트리밍 메시지 처리 완료

---

**결론**: 실제 SDK는 계획서에서 예상한 것보다 **훨씬 더 완성도가 높고**, CLI의 모든 제약사항을 해결할 수 있는 옵션을 제공합니다. 구현이 계획보다 **단순화**되었습니다! 🎉
