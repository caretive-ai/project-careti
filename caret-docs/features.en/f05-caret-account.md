# F05 - Caret Account System (replaces ClineAccount)

**Status**: ✅ Phase 4 complete | **Scope**: Backend (controller/service), Webview (Account/Settings), gRPC | **Priority**: 🔴 High

## 📋 Overview
A fully independent Caret account stack that replaces ClineAccount through branching entry points while keeping Cline code intact. Caret and Cline accounts can coexist; routing decides which experience to show.

## 🆚 Improvements vs Cline
| Area | Cline | Caret |
| --- | --- | --- |
| Account model | Single ClineAccount | **Dual Account System** (Caret + Cline) with entry-point branching |
| Transport | REST `cline.bot` | **gRPC + REST** (`api.caret.team`), typed via Protocol Buffers |
| Auth | Auth0 (Cline tenant) | **Custom Auth0 (Caret tenant)** with JWT, org vs personal separation |
| UI | Cline Account webview | **Unified Caret views** in Account and Settings with balance/usage cards |

## 🏗 Code Scope
- **Backend**: `src/core/controller/caretAccount/*` handlers, `src/services/account/CaretAccountService.ts`, `proto/caret/account.proto`.
- **Webview**: `webview-ui/src/caret/components/CaretAccountView.tsx`, `CaretAccountInfoCard.tsx`, entry branching in `webview-ui/src/components/account/AccountView.tsx`, state in `webview-ui/src/context/ExtensionStateContext.tsx`.
- **API Provider**: `src/api/providers/CaretApiProvider.ts` (OpenAI-compatible `/api/v1/chat/completions`).

## 🎯 Goal
Replace ClineAccount by switching only the entry point while preserving Cline logic.

## 📋 Implementation Strategy
- **Entry-point switch** (AccountView):
  ```tsx
  {caretUser?.uid ? <CaretAccountView /> : clineUser?.uid ? <ClineAccountView /> : <AccountWelcomeView />}
  ```
- **Benefits**: Minimal intrusion, Cline code kept, Caret UI/services operate independently.

## 🏗 Required Components
- Frontend: `CaretAccountView`, `CaretAccountInfoCard`, `CaretApiSetup`, `CaretWelcomeSection`, `CaretGeneralSettingsSection`.
- Backend: `CaretApiProvider`, `CaretAccountService` (gRPC/REST), mock server for dev.

## 🔧 Implementation Phases
1) **caretUser state** in ExtensionState + CaretGlobalManager; mode-aware auth tokens. 
2) **CaretAccountView** with the same interface as ClineAccountView; wired to Caret API. 
3) **Settings integration** via `CaretAccountInfoCard` and “View Account” entry.

## 🌐 API Requirements (server team)
**Base URL**: `https://api.caret.team`
- Balance API
- Usage history API
- Generation listing (usage tracking)
- User profile API
- OpenAI-compatible chat/completions (highest priority)

## ⚠️ Notes
- Keep Caret/Cline API keys and domains separate to avoid collisions.
- Follow minimal-change principle; branch to `caret-src/**` rather than modifying shared logic.

## 📊 Current Status
- Core TypeScript + gRPC flow implemented; 401 issues resolved with post-processing scripts; compiles and bundles cleanly.
- Mock → real API swap is documented; remaining live behavior depends on server endpoints.

## 🧪 Testing
1) **Mock API**: compile, run component tests, verify Account view rendering. 
2) **Live check**: launch VS Code (F5), open Account → CaretAccountView, confirm data fetch. 
3) **Logs**: trace gRPC/REST calls and ensure token propagation. 
4) **Response shape**: validate against proto/Swagger contracts.

## 📖 API Checklist for caret.team
- **Phase 1**: Balance, usage history, profile.
- **Phase 2**: OpenAI-compatible chat endpoint (billing critical).
- **Phase 3**: Org/user management refinements.

## 🧪 Final Verification
- ✅ TypeScript compile and bundle pass.
- ✅ Proto generation + post-processing scripts fix Caret namespaces in generated files.
- ✅ gRPC call flow tested end-to-end with mock + live stubs.

## 🚀 Handoff
- **Frontend/Extension**: 100% ready and branded.
- **Backend hook**: Swap mock URLs to live `api.caret.team`; minimal server work required for go-live.
- **Post-launch**: Monitor balances/usage rendering, auth token refresh, and update gRPC definitions as the API evolves.
