# 스마트 터미널 구현 계획 (최종 단순화)

**작성일**: 2025-11-04
**목표**: Interactive 프로그램을 제어할 수 있는 범용 Terminal Tool 구현
**범위**: 순수 터미널 입출력 제어 (A2A 프로토콜 제외)

---

## 🎯 구현 목표

### 핵심 기능
```
Terminal Tool = 스마트 전화기

1. 세션 열기 (프로그램 시작)
2. 입력 전송 (stdin)
3. 출력 읽기 (stdout/stderr)
4. 강제 중지 (Ctrl+C)
5. 세션 닫기
```

### 사용 예시

**Python REPL**:
```typescript
const sessionId = await TerminalTool.use({
  action: "open",
  command: "python3",
  args: ["-i"]
})

await TerminalTool.use({
  action: "send",
  sessionId: sessionId,
  input: "print('hello')"
})

const result = await TerminalTool.use({
  action: "read",
  sessionId: sessionId
})
// ">>> print('hello')\nhello\n>>>"
```

**Claude Code**:
```typescript
const sessionId = await TerminalTool.use({
  action: "open",
  command: "claude",
  args: ["code"]
})

await TerminalTool.use({
  action: "send",
  sessionId: sessionId,
  input: "Create README.md"
})

const result = await TerminalTool.use({
  action: "read",
  sessionId: sessionId
})
// "> Create README.md\n...\n> "
```

---

## 🏗️ 아키텍처

### 레이어 구조

```
┌─────────────────────────────────────┐
│  Caret (메인 AI)                     │
│  - 사용자 의도 파악                  │
│  - Tool 선택 및 호출                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  TerminalToolHandler                │
│  - Tool 인터페이스 구현              │
│  - action 분기 처리                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  SessionManager                     │
│  - 세션 생명주기 관리                │
│  - 세션 ID 발급 및 추적              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  InteractiveSession                 │
│  - 입출력 버퍼링                     │
│  - 이벤트 발생                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  VSCodeTerminalAdapter              │
│  - Node.js ChildProcess             │
│  - stdout/stderr 스트리밍            │
└─────────────────────────────────────┘
```

---

## 📁 디렉토리 구조

```
src/core/task/tools/handlers/
└── TerminalToolHandler.ts              # Tool 핸들러

caret-src/integrations/terminal/interactive/
├── core/
│   ├── interfaces/
│   │   └── ITerminalAdapter.ts        # 플랫폼 독립 인터페이스
│   ├── types.ts                       # 공통 타입
│   ├── InteractiveSession.ts          # 세션 클래스
│   └── SessionManager.ts              # 세션 관리
│
├── adapters/
│   └── vscode/
│       ├── VSCodeTerminalAdapter.ts   # VS Code 구현
│       └── index.ts                   # 팩토리 함수
│
└── __tests__/
    ├── InteractiveSession.test.ts
    ├── SessionManager.test.ts
    └── manual/
        └── test-python-repl.ts        # 수동 테스트
```

---

## 🔧 구현 상세

### 1. 타입 정의

**파일**: `caret-src/integrations/terminal/interactive/core/types.ts`

```typescript
// 세션 설정
export interface SessionConfig {
  command: string           // 실행 명령 (예: "python3", "claude")
  args: string[]           // 인자 (예: ["-i"], ["code"])
  cwd: string              // 작업 디렉토리
  env?: Record<string, string>  // 환경 변수
}

// 세션 정보
export interface SessionInfo {
  id: string               // ULID 세션 ID
  command: string          // 실행 명령
  createdAt: number        // 생성 시간
  lastActivity: number     // 마지막 활동 시간
}

// Tool 입력
export interface TerminalToolInput {
  action: 'open' | 'send' | 'read' | 'stop' | 'close' | 'list'
  sessionId?: string       // open 제외 모두 필요
  command?: string         // open 시 필요
  args?: string[]          // open 시 선택
  cwd?: string            // open 시 선택
  input?: string          // send 시 필요
}

// Tool 출력
export interface TerminalToolOutput {
  success: boolean
  sessionId?: string       // open, send, read에서 반환
  output?: string         // read에서 반환
  sessions?: SessionInfo[] // list에서 반환
  error?: string          // 실패 시
}
```

