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
   - **Level 1**: Independent modules (careti-src/, careti-docs/) - Full freedom
   - **Level 2**: Conditional integration - Minimal Cline code changes
   - **Level 3**: Direct modification - Last resort with backup

## 2. Apply Merging Strategy
1. **Prefer Level 1 (Independent Module)**:
   - Create new features in `careti-src/` directory
   - Use inheritance/composition to extend Cline functionality
   - Example: `CaretProvider extends WebviewProvider`

2. **When Level 2 (Conditional Integration) needed**:
   - Add `// CARETI MODIFICATION:` comment
   - `.cline` 백업 파일은 생성하지 않음(Deprecated)
   - Make minimal 1-3 line changes
   - Use conditional logic: `if (isCaretMode()) { ... }`

3. **Level 3 (Direct Modification) - Last Resort**:
   - Only when inheritance/composition impossible
   - Document reason in CARETI MODIFICATION comment
   - Test both Cline and Caret functionality

## 3. Verification Steps
1. Verify changes are traceable and reversible:
   ```bash
   # Find CARETI MODIFICATION comments (future merge aid)
   rg "CARETI MODIFICATION" src/ webview-ui/ --glob="*.ts" --glob="*.tsx"
   # Restore with git if needed
   git checkout -- src/extension.ts
   ```

2. Test both modes:
   - Cline original functionality still works
   - Caret extensions work as expected
   - No conflicts or regressions

## 4. Future Merging Preparation
1. Document all Cline file modifications:
   ```bash
   # Find all CARETI MODIFICATION comments
   grep -r "CARETI MODIFICATION" src/ webview-ui/ --include="*.ts" --include="*.tsx"
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
   Backup: none (comment-only; restore via git if needed)
   
   Would you like me to proceed with this Cline file modification?</question>
   <options>["Yes, proceed (comment-only)", "No, find alternative approach", "Let me review the change first"]</options>
   </ask_followup_question>
   ```
</detailed_sequence_of_steps>

<general_guidelines>
Always follow the hierarchy: Level 1 → Level 2 → Level 3. Never jump directly to Level 3 without exploring Level 1 and 2 options.

When modifying Cline files, think about future merging scenarios. The fewer files modified, the easier upstream merging becomes.

Document all architectural decisions and modification reasons for future reference.
</general_guidelines>
