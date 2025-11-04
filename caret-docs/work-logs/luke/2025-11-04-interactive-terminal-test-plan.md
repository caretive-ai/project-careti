# Interactive Terminal 테스트 계획서

**작성일**: 2025-11-04
**목적**: 개발자가 직접 수동/자동 테스트를 수행할 수 있는 시나리오 기반 가이드
**대상**: Luke (개발자)

---

## 📋 테스트 전략

### 테스트 레벨
1. **Level 0**: 인터페이스 및 타입 검증 (컴파일 테스트)
2. **Level 1**: Mock 기반 단위 테스트 (플랫폼 독립 코어)
3. **Level 2**: VS Code 어댑터 통합 테스트 (Python/Node REPL)
4. **Level 3**: Claude Code 실제 통합 테스트
5. **Level 4**: gRPC API 및 웹뷰 E2E 테스트

### 테스트 환경
- **OS**: Linux (Fedora), macOS, Windows
- **VS Code**: 최신 stable 버전
- **Node.js**: v18+
- **Python**: 3.8+
- **Claude CLI**: `claude --version`으로 설치 확인

---

## 🔧 Level 0: 컴파일 및 타입 검증

### 목표
기본 구조가 TypeScript 컴파일을 통과하는지 확인

### 테스트 절차

```bash
# 1. 인터페이스 및 타입 파일 생성 확인
ls -la caret-src/integrations/terminal/interactive/core/interfaces/
ls -la caret-src/integrations/terminal/interactive/core/types.ts

# 2. TypeScript 컴파일
npm run compile

# 3. 타입 체크
npm run check-types
```

### 성공 기준
- [ ] 컴파일 에러 없음
- [ ] 타입 체크 통과
- [ ] `ITerminalAdapter` 인터페이스 정의 확인
- [ ] `SessionConfig`, `SessionInfo` 타입 정의 확인

### 실패 시 조치
- 타입 정의 오류 수정
- import 경로 확인
- tsconfig.json 설정 확인

---

## 🧪 Level 1: Mock 기반 단위 테스트

### 목표
플랫폼 독립적 코어 로직 검증 (VS Code 없이도 테스트 가능)

### 테스트 1.1: InteractiveSession - 기본 동작

**파일**: `caret-src/integrations/terminal/interactive/__tests__/core/InteractiveSession.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { InteractiveSession } from '../../core/InteractiveSession'
import { ITerminalAdapter, SessionConfig } from '../../core/interfaces'

class MockAdapter implements ITerminalAdapter {
  private outputCallback?: (data: string) => void
  private exitCallback?: (code: number) => void

  async start(config: SessionConfig): Promise<void> {
    // Mock implementation
  }

  sendInput(data: string): void {
    // Echo input as output (for testing)
    setTimeout(() => {
      this.outputCallback?.(`Echo: ${data}`)
    }, 10)
  }

  onOutput(callback: (data: string) => void) {
    this.outputCallback = callback
    return { dispose: () => { this.outputCallback = undefined } }
  }

  onExit(callback: (code: number) => void) {
    this.exitCallback = callback
    return { dispose: () => { this.exitCallback = undefined } }
  }

  dispose(): void {}

  // Test helper
  simulateOutput(data: string): void {
    this.outputCallback?.(data)
  }

  simulateExit(code: number): void {
    this.exitCallback?.(code)
  }
}

describe('InteractiveSession', () => {
  let adapter: MockAdapter
  let session: InteractiveSession

  beforeEach(() => {
    adapter = new MockAdapter()
    session = new InteractiveSession(adapter, {
      command: 'test',
      args: [],
      cwd: '/tmp'
    })
  })

  it('should start and emit output events', async () => {
    const outputs: string[] = []
    session.on('output', (data) => outputs.push(data))

    await session.start()
    adapter.simulateOutput('Hello World')

    expect(outputs).toContain('Hello World')
  })

  it('should buffer output', async () => {
    await session.start()

    adapter.simulateOutput('Line 1\n')
    adapter.simulateOutput('Line 2\n')

    const output = session.getOutput()
    expect(output).toHaveLength(2)
    expect(output[0]).toBe('Line 1\n')
    expect(output[1]).toBe('Line 2\n')
  })

  it('should send input to adapter', async () => {
    await session.start()

    const outputs: string[] = []
    session.on('output', (data) => outputs.push(data))

    session.sendInput('test input')

    // Wait for async callback
    await new Promise(resolve => setTimeout(resolve, 20))

    expect(outputs.some(o => o.includes('test input'))).toBe(true)
  })

  it('should emit exit event', async () => {
    let exitCode: number | undefined

    session.on('exit', (code) => {
      exitCode = code
    })

    await session.start()
    adapter.simulateExit(0)

    expect(exitCode).toBe(0)
  })

  it('should dispose properly', async () => {
    await session.start()
    session.dispose()
    // Should not throw
  })
})
```

