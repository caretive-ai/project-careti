# 터미널을 도구로 사용하기: Interactive Terminal Tool 설계

**작성일**: 2025-11-04
**핵심 개념**: 터미널 자체를 Tool로 만들어서 Caret이 제어할 수 있게 함

---

## 🎯 핵심 아이디어

### 현재 (Cline 방식)
```typescript
// 도구: Bash - 단발성 명령 실행
BashTool.execute("ls -la")
// → 실행 → 출력 → 종료 (터미널 사라짐)

BashTool.execute("pwd")
// → 새로운 프로세스 → 실행 → 출력 → 종료
```

**문제점**:
- 매번 새로 시작 (컨텍스트 없음)
- Interactive 프로그램 제어 불가능 (Python REPL, Claude Code 등)
- 연속 작업에 비효율적

### 새로운 방식: Terminal Tool
```typescript
// 도구: Terminal - 터미널 자체를 도구로
const terminal = await TerminalTool.open({ command: "claude", args: ["code"] })
// → 터미널 열림, 세션 유지

await TerminalTool.send(terminal, "Create README.md")
// → 입력 전송, 출력 대기

const output = await TerminalTool.read(terminal)
// → 출력 읽기 "README.md created"

await TerminalTool.send(terminal, "Create test.ts")
// → 같은 터미널에 또 입력 (컨텍스트 유지!)

await TerminalTool.stop(terminal)
// → Ctrl+C 전송

await TerminalTool.close(terminal)
// → 터미널 닫기
```

**장점**:
- ✅ 터미널 세션 유지 (컨텍스트 유지)
- ✅ Interactive 프로그램 제어 가능
- ✅ 실시간 입출력 제어
- ✅ 모니터링 및 조건부 제어 가능

---

## 🏗️ Terminal Tool 설계

### Tool Handler 구조

```typescript
// src/core/task/tools/handlers/TerminalToolHandler.ts

export interface TerminalToolInput {
  action: 'open' | 'send' | 'read' | 'stop' | 'close' | 'list'
  sessionId?: string
  command?: string      // open 시 사용
  args?: string[]       // open 시 사용
  input?: string        // send 시 사용
}

export interface TerminalToolOutput {
  success: boolean
  sessionId?: string
  output?: string
  state?: 'idle' | 'busy' | 'error'
  error?: string
}

export class TerminalToolHandler extends ToolHandler {
  async execute(input: TerminalToolInput): Promise<TerminalToolOutput> {
    switch (input.action) {
      case 'open':
        return this.handleOpen(input)
      case 'send':
        return this.handleSend(input)
      case 'read':
        return this.handleRead(input)
      case 'stop':
        return this.handleStop(input)
      case 'close':
        return this.handleClose(input)
      case 'list':
        return this.handleList(input)
    }
  }

  private async handleOpen(input: TerminalToolInput): Promise<TerminalToolOutput> {
    const sessionManager = getCaretSessionManager()

    const sessionId = await sessionManager.createSession({
      command: input.command!,
      args: input.args || [],
      cwd: this.cwd
    })

    return {
      success: true,
      sessionId,
      output: `Terminal opened: ${input.command} (session: ${sessionId})`
    }
  }

  private async handleSend(input: TerminalToolInput): Promise<TerminalToolOutput> {
    const sessionManager = getCaretSessionManager()
    const session = sessionManager.getSession(input.sessionId!)

    if (!session) {
      return {
        success: false,
        error: `Session ${input.sessionId} not found`
      }
    }

    session.sendInput(input.input!)

    // 잠시 대기 후 출력 읽기 (또는 프롬프트 감지까지 대기)
    await this.waitForResponse(session)

    const output = session.getOutput(0).join('\n')

    return {
      success: true,
      sessionId: input.sessionId,
      output
    }
  }

  private async handleRead(input: TerminalToolInput): Promise<TerminalToolOutput> {
    const sessionManager = getCaretSessionManager()
    const session = sessionManager.getSession(input.sessionId!)

    if (!session) {
      return {
        success: false,
        error: `Session ${input.sessionId} not found`
      }
    }

    const output = session.getOutput(0).join('\n')

    return {
      success: true,
      sessionId: input.sessionId,
      output,
      state: 'idle'  // TODO: 실제 상태 추적
    }
  }

  private async handleStop(input: TerminalToolInput): Promise<TerminalToolOutput> {
    const sessionManager = getCaretSessionManager()
    const session = sessionManager.getSession(input.sessionId!)

    if (!session) {
      return {
        success: false,
        error: `Session ${input.sessionId} not found`
      }
    }

    // Ctrl+C 전송
    session.sendInput('\x03')

    return {
      success: true,
      sessionId: input.sessionId,
      output: 'Sent Ctrl+C to terminal'
    }
  }

  private async handleClose(input: TerminalToolInput): Promise<TerminalToolOutput> {
    const sessionManager = getCaretSessionManager()
    sessionManager.closeSession(input.sessionId!)

    return {
      success: true,
      output: `Terminal closed: ${input.sessionId}`
    }
  }

  private async handleList(): Promise<TerminalToolOutput> {
    const sessionManager = getCaretSessionManager()
    const sessions = sessionManager.listSessions()

    return {
      success: true,
      output: JSON.stringify(sessions, null, 2)
    }
  }

  private async waitForResponse(session: InteractiveSession): Promise<void> {
    // TODO: 프롬프트 감지 또는 타임아웃
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}
```

