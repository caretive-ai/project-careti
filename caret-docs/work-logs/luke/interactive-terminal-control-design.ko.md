# 대화형 터미널 제어 아키텍처

## 비전
Caret을 **메타-AI 오케스트레이터**로 전환 - 대화형 터미널 세션을 통해 여러 AI 코딩 어시스턴트를 제어하고 조정하는 상위 레벨 AI

## 전략적 가치
- **다중 AI 오케스트레이션**: Claude Code, Cursor, Aider, Cody, GitHub Copilot을 동시에 제어
- **작업 분배**: 가장 적합한 AI 도구로 작업 라우팅
- **컨텍스트 공유**: 서로 다른 AI 어시스턴트 간의 원활한 인수인계
- **강점 활용**: 각 AI의 고유한 기능을 최적으로 사용

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│              Caret 메타-AI 오케스트레이터                 │
│  ┌─────────────────┐  ┌──────────────────────────┐     │
│  │ 작업 라우터      │  │ 컨텍스트 동기화           │     │
│  │ - 작업 분석      │  │ - 파일 변경 공유         │     │
│  │ - AI 선택       │  │ - 워크스페이스 상태 동기화│     │
│  │ - 작업 분배      │  │ - 결과 병합              │     │
│  └─────────────────┘  └──────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                            ┃
        ┌───────────────────┼───────────────────┐
        ┃                   ┃                   ┃
┌───────▼─────────┐ ┌──────▼────────┐ ┌───────▼─────────┐
│ 대화형          │ │ 대화형        │ │ 대화형          │
│ 터미널          │ │ 터미널        │ │ 터미널          │
│ 세션 매니저      │ │ 세션 매니저   │ │ 세션 매니저      │
│                 │ │               │ │                 │
│ ┌─────────────┐ │ │ ┌───────────┐ │ │ ┌─────────────┐ │
│ │ Claude Code │ │ │ │  Cursor   │ │ │ │   Aider     │ │
│ │     CLI     │ │ │ │    CLI    │ │ │ │             │ │
│ └─────────────┘ │ │ └───────────┘ │ │ └─────────────┘ │
└─────────────────┘ └───────────────┘ └─────────────────┘
```

## Phase 1: 대화형 터미널 제어 (핵심 인프라)

### 1.1 Pseudoterminal 기반 세션 매니저

**위치**: `caret-src/integrations/terminal/interactive/`

```typescript
// InteractiveTerminalController.ts
export class InteractiveTerminalController {
  private sessions: Map<string, InteractiveSession> = new Map()

  // 새 대화형 세션 생성
  async createSession(config: SessionConfig): Promise<string> {
    const sessionId = generateULID()
    const pty = this.createPseudoterminal(config)
    const terminal = vscode.window.createTerminal({
      name: `${config.toolName} - ${sessionId.slice(-8)}`,
      pty
    })

    this.sessions.set(sessionId, {
      id: sessionId,
      toolName: config.toolName,
      terminal,
      pty,
      status: 'idle',
      outputBuffer: [],
      createdAt: Date.now()
    })

    return sessionId
  }

  // 세션에 입력 전송
  async sendInput(sessionId: string, input: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error(`Session ${sessionId} not found`)

    session.pty.handleInput(input + '\n')
    session.status = 'busy'
  }

  // 세션에서 출력 읽기
  getOutput(sessionId: string, since?: number): string[] {
    const session = this.sessions.get(sessionId)
    if (!session) return []

    const startIndex = since ?? 0
    return session.outputBuffer.slice(startIndex)
  }

  // 세션 종료
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.terminal.dispose()
      this.sessions.delete(sessionId)
    }
  }
}
```

### 1.2 Pseudoterminal 어댑터

```typescript
// PseudoterminalAdapter.ts
export class PseudoterminalAdapter implements vscode.Pseudoterminal {
  private writeEmitter = new vscode.EventEmitter<string>()
  private closeEmitter = new vscode.EventEmitter<number>()
  private process?: ChildProcess

  onDidWrite = this.writeEmitter.event
  onDidClose = this.closeEmitter.event

  constructor(
    private config: SessionConfig,
    private onOutput: (data: string) => void
  ) {}

