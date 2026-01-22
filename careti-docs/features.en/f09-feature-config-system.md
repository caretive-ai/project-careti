# F09 - Feature Config System

**Status**: ✅ Phase 2 | **Scope**: Backend (controller/storage), Webview (settings/UI) | **Priority**: 🔴 High

## 📋 Overview
Dynamic feature flags for white-label builds (Careti B2C, CodeCenter B2B, etc.). Combines compile-time JSON defaults with runtime delivery to toggle features like account, persona, providers, and cost display.

## 🆚 Improvements vs Cline
| Area | Cline | Careti |
| --- | --- | --- |
| Feature control | Hardcoded | **Dynamic flags** via JSON |
| Environments | Single | **Multi-environment** (Careti/CodeCenter) |
| Delivery | None | Backend injects config into webview on init |

## 🏗 Code Scope
- **Definition**: `careti-src/shared/FeatureConfig.ts`, values in `careti-src/shared/feature-config.json` (replaceable at build time).
- **Backend**: `src/core/controller/index.ts` posts `featureConfig` to webview; `StateManager` + `state-helpers` apply defaults (`defaultModeSystem`, `defaultProvider`); `ExtensionMessage.ts` adds `featureConfig` to state.
- **Webview**: `ExtensionStateContext` stores config; `CaretGeneralSettingsSection`, `AccountWelcomeView`, `ApiOptions`, `FeatureSettingsSection`, `ChatRow`, `TaskHeader` consume flags.

## 🎛️ Controllable Flags (examples)
- `enableCaretAccountFeatures` (runtime) – show Careti account flows. 
- `showPersonaSettings` (runtime) – show persona UI. 
- `defaultPersonaEnabled` (first-run) – initial persona toggle. 
- `redirectAfterApiSetup` – `persona` or `home` after setup. 
- `defaultModeSystem` (first-run, stored in `globalState`). 
- `firstListingProvider`, `defaultProvider`, `showOnlyDefaultProvider`, `showCostInformation`.

## 🔄 How It Works
- **Runtime flags**: loaded from `feature-config.json` each time, sent via `postStateToWebview`, used for conditional rendering (`enableCaretAccountFeatures`, `showPersonaSettings`, `showOnlyDefaultProvider`, `showCostInformation`, `firstListingProvider`).
- **First-run flags**: applied once then persisted in `globalState` (`defaultModeSystem`, `defaultProvider`, `defaultPersonaEnabled`).

## 🔧 Configuration
- **Default (built-in)**: fully enabled Careti experience.
- **Custom**: override `careti-src/shared/feature-config.json` (e.g., enterprise build disabling account/persona, forcing `cline` mode, showing only default provider).
- **Runtime override**: settings UI reads `featureConfig` from `ExtensionState` and hides/shows sections accordingly.

## ⚠️ Notes
- `showPersonaSettings` (brand flag) vs `enablePersonaSystem` (user preference) are separate; combine both before rendering persona features.
- Oct 30 change: clarified runtime vs first-run behavior and required `globalState` persistence for initial defaults.
- Avoid static imports of config in UI; always consume from `ExtensionState` to honor runtime changes.

## 🧪 Tests & Deployment
- Verify compile + `postStateToWebview` includes `featureConfig` and UI toggles respond. 
- Scenarios: account features off, persona UI off, provider list restricted, cost info toggle, default mode/provider respected after restart.
- Deployment: ship with default config or include customized `feature-config.json`; ensure packaging copies the chosen file.

## 🔮 Extensibility
- Add new flags by extending `FeatureConfig` + JSON + controller/webview wiring. 
- Supports adding new modes/providers for future white-label variants.
