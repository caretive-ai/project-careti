# Cline Modification - Quick Reference

**Purpose**: Safely modify Cline original files with minimal changes, proper tracking, and verification procedures.

**When to use**: When Caret features require integration points in Cline original code (L2/L3 modifications).

## Core Principles

1. **Level Hierarchy**: L1 (caret-src/) > L2 (minimal hook) > L3 (major change)
2. **Minimal Changes**: Maximum 1-3 lines per file, integration points only
3. **Clear Tracking**: `// CARET MODIFICATION:` comment for all changes
4. **Verification**: Test → Compile → Execute before committing

## Quick Workflow

**Pre-Modification:**
- [ ] Level Assessment: Can this be L1 (caret-src/)? If yes, STOP
- [ ] Must be L2 minimal change? Continue workflow
- [ ] `.cline` 백업은 생성하지 않음 (comment-only + git 복구)

**Modification:**
- [ ] Add `// CARET MODIFICATION: [what and why]` comment
- [ ] Make minimal 1-3 line change (complete replacement, no commenting out)
- [ ] For `.proto` files: Use field number = `current_cline_max + 1000`

**Verification:**
- [ ] `npm run compile` - TypeScript compilation succeeds
- [ ] `npm run watch` - Launch extension (F5)
- [ ] Test new Caret functionality works
- [ ] Verify Cline original features unaffected

## Special Cases

**Protocol Buffer Files** (`.proto`):
```protobuf
// CARET MODIFICATION: Caret fields (72 + 1000 = 1072+)
optional string caret_api_key = 1072;
optional string next_field = 1073;
```

**Recovery** (if verification fails):
1. `git checkout -- filename.ext` (또는 `git restore filename.ext`)
2. Fix in caret-src/ if possible
3. Revise minimal modification approach

## Works Well With / Avoid

**✅ Works Well**:
- Simple integration points
- Wrapper pattern implementations
- Configuration additions
- Event handler modifications

**❌ Avoid**:
- Complex logic changes
- Major architectural modifications
- Multiple file changes for single feature (prefer caret-src/)

## Key Atomic Components

- `/backup-protocol` - ~~File backup procedures~~ (deprecated)
- `/modification-levels` - L1→L2→L3 decision framework
- `/comment-protocol` - CARET MODIFICATION tracking rules
- `/verification-steps` - Test→Compile→Execute sequence

## Related Workflows

- `/critical-verification` - When uncertain about approach
- `/tdd-cycle` - Testing integration points
- `/merge-strategy` - L1→L2→L3 decision tree

---

**📖 For detailed workflow with backup, proto field numbering, and examples:**
See `.agents/context/workflows/cline-modification.md` (comment-only + git 복구)

**📖 For Korean developer documentation:**
See `caret-docs/development/cline-modification.md` (if exists)