  open(): void {
    // CLI 프로세스 실행
    this.process = spawn(this.config.command, this.config.args, {
      cwd: this.config.cwd,
      env: { ...process.env, ...this.config.env }
    })

    // stdout을 터미널로 스트리밍
    this.process.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.writeEmitter.fire(text)
      this.onOutput(text)
    })

    // stderr을 터미널로 스트리밍
    this.process.stderr?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.writeEmitter.fire(`\x1b[31m${text}\x1b[0m`) // 빨간색
      this.onOutput(text)
    })

    // 프로세스 종료 처리
    this.process.on('exit', (code) => {
      this.closeEmitter.fire(code ?? 0)
    })
  }

  handleInput(data: string): void {
    this.process?.stdin?.write(data)
  }

  close(): void {
    this.process?.kill()
  }
}
```

### 1.3 세션 레지스트리

```typescript
// SessionRegistry.ts
export interface InteractiveSession {
  id: string
  toolName: AIToolType
  terminal: vscode.Terminal
  pty: PseudoterminalAdapter
  status: 'idle' | 'busy' | 'waiting-input' | 'error'
  outputBuffer: string[]
  createdAt: number
  lastActivity: number
}

export type AIToolType =
  | 'claude-code'
  | 'cursor'
  | 'aider'
  | 'cody'
  | 'github-copilot'
  | 'custom'

export interface SessionConfig {
  toolName: AIToolType
  command: string
  args: string[]
  cwd: string
  env?: Record<string, string>
}
```

### 1.4 gRPC API 정의

**위치**: `proto/caret/interactive_terminal.proto`

```protobuf
syntax = "proto3";

package caret.interactive_terminal;

service InteractiveTerminalService {
  rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);
  rpc SendInput(SendInputRequest) returns (SendInputResponse);
  rpc GetOutput(GetOutputRequest) returns (GetOutputResponse);
  rpc CloseSession(CloseSessionRequest) returns (CloseSessionResponse);
  rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);
}

message CreateSessionRequest {
  string tool_name = 1;      // 'claude-code', 'cursor', 등
  string command = 2;        // 'claude', 'cursor', 등
  repeated string args = 3;  // ['code']
  string cwd = 4;
  map<string, string> env = 5;
}

message CreateSessionResponse {
  string session_id = 1;
}

message SendInputRequest {
  string session_id = 1;
  string input = 2;
}

message SendInputResponse {
  bool success = 1;
}

message GetOutputRequest {
  string session_id = 1;
  int32 since_index = 2;  // 이 인덱스 이후의 출력 가져오기
}

message GetOutputResponse {
  repeated string output_lines = 1;
  int32 current_index = 2;
}

message CloseSessionRequest {
  string session_id = 1;
}

message CloseSessionResponse {
  bool success = 1;
}

message ListSessionsRequest {}

message ListSessionsResponse {
  repeated SessionInfo sessions = 1;
}

