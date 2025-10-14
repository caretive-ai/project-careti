# Workflow Token Efficiency Test

## Test Sample: tdd-cycle

### Version A: 마크다운 (현재 형식)
```markdown
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
```

**토큰 수 (추정)**: ~450 tokens

---

### Version B: JSON (구조화)
```json
{
  "workflow": "tdd-cycle",
  "context": "You are following the TDD (Test-Driven Development) cycle with integration-first approach.",
  "principle": "RED → GREEN → REFACTOR with integration tests first, never unit tests first",
  "phases": [
    {
      "step": "RED",
      "title": "Write Failing Test",
      "description": "Integration test for actual usage scenario, not isolated units",
      "correct": [
        "WebView Feature: User clicks button → Expected result shown",
        "Backend Feature: Config change → System behavior change",
        "File Operation: User saves file → Proper storage + retrieval"
      ],
      "wrong": [
        "Starting with isValidInput() unit test",
        "Testing isolated functions without context",
        "Mocking everything so test doesn't represent real usage"
      ],
      "example": {
        "language": "typescript",
        "code": "describe('User Persona Selection', () => {\n  it('should update AI behavior when user selects new persona', async () => {\n    // Actual usage scenario testing\n  })\n})"
      }
    },
    {
      "step": "GREEN",
      "title": "Make Test Pass",
      "description": "Implement minimum code to pass the integration test",
      "actions": [
        "Write all necessary components, services, utilities",
        "Focus on making the integration scenario work",
        "Don't optimize yet - just make it work"
      ]
    },
    {
      "step": "REFACTOR",
      "title": "Improve While Keeping Tests Passing",
      "description": "Improve code quality without breaking functionality",
      "actions": [
        "Extract common patterns",
        "Improve performance",
        "Clean up code structure",
        "Add unit tests as byproducts (not starting points)"
      ]
    }
  ],
  "testLocations": {
    "backend": "caret-src/__tests__/",
    "webview": "webview-ui/src/**/*.test.tsx",
    "integration": "Test complete flows"
  },
  "relatedWorkflows": [
    "/verification-steps",
    "/naming-conventions",
    "/modification-levels"
  ],
  "guidelines": [
    "This TDD approach ensures code works in real scenarios, not just in isolation",
    "Integration tests first prevents the common problem of well-tested units that don't work together",
    "Unit tests become natural byproducts of making integration tests pass"
  ]
}
```

**토큰 수 (추정)**: ~500 tokens

---

### Version C: YAML (절충안)
```yaml
workflow: tdd-cycle
context: You are following the TDD cycle with integration-first approach
principle: RED → GREEN → REFACTOR with integration tests first

phases:
  - step: RED
    title: Write Failing Test
    description: Integration test for actual usage scenario
    correct:
      - "WebView: User clicks button → Expected result"
      - "Backend: Config change → System behavior change"
      - "File: User saves → Proper storage + retrieval"
    wrong:
      - Starting with isValidInput() unit test
      - Testing isolated functions without context
      - Mocking everything
    example: |
      describe('User Persona Selection', () => {
        it('should update AI behavior when user selects new persona', async () => {
          // Actual usage scenario testing
        })
      })

  - step: GREEN
    title: Make Test Pass
    actions:
      - Write all necessary components
      - Focus on making scenario work
      - Don't optimize yet

  - step: REFACTOR
    title: Improve While Keeping Tests Passing
    actions:
      - Extract common patterns
      - Improve performance
      - Add unit tests as byproducts

testLocations:
  backend: caret-src/__tests__/
  webview: webview-ui/src/**/*.test.tsx

relatedWorkflows: [verification-steps, naming-conventions, modification-levels]

guidelines:
  - Ensures code works in real scenarios
  - Integration first prevents unit testing problems
  - Unit tests are byproducts
```

**토큰 수 (추정)**: ~350 tokens

---

## 결론 (예상)

**YAML이 가장 효율적일 것으로 예상**:
- JSON 대비 불필요한 괄호/쉼표 제거
- 마크다운 대비 구조화로 중복 제거
- 예제 코드는 `|` 블록으로 표현 가능

**하지만 마크다운의 장점**:
- AI가 이해하기 쉬운 자연어 구조
- One-shot 프롬프트로 즉시 실행 가능
- 예제가 풍부하면 학습 효과 높음

**실제 측정 필요**: Claude의 토크나이저로 정확한 토큰 수 확인
