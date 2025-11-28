# F00 - Cline Bugfix & Patch

**Status**: ✅ In progress  
**Scope**: Backend, Terminal, System Integration  
**Priority**: 🔴 High

---

## 📋 Overview

A collection of fixes for issues found in upstream Cline or surfaced in the Caret environment. Caret keeps full compatibility with Cline while applying the minimal patches required for stability and branding consistency.

## 🛠️ Patch List

### 1. Terminal Stability & Branding (Linux Shell Integration)
Fixes the case where `executeCommandTool` hangs or shows the terminal with the `Cline` name/icon when Shell Integration is enabled on Linux.

- **Issues**: Shell Integration streams sometimes never close (commands hang); terminal branding falls back to Cline.
- **Fixes**:
  - **Stream timeout**: force-complete if idle for 5 seconds (`STREAM_IDLE_TIMEOUT`).
  - **Branding**: enforce Caret name/icon through `TerminalRegistry` and `executeCommandInTerminal`.

### 2. Future Bugfix Slot
- Reserved for future Cline upstream or compatibility fixes.

---

## 🏗 Code Scope

| Area | File | Change Summary |
| --- | --- | --- |
| **Terminal** | `src/integrations/terminal/TerminalProcess.ts` | Added `STREAM_IDLE_TIMEOUT` wrapper; closes idle streams. |
| **Terminal** | `src/integrations/terminal/TerminalRegistry.ts` | Introduced `getTerminalBranding()`, caches display name/icon in `initialize(context)`. |
| **Terminal** | `src/hosts/vscode/hostbridge/workspace/executeCommandInTerminal.ts` | Uses `getTerminalBranding()` for ad-hoc terminal creation. |
| **Main** | `src/extension.ts` | Calls `TerminalRegistry.initialize(context)` during activation. |
| **Utils** | `caret-src/utils/brand-utils.ts` | Searches multiple candidate paths so `package.json` is found in dist/CLI builds. |

---

## ✅ Validation Checklist

1. **Linux (with Shell Integration)**  
   - From VS Code dev host, ask Caret to run `node -v`, `npm -v`.  
   - Ensure `TerminalProcess` emits `continue` within ~5 seconds and the task unblocks.
2. **Linux (without Shell Integration / Cursor, etc.)**  
   - Confirm fallback branch (`terminal.sendText`) runs and auto-continues after ~3 seconds.
3. **Branding**  
   - CLI install banner and VS Code terminal title show `"Caret"` with `robot_panel_light/dark.png` icons; capture screenshots.
4. **Regression**  
   - After `npm run package:release`, install the VSIX and confirm `HostProvider.workspace.executeCommandInTerminal` logs `success: true`.

---

## 📎 Notes

- These three files (TerminalRegistry / TerminalProcess / executeCommandInTerminal) are now part of the **Backend Critical Files** list in the merge standard guide.
- Linked to Phase 4.T of the merge execution master plan so future merge rounds re-check them automatically.
