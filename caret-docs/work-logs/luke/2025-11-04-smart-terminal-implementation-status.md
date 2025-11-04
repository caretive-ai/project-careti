# Smart Terminal Implementation Status

**Date**: 2025-11-04
**Branch**: smart-terminal (to be created)
**Developer**: Luke

## Implementation Summary

Smart Terminal Tool for Caret has been implemented with **6 actions** (open, send, read, stop, close, list) for interactive terminal session control.

### ✅ Completed Components

#### 1. Core Infrastructure
- **`InteractiveSession`**: Session management class with output buffering
- **`SessionManager`**: ULID-based session tracking and lifecycle management
- **`ITerminalAdapter`**: Platform-independent interface
- **`VSCodeTerminalAdapter`**: Node.js ChildProcess-based implementation

**Location**: `caret-src/integrations/terminal/interactive/`

#### 2. Tool Handler
- **`TerminalToolHandler`**: Implements `IFullyManagedTool` interface
- Handles 6 actions: open, send, read, stop, close, list
- Registered in `ToolExecutor.ts`

**Location**: `src/core/task/tools/handlers/TerminalToolHandler.ts`

#### 3. Tool Registration
- Added `TERMINAL` to `ClineDefaultTool` enum in `src/shared/tools.ts`
- Added terminal parameters to `toolParamNames` in `src/core/assistant-message/index.ts`
- Registered `TerminalToolHandler` in `src/core/task/ToolExecutor.ts`

#### 4. System Prompt Integration
- **`TERMINAL_TOOL_GUIDE.json`**: Comprehensive tool documentation
- **CaretJsonAdapter fix**: Added `terminal_tool.sections` handler

**Location**: `caret-src/core/prompts/sections/TERMINAL_TOOL_GUIDE.json`

#### 5. Testing
- **30 unit tests** for InteractiveSession and SessionManager - ✅ ALL PASSED
- **7 Python REPL integration tests** - ✅ ALL PASSED
- **8 Node.js REPL integration tests** - ⚠️ 6 failed (output capture issue)

**Location**: `caret-src/integrations/terminal/interactive/__tests__/`

---

## ✅ Working Features (Verified by User)

### 1. Terminal Open (action: "open")
- ✅ Claude Code CLI opens successfully
- ✅ Sessions are created and tracked
- ✅ ULID-based session IDs generated

### 2. Command Send (action: "send")
- ✅ Commands are sent to terminal
- ✅ Input reaches the child process
- ✅ stdin writing works correctly

### 3. Session List (action: "list")
- ✅ Active sessions are listed
- ✅ Session metadata tracked (createdAt, lastActivity)

---

## ❌ Known Issues

### **CRITICAL: Output Capture Not Working**

**Symptom**:
- Terminal opens and receives commands
- BUT: Output is not captured/read properly
- Caret cannot see terminal responses

**Affected Actions**:
- `read`: Cannot retrieve terminal output
- Indirectly affects all workflows that need to see results

**Evidence**:
1. User report: "캡쳐와 리드가 잘안됨"
2. Node.js REPL tests: 6/8 failed with output capture issues
3. Python REPL tests: 7/7 passed (but output may be delayed)

**Suspected Root Causes**:

#### 1. Stream Timing Issues
```typescript
// VSCodeTerminalAdapter.ts
async start(config: SessionConfig): Promise<void> {
    this.process = spawn(config.command, config.args, {
        cwd: config.cwd,
        env: { ...process.env, ...config.env },
        shell: false,
    })

    // stdout listener
    this.process.stdout?.on("data", (data) => {
        const text = data.toString()
        this.emit("output", text)
    })
}
```

**Problem**: Some programs (Node.js REPL, Claude Code CLI) may:
- Buffer output
- Use stderr instead of stdout
- Use terminal control sequences
- Require TTY (pseudo-terminal)

#### 2. Missing TTY Support
Current implementation uses simple `spawn()` without PTY (pseudo-terminal).

Many interactive programs expect PTY for:
- Line buffering control
- Terminal size negotiation
- Color/formatting codes

**Solution**: May need `node-pty` library for proper PTY support.

#### 3. Output Buffer Reading
```typescript
// InteractiveSession.ts
getOutput(since?: number): string[] {
    if (since !== undefined) {
        return this.outputBuffer.slice(since)
    }
    return [...this.outputBuffer]
}
```

**Potential Issue**:
- Output may arrive AFTER `read` action is called
- No timeout/wait mechanism for output
- Need async read with configurable timeout

---

## 🔧 Recommended Fixes

### Priority 1: Add PTY Support

Replace `child_process.spawn` with `node-pty`:

