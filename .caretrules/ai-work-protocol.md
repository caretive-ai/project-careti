You are following the detailed AI work protocol for systematic development approach.

<detailed_sequence_of_steps>
# AI Work Protocol - Phase-Based Development

## Phase 0: Mandatory Pre-Review and Architecture Decision
1. **User Identification**: Check `git config user.name`
2. **Date Confirmation**: Check current date with OS command
3. **Work Log Check**: Verify/create `caret-docs/work-logs/{username}/{YYYYMMDD-N-description}.md` (N is the sequential number for the day's tasks)

### Critical Work Nature Analysis
Based on work keywords, ensure you've read relevant docs (use `/ai-work-index` first):

**Frontend-Backend Interaction**:
- frontend-backend-interaction-patterns.mdx
- caret-architecture-and-implementation-guide.mdx (sections 10-11)

**Cline Original Modification**:
- File modification checklist in .caretrules
- Backup creation rules verification
- CARET MODIFICATION comment requirements

**Component/UI Development**:
- component-architecture-principles.mdx
- VSCode theme integration guide
- i18n internationalization patterns

**Testing Related**:
- testing-guide.mdx (Vitest mocking patterns)
- TDD mandatory principles (RED → GREEN → REFACTOR)
- Test-first approach enforcement

## Phase 1: TDD RED - Integration Test First
🛑 **STOP POINT**: Write integration tests before unit tests

### Correct TDD Approach:
1. **RED**: Write integration/E2E test for actual usage scenario
2. **GREEN**: Implement all necessary code to make integration test pass
3. **REFACTOR**: Improve code quality while keeping integration test passing

### Examples:
- **WebView Feature**: "User clicks button → Expected result shown" component test
- **Backend Feature**: "Config change → System behavior change" integration test
- **NOT**: Start with `isValidInput()` unit test

🛑 **STOP POINT**: Verify test file location
- webview: `src/caret/**/*.test.tsx` only
- backend: `caret-src/__tests__/`
- Immediate verification: run test after creation

## Phase 2: TDD GREEN - Test Passing Implementation
🛑 **STOP POINT**: Before modifying ANY Cline original file
- Is it protected? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, root configs)
- Create backup: `cp filename.ts filename.ts.cline` (NEVER overwrite existing .cline)
- Add comment: `// CARET MODIFICATION: [clear description]`
- Minimal changes: Maximum 1-3 lines per file
- Complete replacement: Never comment out old code

🛑 **STOP POINT**: New file creation directory check
- Caret features go to `caret-src/`, `caret-docs/` (full freedom)
- Verify import paths are correct
- Immediate verification: compile after modification

## Phase 3: TDD REFACTOR - Quality Improvement
- [ ] Full system verification: compilation success
- [ ] All tests pass
- [ ] No impact on existing features confirmed

## Implementation Execution
1. **Pattern-based implementation**: Apply analyzed architecture patterns
2. **Real-time documentation**: Update checklists and reports
3. **Verification and testing**: Verify each phase completion
4. **Regression check**: Confirm existing functionality intact

## Ask User for Approval
Before starting implementation:
```
마스터, {업무명} 관련 문서 분석 완료했습니다.

📚 체크한 문서:
- {문서1}: {얻은 정보 요약}
- {문서2}: {얻은 정보 요약}

🎯 작업 계획:
- Phase 1: {계획}
- Phase 2: {계획}

⚠️ 주의사항:
- {제약사항1}
- {제약사항2}

진행하겠습니다.
```
</detailed_sequence_of_steps>

<general_guidelines>
This protocol ensures systematic development with proper documentation review, TDD approach, and safety measures for Cline original file modifications.

Never skip Phase 0 - it prevents architectural mistakes and ensures proper approach selection.

Always follow integration-test-first TDD approach, not unit-test-first approach.

Get user approval before starting implementation to confirm the plan is correct.
</general_guidelines>
