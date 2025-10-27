# 대화형 터미널 제어 구현 계획 (상세)

**날짜**: 2025-10-27  
**작성자**: Alpha  
**목표**: Caret에서 터미널을 자유롭게 읽고 명령을 자유롭게 내릴 수 있는 기능 구현

---

## 📋 현황 분석

### Cline의 현재 터미널 구조

#### 1. TerminalProcess (`src/integrations/terminal/TerminalProcess.ts`)
- **역할**: 단일 명령 실행 및 출력 스트리밍
- **특징**:
  - VSCode shellIntegration API 사용
  - EventEmitter 기반 (`line`, `continue`, `completed` 이벤트)
  - 일회성 실행 패턴: `run(terminal, command)` → 출력 스트림 → 완료
  - Promise와 EventEmitter의 하이브리드 (`mergePromise`)

**제약사항**:
```typescript
// 현재 패턴: 명령 → 결과 → 종료
const process = new TerminalProcess()
await process.run(terminal, "npm install")
// 프로세스 완료, 더 이상 입력 불가
```

#### 2. TerminalManager (`src/integrations/terminal/TerminalManager.ts`)
- **역할**: 터미널 풀 관리 및 재사용
- **특징**:
  - 터미널 생성/재사용 로직 (`getOrCreateTerminal`)
  - CWD 기반 터미널 매칭
  - Shell profile 관리
  - `busy` 상태 추적

**제약사항**:
- 명령 실행 후 터미널은 다시 풀로 돌아감
- 대화형 세션 개념 없음

#### 3. execute_command 도구 (`src/core/task/index.ts`)
```typescript
async executeCommandTool(command: string, timeoutSeconds: number | undefined): Promise<[boolean, ToolResponse]> {
  const terminalInfo = await this.terminalManager.getOrCreateTerminal(cwd)
  const process = this.terminalManager.runCommand(terminalInfo, command)
  
  // 출력 수집
  const outputLines: string[] = []
  process.on("line", (line) => outputLines.push(line))
  
  // 완료 대기
  await process
  
  // 결과 반환 후 종료
  return [false, this.terminalManager.processOutput(outputLines)]
}
```

**문제점**:
- ❌ 세션 개념 없음 (명령마다 새 컨텍스트)
- ❌ 중간에 추가 입력 불가
- ❌ 장기 실행 프로세스와 대화 불가

---

## 🎯 요구사항 정의

### 핵심 기능
1. **세션 유지**: 터미널 세션을 프로그래밍 방식으로 제어
2. **양방향 통신**: 언제든지 입력 전송, 실시간 출력 읽기
3. **다중 세션**: 여러 대화형 세션 동시 관리
4. **Caret 모드 전용**: `CARET AGENT MODE`에서만 활성화

### 사용 시나리오
```typescript
// 시나리오 1: Claude Code CLI 제어
const session = await createInteractiveSession({
  command: "claude",
  args: ["code"]
})

await sendInput(session.id, "README 파일 만들어줘")
const output1 = await readOutput(session.id)

await sendInput(session.id, "완료했어? 그럼 이제 테스트도 만들어줘")
const output2 = await readOutput(session.id)

// 세션은 계속 유지됨...
```

---

## 🔍 전략 비교: Level 1 vs Level 2

### Option A: Level 1 (독립 모듈) ✅ **추천**

#### 장점
- ✅ **Cline 코드 보존**: 백업/수정 불필요
- ✅ **자유로운 설계**: Caret 요구사항에 최적화
- ✅ **병렬 개발**: Cline 업데이트 영향 없음
- ✅ **명확한 분리**: `caret-src/integrations/terminal/interactive/`

#### 구조
```
caret-src/integrations/terminal/interactive/
├── InteractiveTerminalController.ts    # 세션 관리자
├── InteractiveSession.ts               # 세션 클래스
├── PseudoterminalAdapter.ts           # VSCode Pseudoterminal 어댑터
└── SessionRegistry.ts                 # 세션 레지스트리
```

