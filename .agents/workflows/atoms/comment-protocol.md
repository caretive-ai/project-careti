You are following the comment protocol for tracking Cline file modifications.

<detailed_sequence_of_steps>
# Comment Protocol - CARETI MODIFICATION Tracking

## Core Principle
**Every Cline original file modification must be clearly marked and documented**

## Comment Format
**Required format**: `// CARETI MODIFICATION: [clear description]`

### Good Examples:
```typescript
// CARETI MODIFICATION: Initialize Caret wrapper for persona system
const caretWrapper = new CaretProviderWrapper(context, clineProvider);

// CARETI MODIFICATION: Add branding toggle for dynamic brand switching  
const brandName = getBrandName();

// CARETI MODIFICATION: Integrate i18n message filtering
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
  // CARETI MODIFICATION: Add Caret provider initialization
  const caretProvider = new CaretProvider(context);
  return originalInitialize(context);
}
```

### Multi-Line Modifications (1-3 lines max):
```typescript
export class MessageProcessor {
  process(message: string): string {
    // CARETI MODIFICATION: Apply backend message filtering and branding
    const filteredMessage = applyBackendFilter(message);
    const brandedMessage = applyBrandReplacement(filteredMessage);
    return brandedMessage;
  }
}
```

### Block Comments for Complex Changes:
```typescript
/*
 * CARETI MODIFICATION: Integrate persona-aware message processing
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
// CARETI MODIFICATION: Enable dynamic branding for multi-tenant support
// CARETI MODIFICATION: Add TDD integration test runner for careti-src tests
// CARETI MODIFICATION: Implement persona context in system prompt generation
```

### Bad Descriptions:
```typescript
❌ // CARETI MODIFICATION: Fixed bug
❌ // CARETI MODIFICATION: Added feature  
❌ // CARETI MODIFICATION: Updated code
```

## Tracking Integration

### With Modification Protocol:
1. Verify modification approach
2. Add CARETI MODIFICATION comment
3. Make minimal change
4. Verify functionality

### With Version Control:
```bash
git log --grep="CARETI MODIFICATION" --oneline
# Shows all Caret modifications across history
```

## Maintenance Guidelines

### When Updating Modifications:
- Keep original CARETI MODIFICATION comment
- Add new timestamp or version if significant change
- Never remove CARETI MODIFICATION markers

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