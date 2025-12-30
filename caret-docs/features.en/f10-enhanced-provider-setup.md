# F10 - Enhanced Provider Setup

**Status**: ✅ Phase 2 | **Scope**: Backend (controller/gRPC), Webview (settings/UI) | **Priority**: 🔴 High

## 📋 Overview
Automates AI provider setup: fetches model lists (LiteLLM, BizRouter), validates connectivity up front, and presents user-friendly dropdowns instead of manual model typing.

## 🆚 Improvements vs Cline
| Area | Cline | Caret |
| --- | --- | --- |
| Model setup | Manual IDs | **Auto fetch** with one click |
| Validation | Fail at use time | **Real-time checks** during setup |
| Filtering | None | **Health-based filtering** for LiteLLM |
| Extensibility | Limited | gRPC-based plugin pattern (e.g., BizRouter) |

## 🏗 Code Scope
- **Backend**: `caret-src/core/controller/fetchLiteLlmModels.ts` (health + available intersection), `FetchBizRouterModels.ts`; RPCs in `proto/caret/system.proto`.
- **Webview**: `LiteLlmProvider.tsx`, `BizRouterProvider.tsx` with fetch buttons and dropdowns; `NaverCloudProvider.tsx` for API key + model picker.
- **Tests**: `fetchLiteLlmModels.test.ts` (unit) and `.integration.test.ts` (env-based).
- **i18n**: `providers.litellm.*` keys across en/ko/ja/zh in settings.json.

## 🎯 Current Capabilities
| Provider | Auto models | Validation | Advanced setup | Status |
| --- | --- | --- | --- | --- |
| LiteLLM | ✅ | ✅ | ✅ Health-based | Done |
| BizRouter | ✅ | ✅ | ❌ Simplified | Done |
| [Naver Cloud](https://clova.ai/) | ✅ (built-in list) | ✅ (API key required) | ❌ | Done |

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

## 🚀 UX Improvements
- One-click discovery instead of manual model strings.
- Instant feedback when API keys/URLs are invalid.
- Shows only models that pass health checks (LiteLLM) to reduce runtime errors.

## 🔮 Extensibility
- Add new providers by implementing a fetch controller, defining RPC in `system.proto`, and wiring a settings component under `providers/`.

## 🔗 Related
- **F12 - Caret CLI**: CLI BYO/LiteLLM 옵션을 동일한 기본값/검증 흐름으로 사용.
- **F05 - Caret Account**: Caret 계정/토큰을 사용하는 provider 설정 시 UI·CLI 모두 동일 데이터 소스를 공유.
