---
description: Generate support model list and update documentation
argument-hint: "[--readme-only]"
---

# Update Model List

Automatically generate Caret's support model list and update related documentation.

## When to Use
- When new API providers or models are added to `src/shared/api.ts`
- When provider/model counts need to be updated in README or docs
- When support model list documents need to be regenerated

## Workflow

### 1. Run Script
```bash
node careti-scripts/build/generate-support-model-list.js
# Or use npm script
npm run models:generate
```

### 2. Verify Output
```
📊 Extracted data:
   🔹 Providers: 30
   🔹 Total models: 349
   🔹 Unique models: 266
   🔹 Model sections: 30
```

### 3. Update README Files
Update provider/model counts in these files:
- `README.md`
- `careti-docs/readme-i18n/README.ko.md`
- `careti-docs/readme-i18n/README.ja.md`
- `careti-docs/readme-i18n/README.zh-cn.md`
- `careti-docs/readme-i18n/README.fr.md`
- `careti-docs/readme-i18n/README.de.md`
- `careti-docs/readme-i18n/README.ru.md`

### Text Patterns
- English: `{N} providers, {M} models`
- Korean: `{N}개 프로바이더, {M}개 모델`
- Japanese: `{N}プロバイダー、{M}モデル`
- Chinese: `{N}个提供商，{M}个模型`

## Output Files
- `careti-docs/development/support-model-list.mdx` (Korean)
- `careti-docs/development/support-model-list.en.mdx` (English)

## Key Files
| File | Purpose |
|------|---------|
| `careti-scripts/build/generate-support-model-list.js` | Generator script |
| `src/shared/api.ts` | Data source |
