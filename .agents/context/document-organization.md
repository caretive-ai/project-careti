# Document Organization - Quick Reference

**Purpose**: Achieve 1:1 parity between developer knowledge and AI knowledge through atomic workflow system.

**When to use**: Knowledge gap analysis, documentation updates, workflow creation, knowledge audits.

## Core Principle

**Developer Knowledge = AI Knowledge (1:1 parity required)**
- Every developer concept accessible to AI via workflows
- Every workflow corresponds to developer documentation
- No knowledge silos between human and AI systems
- `docs/` is original Cline documentation (English, do not edit)
- `docs.careti.ai/` is multilingual delivery (generated from `docs/` + Caret additions)
- English docs in Caret must use `.en` suffix (e.g., `features.en/**`)

## Atomic Workflow Strategy

**Core Atoms** (procedures):
`/backup-protocol`, `/tdd-cycle`, `/modification-levels`, `/storage-patterns`, `/naming-conventions`, `/verification-steps`, `/comment-protocol`

**Domain Atoms** (knowledge areas):
`/component-patterns`, `/message-flow`, `/ai-integration`, `/file-operations`, `/testing-strategies`

**Composite Workflows** (task-specific combinations):
- `/cline-modification` = backup + modification-levels + comment + verification
- `/new-component` = component-patterns + tdd-cycle + naming + testing
- `/ai-feature` = ai-integration + message-flow + tdd-cycle + verification

## Implementation Process

1. **Audit**: List unique knowledge concepts across developer documents
2. **Atomization**: Create atomic workflows for each concept
3. **Mapping**: Update developer docs with workflow references
4. **Composition**: Create composite workflows for common scenarios
5. **Verification**: Ensure 1:1 knowledge parity

## Document & AI Guide Updates (Summary)

- Update `.agents/context/**` first
- Sync Korean developer docs in `careti-docs/development/**`
- Feature specs remain in `careti-docs/features.en/**`
- Update `ai-work-index.yaml` when workflows/categories change

## Success Criteria

- [ ] AI can access any knowledge developers have via atomic workflows
- [ ] Developers see which workflows correspond to their documents
- [ ] No knowledge silos or gaps between systems
- [ ] Efficient token usage through atomic composition

---

**📖 For detailed atomic workflow strategy and examples:**
See `.agents/workflows/document-organization.md`

**📖 For Korean developer documentation:**
See `careti-docs/development/documentation-guide.md`
