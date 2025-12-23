# 20251223-9 CLI repeat loop guard

- Goal: stop CLI repeat API loop when Caret mode returns tool-less response
- Scope: core task loop guard + integration-first test, minimal change
- Approach: TDD (integration first), then minimal code change in src/core/task
- Tests: npm run test:unit -- <new test path>
- Status: started
