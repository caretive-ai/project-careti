# F17 - GFM Table Markdown Support

**Status**: ✅ Implemented
**Implementation Date**: 2026-01-26
**Impact**: Webview UI, Message Rendering
**Priority**: 🟡 Medium

---

## Overview

GitHub Flavored Markdown (GFM) support for AI responses. Tables and strikethrough text are rendered in a structured format instead of raw text.

## Cline vs Careti Comparison

| Feature | Cline (Original) | Careti (Improved) |
|---------|------------------|-------------------|
| Table Rendering | Raw text (pipes visible) | **Structured HTML table** |
| Strikethrough | Not supported | **~~text~~ rendered** |
| Code Blocks | Supported | Supported |
| Lists | Supported | Supported |

---

## Benefits

1. **Comparison Tables**: AI responses with comparison tables are visually clear
2. **Option Lists**: Feature comparisons, pros/cons rendered properly
3. **Better Readability**: No more interpreting raw pipe characters

## Implementation

- Uses `remark-gfm` plugin for parsing
- Integrated with existing markdown renderer
- Minimal performance overhead

---

## Examples

### Table Rendering

**Input:**
```markdown
| Model | Speed | Quality |
|-------|-------|---------|
| Claude | Fast | High |
| GPT | Medium | High |
```

**Cline Output:** Raw text with pipes
**Careti Output:** Formatted HTML table

### Strikethrough

**Input:** `~~deprecated~~`
**Careti Output:** ~~deprecated~~
