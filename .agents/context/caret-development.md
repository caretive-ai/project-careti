# Caret Development - Quick Reference

**Purpose**: Systematic Caret development workflow with TDD, document-driven approach, and Cline file safety measures.

**When to use**: Any Caret project development - features, fixes, refactoring, architecture changes.

## Core Principles

1. **Document-Driven**: Identify work nature → Check mandatory docs → Follow patterns
2. **TDD Cycle**: RED (integration test) → GREEN (minimal code) → REFACTOR (improve quality)
3. **Cline Safety**: L1 (independent) > L2 (conditional) > L3 (direct modification)
4. **i18n Consistency**: Feature-based namespaces, never include namespace in key

## Quick Workflow

**1. Pre-Development Analysis**
- [ ] Identify work type (Frontend-Backend / Cline Mod / Component / Testing)
- [ ] Check mandatory docs per work type
- [ ] Verify required patterns and constraints

**2. TDD Implementation**
- [ ] RED: Write failing integration test (type에 따라 위치가 다름: `src/test/**` 또는 `webview-ui/src/**`)
- [ ] GREEN: Minimal implementation (add `// CARET MODIFICATION:` if touching Cline files)
- [ ] REFACTOR: Improve code quality while tests pass

**3. Verification**
- [ ] `npm run test:unit`, `npm run test:integration`, `npm run test:webview`
- [ ] `npm run compile`, `npm run check-types`, `npm run lint`
- [ ] Manual test: `npm run watch` (F5 in VSCode)
- [ ] Verify Cline original functionality intact

**4. Documentation**
- [ ] Update relevant guides if new patterns discovered
- [ ] Add examples to development docs
- [ ] Update work logs with findings

## CLI npm Publish (Quick Checklist)
- [ ] Bump versions in `cli/package.json` and `cli-caret/package.json` (keep in sync)
- [ ] Build standalone bundle: `npm run compile-standalone-npm`
- [ ] Export token: `set -a; source .env; set +a`
- [ ] Publish: `bash cli-caret/scripts/publish-caret-cli.sh`
- [ ] Remove token file: `rm -f cli-caret/.npmrc`
- [ ] Verify: `npm view @caretive/caret-cli version` and `caret version`

## Mandatory Docs by Work Type

**Cline Modification**: Backup + `// CARET MODIFICATION:` comment requirements
**Frontend-Backend**: Interaction patterns, architecture guide (sections 10-11)
**Component/UI**: Component principles, theme integration, i18n patterns
**Testing**: TDD protocols, testing guide, Vitest mocking patterns

## i18n Guidelines

**Namespace Rules**:
- Feature-based: Each feature has its own JSON (`common.json`, `settings.json`)
- Never include namespace in key name

**Usage**:
```typescript
// ✅ Correct
t('providers.openrouter.name', 'settings')
t('button.save', 'common')

// ❌ Wrong
t('settings.providers.openrouter.name')
```

**Dynamic Pattern** (language switching):
`useMemo(() => getFunction(), [language])`

---

**📖 For detailed workflow with verification steps:**
See `.agents/context/workflows/caret-development.md`

**📖 For Korean developer documentation:**
See `caret-docs/development/caret-development.md` (if exists)
