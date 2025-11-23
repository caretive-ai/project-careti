# Documentation Guide - AI Knowledge System

## Context
You are working with Caret's dual documentation system designed for AI-developer knowledge parity.

## Core Principles

### 1. AI-Developer Knowledge Synchronization
- `.caretrules/`: AI's knowledge source (machine-optimized)
- `caret-docs/`: Developer's knowledge source (human-friendly Korean)
- **Rule**: Both directories must maintain 1:1 semantic equivalence

### 2. Knowledge Atomization Strategy

**Goal**: Minimize token usage (API cost reduction) and eliminate knowledge duplication by breaking documents into reusable atomic units.

**Structure**:
- **Atoms** (`.caretrules/workflows/atoms/`): Minimal reusable rules
  - Examples: `tdd-cycle.yaml`, `backup-protocol.yaml`, `verification-steps.md`
  - Single responsibility: Each atom covers one specific concept

- **Composite Workflows** (`.caretrules/workflows/`): Task-specific procedures combining multiple atoms
  - Examples: `new-component.md`, `cline-modification.md`
  - References atoms instead of duplicating content

### 3. Format Decision Criteria

**AI Documents** (`.caretrules/`):
- 0-2 code examples → YAML (token-optimized)
- 3+ code examples → Markdown (learning-optimized)
- Language: English

**Developer Documents** (`caret-docs/`):
- Always Markdown/MDX
- Language: Korean (한글)

## Document Synchronization Protocol

### When Creating/Updating Documents:
1. **AI Rule First**: Create/update `.caretrules/` version
2. **Developer Mirror**: Create corresponding `caret-docs/development/` version
3. **Semantic Check**: Use `caret-scripts/ai-semantic-analyzer.js` to verify equivalence
4. **Update Index**: Add to `ai-work-index.yaml` if workflow-related

### File Naming Conventions:
- Lowercase with hyphens
- Descriptive names
- Format: `[feature]-[aspect].md`
- Examples: `webview-communication.md`, `component-architecture.md`

## CARET MODIFICATION Comment Protocol

When modifying Cline original files, add file-type-appropriate comments:

**TypeScript/JavaScript** (.ts, .tsx, .js, .jsx):
```typescript
// CARET MODIFICATION: [clear description]
```

**CSS** (.css, .scss):
```css
/* CARET MODIFICATION: [clear description] */
```

**HTML/Markdown** (.html, .md, .md):
```html
<!-- CARET MODIFICATION: [clear description] -->
```

**Shell Scripts** (.sh, .bash):
```bash
# CARET MODIFICATION: [clear description]
```

**No Comment Support**: JSON, images, binaries → Document changes separately

## Directory Structure

```
.caretrules/
├── *.md, *.yaml          # Root-level workflows
└── workflows/
    ├── *.md              # Composite workflows
    └── atoms/            # Atomic rules
        └── *.md, *.yaml  # Minimal reusable units

caret-docs/
├── development/          # AI-dev synced guides (Korean)
│   ├── *.md            # Root guides (1:1 with .caretrules/)
│   └── workflows/       # Workflow mirrors
│       └── atoms/       # Atom mirrors
├── features/            # Feature specifications
├── guides/              # Developer-only guides
└── work-logs/           # AI-dev work logs
```

## Essential Rules for AI

1. **Read Before Modify**: Always read existing documents before editing
2. **Sync Both Sides**: Never update one side without updating the other
3. **Atomic References**: Reference atoms instead of duplicating content
4. **Token Efficiency**: Keep AI documents concise, expand in Korean docs
5. **Verification**: Run semantic analyzer after syncing

## Related Documents
- `.caretrules/ai-work-index.yaml`: Document selection guide
- `caret-docs/development/documentation-guide.md`: Full developer guide (Korean)
