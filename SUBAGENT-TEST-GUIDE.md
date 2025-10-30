# Subagent 기능 테스트 가이드

**목적**: 통합된 Subagent 기능이 제대로 동작하는지 확인

---

## 🎯 테스트할 내용

1. **isSubagentCommand()** 함수가 올바르게 감지하는가?
2. **StandaloneTerminalManager**가 로드되는가?
3. **일반 명령과 Subagent 명령 구분**이 되는가?

---

## 📋 테스트 시나리오

### 시나리오 1: 일반 명령 (기존 Caret 로직)

**명령어**:
```
ls
pwd
npm run compile
```

**기대 결과**:
- `isSubagent = false`
- `terminalManager = this.terminalManager` (기존 로직)
- 정상 실행

---

### 시나리오 2: Subagent 명령

**명령어**:
```
cline "list all files"
cline 'show current directory'
```

**기대 결과**:
- `isSubagent = true`
- `terminalManager = StandaloneTerminalManager` (신규 로직)
- Subagent 실행 시도 (Cline CLI 없으면 실패는 정상)

---

## 🚀 테스트 방법

### Method 1: VSCode Extension 실행 테스트

#### Step 1: Debug 로그 추가

**파일**: `src/core/task/index.ts`

```typescript
async executeCommandTool(command: string, timeoutSeconds: number | undefined): Promise<[boolean, ToolResponse]> {
    // CARET MODIFICATION: Subagent detection from Cline v3.34.0
    const isSubagent = isSubagentCommand(command)

    // ✅ 테스트용 로그 추가
    console.log(`[SUBAGENT-TEST] Command: "${command}"`)
    console.log(`[SUBAGENT-TEST] isSubagent: ${isSubagent}`)

    if (transformClineCommand(command) !== command && isSubagent) {
        const transformed = transformClineCommand(command)
        console.log(`[SUBAGENT-TEST] Transformed: "${transformed}"`)
        command = transformed
    }

    // ... 기존 코드 ...

    if (isSubagent) {
        console.log("[SUBAGENT-TEST] Using StandaloneTerminalManager")
        // ...
    } else {
        console.log("[SUBAGENT-TEST] Using Caret terminalManager (original logic)")
        terminalManager = this.terminalManager
    }

    // ... 기존 코드 ...
}
```

#### Step 2: Extension 실행

```bash
# 1. 빌드
npm run compile

# 2. VSCode에서 F5 (Extension Development Host 실행)
```

#### Step 3: 테스트 명령 실행

**Caret/Cline UI에서**:

**테스트 1**: 일반 명령
```
User: Run "ls -la" command
```

**Output 패널 확인** (View > Output > Cline):
```
[SUBAGENT-TEST] Command: "ls -la"
[SUBAGENT-TEST] isSubagent: false
[SUBAGENT-TEST] Using Caret terminalManager (original logic)
```

**테스트 2**: Subagent 명령
```
User: Run this command: cline "list all typescript files"
```

**Output 패널 확인**:
```
[SUBAGENT-TEST] Command: "cline \"list all typescript files\""
[SUBAGENT-TEST] isSubagent: true
[SUBAGENT-TEST] Transformed: "cline \"list all typescript files\""
[SUBAGENT-TEST] Using StandaloneTerminalManager
[DEBUG] Failed to load standalone terminal manager for subagent (정상 - CLI 없음)
```

---

### Method 2: 간단한 Unit Test

**파일**: `test-subagent.mjs` (프로젝트 루트)