#### 구현 접근
```typescript
// Cline 터미널과 완전히 독립적인 시스템
export class InteractiveTerminalController {
  private sessions = new Map<string, InteractiveSession>()
  
  createSession(config: SessionConfig): string {
    const session = new InteractiveSession(config)
    // VSCode Pseudoterminal API 직접 사용
    const pty = new PseudoterminalAdapter(config)
    const terminal = vscode.window.createTerminal({ name, pty })
    
    session.attach(terminal, pty)
    this.sessions.set(session.id, session)
    return session.id
  }
  
  async sendInput(sessionId: string, input: string): Promise<void>
  async readOutput(sessionId: string, since?: number): Promise<string[]>
  closeSession(sessionId: string): void
}
```

**핵심 차이점**:
- Cline: `TerminalManager.runCommand()` - 명령 실행 후 완료
- Caret: `InteractiveSession.sendInput()` - 계속 입력 가능

---

### Option B: Level 2 (조건부 통합) ⚠️ **비추천**

#### 필요한 수정
```typescript
// src/integrations/terminal/TerminalManager.ts
export class TerminalManager {
  // CARET MODIFICATION: Interactive session support
  private interactiveSessions = new Map<string, InteractiveSession>()
  
  createInteractiveSession(config): string {
    // ...
  }
}

// src/integrations/terminal/TerminalProcess.ts
export class TerminalProcess extends EventEmitter {
  // CARET MODIFICATION: Allow continuous input
  sendAdditionalInput(input: string): void {
    // ...
  }
}
```

#### 문제점
- ❌ Cline 파일 수정 필요 (백업 + CARET MODIFICATION 주석)
- ❌ Cline 업데이트 시 충돌 위험
- ❌ Cline의 일회성 패턴과 충돌

---

## ✅ 최종 결정: Level 1 독립 모듈

**이유**:
1. Cline의 터미널 시스템과 근본적으로 다른 패턴
2. Caret 전용 기능 (오케스트레이션 목적)
3. VSCode Pseudoterminal API로 완전히 독립 구현 가능

---

## 🏗️ 상세 설계

### 1. 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                   Caret Frontend                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  InteractiveTerminalPanel.tsx                    │   │
│  │  - SessionList (세션 목록)                        │   │
│  │  - TerminalOutput (실시간 출력)                   │   │
│  │  - InputBox (명령 입력)                          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                    gRPC Protocol Buffers
                            │
┌─────────────────────────────────────────────────────────┐
│                   Caret Backend                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  InteractiveTerminalController                   │   │
│  │  - createSession()                               │   │
│  │  - sendInput()                                   │   │
│  │  - readOutput()                                  │   │
│  │  - closeSession()                                │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  InteractiveSession (세션 인스턴스)               │   │
│  │  - id: ULID                                      │   │
│  │  - terminal: vscode.Terminal                     │   │
│  │  - pty: PseudoterminalAdapter                    │   │
│  │  - outputBuffer: string[]                        │   │
│  │  - status: 'idle' | 'busy'                       │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  PseudoterminalAdapter                           │   │
│  │  implements vscode.Pseudoterminal                │   │
│  │  - open() - CLI 프로세스 시작                     │   │
│  │  - handleInput() - stdin에 쓰기                  │   │
│  │  - onDidWrite - stdout 이벤트                    │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│                   Child Process (CLI)                    │
│              (claude, cursor, aider, etc.)              │
└─────────────────────────────────────────────────────────┘
```

### 2. 핵심 클래스 구조

#### InteractiveSession.ts
```typescript
import { ulid } from 'ulid'
import * as vscode from 'vscode'
import { PseudoterminalAdapter } from './PseudoterminalAdapter'

export type SessionStatus = 'idle' | 'busy' | 'waiting-input' | 'error' | 'closed'

export interface SessionConfig {
  command: string         // 'claude', 'cursor', etc.
  args: string[]         // ['code']
  cwd: string
  env?: Record<string, string>
  name?: string          // 터미널 이름
}

export class InteractiveSession {
  public readonly id: string = ulid()
  public status: SessionStatus = 'idle'
  
  private terminal: vscode.Terminal
  private pty: PseudoterminalAdapter
  private outputBuffer: string[] = []
  private disposed: boolean = false
  
  public readonly createdAt: number = Date.now()
  public lastActivity: number = Date.now()
  
  constructor(private config: SessionConfig) {
    this.initialize()
  }
  
