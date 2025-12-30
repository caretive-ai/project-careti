You are safely modifying Cline original files using the atomic workflow combination.

<detailed_sequence_of_steps>
# Cline Modification - Safe Integration Workflow

## Atomic Components Used
- `/modification-levels` - L1→L2→L3 decision framework
- `/comment-protocol` - CARET MODIFICATION tracking
- `/verification-steps` - Test→Compile→Execute validation

## Pre-Modification Phase

### Step 1: Level Assessment (`/modification-levels`)
- [ ] Can this be Level 1 (caret-src/)? → If yes, stop here, use caret-src/
- [ ] Must be Level 2 (minimal Cline change)? → Continue workflow
- [ ] Requires Level 3 (major change)? → Requires full documentation

### Step 2: Backup 정책
- `.cline` 백업 파일 생성 규칙은 **deprecated** 입니다(새로 만들지 않습니다).
- 안전장치는 `// CARET MODIFICATION:` 주석 + 최소 변경 + 테스트/컴파일 검증으로 대체합니다.

## Modification Phase

### Step 3: Minimal Modification  
**Apply Level 2 constraints:**
- Maximum 1-3 lines per file
- Complete replacement, never comment out old code
- Focus on integration points only

### Step 4: Comment Addition (`/comment-protocol`)
```typescript
// CARET MODIFICATION: [Clear description of what and why]
const caretIntegration = new CaretFeature();
```

**Comment Requirements:**
- Describe what was changed
- Explain why it was necessary  
- Note integration approach

### Step 4.5: Protocol Buffer Field Numbering (For .proto files)
**When modifying `proto/cline/models.proto`:**
```protobuf
// CARET MODIFICATION: Caret-specific fields (current_max + 1000 to avoid Cline conflicts)
optional string caret_api_key = 1072; // If Cline's max is 72, use 72 + 1000 = 1072
optional string next_caret_field = 1073; // Sequential increment
```

**Field Numbering Rules:**
- Find current Cline maximum field number
- Add 1000 for sufficient separation 
- Use sequential numbering for multiple Caret fields
- Always include calculation in comment

## Post-Modification Phase

### Step 5: Verification Sequence (`/verification-steps`)
```bash
# 1. Test (if applicable)
npm run test:webview  # For webview changes

# 2. Compile (mandatory)  
npm run compile

# 3. Execute (mandatory)
npm run watch  # Then F5 to test extension
```

### Step 6: Validation Checklist
- [ ] Extension loads without errors
- [ ] New functionality works as expected
- [ ] Existing Cline functionality unaffected
- [ ] No console errors or warnings
- [ ] CARET MODIFICATION comment present and clear

## Recovery Procedures

### If Verification Fails:
```bash
# git을 기준으로 되돌립니다(예: git checkout -- filename.ext)
# 가능하면 caret-src/로 이동하거나, 최소 변경으로 재조정합니다.
```

### If Integration Issues:
1. **First try**: Reduce modification scope further
2. **Second try**: Move logic to caret-src/ wrapper
3. **Last resort**: Document as Level 3 requirement

## Example Workflow Execution

```typescript
// Example: Adding Caret provider integration to extension.ts

// 1. Level Assessment: Must integrate with Cline activation → Level 2
// 2. Minimal modification:

export async function activate(context: vscode.ExtensionContext) {
  // CARET MODIFICATION: Initialize Caret wrapper for enhanced features
  const caretProvider = new CaretProviderWrapper(context);
  
  // Original Cline activation continues...
  const provider = new ClineProvider(context);
  // ... rest unchanged
}

// 4. Verification: npm run compile && npm run watch
// 5. Testing: F5 → verify both Cline and Caret work
```

## Integration Notes

### Works Well With:
- Simple integration points
- Wrapper pattern implementations  
- Configuration additions
- Event handler modifications

### Avoid For:
- Complex logic changes
- Major architectural modifications
- Multiple file changes for single feature

## New File Exception (tests etc.)
- 불가피하게 보호 디렉토리(`src/`, `webview-ui/` 등)에 **신규 파일**을 추가해야 하는 경우(예: TDD 테스트),
  파일 최상단에 `// CARET MODIFICATION:`으로 “Caret에서 추가한 파일”임을 명확히 표시합니다.

## Related Workflows
- Use `/critical-verification` when uncertain about approach
- Consider `/tdd-cycle` for testing integration points
- Apply `/storage-patterns` for any state management needs
</detailed_sequence_of_steps>

<general_guidelines>
This workflow ensures safe modification of Cline files while preserving the ability to merge upstream changes.

The atomic approach provides clear procedures at each step, reducing the risk of introducing bugs or conflicts.

When in doubt, prefer caret-src/ implementations over Cline file modifications.
</general_guidelines>
