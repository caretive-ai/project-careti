You are verifying semantic equivalence between Markdown and JSON workflow formats using established methodology.

<detailed_sequence_of_steps>
# Semantic Equivalence Verification - JSON vs Markdown Validation

## Core Principle
**Ensure JSON format preserves 100% functional equivalence with Markdown while achieving token efficiency**

## Verification Methodology (Based on Caret JSON System Prompt Analysis)

### Step 1: Functional Coverage Analysis
**Compare information completeness:**
- [ ] All core principles preserved
- [ ] All procedural steps included
- [ ] All constraints and rules maintained  
- [ ] All verification steps present
- [ ] All related workflows referenced

### Step 2: Execution Equivalence Test
**Verify both formats produce identical actions:**
- [ ] Same command sequences generated
- [ ] Same validation steps performed
- [ ] Same error handling procedures
- [ ] Same recovery processes followed

### Step 3: AI Behavioral Testing  
**Test actual AI interpretation:**
```
Test Scenario: "Modify src/extension.ts file"

Markdown Format Result:
1. Check if Cline original: ✓
2. Add comment: // CARET MODIFICATION: [description]
3. Limit changes: 1-3 lines max
4. Verify: npm run compile

JSON Format Result:
1. Check protected_dirs: ✓
2. Apply modification_rules.comment: // CARET MODIFICATION: [description]  
3. Enforce modification_rules.max_lines: 3
4. Run modification_rules.verification: npm run compile

Expected: Identical execution flow ✓
```

### Step 4: Quantitative Analysis
**Measure efficiency gains:**
```javascript
// Token counting (using established method)
const markdownTokens = approximateTokenCount(markdownContent);
const jsonTokens = approximateTokenCount(jsonContent);
const efficiency = ((markdownTokens - jsonTokens) / markdownTokens * 100);

// Target: >40% token reduction without functional loss
```

### Step 5: Semantic Equivalence Score Calculation
**Based on Caret JSON System Prompt methodology:**

```javascript
const semanticScore = {
  functionalCoverage: (preservedFeatures / totalFeatures) * 100,
  executionEquivalence: (identicalCommands / totalCommands) * 100, 
  constraintPreservation: (preservedConstraints / totalConstraints) * 100,
  relationshipMaintenance: (preservedRelations / totalRelations) * 100
};

const overallScore = (
  semanticScore.functionalCoverage * 0.4 +
  semanticScore.executionEquivalence * 0.3 +
  semanticScore.constraintPreservation * 0.2 +
  semanticScore.relationshipMaintenance * 0.1
);

// Target: >95% semantic equivalence score
```

## Verification Results Template

### ✅ Equivalence Confirmed Areas:
- Core principles: 100% preserved
- Command sequences: 100% identical
- Constraint rules: 100% maintained
- Verification steps: 100% preserved

### ⚠️ Format Differences (Non-Functional):
- Presentation: Natural language vs Structured data
- Accessibility: Human-readable vs Machine-optimized
- Processing: Sequential reading vs Direct access

### 🎯 Final Equivalence Score: X.X%

**Token Efficiency**: X.X% reduction
**Functional Preservation**: X.X% maintained
**Behavioral Consistency**: X.X% identical

## Integration with Other Workflows
- Apply before converting any Markdown workflows to JSON
- Use with `/critical-verification` for validation decisions
- Essential for `/document-organization` quality assurance
- Required for atomic workflow JSON conversion validation

## Reference Implementation
Based on proven methodology from:
`caret-main/caret-docs/reports/json-caret/semantic-equivalence-report.md`

This established approach achieved 95.2% semantic equivalence while maintaining full functional coverage.

## Automated Tool Usage
Use the automated semantic equivalence checker:
```bash
node caret-scripts/utils/semantic-equivalence-checker.js <markdown-file> <json-file>
```

Example:
```bash
node caret-scripts/utils/semantic-equivalence-checker.js .caretrules/workflows/backup-protocol.md caret-docs/experiments/backup-protocol-json.json
```

For advanced analysis, use the universal analyzer:
```bash
node caret-scripts/utils/universal-semantic-analyzer.js <file1> <file2> workflow markdown json
```

The tool provides:
- Token efficiency analysis (target: >40% reduction)
- Functional coverage analysis (target: >95%)
- Execution equivalence testing (target: >95%) 
- Overall semantic score calculation (target: >95.2%)
</detailed_sequence_of_steps>

<general_guidelines>
This verification methodology ensures JSON conversion preserves complete functional equivalence.

The quantitative approach provides objective validation of semantic preservation.

Use this workflow before any format conversion to guarantee quality and consistency.
</general_guidelines>