  private initialize(): void {
    // PseudoterminalAdapter 생성
    this.pty = new PseudoterminalAdapter(this.config, (output: string) => {
      this.handleOutput(output)
    })
    
    // VSCode Terminal 생성
    this.terminal = vscode.window.createTerminal({
      name: this.config.name || `Caret Interactive - ${this.id.slice(-8)}`,
      pty: this.pty
    })
  }
  
  private handleOutput(output: string): void {
    this.outputBuffer.push(output)
    this.lastActivity = Date.now()
    
    // 버퍼 크기 제한 (메모리 보호)
    if (this.outputBuffer.length > 10000) {
      this.outputBuffer = this.outputBuffer.slice(-5000)
    }
  }
  
  public sendInput(input: string): void {
    if (this.disposed) {
      throw new Error(`Session ${this.id} is already disposed`)
    }
    
    this.status = 'busy'
    this.pty.handleInput(input + '\n')
    this.lastActivity = Date.now()
  }
  
  public getOutput(sinceIndex: number = 0): string[] {
    return this.outputBuffer.slice(sinceIndex)
  }
  
  public show(): void {
    this.terminal.show()
  }
  
  public hide(): void {
    this.terminal.hide()
  }
  
  public dispose(): void {
    if (!this.disposed) {
      this.terminal.dispose()
      this.pty.close()
      this.disposed = true
      this.status = 'closed'
    }
  }
}
```

#### PseudoterminalAdapter.ts
```typescript
import { spawn, ChildProcess } from 'child_process'
import * as vscode from 'vscode'
import { SessionConfig } from './InteractiveSession'

export class PseudoterminalAdapter implements vscode.Pseudoterminal {
  private writeEmitter = new vscode.EventEmitter<string>()
  private closeEmitter = new vscode.EventEmitter<number | void>()
  private process?: ChildProcess
  
  onDidWrite: vscode.Event<string> = this.writeEmitter.event
  onDidClose?: vscode.Event<number | void> = this.closeEmitter.event
  
  constructor(
    private config: SessionConfig,
    private onOutput: (data: string) => void
  ) {}
  
  open(_initialDimensions: vscode.TerminalDimensions | undefined): void {
    console.log(`[PseudoterminalAdapter] Starting: ${this.config.command} ${this.config.args.join(' ')}`)
    
    // Child process 시작
    this.process = spawn(this.config.command, this.config.args, {
      cwd: this.config.cwd,
      env: { ...process.env, ...this.config.env },
      shell: false
    })
    
    // stdout 처리
    this.process.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.writeEmitter.fire(text)
      this.onOutput(text)
    })
    
    // stderr 처리 (빨간색으로 표시)
    this.process.stderr?.on('data', (data: Buffer) => {
      const text = data.toString()
      const coloredText = `\x1b[31m${text}\x1b[0m` // ANSI red
      this.writeEmitter.fire(coloredText)
      this.onOutput(text)
    })
    
    // 프로세스 종료 처리
    this.process.on('exit', (code) => {
      console.log(`[PseudoterminalAdapter] Process exited with code ${code}`)
      this.closeEmitter.fire(code ?? 0)
    })
    
    // 오류 처리
    this.process.on('error', (err) => {
      console.error(`[PseudoterminalAdapter] Process error:`, err)
      this.writeEmitter.fire(`\x1b[31mError: ${err.message}\x1b[0m\n`)
    })
  }
  
  handleInput(data: string): void {
    if (this.process && this.process.stdin) {
      this.process.stdin.write(data)
    }
  }
  
  close(): void {
    if (this.process) {
      this.process.kill()
      this.process = undefined
    }
  }
  
  setDimensions?(_dimensions: vscode.TerminalDimensions): void {
    // Optional: 터미널 크기 변경 처리
  }
}
```

#### InteractiveTerminalController.ts
```typescript
import { InteractiveSession, SessionConfig } from './InteractiveSession'

export class InteractiveTerminalController {
  private sessions = new Map<string, InteractiveSession>()
  
  createSession(config: SessionConfig): string {
    const session = new InteractiveSession(config)
    this.sessions.set(session.id, session)
    
    console.log(`[InteractiveTerminalController] Created session ${session.id}`)
    return session.id
  }
  
  sendInput(sessionId: string, input: string): void {
    const session = this.getSession(sessionId)
    session.sendInput(input)
  }
  
