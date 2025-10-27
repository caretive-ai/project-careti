You are working on Caret project development following the established patterns and protocols.

<detailed_sequence_of_steps>
# Caret Development Workflow

## 1. Pre-Development Analysis
1. Identify work nature and required documents:
   ```xml
   <ask_followup_question>
   <question>What type of development work is this?
   
   - Frontend-Backend interaction
   - Cline original file modification  
   - Component/UI development
   - Testing related work
   - Other (specify)
   
   This determines which mandatory documents I need to check.</question>
   <options>["Frontend-Backend", "Cline Modification", "Component/UI", "Testing", "Other"]</options>
   </ask_followup_question>
   ```

2. Check mandatory documents based on work type:
   - **Cline Modification**: Backup rules, CARET MODIFICATION requirements
   - **Frontend-Backend**: Interaction patterns, architecture guide
   - **Component/UI**: Component principles, theme integration
   - **Testing**: TDD protocols, testing guide

## 2. TDD Implementation
1. **RED Phase**: Write failing integration test first
   ```bash
   # Create test file in correct location
   touch src/caret/**/*.test.{ts,tsx}
   
   # Verify test runs and fails
   npm run test:webview
   ```

2. **GREEN Phase**: Minimal implementation to pass test
   - Check if Cline file modification needed
   - If yes: Create backup `cp original.ts original.ts.cline`
   - Add `// CARET MODIFICATION:` comment
   - Make minimal 1-3 line changes

3. **REFACTOR Phase**: Improve code quality
   ```bash
   # Verify entire system still works
   npm run compile
   npm run test:all
   ```

## 3. Verification Steps
1. Run comprehensive tests:
   ```bash
   # Backend tests
   npm run test:backend
   
   # Frontend tests  
   npm run test:webview
   
   # Type checking
   npm run check-types
   
   # Linting
   npm run lint
   ```

2. Verify no Cline functionality broken:
   ```bash
   # Test original Cline features
   npm run watch  # Launch VS Code extension
   # Manual testing of core Cline functionality
   ```

## 4. Documentation Updates
1. Update relevant documentation if new patterns discovered
2. Add examples to development guides
3. Update work logs with findings

## 5. Ask for Confirmation
Before making any Cline file modifications:
   ```xml
   <ask_followup_question>
   <question>I need to modify Cline original file: {filename}
   
   Reason: {modification_reason}
   Lines affected: {number}
   Backup will be created as: {filename}.cline
   
   This follows Level 2 conditional integration approach.
   
   Proceed with modification?</question>
   <options>["Yes, create backup and modify", "No, find alternative approach", "Show me the planned changes first"]</options>
   </ask_followup_question>
   ```
</detailed_sequence_of_steps>

<general_guidelines>
Always follow the TDD cycle: integration test first, then minimal implementation, then refactor.

Never modify Cline files without backup and CARET MODIFICATION comment.

Prefer Level 1 (independent modules) over Level 2 (conditional integration).

Document new patterns and update guides when discoveries are made.

## Internationalization (i18n) Guidelines

**Namespace Rules**:
- Use feature-based namespaces: Each feature has its own JSON file
- `common.json`: Shared UI elements only (`button.save`, `error.generic`)
- `settings.json`: Settings content (`providers.openrouter.name`)
- Never include namespace in key name

**Translation Usage**:
```typescript
// ✅ Correct
t('providers.openrouter.name', 'settings')
t('button.save', 'common')

// ❌ Wrong
t('settings.providers.openrouter.name')
t('common.button.save')
```

**Dynamic Pattern** (for language switching):
- Convert static constants to dynamic functions
- Use `useMemo(() => getFunction(), [language])` in components
- Reference: `.caretrules/workflows/atoms/i18n-dynamic-pattern.md`
</general_guidelines>