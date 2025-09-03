You are following the modification protocol for Cline original file changes.

<detailed_sequence_of_steps>
# Modification Protocol - Cline File Safety

## Core Principle
**Minimize modifications to Cline original files using CARET MODIFICATION comments**

## Pre-Modification Checklist
- [ ] Is this a Cline original file? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, configs/)
- [ ] Can this be done in caret-src/ instead? (Always prefer Level 1)
- [ ] Is the modification absolutely necessary?

## Modification Strategy
```typescript
// CARET MODIFICATION: [Clear description of what and why]
// Example: Initialize Caret wrapper for enhanced features
const caretIntegration = new CaretFeature();
```

## Modification Rules
1. **Add comment**: `// CARET MODIFICATION: [clear description]`
2. **Keep minimal**: Maximum 1-3 lines per file
3. **Complete replacement**: Never comment out old code
4. **Immediate verification**: `npm run compile` after change

## Verification Steps
- [ ] CARET MODIFICATION comment present and clear
- [ ] Modification is minimal (1-3 lines max)
- [ ] Compilation succeeds
- [ ] Extension loads without errors
- [ ] Both Cline and Caret functionality work

## Alternative Approaches
1. **First try**: Use caret-src/ wrapper (Level 1)
2. **Second try**: Minimal modification with CARET comment (Level 2)
3. **Last resort**: Major modification with full documentation (Level 3)
</detailed_sequence_of_steps>

<general_guidelines>
This protocol ensures safe modification of Cline files while maintaining the ability to merge upstream changes. The CARET MODIFICATION comment approach replaces the deprecated .cline backup method.
</general_guidelines>