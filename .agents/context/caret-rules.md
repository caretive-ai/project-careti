# Caret Development Rules (English)

## Rule Management System

### Document Access Pattern
- **AI reads**: `.agents/context/caret-rules.json` (English JSON, core principles only)
- **AI workflows**: `.agents/context/workflows/*.md` (English MD, detailed procedures when needed)
- **Human reads (Korean)**: `caret-docs/development/caret-rules.ko.md` (Korean MD, developer reference)
- **Human reads (Features EN)**: `caret-docs/features.en/index.md` (feature specs, English)
- **Sync method**: Keep `.agents/context` as the Single Source of Truth; update `caret-docs/development/` as the KO-first developer counterpart
- **Reading flow**: AI: JSON rules → (if needed) workflow MD → implementation

### ⚠️ Document Editing Guidelines
- **AI developers**: Must avoid including specific version numbers, timestamps, or snapshot data in rules
- **Human developers**: Should avoid directly editing `.agents/context/` files when possible - use document workflow updates instead

### File Mapping
```
.agents/context/caret-rules.json              ↔ caret-docs/development/caret-rules.ko.md (KO counterpart)
.agents/context/workflows/*.md                ↔ caret-docs/development/index.md (KO dashboard links out to matching guides)
.agents/context/workflows/atoms/*.md|*.yaml    ↔ caret-docs/development/* (referenced where needed)
.agents/context/workflows/ai-work-protocol.md ↔ caret-docs/development/ai-work-protocol.md
.agents/context/workflows/ai-work-index*      ↔ caret-docs/development/ai-work-index.md
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

### Merge Strategy (Priority 0)
- **Phase 0 Rule**: `.agents/context` MUST be restored BEFORE any code merging begins.
- **Hybrid Pattern**: Preserve Cline core, inject Caret logic via interception.
- **Logic-based 3-way**: Compare Base(Cline) vs Target(Caret) vs Merged logic, not just text diffs.
- **Reference**: See `caret-docs/merging/merge-standard-guide.md` for full protocol.

## Architecture Rules

### Modification Levels
- **L1 Independent**: `caret-src/`, `caret-docs/` (full freedom)
- **L2 Conditional**: minimal Cline changes with backup + comment
- **L3 Direct**: last resort with full documentation

### Protection Rules
- **Protected directories**: `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`, `configs/`
- **Comment required**: `// CARET MODIFICATION: [description]`
- **Max changes**: 1-3 lines per Cline file

## Development Framework

### Technology Stack
- **Framework**: Mocha (backend), Vitest (frontend), Biome (NOT Prettier)
- **Build System**: TypeScript (type check ONLY) + esbuild (bundling)
  - ⚠️ **CRITICAL**: tsconfig.json has `noEmit: true` - tsc NEVER generates .js files
  - Only esbuild creates dist/extension.js
  - See `.agents/context/build-system.md` for detailed rules
- **Actual test scripts**:
  - `npm test` - Full test suite (unit + integration)
  - `npm run test:unit` - Backend unit tests
  - `npm run test:integration` - VSCode integration tests
  - `npm run test:webview` - Frontend tests
  - `npm run test:coverage` - Tests with coverage
- **Storage rules**: `chatSettings=workspaceState`, `globalSettings=globalState`

### File Modification Checklist
1. Is Cline original file?
2. CARET MODIFICATION comment added?
3. 1-3 lines max?
4. Complete replacement not commenting?
5. Build system check:
   - ✅ No .js/.js.map files in `src/` or `caret-src/`
   - ✅ `npm run compile` passes
   - ✅ VSCode reload (Developer: Reload Window) to load new code

### Naming Conventions
- **Utilities**: kebab-case (`brand-utils.ts`)
- **Components**: PascalCase (`CaretProvider.ts`)
- **Tests**: match source (`brand-utils.test.ts`)
- **Docs**: kebab-case (`new-developer-guide.md`)

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
- Cline file modification: `.cline` 백업은 deprecated, `// CARET MODIFICATION:` 주석으로만 추적 (복구는 git)
- AI must access same information developers have via workflows

### Available Workflows
See `.agents/context/workflows/` for detailed procedures:

- **Main Workflows**: `ai-work-index.md`, `ai-work-protocol.md`, `caret-development.md`
- **Critical Verification**: `critical-verification.md`
- **Architecture**: `merge-strategy.md`, `document-organization.md`
- **Systems**: `branding-and-logging.md` - Current branding principles and logging systems
- **Development**: `cline-modification.md`, `new-component.md`, `ai-feature.md`, `testing-work.md`

### Atomic Workflows (`workflows/atoms/`)
- `backup-protocol.yaml` - (Deprecated) `.cline` 백업 대신 comment-only + git 복구 원칙
- `tdd-cycle.yaml` - RED→GREEN→REFACTOR cycle
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

## Workflow Selection (On-demand)

When a task requires workflows, select them on demand using the work index:

- Reference: `.agents/context/ai-work-index.yaml`
- Steps:
  1. Extract keywords from the user request
  2. Match a category in the index
  3. Read the root quick reference first
  4. Load the workflow only if more detail is required
  5. Use `caret-docs/development/**` when updating human-facing guides

## Forbidden Actions

- Modify Cline files without CARET MODIFICATION comment
- Start with unit tests
- Comment out old code
- Skip CARET MODIFICATION comment
- Run `tsc` without `--noEmit` (tsconfig.json has noEmit: true)
- Allow .js/.js.map files in `src/` or `caret-src/` directories

---

## Bilingual Documentation Structure

This document is part of Caret's knowledge parity system:

- **Rules/Workflows (SoT)**: `.agents/context/caret-rules.json`, `.agents/context/workflows/*`
- **Developer docs (KO-first)**: `caret-docs/development/index.md`
- **Feature specs (EN)**: `caret-docs/features.en/index.md`

**Cross-references**:
- KO counterpart: `caret-docs/development/caret-rules.ko.md`
- SoT index: `.agents/context/caret-rules.json`
