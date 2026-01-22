# F15 - Document Read Tool

**Status**: ✅ Implemented
**Scope**: Core Task/Tool, Integrations, System Prompt
**Priority**: 🟡 Medium

---

## Overview

The `read_document` tool enables LLM to read various document files **by path only** - a Careti-exclusive feature.

### Careti vs Cline Comparison

| Feature | Cline | Careti |
|---------|-------|-------|
| PDF Reading | User attachment only | **LLM reads directly by path** |
| DOCX/XLSX Reading | User attachment only | **LLM reads directly by path** |
| HWPX (Korean Hangul) | Not supported | **Supported** |
| HWP 5.0 (Legacy Hangul) | Not supported | **Supported** |
| PPTX | Not supported | **Supported** |
| IPYNB | Not supported | **Supported** |

### Use Case

```
User: Analyze the docs/spec.pdf in this project
LLM: [uses read_document tool] → Extract PDF content → Provide analysis
```

---

## Supported Formats

| Format | Extension | Parser | Notes |
|--------|-----------|--------|-------|
| PDF | `.pdf` | pdf-parse | Existing Cline library |
| Word | `.docx` | mammoth | Existing Cline library |
| Excel | `.xlsx` | exceljs | Existing Cline library |
| PowerPoint | `.pptx` | Careti implementation | ZIP + XML parsing |
| Hangul (Modern) | `.hwpx` | Careti implementation | ZIP + XML parsing |
| Hangul (Legacy) | `.hwp` | @ohah/hwpjs | WASM-based, all OS supported |
| Jupyter | `.ipynb` | JSON parse | Existing Cline approach |

### Unsupported Formats (Detected with Helpful Error Messages)

| Format | Extension | Reason | Error Message Guidance |
|--------|-----------|--------|------------------------|
| PowerPoint 97-2003 | `.ppt` | OLE Compound Document binary format. No pure JS parser exists (SheetJS js-ppt attempted but parsing errors occurred) | Convert to .pptx using LibreOffice, Google Slides, or MS PowerPoint |
| Word 97-2003 | `.doc` | OLE Compound Document binary format. No pure JS parser exists | Convert to .docx using LibreOffice, Google Docs, or MS Word |
| Excel 97-2003 | `.xls` | OLE Compound Document binary format. No pure JS parser exists | Convert to .xlsx using LibreOffice, Google Sheets, or MS Excel |

> **Note**: LibreOffice as external dependency was considered but rejected due to VSCode plugin constraints - installation paths differ across OS (Windows/macOS/Linux) and we cannot force user installation.

---

## Core Data Flow

### Document Read Request

```
LLM → read_document(path="docs/spec.pdf")
    → ReadDocumentToolHandler.execute()
    → DocumentExtractor.extract()
    → Format-specific parser
    → Return text
```

### Tool Parameters

```typescript
interface ReadDocumentParams {
  path: string           // Document path (required, relative/absolute)
  task_progress?: string // Task progress (optional)
}
```

---

## Security

### Path Traversal Protection
- `path.normalize()`: Resolves `..` sequences
- `isLocatedInPath()`: Checks/logs workspace containment
- Extension validation: Only supported formats allowed

### File Size Limit
- Maximum 50MB (`DEFAULT_MAX_FILE_SIZE`)
- Clear error message on exceed

### Zip Slip Prevention
- HWPX/PPTX parsing accesses only fixed paths
  - HWPX: `Preview/PrvText.txt`, `Contents/section*.xml`
  - PPTX: `ppt/slides/slide*.xml`
- No disk extraction (memory-only processing)

### Approval Behavior
- **Read-only** operation, auto-approved
- Files outside workspace can be read (warning logged)

---

## File Map

### Tool Handler
- `careti-src/core/task/tools/handlers/ReadDocumentToolHandler.ts`
  - Implements `IFullyManagedTool` interface
  - Path validation, format detection, result extraction

### Document Extractor
- `careti-src/integrations/document/document-extractor.ts`
  - Unified parser management
  - File size limit enforcement

### Format-Specific Parsers
- `careti-src/integrations/document/hwpx-parser.ts`
  - HWPX (Hangul) ZIP structure text extraction
  - `Preview/PrvText.txt` priority, XML parsing fallback
- `careti-src/integrations/document/hwp-parser.ts`
  - HWP 5.0 (Legacy Hangul) binary parsing
  - Uses @ohah/hwpjs library (Rust→WASM)
- `careti-src/integrations/document/pptx-parser.ts`
  - PPTX slide `<a:t>` tag text extraction

