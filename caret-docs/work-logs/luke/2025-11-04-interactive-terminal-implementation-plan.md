# Interactive Terminal 구현 계획서

**작성일**: 2025-11-04
**목표**: Caret 모드에서 터미널을 유연하게 제어할 수 있는 Interactive Terminal 시스템 구축
**IntelliJ 호환**: 플랫폼 독립적 설계로 IntelliJ 포팅 시 코어 로직 재사용 가능

---

## 🎯 프로젝트 목표

### 비즈니스 목표
- **Caret 전용 기능**: Feature flag로 제어되는 Caret 모드 전용 기능
- **Claude Code 제어**: Claude Code CLI를 대화형으로 완전히 제어
- **확장 가능성**: 향후 Cursor, Aider 등 다른 AI 도구로 확장 가능
- **플랫폼 독립성**: IntelliJ 포팅 시 코어 로직 85% 재사용 가능

### 기술 목표
- **현재 터미널 시스템 한계 극복**: 일회성 명령어 실행 → persistent interactive session
- **리눅스 blocking 문제 해결**: Shell integration 타임아웃 → non-blocking Pseudoterminal
- **완전 격리**: `caret-src/` 디렉토리에만 존재, Cline 코드 수정 없음

---

## 📐 아키텍처 설계

### 핵심 원칙

1. **플랫폼 독립적 코어 (Platform-Agnostic Core)**
   - 비즈니스 로직을 인터페이스 기반으로 설계
   - VS Code/IntelliJ 구현체는 어댑터 패턴으로 분리

2. **인터페이스 기반 설계 (Interface-Based Design)**
   - `ITerminalAdapter`: 터미널 제어 인터페이스
   - `IProcessExecutor`: 프로세스 실행 인터페이스
   - `ITerminalUI`: UI 인터페이스 (옵션)

3. **완전 격리 (Complete Isolation)**
   - 모든 코드는 `caret-src/` 하위에 위치
   - Cline 원본 코드 수정 없음
   - Feature flag로 활성화 제어

### 디렉토리 구조

```
caret-src/integrations/terminal/interactive/
├── core/                                    # 플랫폼 독립적 (IntelliJ 재사용 100%)
│   ├── interfaces/
│   │   ├── ITerminalAdapter.ts             # 터미널 어댑터 인터페이스
│   │   ├── IProcessExecutor.ts             # 프로세스 실행 인터페이스
│   │   └── ITerminalUI.ts                  # UI 인터페이스 (옵션)
│   ├── types.ts                            # 공통 타입 정의
│   ├── InteractiveSession.ts               # 세션 로직 (플랫폼 독립)
│   ├── SessionManager.ts                   # 세션 관리 (플랫폼 독립)
│   └── OutputParser.ts                     # 출력 파싱 (플랫폼 독립)
│
├── adapters/                                # 플랫폼별 구현
│   ├── vscode/
│   │   ├── VSCodeTerminalAdapter.ts        # Pseudoterminal 구현
│   │   ├── VSCodeProcessExecutor.ts        # ChildProcess 래퍼
│   │   └── index.ts                        # 팩토리 함수
│   └── intellij/                            # 미래 구현
│       ├── IntelliJTerminalAdapter.ts      # IntelliJ Terminal API
│       └── index.ts
│
├── ai-tools/                                # AI 도구 어댑터 (플랫폼 독립 100%)
│   ├── base/
│   │   └── BaseAIAdapter.ts                # 공통 로직
│   ├── ClaudeCodeAdapter.ts                # Claude Code 전용
│   ├── CursorAdapter.ts                    # Cursor 전용 (미래)
│   └── AiderAdapter.ts                     # Aider 전용 (미래)
│
└── __tests__/
    ├── core/                                # 코어 로직 테스트
    │   ├── InteractiveSession.test.ts
    │   └── SessionManager.test.ts
    ├── adapters/                            # 어댑터별 테스트
    │   └── vscode/
    │       └── VSCodeTerminalAdapter.test.ts
    └── ai-tools/                            # AI 도구 테스트
        └── ClaudeCodeAdapter.test.ts
```

### 핵심 인터페이스

