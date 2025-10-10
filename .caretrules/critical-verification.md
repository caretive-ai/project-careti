You are performing critical verification using the 3-stage analysis approach to avoid both excessive criticism and blind acceptance.

<detailed_sequence_of_steps>
# Critical Verification Workflow - 3-Stage Analysis

## Core Principle
**Avoid bias in both directions**: Neither attack everything nor accept everything blindly.
Use systematic 3-stage approach for balanced, constructive analysis.

## Stage 1: Critical Position (찾아내기)
**Mindset**: "What could be wrong here?"
- [ ] Identify apparent inconsistencies
- [ ] Find missing elements or contradictions  
- [ ] Note deviations from expected patterns
- [ ] List potential problems without solutions yet

**Output**: Raw list of concerns and issues

**Example**:
- JSON rule says `npm run test:backend` but package.json has no such command
- Documentation claims Biome but some configs show ESLint
- References to directories that don't exist

## Stage 2: Counter-Critical Position (옹호하기)  
**Mindset**: "How could this actually be correct?"
- [ ] Consider if issues are planned future states
- [ ] Look for alternative interpretations
- [ ] Check if problems are transition phases
- [ ] Find evidence supporting the original approach

**Output**: Balanced perspective on each concern

**Example**:
- `test:backend` might be a planned command, not implemented yet
- Biome/ESLint mix might be gradual migration in progress
- Missing directories might be part of architectural plan

## Stage 3: Collaborative Resolution (해결하기)
**Mindset**: "What's the most practical solution?"
- [ ] Verify actual current state through investigation
- [ ] Determine what should be corrected vs what's actually correct
- [ ] Propose concrete actions that improve the situation
- [ ] Focus on constructive outcomes, not blame

**Output**: Actionable resolution plan

**Example Investigation Commands**:
```bash
# Check actual test file locations
find . -name "*.test.ts" -o -name "*.test.js" | head -10

# Verify package.json commands
grep -A5 -B5 "test:" package.json

# Check actual directory structure
ls -la caret-src/ 2>/dev/null || echo "Directory doesn't exist yet"
```

## Verification Cycle Application

### For Document Inconsistencies:
1. **Critical**: "These docs contradict each other"
2. **Counter**: "Maybe they address different scenarios" 
3. **Resolution**: Check actual use cases and harmonize

### For Missing Features:
1. **Critical**: "Feature X is documented but doesn't exist"
2. **Counter**: "Maybe it's planned for next implementation"
3. **Resolution**: Verify implementation status and update docs accordingly

### For Code vs Documentation Gaps:
1. **Critical**: "Code doesn't match documentation"
2. **Counter**: "Maybe documentation shows target state"
3. **Resolution**: Align docs with current reality, note future plans separately

## Success Criteria
- **Balanced Analysis**: Neither overly harsh nor blindly accepting
- **Evidence-Based**: All conclusions supported by actual investigation
- **Constructive Outcome**: Focus on improvement, not criticism
- **Clear Action Items**: Specific steps to resolve inconsistencies

## Integration with Other Workflows
- Use before `/document-organization` to ensure clean foundation
- Apply during `/ai-work-protocol` Phase 0 for document review
- Essential for `/caret-development` when modifying existing systems
</detailed_sequence_of_steps>

<general_guidelines>
This workflow prevents both excessive criticism (attacking everything) and blind acceptance (missing real problems).

The goal is constructive verification that leads to actual improvements, not just finding fault.

Always end with concrete actions to resolve the identified issues.
</general_guidelines>