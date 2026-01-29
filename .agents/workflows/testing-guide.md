# Testing Guide for AI Agents

## Quick Commands

```bash
# Run all tests with summary
npm run test:report

# Get JSON result for parsing
npm run test:report:json

# Run specific test suites
npm run test:unit                    # Backend tests
npm run test:webview                 # Frontend tests
npm run test:unit -- --grep "pattern" # Filter tests
```

## JSON Report Format

```json
{
  "timestamp": "2026-01-29T12:00:00+09:00",
  "unit": { "passing": 769, "failing": 7, "pending": 11 },
  "webview": { "passing": 140, "failing": 7 },
  "total": { "passing": 909, "failing": 14 },
  "status": "fail",
  "resultsDir": "/tmp/careti-test-results-xxx"
}
```

## Key Test Files

### API Configuration Tests
- `src/shared/proto-conversions/models/__tests__/api-provider-conversion.test.ts`
  - All 45+ providers roundtrip conversion
- `src/shared/proto-conversions/models/__tests__/api-config-update-integration.test.ts`
  - Full update flow simulation
- `src/shared/proto-conversions/models/__tests__/state-manager-api-config.test.ts`
  - StateManager storage/retrieval

### Adding New Tests

1. Create test file in `__tests__/` directory
2. Use mocha/chai for backend: `import { expect } from "chai"`
3. Use vitest for webview: `import { expect, test } from "vitest"`
4. Run to verify: `npm run test:unit -- --grep "TestName"`

## Debugging Test Failures

1. Run with grep to isolate: `npm run test:unit -- --grep "failing test"`
2. Check full output in results directory
3. Look for assertion messages for expected vs actual values

## CI/CD Integration

Tests are run automatically on:
- Pre-commit (lint-staged)
- PR creation
- Main branch push