---

### 2. 인터페이스 정의

**파일**: `caret-src/integrations/terminal/interactive/core/interfaces/ITerminalAdapter.ts`

```typescript
export interface ITerminalAdapter {
  /**
   * 터미널 세션 시작
   */
  start(config: SessionConfig): Promise<void>

  /**
   * 입력 전송 (stdin)
   */
  sendInput(data: string): void

  /**
   * 출력 이벤트 구독 (stdout/stderr)
   */
  onOutput(callback: (data: string) => void): Disposable

  /**
   * 종료 이벤트 구독
   */
  onExit(callback: (code: number) => void): Disposable

  /**
   * 리소스 정리
   */
  dispose(): void
}

export interface Disposable {
  dispose(): void
}
```

---

### 3. InteractiveSession 구현

**파일**: `caret-src/integrations/terminal/interactive/core/InteractiveSession.ts`

```typescript
import { EventEmitter } from 'events'
import { ITerminalAdapter, SessionConfig } from './interfaces'

export class InteractiveSession extends EventEmitter {
  private outputBuffer: string[] = []
  private disposables: Disposable[] = []

  constructor(
    private adapter: ITerminalAdapter,
    public readonly config: SessionConfig
  ) {
    super()
  }

  async start(): Promise<void> {
    await this.adapter.start(this.config)

    // 출력 구독
    const outputDisposable = this.adapter.onOutput((data) => {
      this.outputBuffer.push(data)
      this.emit('output', data)
    })
    this.disposables.push(outputDisposable)

    // 종료 구독
    const exitDisposable = this.adapter.onExit((code) => {
      this.emit('exit', code)
    })
    this.disposables.push(exitDisposable)
  }

  sendInput(text: string): void {
    this.adapter.sendInput(text + '\n')
  }

  getOutput(since?: number): string[] {
    return this.outputBuffer.slice(since || 0)
  }

  clearOutput(): void {
    this.outputBuffer = []
  }

  dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose()
    }
    this.disposables = []
    this.adapter.dispose()
  }
}
```

---

### 4. SessionManager 구현

**파일**: `caret-src/integrations/terminal/interactive/core/SessionManager.ts`

```typescript
import { ulid } from 'ulid'
import { InteractiveSession } from './InteractiveSession'
import { ITerminalAdapter, SessionConfig, SessionInfo } from './interfaces'

export class SessionManager {
  private sessions: Map<string, InteractiveSession> = new Map()

  constructor(
    private adapterFactory: () => ITerminalAdapter
  ) {}

  async createSession(config: SessionConfig): Promise<string> {
    const id = ulid()
    const adapter = this.adapterFactory()
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
      command: session.config.command,
      createdAt: Date.now(), // TODO: 실제 생성 시간 추적
      lastActivity: Date.now()
    }))
  }

  dispose(): void {
    for (const [id, session] of this.sessions.entries()) {
      session.dispose()
    }
    this.sessions.clear()
  }
}
```

---

### 5. VS Code 어댑터 구현

**파일**: `caret-src/integrations/terminal/interactive/adapters/vscode/VSCodeTerminalAdapter.ts`