### Type Definitions
- `careti-src/integrations/document/types.ts`
  - `DocumentFormat`, `ExtractOptions`, `ExtractResult`

### System Prompt
- `careti-src/core/prompts/system-prompt/tools/read_document.ts`
  - Tool description and parameter definitions

### Tests
- `careti-src/integrations/document/__tests__/`
  - `document-extractor.test.ts` (15 tests)
  - `hwpx-parser.test.ts` (7 tests)
  - `hwp-parser.test.ts` (6 tests) - HWP 5.0 parsing
  - `pptx-parser.test.ts` (9 tests)
  - `ppt-parser.test.ts` (3 tests) - Legacy PPT detection and error messages

---

## Dependencies & Open Source Licenses

### Libraries Used

| Library | Version | License | Purpose | Repository |
|---------|---------|---------|---------|------------|
| pdf-parse | ^1.1.1 | MIT | PDF text extraction | [github.com/modesty/pdf-parse](https://github.com/modesty/pdf-parse) |
| mammoth | ^1.8.0 | BSD-2-Clause | DOCX text extraction | [github.com/mwilliamson/mammoth.js](https://github.com/mwilliamson/mammoth.js) |
| exceljs | ^4.4.0 | MIT | XLSX text extraction | [github.com/exceljs/exceljs](https://github.com/exceljs/exceljs) |
| jszip | ^3.10.1 | MIT/GPLv3 dual | HWPX/PPTX ZIP parsing | [github.com/Stuk/jszip](https://github.com/Stuk/jszip) |
| @ohah/hwpjs | latest | MIT | HWP 5.0 parsing (WASM) | [npmjs.com/package/@ohah/hwpjs](https://www.npmjs.com/package/@ohah/hwpjs) |

### Reference Projects (Code Not Directly Used)

These projects were referenced for understanding document structures:

| Project | License | Reference | Repository |
|---------|---------|-----------|------------|
| MarkItDown | MIT (Microsoft) | Document→Markdown conversion concept | [github.com/microsoft/markitdown](https://github.com/microsoft/markitdown) |
| pypandoc-hwpx | MIT | HWPX document structure understanding | [github.com/msjang/pypandoc-hwpx](https://github.com/msjang/pypandoc-hwpx) |

---

## ✅ Implementation Status

**All document formats implementable with pure JavaScript/WASM are now supported.**

| Category | Supported Formats | Implementation |
|----------|-------------------|----------------|
| PDF | `.pdf` | pdf-parse (Node.js) |
| Microsoft Office (Modern) | `.docx`, `.xlsx`, `.pptx` | mammoth, exceljs, ZIP+XML |
| Hangul (Modern/Legacy) | `.hwpx`, `.hwp` | ZIP+XML, @ohah/hwpjs (WASM) |
| Jupyter | `.ipynb` | JSON parse |

---

## ⚠️ Known Limitations

### 1. Legacy Binary Formats Not Supported

| Format | Reason | Libraries Attempted | Result |
|--------|--------|---------------------|--------|
| `.ppt` | OLE Compound Document | SheetJS js-ppt, ole-doc | Parsing errors |
| `.doc` | OLE Compound Document | No pure JS library exists | - |
| `.xls` | OLE Compound Document | No pure JS library exists | - |

**Alternatives Evaluated:**
- **LibreOffice headless**: Different installation paths per OS, cannot force user installation
- **LibreOffice WASM**: Still experimental, hundreds of MB - unsuitable for plugin
- **Python bridge**: Requires Python runtime, increases external dependencies

→ **Conclusion**: `.ppt`, `.doc`, `.xls` files are detected and shown friendly error messages with conversion guidance.

### 2. No Image/Chart Content
- Images and charts within documents cannot be converted to text
- Text content only extraction

### 3. Complex Layouts
- Tables, multi-column layouts converted to plain text
- Original formatting lost

---

## Cline Merge Guide

### No-Conflict Files (Careti-only)
- All files under `careti-src/`
- `read_document` related code

### Files Requiring Attention
- `src/core/task/ToolExecutor.ts` - Handler registration
- `src/shared/tools.ts` - `READ_DOCUMENT` enum addition
- `src/shared/ExtensionMessage.ts` - `"readDocument"` type addition
- `src/core/prompts/system-prompt/tools/init.ts` - variants registration
- `src/core/prompts/system-prompt/tools/index.ts` - export addition

---

**Last Updated**: 2026-01-16
**Document Version**: v1.3 (HWP 5.0 support added, legacy format error messages with conversion guidance, implementation status clarified)