**실행**:
```bash
npm run test:backend -- InteractiveSession.test.ts
```

**성공 기준**:
- [ ] 모든 테스트 통과
- [ ] 출력 이벤트 정상 작동
- [ ] 버퍼링 정상 작동
- [ ] 입력 전송 정상 작동

---

### 테스트 1.2: SessionManager - 세션 관리

**파일**: `caret-src/integrations/terminal/interactive/__tests__/core/SessionManager.test.ts`

```typescript
describe('SessionManager', () => {
  let manager: SessionManager
  let mockFactory: () => ITerminalAdapter

  beforeEach(() => {
    mockFactory = () => new MockAdapter()
    manager = new SessionManager(mockFactory)
  })

  it('should create a session', async () => {
    const sessionId = await manager.createSession({
      command: 'test',
      args: [],
      cwd: '/tmp'
    })

    expect(sessionId).toBeDefined()
    expect(sessionId.length).toBeGreaterThan(0)
  })

  it('should retrieve created session', async () => {
    const sessionId = await manager.createSession({
      command: 'test',
      args: [],
      cwd: '/tmp'
    })

    const session = manager.getSession(sessionId)
    expect(session).toBeDefined()
  })

  it('should close session', async () => {
    const sessionId = await manager.createSession({
      command: 'test',
      args: [],
      cwd: '/tmp'
    })

    manager.closeSession(sessionId)

    const session = manager.getSession(sessionId)
    expect(session).toBeUndefined()
  })

  it('should list all sessions', async () => {
    const id1 = await manager.createSession({ command: 'test1', args: [], cwd: '/tmp' })
    const id2 = await manager.createSession({ command: 'test2', args: [], cwd: '/tmp' })

    const sessions = manager.listSessions()
    expect(sessions).toHaveLength(2)
    expect(sessions.map(s => s.id)).toContain(id1)
    expect(sessions.map(s => s.id)).toContain(id2)
  })
})
```

**실행**:
```bash
npm run test:backend -- SessionManager.test.ts
```

**성공 기준**:
- [ ] 세션 생성 성공
- [ ] 세션 조회 성공
- [ ] 세션 종료 성공
- [ ] 세션 목록 조회 성공

---

## 🖥️ Level 2: VS Code 어댑터 통합 테스트

### 목표
실제 프로세스를 실행하고 제어할 수 있는지 검증

### 준비 사항

```bash
# Python 설치 확인
python3 --version

# Node 설치 확인
node --version
```

---

### 테스트 2.1: Python REPL 제어 (수동 테스트)

**목적**: 가장 기본적인 interactive 제어 검증

**절차**:

1. **테스트 스크립트 작성**

파일: `caret-src/integrations/terminal/interactive/__tests__/manual/test-python-repl.ts`

