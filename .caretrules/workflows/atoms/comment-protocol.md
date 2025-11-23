You are following the comment protocol for tracking Cline file modifications.

<detailed_sequence_of_steps>
# Comment Protocol - CARET MODIFICATION Tracking

## Core Principle
**Every Cline original file modification must be clearly marked and documented**

## Comment Format
**Required format**: `// CARET MODIFICATION: [clear description]`

### Good Examples:
```typescript
// CARET MODIFICATION: Initialize Caret wrapper for persona system
const caretWrapper = new CaretProviderWrapper(context, clineProvider);

// CARET MODIFICATION: Add branding toggle for dynamic brand switching  
const brandName = getBrandName();

// CARET MODIFICATION: Integrate i18n message filtering
const filteredMessage = filterBackendMessage(originalMessage);
```

### Bad Examples:
```typescript
❌ // Added Caret stuff
❌ // CARET: persona
❌ // Modified for branding
❌ // TODO: Caret integration
```

## Placement Rules

### Single Line Modifications:
```typescript
export function initialize(context: vscode.ExtensionContext) {
  // CARET MODIFICATION: Add Caret provider initialization
  const caretProvider = new CaretProvider(context);
  return originalInitialize(context);
}
```

### Multi-Line Modifications (1-3 lines max):
```typescript
export class MessageProcessor {
  process(message: string): string {
    // CARET MODIFICATION: Apply backend message filtering and branding
    const filteredMessage = applyBackendFilter(message);
    const brandedMessage = applyBrandReplacement(filteredMessage);
    return brandedMessage;
  }
}
```

### Block Comments for Complex Changes:
```typescript
/*
 * CARET MODIFICATION: Integrate persona-aware message processing
 * - Added persona context retrieval
 * - Modified message formatting based on selected persona
 * - Maintained backward compatibility with original flow
 */
```

## Documentation Requirements

### Comment Content Should Include:
- **What** was changed (specific functionality)
- **Why** it was necessary (business purpose)
- **How** it integrates (technical approach)

### Good Descriptions:
```typescript
// CARET MODIFICATION: Enable dynamic branding for multi-tenant support
// CARET MODIFICATION: Add TDD integration test runner for caret-src tests
// CARET MODIFICATION: Implement persona context in system prompt generation
```

### Bad Descriptions:
```typescript
❌ // CARET MODIFICATION: Fixed bug
❌ // CARET MODIFICATION: Added feature  
❌ // CARET MODIFICATION: Updated code
```

## Tracking Integration

### With Modification Protocol:
1. Verify modification approach
2. Add CARET MODIFICATION comment
3. Make minimal change
4. Verify functionality

### With Version Control:
```bash
git log --grep="CARET MODIFICATION" --oneline
# Shows all Caret modifications across history
```

## Maintenance Guidelines

### When Updating Modifications:
- Keep original CARET MODIFICATION comment
- Add new timestamp or version if significant change
- Never remove CARET MODIFICATION markers

### When Removing Modifications:
- Remove code AND comment together
- Document removal reason in commit message
- Verify no dependencies remain

## Related Workflows  
- Mandatory for `/modification-levels` L2 changes
- Used with `/modification-protocol` for safety
- Verified during `/verification-steps` compilation
</detailed_sequence_of_steps>

<general_guidelines>
This protocol enables tracking of all Caret modifications across the codebase.

Clear comments help with debugging, maintenance, and upstream merge conflict resolution.

The standardized format allows automated tooling to identify and manage modifications.
</general_guidelines>