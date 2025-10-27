# Testing Work - Quick Reference

**Purpose**: Implement comprehensive testing following integration-first TDD methodology with proper coverage and quality validation.

**When to use**: Any feature development, bug fixes, refactoring, or code quality improvements.

## Core Principles

1. **Integration-First**: Test real user scenarios before isolated units
2. **TDD Cycle**: RED (failing test) → GREEN (minimal code) → REFACTOR (improve quality)
3. **Test Quality**: Edge cases, error handling, performance requirements
4. **Naming Consistency**: `ComponentName.test.ts` matches `ComponentName.ts`

## Quick Workflow

**Pre-Testing:**
- [ ] Define main user scenario being tested
- [ ] Identify system components for integration testing
- [ ] List edge cases and error conditions
- [ ] Determine external dependencies needing mocks

**TDD Cycle:**
- [ ] RED: Write integration test for complete user workflow (fails)
- [ ] GREEN: Implement minimal code to pass integration test
- [ ] REFACTOR: Add edge case tests, error handling, performance tests

**Validation:**
- [ ] `npm run test:webview` (frontend) or `npm run test:backend` (backend)
- [ ] `npm run test:coverage` - Target: >90% line coverage
- [ ] `npm run compile` - TypeScript compilation succeeds
- [ ] `npm run watch` - Manual runtime testing (F5)

## Test Types

**Integration Tests** (primary):
Test complete user workflows across multiple components

**Edge Case Tests**:
Invalid inputs, network failures, storage errors, boundary conditions

**Performance Tests**:
Response times, memory usage, resource limits

**Unit Tests** (byproducts):
Helper functions, utilities (created during refactor, not starting points)

## Test Naming Conventions

**✅ Correct**:
- `PersonaSystem.test.ts` (matches `PersonaSystem.ts`)
- `persona-service.test.ts` (matches `persona-service.ts`)
- `PersonaSelector.test.tsx` (matches `PersonaSelector.tsx`)

**❌ Wrong**:
- `TestPersonaSystem.ts`, `persona-system-test.ts`, `PersonaSelectorTests.tsx`

## Coverage Targets

- **Integration tests**: 100% coverage for user flows
- **Line coverage**: >90% for new features
- **Edge cases**: All error conditions tested
- **Performance**: All critical paths benchmarked

## Key Atomic Components

- `/tdd-cycle` - RED→GREEN→REFACTOR methodology
- `/verification-steps` - Test→Compile→Execute sequence
- `/naming-conventions` - Consistent test file naming

## Related Workflows

- Essential for `/new-component` completion
- Required for `/ai-feature` validation
- Mandatory before `/cline-modification` changes
- Use `/critical-verification` for complex test strategies

---

**📖 For detailed testing workflow with code examples:**
See `.caretrules/workflows/testing-work.md`

**📖 For Korean developer documentation:**
See `caret-docs/development/testing-guide.md`