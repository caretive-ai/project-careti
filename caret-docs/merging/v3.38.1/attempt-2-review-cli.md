# Code Review: CLI Caret/LiteLLM Provider Addition (D-2.4)

**Review Date:** 2025-11-28
**Reviewer:** Antigravity (Agent)
**Target:** D-2.4 CLI Caret/LiteLLM Provider Addition & Menu Changes

## 📊 Summary
**Status:** 🟡 **Conditional Pass**
The implementation of Caret Account and LiteLLM (BYO) in the CLI is logically complete and follows the design patterns. However, **required unit tests are missing**, and the Webview CLI detection is stubbed.

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

### 2. Caret Account Integration ✅
- **Auth Provider (`auth_caret_provider.go`)**:
  - Implements full auth flow: `HandleCaretAuth`, `caretSignIn`, `caretSignOut`.
  - Uses correct endpoints: `https://caret.team` (Auth), `https://api.caret.team` (API).
  - `SelectCaretModel` correctly defaults to `gemini/gemini-2.5-flash`.
- **Menu (`auth_menu.go`)**:
  - `AuthActionCaretLogin` added to main menu.
  - "Caret Account" status is displayed alongside Cline Account.

### 3. Menu Additions/Changes ✅
- **Auth Menu**:
  - Supports dual login status display (Caret & Cline).
  - Provider selection menu includes Caret and LiteLLM.
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
    - Add unit tests to verify `GetProviderDisplayName`, `GetBYOProviderList`, and `FormatProviderList` for Caret and LiteLLM.
2.  **Wire Webview Detection**:
    - Pass `isCaretCliInstalled` result to `ExtensionState`.
    - Update `CliInstallBanner.tsx` to use the real state.

### Verification Checklist
- [x] LiteLLM Base URL prompt in CLI Wizard.
- [x] Caret Login flow in CLI.
- [ ] **Run Tests**: Create and run `providers_list_test.go`.