```typescript
import { createVSCodeSessionManager } from '../../adapters/vscode'

async function testPythonREPL() {
  console.log('🚀 Starting Python REPL test...')

  const manager = createVSCodeSessionManager()

  // 1. 세션 생성
  console.log('1️⃣ Creating Python session...')
  const sessionId = await manager.createSession({
    command: 'python3',
    args: ['-i'],
    cwd: process.cwd()
  })
  console.log(`✅ Session created: ${sessionId}`)

  // 2. 세션 조회
  const session = manager.getSession(sessionId)
  if (!session) {
    throw new Error('Session not found')
  }
  console.log('✅ Session retrieved')

  // 3. 출력 리스너
  session.on('output', (data) => {
    console.log('[Python Output]', data)
  })

  // 4. 간단한 계산
  console.log('2️⃣ Testing simple calculation...')
  session.sendInput('2 + 2')
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('✅ Calculation sent')

  // 5. 문자열 출력
  console.log('3️⃣ Testing print...')
  session.sendInput('print("Hello from Python")')
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('✅ Print sent')

  // 6. 버퍼 확인
  const output = session.getOutput()
  console.log('4️⃣ Output buffer:', output.length, 'lines')
  console.log(output.join('\n'))

  // 7. 종료
  console.log('5️⃣ Closing session...')
  manager.closeSession(sessionId)
  console.log('✅ Session closed')

  console.log('🎉 Test completed!')
}

// VS Code Extension 컨텍스트에서 실행
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('caret.test.pythonRepl', testPythonREPL)
  )
}
```

2. **실행 방법**

```bash
# 1. Extension 빌드
npm run compile

# 2. F5로 Extension Development Host 실행

# 3. Command Palette (Cmd+Shift+P)
# "Caret: Test Python REPL" 실행

# 4. 출력 패널에서 결과 확인
```

3. **예상 출력**

```
🚀 Starting Python REPL test...
1️⃣ Creating Python session...
✅ Session created: 01JCXXXXXXXXXXXXXXXXXXXXXXXX
✅ Session retrieved
2️⃣ Testing simple calculation...
[Python Output] Python 3.x.x ...
[Python Output] >>> 2 + 2
[Python Output] 4
[Python Output] >>>
✅ Calculation sent
3️⃣ Testing print...
[Python Output] >>> print("Hello from Python")
[Python Output] Hello from Python
[Python Output] >>>
✅ Print sent
4️⃣ Output buffer: 8 lines
...
✅ Session closed
🎉 Test completed!
```

**성공 기준**:
- [ ] Python 세션 시작
- [ ] 계산 결과 `4` 출력
- [ ] "Hello from Python" 출력
- [ ] 출력 버퍼에 모든 출력 저장
- [ ] 세션 정상 종료

**실패 시 체크**:
- Python 경로가 올바른가?
- stdout 리다이렉션이 정상인가?
- 타임아웃이 충분한가?

---

### 테스트 2.2: Node REPL 제어 (수동 테스트)

**절차**:

```typescript
async function testNodeREPL() {
  console.log('🚀 Starting Node REPL test...')

  const manager = createVSCodeSessionManager()

  const sessionId = await manager.createSession({
    command: 'node',
    args: [],
    cwd: process.cwd()
  })

  const session = manager.getSession(sessionId)!
  session.on('output', (data) => {
    console.log('[Node Output]', data)
  })

  // 테스트 입력들
  session.sendInput('1 + 1')
  await new Promise(resolve => setTimeout(resolve, 500))

  session.sendInput('console.log("Hello from Node")')
  await new Promise(resolve => setTimeout(resolve, 500))

  session.sendInput('Math.sqrt(16)')
  await new Promise(resolve => setTimeout(resolve, 500))

  session.sendInput('.exit')
  await new Promise(resolve => setTimeout(resolve, 500))

  manager.closeSession(sessionId)
  console.log('🎉 Test completed!')
}
```

**성공 기준**:
- [ ] Node REPL 시작
- [ ] 계산 결과 출력
- [ ] console.log 출력
- [ ] `.exit`로 정상 종료

---

### 테스트 2.3: 장기 실행 프로세스 (수동 테스트)

**목적**: 프로세스가 계속 실행되는 동안 입출력 제어 가능 여부

