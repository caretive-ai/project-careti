You are following Cline-compatible naming conventions for consistency.

<detailed_sequence_of_steps>
# Naming Conventions - Cline Compatibility

## Core Principle  
**Follow established Cline patterns to maintain consistency and avoid merge conflicts**

## File Naming

### Utilities (Functions/Services)
**Pattern**: `kebab-case.ts`
```
✅ brand-utils.ts
✅ message-processor.ts  
✅ persona-service.ts
❌ brandUtils.ts
❌ MessageProcessor.ts
```

### Components (Classes/React Components)
**Pattern**: `PascalCase.ts/.tsx`
```
✅ CaretProvider.ts
✅ PersonaSelector.tsx
✅ MessageHandler.ts
❌ caretProvider.ts
❌ persona-selector.tsx  
```

### Test Files
**Pattern**: Match source file exactly + `.test.ts`
```
✅ brand-utils.test.ts      (matches brand-utils.ts)
✅ CaretProvider.test.tsx   (matches CaretProvider.tsx)
❌ brandUtilsTest.ts
❌ test-brand-utils.ts
```

### Documentation
**Pattern**: `kebab-case.mdx` or `kebab-case.md`
```
✅ new-developer-guide.mdx
✅ testing-guide.mdx
✅ ai-work-index.mdx
❌ NewDeveloperGuide.mdx
❌ Testing_Guide.mdx
```

## Directory Structure

### Caret Extensions
```
caret-src/
├── services/           (kebab-case services)
├── controllers/        (kebab-case controllers)  
├── core/              (kebab-case core modules)
└── __tests__/         (test files matching source)
```

### Cline Preservation
```
src/                   (preserve existing Cline patterns)
webview-ui/           (preserve existing Cline patterns)
```

## Variable/Function Naming

### TypeScript/JavaScript
```typescript
// camelCase for variables, functions
const currentUser = getCurrentUser();
const chatSettings = getChatSettings();

// PascalCase for classes, types, interfaces
class PersonaService implements IPersonaService {
  private readonly storageService: StorageService;
}

// SCREAMING_SNAKE_CASE for constants
const DEFAULT_PERSONA_NAME = 'Assistant';
const MAX_MESSAGE_LENGTH = 4000;
```

## Verification Examples

### Good Naming:
```
caret-src/services/persona-service.ts
caret-src/services/persona-service.test.ts
caret-src/core/messaging/MessageHandler.ts
caret-src/core/messaging/MessageHandler.test.ts
```

### Bad Naming:
```
❌ caret-src/services/personaService.ts     (should be kebab-case)
❌ caret-src/core/message-handler.ts        (should be PascalCase for classes)  
❌ caret-src/services/PersonaServiceTest.ts (should match source + .test.ts)
```

## Related Workflows
- Apply when creating new files with `/modification-levels`
- Follow when writing tests with `/tdd-cycle`
- Verify consistency during `/verification-steps`
</detailed_sequence_of_steps>

<general_guidelines>
These conventions maintain consistency with Cline's existing codebase while establishing clear patterns for Caret extensions.

When in doubt, examine existing Cline files for reference patterns.

Consistency in naming reduces cognitive load and prevents merge conflicts.
</general_guidelines>