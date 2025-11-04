# ClaudeCodeAdapter 상세 설계

**작성일**: 2025-11-04
**목표**: Claude Code CLI를 안정적으로 제어하는 어댑터 구현

---

## 🔍 Phase 1: Claude Code 출력 패턴 분석

### 1.1 수동 실행 및 패턴 파악

**실험 절차**:
```bash
# 1. Claude Code 실행
$ claude code

# 2. 다양한 시나리오 테스트
> What is 2+2?
> Create a file test.txt
> Read that file
> Run 'ls' command
```

**캡처해야 할 패턴**:
1. **시작 메시지**: 초기 환영 메시지
2. **프롬프트**: 입력 대기 상태 (예: `> `, `claude> `)
3. **응답 시작**: Claude가 답변을 시작할 때
4. **도구 실행**: 파일 작성, bash 명령어 등
5. **응답 완료**: 프롬프트로 돌아올 때
6. **에러 메시지**: API 에러, 실행 실패 등

### 1.2 예상 출력 패턴 (가설)

```
Welcome to Claude Code!
Type your request below.

> [입력 대기]
_

[사용자 입력: What is 2+2?]

> What is 2+2?

The answer is 4.

> [다음 입력 대기]
_

[사용자 입력: Create a file test.txt]

> Create a file test.txt

I'll create test.txt for you.

[Tool: Write]
Writing to test.txt...
Done.

> [다음 입력 대기]
```

**주요 감지 포인트**:
- `> ` + 커서: 입력 대기 (READY 상태)
- `[Tool: ...]`: 도구 실행 시작
- `Done.` 또는 `> `: 도구 실행 완료

---

## 🏗️ Phase 2: 상태 머신 설계

### 2.1 어댑터 상태 정의

```typescript
enum ClaudeCodeState {
  INITIALIZING = 'initializing',    // 세션 시작 중
  READY = 'ready',                   // 입력 대기 (프롬프트 표시)
  PROCESSING = 'processing',         // 응답 생성 중
  TOOL_EXECUTING = 'tool_executing', // 도구 실행 중
  ERROR = 'error'                    // 에러 상태
}
```

### 2.2 상태 전환 다이어그램

```
┌─────────────┐
│INITIALIZING │
└──────┬──────┘
       │ (프롬프트 감지)
       v
   ┌───────┐
   │ READY │ ◄──────────────────────┐
   └───┬───┘                        │
       │ (메시지 전송)               │
       v                            │
┌──────────────┐                    │
│ PROCESSING   │                    │
└──────┬───────┘                    │
       │ (도구 실행 감지)            │
       v                            │
┌──────────────────┐                │
│ TOOL_EXECUTING   │                │
└──────┬───────────┘                │
       │ (완료 감지)                 │
       └────────────────────────────┘
```

### 2.3 출력 파싱 규칙

```typescript
interface ParseRule {
  pattern: RegExp
  nextState: ClaudeCodeState
  action?: (match: RegExpMatchArray) => void
}

const PARSE_RULES: ParseRule[] = [
  {
    // 프롬프트 감지 (입력 대기)
    pattern: /^>\s*$/m,
    nextState: ClaudeCodeState.READY,
    action: () => {
      // responseBuffer를 이벤트로 emit
    }
  },
  {
    // 도구 실행 시작
    pattern: /\[Tool:\s*(\w+)\]/,
    nextState: ClaudeCodeState.TOOL_EXECUTING,
    action: (match) => {
      const toolName = match[1]
      // 도구 이름 저장
    }
  },
  {
    // 에러 감지
    pattern: /Error:|Failed:|Exception:/i,
    nextState: ClaudeCodeState.ERROR,
    action: (match) => {
      // 에러 메시지 수집
    }
  }
]
```

---

## 💻 Phase 3: ClaudeCodeAdapter 구현

### 3.1 전체 구조