message SessionInfo {
  string session_id = 1;
  string tool_name = 2;
  string status = 3;
  int64 created_at = 4;
  int64 last_activity = 5;
}
```

## Phase 2: 다중 AI 오케스트레이터

### 2.1 작업 라우터

```typescript
// caret-src/core/orchestrator/TaskRouter.ts
export class TaskRouter {
  // 작업을 분석하고 최적의 AI 도구 결정
  async routeTask(task: Task): Promise<AIToolType[]> {
    const complexity = this.analyzeComplexity(task)
    const scope = this.analyzeScope(task)

    // 라우팅 로직
    if (complexity === 'high' && scope === 'architecture') {
      return ['claude-code']  // 깊은 추론
    }

    if (complexity === 'low' && scope === 'single-file') {
      return ['cursor']  // 빠른 편집
    }

    if (scope === 'codebase-wide') {
      return ['aider']  // 대규모 리팩토링
    }

    // 복잡한 작업을 위한 다중 AI 전략
    if (complexity === 'high' && scope === 'multi-file') {
      return ['claude-code', 'cursor']  // 설계 + 구현
    }

    return ['claude-code']  // 기본값
  }
}
```

### 2.2 컨텍스트 동기화

```typescript
// caret-src/core/orchestrator/ContextSynchronizer.ts
export class ContextSynchronizer {
  // AI 세션 간 컨텍스트 공유
  async syncContext(
    fromSessionId: string,
    toSessionId: string,
    context: WorkspaceContext
  ): Promise<void> {
    // 소스 세션에서 파일 변경 가져오기
    const changes = await this.getFileChanges(fromSessionId)

    // 타겟 세션으로 컨텍스트 전송
    await this.sendContext(toSessionId, {
      files: changes.modifiedFiles,
      summary: changes.summary,
      nextTask: context.nextTask
    })
  }
}
```

## Phase 3: 프론트엔드 UI

### 3.1 다중 AI 터미널 패널

**위치**: `webview-ui/src/components/interactive-terminal/`

```typescript
// MultiAITerminalPanel.tsx
export const MultiAITerminalPanel = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>()

  // 새 AI 세션 생성
  const createSession = async (toolName: AIToolType) => {
    const response = await InteractiveTerminalServiceClient.CreateSession({
      toolName,
      command: getCommandForTool(toolName),
      args: ['code'],  // 또는 적절한 인자
      cwd: workspaceRoot
    })

    // 세션 목록 새로고침
    await loadSessions()
  }

  // 활성 세션에 입력 전송
  const sendInput = async (input: string) => {
    if (!activeSessionId) return

    await InteractiveTerminalServiceClient.SendInput({
      sessionId: activeSessionId,
      input
    })
  }

  return (
    <div className="multi-ai-terminal">
      <SessionTabs
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onCreate={createSession}
      />

      <TerminalOutput
        sessionId={activeSessionId}
        onInput={sendInput}
      />

      <AIToolSelector
        onSelect={createSession}
      />
    </div>
  )
}
```

## 구현 체크리스트

### Phase 1 (핵심 인프라 - MVP)
- [ ] `caret-src/integrations/terminal/interactive/` 디렉토리 구조 생성
- [ ] `InteractiveTerminalController.ts` 구현
- [ ] `PseudoterminalAdapter.ts` 구현
- [ ] `SessionRegistry.ts` 구현
- [ ] `proto/caret/interactive_terminal.proto` 정의
- [ ] gRPC 클라이언트/서버 코드 생성 (`npm run protos`)
- [ ] `src/core/controller/interactive-terminal/`에 gRPC 핸들러 구현
- [ ] 터미널 제어를 위한 통합 테스트 작성
- [ ] `claude code` CLI로 테스트

### Phase 2 (다중 AI 오케스트레이션)
- [ ] `AIOrchestrator.ts` 구현
- [ ] 라우팅 전략을 포함한 `TaskRouter.ts` 구현
- [ ] `ContextSynchronizer.ts` 구현
- [ ] AI 도구 설정 정의 (명령어, 인자, 환경변수)
- [ ] 도구별 어댑터 생성 (ClaudeCodeAdapter, CursorAdapter 등)
- [ ] 결과 병합 로직 구현

### Phase 3 (프론트엔드 UI)
- [ ] `MultiAITerminalPanel.tsx` 생성
- [ ] `SessionTabs.tsx` 컴포넌트 생성
- [ ] 실시간 스트리밍을 포함한 `TerminalOutput.tsx` 생성
- [ ] AI 도구 선택을 위한 `AIToolSelector.tsx` 생성
- [ ] 세션 상태 인디케이터 구현
- [ ] 터미널 상호작용을 위한 키보드 단축키 추가

### Phase 4 (고급 기능)
- [ ] 시스템에서 사용 가능한 AI CLI 자동 감지
- [ ] 세션 영속성 (VS Code 재시작 후에도 유지)
- [ ] 출력 파싱 및 구조화된 결과
- [ ] AI 간 협업 프로토콜
- [ ] 성능 모니터링 및 텔레메트리

## 사용 시나리오 예시

### 시나리오 1: 간단한 작업
```typescript
// 사용자: "README.md의 오타 수정해줘"
// Caret → Cursor로 라우팅 (빠르고 간단한 편집)

