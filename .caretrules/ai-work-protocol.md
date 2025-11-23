# AI Work Protocol - Quick Reference

**Purpose**: Systematic phase-based development approach with mandatory pre-review, TDD methodology, and safety measures.

**When to use**: Any Caret development task - feature implementation, bug fixes, refactoring, documentation.

## Core Principle

**Phase 0 → Phase 1 (RED) → Phase 2 (GREEN) → Phase 3 (REFACTOR)**
Never skip Phase 0 - prevents architectural mistakes and ensures proper approach.

## Quick Workflow

**Phase 0: Mandatory Pre-Review** (ALWAYS START HERE)
- [ ] User identification: `git config user.name`
- [ ] Date confirmation: OS command
- [ ] Work log: `caret-docs/work-logs/{username}/{YYYYMMDD-N-description}.md`
- [ ] Use `/ai-work-index` to select relevant documents
- [ ] Read required docs based on work nature

**Phase 1: TDD RED** 🛑 STOP - Integration Test First
- [ ] Write integration/E2E test for actual usage scenario
- [ ] Verify test file location (webview: `src/caret/**/*.test.tsx`, backend: `caret-src/__tests__/`)
- [ ] Run test immediately after creation (must fail)

**Phase 2: TDD GREEN** 🛑 STOP - Before Modifying Cline Files
- [ ] Check if file is protected (src/, webview-ui/, proto/, scripts/, etc.)
- [ ] Add `// CARET MODIFICATION:` comment (~~backup deprecated~~)
- [ ] Minimal changes (1-3 lines max per file)
- [ ] New Caret features in `caret-src/`, `caret-docs/`
- [ ] Compile immediately after modification

**Phase 3: TDD REFACTOR**
- [ ] Full system verification: `npm run compile`
- [ ] All tests pass: `npm run test:webview`, `npm run test:backend`
- [ ] No impact on existing features

## Critical Work Nature Docs

**Use `/ai-work-index` first to select:**
- Frontend-Backend: frontend-backend-interaction-patterns.md
- Cline Modification: File modification checklist
- Component/UI: component-architecture-principles.md
- Testing: testing-guide.md, TDD principles

## User Approval Template

```
마스터, {업무명} 관련 문서 분석 완료했습니다.

📚 체크한 문서: {문서 요약}
🎯 작업 계획: {Phase 1-3 계획}
⚠️ 주의사항: {제약사항}

진행하겠습니다.
```

---

**📖 For detailed phase-based workflow:**
See `.caretrules/workflows/ai-work-protocol.md`

**📖 For Korean developer documentation:**
See `caret-docs/development/ai-work-protocol.md` (if exists)
