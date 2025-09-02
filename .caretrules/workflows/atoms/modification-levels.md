You are following the 3-level modification strategy for Caret development.

<detailed_sequence_of_steps>
# Modification Levels - L1 → L2 → L3 Decision Framework

## Core Principle
**Always prefer higher levels (L1 > L2 > L3). Lower levels require stronger justification.**

## Level 1: Independent Modules (Preferred)
**Location**: `caret-src/`, `caret-docs/`
**Freedom**: Complete implementation freedom
**Requirements**: None (no backup, no comments needed)
**Use Cases**:
- New Caret features
- Caret-specific utilities
- Documentation updates
- Independent services

```typescript
// Example: caret-src/services/persona-service.ts
export class PersonaService {
  // Complete freedom to implement
}
```

## Level 2: Conditional Integration (Careful)
**Location**: Cline files (`src/`, `webview-ui/`, `proto/`, `scripts/`)
**Requirements**: 
- **Mandatory comment**: `// CARET MODIFICATION: [description]`
- **Minimal changes**: 1-3 lines maximum per file
- **Complete replacement**: Never comment out existing code
- **Verification required**: Must pass all tests

**Decision Criteria**:
- [ ] Is L1 approach impossible?
- [ ] Will this change be stable long-term?
- [ ] Is the modification truly minimal?
- [ ] Can this integrate cleanly with upstream merges?

```typescript
// Example: src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  // CARET MODIFICATION: Initialize Caret wrapper
  const caretWrapper = new CaretProviderWrapper(context);
  // ... rest of Cline code unchanged
}
```

## Level 3: Direct Modification (Last Resort)
**Requirements**:
- **Full documentation**: Complete rationale required
- **Impact analysis**: All affected systems documented
- **Emergency situations only**: When L1/L2 impossible

**Use Cases**:
- Critical bug fixes that can't wait
- Core architecture changes (rare)
- Security issues requiring immediate fixes

## Decision Tree
```
New Feature Needed
├─ Can it be L1 independent? → Use caret-src/
├─ Must integrate with Cline?
│  ├─ Can be 1-3 lines? → L2 with comment
│  └─ Requires major changes → L3 with full docs
```

## Related Workflows
- Use `/modification-protocol` for L2 modifications
- Use `/comment-protocol` for L2 marking
- Apply `/critical-verification` when choosing levels
</detailed_sequence_of_steps>

<general_guidelines>
This framework preserves Cline's integrity while enabling Caret extensions.

The goal is maximum functionality with minimum disruption to upstream merges.

When in doubt, try L1 first - you can always escalate to L2/L3 if needed.
</general_guidelines>