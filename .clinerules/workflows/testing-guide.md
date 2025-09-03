You are accessing the comprehensive testing guide for TDD development approach.

<detailed_sequence_of_steps>
# Testing Guide - TDD Integration-First Approach

## Critical TDD Order (Integration First)
🛑 **WRONG APPROACH**:
1. Write unit tests for helper functions
2. Implement helpers  
3. Later integrate into actual usage

✅ **CORRECT APPROACH**:
1. RED: Write integration/E2E test for actual usage scenario
2. GREEN: Implement all necessary code to make integration test pass  
3. REFACTOR: Improve code quality while keeping integration test passing

## Test Environment Setup
- **Framework**: Vitest (NOT Jest)
- **Fast Commands**: 
  - `npm run test:backend` (backend tests only)
  - `npm run test:webview` (webview tests only)
- **NEVER USE**: `npm test` (too slow)
- **Type Checking**: `npm run check-types`
- **Compilation**: `npm run compile`

## Test File Locations
- **Backend Tests**: `caret-src/__tests__/` (Caret features)
- **Webview Tests**: `src/caret/**/*.test.tsx` (Caret UI components)
- **Cline Tests**: Follow existing patterns in `src/`

## TDD Example Patterns
**WebView Feature Development**:
- ❌ Wrong: Start with `isValidInput()` unit test
- ✅ Correct: Start with "User clicks button → Expected result shown" component test

**Backend Feature Development**:
- ❌ Wrong: Start with `parseConfig()` unit test
- ✅ Correct: Start with "Config change → System behavior change" integration test

## Testing Strategy
1. **Integration Tests**: Primary focus, real usage scenarios
2. **Component Tests**: React component behavior with user interactions  
3. **Unit Tests**: Byproducts of integration tests, not starting points
4. **E2E Tests**: Full workflow validation with Playwright

## Verification Workflow
1. Write failing integration test (RED)
2. Run test to confirm failure
3. Implement minimal code to pass (GREEN)
4. Run test to confirm success
5. Run full test suite to prevent regression
6. Refactor while keeping all tests passing

## Test Coverage Goals
- 100% coverage for new Caret features
- Integration test coverage for all user-facing functionality
- Component test coverage for all UI interactions

## Common Testing Patterns
- **Mocking**: Vitest mocking patterns for external dependencies
- **Async Testing**: Proper async/await handling in tests
- **Component Testing**: React Testing Library patterns
- **State Testing**: Extension state and storage testing
</detailed_sequence_of_steps>

<general_guidelines>
This workflow provides AI access to the same testing knowledge developers have through the testing-guide.mdx document.

Always start with integration tests that represent real user scenarios, not isolated unit tests.

The goal is to ensure code works in actual usage contexts, not just in isolation.
</general_guidelines>