```typescript
import { spawn, ChildProcess } from 'child_process'
import { ITerminalAdapter, SessionConfig, Disposable } from '../../core/interfaces'

export class VSCodeTerminalAdapter implements ITerminalAdapter {
  private process?: ChildProcess
  private outputCallback?: (data: string) => void
  private exitCallback?: (code: number) => void

  async start(config: SessionConfig): Promise<void> {
    this.process = spawn(config.command, config.args, {
      cwd: config.cwd,
      env: { ...process.env, ...config.env },
      shell: false
    })

    // stdout 리스닝
    this.process.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.outputCallback?.(text)
    })

    // stderr 리스닝
    this.process.stderr?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.outputCallback?.(text) // stderr도 동일하게 처리
    })

    // 종료 리스닝
    this.process.on('exit', (code) => {
      this.exitCallback?.(code ?? 0)
    })

    // 프로세스 시작 대기
    await new Promise<void>((resolve, reject) => {
      this.process!.on('spawn', () => resolve())
      this.process!.on('error', (err) => reject(err))
    })
  }

  sendInput(data: string): void {
    if (!this.process?.stdin) {
      throw new Error('Process not started or stdin not available')
    }
    this.process.stdin.write(data)
  }

  onOutput(callback: (data: string) => void): Disposable {
    this.outputCallback = callback
    return {
      dispose: () => {
        this.outputCallback = undefined
      }
    }
  }

  onExit(callback: (code: number) => void): Disposable {
    this.exitCallback = callback
    return {
      dispose: () => {
        this.exitCallback = undefined
      }
    }
  }

  dispose(): void {
    if (this.process) {
      this.process.kill()
      this.process = undefined
    }
  }
}
```

**팩토리**:

**파일**: `caret-src/integrations/terminal/interactive/adapters/vscode/index.ts`

```typescript
import { SessionManager } from '../../core/SessionManager'
import { VSCodeTerminalAdapter } from './VSCodeTerminalAdapter'

export function createVSCodeSessionManager(): SessionManager {
  return new SessionManager(() => new VSCodeTerminalAdapter())
}

// 전역 인스턴스 (싱글톤)
let globalSessionManager: SessionManager | null = null

export function getGlobalSessionManager(): SessionManager {
  if (!globalSessionManager) {
    globalSessionManager = createVSCodeSessionManager()
  }
  return globalSessionManager
}
```

---

### 6. Terminal Tool Handler 구현

**파일**: `src/core/task/tools/handlers/TerminalToolHandler.ts`

```typescript
import { ToolHandler, ToolResponse } from './base'
import { getGlobalSessionManager } from '@/caret/integrations/terminal/interactive/adapters/vscode'
import type { TerminalToolInput, TerminalToolOutput } from '@/caret/integrations/terminal/interactive/core/types'

export class TerminalToolHandler extends ToolHandler {
  name = 'terminal'

  async execute(input: TerminalToolInput): Promise<ToolResponse> {
    const manager = getGlobalSessionManager()

    try {
      let result: TerminalToolOutput

      switch (input.action) {
        case 'open':
          result = await this.handleOpen(manager, input)
          break
        case 'send':
          result = await this.handleSend(manager, input)
          break
        case 'read':
          result = await this.handleRead(manager, input)
          break
        case 'stop':
          result = await this.handleStop(manager, input)
          break
        case 'close':
          result = await this.handleClose(manager, input)
          break
        case 'list':
          result = await this.handleList(manager)
          break
        default:
          throw new Error(`Unknown action: ${input.action}`)
      }

      return {
        success: result.success,
        output: JSON.stringify(result, null, 2)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async handleOpen(manager: SessionManager, input: TerminalToolInput): Promise<TerminalToolOutput> {
    if (!input.command) {
      throw new Error('command is required for open action')
    }

    const sessionId = await manager.createSession({
      command: input.command,
      args: input.args || [],
      cwd: input.cwd || this.cwd
    })

    return {
      success: true,
      sessionId,
      output: `Terminal session opened: ${input.command} (${sessionId})`
    }
  }

  private async handleSend(manager: SessionManager, input: TerminalToolInput): Promise<TerminalToolOutput> {
    if (!input.sessionId) {
      throw new Error('sessionId is required for send action')
    }
    if (!input.input) {
      throw new Error('input is required for send action')
    }

    const session = manager.getSession(input.sessionId)
    if (!session) {
      throw new Error(`Session not found: ${input.sessionId}`)
    }

    session.sendInput(input.input)

    // 잠시 대기 후 출력 읽기
    await new Promise(resolve => setTimeout(resolve, 500))

    const output = session.getOutput().join('\n')

    return {
      success: true,
      sessionId: input.sessionId,
      output
    }
  }

  private async handleRead(manager: SessionManager, input: TerminalToolInput): Promise<TerminalToolOutput> {
    if (!input.sessionId) {
      throw new Error('sessionId is required for read action')
    }

    const session = manager.getSession(input.sessionId)
    if (!session) {
      throw new Error(`Session not found: ${input.sessionId}`)
    }

    const output = session.getOutput().join('\n')

    return {
      success: true,
      sessionId: input.sessionId,
      output
    }
  }

  private async handleStop(manager: SessionManager, input: TerminalToolInput): Promise<TerminalToolOutput> {
    if (!input.sessionId) {
      throw new Error('sessionId is required for stop action')
    }

    const session = manager.getSession(input.sessionId)
    if (!session) {
      throw new Error(`Session not found: ${input.sessionId}`)
    }

    // Ctrl+C 전송
    session.sendInput('\x03')

    return {
      success: true,
      sessionId: input.sessionId,
      output: 'Sent Ctrl+C to terminal'
    }
  }

  private async handleClose(manager: SessionManager, input: TerminalToolInput): Promise<TerminalToolOutput> {
    if (!input.sessionId) {
      throw new Error('sessionId is required for close action')
    }

    manager.closeSession(input.sessionId)

    return {
      success: true,
      output: `Terminal session closed: ${input.sessionId}`
    }
  }

  private async handleList(manager: SessionManager): Promise<TerminalToolOutput> {
    const sessions = manager.listSessions()

    return {
      success: true,
      sessions,
      output: `Active sessions: ${sessions.length}`
    }
  }
}
```