```typescript
import * as pty from "node-pty"

export class VSCodeTerminalAdapter implements ITerminalAdapter {
    private ptyProcess?: pty.IPty

    async start(config: SessionConfig): Promise<void> {
        this.ptyProcess = pty.spawn(config.command, config.args, {
            name: "xterm-color",
            cols: 80,
            rows: 30,
            cwd: config.cwd,
            env: { ...process.env, ...config.env },
        })

        this.ptyProcess.onData((data) => {
            this.emit("output", data)
        })
    }
}
```

**Dependencies**:
```bash
npm install node-pty
npm install --save-dev @types/node-pty
```

### Priority 2: Add Async Read with Timeout

```typescript
// InteractiveSession.ts
async readOutput(timeout: number = 2000): Promise<string[]> {
    const startLength = this.outputBuffer.length
    const startTime = Date.now()

    return new Promise((resolve) => {
        const checkOutput = () => {
            if (this.outputBuffer.length > startLength) {
                resolve(this.outputBuffer.slice(startLength))
            } else if (Date.now() - startTime > timeout) {
                resolve([]) // Timeout - return empty
            } else {
                setTimeout(checkOutput, 100)
            }
        }
        checkOutput()
    })
}
```

### Priority 3: Capture Both stdout and stderr

```typescript
// Current: Only stdout
this.process.stdout?.on("data", (data) => {
    this.emit("output", data.toString())
})

// Fix: Capture both streams
this.process.stdout?.on("data", (data) => {
    this.emit("output", `[stdout] ${data.toString()}`)
})

this.process.stderr?.on("data", (data) => {
    this.emit("output", `[stderr] ${data.toString()}`)
})
```

---

## 📂 File Structure

```
caret-src/integrations/terminal/interactive/
├── core/
│   ├── types.ts                          # Type definitions
│   ├── interfaces/
│   │   └── ITerminalAdapter.ts          # Platform interface
│   ├── InteractiveSession.ts            # Session class
│   └── SessionManager.ts                # Session lifecycle
├── adapters/
│   └── vscode/
│       └── VSCodeTerminalAdapter.ts     # ChildProcess implementation
└── __tests__/
    ├── unit/
    │   ├── InteractiveSession.test.ts   # 15 tests ✅
    │   └── SessionManager.test.ts        # 15 tests ✅
    └── integration/
        ├── python-repl.test.ts           # 7 tests ✅
        └── node-repl.test.ts             # 8 tests ⚠️ (6 failed)

src/core/task/tools/handlers/
└── TerminalToolHandler.ts                # Main tool implementation

caret-src/core/prompts/sections/
└── TERMINAL_TOOL_GUIDE.json              # System prompt documentation
```

---

## 🔄 Modified Cline Files

All modifications use `// CARET MODIFICATION:` comments:

1. **`src/shared/tools.ts`**: Added `TERMINAL = "terminal"` enum
2. **`src/core/assistant-message/index.ts`**: Added terminal parameters
3. **`src/core/task/ToolExecutor.ts`**: Registered TerminalToolHandler
4. **`caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts`**: Added terminal_tool handler
5. **`tsconfig.json`**: Excluded test files from compilation

---

## 🧪 Test Results

### Unit Tests: 30/30 ✅
```bash
npm run test:backend
✓ InteractiveSession (15 tests)
✓ SessionManager (15 tests)
```

### Integration Tests: 7/15
```bash
✓ Python REPL (7/7 tests) ✅
⚠️ Node.js REPL (2/8 tests) - Output capture issues
```

---

## 📝 Next Steps

### Immediate Priority
1. **Install node-pty** dependency
2. **Replace VSCodeTerminalAdapter** with PTY implementation
3. **Add async read** with timeout support
4. **Test with Claude Code CLI** again
5. **Verify Node.js REPL** tests pass

### Future Enhancements
1. Add terminal resize support
2. Add terminal interrupt (Ctrl+C) handling
3. Add session persistence across VS Code restarts
4. Add output streaming (real-time display in Caret UI)
5. Add terminal history management

---

## 🎯 User Verification Results

**User Test**: "Claude Code 터미널 열어줘"

- ✅ Terminal opens successfully
- ✅ Commands are sent
- ❌ **Output capture not working** (캡쳐와 리드가 잘안됨)

**Conclusion**: 80% implemented, output capture is the critical blocking issue.

---

## 🌿 Branch: smart-terminal

This work-in-progress implementation is saved in the `smart-terminal` branch for future completion.

To continue this work:
```bash
git checkout smart-terminal
npm run compile
npm run test:backend
```

**Dependencies to install**:
```bash
npm install node-pty
npm install --save-dev @types/node-pty
```

---

**Status**: Partial implementation - Terminal control works, output capture needs PTY support.
