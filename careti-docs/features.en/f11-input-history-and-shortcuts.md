# F11 - Input History & Shortcuts

**Status**: ✅ Phase 2 | **Scope**: Backend (state), Webview (hooks/components) | **Priority**: 🟡 Medium

## 📋 Overview
Terminal-like UX: navigate previous inputs with `ArrowUp/Down`, persist history per workspace (survives reload), and expose productivity shortcuts (`Esc` cancel, `Ctrl+Shift+R` resume).

## 🆚 Improvements vs Cline
| Area | Cline | Careti |
| --- | --- | --- |
| History | None (lost on refresh) | **Persistent** backend-stored history |
| Navigation | Not supported | **Terminal-style** arrow navigation |
| Shortcuts | Limited | Expanded set (cancel/resume + catalog) |
| Data | Mixed | Stores **user inputs only**, not AI responses |

## 🏗 Code Scope
- **Backend**: `careti-src/managers/CaretiGlobalManager.ts` caches history + gRPC resolver; `src/core/controller/index.ts` loads history for webview init.
- **Webview**: `usePersistentInputHistory.ts` (state subscription + cache), `useInputHistory.ts` (keyboard handling), `ChatTextArea.tsx` integration, shortcut definitions in `webview-ui/src/careti/shortcuts/shortcuts.json`.

## 🔧 Behavior
- **Terminal consistency**: Up/Down recall previous/next input when cursor at start/end.
- **Persistence**: History saved via `StateServiceClient` and rehydrated on startup.
- **Clean data**: Deduplicates consecutive entries; trims whitespace; caps history size.
- **Shortcut catalog**: Central JSON loaded by `ShortcutManager` and mirrored in button labels (e.g., “Resume (Ctrl+Shift+R)”).

## 🧪 Testing & Verification
- Compile + run dev host; enter multiple messages, verify arrow navigation and persistence after VS Code restart.
- Confirm `CaretiGlobalManager` cache matches backend state and that history is not overwritten when save fails.
- Check shortcuts appear in UI and key handlers fire in `ChatTextArea`.

## 🔄 Minimal Invasion
Feature is additive and isolated to Careti hooks/state; Cline behavior remains unchanged when history is disabled.

## 📊 Benefits
- Faster iteration with terminal muscle memory.
- Reduced frustration from lost inputs after reload.
- Clear shortcut catalog aligned with branding/i18n labels.