```typescript
async function testLongRunningProcess() {
  const manager = createVSCodeSessionManager()

  // 간단한 서버 프로세스 시작 (예: Python HTTP server)
  const sessionId = await manager.createSession({
    command: 'python3',
    args: ['-m', 'http.server', '8888'],
    cwd: process.cwd()
  })

  const session = manager.getSession(sessionId)!

  // 출력 모니터링
  session.on('output', (data) => {
    console.log('[Server Output]', data)

    // "Serving HTTP" 메시지 확인
    if (data.includes('Serving HTTP')) {
      console.log('✅ Server started successfully')
    }
  })

  // 10초 대기
  await new Promise(resolve => setTimeout(resolve, 10000))

  // Ctrl+C 전송 (프로세스 종료)
  session.sendInput('\x03')  // Ctrl+C

  await new Promise(resolve => setTimeout(resolve, 1000))

  manager.closeSession(sessionId)
  console.log('🎉 Long-running process test completed!')
}
```

**성공 기준**:
- [ ] HTTP 서버 시작
- [ ] "Serving HTTP" 메시지 출력 확인
- [ ] Ctrl+C로 서버 종료
- [ ] 세션 정상 종료

---

## 🤖 Level 3: Claude Code 실제 통합 테스트

### 목표
실제 Claude Code CLI를 제어하고 대화 가능 여부 검증

### 준비 사항

```bash
# Claude CLI 설치 확인
claude --version

# 인증 확인
claude auth status

# 테스트용 워크스페이스 준비
mkdir -p /tmp/caret-test
cd /tmp/caret-test
```

---

### 테스트 3.1: Claude Code 출력 패턴 분석 (수동)

**목적**: Claude Code의 실제 출력 패턴 파악

**절차**:

```bash
# 1. 터미널에서 Claude Code 실행
cd /tmp/caret-test
claude code

# 2. 시작 메시지 확인
# 📝 기록: 첫 출력이 무엇인가?
# 📝 기록: 프롬프트 형태는? (예: "> ", "claude> ", etc.)

# 3. 간단한 질문
> What is 2+2?

# 📝 기록: 응답 시작 패턴
# 📝 기록: 응답 완료 후 프롬프트 돌아오는 패턴

# 4. 파일 생성 요청
> Create a file test.txt with content "hello"

# 📝 기록: 도구 실행 시작 패턴 (예: [Tool: Write])
# 📝 기록: 도구 출력 형태
# 📝 기록: 도구 완료 패턴

# 5. 에러 유발
> Create a file /root/forbidden.txt

# 📝 기록: 에러 메시지 패턴

# 6. 긴 응답
> Explain how React hooks work in detail

# 📝 기록: 긴 응답이 스트리밍되는지?
# 📝 기록: 중간에 출력 패턴 변화가 있는지?

# 7. Ctrl+C 테스트
> [Ctrl+C 입력]

# 📝 기록: 취소 메시지 패턴

# 8. 종료
> exit
# 또는
> quit
```

**분석 결과 문서화**:

파일: `caret-docs/work-logs/luke/2025-11-04-claude-code-output-patterns.md`

```markdown
# Claude Code 출력 패턴 분석

## 시작 메시지
```
[실제 출력 복사]
```

## 프롬프트 패턴
- 기본: `> `
- 변형: (있다면 기록)

## 응답 패턴
- 시작: (기록)
- 진행: (기록)
- 완료: (기록)

## 도구 실행 패턴
- Write: (기록)
- Read: (기록)
- Bash: (기록)

## 에러 패턴
- API 에러: (기록)
- 권한 에러: (기록)
```

---

### 테스트 3.2: ClaudeCodeAdapter 프로토타입 (자동)

**파일**: `caret-src/integrations/terminal/interactive/__tests__/ai-tools/ClaudeCodeAdapter.test.ts`

