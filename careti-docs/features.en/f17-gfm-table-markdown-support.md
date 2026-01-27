# F17 - GFM Table and Extended Markdown Support

**Status**: ✅ v0.4.7 | **Scope**: Webview | **Priority**: 🟡 Medium

## 📋 Overview

Enables rendering of GitHub Flavored Markdown (GFM) tables, strikethrough, and other extended markdown syntax in ChatRow and CompletionOutputRow components.

### Difference from Cline
- **Cline (ref-cline)**: No GFM table support - displays as raw text
- **Careti**: Supports GFM tables, strikethrough, checkboxes, etc.

## ✅ Why It Matters

- **Improved Readability**: Structured display when AI responses contain tables
- **Better Information Delivery**: Clear visual presentation of comparison tables, option lists
- **Developer Experience**: Standard markdown syntax support

---

## 🔧 Supported Features

### GFM Tables

```markdown
| Name | Age | Job |
|------|-----|-----|
| John | 25 | Developer |
| Jane | 30 | Designer |
```

**Rendered Result:**

| Name | Age | Job |
|------|-----|-----|
| John | 25 | Developer |
| Jane | 30 | Designer |

### Table Alignment

```markdown
| Left Align | Center Align | Right Align |
|:-----------|:------------:|------------:|
| Left | Center | Right |
```

- `:---` - Left align
- `:---:` - Center align
- `---:` - Right align

### Strikethrough

```markdown
~~deleted text~~
```

**Rendered Result:** ~~deleted text~~

---

## 🛠️ Technical Implementation

### Dependencies

```json
{
  "remark-gfm": "^1.0.0"
}
```

> **Version Selection Reason**: `react-remark@2.1.0` uses `micromark@2.x`, so `remark-gfm@1.0.0` (compatible with micromark@~2.9.0) must be used.

### Related Files

| File | Description |
|------|-------------|
| `webview-ui/package.json` | remark-gfm dependency |
| `webview-ui/src/components/common/MarkdownBlock.tsx` | remarkGfm plugin and table CSS |
| `webview-ui/src/components/common/__tests__/MarkdownBlock.test.tsx` | Unit tests |

### Code Changes

```typescript
// MarkdownBlock.tsx
import remarkGfm from "remark-gfm"

const [reactContent, setMarkdown] = useRemark({
  onError: (error: Error) => {
    console.error("[MarkdownBlock] Markdown parsing error:", error)
  },
  remarkPlugins: [
    remarkGfm as any,  // GFM table, strikethrough support
    // ... other plugins
  ],
})
```

### CSS Styles

```css
table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

th, td {
  border: 1px solid var(--vscode-editorGroup-border);
  padding: 8px 12px;
  text-align: left;
}

th {
  background-color: var(--vscode-editor-background);
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: var(--vscode-list-hoverBackground);
}

del {
  text-decoration: line-through;
  opacity: 0.7;
}
```

---

## 🧪 Testing

```bash
cd webview-ui
npm test -- --run src/components/common/__tests__/MarkdownBlock.test.tsx
```

### Test Cases

| Test | Description |
|------|-------------|
| Basic table rendering | Verify 3-column table renders |
| Aligned table | Verify left/center/right alignment |
| Regular markdown compatibility | Verify existing markdown works |
| Empty markdown handling | Verify no errors on empty input |
| GFM strikethrough rendering | Verify `~~text~~` → `<del>` conversion |

---

## ⚠️ Cautions

### Version Compatibility

Be careful when selecting `remark-gfm` version:

| remark-gfm | micromark | react-remark compatible |
|------------|-----------|------------------------|
| v4.x | v3.x | ❌ No |
| v3.x | v3.x | ❌ No |
| **v1.x** | **v2.x** | ✅ Yes |

### Development Mode Cache

After dependency changes with Vite dev server:
1. Delete `node_modules/.vite`
2. Delete `.vite-port` file
3. Fully restart VS Code

---

## 📚 References

- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [react-remark](https://github.com/remarkjs/react-remark)
