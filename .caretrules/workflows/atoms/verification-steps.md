You are following the mandatory verification sequence after every change.

<detailed_sequence_of_steps>
# Verification Steps - Test → Compile → Execute Sequence

## Core Principle
**Every change must pass all three verification steps before completion**

## Step 1: Test Verification
**Run appropriate tests based on change scope**

### Backend Changes:
```bash
# Fast backend-specific tests
npm run test:webview  # For webview changes
# Note: test:backend planned but not yet implemented
```

### Full Test Coverage:
```bash
# When comprehensive testing needed
npm run test:all
npm run test:coverage  # For coverage analysis
```

### Test Requirements:
- [ ] All existing tests still pass
- [ ] New functionality has tests (following `/tdd-cycle`)
- [ ] No test failures or warnings

## Step 2: Compile Verification  
**Ensure TypeScript compilation succeeds**

```bash
# Primary compilation check
npm run compile

# Type checking
npm run check-types

# Protocol buffer generation (if proto files changed)
npm run protos
```

### Compilation Requirements:
- [ ] Zero TypeScript errors
- [ ] All type definitions valid
- [ ] Import/export statements correct
- [ ] Protocol buffers generated successfully (if applicable)

## Step 3: Execute Verification
**Test actual functionality in running environment**

### Development Testing:
```bash
# Start development environment
npm run watch
# Press F5 in VSCode to launch extension
```

### Manual Verification Checklist:
- [ ] Extension loads without errors
- [ ] New functionality works as expected  
- [ ] Existing functionality unaffected
- [ ] No console errors or warnings
- [ ] UI renders correctly (if applicable)

## Failure Response Protocol

### If Tests Fail:
1. **Don't proceed** - fix test issues first
2. Review test output for specific failures
3. Apply `/tdd-cycle` principles to fix

### If Compilation Fails:
1. **Don't proceed** - resolve TypeScript errors
2. Check import paths and type definitions
3. Regenerate proto files if needed

### If Execution Fails:
1. **Don't proceed** - debug runtime issues
2. Check browser console for errors
3. Verify extension activation and functionality

## Integration with Modification System
**If using `/modification-protocol` (L2 modifications):**
- If verification fails: revert to original code
- Fix issues and retry verification sequence
- Never commit failed verification changes

## Related Workflows
- Essential part of `/tdd-cycle` completion
- Required for all `/modification-levels` 
- Use `/modification-protocol` for safe experimentation
</detailed_sequence_of_steps>

<general_guidelines>
This verification sequence prevents broken code from being committed or deployed.

The three-step approach catches different types of issues at appropriate stages.

Never skip verification - it saves time by catching issues early.
</general_guidelines>