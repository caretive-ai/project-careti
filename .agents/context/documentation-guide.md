# Documentation Guide - AI Knowledge System

## Context
You are working with Caret's dual documentation system designed for AI-developer knowledge parity.

## Core Principles

### 1. AI-Developer Knowledge Synchronization
- `.agents/context/`: AI's knowledge source (machine-optimized)
- `careti-docs/`: Developer's knowledge source (human-friendly Korean)
- `docs/`: Original Cline documentation (English, do not edit)
- `docs.careti.ai/`: Multilingual delivery site (generated from `docs/` + Caret additions)
- **Rule**: Both directories must maintain 1:1 semantic equivalence

### 2. Knowledge Atomization Strategy

**Goal**: Minimize token usage (API cost reduction) and eliminate knowledge duplication by breaking documents into reusable atomic units.

**Structure**:
- **Atoms** (`.agents/workflows/atoms/`): Minimal reusable rules
  - Examples: `tdd-cycle.yaml`, `backup-protocol.yaml`, `verification-steps.md`
  - Single responsibility: Each atom covers one specific concept

- **Composite Workflows** (`.agents/workflows/`): Task-specific procedures combining multiple atoms
  - Examples: `new-component.md`, `cline-modification.md`
  - References atoms instead of duplicating content

### 3. Format Decision Criteria

**AI Documents** (`.agents/context/`):
- 0-2 code examples → YAML (token-optimized)
- 3+ code examples → Markdown (learning-optimized)
- Language: English

**Developer Documents** (`careti-docs/`):
- Always Markdown/MDX
- Language: Korean (한글)
- English docs must use `.en` suffix (e.g., `features.en/**`)

## Workflow vs Skill (Different Systems)

- **Workflows**: Project rules/procedures stored in `.agents/workflows/**`. Loaded on-demand based on task context.
- **Skills**: Codex capability modules stored in `.agents/skills/**`. Loaded only when a skill is named or its description matches the task.
- Do not duplicate workflows as skills unless the task is deterministic and script-backed.

## Document Synchronization Protocol

### When Creating/Updating Documents:
1. **AI Rule First**: Create/update `.agents/context/` version
2. **Developer Mirror**: Create corresponding `careti-docs/development/` version
3. **Update Index**: Add to `ai-work-index.yaml` if workflow-related
4. **Semantic Check**: Verify content parity manually (no auto-sync scripts)

### File Naming Conventions:
- Lowercase with hyphens
- Descriptive names
- Format: `[feature]-[aspect].md`
- Examples: `webview-communication.md`, `component-architecture.md`

## CARETI MODIFICATION Comment Protocol

When modifying Cline original files, add file-type-appropriate comments:

**TypeScript/JavaScript** (.ts, .tsx, .js, .jsx):
```typescript
// CARETI MODIFICATION: [clear description]
```

**CSS** (.css, .scss):
```css
/* CARETI MODIFICATION: [clear description] */
```

**HTML/Markdown** (.html, .md, .md):
```html
<!-- CARETI MODIFICATION: [clear description] -->
```

**Shell Scripts** (.sh, .bash):
```bash
# CARETI MODIFICATION: [clear description]
```

**No Comment Support**: JSON, images, binaries → Document changes separately

## Directory Structure

```
.agents/context/
├── *.md, *.yaml          # Root-level workflows
└── workflows/
    ├── *.md              # Composite workflows
    └── atoms/            # Atomic rules
        └── *.md, *.yaml  # Minimal reusable units

careti-docs/
├── development/          # AI-dev synced guides (Korean)
│   ├── *.md            # Root guides (1:1 with .agents/context/)
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
5. **Verification**: Re-check that both sides describe the same behavior

## AGENTS Standard Initialization (/init)

- If the workspace is missing the standard structure, ask the user for consent.
- On approval, scaffold from `assets/agents_template` and then populate `.agents/context` with real project context.
- Use `.agents/workflows/agents-init.md` as the authoritative fill-in workflow.
- Do not invent details; fill only from confirmed project docs (AGENTS.md, README, architecture guides).

## Caret CLI npm Publish (Knowledge Sync)

- Package: `@caretive/careti-cli` in `cli-caret/`.
- Required: `dist-standalone/cline-core.js` (run `npm run compile-standalone-npm` first).
- Token: `CARET_NPM_TOKEN` must be exported; `.env` is not auto-loaded by scripts.
- Publish script: `bash cli-caret/scripts/publish-careti-cli.sh` (uses `npm pack` then `npm publish`).
- First public publish may need `npm publish --access public` (adjust script if needed).
- This path does not require `TELEMETRY_SERVICE_API_KEY`/`ERROR_SERVICE_API_KEY`.

## Workflow → Skill Candidate Review

Convert workflows into Skills only when:
- The task is deterministic and script-backed
- The input/output is stable and repeatable
- Human judgment is not required

Examples: model list regeneration, proto generation, standardized lint/test runs.

## Related Documents
- `.agents/context/ai-work-index.yaml`: Document selection guide
- `careti-docs/development/documentation-guide.md`: Full developer guide (Korean)
