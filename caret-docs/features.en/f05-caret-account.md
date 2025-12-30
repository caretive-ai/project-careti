# F05 - Caret Account System (replaces ClineAccount)

**Status**: ✅ Phase 4 complete | **Scope**: Backend (controller/service), Webview (Account/Settings), gRPC | **Priority**: 🔴 High

## 📋 Overview
Caret account + provider stack that branches at the entry points while keeping Cline code intact. Caret and Cline accounts coexist; routing decides which experience to show. Caret provider and image generation use the Caret access token against the Caret API (`CaretEnv.config().apiBaseUrl`, production `https://api.caret.team`).

## ✅ Why This Matters
- **User value**: Caret accounts unlock Caret-native models, usage/billing visibility, and image generation without losing Cline compatibility.
- **Merge safety**: Cline logic stays untouched; Caret functionality is injected at entry points only.
- **Operational consistency**: One Caret token powers account UI, provider calls, and image generation.

## ✨ Added Capabilities (Summary)
- Dual account routing (Caret + Cline coexistence).
- Caret Auth API flow (`/v1/auth/*`) with JWT access tokens.
- Caret provider via OpenAI-compatible API (`/v1/chat/completions`).
- Image generation tool (`/v1/generate/image`) with workspace generated-assets outputs.

## 🆚 Improvements vs Cline
| Area | Cline | Caret |
| --- | --- | --- |
| Account model | Single ClineAccount | **Dual Account System** (Caret + Cline) with entry-point branching |
| Transport | REST `cline.bot` | **gRPC + REST** (`api.caret.team`), typed via Protocol Buffers |
| Auth | Auth0 (Cline tenant) | **Caret auth API** (`/v1/auth/authorize → /v1/auth/token → /v1/auth/refresh`) with JWT access tokens |
| UI | Cline Account webview | **Unified Caret views** in Account and Settings with balance/usage cards |

## 🏗 Code Scope (current)
- **Backend controllers**: `src/core/controller/caretAccount/*` (gRPC handlers) → `caret-src/services/account/CaretAccountService.ts` (REST via `CaretEnv.config().apiBaseUrl`), `proto/caret/account.proto`.
- **Auth service**: `caret-src/services/auth/CaretAuthService.ts` + `caret-src/services/auth/providers/CaretAuthProvider.ts` (authorize/token/refresh), wired in `src/core/controller/index.ts`.
- **Caret API endpoints**: `caret-src/shared/caret/api.ts` (`/v1/auth/*`, `/v1/profile/*`).
- **Provider runtime**: `src/core/api/index.ts` → `caret-src/core/api/providers/caret.ts` (`CaretHandler`, OpenAI-compatible stream to `${apiBaseUrl}/v1/chat/completions`).
- **Image generation tool**: `src/core/task/tools/handlers/GenerateImageToolHandler.ts` (Caret token + `/v1/generate/image`, saves outputs to workspace).
- **Provider config & models**: `src/shared/api.ts` (`ApiProvider` includes `caret`; static `caretModels`/`caretDefaultModelId`); CLI static definitions generated via `scripts/cli-providers.mjs` → `cli/pkg/generated/providers.go`.
- **Webview**: Account entry branching in `webview-ui/src/components/account/AccountView.tsx`; Caret account UI in `webview-ui/src/caret/components/CaretAccountView.tsx`; auth state/context in `webview-ui/src/context/CaretAuthContext.tsx` and `ExtensionStateContext.tsx`; Settings provider UI in `webview-ui/src/components/settings/providers/CaretProvider.tsx` + `CaretModelPicker.tsx`.
- **CLI**: `cli/pkg/cli/auth/auth_caret_provider.go` (login, default model set from static list; org selection currently unavailable) uses generated provider definitions.

## 🎯 Goals
- Keep Cline logic intact; branch to Caret account/provider at the entry points.
- Use Caret auth tokens for both account UI data and Caret provider chat calls.