---

### 7. Tool 등록

**파일**: `src/core/task/tools/index.ts` (수정)

```typescript
import { TerminalToolHandler } from './handlers/TerminalToolHandler'
import { getFeatureConfig } from '@/caret/shared/feature-config'

export function registerTools() {
  // ...기존 도구들

  // Caret 모드일 때만 Terminal Tool 등록
  const featureConfig = getFeatureConfig()
  if (featureConfig.enableInteractiveTerminal) {
    registerTool(new TerminalToolHandler())
  }
}
```

---

### 8. Feature Flag

**파일**: `caret-src/shared/feature-config.json` (수정)

```json
{
  "enableCaretAccountFeatures": false,
  "enableInteractiveTerminal": true,
  ...
}
```

---

### 9. 시스템 프롬프트 가이드

**파일**: `caret-src/core/prompts/sections/TERMINAL_TOOL_GUIDE.json`

```json
{
  "terminalTool": {
    "description": "Terminal Tool을 사용하여 interactive 프로그램을 제어할 수 있습니다.",
    "actions": {
      "open": {
        "description": "터미널 세션 시작",
        "example": {
          "action": "open",
          "command": "python3",
          "args": ["-i"]
        }
      },
      "send": {
        "description": "입력 전송",
        "example": {
          "action": "send",
          "sessionId": "01JC...",
          "input": "print('hello')"
        }
      },
      "read": {
        "description": "출력 읽기",
        "example": {
          "action": "read",
          "sessionId": "01JC..."
        }
      },
      "stop": {
        "description": "Ctrl+C 전송",
        "example": {
          "action": "stop",
          "sessionId": "01JC..."
        }
      },
      "close": {
        "description": "세션 닫기",
        "example": {
          "action": "close",
          "sessionId": "01JC..."
        }
      },
      "list": {
        "description": "활성 세션 목록",
        "example": {
          "action": "list"
        }
      }
    },
    "useCases": [
      {
        "name": "Python REPL",
        "command": "python3",
        "args": ["-i"]
      },
      {
        "name": "Node REPL",
        "command": "node",
        "args": []
      },
      {
        "name": "Claude Code",
        "command": "claude",
        "args": ["code"]
      }
    ]
  }
}
```

---

