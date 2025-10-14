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

## 3. Frontend Link Replacement
After Cline merge, replace docs.cline.bot links with docs.caret.team:

1. **Search for links in webview-ui folder**:
   ```bash
   # Find docs.cline.bot links
   grep -r "docs\.cline\.bot" webview-ui/src --include="*.tsx" --include="*.ts" -n
   ```

2. **Add to CARET_LOCALIZED_URLS**:
   - Add new URL to `webview-ui/src/caret/constants/urls.ts`
   - Support all 4 languages (ko, en, ja, zh)
   ```typescript
   export const CARET_LOCALIZED_URLS = {
     // existing URLs...
     NEW_FEATURE_DOCS: {
       ko: "https://docs.caret.team/ko/path/to/feature",
       en: "https://docs.caret.team/en/path/to/feature",
       ja: "https://docs.caret.team/ja/path/to/feature",
       zh: "https://docs.caret.team/zh/path/to/feature",
     },
   }
   ```

3. **Use in components**:
   ```tsx
   import { getLocalizedUrl } from "@/caret/constants/urls"
   import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"

   const { language } = useCaretI18nContext()

   <a href={getLocalizedUrl("NEW_FEATURE_DOCS", language)}>
     {t("learnMore", "settings")}
   </a>
   ```

4. **Key replacement targets**:
   - FeatureSettingsSection.tsx (auto-compact, YOLO mode)
   - TerminalSettingsSection.tsx (terminal troubleshooting)
   - InfoBanner.tsx (sidebar related)
   - ClineRulesToggleModal.tsx (rules related)

## 4. Verification Steps
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

## 5. Documentation Site Synchronization (docs.caret.team)

After Cline merge, sync documentation to the multilingual docs site:

1. **Clone docs.caret.team if not exists**:
   ```bash
   cd /Users/luke/dev/caret

   # First time only
   if [ ! -d "docs.caret.team" ]; then
     git clone https://github.com/aicoding-caret/docs.caret.team
   fi
   ```

2. **Update docs.caret.team from Caret/docs**:
   ```bash
   cd docs.caret.team
   git checkout -b sync/cline-$(date +%Y%m%d)

   # Compare and identify new/changed files
   diff -qr ../docs/ docs-en/ | grep -E "Only in ../docs/|differ"

   # Copy new Cline features (brand to Caret)
   # Example: yolo-mode, dictation, multiroot-workspace
   cp ../docs/features/yolo-mode.mdx docs-en/features/
   sed -i '' 's/Cline/Caret/g' docs-en/features/yolo-mode.mdx
   sed -i '' 's/cline/caret/g' docs-en/features/yolo-mode.mdx
   sed -i '' 's/docs\.cline\.bot/docs.caret.team\/en/g' docs-en/features/yolo-mode.mdx
   ```

3. **Translate to all languages**:
   ```bash
   # Translate to Korean, Japanese, Chinese
   # docs-ko/, docs-ja/, docs-zh/

   # Update navigation
   # sidebars-en.ts, sidebars-ko.ts, sidebars-ja.ts, sidebars-zh.ts
   ```

4. **Build and verify**:
   ```bash
   npm install
   npm run build
   npm run start

   # Test all language versions
   # http://localhost:3000/en/features/yolo-mode
   # http://localhost:3000/ko/features/yolo-mode
   ```

5. **Detailed Process**:
   See comprehensive guide:
   `/Users/luke/dev/caret/caret-docs/work-logs/luke/2025-10-14-docs-caret-team-sync-analysis.md`

## 6. Future Merging Preparation
1. Document all Cline file modifications:
   ```bash
   # Find all CARET MODIFICATION comments
   grep -r "CARET MODIFICATION" src/ webview-ui/ --include="*.ts" --include="*.tsx"
   ```

2. Create merge conflict resolution plan:
   - List modified files and change reasons
   - Prepare conflict resolution strategies
   - Test merge scenarios with dummy branches

3. Update documentation site:
   - Sync new Cline features to docs.caret.team
   - Translate to 4 languages (en, ko, ja, zh)
   - Update Caret Exclusive Features section

## 7. Ask for User Confirmation
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