const sessionId = await orchestrator.createSession('cursor')
await orchestrator.sendCommand(sessionId, 'README.md의 오타 수정해줘')
const result = await orchestrator.waitForCompletion(sessionId)
```

### 시나리오 2: 복잡한 아키텍처 작업
```typescript
// 사용자: "인증을 OAuth2로 마이그레이션해줘"
// Caret → 다중 AI 전략

// Step 1: 아키텍처 설계를 위한 Claude Code
const designSession = await orchestrator.createSession('claude-code')
await orchestrator.sendCommand(designSession,
  'OAuth2 마이그레이션 아키텍처를 설계하고 마이그레이션 계획 만들어줘'
)
const plan = await orchestrator.waitForCompletion(designSession)

// Step 2: 보일러플레이트 생성을 위한 Cursor
const codeSession = await orchestrator.createSession('cursor')
await orchestrator.shareContext(designSession, codeSession)
await orchestrator.sendCommand(codeSession,
  '계획을 기반으로 OAuth2 보일러플레이트 생성해줘'
)

// Step 3: 코드베이스 전체 리팩토링을 위한 Aider
const refactorSession = await orchestrator.createSession('aider')
await orchestrator.sendCommand(refactorSession,
  '모든 인증 관련 코드를 새 OAuth2 시스템으로 리팩토링해줘'
)
```

### 시나리오 3: 병렬 다중 AI
```typescript
// 사용자: "프론트엔드와 백엔드 전체 성능 최적화해줘"

const [frontendSession, backendSession] = await Promise.all([
  orchestrator.createSession('cursor'),  // 프론트엔드 최적화
  orchestrator.createSession('aider')    // 백엔드 최적화
])

await Promise.all([
  orchestrator.sendCommand(frontendSession, 'React 컴포넌트 최적화해줘'),
  orchestrator.sendCommand(backendSession, '데이터베이스 쿼리 최적화해줘')
])

// 결과 병합
const results = await orchestrator.mergeResults([
  frontendSession,
  backendSession
])
```

## 기술적 고려사항

### 보안
- **AI CLI 프로세스 샌드박싱**: 무단 시스템 접근 방지
- **입력 검증**: CLI로 전송하기 전 모든 사용자 입력 sanitize
- **리소스 제한**: 세션당 메모리/CPU 할당량

### 성능
- **세션 풀링**: 시작 오버헤드를 피하기 위해 세션 재사용
- **출력 버퍼링**: 대용량 출력을 위한 효율적인 스트리밍
- **동시 실행 제한**: 최대 N개의 동시 AI 세션

### 에러 처리
- **CLI 크래시**: 지수 백오프를 사용한 자동 재시작
- **타임아웃 처리**: AI 도구별 구성 가능한 타임아웃
- **우아한 저하**: Caret의 내장 기능으로 폴백

## 성공 지표

- **세션 생성 시간**: 새 AI CLI 세션에 대해 < 2초
- **입력 지연시간**: 사용자 입력에서 CLI까지 < 100ms
- **출력 스트리밍**: 실시간 (< 50ms 청크)
- **다중 AI 작업 완료**: 2개 이상의 AI 도구의 성공적인 오케스트레이션
- **사용자 만족도**: 개발자가 수동 CLI 전환보다 Caret 오케스트레이션 선호

## 다음 단계

1. **Phase 1 MVP 구현** (대화형 터미널 제어)
   - 목표: 기본 `claude code` CLI 제어 작동
   - 일정: 1-2일

2. **Claude Code CLI로 사용자 테스트**
   - UX 및 성능 검증
   - 피드백 수집

3. **다중 AI로 확장** (Phase 2)
   - Cursor, Aider 지원 추가
   - 오케스트레이션 로직 구현
   - 일정: 3-5일

4. **완성 및 릴리스** (Phase 3)
   - 프로덕션 준비 UI
   - 문서화
   - 일정: 2-3일

## 관련 문서

- [Caret 아키텍처 가이드](../development/caret-architecture-and-implementation-guide.md)
- [프론트엔드-백엔드 상호작용 패턴](../development/frontend-backend-interaction-patterns.md)
- [터미널 관리 (Cline)](../development/cline-overview.md#terminal-management)