  getOutput(sessionId: string, sinceIndex: number = 0): string[] {
    const session = this.getSession(sessionId)
    return session.getOutput(sinceIndex)
  }
  
  showSession(sessionId: string): void {
    const session = this.getSession(sessionId)
    session.show()
  }
  
  closeSession(sessionId: string): void {
    const session = this.getSession(sessionId)
    session.dispose()
    this.sessions.delete(sessionId)
  }
  
  listSessions(): Array<{
    id: string
    status: string
    createdAt: number
    lastActivity: number
  }> {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      status: session.status,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    }))
  }
  
  private getSession(sessionId: string): InteractiveSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }
    return session
  }
  
  dispose(): void {
    for (const session of this.sessions.values()) {
      session.dispose()
    }
    this.sessions.clear()
  }
}
```

### 3. gRPC Protocol Buffer 정의

**파일**: `proto/caret/interactive_terminal.proto`

```protobuf
syntax = "proto3";

package caret.interactive_terminal;

service InteractiveTerminalService {
  // 새 대화형 터미널 세션 생성
  rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);
  
  // 세션에 입력 전송
  rpc SendInput(SendInputRequest) returns (SendInputResponse);
  
  // 세션 출력 가져오기
  rpc GetOutput(GetOutputRequest) returns (GetOutputResponse);
  
  // 세션 표시/숨기기
  rpc ShowSession(ShowSessionRequest) returns (ShowSessionResponse);
  
  // 세션 종료
  rpc CloseSession(CloseSessionRequest) returns (CloseSessionResponse);
  
  // 모든 세션 목록
  rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);
}

// Request/Response Messages
message CreateSessionRequest {
  string command = 1;              // 'claude', 'cursor', etc.
  repeated string args = 2;        // ['code']
  string cwd = 3;                  // 작업 디렉토리
  map<string, string> env = 4;     // 환경변수
  string name = 5;                 // 터미널 이름 (optional)
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
  int32 current_index = 2;         // 다음 조회를 위한 인덱스
}

message ShowSessionRequest {
  string session_id = 1;
}

message ShowSessionResponse {
  bool success = 1;
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
  string status = 2;               // 'idle', 'busy', etc.
  int64 created_at = 3;
  int64 last_activity = 4;
}
```

### 4. gRPC Handler 구현

**파일**: `src/core/controller/interactive-terminal/CreateSession.ts`

```typescript
import { Controller } from '../index'
import * as proto from '../../../generated/proto/caret/interactive_terminal'

export async function CreateSession(
  controller: Controller,
  request: proto.CreateSessionRequest
): Promise<proto.CreateSessionResponse> {
  const { command, args, cwd, env, name } = request
  
  // InteractiveTerminalController 가져오기 (Controller에 추가 필요)
  const sessionId = controller.interactiveTerminalController.createSession({
    command,
    args,
    cwd,
    env: env || undefined,
    name: name || undefined
  })
  
  return proto.CreateSessionResponse.create({ sessionId })
}
```

**파일**: `src/core/controller/interactive-terminal/SendInput.ts`

```typescript
import { Controller } from '../index'
import * as proto from '../../../generated/proto/caret/interactive_terminal'

export async function SendInput(
  controller: Controller,
  request: proto.SendInputRequest
): Promise<proto.SendInputResponse> {
  const { sessionId, input } = request
  
  try {
    controller.interactiveTerminalController.sendInput(sessionId, input)
    return proto.SendInputResponse.create({ success: true })
  } catch (error) {
    console.error('[SendInput] Error:', error)
    return proto.SendInputResponse.create({ success: false })
  }
}
```

**파일**: `src/core/controller/interactive-terminal/GetOutput.ts`

```typescript
import { Controller } from '../index'
import * as proto from '../../../generated/proto/caret/interactive_terminal'

export async function GetOutput(
  controller: Controller,
  request: proto.GetOutputRequest
): Promise<proto.GetOutputResponse> {
  const { sessionId, sinceIndex } = request
  
  const outputLines = controller.interactiveTerminalController.getOutput(
    sessionId,
    sinceIndex
  )
  
  return proto.GetOutputResponse.create({
    outputLines,
    currentIndex: sinceIndex + outputLines.length
  })
}
```

### 5. Controller 통합

**파일**: `src/core/controller/index.ts` (CARET MODIFICATION)

```typescript
// 기존 imports...
// CARET MODIFICATION: Interactive terminal support
import { InteractiveTerminalController } from '../../../caret-src/integrations/terminal/interactive/InteractiveTerminalController'