---

## 📋 Caret이 Tool을 사용하는 방법

### 시스템 프롬프트에 포함될 가이드

```markdown
# Terminal Tool 사용 가이드

## 개요
Terminal 도구를 사용하면 터미널 세션을 열어놓고 지속적으로 제어할 수 있습니다.
Python REPL, Claude Code와 같은 interactive 프로그램을 제어할 때 유용합니다.

## 사용 가능한 액션

### 1. open - 터미널 열기
새로운 터미널 세션을 시작합니다.

**입력**:
```json
{
  "action": "open",
  "command": "claude",
  "args": ["code"]
}
```

**출력**:
```json
{
  "success": true,
  "sessionId": "01JCXXXXXXXXXXXXXXXXXXXXXXXX",
  "output": "Terminal opened: claude code (session: 01JC...)"
}
```

**중요**: sessionId를 저장해두세요. 이후 모든 액션에 필요합니다.

### 2. send - 터미널에 입력 전송
열려있는 터미널에 텍스트를 입력합니다.

**입력**:
```json
{
  "action": "send",
  "sessionId": "01JCXXXXXXXXXXXXXXXXXXXXXXXX",
  "input": "Create a README.md file"
}
```

**출력**:
```json
{
  "success": true,
  "sessionId": "01JC...",
  "output": "[터미널 출력 내용]"
}
```

### 3. read - 터미널 출력 읽기
터미널의 현재 출력을 읽습니다.

**입력**:
```json
{
  "action": "read",
  "sessionId": "01JCXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**출력**:
```json
{
  "success": true,
  "sessionId": "01JC...",
  "output": "[현재까지의 터미널 출력]",
  "state": "idle"
}
```

### 4. stop - 터미널 중지 (Ctrl+C)
실행 중인 프로세스를 중지합니다.

**입력**:
```json
{
  "action": "stop",
  "sessionId": "01JCXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**출력**:
```json
{
  "success": true,
  "sessionId": "01JC...",
  "output": "Sent Ctrl+C to terminal"
}
```

### 5. close - 터미널 닫기
터미널 세션을 완전히 종료합니다.

**입력**:
```json
{
  "action": "close",
  "sessionId": "01JCXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**출력**:
```json
{
  "success": true,
  "output": "Terminal closed: 01JC..."
}
```

### 6. list - 열린 터미널 목록
현재 열려있는 모든 터미널 세션을 조회합니다.

**입력**:
```json
{
  "action": "list"
}
```

**출력**:
```json
{
  "success": true,
  "output": "[
    {
      \"id\": \"01JC...\",
      \"toolName\": \"claude-code\",
      \"status\": \"idle\",
      \"createdAt\": 1234567890
    }
  ]"
}
```

## 사용 패턴

### 패턴 1: Claude Code 제어

**사용자**: "Claude Code 열고 README 만들어줘"

**Caret의 처리**:
```typescript
// 1. 터미널 열기
const result1 = await TerminalTool.use({
  action: 'open',
  command: 'claude',
  args: ['code']
})
const sessionId = result1.sessionId

// 2. 명령 전송
const result2 = await TerminalTool.use({
  action: 'send',
  sessionId: sessionId,
  input: 'Create a README.md file with project description'
})

// 3. 사용자에게 보고
return `Claude Code 터미널을 열었습니다. (세션: ${sessionId})
명령을 전달했습니다: Create README.md
출력: ${result2.output}`
```

### 패턴 2: 상태 확인

**사용자**: "Claude Code가 뭐하고 있어?"

**Caret의 처리**:
```typescript
// 세션 ID는 이전에 저장해둔 것 사용
const result = await TerminalTool.use({
  action: 'read',
  sessionId: savedSessionId
})

return `Claude Code 현재 상태:
${result.output}

상태: ${result.state}`
```

### 패턴 3: 조건부 중지

**사용자**: "파일 5개 수정하면 Claude Code 멈춰"

**Caret의 처리**:
```typescript
// 모니터링 루프
let fileCount = 0
while (true) {
  const result = await TerminalTool.use({
    action: 'read',
    sessionId: sessionId
  })

  // 출력에서 "[Tool: Write]" 패턴 카운트
  const newWrites = (result.output.match(/\[Tool: Write\]/g) || []).length
  fileCount += newWrites

  if (fileCount >= 5) {
    // 중지
    await TerminalTool.use({
      action: 'stop',
      sessionId: sessionId
    })

    return `파일 5개 수정을 감지했습니다. Claude Code를 중지했습니다.`
  }

  await sleep(1000)  // 1초마다 체크
}
```

## 주의사항

1. **세션 ID 관리**: sessionId를 잃어버리면 터미널을 제어할 수 없습니다.
   - 대화 중에는 sessionId를 메모리에 저장하세요.

2. **타이밍**: interactive 프로그램은 응답에 시간이 걸릴 수 있습니다.
   - `send` 후 즉시 `read`하면 출력이 없을 수 있습니다.
   - 필요시 재시도하거나 잠시 대기하세요.

3. **종료**: 작업 완료 후 터미널을 닫는 것을 잊지 마세요.
   - 사용자가 명시적으로 닫으라고 하지 않아도, 작업이 완전히 끝나면 `close` 권장.

4. **에러 처리**: sessionId가 잘못되거나 터미널이 닫힌 경우 에러가 발생합니다.
   - `success: false`를 확인하고 적절히 처리하세요.
```

---

## 🔧 구현 단계

### Phase 1: Interactive Terminal 인프라 (기존 계획 그대로)
- `InteractiveSession` 클래스
- `SessionManager` 클래스
- VS Code 어댑터

### Phase 2: Terminal Tool Handler 구현 (신규)

**파일**: `src/core/task/tools/handlers/TerminalToolHandler.ts`

```typescript
import { ToolHandler } from './base'
import { getCaretSessionManager } from '@/caret/integrations/terminal/interactive'

export class TerminalToolHandler extends ToolHandler {
  name = 'terminal'

  async execute(input: TerminalToolInput): Promise<ToolResult> {
    // 위에서 설계한 대로 구현
  }
}
```

**도구 등록**:
```typescript
// src/core/task/tools/index.ts
import { TerminalToolHandler } from './handlers/TerminalToolHandler'

export function registerTools() {
  // Caret 모드일 때만 등록
  if (isCaretMode() && featureConfig.enableInteractiveTerminal) {
    registerTool(new TerminalToolHandler())
  }
}
```

### Phase 3: 시스템 프롬프트 통합

**파일**: `caret-src/core/prompts/sections/TERMINAL_TOOL_GUIDE.json`

```json
{
  "terminalTool": {
    "description": "Terminal Tool을 사용하여 interactive 프로그램을 제어할 수 있습니다.",
    "guide": "[위의 마크다운 가이드 내용]",
    "examples": [
      {
        "scenario": "Claude Code 제어",
        "steps": ["open", "send", "read", "close"]
      }
    ]
  }
}
```

**통합**:
```typescript
// caret-src/core/prompts/system-prompt/index.ts
if (isCaretMode() && featureConfig.enableInteractiveTerminal) {
  systemPrompt += getTerminalToolGuide()
}
```

---

## 📊 사용자 시나리오 (한글)

### 시나리오 1: 간단한 작업 위임

**대화**:
```
사용자: "Claude Code 열고 README 파일 만들어줘"

Caret: [TerminalTool.open 실행]
Caret: "Claude Code 터미널을 시작합니다..."
Caret: [세션 ID: abc123 저장]
Caret: [TerminalTool.send 실행: "Create README.md"]
Caret: [출력 대기 및 읽기]
Caret: "README.md 파일을 생성했습니다.

       Claude Code 출력:
       > Create README.md
       I'll create a README.md file for you.
       [Tool: Write]
       Created README.md
       > "
```

### 시나리오 2: 연속 작업

**대화**:
```
사용자: "이제 test.ts도 만들어줘"

Caret: [같은 세션(abc123) 사용]
Caret: [TerminalTool.send 실행: "Create test.ts"]
Caret: "test.ts 파일도 생성했습니다.

       (같은 Claude Code 세션에서 계속 작업했습니다)"
```

### 시나리오 3: 상태 확인

**대화**:
```
사용자: "지금 Claude Code가 뭐하고 있어?"

Caret: [TerminalTool.read 실행]
Caret: "Claude Code 현재 상태:

       - 마지막 명령: Create test.ts
       - 상태: 대기 중 (프롬프트 표시)
       - 마지막 출력: > (입력 대기)

       현재 작업 가능합니다."
```

### 시나리오 4: 조건부 중지

**대화**:
```
사용자: "파일 5개 수정하면 멈춰"

Caret: "알겠습니다. 파일 수정을 모니터링하겠습니다."
Caret: [백그라운드 모니터링 시작]
Caret: [TerminalTool.read 반복 실행]
Caret: [Write 도구 감지: 1/5]
Caret: [Write 도구 감지: 2/5]
Caret: [Write 도구 감지: 3/5]
Caret: [Write 도구 감지: 4/5]
Caret: [Write 도구 감지: 5/5]
Caret: [TerminalTool.stop 실행 - Ctrl+C]
Caret: "⚠️ 파일 5개 수정을 감지했습니다!
       Claude Code를 중지했습니다.

       수정된 파일:
       - src/a.ts
       - src/b.ts
       - src/c.ts
       - src/d.ts
       - src/e.ts"
```

### 시나리오 5: 명시적 종료

**대화**:
```
사용자: "Claude Code 닫아줘"

Caret: [TerminalTool.close 실행]
Caret: "Claude Code 터미널을 닫았습니다. (세션: abc123)"
```

### 시나리오 6: 복잡한 자동화

**대화**:
```
사용자: "Claude Code로 테스트 작성하고, 실패하면 구현하고,
        통과하면 리팩토링하고, 이걸 3번 반복해줘"

Caret: "TDD 워크플로우를 시작합니다."
Caret: [TerminalTool.open]
Caret: [TerminalTool.send: "Write a failing test for feature X"]

[루프 시작]
Caret: [TerminalTool.send: "npm test"]
Caret: [출력에서 "test failed" 감지]
Caret: [TerminalTool.send: "Implement the feature to pass the test"]
Caret: [TerminalTool.send: "npm test"]
Caret: [출력에서 "test passed" 감지]
Caret: [TerminalTool.send: "Refactor the code"]
[루프 반복 x3]

Caret: "TDD 워크플로우 완료!

       3 라운드 완료:
       - 테스트 작성 → 구현 → 리팩토링 (1)
       - 테스트 작성 → 구현 → 리팩토링 (2)
       - 테스트 작성 → 구현 → 리팩토링 (3)"
```

---

## 🎯 핵심 장점

### 1. 터미널 = 도구
- Bash 도구처럼 자연스럽게 사용
- Caret이 도구 사용법만 알면 됨
- 기존 도구 시스템에 완벽히 통합

### 2. 컨텍스트 유지
- 세션 ID로 같은 터미널 계속 사용
- Claude Code가 이전 작업 기억
- 효율적인 연속 작업

### 3. 유연한 제어
- 입력 전송, 출력 읽기, 중지, 닫기 모두 가능
- 실시간 모니터링 가능
- 조건부 제어 구현 가능

### 4. 확장성
- Python REPL, Node REPL 등 다른 interactive 프로그램에도 동일하게 적용
- Cursor, Aider 등 다른 AI 도구로 확장 가능

---

## 📋 구현 체크리스트

### Phase 1: 인프라
- [ ] `InteractiveSession` 구현
- [ ] `SessionManager` 구현
- [ ] VS Code 어댑터 구현
- [ ] Python REPL로 테스트

### Phase 2: Tool Handler
- [ ] `TerminalToolHandler` 구현
- [ ] `open` 액션
- [ ] `send` 액션
- [ ] `read` 액션
- [ ] `stop` 액션
- [ ] `close` 액션
- [ ] `list` 액션
- [ ] 도구 등록

### Phase 3: 시스템 프롬프트
- [ ] 가이드 문서 작성 (JSON)
- [ ] 시스템 프롬프트 통합
- [ ] Caret 모드 조건부 로딩

### Phase 4: Claude Code 특화
- [ ] Claude Code 출력 패턴 분석
- [ ] 프롬프트 감지 로직
- [ ] 도구 실행 감지 로직
- [ ] 에러 감지 로직

### Phase 5: 테스트
- [ ] 단위 테스트 (TerminalToolHandler)
- [ ] 통합 테스트 (Python REPL)
- [ ] E2E 테스트 (Claude Code 제어)
- [ ] 사용자 시나리오 테스트 (한글 명령)

---

## 🚀 다음 단계

1. **Phase 1 구현 시작**: Interactive Terminal 인프라
2. **Python REPL 테스트**: 기본 기능 검증
3. **Terminal Tool Handler 구현**: 도구로 만들기
4. **Claude Code 통합**: 실제 사용 케이스 검증
5. **시스템 프롬프트 작성**: Caret이 사용할 가이드

---

**작성자**: Luke
**핵심 개념**: 터미널 자체가 Tool이 된다
**다음 작업**: Phase 1 구현 시작
