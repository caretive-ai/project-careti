# Multilingual i18n System

Caret’s i18n layer supports Korean, English, Japanese, and Chinese with a lightweight, custom implementation in `@/caret/utils/i18n.ts` (no `react-i18next`) for performance and project-specific needs such as Korean postposition handling.

## 📋 Feature Overview

### Supported Languages
- 🇰🇷 **Korean (ko)**: fully localized (postpositions handled)
- 🇺🇸 **English (en)**: base language and fallback
- 🇯🇵 **Japanese (ja)**: supported
- 🇨🇳 **Chinese (zh)**: supported

### Namespace Principles
Each major view/feature owns its own namespace JSON file for maintainability.

| Namespace | Purpose | Key pattern |
| --- | --- | --- |
| **common** | Shared UI elements | `button.save`, `error.generic` |
| **chat** | Chat screen | `chat.placeholder.default` |
| **welcome** | Welcome page | `welcome.greeting`, `welcome.coreFeatures.header` |
| **settings** | Settings page | `settings.tabs.api`, `settings.browser.title` |
| **history** | Task history | `history.title`, `history.searchPlaceholder` |
| ... | Other features | `{namespace}.{group}.{key}` |

### Shared Component Namespace Rule
Shared components (e.g., `ModelInfoView` used in welcome + settings) must sit in the correct namespace.

- ✅ `ModelInfoView`: `t("modelInfoView.tokensSuffix", "common")`
- ✅ `ApiKeyField`: `t("apiKeyField.*", "settings")`

### Duplicate JSON Keys (fixed)
- ✅ `common.json` had two `apiKey` blocks in every locale; merged into a single block to restore `getYourKeyAn`/`getYourKeyA`.

### Need to Slim `common.json`
Issues: 740+ lines, mixed concerns, violates namespace principles.  
Recommended:
1. Split by feature (`apiOptions`, `providers`, `modelInfo`, etc.).  
2. Keep only truly shared UI (`button`, `error`, `validation`) in `common.json`.  
3. Add new keys to the correct namespace going forward.

### Provider Key Unification
Provider-related strings live under `settings.providers.{providerId}.*`.

### Provider ID vs JSON Key Case
Backend provider IDs are kebab-case; frontend JSON keys currently follow the same kebab-case.

| Item | Case | Example | Location |
| --- | --- | --- | --- |
| **Provider ID** (Backend) | kebab-case | `vercel-ai-gateway`, `qwen-code` | `src/shared/proto-conversions/` |
| **JSON key** (Frontend) | kebab-case (current) | `vercel-ai-gateway`, `qwen-code` | `webview-ui/src/caret/locale/` |

- ❌ Wrong: `t('providers.vercelAiGateway.description', 'settings')`  
- ✅ Correct: `t('providers.vercel-ai-gateway.description', 'settings')`

AS-IS mixed pattern to avoid:
```typescript
t('providers.openrouter.description', 'settings')
t('openRouterProvider.apiKeyLabel', 'settings')
```
TO-BE unified pattern:
```typescript
t('providers.openrouter.apiKeyLabel', 'settings')
t('providers.caret.login', 'settings')
```

### Model Picker Namespace Standard
All model picker strings go under `providers.{providerId}.modelPicker.{key}`.

- ✅ Applied: OpenRouter (`openRouterModelPicker.*` → `providers.openrouter.modelPicker.*`)
- Pending: Ollama and other providers to follow the same pattern.

## 🏗️ System Architecture

### File Layout
```
webview-ui/src/caret/
├── locale/                  # JSON per language (en/ko/ja/zh)
├── utils/
│   └── i18n.ts              # Core i18n utility
├── hooks/
│   └── useCaretI18n.ts      # React hook
└── context/
    └── CaretI18nContext.tsx # Context provider
```

### Core APIs

**1) Translation helper `t`**
```typescript
t(key, namespace, options?)
```
Standard usage (namespace is the second argument):
```typescript
import { t } from "@/caret/utils/i18n"

t("button.save", "common")
t("settings.modeSystem.label", "settings")
t("providers.caret.name", "settings")
t("message.welcome", "common", { user: "Luke" })

// Korean postposition helper
t("brand.appName|을", "common", {}, "ko")   // → "Caret을"
```

Wrong pattern to avoid (namespace baked into key):
```typescript
t("settings.modeSystem.label")   // ❌
t("common.button.save")          // ❌
```

**2) React Hook `useCaretI18n`**
```typescript
import { useCaretI18n } from "@/caret/hooks/useCaretI18n"

function MyComponent() {
    const { t, currentLanguage, changeLanguage } = useCaretI18n()

    return (
        <div>
            <h1>{t("welcome.title", "welcome")}</h1>
            <button onClick={() => changeLanguage("ko")}>Switch to Korean</button>
        </div>
    )
}
```

### Korean Postpositions
The system supports natural Korean particles (postpositions) so strings stay grammatically correct. (Currently implemented without `ko-postposition`; can be extended.)

## 🧪 Testing & Validation

### Manual
1) Run `npm run watch` and visually confirm translations.  
2) Switch language in settings and ensure live UI updates.