#### ITerminalAdapter
```typescript
export interface ITerminalAdapter {
  // 세션 시작
  start(config: SessionConfig): Promise<void>

  // 입력 전송
  sendInput(data: string): void

  // 이벤트 구독
  onOutput(callback: (data: string) => void): Disposable
  onExit(callback: (code: number) => void): Disposable

  // 정리
  dispose(): void
}
```

#### SessionConfig
```typescript
export interface SessionConfig {
  command: string           // 실행할 명령어 (예: 'claude', 'python3')
  args: string[]           // 인자 (예: ['code'], ['-i'])
  cwd: string              // 작업 디렉토리
  env?: Record<string, string>  // 환경 변수
}
```

#### SessionInfo
```typescript
export interface SessionInfo {
  id: string               // ULID 세션 ID
  toolName: string         // AI 도구 이름 ('claude-code', 'python' 등)
  status: 'idle' | 'busy' | 'error'  // 세션 상태
  createdAt: number        // 생성 시간
  lastActivity: number     // 마지막 활동 시간
}
```

---

## 📅 단계별 구현 계획

### Phase 0: 아키텍처 설계 및 인터페이스 정의 (0.5일)

**목표**: 플랫폼 독립적 설계 완성

#### 작업 항목
1. ✅ 디렉토리 구조 생성
2. ✅ 인터페이스 정의 (`ITerminalAdapter`, `IProcessExecutor`)
3. ✅ 공통 타입 정의 (`SessionConfig`, `SessionInfo`)
4. ✅ Feature flag 추가

#### 파일 생성
```bash
# 인터페이스
caret-src/integrations/terminal/interactive/core/interfaces/ITerminalAdapter.ts
caret-src/integrations/terminal/interactive/core/interfaces/IProcessExecutor.ts
caret-src/integrations/terminal/interactive/core/types.ts

# Feature flag
caret-src/shared/feature-config.json (enableInteractiveTerminal: true)
```

#### 검증 기준
- [ ] TypeScript 컴파일 성공
- [ ] 인터페이스 문서화 완료
- [ ] 타입 정의 완료

---

### Phase 1: 플랫폼 독립적 코어 구현 (1일)

**목표**: VS Code/IntelliJ 모두에서 재사용 가능한 로직 구현

#### 작업 항목
1. ✅ `InteractiveSession` 클래스 구현
   - 어댑터 패턴으로 플랫폼 독립성 보장
   - 입력/출력 버퍼 관리
   - 이벤트 기반 아키텍처

2. ✅ `SessionManager` 클래스 구현
   - 세션 생성/조회/삭제
   - 팩토리 패턴으로 어댑터 주입
   - 세션 라이프사이클 관리

3. ✅ `OutputParser` 유틸리티 구현
   - ANSI 코드 제거
   - 출력 라인 파싱
   - 버퍼 관리

#### 핵심 코드 구조

```typescript
// InteractiveSession.ts
export class InteractiveSession extends EventEmitter {
  private outputBuffer: string[] = []

  constructor(
    private adapter: ITerminalAdapter,  // 플랫폼 독립!
    private config: SessionConfig
  ) {
    super()
  }

  async start(): Promise<void> {
    await this.adapter.start(this.config)

    this.adapter.onOutput((data) => {
      this.outputBuffer.push(data)
      this.emit('output', data)
    })

    this.adapter.onExit((code) => {
      this.emit('exit', code)
    })
  }

  sendInput(text: string): void {
    this.adapter.sendInput(text + '\n')
  }

  getOutput(since?: number): string[] {
    return this.outputBuffer.slice(since || 0)
  }

  dispose(): void {
    this.adapter.dispose()
  }
}

// SessionManager.ts
export class SessionManager {
  private sessions: Map<string, InteractiveSession> = new Map()

  constructor(
    private adapterFactory: () => ITerminalAdapter  // 팩토리 패턴
  ) {}

  async createSession(config: SessionConfig): Promise<string> {
    const id = generateULID()
    const adapter = this.adapterFactory()  // VS Code or IntelliJ
    const session = new InteractiveSession(adapter, config)

    await session.start()
    this.sessions.set(id, session)
    return id
  }

  getSession(id: string): InteractiveSession | undefined {
    return this.sessions.get(id)
  }

  closeSession(id: string): void {
    const session = this.sessions.get(id)
    if (session) {
      session.dispose()
      this.sessions.delete(id)
    }
  }

  listSessions(): SessionInfo[] {
    return Array.from(this.sessions.entries()).map(([id, session]) => ({
      id,
      toolName: session.config.command,
      status: 'idle',  // TODO: 실제 상태 추적
      createdAt: Date.now(),
      lastActivity: Date.now()
    }))
  }
}
```

