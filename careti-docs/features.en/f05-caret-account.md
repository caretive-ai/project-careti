# F05 - Careti Account System (replaces ClineAccount)

**Status**: ✅ Phase 4 complete | **Scope**: Backend (controller/service), Webview (Account/Settings), gRPC | **Priority**: 🔴 High

## 📋 Overview
Careti account + provider stack that branches at the entry points while keeping Cline code intact. Careti and Cline accounts coexist; routing decides which experience to show. Careti provider and image generation use the Careti access token against the Careti API (`CaretEnv.config().apiBaseUrl`, production `https://api.careti.ai`).

## ✅ Why This Matters
- **User value**: Careti accounts unlock Careti-native models, usage/billing visibility, and image generation without losing Cline compatibility.
- **Merge safety**: Cline logic stays untouched; Careti functionality is injected at entry points only.
- **Operational consistency**: One Careti token powers account UI, provider calls, and image generation.

## ✨ Added Capabilities (Summary)
- Dual account routing (Careti + Cline coexistence).
- Careti Auth API flow (`/v1/auth/*`) with JWT access tokens.
- Careti provider via OpenAI-compatible API (`/v1/chat/completions`).
- Image generation tool (`/v1/generate/image`) with workspace generated-assets outputs.
- Optional @-mention image attachments (base64) for reference-driven image generation.
- Reference images accept data URLs or workspace paths (resolved + optimized on the backend).
- Shared image optimization (resize + webp) for uploads, mentions, and reference images.
- Careti CLI (`careti`) uses the same Careti auth token flow with Plan/Act parity to the Cline CLI.

## 🆚 Improvements vs Cline
| Area | Cline | Careti |
| --- | --- | --- |
| Account model | Single ClineAccount | **Dual Account System** (Careti + Cline) with entry-point branching |
| Transport | REST `cline.bot` | **gRPC + REST** (`api.careti.ai`), typed via Protocol Buffers |
| Auth | Auth0 (Cline tenant) | **Careti auth API** (`/v1/auth/authorize → /v1/auth/token → /v1/auth/refresh`) with JWT access tokens |
| UI | Cline Account webview | **Unified Careti views** in Account and Settings with balance/usage cards |

## 🏗 Code Scope (current)
- **Backend controllers**: `src/core/controller/caretAccount/*` (gRPC handlers) → `careti-src/services/account/CaretAccountService.ts` (REST via `CaretEnv.config().apiBaseUrl`), `proto/careti/account.proto`.
- **Auth service**: `careti-src/services/auth/CaretAuthService.ts` + `careti-src/services/auth/providers/CaretAuthProvider.ts` (authorize/token/refresh), wired in `src/core/controller/index.ts`.
- **Careti API endpoints**: `careti-src/shared/careti/api.ts` (`/v1/auth/*`, `/v1/profile/*`).
- **Provider runtime**: `src/core/api/index.ts` → `careti-src/core/api/providers/careti.ts` (`CaretHandler`, OpenAI-compatible stream to `${apiBaseUrl}/v1/chat/completions`).
- **Image generation tool**: `careti-src/core/task/tools/handlers/GenerateImageToolHandler.ts` (Careti token + `/v1/generate/image`, saves outputs to workspace).
- **Image scope/registry**: `careti-src/core/task/images/*` (image attachment scope + registry snapshot persistence with size caps).
- **Image optimization**: `careti-src/utils/image-optimization.ts` (resize to 1024px max, webp conversion, reject >7500px).
- **Mention image sending**: `proto/careti/system.proto` (Get/Set/Resolve + Optimize), handlers in `src/core/controller/persona/*`, webview toggle `webview-ui/src/careti/components/MentionImageSendToggle.tsx`, mention attach helper `webview-ui/src/careti/utils/mention-image.ts`.
- **Provider config & models**: `src/shared/api.ts` (`ApiProvider` includes `careti`; static `caretModels`/`caretDefaultModelId`); CLI static definitions generated via `scripts/cli-providers.mjs` → `cli/pkg/generated/providers.go`.
- **Webview**: Account entry branching in `webview-ui/src/components/account/AccountView.tsx`; Careti account UI in `webview-ui/src/careti/components/CaretAccountView.tsx`; auth state/context in `webview-ui/src/context/CaretAuthContext.tsx` and `ExtensionStateContext.tsx`; Settings provider UI in `webview-ui/src/components/settings/providers/CaretiProvider.tsx` + `CaretModelPicker.tsx`; image helpers in `webview-ui/src/careti/utils/imageOptimization.ts` + `webview-ui/src/careti/shared/images/image-id.ts` (optimization delegates to backend gRPC).
- **CLI**: `cli/pkg/cli/auth/auth_caret_provider.go` (login, default model set from static list; org selection currently unavailable) uses generated provider definitions; `cli/cmd/cline/main.go` keeps Plan/Act flags while branding the command as `careti`.

## 🎯 Goals
- Keep Cline logic intact; branch to Careti account/provider at the entry points.
- Use Careti auth tokens for both account UI data and Careti provider chat calls.