```typescript
describe('ClaudeCodeAdapter', () => {
  let manager: SessionManager
  let adapter: ClaudeCodeAdapter

  beforeEach(() => {
    manager = createVSCodeSessionManager()
    adapter = new ClaudeCodeAdapter(manager)
  })

  afterEach(() => {
    adapter.dispose()
  })

  it('should start Claude Code session', async () => {
    let isReady = false
    adapter.on('ready', () => {
      isReady = true
    })

    await adapter.start()

    // 5초 내에 ready 이벤트 발생해야 함
    await new Promise(resolve => setTimeout(resolve, 5000))
    expect(isReady).toBe(true)
  }, 10000)

  it('should send message and receive response', async () => {
    await adapter.start()

    const response = await adapter.sendMessageAndWait('What is 2+2?', 30000)

    console.log('Response:', response)
    expect(response.toLowerCase()).toContain('4')
  }, 60000)

  it('should handle file creation', async () => {
    await adapter.start()

    let toolStarted = false
    let toolName: string | undefined

    adapter.on('tool-start', (name) => {
      toolStarted = true
      toolName = name
    })

    const response = await adapter.sendMessageAndWait(
      'Create a file test.txt with content "hello world"',
      60000
    )

    expect(toolStarted).toBe(true)
    expect(toolName).toBe('Write')

    // 파일 확인
    const fs = require('fs')
    const exists = fs.existsSync('./test.txt')
    expect(exists).toBe(true)

    if (exists) {
      const content = fs.readFileSync('./test.txt', 'utf-8')
      expect(content).toContain('hello world')
    }
  }, 90000)

  it('should handle multiple messages', async () => {
    await adapter.start()

    const response1 = await adapter.sendMessageAndWait('What is 2+2?')
    expect(response1).toContain('4')

    const response2 = await adapter.sendMessageAndWait('What is 3+3?')
    expect(response2).toContain('6')

    const response3 = await adapter.sendMessageAndWait('What is 5*5?')
    expect(response3).toContain('25')
  }, 120000)

  it('should handle errors gracefully', async () => {
    await adapter.start()

    let errorOccurred = false
    adapter.on('error', () => {
      errorOccurred = true
    })

    try {
      await adapter.sendMessageAndWait(
        'Create a file /root/forbidden.txt',
        30000
      )
    } catch (error) {
      // 에러 처리 확인
    }

    // 에러 후에도 계속 사용 가능한지 확인
    const response = await adapter.sendMessageAndWait('What is 1+1?')
    expect(response).toContain('2')
  }, 90000)
})
```

**실행**:
```bash
# 테스트 실행
npm run test:backend -- ClaudeCodeAdapter.test.ts

# 또는 watch 모드
npm run test:backend:watch -- ClaudeCodeAdapter.test.ts
```

**성공 기준**:
- [ ] Claude Code 세션 시작 (5초 내)
- [ ] 간단한 질문 응답 수신
- [ ] 파일 생성 도구 실행 감지
- [ ] 여러 번 연속 대화 가능
- [ ] 에러 후 복구 가능

---

## 🌐 Level 4: gRPC API 및 웹뷰 E2E 테스트

### 목표
프론트엔드에서 실제로 interactive terminal을 사용할 수 있는지 검증

### 준비 사항

```bash
# Proto 컴파일
npm run protos

# Extension 빌드
npm run compile

# Webview 빌드
npm run build:webview
```

---

### 테스트 4.1: gRPC API 단위 테스트

**파일**: `src/core/controller/interactive-terminal/__tests__/handlers.test.ts`

