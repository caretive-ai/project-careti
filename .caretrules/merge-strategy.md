# Caret-Cline Merging Strategy - Quick Reference

**Purpose**: Minimize Cline code modifications while extending Caret functionality, following L1→L2→L3 hierarchy.

**When to use**: Any Caret feature development that might touch Cline original files.

## Core Principle

**Hierarchy: Level 1 → Level 2 → Level 3**
Never jump to Level 3 without exploring Level 1 and 2 options first.

## Modification Levels

**Level 1: Independent Module** (Preferred)
- Create features in `caret-src/`, `caret-docs/` directories
- Use inheritance/composition to extend Cline functionality
- Example: `CaretProvider extends WebviewProvider`
- **No backup needed** (full freedom)

**Level 2: Conditional Integration** (When needed)
- Backup file: ~~`cp original.ts original.ts.cline`~~ **DEPRECATED: Use comment only**
- Add `// CARET MODIFICATION: [description]` comment
- Make minimal 1-3 line changes
- Use conditional logic: `if (isCaretMode()) { ... }`

**Level 3: Direct Modification** (Last resort)
- Only when inheritance/composition impossible
- Must add `// CARET MODIFICATION: [reason]` comment
- Document reason thoroughly
- Test both Cline and Caret functionality

## Quick Decision Tree

1. Can feature be in `caret-src/`? → **Level 1**
2. Can use inheritance/composition? → **Level 1**
3. Need minimal hook in Cline file (1-3 lines)? → **Level 2**
4. Must modify Cline core logic? → **Level 3** (ask user first)

## Verification

- [ ] `npm run compile` - TypeScript compiles successfully
- [ ] Cline original functionality still works
- [ ] Caret extensions work as expected
- [ ] No conflicts or regressions

---

**📖 For detailed merging workflow and verification steps:**
See `.caretrules/workflows/merge-strategy.md`

**📖 For Korean architecture guide:**
See `caret-docs/development/caret-architecture-and-implementation-guide.md`