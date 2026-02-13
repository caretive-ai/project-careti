# F04 - Cline Compatibility & CLI Extensions

**Status**: ✅ Phase D complete  
**Scope**: Core (prompt/mode), Webview (banner/settings)  
**Priority**: 🔴 High

---

## 📋 Overview

Careti remains compatible with core Cline behavior (Plan/Act, MCP, providers, etc.) while offering a **Dual Mode System**. Users can switch between `Cline Mode` (compatibility) and `Careti Mode` (extended features such as JSON prompts and dedicated authentication) through settings or UI toggles. CLI sessions default to **Cline prompt system** for compatibility (see `cli/pkg/cli/task/manager.go`). The CLI still uses Cline's **Plan/Act** modes, but Careti ships a **separate careti-branded CLI** (`careti`) for Careti mode; Cline mode continues to use `cline`. The Careti CLI also exposes **additional providers** compared to the Cline CLI.

> Note: CLI-specific behavior is now tracked separately in **F12 - Careti CLI**.

## ✅ Why This Matters
- **User value**: Cline workflows remain intact while Careti can add new prompt systems and UI features safely.
- **Merge safety**: Cline core is preserved; Careti logic is injected via mode checks and wrappers.
- **Operational clarity**: Prompt system is explicit (`caretModeSystem`), and CLI defaults to compatibility mode.

## ✨ Added Capabilities (Summary)
- Dual prompt systems (Cline text prompts ↔ Careti JSON prompts).
- Mode-aware CLI compatibility (CLI forces `"cline"` prompt system by default).
- Subagent UI surfaced with i18n support.
- Multi-domain auth separation (`careti.ai` vs `cline.bot`).
- Careti-branded CLI (`careti`) with Plan/Act parity and expanded provider list.

---

## 🆚 Improvements vs Cline

| Feature | Cline (Original) | Careti (Enhanced) |
| --- | --- | --- |
| **Operating Modes** | Single Plan/Act system only | **Dual Mode System** (Careti ↔ Cline) with separated prompts/tools/UI per mode |
| **System Prompt** | Prompt registry (`src/core/prompts/system-prompt/*`) | **Dynamic JSON Prompt System** (`careti-src/core/prompts/system`) via `CaretiPromptWrapper` when `modeSystem === "careti"` |
| **Auth/Domain** | Fixed `cline.bot` | **Multi-domain**: handles `careti.ai` (Careti) and `cline.bot` (Cline) separately to avoid account conflicts |
| **Subagents** | Experimental, UI hidden | **Full UI support**: settings toggles/output limit slider, i18n (en/ko/ja/zh). **Execution**: `careti "prompt"` spawns isolated sub-agent processes (see F12) |
| **CLI** | `cline` only | **`careti` CLI** for Careti mode, same Plan/Act flow, extra providers enabled |

---

## 🏗 Code Scope

Key files to verify during merges:

### 1. Core & Controller (Mode System)
- **`src/core/prompts/system-prompt/index.ts`**: routes to `CaretiPromptWrapper` when `modeSystem === "careti"` (critical switch).
- **`src/core/controller/persona/SetPromptSystemMode.ts`**: persists `caretModeSystem` to GlobalState on mode change.
- **`src/core/task/index.ts`**: attaches current mode metadata when starting tasks.
- **`src/core/controller/state/updateSettings.ts`**: updates `caretModeSystem` on settings changes.
- **`src/core/controller/state/checkCliInstallation.ts`**: branches to `isCaretCliInstalled()` vs `isClineCliInstalled()` based on mode.
- **`src/core/controller/state/installClineCli.ts`**: runs `npm install -g @caretive/careti-cli` or `cline` depending on mode.
- **`cli/pkg/cli/task/manager.go`**: CLI sets prompt system to `"cline"` on session start via `Caretsystem.SetPromptSystemMode` for compatibility.
- **`cli/cmd/cline/main.go`**: CLI Plan/Act flags and brand-aware command name (`careti`/`cline`).
- **`cli/pkg/common/branding.go`**: brand resolution (display name + command name) for Careti vs Cline CLI.

### 2. Webview (UI & Detection)
- **`webview-ui/src/components/common/CliInstallBanner.tsx`**: shows Careti CLI or Cline CLI banner per mode.
- **`src/utils/cli-detector.ts`**: adds `isCaretCliInstalled`; checks both Careti/Cline CLIs via `binary version`.
- **`webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx`**: restores subagent settings UI and mode-aware CLI hints.
- **`webview-ui/src/components/settings/SubagentOutputLineLimitSlider.tsx`**: output limit slider displayed when the toggle is on.
- **`webview-ui/src/careti/locale/{en,ko,ja,zh}/settings.json`**: adds translation keys for subagent toggle/install hint/output limit labels.

---

## 🛡️ Merge Checkpoints

1. **Minimal Invasion**  
   - When touching Cline files (e.g., `src/core/prompts/system-prompt/index.ts`), leave `// CARETI MODIFICATION: ...` markers.  
   - Prefer mode checks (`if (mode === "careti")`) that delegate to `careti-src/**` instead of altering core logic.

2. **3-Way Comparison**  
   - Compare `comparison/base` (v3.35.0), `comparison/cline` (v3.38.1), and `comparison/careti` (careti-main) to avoid missing upstream logic.  
   - In Webview settings merges, ensure all subagent toggles/sliders (and i18n keys) stay intact and avoid duplicate keys.

3. **Resource Separation**  
   - Keep Careti-only assets (images, JSON prompts, etc.) under `assets/` or `careti-src/` to avoid mixing with Cline originals.

## ⚠️ Cline Mode Considerations (After Standardization)

When running in **Cline Mode**, the following behavior is expected:

- **Rules**: `.agents/context` is still the only workspace rule source. Legacy rule paths are ignored.
- **Hooks**: `.agents/hooks` is the only hook directory. Legacy `.cline/hooks` paths are not read.
- **Global rules**: still come from the user documents folder (Careti Rules), not legacy Cline paths.
- **Prompt length**: `.agents/context` growth increases system prompt size for both modes; watch CLI/Claude Code limits.

If a user previously relied on `.clinerules` or legacy hook paths, they must migrate into `.agents/context` / `.agents/hooks`.

## 🧪 Testing Checklist (TDD)
- `mode-system.test.ts`: global state persistence, careti/cline branching, UI labels (Plan/Act).  
- CLI detection/banner: validate mode-aware install banners and commands.  
- `npm run compile && npm run test` passes; manual `careti version`, `careti task new` run correctly.

## 📎 References
- `careti-docs/merging/cli-provider-servers.md` (domains/endpoints for server team)  
- `careti-docs/merging/v3.38.1/attempt-2-master.md` (Phase D log and actions)