## 📊 구현 일정

### Phase 1: 기본 인프라 (1-2일)

**작업**:
1. 디렉토리 구조 생성
2. 타입 및 인터페이스 정의
3. `InteractiveSession` 구현
4. `SessionManager` 구현
5. `VSCodeTerminalAdapter` 구현

**검증**:
```bash
npm run compile
npm run check-types
```

---

### Phase 2: Tool Handler (1일)

**작업**:
1. `TerminalToolHandler` 구현
2. Tool 등록
3. Feature flag 설정

**검증**:
```typescript
// Extension에서 Tool 사용 가능한지 확인
const result = await TerminalTool.use({
  action: "open",
  command: "python3",
  args: ["-i"]
})
```

---

### Phase 3: 테스트 (1일)

**Python REPL**:
```typescript
// open
const openResult = await TerminalTool.use({
  action: "open",
  command: "python3",
  args: ["-i"]
})
const sessionId = openResult.sessionId

// send
await TerminalTool.use({
  action: "send",
  sessionId,
  input: "print('hello')"
})

// read
const readResult = await TerminalTool.use({
  action: "read",
  sessionId
})
console.log(readResult.output)  // ">>> print('hello')\nhello\n>>>"

// close
await TerminalTool.use({
  action: "close",
  sessionId
})
```

**Claude Code**:
```typescript
const sessionId = await TerminalTool.use({
  action: "open",
  command: "claude",
  args: ["code"]
})

await TerminalTool.use({
  action: "send",
  sessionId,
  input: "Create README.md"
})

await new Promise(resolve => setTimeout(resolve, 5000))

const result = await TerminalTool.use({
  action: "read",
  sessionId
})
console.log(result.output)  // Claude Code 응답
```

---

### Phase 4: 시스템 프롬프트 통합 (0.5일)

**작업**:
1. `TERMINAL_TOOL_GUIDE.json` 작성
2. 시스템 프롬프트에 통합
3. Caret이 Tool 사용할 수 있는지 확인

**검증**:
```
사용자: "Python REPL 열어줘"
Caret: [TerminalTool.use 호출]
Caret: "Python REPL을 열었습니다. (세션: 01JC...)"
```

---

## 🎯 성공 기준

### 기술적 성공
- [ ] Python REPL 제어 가능
- [ ] Node REPL 제어 가능
- [ ] Claude Code 제어 가능
- [ ] 다중 세션 관리 가능
- [ ] 입출력 정상 작동
- [ ] Ctrl+C 정상 작동

### 사용성 성공
- [ ] Caret이 Tool을 자연스럽게 사용
- [ ] 사용자에게 명확한 피드백
- [ ] 에러 처리 정상 작동

---

## 📝 제외 사항 (나중에)

- ❌ A2A 프로토콜
- ❌ 이벤트 파싱
- ❌ 조건부 제어
- ❌ Claude Code 특화 로직
- ❌ 매뉴얼 시스템
- ❌ 파일 기반 상태 공유

---

## 🚀 다음 단계

**즉시 시작**:
```bash
# 1. 디렉토리 생성
mkdir -p caret-src/integrations/terminal/interactive/{core/interfaces,adapters/vscode,__tests__/manual}

# 2. 파일 생성
touch caret-src/integrations/terminal/interactive/core/types.ts
touch caret-src/integrations/terminal/interactive/core/interfaces/ITerminalAdapter.ts
touch caret-src/integrations/terminal/interactive/core/InteractiveSession.ts
touch caret-src/integrations/terminal/interactive/core/SessionManager.ts
touch caret-src/integrations/terminal/interactive/adapters/vscode/VSCodeTerminalAdapter.ts
touch caret-src/integrations/terminal/interactive/adapters/vscode/index.ts
touch src/core/task/tools/handlers/TerminalToolHandler.ts

# 3. 컴파일 확인
npm run compile
```

---

**작성자**: Luke
**다음 작업**: Phase 1 구현 시작
**예상 완료**: 3-4일