```typescript
// caret-src/integrations/terminal/interactive/ai-tools/ClaudeCodeAdapter.ts

export class ClaudeCodeAdapter extends BaseAIAdapter {
  // 상태 관리
  private state: ClaudeCodeState = ClaudeCodeState.INITIALIZING

  // 버퍼
  private responseBuffer: string = ''
  private currentToolName?: string
  private errorBuffer: string = ''

  // 타이머
  private readyTimeout?: NodeJS.Timeout
  private responseTimeout?: NodeJS.Timeout

  // 설정
  private readonly READY_TIMEOUT = 5000      // 5초 내에 프롬프트 나와야 함
  private readonly RESPONSE_TIMEOUT = 60000  // 60초 내에 응답 완료

  constructor(manager: SessionManager) {
    super(manager)
  }

  // BaseAIAdapter 추상 메서드 구현
  getSessionConfig(): SessionConfig {
    return {
      command: 'claude',
      args: ['code'],
      cwd: this.getCwd(),
      env: {
        TERM: 'xterm-256color',
        // Claude Code 특화 환경 변수
        CLAUDE_CODE_NON_INTERACTIVE: 'false'
      }
    }
  }

  // 출력 파싱 메인 로직
  parseOutput(data: string): void {
    // 디버그 로깅
    console.log('[ClaudeCode]', this.state, data)

    // 버퍼에 추가
    this.responseBuffer += data

    // 상태별 파싱
    switch (this.state) {
      case ClaudeCodeState.INITIALIZING:
        this.handleInitializing(data)
        break
      case ClaudeCodeState.READY:
        this.handleReady(data)
        break
      case ClaudeCodeState.PROCESSING:
        this.handleProcessing(data)
        break
      case ClaudeCodeState.TOOL_EXECUTING:
        this.handleToolExecuting(data)
        break
      case ClaudeCodeState.ERROR:
        this.handleError(data)
        break
    }

    // 실시간 출력 이벤트 (UI 표시용)
    this.emit('output', data)
  }

  // 상태별 핸들러
  private handleInitializing(data: string): void {
    // 프롬프트 감지
    if (this.detectPrompt(data)) {
      this.clearReadyTimeout()
      this.setState(ClaudeCodeState.READY)
      this.emit('ready')
    }
  }

  private handleReady(data: string): void {
    // READY 상태에서는 사용자 입력 대기
    // 예상치 못한 출력이 있으면 로깅
    if (data.trim() && !this.detectPrompt(data)) {
      console.warn('[ClaudeCode] Unexpected output in READY state:', data)
    }
  }

  private handleProcessing(data: string): void {
    // 도구 실행 감지
    const toolMatch = data.match(/\[Tool:\s*(\w+)\]/)
    if (toolMatch) {
      this.currentToolName = toolMatch[1]
      this.setState(ClaudeCodeState.TOOL_EXECUTING)
      this.emit('tool-start', this.currentToolName)
      return
    }

    // 프롬프트 감지 (응답 완료)
    if (this.detectPrompt(data)) {
      this.clearResponseTimeout()
      const response = this.flushResponseBuffer()
      this.setState(ClaudeCodeState.READY)
      this.emit('response-complete', response)
    }

    // 에러 감지
    if (this.detectError(data)) {
      this.setState(ClaudeCodeState.ERROR)
    }
  }

  private handleToolExecuting(data: string): void {
    // 도구 출력 수집
    this.emit('tool-output', data)

    // 도구 완료 감지 (프롬프트 돌아옴)
    if (this.detectPrompt(data)) {
      this.clearResponseTimeout()
      const response = this.flushResponseBuffer()
      this.setState(ClaudeCodeState.READY)
      this.emit('tool-complete', this.currentToolName)
      this.emit('response-complete', response)
      this.currentToolName = undefined
    }
  }

  private handleError(data: string): void {
    this.errorBuffer += data

    // 프롬프트로 돌아오면 에러 완료
    if (this.detectPrompt(data)) {
      const error = this.errorBuffer
      this.errorBuffer = ''
      this.setState(ClaudeCodeState.READY)
      this.emit('error', new Error(error))
    }
  }

  // 패턴 감지 유틸리티
  private detectPrompt(data: string): boolean {
    // Claude Code 프롬프트 패턴들
    const patterns = [
      /^>\s*$/m,           // "> "
      /^claude>\s*$/m,     // "claude> "
      /\n>\s*$/,           // 줄바꿈 후 "> "
    ]
    return patterns.some(p => p.test(data))
  }

  private detectError(data: string): boolean {
    const errorPatterns = [
      /Error:/i,
      /Failed:/i,
      /Exception:/i,
      /API error/i,
      /Connection refused/i
    ]
    return errorPatterns.some(p => p.test(data))
  }

  // 상태 관리
  private setState(newState: ClaudeCodeState): void {
    console.log(`[ClaudeCode] State: ${this.state} -> ${newState}`)
    this.state = newState
  }

  // 버퍼 관리
  private flushResponseBuffer(): string {
    const response = this.responseBuffer.trim()
    this.responseBuffer = ''
    return response
  }

  // 타임아웃 관리
  private setReadyTimeout(): void {
    this.readyTimeout = setTimeout(() => {
      console.error('[ClaudeCode] Ready timeout - prompt not detected')
      this.emit('error', new Error('Claude Code did not start properly'))
    }, this.READY_TIMEOUT)
  }

  private clearReadyTimeout(): void {
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout)
      this.readyTimeout = undefined
    }
  }

  private setResponseTimeout(): void {
    this.responseTimeout = setTimeout(() => {
      console.error('[ClaudeCode] Response timeout')
      this.emit('error', new Error('Response timeout'))
      this.setState(ClaudeCodeState.READY)
    }, this.RESPONSE_TIMEOUT)
  }

  private clearResponseTimeout(): void {
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout)
      this.responseTimeout = undefined
    }
  }

  // Public API
  async start(): Promise<string> {
    const sessionId = await super.start()

    // 초기화 타임아웃 설정
    this.setReadyTimeout()

    return sessionId
  }

  async sendMessage(message: string): Promise<void> {
    if (this.state !== ClaudeCodeState.READY) {
      throw new Error(`Cannot send message in state: ${this.state}`)
    }

    this.setState(ClaudeCodeState.PROCESSING)
    this.setResponseTimeout()
    await super.sendMessage(message)
  }

  async sendMessageAndWait(
    message: string,
    timeout = 60000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off('response-complete', onComplete)
        this.off('error', onError)
        reject(new Error('Response timeout'))
      }, timeout)

      const onComplete = (response: string) => {
        clearTimeout(timer)
        this.off('response-complete', onComplete)
        this.off('error', onError)
        resolve(response)
      }

      const onError = (error: Error) => {
        clearTimeout(timer)
        this.off('response-complete', onComplete)
        this.off('error', onError)
        reject(error)
      }

      this.once('response-complete', onComplete)
      this.once('error', onError)

      this.sendMessage(message).catch(reject)
    })
  }

  // 유틸리티
  private getCwd(): string {
    // VS Code workspace root 또는 현재 디렉토리
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd()
  }

  // 정리
  dispose(): void {
    this.clearReadyTimeout()
    this.clearResponseTimeout()
    super.dispose()
  }
}
```

