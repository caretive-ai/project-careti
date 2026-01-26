---
description: Update documentation for minor version releases (0.4.x)
argument-hint: "[version]"
---

# Minor Version Update

Update documentation and changelogs for Caret minor version releases.

## When to Use
- Minor version update deployment (e.g., 0.4.5 → 0.4.6)
- README/CHANGELOG/docs updates needed

## Workflow

### Step 1: Analyze Git Changes
```bash
# Check commits since last version tag
git log --oneline $(git describe --tags --abbrev=0)..HEAD

# List changed files
git diff --name-only $(git describe --tags --abbrev=0)..HEAD
```

### Step 2: User Confirmation (Required)

**AI must confirm with user before proceeding:**

| Document Type | Files | Characteristics |
|--------------|-------|-----------------|
| **User-facing** | README, docs.careti.ai, announcement | Appeal to users, key features only |
| **Developer** | CHANGELOG.md | Actual log, all changes |

**Questions to ask:**
1. Add to previous version content OR overwrite?
2. Exclude minor changes (bugfixes, link updates)?
3. Include in announcement?

### Step 3: Update Rules by Document Type

**User-facing (README, docs, announcement):**
- Increment version, **add** to previous content
- **Exclude** minor changes (bugfixes, refactoring)
- Include only **impactful features**

**Developer (CHANGELOG.md):**
- **Keep** previous versions, **add** new on top
- Include **all** changes
- Record with date

### Step 4: Files to Update

**README.md:**
- `[v0.4.x Update]` banner text
- `## 🎉 v0.4.x` section

**docs.careti.ai (7 languages):**
```
docs-ko/getting-started/what-is-careti.mdx
docs-en/getting-started/what-is-careti.mdx
docs-ja/getting-started/what-is-careti.mdx
docs-zh/getting-started/what-is-careti.mdx
docs-fr/getting-started/what-is-careti.mdx
docs-de/getting-started/what-is-careti.mdx
docs-ru/getting-started/what-is-careti.mdx
```

**announcement (optional):**
```
webview-ui/src/caret/locale/*/announcement.json
```

### Step 5: Version Header Translations

| Language | Header |
|----------|--------|
| ko | `## 🎉 v0.4.y 업데이트` |
| en | `## 🎉 v0.4.y Update` |
| ja | `## 🎉 v0.4.y アップデート` |
| zh | `## 🎉 v0.4.y 更新` |
| fr | `## 🎉 Mise à jour v0.4.y` |
| de | `## 🎉 v0.4.y Update` |
| ru | `## 🎉 Обновление v0.4.y` |

## NOT Required
- package.json version (changed separately during deployment)
