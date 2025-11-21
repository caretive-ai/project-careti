# Phase B2/B3 Recovery Plan (Remediation)

**Status:** 🚨 Recovery Required
**Target:** Phase B2 (Backend Integration) & Phase B3 (Webview)
**Reviewer:** Alpha

---

## 1. Problem Statement
The previous merge attempt for Phase B2 and B3 was incomplete.
- **B2 (Backend):** `BizRouterHandler` and `CaretGlobalManager` auth injection were missing from `src/core/api/index.ts`.
- **B3 (Webview):** The webview source is still 100% Cline v3.38.1. Caret's branding, i18n, and UI components are missing.

## 2. Recovery Steps

### Step 1: Fix Backend Integration (Phase B2)
- [x] **Modify `src/shared/api.ts`**:
  - Add `bizrouter` to `ApiProvider` type.
  - Add `bizRouterApiKey`, `bizRouterModelId`, `bizRouterModelInfo` to secrets/options.
  - Add `BizRouterModelInfo` interface.
- [x] **Modify `src/core/api/index.ts`**:
  - Import `BizRouterHandler`.
  - Add `case "bizrouter":` to `createHandlerForProvider`.
- [x] **Verify `CaretGlobalManager` Integration**:
  - Ensure `CaretGlobalManager.authToken` is accessible and used in API requests (if applicable via headers or secret syncing).

### Step 2: Re-run Webview Merge (Phase B3)
- [ ] **Overlay Caret Webview**:
  - Copy `comparison/caret/webview-ui/src/**` to `webview-ui/src/**` (excluding Cline-specific new files if any).
- [ ] **Reverse-Port Cline v3.38.1 Changes**:
  - Use `git diff comparison/base comparison/cline -- webview-ui/src` to identify Cline's changes.
  - Manually apply relevant changes (e.g., new MCP settings UI, chat view improvements) to the Caret-based webview.
  - **CRITICAL**: Preserve Caret's `Branding`, `Persona`, `InputHistory`, and `i18n` logic.

### Step 3: Fix Root Metadata (Phase B4)
- [ ] **Update `package.json`**:
  - Restore `name`, `displayName`, `publisher` to Caret values.
  - Restore Caret-specific `scripts` (e.g., `build:webview:caret`).

## 3. Validation
- **Compile Check**: `npm run compile` must pass.
- **Logic Check**:
  - `grep "BizRouterHandler" src/core/api/index.ts` must return a match.
  - `grep "Caret" webview-ui/src/App.tsx` (or similar) must return matches indicating Caret UI is present.

---

**Approved by:** Alpha (Reviewer)