export class Controller {
  // 기존 필드...
  
  // CARET MODIFICATION: Interactive terminal controller
  public interactiveTerminalController: InteractiveTerminalController
  
  constructor(
    private context: vscode.ExtensionContext,
    private webviewProvider: WebviewProvider
  ) {
    // 기존 초기화...
    
    // CARET MODIFICATION: Initialize interactive terminal controller
    this.interactiveTerminalController = new InteractiveTerminalController()
  }
  
  // 기존 메서드...
}
```

### 6. Caret 모드 전용 활성화

**조건**: `CARET AGENT MODE`에서만 대화형 터미널 도구 활성화

**파일**: `caret-src/core/prompts/system-prompt/tools/interactive_terminal.ts`

```typescript
import { ToolDefinition } from '@shared/PromptBuilder'

export const interactive_terminal: ToolDefinition = {
  name: 'create_interactive_session',
  description: `Create an interactive terminal session for continuous command execution. 
  Unlike execute_command which runs once and completes, this creates a persistent session 
  where you can send multiple commands and receive ongoing output. 
  
  Use this for:
  - AI CLI tools that require conversation (claude code, cursor, etc.)
  - Long-running interactive processes
  - Multiple commands in same context
  
  NOT for:
  - Single one-off commands (use execute_command instead)`,
  parameters: [
    {
      name: 'command',
      type: 'string',
      required: true,
      instruction: 'The command to run (e.g., "claude", "cursor")',
      usage: 'claude'
    },
    {
      name: 'args',
      type: 'array',
      required: false,
      instruction: 'Command arguments (e.g., ["code"])',
      usage: '["code"]'
    }
  ]
}