### 3.2 이벤트 인터페이스

```typescript
export interface ClaudeCodeEvents {
  // 상태 변화
  'ready': []                           // 입력 대기 상태
  'response-complete': [response: string]  // 응답 완료
  'error': [error: Error]               // 에러 발생

  // 도구 실행
  'tool-start': [toolName: string]      // 도구 실행 시작
  'tool-output': [output: string]       // 도구 출력
  'tool-complete': [toolName: string]   // 도구 실행 완료

  // 실시간 출력 (UI용)
  'output': [data: string]              // 모든 출력
}

// TypeScript 이벤트 타입 체킹
export interface ClaudeCodeAdapter extends EventEmitter<ClaudeCodeEvents> {}
```

### 3.3 사용 예시

```typescript
// 기본 사용
const manager = createVSCodeSessionManager()
const adapter = new ClaudeCodeAdapter(manager)

// 이벤트 리스너 등록
adapter.on('ready', () => {
  console.log('Claude Code is ready for input')
})

adapter.on('tool-start', (toolName) => {
  console.log(`Tool started: ${toolName}`)
})

adapter.on('tool-output', (output) => {
  console.log(`Tool output: ${output}`)
})

adapter.on('response-complete', (response) => {
  console.log(`Response: ${response}`)
})

adapter.on('error', (error) => {
  console.error('Error:', error.message)
})

// 세션 시작
await adapter.start()

// 메시지 전송 (비동기)
adapter.sendMessage('Create a file test.txt')

// 또는 응답 대기
const response = await adapter.sendMessageAndWait('What is 2+2?')
console.log(response)  // "The answer is 4."
```

---

## 🧪 Phase 4: 테스트 전략

### 4.1 Mock 테스트 (단위 테스트)

```typescript
describe('ClaudeCodeAdapter', () => {
  it('should detect prompt and transition to READY', () => {
    const adapter = new ClaudeCodeAdapter(mockManager)

    // 시뮬레이션: 프롬프트 출력
    adapter.parseOutput('Welcome to Claude Code\n')
    adapter.parseOutput('> ')

    expect(adapter.state).toBe(ClaudeCodeState.READY)
  })

  it('should detect tool execution', () => {
    const adapter = new ClaudeCodeAdapter(mockManager)
    const toolStartSpy = jest.fn()

    adapter.on('tool-start', toolStartSpy)
    adapter.setState(ClaudeCodeState.PROCESSING)
    adapter.parseOutput('[Tool: Write]\n')

    expect(toolStartSpy).toHaveBeenCalledWith('Write')
    expect(adapter.state).toBe(ClaudeCodeState.TOOL_EXECUTING)
  })
})
```

