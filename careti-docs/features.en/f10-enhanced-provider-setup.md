# F10 - Enhanced Provider Setup

**Status**: ✅ Phase 2 | **Scope**: Backend (controller/gRPC), Webview (settings/UI) | **Priority**: 🔴 High

## 📋 Overview
Automates AI provider setup: fetches model lists (LiteLLM, BizRouter), validates connectivity up front, and presents user-friendly dropdowns instead of manual model typing. The Careti CLI consumes the same provider metadata via generated definitions, and the Careti-branded CLI enables an expanded provider list.

## 🆚 Improvements vs Cline
| Area | Cline | Careti |
| --- | --- | --- |
| Model setup | Manual IDs | **Auto fetch** with one click |
| Validation | Fail at use time | **Real-time checks** during setup |
| Filtering | None | **Health-based filtering** for LiteLLM |
| Extensibility | Limited | gRPC-based plugin pattern (e.g., BizRouter) |

## 🏗 Code Scope
- **Backend**: `careti-src/core/controller/fetchLiteLlmModels.ts` (health + available intersection), `FetchBizRouterModels.ts`; RPCs in `proto/careti/system.proto`.
- **Webview**: `LiteLlmProvider.tsx`, `BizRouterProvider.tsx` with fetch buttons and dropdowns; `NaverCloudProvider.tsx` for API key + model picker.
- **Tests**: `fetchLiteLlmModels.test.ts` (unit) and `.integration.test.ts` (env-based).
- **i18n**: `providers.litellm.*` keys across en/ko/ja/zh in settings.json.
- **CLI provider metadata**: `scripts/cli-providers.mjs` → `cli/pkg/generated/providers.go`, consumed by `cli/pkg/cli/auth/models_list_static.go` and `cli/pkg/cli/auth/models_careti.go`.

## 🎯 Current Capabilities
| Provider | Auto models | Validation | Advanced setup | Status |
| --- | --- | --- | --- | --- |
| LiteLLM | ✅ | ✅ | ✅ Health-based | Done |
| BizRouter | ✅ | ✅ | ❌ Simplified | Done |
| ZAI (GLM-4.7) | ✅ | ✅ | ✅ Thinking + Coding | Done |
| Upstage (Solar) | ❌ Static list | ✅ | ❌ Simplified | Done |
| NAVER CLOUD (HyperCLOVA X) | ❌ Static list | ✅ | ✅ Thinking (HCX-007) | Done |

## 🔧 Architecture & Flow
- gRPC services exposed via `CaretSystemService` (`FetchLiteLlmModels`, `FetchBizRouterModels`).
- LiteLLM flow: validate base URL → `/health` for healthy endpoints → `/v1/models` → intersection + normalization (`ollama_chat/` prefix removed, `:` → `-`).
- UI: fetch button shows loading/error states, populates dropdown, and stores the chosen model/provider in settings.

## 🌐 Internationalization
Provider labels/descriptions live under `providers.{id}.*` within `settings` namespace; 4 languages supported (e.g., `providers.naver-cloud.*`).

## 🧪 Testing
- Unit: normalization, filtering, error handling.
- Integration: live server hits (requires env vars) for health + models.
- Manual: validate dropdown population, failure messages, and saved settings.
- CLI: confirm provider list + static models align with `cli/pkg/generated/providers.go` after running `npm run cli-providers`.

## 🚀 UX Improvements
- One-click discovery instead of manual model strings.
- Instant feedback when API keys/URLs are invalid.
- Shows only models that pass health checks (LiteLLM) to reduce runtime errors.

## 🔮 Extensibility
- Add new providers by implementing a fetch controller, defining RPC in `system.proto`, and wiring a settings component under `providers/`.

## 🔗 Related
- **F12 - Careti CLI**: CLI BYO/LiteLLM 옵션을 동일한 기본값/검증 흐름으로 사용.
- **F05 - Careti Account**: Careti 계정/토큰을 사용하는 provider 설정 시 UI·CLI 모두 동일 데이터 소스를 공유.
