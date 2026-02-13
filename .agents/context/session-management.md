# Session Management Guide

## Context
You are working with Caret's session state management system for handling user interactions during AI streaming.

## Overview

Caret implements a **Claude Code style** session management system that allows:
- Queuing user inputs while AI is streaming
- Double-press cancel pattern for safe interruption
- Immediate processing of pending inputs after cancellation

## SessionManager Singleton

**Location**: `careti-src/utils/session-manager.ts`

### Session State
```typescript
interface SessionState {
  abort: AbortController
  pendingInput: string  // Single string buffer (not array)
  status: SessionStatus // "idle" | "busy" | "interrupting"
  interruptCount: number
  interruptTimer?: ReturnType<typeof setTimeout>
}

type SessionStatus = "idle" | "busy" | "interrupting"
```

### Key Methods

| Method | Description |
|--------|-------------|
| `appendInput(sessionId, text)` | Append input to buffer (joins with `\n`) |
| `consumePendingInput(sessionId)` | Get and clear pending input |
| `hasPendingInput(sessionId)` | Check if pending input exists |
| `tryInterrupt(sessionId)` | Double-press interrupt attempt |
| `forceInterrupt(sessionId)` | Immediate interrupt (skip double-press) |

### Event System

SessionManager emits events for state synchronization:

```typescript
type SessionEvent =
  | { type: "session.busy"; sessionId: string }
  | { type: "session.idle"; sessionId: string }
  | { type: "session.interrupted"; sessionId: string }
  | { type: "input.queued"; sessionId: string; input: string }
  | { type: "input.processed"; sessionId: string; input: string }
  | { type: "input.cleared"; sessionId: string }
```

## Patterns

### 1. Single String Buffer Pattern

Multiple user inputs are concatenated with `\n` instead of using an array queue:

```typescript
// Claude Code style: merge inputs into single buffer
appendInput(sessionId: string, text: string): void {
  const session = this.getOrCreate(sessionId)
  if (session.pendingInput) {
    session.pendingInput += "\n" + text
  } else {
    session.pendingInput = text
  }
  this.emit({ type: "input.queued", sessionId, input: session.pendingInput })
}
```

### 2. Double-Press Interrupt Pattern

First press shows warning, second press actually cancels:

```typescript
tryInterrupt(sessionId: string): boolean {
  const session = this.sessions.get(sessionId)
  if (!session || session.status !== "busy") return false

  session.interruptCount++

  if (session.interruptCount === 1) {
    // First press: warning state
    session.status = "interrupting"
    session.interruptTimer = setTimeout(() => {
      session.interruptCount = 0
      session.status = "busy"
    }, 2000) // Reset after 2s
    return false
  }

  // Second press: actual interrupt
  return this.forceInterrupt(sessionId)
}
```

### 3. Immediate Queue Processing After Cancel

```typescript
// tryInterruptTask.ts
if (wasInterrupted) {
  await controller.cancelTask()

  const pendingInput = sessionManager.consumePendingInput(task.taskId)
  if (pendingInput) {
    // Start new request with pending input after short delay
    setTimeout(() => {
      controller.initTask(pendingInput)
    }, 100) // Allow cancel to complete first
  }
}
```

## File Locations

### Backend
| File | Role |
|------|------|
| `careti-src/utils/session-manager.ts` | Session state & queue management |
| `src/core/controller/task/askResponse.ts` | Queue input during streaming |
| `src/core/controller/task/tryInterruptTask.ts` | Double-press interrupt handler |
| `src/core/task/index.ts` | Check pending input in ask() |
| `src/core/controller/index.ts` | Send state to WebView |

### Frontend
| File | Role |
|------|------|
| `webview-ui/src/careti/hooks/useSessionState.ts` | Session state hook |
| `webview-ui/src/components/chat/ChatTextArea.tsx` | Pending input preview UI |
| `webview-ui/src/context/ExtensionStateContext.tsx` | pendingInput state management |

## Implementation Guidelines

### DO's
- ✅ Use `SessionManager.getInstance()` singleton
- ✅ Subscribe to session events in Controller
- ✅ Check `isStreaming` before queuing input
- ✅ Use `Logger` for session operations
- ✅ Handle edge cases (no task, already idle)

### DON'Ts
- ❌ Don't create multiple SessionManager instances
- ❌ Don't bypass double-press pattern (use forceInterrupt only when necessary)
- ❌ Don't forget to consume pending input after streaming completes
- ❌ Don't block UI during interrupt operations

## Testing

**Unit Tests**: `careti-src/__tests__/utils/session-manager.test.ts`
- 35 test cases covering all methods
- Mock timers for interrupt timeout tests

**E2E Tests**: `src/test/e2e/cancel.test.ts`
- Cancel button display
- Escape key cancellation
- Double-press pattern verification

## Related Documents
- `careti-docs/features/f19-message-queue-system.md`: Complete feature documentation
- `.agents/context/message-processing.md`: gRPC message architecture
- `.agents/context/webview-communication.md`: WebView communication patterns
