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
- [ ] Work log: `careti-docs/work-logs/{username}/{YYYYMMDD-N-description}.md`
- [ ] Use `/ai-work-index` to select relevant documents
- [ ] Read required docs based on work nature

**Phase 1: TDD RED** 🛑 STOP - Integration Test First
- [ ] Write integration/E2E test for actual usage scenario
- [ ] Verify test type & location:
  - webview: `webview-ui/src/**` (run: `npm run test:webview`)
  - backend unit: `src/**/__tests__/*.ts` or `careti-src/core/task/tools/__tests__/*.ts` (run: `npm run test:unit`)
  - extension integration: `src/test/**` (run: `npm run test:integration`)
- [ ] Run test immediately after creation (must fail)

**Phase 2: TDD GREEN** 🛑 STOP - Before Modifying Cline Files
- [ ] Check if file is protected (src/, webview-ui/, proto/, scripts/, etc.)
- [ ] `.cline` 백업은 생성하지 않음(Deprecated). `// CARETI MODIFICATION:` 주석으로만 변경 이력을 남김
- [ ] (불가피한 경우) 보호 디렉토리 내 신규 파일 추가 시 파일 상단에 `// CARETI MODIFICATION:`로 Caret 추가 파일임을 명시
- [ ] Minimal changes (1-3 lines max per file)
- [ ] New Caret features in `careti-src/`, `careti-docs/`
- [ ] Compile immediately after modification

**Phase 3: TDD REFACTOR**
- [ ] Full system verification: `npm run compile`
- [ ] All relevant tests pass: `npm run test:unit`, `npm run test:integration`, `npm run test:webview`
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
See `careti-docs/development/ai-work-protocol.md`