### 4.2 통합 테스트 (실제 claude code)

```typescript
describe('ClaudeCodeAdapter Integration', () => {
  it('should start claude code and handle simple query', async () => {
    const manager = createVSCodeSessionManager()
    const adapter = new ClaudeCodeAdapter(manager)

    await adapter.start()

    const response = await adapter.sendMessageAndWait('What is 2+2?', 30000)
    expect(response).toContain('4')
  }, 60000)

  it('should handle file creation', async () => {
    const adapter = new ClaudeCodeAdapter(manager)
    await adapter.start()

    let toolExecuted = false
    adapter.on('tool-start', (name) => {
      if (name === 'Write') toolExecuted = true
    })

    await adapter.sendMessageAndWait('Create a file test.txt with content "hello"')
    expect(toolExecuted).toBe(true)

    // 파일 존재 확인
    const exists = fs.existsSync('test.txt')
    expect(exists).toBe(true)
  }, 60000)
})
```

---

## 🔧 Phase 5: 개선 및 최적화

### 5.1 출력 패턴 학습

실제 사용하면서 claude code의 다양한 출력 패턴을 수집:
```typescript
// 패턴 로깅
private logPattern(data: string): void {
  if (process.env.CARET_DEBUG) {
    fs.appendFileSync('claude-code-patterns.log',
      `[${this.state}] ${JSON.stringify(data)}\n`)
  }
}
```

### 5.2 패턴 정규화

수집된 패턴을 분석해서 정규식 개선:
```typescript
// 예: 다양한 프롬프트 변형 지원
const PROMPT_PATTERNS = [
  /^>\s*$/m,                    // 기본
  /^claude>\s*$/m,              // 명시적 프롬프트
  /\n>\s*\n?$/,                 // 줄바꿈 후
  /^\[\d+\]>\s*$/m,             // 번호 포함 (가능성)
]
```

### 5.3 성능 최적화

- **버퍼 크기 제한**: 메모리 누수 방지
- **디바운싱**: 짧은 시간 내 여러 출력 청크 합치기
- **스트리밍 파싱**: 정규식 최적화

```typescript
private readonly MAX_BUFFER_SIZE = 10 * 1024 * 1024  // 10MB

private addToBuffer(data: string): void {
  this.responseBuffer += data

  // 버퍼 크기 제한
  if (this.responseBuffer.length > this.MAX_BUFFER_SIZE) {
    console.warn('[ClaudeCode] Buffer overflow, truncating')
    this.responseBuffer = this.responseBuffer.slice(-this.MAX_BUFFER_SIZE / 2)
  }
}
```

---

## 📋 구현 체크리스트

### 기본 기능
- [ ] SessionConfig 정의
- [ ] 상태 머신 구현
- [ ] 프롬프트 감지
- [ ] 응답 완료 감지
- [ ] 도구 실행 감지
- [ ] 에러 처리
- [ ] 타임아웃 관리

### 이벤트
- [ ] 'ready' 이벤트
- [ ] 'response-complete' 이벤트
- [ ] 'tool-start' 이벤트
- [ ] 'tool-output' 이벤트
- [ ] 'tool-complete' 이벤트
- [ ] 'error' 이벤트
- [ ] 'output' 이벤트 (실시간)

### API
- [ ] start() 메서드
- [ ] sendMessage() 메서드
- [ ] sendMessageAndWait() 메서드
- [ ] dispose() 메서드

### 테스트
- [ ] Mock 단위 테스트
- [ ] 통합 테스트 (실제 claude code)
- [ ] 에러 시나리오 테스트
- [ ] 타임아웃 테스트
- [ ] 긴 응답 테스트

### 최적화
- [ ] 패턴 로깅 시스템
- [ ] 버퍼 크기 제한
- [ ] 정규식 최적화
- [ ] 메모리 프로파일링

---

## 🚀 다음 단계

1. **실제 claude code 실행**: 출력 패턴 수동 분석
2. **패턴 문서화**: 다양한 시나리오별 출력 수집
3. **프로토타입 구현**: 기본 상태 머신만 구현
4. **반복 개선**: 실제 사용하면서 패턴 개선

---

**작성자**: Luke
**다음 작업**: claude code 수동 실행 및 패턴 분석
