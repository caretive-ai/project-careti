# F04 - Cline Compatibility & CLI Extensions

**Status**: ✅ Phase D complete  
**Scope**: Core (prompt/mode), Webview (banner/settings), CLI (Go/packaging)  
**Priority**: 🔴 High

---

## 📋 Overview

Caret remains 100% compatible with all Cline features (Plan/Act, MCP, providers, etc.) while offering a **Dual Mode System**. Users can switch between `Cline Mode` (pure compatibility) and `Caret Mode` (extended features such as JSON prompts, enhanced CLI, dedicated authentication) through settings or UI toggles.

---

## 🆚 Improvements vs Cline

| Feature | Cline (Original) | Caret (Enhanced) |
| --- | --- | --- |
| **Operating Modes** | Single Plan/Act system only | **Dual Mode System** (Caret ↔ Cline) with fully separated prompts/tools/UI per mode |
| **System Prompt** | Hardcoded text prompt (`src/core/prompts/system.ts`) | **Dynamic JSON Prompt System** (`caret-src/core/prompts`) with structured control |
| **CLI Tooling** | `cline` CLI only | **Unified CLI wrapper**: the `caret` command drives either Caret or Cline backends depending on mode |
| **Auth/Domain** | Fixed `cline.bot` | **Multi-domain**: handles `caret.team` (Caret) and `cline.bot` (Cline) separately to avoid account conflicts |
| **Subagents** | Experimental, UI hidden | **Full UI support**: settings toggles/output limit slider, mode-aware CLI install hints/buttons, i18n (en/ko/ja/zh) |

---

## 🏗 Code Scope

Key files to verify during merges:

### 1. Core & Controller (Mode System)
- **`src/core/prompts/system-prompt/index.ts`**: routes to `CaretPromptWrapper` when `modeSystem === "caret"` (critical switch).
- **`src/core/controller/persona/SetPromptSystemMode.ts`**: persists `caretModeSystem` to GlobalState on mode change.
- **`src/core/task/index.ts`**: attaches current mode metadata when starting tasks.
- **`src/core/controller/state/updateSettings.ts`**: updates `caretModeSystem` on settings changes.
- **`src/core/controller/state/checkCliInstallation.ts`**: branches to `isCaretCliInstalled()` vs `isClineCliInstalled()` based on mode.
- **`src/core/controller/state/installClineCli.ts`**: runs `npm install -g @caretive/caret-cli` or `cline` depending on mode.

### 2. Webview (UI & Detection)
- **`webview-ui/src/components/common/CliInstallBanner.tsx`**: shows Caret CLI or Cline CLI banner per mode.
- **`src/utils/cli-detector.ts`**: adds `isCaretCliInstalled`; checks both Caret/Cline CLIs via `binary version`.
- **`webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx`**: restores subagent settings UI and mode-aware CLI hints.
- **`webview-ui/src/components/settings/SubagentOutputLineLimitSlider.tsx`**: output limit slider displayed when the toggle is on.
- **`webview-ui/src/caret/locale/{en,ko,ja,zh}/settings.json`**: adds translation keys for subagent toggle/install hint/output limit labels.

### 3. CLI (Go & Packaging)
- **`cli-caret/pkg/cli/auth/`**: `auth_menu.go`, `providers_list.go` branch Caret/Cline/BYO menus and apply the `caret.team` domain.
- **`cli-caret/scripts/`**: `build-local.sh`, `publish-caret-cli.sh` package both binaries (includes `cline`) into a single distribution.

---

## 🛡️ Merge Checkpoints

1. **Minimal Invasion**  
   - When touching Cline files (e.g., `src/core/prompts/system-prompt/index.ts`), leave `// CARET MODIFICATION: ...` markers.  
   - Prefer mode checks (`if (mode === "caret")`) that delegate to `caret-src/**` instead of altering core logic.

2. **3-Way Comparison**  
   - Compare `comparison/base` (v3.35.0), `comparison/cline` (v3.38.1), and `comparison/caret` (caret-main) to avoid missing upstream logic.  
   - In Webview settings merges, ensure all subagent toggles/sliders (and i18n keys) stay intact and avoid duplicate keys.

3. **Resource Separation**  
   - Keep Caret-only assets (images, JSON prompts, etc.) under `assets/` or `caret-src/` to avoid mixing with Cline originals.

## 🧪 Testing Checklist (TDD)
- `mode-system.test.ts`: global state persistence, caret/cline branching, UI labels (Agent/Chatbot vs Plan/Act).  
- CLI detection/banner: validate mode-aware install banners and commands.  
- `npm run compile && npm run test` passes; manual `caret version`, `caret task new` run correctly.

## 📎 References
- `caret-docs/merging/cli-provider-servers.md` (domains/endpoints for server team)  
- `caret-docs/merging/v3.38.1/attempt-2-master.md` (Phase D log and actions)
