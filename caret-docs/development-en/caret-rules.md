# Caret Development Rules (English)

## Rule Management System

### Document Access Pattern
- **AI reads**: `.caretrules/caret-rules.json` (English JSON, core principles only)
- **AI workflows**: `.caretrules/workflows/*.md` (English MD, detailed procedures when needed)
- **Human reads (Korean)**: `caret-docs/development/caret-rules.ko.md` (Korean MD, developer reference)
- **Human reads (English)**: `caret-docs/development-en/caret-rules.md` (English MD, developer reference)
- **Sync method**: AI auto-syncs all formats when editing rules
- **Reading flow**: AI: JSON rules → (if needed) workflow MD → implementation

### ⚠️ Document Editing Guidelines
- **AI developers**: Must avoid including specific version numbers, timestamps, or snapshot data in rules
- **Human developers**: Should avoid directly editing `.caretrules/` files when possible - use document workflow updates instead

### File Mapping
```
.caretrules/caret-rules.json           ↔ caret-docs/development-en/caret-rules.md (EN)
                                       ↔ caret-docs/development/caret-rules.ko.md (KO)
.caretrules/workflows/*.md             ↔ caret-docs/development-en/workflows/*.md
.caretrules/workflows/ai-work-index.md ↔ caret-docs/development/ai-work-index.mdx
.caretrules/workflows/ai-work-protocol.md ↔ caret-docs/guides/ai-work-method-guide.mdx
.caretrules/workflows/caret-development.md ↔ caret-docs/development/caret-rules.ko.md
.caretrules/workflows/merge-strategy.md ↔ caret-docs/guides/merging-strategy-guide.md
```

## Core Principles

### Project Identity
- **Name**: Caret ('^' symbol, NOT carrot)
- **Nature**: Cline-based fork with minimal extension strategy
- **Philosophy**: Preserve Cline core, extend through caret-src/

### Development Principles
- **Quality first**: Accuracy > speed, complete work, no technical debt
- **TDD mandatory**: RED→GREEN→REFACTOR, integration tests first
- **Verification required**: Test→Compile→Execute after every change

## Architecture Rules

### Modification Levels
- **L1 Independent**: `caret-src/`, `caret-docs/` (full freedom)
- **L2 Conditional**: minimal Cline changes with backup + comment
- **L3 Direct**: last resort with full documentation

### Protection Rules
- **Protected directories**: `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`, `configs/`
- **Backup format**: `{filename-extension}.cline`
- **Comment required**: `// CARET MODIFICATION: [description]`
- **Max changes**: 1-3 lines per Cline file

## Development Framework

### Technology Stack
- **Framework**: Mocha (backend), Vitest (frontend), Biome (NOT Prettier)
- **Actual test scripts**:
  - `npm test` - Full test suite (unit + integration)
  - `npm run test:unit` - Backend unit tests
  - `npm run test:integration` - VSCode integration tests
  - `npm run test:webview` - Frontend tests
  - `npm run test:coverage` - Tests with coverage
- **Storage rules**: `chatSettings=workspaceState`, `globalSettings=globalState`

### File Modification Checklist
1. Is Cline original file?
2. Backup exists? `cp file file.cline`
3. CARET MODIFICATION comment added?
4. 1-3 lines max?
5. Complete replacement not commenting?
6. `npm run compile` passes?

### Naming Conventions
- **Utilities**: kebab-case (`brand-utils.ts`)
- **Components**: PascalCase (`CaretProvider.ts`)
- **Tests**: match source (`brand-utils.test.ts`)
- **Docs**: kebab-case (`new-developer-guide.mdx`)

## Development Support Scripts

### Analysis Utils (`caret-scripts/utils/`)
- `semantic-equivalence-checker.js` - Verify semantic equivalence between Markdown/JSON formats with 95.2% target score
- `token-efficiency-analyzer.js` - Measure token usage differences between formats for optimization
- `universal-semantic-analyzer.js` - Universal semantic equivalence analyzer for any format comparison (patent technology)

### Development Tools (`caret-scripts/tools/`)
- `caret-cline-comparison.js` - Compare Caret vs Cline API providers and model coverage
- `package-release.js` - Package and release management utilities

## AI Work Flow

### Step Sequence
1. **Step 1**: Always read JSON rules first for core principles
2. **Step 2**: If needed, read specific workflows for detailed procedures
3. **Step 3**: Follow TDD approach with proper verification

### Knowledge Principle
**AI knowledge = Developer knowledge** (1:1 parity required)

### Mandatory Pre-checks
- NO coding without document review first
- Identify work nature: architecture/ai/frontend/ui/test/cline-modification
- TDD mandatory: integration test first, NEVER unit test first
- Cline file modification: backup + CARET MODIFICATION comment required
- AI must access same information developers have via workflows

### Available Workflows
See `caret-docs/development-en/workflows/` for detailed procedures:

- **Main Workflows**: `ai-work-index.md`, `ai-work-protocol.md`, `caret-development.md`
- **Critical Verification**: `critical-verification.md`
- **Architecture**: `merge-strategy.md`, `document-organization.md`
- **Systems**: `branding-and-logging.md` - Current branding principles and logging systems
- **Development**: `cline-modification.md`, `new-component.md`, `ai-feature.md`, `testing-work.md`

### Atomic Workflows (`workflows/atoms/`)
- `backup-protocol.md` - Cline file backup procedures
- `tdd-cycle.md` - RED→GREEN→REFACTOR cycle
- `modification-levels.md` - L1→L2→L3 decision framework
- `verification-steps.md` - Test→Compile→Execute sequence
- `storage-patterns.md` - workspaceState vs globalState usage
- `naming-conventions.md` - Cline-compatible naming patterns
- `comment-protocol.md` - CARET MODIFICATION tracking
- `message-flow.md` - Frontend↔Backend↔AI communication
- `semantic-equivalence-verification.md` - JSON vs Markdown validation

### Composite Workflows
- **cline-modification**: [backup-protocol, modification-levels, comment-protocol, verification-steps]
- **new-component**: [tdd-cycle, naming-conventions, storage-patterns, verification-steps]
- **ai-feature**: [message-flow, tdd-cycle, verification-steps, storage-patterns]
- **testing-work**: [tdd-cycle, verification-steps, naming-conventions]

## TDD Phases

- **Phase 0**: MANDATORY doc check for work nature (architecture/ai/frontend/ui/test/cline-mod)
- **Phase 1 RED**: Write integration test first (NEVER unit test first)
- **Phase 2 GREEN**: Minimal code to pass integration test
- **Phase 3 REFACTOR**: Improve while keeping integration test passing

## Forbidden Actions

- Modify Cline files without backup
- Overwrite existing .cline backups
- Start with unit tests
- Comment out old code
- Skip CARET MODIFICATION comment

---

## Bilingual Documentation Structure

This document is part of Caret's bilingual documentation system:

- **Korean**: `caret-docs/development/` - Korean documentation for developers
- **English**: `caret-docs/development-en/` - English documentation for developers  
- **JSON**: `.caretrules/caret-rules.json` - Structured rules for AI systems

All three formats maintain semantic equivalence while optimizing for their specific use cases.

**Cross-references**:
- Korean version: [Caret 개발 규칙 (한국어)](../development/caret-rules.ko.md)
- AI version: [.caretrules/caret-rules.json](../../.caretrules/caret-rules.json)
- Workflows: [development-en/workflows/](./workflows/)