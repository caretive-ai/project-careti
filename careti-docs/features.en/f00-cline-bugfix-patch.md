# F00 - Cline Bugfix & Patch

**Status**: ✅ In progress  
**Scope**: Backend, Terminal, System Integration  
**Priority**: 🔴 High

---

## 📋 Overview

A collection of fixes for issues found in upstream Cline or surfaced in the Careti environment. Careti keeps full compatibility with Cline while applying the minimal patches required for stability and branding consistency.

## 🛠️ Patch List

### 1. Terminal Stability & Branding (Linux Shell Integration)
Fixes the case where `executeCommandTool` hangs or shows the terminal with the `Cline` name/icon when Shell Integration is enabled on Linux.

- **Issues**: Shell Integration streams sometimes never close (commands hang); terminal branding falls back to Cline.
- **Fixes**:
  - **Stream timeout**: force-complete if idle for 5 seconds (`STREAM_IDLE_TIMEOUT`).
  - **Branding**: enforce Careti name/icon through `TerminalRegistry` and `executeCommandInTerminal`.

### 2. Tool Approval / Ask Concurrency (Fix: `Current ask promise was ignored`)
Fixes a recurring race that can surface as:
`Error executing <tool>: Current ask promise was ignored` (e.g., `read_file`, `write_to_file`, `ask_followup_question`, `execute_command`).

- **Symptoms**:
  - Tool approval prompts (and other asks) intermittently fail even though the UI is responsive.
  - Failures can cascade into unrelated tool failures (e.g., diff editor being reverted/closed).
- **Root causes (Cline-compat layer)**:
  - `Task.ask()` previously used a generic message timestamp (`lastMessageTs`) to decide whether an ask is still valid; any `say()` during an active ask could invalidate the ask.
  - Even after separating the timestamp, *true concurrent asks* (two asks started before the first completes) can still happen via tool chaining or cancellation/resume flows.
- **Fixes (Careti-first)**:
  - **Decouple ask validity from `say()`**: introduce `lastAskTs` and use it for ask validity checks.
  - **Serialize asks (queue/mutex)**: ensure only one non-partial ask can be in-flight at a time (partial streaming UI updates are excluded).
  - **Abort-safe waiting**: ensure waiting asks can exit promptly on abort to avoid deadlocks.
  - **Secondary hardening**: reduce non-parallel tool chaining races by marking `didAlreadyUseTool` earlier in the complete-tool path.

### 3. Extension Coexistence with Cline (Command ID Collision)
Fixes a VS Code activation failure when both Careti and Cline are installed:
`Activating extension 'saoudrizwan.claude-dev' failed: command 'cline.plusButtonClicked' already exists.`

- **Root cause**: Careti was registering the same global command IDs as Cline (e.g., `cline.plusButtonClicked`), and VS Code requires command IDs to be unique across extensions.
- **Fix**: namespace Careti commands under the extension id prefix, e.g. `caretive.careti.plusButtonClicked`.
- **Notes**:
  - This is a breaking change for any user-defined keybindings or automation referencing the old `cline.*` command IDs in Careti.
  - Built-in keybindings/menus were updated accordingly.

### 4. Future Bugfix Slot
- Reserved for future Cline upstream or compatibility fixes.

---

## 🏗 Code Scope

| Area | File | Change Summary |
| --- | --- | --- |
| **Terminal** | `src/integrations/terminal/TerminalProcess.ts` | Added `STREAM_IDLE_TIMEOUT` wrapper; closes idle streams. |
| **Terminal** | `src/integrations/terminal/TerminalRegistry.ts` | Introduced `getTerminalBranding()`, caches display name/icon in `initialize(context)`. |
| **Terminal** | `src/hosts/vscode/hostbridge/workspace/executeCommandInTerminal.ts` | Uses `getTerminalBranding()` for ad-hoc terminal creation. |
| **Main** | `src/extension.ts` | Calls `TerminalRegistry.initialize(context)` during activation. |
| **Utils** | `careti-src/utils/brand-utils.ts` | Searches multiple candidate paths so `package.json` is found in dist/CLI builds. |
| **Task** | `src/core/task/TaskState.ts` | Adds `lastAskTs` for ask validity tracking (decoupled from `say()`). |
| **Task** | `src/core/task/index.ts` | Serializes asks with a mutex; abort-safe ask waiting; uses `lastAskTs` for validity. |
| **Task** | `src/core/task/ToolExecutor.ts` | Harden non-parallel execution by pre-marking `didAlreadyUseTool` before complete-tool execution. |
| **Tests** | `src/core/task/__tests__/TaskAskConcurrency.test.ts` | Regression tests for ask/say concurrency and sequential ask behavior. |
| **VS Code** | `package.json` | Renames `contributes.commands` + menus + keybindings from `cline.*` → `caretive.careti.*`. |
| **VS Code** | `src/registry.ts` | Uses `${publisher}.${name}` as command prefix to avoid Cline collisions. |
| **Dev** | `src/dev/commands/tasks.ts` | Renames dev command IDs to `caretive.careti.dev.*`. |
| **Tests** | `src/test/extension.test.ts` | Executes the plus-button command via `${publisher}.${name}.plusButtonClicked`. |
| **UI** | `src/core/controller/ui/openWalkthrough.ts` | Opens `CaretWalkthrough` using the current extension id. |

---

## ✅ Validation Checklist

1. **Linux (with Shell Integration)**  
   - From VS Code dev host, ask Careti to run `node -v`, `npm -v`.  
   - Ensure `TerminalProcess` emits `continue` within ~5 seconds and the task unblocks.
2. **Linux (without Shell Integration / Cursor, etc.)**  
   - Confirm fallback branch (`terminal.sendText`) runs and auto-continues after ~3 seconds.
3. **Branding**  
   - CLI install banner and VS Code terminal title show `"Careti"` with `robot_panel_light/dark.png` icons; capture screenshots.
4. **Regression**  
   - After `npm run package:release`, install the VSIX and confirm `HostProvider.workspace.executeCommandInTerminal` logs `success: true`.
5. **Ask Concurrency**  
   - Trigger tool approval prompts repeatedly (e.g., `read_file` requiring approval) and confirm no `Current ask promise was ignored` errors.
6. **Coexistence**  
   - Install both extensions (Careti + Cline) and confirm neither fails activation due to duplicate command IDs.

---

## 📎 Notes

- These three files (TerminalRegistry / TerminalProcess / executeCommandInTerminal) are now part of the **Backend Critical Files** list in the merge standard guide.
- Linked to Phase 4.T of the merge execution master plan so future merge rounds re-check them automatically.
- For upstream Cline, the “ask concurrency” patch should be considered carefully: the most robust design is an askId-based matching or an explicit ask queue to prevent concurrent asks.