#### 검증 방법
```typescript
// Mock adapter로 테스트 (플랫폼 없이도 가능)
class MockAdapter implements ITerminalAdapter {
  start() { return Promise.resolve() }
  sendInput(data: string) { /* simulate */ }
  onOutput(callback) { return { dispose: () => {} } }
  onExit(callback) { return { dispose: () => {} } }
  dispose() {}
}

// 테스트
const manager = new SessionManager(() => new MockAdapter())
const sessionId = await manager.createSession({
  command: 'echo',
  args: ['test'],
  cwd: '/tmp'
})

const session = manager.getSession(sessionId)
expect(session).toBeDefined()
```

#### 검증 기준
- [ ] Mock adapter로 단위 테스트 통과
- [ ] 세션 생성/조회/삭제 동작
- [ ] 출력 버퍼링 정상 작동
- [ ] TypeScript 컴파일 성공

---

### Phase 2: VS Code 어댑터 구현 (1일)

**목표**: VS Code Pseudoterminal을 ITerminalAdapter로 래핑

#### 작업 항목
1. ✅ `VSCodeTerminalAdapter` 구현
   - VS Code Pseudoterminal 인터페이스 구현
   - ChildProcess 연동
   - 이벤트 스트리밍

2. ✅ `VSCodeProcessExecutor` 구현 (옵션)
   - ChildProcess 래퍼
   - 에러 처리

3. ✅ 팩토리 함수 구현
   - `createVSCodeSessionManager()`

#### 핵심 코드 구조