### Automated
- **Namespace check**: `npm run report:i18n-namespace`
- **Missing keys**: `npm run report:i18n-keys`
- **Unused keys**: `node caret-scripts/tools/report-i18n-unused-key.js`
- **Sync keys**: `npm run sync:i18n-keys` or `node caret-scripts/tools/i18n-key-synchronizer.js`
- **Full sync (delete unused)**: `node caret-scripts/tools/i18n-key-synchronizer.js --delete-unused`
- **Remove unused keys**: `node caret-scripts/tools/remove-i18n-unused-keys.js`
- **Analysis**: `caret-scripts/i18n-checklist-report.md`, `node caret-scripts/tools/find-existing-i18n-key.js`

`i18n-key-synchronizer` behavior:
- Uses English as master; copies English values for missing keys.
- `--delete-unused` removes keys that do not exist in English.

## 🔄 Translation Workflow

1. Pick the correct namespace; create `{namespace}.json` if needed.  
2. Add English source strings in `webview-ui/src/caret/locale/en/`.  
3. Add the same keys to `ko/ja/zh`.  
4. Register new namespaces in `translations` + `loadLanguagePack` in `i18n.ts` (most common mistake).  
5. Use in code: `t("your.key", "your_namespace")`.

## ⚠️ Static Translation Pitfall

Problem: calling `t()` at module load time locks the translation to the initial language.

```typescript
// ❌ Static constants
export const SETTINGS_TABS = [
  { id: "general", name: t("tabs.general.name", "settings") }
]
```

Solution: convert to functions + include language in dependencies.
```typescript
export const getSettingsTabs = (): SettingsTab[] => [
  { id: "general", name: t("tabs.general.name", "settings") }
]

function SettingsView() {
  const { language } = useCaretI18nContext()
  const settingsTabs = useMemo(() => getSettingsTabs(), [language])
}
```

Applied fixes:
- ✅ `AutoApproveBar`: constants → functions  
- ✅ `SettingsView`: `SETTINGS_TABS` → `getSettingsTabs()`  
- ✅ `ApiOptions`: added `[language]` dependency to `useMemo` for `providerOptions`

Missing dependency pattern to avoid:
```typescript
// ❌ language missing
useMemo(() => [{ value: "anthropic", label: t("providers.anthropic", "settings") }], [])

// ✅ language-aware
useMemo(() => [{ value: "anthropic", label: t("providers.anthropic", "settings") }], [language])
```

## 🔧 Recent Updates (2025-09-18)

### Announcement component & version display
- ✅ Show full `version` (not `minorVersion`)  
- ✅ Load announcements dynamically from i18n files  
- ✅ Flexible structure regardless of item count  
- ✅ Rename `.desc` → `-desc` keys to avoid hierarchy conflicts

### Changelog alignment (4 languages)
- ✅ v0.2.21 aligned across en/ko/ja/zh (based on Korean source)  
- ✅ Persona section structured as Bug Fix / Feature Enhancement / UX Improvement  
- ✅ Included fixes for `asset:/` URI handling, initial setup flow, UI polish

### announcement.json structure
- ✅ Unified `header`, `previousHeader`, `bullets.current/previous` layout  
- ✅ Key naming `1-desc`, `2-desc`, ... to avoid dot-as-hierarchy issues  
- ✅ Content synced across four languages

### i18n key naming rule
- Use `-desc` instead of `.desc` to prevent unintended nesting.  
  ```typescript
  const title = t(`bullets.current.${i}`, "announcement")
  const desc = t(`bullets.current.${i}-desc`, "announcement")
  ```

### Prior fixes (2025-09-16)
- ✅ OpenRouter: `openRouterProvider.*` → `providers.openrouter.*`; `openRouterModelPicker.*` → `providers.openrouter.modelPicker.*` (all locales, TS refs updated)  
- ✅ Caret provider cleanup: removed improper privacy text; restored missing keys; ensured consistency across four languages  
- ✅ ApiKeyField: corrected namespace to `t("apiKeyField.*", "settings")`  
- ✅ Duplicate `apiKey` blocks removed from every `common.json`

### Prior fixes (2025-09-10)
- ✅ Removed hardcoded English in `welcome.json` across all locales  
- ✅ `modelInfoView.tokensSuffix` namespace aligned to `common` so “/million tokens” renders correctly

### Limitations
- Backend hardcoded strings (e.g., `src/shared/api.ts` model descriptions) remain untranslated; full backend/frontend i18n unification is out of scope for now.

## 🔮 Roadmap

### Short Term
- [ ] Migrate remaining providers to `providers.{id}.*` (Ollama, Anthropic, Bedrock, etc.)  
- [ ] Detect other duplicate keys; finish provider i18n (vsCodeLm, Vertex, LiteLLM, claudeCode, SAP AI Core, Cerebras, …)  
- [ ] Slim `common.json`; split `apiOptions`, `providers`, etc., into their own namespaces  
- [ ] Full consistency check and missing translations sweep

### Long Term (Architecture)
- [ ] Keep provider ID casing aligned as kebab-case across backend/frontend. If a casing change is ever required, plan a full migration with an ID-mapping layer.

### Tooling Improvements
- [ ] Auto-detect duplicate keys inside JSON files  
- [ ] Verify namespace usage in code vs actual file locations  
- [ ] Validate provider structures follow the standard schema

---
**Doc status**: up to date as of 2025-09-16
