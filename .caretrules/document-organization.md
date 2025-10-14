You are organizing the documentation system to achieve 1:1 parity between developer knowledge and AI knowledge.

<detailed_sequence_of_steps>
# Document Organization Workflow - Knowledge Parity System

## Core Principle
**Developer Knowledge = AI Knowledge (1:1 parity required)**
- Every concept developers need must be accessible to AI via workflows
- Every workflow must correspond to developer documentation
- No knowledge silos between human and AI systems

## Current Analysis
**caret-docs/development/**: 22 documents (developer knowledge)
**caret-docs/guides/**: 6 guides (developer knowledge)
**.caretrules/workflows/**: 4 workflows (AI knowledge)

**Problem**: Massive knowledge gap (28 vs 4)

## Atomic Workflow Strategy

### Phase 1: Identify Knowledge Atoms
Break down complex documents into reusable knowledge atoms:

**Core Atoms**:
- `/backup-protocol`: File backup procedures (.cline format)
- `/tdd-cycle`: RED→GREEN→REFACTOR methodology
- `/modification-levels`: L1→L2→L3 decision framework
- `/storage-patterns`: workspaceState vs globalState rules
- `/naming-conventions`: File and component naming standards
- `/verification-steps`: Test→Compile→Execute sequence
- `/comment-protocol`: CARET MODIFICATION requirements

**Domain Atoms**:
- `/component-patterns`: React component architecture
- `/message-flow`: Frontend↔Backend communication
- `/ai-integration`: System prompt and message processing
- `/file-operations`: Storage, loading, and processing
- `/testing-strategies`: Integration-first testing approach

### Phase 2: Map Developer Docs to Atomic Workflows
**Architecture Domain**:
- caret-architecture-and-implementation-guide.mdx → `/modification-levels` + `/backup-protocol`
- component-architecture-principles.mdx → `/component-patterns` + `/naming-conventions`

**Communication Domain**:
- frontend-backend-interaction-patterns.mdx → `/message-flow` + `/storage-patterns`
- webview-extension-communication.mdx → `/message-flow` + `/verification-steps`

**AI Domain**:
- ai-message-flow-guide.mdx → `/ai-integration` + `/message-flow`
- system-prompt-implementation.mdx → `/ai-integration` + `/component-patterns`

**Testing Domain**:
- testing-guide.mdx → `/tdd-cycle` + `/testing-strategies` + `/verification-steps`

### Phase 3: Create Composite Workflows
Combine atoms for specific work scenarios:

```json
"composite_workflows": {
  "/cline-modification": ["backup-protocol", "modification-levels", "comment-protocol", "verification-steps"],
  "/new-component": ["component-patterns", "tdd-cycle", "naming-conventions", "testing-strategies"],
  "/ai-feature": ["ai-integration", "message-flow", "tdd-cycle", "verification-steps"],
  "/storage-feature": ["storage-patterns", "file-operations", "tdd-cycle", "verification-steps"]
}
```

### Phase 4: Verification Strategy
**For Each Atomic Workflow**:
- [ ] Maps to specific developer document sections
- [ ] Contains actionable procedures, not just information
- [ ] Can be combined with other atoms
- [ ] Provides same knowledge level as developer docs

**For Each Developer Document**:
- [ ] Core knowledge extracted into atomic workflows
- [ ] References atomic workflows for AI access
- [ ] Maintains human-readable format
- [ ] Cross-references related atoms

## Implementation Process
1. **Audit Phase**: List all unique knowledge concepts across 28 developer documents
2. **Atomization Phase**: Create atomic workflows for each concept
3. **Mapping Phase**: Update developer docs with workflow references
4. **Composition Phase**: Create composite workflows for common scenarios
5. **Verification Phase**: Ensure 1:1 knowledge parity

## Success Criteria
- AI can access any knowledge developers have via atomic workflows
- Developers can see which workflows correspond to their documents
- No knowledge silos or gaps between systems
- Efficient token usage through atomic composition

## Workflow Format Strategy (Hybrid Approach)

### Core Principle: Token Efficiency vs Learning Efficiency
**Balance machine efficiency with one-shot learning effectiveness**

### Format Decision Rules

**Use YAML** (Token-optimized, ~33% reduction):
- **Criteria**: 0-2 code examples
- **Purpose**: Structural workflows, procedural checklists
- **Examples**:
  - `ai-work-index.yaml` (0 examples)
  - `architecture-guide.yaml` (0 examples)
  - `backup-protocol.yaml` (2 examples)

**Use Markdown** (Learning-optimized, better for one-shot prompts):
- **Criteria**: 3+ code examples
- **Purpose**: Tutorial workflows, pattern demonstrations
- **Examples**:
  - `cline-modification.md` (12 examples)
  - `new-component.md` (16 examples)
  - `naming-conventions.md` (18 examples)

### Dual Workflow System

**`.caretrules/workflows/`** (Machine-optimized):
- Format: YAML (0-2 examples) or Markdown (3+ examples)
- Purpose: Caret app `/command` + AI consumption
- Language: English
- Optimization: Token efficiency priority
- Management: AI maintains

**`caret-docs/development/workflows/`** (Human-friendly):
- Format: Markdown (always)
- Purpose: Korean developer reference
- Language: Korean
- Optimization: Readability priority
- Management: AI maintains

### Synchronization Rules
1. **Semantic Equivalence**: Both versions must convey identical meaning
2. **Format Independence**: .caretrules can be YAML, caret-docs is always Markdown
3. **AI Responsibility**: AI maintains both pairs synchronized
4. **Update Trigger**: Any change to one must propagate to the other
5. **Verification**: Use `caret-scripts/ai-semantic-analyzer.js` to verify equivalence

</detailed_sequence_of_steps>

<general_guidelines>
This workflow systematically achieves knowledge parity through atomic decomposition and composition.

The goal is to eliminate the knowledge gap while maintaining efficiency and avoiding duplication.

Every developer document should map to a combination of atomic workflows that provide equivalent knowledge access.
</general_guidelines>