You are following the TDD (Test-Driven Development) cycle with integration-first approach.

<detailed_sequence_of_steps>
# TDD Cycle - Integration First Methodology

## Core Principle
**RED → GREEN → REFACTOR with integration tests first, never unit tests first**

## Phase 1: RED (Write Failing Test)
**Integration test for actual usage scenario, not isolated units**

### Correct Approach ✅:
- **WebView Feature**: "User clicks button → Expected result shown"
- **Backend Feature**: "Config change → System behavior change"  
- **File Operation**: "User saves file → Proper storage + retrieval"

### Wrong Approach ❌:
- Starting with `isValidInput()` unit test
- Testing isolated functions without context
- Mocking everything so test doesn't represent real usage

### Test Creation:
```typescript
// Integration test example
describe('User Persona Selection', () => {
  it('should update AI behavior when user selects new persona', async () => {
    // Actual usage scenario testing
  })
})
```

## Phase 2: GREEN (Make Test Pass)
**Implement minimum code to pass the integration test**

- Write all necessary components, services, utilities
- Focus on making the integration scenario work
- Don't optimize yet - just make it work

## Phase 3: REFACTOR (Improve While Keeping Tests Passing)
**Improve code quality without breaking functionality**

- Extract common patterns
- Improve performance
- Clean up code structure  
- Add unit tests as byproducts (not starting points)

## Test File Locations
- **Backend tests**: `caret-src/__tests__/`
- **Webview tests**: `webview-ui/src/**/*.test.tsx`
- **Integration tests**: Test complete flows

## Related Workflows
- Use with `/verification-steps` for post-TDD validation
- Use with `/naming-conventions` for test file naming
- Combine with `/modification-levels` for Cline file testing
</detailed_sequence_of_steps>

<general_guidelines>
This TDD approach ensures code works in real scenarios, not just in isolation.

Integration tests first prevents the common problem of well-tested units that don't work together.

Unit tests become natural byproducts of making integration tests pass.
</general_guidelines>