```typescript
import { CreateSession, SendInput, GetOutput, CloseSession } from '../handlers'

describe('Interactive Terminal gRPC Handlers', () => {
  let mockController: Controller

  beforeEach(() => {
    mockController = createMockController()
  })

  it('should create session via gRPC', async () => {
    const request = {
      toolName: 'python',
      command: 'python3',
      args: ['-i'],
      cwd: '/tmp',
      env: {}
    }

    const response = await CreateSession(mockController, request)

    expect(response.sessionId).toBeDefined()
    expect(response.sessionId.length).toBeGreaterThan(0)
  })

  it('should send input via gRPC', async () => {
    // 먼저 세션 생성
    const createResponse = await CreateSession(mockController, {
      toolName: 'python',
      command: 'python3',
      args: ['-i'],
      cwd: '/tmp'
    })

    const sessionId = createResponse.sessionId

    // 입력 전송
    const sendResponse = await SendInput(mockController, {
      sessionId,
      input: 'print("test")'
    })

    expect(sendResponse.success).toBe(true)
  })

  it('should get output via gRPC', async () => {
    const createResponse = await CreateSession(mockController, {
      toolName: 'python',
      command: 'python3',
      args: ['-i'],
      cwd: '/tmp'
    })

    const sessionId = createResponse.sessionId

    // 입력 전송
    await SendInput(mockController, {
      sessionId,
      input: 'print("hello")'
    })

    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 출력 조회
    const outputResponse = await GetOutput(mockController, {
      sessionId,
      sinceIndex: 0
    })

    expect(outputResponse.outputLines.length).toBeGreaterThan(0)
    expect(outputResponse.outputLines.some(line => line.includes('hello'))).toBe(true)
  })

  it('should close session via gRPC', async () => {
    const createResponse = await CreateSession(mockController, {
      toolName: 'python',
      command: 'python3',
      args: ['-i'],
      cwd: '/tmp'
    })

    const closeResponse = await CloseSession(mockController, {
      sessionId: createResponse.sessionId
    })

    expect(closeResponse.success).toBe(true)
  })
})
```

**실행**:
```bash
npm run test:backend -- handlers.test.ts
```

---

### 테스트 4.2: 웹뷰 UI 수동 테스트

**시나리오 1: Python 세션 생성 및 대화**

1. Extension Development Host 실행 (F5)
2. Interactive Terminal 패널 열기
3. "+ Python" 버튼 클릭
4. 세션 생성 확인
5. 입력창에 `print("hello")` 입력
6. 출력 영역에 "hello" 표시 확인
7. 세션 탭 클릭으로 전환 확인
8. 세션 닫기 버튼 (×) 클릭
9. 세션 종료 확인

**시나리오 2: Claude Code 세션**

1. "+ Claude Code" 버튼 클릭
2. Claude Code 초기화 메시지 확인
3. 입력창에 "What is 2+2?" 입력
4. 응답 실시간 스트리밍 확인
5. 프롬프트 돌아옴 확인
6. 입력창에 "Create a file test.txt" 입력
7. 도구 실행 표시 확인 (있다면)
8. 파일 생성 확인
9. 여러 번 연속 대화

**시나리오 3: 다중 세션 관리**

1. Python 세션 생성
2. Node 세션 생성
3. Claude Code 세션 생성
4. 세션 탭으로 전환하며 각각 입력
5. 출력이 세션별로 분리되어 표시되는지 확인
6. 한 세션 닫아도 다른 세션 계속 작동 확인

**체크리스트**:
- [ ] 세션 생성 버튼 작동
- [ ] 세션 탭 표시 및 전환
- [ ] 입력창 활성화/비활성화
- [ ] 출력 실시간 스트리밍
- [ ] 출력 스크롤 (자동으로 아래로)
- [ ] 세션 닫기 작동
- [ ] 에러 메시지 표시 (있다면)
- [ ] 로딩 스피너 (있다면)

---

### 테스트 4.3: E2E 자동화 (Playwright - 선택적)

**파일**: `src/test/e2e/interactive-terminal.test.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Interactive Terminal E2E', () => {
  test('should create Python session and interact', async ({ page }) => {
    // Extension 로드
    await page.goto('/')

    // Interactive Terminal 패널 열기
    await page.click('[data-testid="interactive-terminal-button"]')

    // Python 세션 생성
    await page.click('button:has-text("+ Python")')

    // 세션 탭 확인
    await expect(page.locator('.session-tab')).toContainText('python')

    // 입력
    await page.fill('input[placeholder="Type a message..."]', 'print("test")')
    await page.press('input[placeholder="Type a message..."]', 'Enter')

    // 출력 확인
    await expect(page.locator('.terminal-output')).toContainText('test', {
      timeout: 5000
    })
  })

  test('should create Claude Code session', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="interactive-terminal-button"]')

    // Claude Code 세션 생성
    await page.click('button:has-text("+ Claude Code")')

    // 초기화 대기
    await page.waitForSelector('.session-tab:has-text("claude-code")', {
      timeout: 10000
    })

    // 메시지 전송
    await page.fill('input[placeholder="Type a message..."]', 'What is 2+2?')
    await page.press('input[placeholder="Type a message..."]', 'Enter')

    // 응답 대기
    await expect(page.locator('.terminal-output')).toContainText('4', {
      timeout: 30000
    })
  })
})
```

