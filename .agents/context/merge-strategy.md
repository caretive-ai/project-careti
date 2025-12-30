# Caret-Cline Merging Strategy - Quick Reference

**Purpose**: Minimize Cline code modifications while extending Caret functionality.

**Core Principle**:
- **Phase 0 Rule**: `.agents/context` MUST be restored BEFORE any code merging begins.
- **Hybrid Pattern**: Preserve Cline core, inject Caret logic via interception.

**Reference**:
- **Full Protocol**: `caret-docs/merging/merge-standard-guide.md` (Authoritative Source)
- **Workflow**: `.agents/context/workflows/merge-strategy.md` (AI Execution Steps)

**Modification Levels**:
- **L1**: Independent (`caret-src/`)
- **L2**: Conditional (`// CARET MODIFICATION`)
- **L3**: Direct (Last Resort)