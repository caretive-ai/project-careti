You are helping with Caret project merging strategy. Follow the merging-strategy-guide principles when handling Cline code modifications.

<detailed_sequence_of_steps>
# Caret-Cline Merging Strategy Workflow

## 1. Analyze Modification Scope
1. Identify the nature of changes needed:
   ```bash
   # Check what files are being modified
   git status
   git diff --name-only
   ```

2. Classify modification level:
   - **Level 1**: Independent modules (caret-src/, caret-docs/) - Full freedom
   - **Level 2**: Conditional integration - Minimal Cline code changes
   - **Level 3**: Direct modification - Last resort with backup

## 2. Apply Merging Strategy
1. **Prefer Level 1 (Independent Module)**:
   - Create new features in `caret-src/` directory
   - Use inheritance/composition to extend Cline functionality
   - Example: `CaretProvider extends WebviewProvider`

2. **When Level 2 (Conditional Integration) needed**:
   - Backup original file: `cp original.ts original.ts.cline`
   - Add `// CARET MODIFICATION:` comment
   - Make minimal 1-3 line changes
   - Use conditional logic: `if (isCaretMode()) { ... }`

3. **Level 3 (Direct Modification) - Last Resort**:
   - Only when inheritance/composition impossible
   - Must backup original file first
   - Document reason in CARET MODIFICATION comment
   - Test both Cline and Caret functionality

## 3. Verification Steps
1. Verify backups exist and are restorable:
   ```bash
   # Check backup files exist
   find . -name "*.cline" | head -10
   
   # Test restoration process
   cp src/extension.ts.cline src/extension.ts
   npm run compile  # Should work
   git checkout src/extension.ts  # Restore modification
   ```

2. Test both modes:
   - Cline original functionality still works
   - Caret extensions work as expected
   - No conflicts or regressions

## 4. Future Merging Preparation
1. Document all Cline file modifications:
   ```bash
   # Find all CARET MODIFICATION comments
   grep -r "CARET MODIFICATION" src/ webview-ui/ --include="*.ts" --include="*.tsx"
   ```

2. Create merge conflict resolution plan:
   - List modified files and change reasons
   - Prepare conflict resolution strategies
   - Test merge scenarios with dummy branches

## 5. Ask for User Confirmation
Before applying any Level 2 or Level 3 modifications:
   ```xml
   <ask_followup_question>
   <question>I need to modify Cline original file: {filename}
   
   Modification reason: {reason}
   Change scope: {number} lines
   Backup will be created: {filename}.cline
   
   Would you like me to proceed with this Cline file modification?</question>
   <options>["Yes, proceed with backup", "No, find alternative approach", "Let me review the change first"]</options>
   </ask_followup_question>
   ```
</detailed_sequence_of_steps>

<general_guidelines>
Always follow the hierarchy: Level 1 → Level 2 → Level 3. Never jump directly to Level 3 without exploring Level 1 and 2 options.

When modifying Cline files, think about future merging scenarios. The fewer files modified, the easier upstream merging becomes.

Document all architectural decisions and modification reasons for future reference.
</general_guidelines>