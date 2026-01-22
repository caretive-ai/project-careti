# Code Review: CLI Careti/LiteLLM Provider Addition (D-2.4)

**Review Date:** 2025-11-28
**Reviewer:** Antigravity (Agent)
**Target:** D-2.4 CLI Careti/LiteLLM Provider Addition & Menu Changes

## 📊 Summary
**Status:** 🟡 **Conditional Pass**
The implementation of Careti Account and LiteLLM (BYO) in the CLI is logically complete and follows the design patterns. However, **required unit tests are missing**, and the Webview CLI detection is stubbed.

## 🔍 Detailed Findings

### 1. LiteLLM Provider (BYO) ✅
- **Configuration (`providers_byo.go`)**:
  - Correctly added to `GetBYOProviderList`.
  - `SupportsBYOModelFetching` enabled.
  - `PromptForAPIKey` correctly enforces and prompts for **Base URL** specific to LiteLLM.
- **Wizard Integration (`wizard_byo.go`)**:
  - `fetchModelsForProvider` correctly routes to `FetchLiteLlmModels`.
- **Provider List (`providers_list.go`)**:
  - `ApiProvider_LITELLM` is correctly mapped and detected.

### 2. Careti Account Integration ✅
- **Auth Provider (`auth_caret_provider.go`)**:
  - Implements full auth flow: `HandleCaretAuth`, `caretSignIn`, `caretSignOut`.
  - Uses correct endpoints: `https://careti.ai` (Auth), `https://api.careti.ai` (API).
  - `SelectCaretModel` correctly defaults to `gemini/gemini-2.5-flash`.
- **Menu (`auth_menu.go`)**:
  - `AuthActionCaretLogin` added to main menu.
  - "Careti Account" status is displayed alongside Cline Account.

### 3. Menu Additions/Changes ✅
- **Auth Menu**:
  - Supports dual login status display (Careti & Cline).
  - Provider selection menu includes Careti and LiteLLM.
- **Wizard**:
  - "Add a new provider" flow correctly includes LiteLLM.

### 4. Issues & Gaps ⚠️
- **Missing Tests (Critical)**:
  - The plan required adding `providers_list_test.go` to verify provider labels and visibility. **This file is missing.**
- **Webview Integration (Stubbed)**:
  - `CliInstallBanner.tsx`: Logic to detect if CLI is installed is stubbed (`TODO: Add isClineCliInstalled...`). Banner will always show by default.
  - `cli-detector.ts`: `isCaretCliInstalled` exists but is not wired to Webview state.

## 🛠 Recommendations

### Required Fixes
1.  **Create `providers_list_test.go`**:
    - Add unit tests to verify `GetProviderDisplayName`, `GetBYOProviderList`, and `FormatProviderList` for Careti and LiteLLM.
2.  **Wire Webview Detection**:
    - Pass `isCaretCliInstalled` result to `ExtensionState`.
    - Update `CliInstallBanner.tsx` to use the real state.

### Verification Checklist
- [x] LiteLLM Base URL prompt in CLI Wizard.
- [x] Careti Login flow in CLI.
- [ ] **Run Tests**: Create and run `providers_list_test.go`.

## 🧩 Sub-agent & System Prompt Implementation (D-1/D-2)

### 1. System Prompt Branching ✅
- **`src/core/prompts/system-prompt/index.ts`**:
  - Correctly implements `// CARETI MODIFICATION` to branch logic.
  - `modeSystem === "careti"` routes to `CaretiPromptWrapper`.
  - `modeSystem === "cline"` routes to `PromptRegistry` (original behavior).
  - **Verdict**: Compliant with Dual Mode architecture.

### 2. Sub-agent Prompt Generation ✅
- **`src/core/prompts/system-prompt/components/cli_subagents.ts`**:
  - **Logic**: Dynamically switches between "Careti CLI" and "Cline CLI" terminology based on `modeSystem`.
  - **3-Way Merge**: This file exists in Cline v3.38.1. Careti modified it to add dynamic logic.
  - **Fix Applied**: Added missing `// CARETI MODIFICATION` comment to `getCliSubagentsTemplateText` to satisfy merge standards.
  - **Integration**: Registered in `components/index.ts` and used in `generic` variant template (which natively includes `{{CLI_SUBAGENTS_SECTION}}` in Cline v3.38.1).

### 3. CLI Installation Detection ✅
- **`src/core/controller/state/checkCliInstallation.ts`**:
  - Correctly checks `caretModeSystem` global state.
  - Calls `isCaretCliInstalled()` or `isClineCliInstalled()` appropriately.
  - Ensures `isSubagentsEnabledAndCliInstalled` context variable is accurate for the current mode.

### 4. Careti Prompt Wrapper ✅
- **`careti-src/core/prompts/CaretiPromptWrapper.ts`**:
  - Implements independent prompt generation using `CaretModeManager`.
  - Ensures complete isolation for Careti mode.

**Overall Sub-agent Status:** 🟢 **Pass** (after applying comment fix)
