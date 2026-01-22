# AI Feature Development - Quick Reference

**Purpose**: Develop AI-related features with proper message flow, testing, and context management.

**When to use**: Adding new AI capabilities, integrating AI services, or modifying AI interaction flows.

## Core Principles

1. **Integration-First TDD**: Test complete AI interaction flow before implementation
2. **Message Flow**: Frontend ↔ Backend ↔ AI service with proper message types
3. **Context Management**: Persist conversation context with correct storage patterns
4. **Error Handling**: Robust error handling for AI service failures

## Quick Checklist

**Pre-Development:**
- [ ] Define AI service to use (Claude, GPT, local model)
- [ ] Design message types (frontend ↔ backend ↔ AI)
- [ ] Plan context persistence (workspace vs global state)
- [ ] Identify integration points with existing AI context

**TDD Cycle:**
- [ ] RED: Write integration test for complete AI flow (user input → AI → response)
- [ ] GREEN: Implement AI service integration with proper message handling
- [ ] GREEN: Implement frontend component with message flow
- [ ] REFACTOR: Add error handling, rate limiting, context optimization

**Verification:**
- [ ] `npm run test:webview` - Frontend tests pass
- [ ] `npm run test:unit` / `npm run test:integration` - Backend/unit & extension integration tests pass
- [ ] `npm run compile` - TypeScript compilation succeeds
- [ ] Manual test: Full AI interaction flow works in development window

## Key Atomic Components

- `/message-flow` - Frontend ↔ Backend ↔ AI communication patterns
- `/tdd-cycle` - Integration-first testing methodology
- `/verification-steps` - System validation steps
- `/storage-patterns` - Context persistence rules (workspace vs global)

## Common Patterns

**AI Service Integration**: AIService → query() → response formatting → context update
**Frontend Message Handling**: sendMessage() → backend processing → onMessage() → UI update
**Context Persistence**: workspace-specific data (workspaceState), user preferences (globalState)
**Error Handling**: Rate limiting, timeout/retry, graceful error responses

## Related Workflows

- `/storage-patterns` - Conversation and context persistence
- `/critical-verification` - Complex AI integration decisions
- `/new-component` - AI-related UI components
- `/cline-modification` - AI system integration points (use sparingly)

---

**📖 For detailed step-by-step workflow with code examples:**
See `.caretrules/workflows/ai-feature.md`

**📖 For Korean developer documentation:**
See `careti-docs/development/ai-feature.md`