**실행**:
```bash
npm run test:e2e
```

---

## 📊 테스트 결과 리포트 템플릿

### 테스트 실행 리포트

**날짜**: 2025-11-XX
**테스터**: Luke
**환경**: Linux Fedora / VS Code 1.x.x / Node 18.x

| Level | 테스트 | 상태 | 소요 시간 | 비고 |
|-------|--------|------|----------|------|
| 0 | 컴파일 검증 | ✅ | 2분 | - |
| 1.1 | InteractiveSession | ✅ | 5분 | - |
| 1.2 | SessionManager | ✅ | 3분 | - |
| 2.1 | Python REPL | ✅ | 10분 | - |
| 2.2 | Node REPL | ✅ | 5분 | - |
| 2.3 | 장기 프로세스 | ✅ | 15분 | - |
| 3.1 | 출력 패턴 분석 | ✅ | 30분 | 별도 문서 작성 |
| 3.2 | ClaudeCodeAdapter | ❌ | 20분 | 프롬프트 감지 실패 |
| 4.1 | gRPC API | ⏸️ | - | 미실행 |
| 4.2 | 웹뷰 UI | ⏸️ | - | 미실행 |

**총 소요 시간**: XX시간 XX분

**발견된 이슈**:
1. Claude Code 프롬프트 감지 실패 - 정규식 수정 필요
2. Python REPL 초기 출력 처리 개선 필요

**다음 액션**:
- [ ] ClaudeCodeAdapter 프롬프트 패턴 수정
- [ ] Python REPL 초기화 타이밍 조정
- [ ] gRPC API 테스트 실행

---

## 🚀 테스트 실행 가이드

### 빠른 테스트 (개발 중)

```bash
# 1. 코어 로직만 (플랫폼 독립)
npm run test:backend -- InteractiveSession.test.ts
npm run test:backend -- SessionManager.test.ts

# 2. VS Code 어댑터 (통합)
# Extension Development Host에서 수동 실행

# 3. 전체 테스트
npm run test:all
```

### 전체 검증 (릴리스 전)

```bash
# 1. 컴파일
npm run compile && npm run check-types

# 2. 단위 테스트
npm run test:backend

# 3. 통합 테스트 (수동)
# F5 → Command Palette → "Caret: Test Interactive Terminal"

# 4. E2E 테스트
npm run test:e2e

# 5. 커버리지 확인
npm run caret:coverage
```

---

## 📝 체크리스트: Phase별 테스트 완료 기준

### Phase 1 완료 기준
- [ ] Level 0 통과
- [ ] Level 1.1 통과
- [ ] Level 1.2 통과

### Phase 2 완료 기준
- [ ] Phase 1 완료
- [ ] Level 2.1 통과 (Python)
- [ ] Level 2.2 통과 (Node)
- [ ] Level 2.3 통과 (장기 실행)

### Phase 3 완료 기준
- [ ] Phase 2 완료
- [ ] Level 3.1 완료 (패턴 분석)
- [ ] Level 3.2 통과 (ClaudeCodeAdapter)

### Phase 4 완료 기준
- [ ] Phase 3 완료
- [ ] Level 4.1 통과 (gRPC)
- [ ] Level 4.2 통과 (웹뷰 UI)
- [ ] Level 4.3 통과 (E2E, 선택적)

---

**작성자**: Luke
**최종 업데이트**: 2025-11-04