## 🔧 Architecture & Flows
- **Account entry switch (webview-ui/src/components/account/AccountView.tsx)**  
  ```tsx
  {caretUser?.uid ? <CaretAccountView caretUser={caretUser} /> : clineUser?.uid ? <ClineAccountView /> : <AccountWelcomeView />}
  ```
- **Account data**: Webview gRPC → `CaretAccountServiceClient.*` → `CaretAccountService` → REST `${apiBaseUrl}/v1/profile/*` (balance/usage/profile).
- **Auth state**: `CaretAuthContext` subscribes to Careti auth stream; `CaretAuthService` refreshes tokens and exposes `getAuthToken()` for provider + image calls.
- **Provider selection**: Settings `CaretiProvider` + `CaretModelPicker` write `caretModelId`/`caretModelInfo` into `ExtensionStateContext` (plan/act mode fields).
- **Provider execution**: `src/core/api/index.ts` dispatches `"careti"` to `CaretHandler` (OpenAI SDK over `${apiBaseUrl}/v1` with Careti auth token and extra headers). Reasoning passthrough respects `shouldSkipReasoningForModel`.
- **Image outputs**: `generate_image` writes files under `<workspace>/.agents/generated-assets/`:
  - `.agents/generated-assets/<request_id>.<ext>` (image)
  - `.agents/generated-assets/<request_id>.md` (frontmatter + prompt + image link)
  - Image registry snapshots cap persisted data URLs to keep storage bounded (2MB per item, 6MB total).
- **Reference image inputs**: `reference_images` supports data URLs or workspace paths. Paths are resolved, optimized (resize + webp), and filtered by size (2MB per image, 6MB total).
- **Mention image inputs**: When enabled, @-mentioned image paths are resolved to data URLs and attached to the current message so the model can use them as references (order follows mention order; @a/@b map to attachment order). Optimization is delegated to backend gRPC.
- **Optimization flow**: Webview calls `OptimizeImageDataUrls` (gRPC) for uploads/mentions; tool handler applies the same optimization for workspace path references.
- **CLI parity**: `auth_caret_provider.go` uses static models from generated definitions, sets default model, and calls the same gRPC auth endpoints; Careti CLI keeps Plan/Act behavior with a `careti`-branded command.

## 🌐 API Surface (careti.ai)
- Base URL: `CaretEnv.config().apiBaseUrl` (production `https://api.careti.ai`).
- Auth: `GET /v1/auth/authorize`, `POST /v1/auth/token`, `POST /v1/auth/refresh`.
- Account/Profile: `GET /v1/profile/balance`, `GET /v1/profile/logs`, `GET /v1/profile/payments`, `GET /v1/auth/me`.
- Provider: OpenAI-compatible `POST /v1/chat/completions` (CaretHandler), uses Careti auth token and `X-AnyLLM-Key` header.
- Image tool: `POST /v1/generate/image` (streamed), uses Careti auth token.

## 🧩 Models (Careti provider)
- Static list: `src/shared/api.ts` (`caretModels`, `caretDefaultModelId`).
  - `gemini/gemini-3-pro-preview`
  - `gemini/gemini-3-flash-preview`
  - `gemini/gemini-2.5-pro`
  - `gemini/gemini-2.5-flash` (default)
- Frontend merges static + backend-provided models in `ExtensionStateContext` but currently uses the static map.
- CLI static definitions regenerated by `npm run cli-providers` (uses `scripts/cli-providers.mjs`); default model mirrors `caretDefaultModelId`.

## 🧪 Testing Checklist
1) Webview: F5 → Account tab → CaretAccountView renders with balance/usage/profile via gRPC.
2) Settings: Careti login button works; model picker lists Careti models; selected model stored per mode.
3) Provider: Send chat with Careti provider; verify `CaretHandler` uses Careti token and selected model, reasoning skip logic behaves.
4) Image tool: generate image and confirm `.agents/generated-assets/<request_id>.*` files are created and relative paths are shown in tool output.
5) Reference images: pass data URLs + workspace paths; confirm optimized webp payloads and size caps are respected.
6) Image registry: large data URLs do not bloat `image_registry.json` (oversized payloads are dropped on save).
7) CLI: `npm run cli-providers` (after model changes) and `npm run protos-go` if proto changes; `careti auth` → Careti login + default model applied.

## 🧭 Maintenance Notes
- Keep Cline logic untouched; route through `careti-src/**` where possible.
- When adding models, update `src/shared/api.ts` and regenerate CLI definitions (`npm run cli-providers`).
- Proto changes require `npm run protos` (TS) and `npm run protos-go` (Go) plus post-processing steps already scripted.

## 🔗 Related
- **F12 - Careti CLI**: careti 모드 강제 CLI에서 계정/프로바이더 흐름을 동일하게 사용.
- **F10 - Enhanced Provider Setup**: Careti 토큰을 활용한 provider 설정/모델 선택이 UI·CLI 양쪽에 일관 적용.