```javascript
// test-subagent.mjs
import { isSubagentCommand } from './src/integrations/cli-subagents/subagent_command.ts'

console.log('=== Subagent Detection Test ===\n')

const testCases = [
    // 일반 명령 (false 기대)
    { cmd: 'ls -la', expected: false },
    { cmd: 'pwd', expected: false },
    { cmd: 'npm run build', expected: false },
    { cmd: 'echo "hello"', expected: false },

    // Subagent 명령 (true 기대)
    { cmd: 'cline "do something"', expected: true },
    { cmd: "cline 'list files'", expected: true },
    { cmd: 'cline "help" --verbose', expected: true },
]

testCases.forEach(({ cmd, expected }) => {
    const result = isSubagentCommand(cmd)
    const status = result === expected ? '✅' : '❌'
    console.log(`${status} "${cmd}"`)
    console.log(`   Expected: ${expected}, Got: ${result}\n`)
})
```

**실행**:
```bash
# TypeScript를 JavaScript로 컴파일 필요
# 또는 간단히 브라우저 콘솔에서 테스트
```

---

### Method 3: 브라우저 콘솔 테스트

**간단한 정규식 테스트**:

```javascript
// 브라우저 개발자 도구 콘솔에서 실행

const CLINE_COMMAND_PATTERN = /^cline\s+(['"])(.+?)\1(\s+.*)?$/

function isSubagentCommand(command) {
    return CLINE_COMMAND_PATTERN.test(command)
}

// 테스트
console.log('일반 명령:')
console.log('ls:', isSubagentCommand('ls'))  // false
console.log('pwd:', isSubagentCommand('pwd'))  // false
console.log('npm run:', isSubagentCommand('npm run build'))  // false

console.log('\nSubagent 명령:')
console.log('cline "...":', isSubagentCommand('cline "do something"'))  // true
console.log("cline '...':", isSubagentCommand("cline 'list files'"))  // true
```

---

## 📊 예상 결과

### 일반 명령 (ls, pwd, npm 등)

```
[SUBAGENT-TEST] Command: "ls"
[SUBAGENT-TEST] isSubagent: false
[SUBAGENT-TEST] Using Caret terminalManager (original logic)
→ 기존 Caret TerminalManager 사용
→ 정상 실행
```

### Subagent 명령 (cline "...")

```
[SUBAGENT-TEST] Command: "cline \"list files\""
[SUBAGENT-TEST] isSubagent: true
[SUBAGENT-TEST] Using StandaloneTerminalManager
[DEBUG] Failed to load standalone terminal manager for subagent
→ StandaloneTerminalManager 로드 시도
→ Cline CLI 없으면 실패 (정상)
→ Fallback to TerminalManager
```

---

## ✅ 성공 기준

### 최소 요구사항
- [ ] 일반 명령 `isSubagent = false`
- [ ] Subagent 명령 `isSubagent = true`
- [ ] 일반 명령은 기존 로직 사용
- [ ] Subagent 명령은 StandaloneTerminalManager 시도

### 추가 확인
- [ ] 로그가 올바르게 출력됨
- [ ] 일반 명령 정상 실행
- [ ] Subagent 명령도 에러 없이 처리됨 (CLI 없어도 fallback)

---

## 🚨 문제 해결

### "Failed to load standalone terminal manager"

**원인**: Cline CLI가 설치되어 있지 않음

**해결**:
```bash
# 이것은 정상입니다!
# Subagent는 Cline CLI가 있을 때만 동작합니다.
# 없으면 자동으로 일반 TerminalManager로 fallback합니다.
```

**코드 확인**:
```typescript
try {
    const { StandaloneTerminalManager } = require(standaloneModulePath)
    if (StandaloneTerminalManager) {
        terminalManager = new StandaloneTerminalManager()
    } else {
        terminalManager = new TerminalManager()  // ✅ Fallback
    }
} catch (error) {
    console.error("[DEBUG] Failed to load...", error)
    terminalManager = new TerminalManager()  // ✅ Fallback
}
```

---

## 🎯 추천 테스트 순서

1. **가장 간단**: 브라우저 콘솔 테스트 (1분)
2. **중간**: VSCode Extension 실행 + 로그 확인 (5분)
3. **고급**: Unit Test 작성 (필요시)

---

**준비 완료!** 어떤 방법으로 테스트하시겠어요?