## 🔧 Architecture & Flows
- **Account entry switch (webview-ui/src/components/account/AccountView.tsx)**  
  ```tsx
  {caretUser?.uid ? <CaretAccountView caretUser={caretUser} /> : clineUser?.uid ? <ClineAccountView /> : <AccountWelcomeView />}
  ```
- **Account data**: Webview gRPC → `CaretAccountServiceClient.*` → `CaretAccountService` → REST `${apiBaseUrl}/v1/profile/*` (balance/usage/profile).
- **Auth state**: `CaretAuthContext` subscribes to Caret auth stream; `CaretAuthService` refreshes tokens and exposes `getAuthToken()` for provider + image calls.
- **Provider selection**: Settings `CaretProvider` + `CaretModelPicker` write `caretModelId`/`caretModelInfo` into `ExtensionStateContext` (plan/act mode fields).
- **Provider execution**: `src/core/api/index.ts` dispatches `"caret"` to `CaretHandler` (OpenAI SDK over `${apiBaseUrl}/v1` with Caret auth token and extra headers). Reasoning passthrough respects `shouldSkipReasoningForModel`.
- **Image outputs**: `generate_image` writes files under `<workspace>/.agents/generated-assets/`:
  - `.agents/generated-assets/<request_id>.<ext>` (image)
  - `.agents/generated-assets/<request_id>.md` (frontmatter + prompt + image link)
- **CLI parity**: `auth_caret_provider.go` uses static models from generated definitions, sets default model, and calls the same gRPC auth endpoints.

## 🌐 API Surface (caret.team)
- Base URL: `CaretEnv.config().apiBaseUrl` (production `https://api.caret.team`).
- Auth: `GET /v1/auth/authorize`, `POST /v1/auth/token`, `POST /v1/auth/refresh`.
- Account/Profile: `GET /v1/profile/balance`, `GET /v1/profile/logs`, `GET /v1/profile/payments`, `GET /v1/auth/me`.
- Provider: OpenAI-compatible `POST /v1/chat/completions` (CaretHandler), uses Caret auth token and `X-AnyLLM-Key` header.
- Image tool: `POST /v1/generate/image` (streamed), uses Caret auth token.

## 🧩 Models (Caret provider)
- Static list: `src/shared/api.ts` (`caretModels`, `caretDefaultModelId`).
  - `gemini/gemini-3-pro-preview`
  - `gemini/gemini-2.5-pro`
  - `gemini/gemini-2.5-flash` (default)
- Frontend merges static + backend-provided models in `ExtensionStateContext` but currently uses the static map.
- CLI static definitions regenerated by `npm run cli-providers` (uses `scripts/cli-providers.mjs`); default model mirrors `caretDefaultModelId`.

## 🧪 Testing Checklist
1) Webview: F5 → Account tab → CaretAccountView renders with balance/usage/profile via gRPC.
2) Settings: Caret login button works; model picker lists Caret models; selected model stored per mode.
3) Provider: Send chat with Caret provider; verify `CaretHandler` uses Caret token and selected model, reasoning skip logic behaves.
4) Image tool: generate image and confirm `.agents/generated-assets/<request_id>.*` files are created and relative paths are shown in tool output.
5) CLI: `npm run cli-providers` (after model changes) and `npm run protos-go` if proto changes; `cline auth` → Caret login + default model applied.

## 🧭 Maintenance Notes
- Keep Cline logic untouched; route through `caret-src/**` where possible.
- When adding models, update `src/shared/api.ts` and regenerate CLI definitions (`npm run cli-providers`).
- Proto changes require `npm run protos` (TS) and `npm run protos-go` (Go) plus post-processing steps already scripted.

## 🔗 Related
- **F12 - Caret CLI**: caret 모드 강제 CLI에서 계정/프로바이더 흐름을 동일하게 사용.
- **F10 - Enhanced Provider Setup**: Caret 토큰을 활용한 provider 설정/모델 선택이 UI·CLI 양쪽에 일관 적용.