export const send_session_input: ToolDefinition = {
  name: 'send_session_input',
  description: 'Send input to an active interactive terminal session',
  parameters: [
    {
      name: 'session_id',
      type: 'string',
      required: true,
      instruction: 'The session ID from create_interactive_session',
      usage: '01HXXX...'
    },
    {
      name: 'input',
      type: 'string',
      required: true,
      instruction: 'The input to send to the session',
      usage: 'Create a README file'
    }
  ]
}
```

---

## 📝 구현 체크리스트

### Phase 1: 핵심 인프라 (1-2일)

#### Backend - Level 1 독립 모듈
- [ ] 디렉토리 구조 생성
  - [ ] `caret-src/integrations/terminal/interactive/`
  - [ ] `src/core/controller/interactive-terminal/` (gRPC handlers)

- [ ] 핵심 클래스 구현
  - [ ] `InteractiveSession.ts` - 세션 클래스
  - [ ] `PseudoterminalAdapter.ts` - VSCode Pseudoterminal 어댑터
  - [ ] `InteractiveTerminalController.ts` - 세션 관리자

- [ ] gRPC 프로토콜 정의
  - [ ] `proto/caret/interactive_terminal.proto` 작성
  - [ ] `npm run protos` 실행하여 클라이언트/서버 코드 생성
  - [ ] 생성된 타입 확인

- [ ] gRPC 핸들러 구현
  - [ ] `CreateSession.ts`
  - [ ] `SendInput.ts`
  - [ ] `GetOutput.ts`
  - [ ] `ShowSession.ts`
  - [ ] `CloseSession.ts`
  - [ ] `ListSessions.ts`

- [ ] Controller 통합 (Level 2 - 최소 수정)
  - [ ] `src/core/controller/index.ts`에 `interactiveTerminalController` 필드 추가
  - [ ] CARET MODIFICATION 주석 추가
  - [ ] 초기화 코드 추가

#### 테스트
- [ ] 수동 테스트용 스크립트 작성
  - [ ] `caret-scripts/test-interactive-terminal.ts`
  - [ ] 세션 생성 → 입력 전송 → 출력 읽기 시나리오

- [ ] 실제 CLI 도구로 테스트
  - [ ] `node` REPL (가장 간단)
  - [ ] `python` 인터프리터
  - [ ] `claude code` (최종 목표)

### Phase 2: 프론트엔드 UI (2-3일)

- [ ] gRPC 클라이언트 확인
  - [ ] `webview-ui/src/services/grpc-client.ts` 업데이트 확인

- [ ] React 컴포넌트 구현
  - [ ] `InteractiveTerminalPanel.tsx` - 메인 패널
  - [ ] `SessionTabs.tsx` - 세션 탭
  - [ ] `TerminalOutput.tsx` - 실시간 출력 (auto-scroll)
  - [ ] `SessionInput.tsx` - 입력 박스

- [ ] 상태 관리
  - [ ] `useInteractiveTerminal.ts` - 커스텀 훅
  - [ ] 실시간 출력 폴링 (1초마다)
  - [ ] 세션 목록 관리

- [ ] UI/UX
  - [ ] VSCode 테마 통합
  - [ ] 키보드 단축키 (Enter = 전송)
  - [ ] 세션 상태 인디케이터
  - [ ] 에러 처리 UI

### Phase 3: Caret 모드 통합 (1일)

- [ ] 시스템 프롬프트 도구 추가
  - [ ] `interactive_terminal.ts` 도구 정의
  - [ ] Caret AGENT MODE에서만 활성화

- [ ] 문서화
  - [ ] 사용 가이드 작성
  - [ ] 예제 시나리오 문서화

---

## 🧪 테스트 계획

### 단계별 테스트

#### 1. Unit Test (VSCode 없이)
```typescript
// caret-src/integrations/terminal/interactive/__tests__/InteractiveSession.test.ts
describe('InteractiveSession', () => {
  it('should create session with ULID', () => {
    const session = new InteractiveSession({ command: 'node', args: [], cwd: '/' })
    expect(session.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  })
  
  it('should buffer output', () => {
    // ...
  })
})
```

#### 2. Integration Test (Node REPL)
```typescript
// 가장 간단한 대화형 프로세스
const controller = new InteractiveTerminalController()
const sessionId = controller.createSession({
  command: 'node',
  args: [],
  cwd: process.cwd()
})

controller.sendInput(sessionId, '1 + 1')
await delay(500)
const output = controller.getOutput(sessionId)
expect(output.some(line => line.includes('2'))).toBe(true)
```

#### 3. E2E Test (Claude Code CLI)
```typescript
// 실제 사용 시나리오
const sessionId = await createSession({ command: 'claude', args: ['code'] })
await sendInput(sessionId, 'Create a hello.txt file with "Hello World"')
await delay(5000)
const output = await getOutput(sessionId)

// 파일 생성 확인
expect(fs.existsSync('hello.txt')).toBe(true)
```

---

## 🔒 보안 고려사항

1. **명령 제한**: Caret 모드에서만 활성화
2. **프로세스 격리**: 각 세션은 독립 프로세스
3. **리소스 제한**: 최대 세션 수 제한 (예: 5개)
4. **출력 버퍼 제한**: 메모리 보호 (10,000 라인)
5. **자동 정리**: 비활성 세션 자동 종료 (1시간)

---

## 📊 성공 지표

- [x] **세션 생성 속도**: < 2초
- [ ] **입력 지연시간**: < 100ms (사용자 입력 → CLI stdin)
- [ ] **출력 스트리밍**: < 50ms 청크
- [ ] **메모리 사용**: 세션당 < 50MB
- [ ] **안정성**: 1시간 연속 대화 세션 유지

---

## 🚀 다음 단계

1. **Phase 1 MVP 구현** (현재 계획)
   - 목표: Node REPL 제어 성공
   - 일정: 1-2일

2. **Claude Code CLI 테스트**
   - UX 검증
   - 피드백 수집

3. **프론트엔드 UI 완성** (Phase 2)
   - 사용자 친화적 인터페이스
   - 일정: 2-3일

4. **프로덕션 준비** (Phase 3)
   - 에러 처리 강화
   - 문서화
   - 일정: 1일

---

## 📚 참고 자료

- [VSCode Terminal API](https://code.visualstudio.com/api/references/vscode-api#Terminal)
- [VSCode Pseudoterminal](https://code.visualstudio.com/api/references/vscode-api#Pseudoterminal)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)
- [ULID Spec](https://github.com/ulid/spec)
