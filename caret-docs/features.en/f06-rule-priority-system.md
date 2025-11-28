# F06 - Rule Priority System

**Status**: ✅ Phase 2-2 complete | **Scope**: Backend (instructions/storage), Webview (settings) | **Priority**: 🟡 Medium

## 📋 Overview
Selects exactly one rules file to avoid token waste and config conflicts when multiple rule files exist.

**Priority order**: `.caretrules` > `.clinerules` > `.cursorrules` > `.windsurfrules`

## 🆚 Improvements vs Cline
| Area | Cline | Caret |
| --- | --- | --- |
| Rule loading | Loads/merges every detected rule file | Loads **only one** by priority |
| Tokens | Duplicated context | Saves context window |
| Formats | Mostly `.clinerules` | Adds `.caretrules` and other tool rules |

## 🏗 Code Scope
- **Backend logic**: `src/core/context/instructions/user-instructions/external-rules.ts` (priority), `rule-helpers.ts`, `cline-rules.ts`.
- **Task integration**: `src/core/task/index.ts` chooses the active rule only.
- **Controllers**: `src/core/controller/file/refreshRules.ts` plus `caret-src/core/controller/file/toggleCaretRule.ts`.
- **Storage**: `src/core/storage/disk.ts`, `state-keys.ts`, `utils/state-helpers.ts` define `.caretrules` paths and state.
- **Proto**: `proto/cline/file.proto` includes toggles.
- **UI**: `webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx`, `webview-ui/src/context/ExtensionStateContext.tsx`.
- **Tests**: `src/test/rule-priority.test.ts` (unit) and `rule-priority-integration.test.ts` (integration).

## 🔑 Key Logic
```typescript
// external-rules.ts
// .caretrules > .windsurfrules > .cursorrules; only the top-most stays enabled
if (caretHasFiles) {
  disableAll(cursor); disableAll(windsurf)
} else if (windsurfHasFiles) {
  disableAll(cursor)
}
```

```typescript
// task/index.ts
const activeRuleInstructions =
  caretRules ?? clineRules ?? cursorRules ?? windsurfRules

const userInstructions = addUserInstructions(
  globalClineRulesFileInstructions,
  activeRuleInstructions, // only the winner is passed forward
  undefined,
)
```

## 🧪 Tests
- **Unit**: 8 scenarios for `addUserInstructions` priority logic. 
- **Integration**: 6 filesystem scenarios (multiple files, mid-priority, single file, empty, add/remove). 
- Run:
  ```bash
  npm run test:unit -- --testPathPattern=rule-priority.test.ts
  npm run test:unit -- --testPathPattern=rule-priority-integration.test.ts
  npm run test:unit -- --testPathPattern=rule-priority
  ```

## 🔧 Merge Guide
- **Priority**: ✅ Completed | **Risk**: Low (guarded by tests). 
- Mark edits with `// CARET MODIFICATION`; keep Cline backups where applicable. 
- Ensure UI toggle modal and state keys remain aligned with proto fields.

## 🔄 Compatibility & Migration
- Existing users keep their rule files; only the highest-priority file is applied. 
- Migration path: prefer `.caretrules`; lower formats automatically disable when higher ones exist.

## 📊 Effect
- Reduced token usage by eliminating duplicate rule context. 
- Clear, deterministic rule selection for both AI and users.

## 🔮 Roadmap
- Add more automated checks for duplicate/invalid rules. 
- Consider surfacing active-rule status in UI for transparency.
