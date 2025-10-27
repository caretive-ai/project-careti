# New Component Creation - Quick Reference

**Purpose**: Create React components or service classes using TDD with consistent patterns and proper integration.

**When to use**: Adding new UI components, services, utilities, or any new module to the codebase.

## Core Principles

1. **Integration-First TDD**: Test actual user scenarios, not isolated units
2. **Consistent Naming**: React components (PascalCase.tsx), services (kebab-case.ts)
3. **Proper Storage**: Choose workspace vs global state appropriately
4. **Clean Integration**: Follow L1→L2→L3 hierarchy for Cline integration

## Quick Workflow

**Pre-Development:**
- [ ] Define component purpose and user interactions
- [ ] Choose storage scope (workspace vs global)
- [ ] Decide naming convention (React .tsx vs service .ts)
- [ ] Determine integration level (L1 preferred)

**TDD Cycle:**
- [ ] RED: Write integration test for user scenario (not helper units)
- [ ] GREEN: Implement minimal code to pass integration test
- [ ] REFACTOR: Improve quality, add error handling, optimize

**Verification:**
- [ ] `npm run test:webview` (React) or `npm run test:backend` (service)
- [ ] `npm run compile` - TypeScript compilation succeeds
- [ ] Manual test - F5 in VSCode development window

## Naming Conventions

**React Components (Frontend)**:
`PersonaSelector.tsx` → `PersonaSelector.test.tsx`

**Service Classes (Backend)**:
`persona-service.ts` → `persona-service.test.ts`

**Utilities**:
`message-processor.ts` → `message-processor.test.ts`

## File Structure

**React Component**:
```
webview-ui/src/caret/components/
├── ComponentName.tsx
├── ComponentName.test.tsx
└── ComponentName.module.css (optional)
```

**Service Class**:
```
caret-src/services/
├── service-name.ts
├── service-name.test.ts
└── types/service-types.ts
```

## Key Atomic Components

- `/tdd-cycle` - RED→GREEN→REFACTOR methodology
- `/naming-conventions` - File and variable naming standards
- `/storage-patterns` - Workspace vs global state rules
- `/verification-steps` - Testing and compilation validation

## Related Workflows

- `/message-flow` - Frontend-backend communication patterns
- `/cline-modification` - When integrating with Cline components
- `/critical-verification` - For complex component designs
- `/modification-levels` - L1 (caret-src/) vs L2/L3 integration

---

**📖 For detailed workflow with code examples:**
See `.caretrules/workflows/new-component.md`

**📖 For Korean developer documentation:**
See `caret-docs/development/component-architecture-principles.md`