```typescript
// VSCodeTerminalAdapter.ts
export class VSCodeTerminalAdapter implements ITerminalAdapter {
  private writeEmitter = new vscode.EventEmitter<string>()
  private closeEmitter = new vscode.EventEmitter<number>()
  private process?: ChildProcess
  private outputCallback?: (data: string) => void
  private exitCallback?: (code: number) => void

  async start(config: SessionConfig): Promise<void> {
    this.process = spawn(config.command, config.args, {
      cwd: config.cwd,
      env: { ...process.env, ...config.env },
      shell: false
    })

    // stdout 스트리밍
    this.process.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.writeEmitter.fire(text)
      this.outputCallback?.(text)
    })

    // stderr 스트리밍 (빨간색)
    this.process.stderr?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.writeEmitter.fire(`\x1b[31m${text}\x1b[0m`)
      this.outputCallback?.(text)
    })

    // 종료 처리
    this.process.on('exit', (code) => {
      this.closeEmitter.fire(code ?? 0)
      this.exitCallback?.(code ?? 0)
    })
  }

  sendInput(data: string): void {
    if (!this.process?.stdin) {
      throw new Error('Process not started or stdin not available')
    }
    this.process.stdin.write(data)
  }

  onOutput(callback: (data: string) => void): vscode.Disposable {
    this.outputCallback = callback
    return { dispose: () => { this.outputCallback = undefined } }
  }

  onExit(callback: (code: number) => void): vscode.Disposable {
    this.exitCallback = callback
    return { dispose: () => { this.exitCallback = undefined } }
  }

  dispose(): void {
    this.process?.kill()
    this.writeEmitter.dispose()
    this.closeEmitter.dispose()
  }
}

// index.ts (팩토리)
export function createVSCodeSessionManager(): SessionManager {
  return new SessionManager(() => new VSCodeTerminalAdapter())
}
```

#### Caret 통합

```typescript
// caret-src/extension.ts 또는 별도 초기화 파일
import { createVSCodeSessionManager } from './integrations/terminal/interactive/adapters/vscode'
import { getFeatureConfig } from './shared/feature-config'

let globalSessionManager: SessionManager | null = null

export function activateInteractiveTerminal(context: vscode.ExtensionContext) {
  const config = getFeatureConfig()

  if (!config.enableInteractiveTerminal) {
    console.log('[Caret] Interactive Terminal disabled by feature flag')
    return
  }

  globalSessionManager = createVSCodeSessionManager()
  console.log('[Caret] Interactive Terminal activated')
}

export function getCaretSessionManager(): SessionManager {
  if (!globalSessionManager) {
    throw new Error('Interactive Terminal not activated')
  }
  return globalSessionManager
}
```

#### 검증 방법

**테스트 1: Python REPL**
```typescript
const manager = createVSCodeSessionManager()
const sessionId = await manager.createSession({
  command: 'python3',
  args: ['-i'],
  cwd: process.cwd()
})

const session = manager.getSession(sessionId)!
session.on('output', (data) => console.log('[Python]', data))

session.sendInput('print("hello from python")')
// 기대 출력: "hello from python"

session.sendInput('2 + 2')
// 기대 출력: "4"

session.sendInput('exit()')
// 세션 종료 확인
```

**테스트 2: Node REPL**
```typescript
const sessionId = await manager.createSession({
  command: 'node',
  args: [],
  cwd: process.cwd()
})

const session = manager.getSession(sessionId)!
session.on('output', console.log)

session.sendInput('console.log("hello")')
// 기대 출력: "hello"

session.sendInput('.exit')
// 세션 종료 확인
```

#### 검증 기준
- [ ] Python REPL 입력/출력 작동
- [ ] Node REPL 입력/출력 작동
- [ ] 출력 스트리밍이 실시간으로 동작
- [ ] 세션이 VS Code 터미널에 보임 (옵션)
- [ ] 세션 종료가 정상 작동

---

### Phase 3: Claude Code 통합 테스트 (1일)

**목표**: Claude Code CLI를 실제로 제어

#### 작업 항목
1. ✅ `BaseAIAdapter` 추상 클래스 구현
   - 공통 AI 도구 로직
   - 출력 파싱 훅
   - 응답 대기 메커니즘

2. ✅ `ClaudeCodeAdapter` 구현
   - Claude Code 출력 패턴 파싱
   - 프롬프트 감지 ("> " 등)
   - 응답 완료 감지
   - 타임아웃 처리

3. ✅ Claude Code 통합 테스트

#### 핵심 코드 구조

```typescript
// BaseAIAdapter.ts
export abstract class BaseAIAdapter extends EventEmitter {
  protected session?: InteractiveSession
  protected sessionId?: string

  constructor(protected manager: SessionManager) {
    super()
  }

  // 하위 클래스에서 구현
  abstract getSessionConfig(): SessionConfig
  abstract parseOutput(data: string): void

  async start(): Promise<string> {
    const config = this.getSessionConfig()
    this.sessionId = await this.manager.createSession(config)
    this.session = this.manager.getSession(this.sessionId)

    if (!this.session) {
      throw new Error('Failed to create session')
    }

    this.session.on('output', (data) => this.parseOutput(data))
    this.session.on('exit', (code) => this.emit('exit', code))

    return this.sessionId
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.session) {
      throw new Error('Session not started')
    }
    this.session.sendInput(message)
  }

  dispose(): void {
    if (this.sessionId) {
      this.manager.closeSession(this.sessionId)
    }
  }
}

// ClaudeCodeAdapter.ts
export class ClaudeCodeAdapter extends BaseAIAdapter {
  private responseBuffer: string = ''
  private waitingForPrompt: boolean = false

  getSessionConfig(): SessionConfig {
    return {
      command: 'claude',
      args: ['code'],
      cwd: vscode.workspace.rootPath || process.cwd(),
      env: {
        // Claude Code 환경 변수 필요시
        TERM: 'xterm-256color'
      }
    }
  }

  parseOutput(data: string): void {
    this.responseBuffer += data

    // Claude Code 프롬프트 감지
    // TODO: 실제 claude code 출력 패턴 확인 필요
    if (data.includes('>') || data.includes('claude>')) {
      this.waitingForPrompt = false
      this.emit('ready', this.responseBuffer)
      this.responseBuffer = ''
    }

    // 실시간 출력도 전달
    this.emit('response', data)
  }

  async sendMessageAndWait(
    message: string,
    timeout = 30000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Response timeout'))
      }, timeout)

      const onReady = (response: string) => {
        clearTimeout(timer)
        this.off('ready', onReady)
        resolve(response)
      }

      this.once('ready', onReady)
      this.sendMessage(message)
    })
  }
}
```

#### 검증 방법

**수동 테스트: Claude Code 출력 패턴 분석**
```bash
# 1. 터미널에서 실제 claude code 실행
$ claude code

# 2. 프롬프트 패턴 확인
> [여기가 입력 대기 프롬프트인지 확인]

# 3. 간단한 명령어 테스트
> What is 2+2?
[응답 출력...]
> [다시 프롬프트로 돌아오는지 확인]
```

**자동 테스트**
```typescript
describe('ClaudeCodeAdapter', () => {
  it('should start Claude Code session', async () => {
    const manager = createVSCodeSessionManager()
    const adapter = new ClaudeCodeAdapter(manager)

    await adapter.start()
    // 세션 시작 확인
  })

  it('should send message and receive response', async () => {
    const adapter = new ClaudeCodeAdapter(manager)
    await adapter.start()

    const response = await adapter.sendMessageAndWait('What is 2+2?')
    expect(response).toContain('4')
  }, 60000)  // 60초 타임아웃
})
```

#### 검증 기준
- [ ] Claude Code 세션 시작
- [ ] 메시지 전송 가능
- [ ] 응답 수신 확인
- [ ] 프롬프트 감지 작동
- [ ] 타임아웃 처리 작동
- [ ] 여러 번 연속 대화 가능

---

### Phase 4: gRPC API 및 프론트엔드 통합 (1-2일)

**목표**: 웹뷰에서 interactive terminal을 시각화하고 제어

#### 작업 항목

**4.1 gRPC API 정의**
```protobuf
// proto/caret/interactive_terminal.proto
syntax = "proto3";

package caret.interactive_terminal;

service InteractiveTerminalService {
  // 세션 관리
  rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);
  rpc CloseSession(CloseSessionRequest) returns (CloseSessionResponse);
  rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);

  // 입출력
  rpc SendInput(SendInputRequest) returns (SendInputResponse);
  rpc GetOutput(GetOutputRequest) returns (GetOutputResponse);
}

message CreateSessionRequest {
  string tool_name = 1;      // 'claude-code', 'python', etc.
  string command = 2;        // 'claude', 'python3', etc.
  repeated string args = 3;  // ['code'], ['-i'], etc.
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
  int32 since_index = 2;  // 이 인덱스 이후의 출력만 가져오기
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

**4.2 gRPC 핸들러 구현**
```typescript
// src/core/controller/interactive-terminal/CreateSessionHandler.ts
import { getCaretSessionManager } from '@/caret/integrations/terminal/interactive'

export async function CreateSession(
  controller: Controller,
  request: proto.caret.interactive_terminal.CreateSessionRequest
): Promise<proto.caret.interactive_terminal.CreateSessionResponse> {
  const manager = getCaretSessionManager()

  const sessionId = await manager.createSession({
    command: request.command,
    args: request.args,
    cwd: request.cwd,
    env: request.env || {}
  })

  return { sessionId }
}

// SendInputHandler.ts
export async function SendInput(
  controller: Controller,
  request: proto.caret.interactive_terminal.SendInputRequest
): Promise<proto.caret.interactive_terminal.SendInputResponse> {
  const manager = getCaretSessionManager()
  const session = manager.getSession(request.sessionId)

  if (!session) {
    throw new Error(`Session ${request.sessionId} not found`)
  }

  session.sendInput(request.input)
  return { success: true }
}

// GetOutputHandler.ts
export async function GetOutput(
  controller: Controller,
  request: proto.caret.interactive_terminal.GetOutputRequest
): Promise<proto.caret.interactive_terminal.GetOutputResponse> {
  const manager = getCaretSessionManager()
  const session = manager.getSession(request.sessionId)

  if (!session) {
    throw new Error(`Session ${request.sessionId} not found`)
  }

  const outputLines = session.getOutput(request.sinceIndex)
  return {
    outputLines,
    currentIndex: request.sinceIndex + outputLines.length
  }
}

// CloseSessionHandler.ts
export async function CloseSession(
  controller: Controller,
  request: proto.caret.interactive_terminal.CloseSessionRequest
): Promise<proto.caret.interactive_terminal.CloseSessionResponse> {
  const manager = getCaretSessionManager()
  manager.closeSession(request.sessionId)
  return { success: true }
}

// ListSessionsHandler.ts
export async function ListSessions(
  controller: Controller,
  request: proto.caret.interactive_terminal.ListSessionsRequest
): Promise<proto.caret.interactive_terminal.ListSessionsResponse> {
  const manager = getCaretSessionManager()
  const sessions = manager.listSessions()
  return { sessions }
}
```

**4.3 프론트엔드 React Hook**
```typescript
// webview-ui/src/hooks/useInteractiveTerminal.ts
export function useInteractiveTerminal() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>()
  const [output, setOutput] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const createSession = async (toolName: string, command: string, args: string[]) => {
    setLoading(true)
    try {
      const response = await InteractiveTerminalServiceClient.CreateSession({
        toolName,
        command,
        args,
        cwd: workspaceRoot,
        env: {}
      })

      setActiveSessionId(response.sessionId)
      await refreshSessions()
      return response.sessionId
    } finally {
      setLoading(false)
    }
  }

  const sendInput = async (input: string) => {
    if (!activeSessionId) return

    await InteractiveTerminalServiceClient.SendInput({
      sessionId: activeSessionId,
      input
    })

    // Poll for new output
    await fetchOutput()
  }

  const fetchOutput = async () => {
    if (!activeSessionId) return

    const response = await InteractiveTerminalServiceClient.GetOutput({
      sessionId: activeSessionId,
      sinceIndex: output.length
    })

    if (response.outputLines.length > 0) {
      setOutput([...output, ...response.outputLines])
    }
  }

  const closeSession = async (sessionId: string) => {
    await InteractiveTerminalServiceClient.CloseSession({ sessionId })
    await refreshSessions()

    if (sessionId === activeSessionId) {
      setActiveSessionId(undefined)
      setOutput([])
    }
  }

  const refreshSessions = async () => {
    const response = await InteractiveTerminalServiceClient.ListSessions({})
    setSessions(response.sessions)
  }

  // Auto-refresh output
  useEffect(() => {
    if (!activeSessionId) return

    const interval = setInterval(fetchOutput, 500)
    return () => clearInterval(interval)
  }, [activeSessionId, output.length])

  return {
    sessions,
    activeSessionId,
    output,
    loading,
    createSession,
    sendInput,
    closeSession,
    setActiveSessionId,
    refreshSessions
  }
}
```

**4.4 UI 컴포넌트**
```typescript
// webview-ui/src/components/interactive-terminal/InteractiveTerminalPanel.tsx
export const InteractiveTerminalPanel = () => {
  const {
    sessions,
    activeSessionId,
    output,
    loading,
    createSession,
    sendInput,
    closeSession,
    setActiveSessionId
  } = useInteractiveTerminal()

  const [inputText, setInputText] = useState('')

  const handleCreateClaudeCode = async () => {
    await createSession('claude-code', 'claude', ['code'])
  }

  const handleSendInput = () => {
    if (!inputText.trim()) return
    sendInput(inputText)
    setInputText('')
  }

  return (
    <div className="interactive-terminal-panel">
      {/* 세션 탭 */}
      <div className="session-tabs">
        {sessions.map((session) => (
          <button
            key={session.sessionId}
            className={session.sessionId === activeSessionId ? 'active' : ''}
            onClick={() => setActiveSessionId(session.sessionId)}
          >
            {session.toolName}
            <span onClick={() => closeSession(session.sessionId)}>×</span>
          </button>
        ))}
        <button onClick={handleCreateClaudeCode} disabled={loading}>
          + Claude Code
        </button>
      </div>

      {/* 출력 영역 */}
      <div className="terminal-output">
        {output.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="terminal-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendInput()}
          placeholder="Type a message..."
          disabled={!activeSessionId}
        />
        <button onClick={handleSendInput} disabled={!activeSessionId}>
          Send
        </button>
      </div>
    </div>
  )
}
```

#### 검증 방법
1. 웹뷰에서 "Create Claude Code" 버튼 클릭
2. 세션 생성 확인
3. 입력창에 메시지 입력
4. 실시간 출력 확인
5. 여러 세션 생성 및 전환
6. 세션 종료 기능

#### 검증 기준
- [ ] gRPC proto 컴파일 성공 (`npm run protos`)
- [ ] 모든 핸들러 구현 완료
- [ ] 프론트엔드에서 세션 생성 가능
- [ ] 입력 전송 및 출력 수신 작동
- [ ] 여러 세션 관리 가능
- [ ] 세션 종료 작동

---

## 📊 IntelliJ 포팅 로드맵

### 재사용 가능한 컴포넌트 (85%)

| 컴포넌트 | 재사용 가능 | 비고 |
|---------|-----------|------|
| `core/interfaces/` | 100% | 인터페이스 정의 |
| `core/types.ts` | 100% | 타입 정의 |
| `core/InteractiveSession.ts` | 100% | 세션 로직 |
| `core/SessionManager.ts` | 100% | 세션 관리 |
| `core/OutputParser.ts` | 100% | 출력 파싱 |
| `ai-tools/` | 100% | AI 도구 어댑터 |
| gRPC proto | 100% | API 정의 |
| gRPC 핸들러 | 80% | 약간의 플랫폼별 조정 필요 |
| 프론트엔드 | 80% | UI 프레임워크 차이 |

### IntelliJ 전용 구현 필요 (15%)

```typescript
// adapters/intellij/IntelliJTerminalAdapter.ts
export class IntelliJTerminalAdapter implements ITerminalAdapter {
  // IntelliJ Platform APIs:
  // - com.intellij.execution.process.ProcessHandler
  // - com.intellij.terminal.TerminalExecutionConsole
  // - com.intellij.execution.configurations.GeneralCommandLine

  async start(config: SessionConfig): Promise<void> {
    // GeneralCommandLine로 프로세스 실행
  }

  sendInput(data: string): void {
    // ProcessHandler.getProcessInput().write()
  }

  // ... IntelliJ 특화 구현
}

// 팩토리
export function createIntelliJSessionManager(): SessionManager {
  return new SessionManager(() => new IntelliJTerminalAdapter())
}
```

### 포팅 체크리스트
- [ ] IntelliJ ProcessHandler API 학습
- [ ] `IntelliJTerminalAdapter` 구현
- [ ] IntelliJ 플러그인 연동
- [ ] IntelliJ UI 컴포넌트 구현
- [ ] 통합 테스트

---

## 📈 성공 지표

### 기술 지표
- **세션 생성 시간**: < 2초
- **입력 지연시간**: < 100ms
- **출력 스트리밍**: 실시간 (< 50ms 청크)
- **메모리 사용량**: 세션당 < 50MB
- **플랫폼 독립성**: 코어 로직 85% 재사용

### 비즈니스 지표
- **Claude Code 제어**: 대화형 제어 100% 작동
- **확장성**: 다른 AI 도구 추가 가능
- **IntelliJ 포팅 준비**: 아키텍처 완성

---

## 🔧 기술 스택

- **언어**: TypeScript
- **플랫폼**: VS Code Extension API
- **프로세스 관리**: Node.js ChildProcess
- **터미널**: VS Code Pseudoterminal
- **통신**: gRPC (Protocol Buffers)
- **프론트엔드**: React + TypeScript
- **테스트**: Vitest

---

## 📚 참고 문서

- [VS Code Terminal API](https://code.visualstudio.com/api/references/vscode-api#Terminal)
- [VS Code Pseudoterminal](https://code.visualstudio.com/api/references/vscode-api#Pseudoterminal)
- [Node.js ChildProcess](https://nodejs.org/api/child_process.html)
- [gRPC 공식 문서](https://grpc.io/docs/)
- [IntelliJ Platform SDK - Process](https://plugins.jetbrains.com/docs/intellij/execution.html)

---

## 🎯 다음 단계

1. **Phase 0 시작**: 인터페이스 정의 및 디렉토리 구조 생성
2. **Mock 테스트**: 플랫폼 독립적 코어 검증
3. **VS Code 통합**: Python/Node REPL로 기본 기능 검증
4. **Claude Code 연동**: 실제 AI 도구 제어
5. **프론트엔드 구현**: 웹뷰 UI 완성

---

**작성자**: Luke
**검토 필요**: 아키텍처 설계, IntelliJ 호환성
**다음 리뷰**: Phase 1 완료 후
