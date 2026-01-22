# Critical Verification - Quick Reference

**Purpose**: Systematic 3-stage analysis approach to avoid both excessive criticism and blind acceptance.

**When to use**: Document review, code-documentation gap analysis, inconsistency detection, architectural decisions.

## Core Principle

**Balanced Analysis**: Neither attack everything nor accept everything blindly.
Use 3-stage systematic approach for constructive verification.

## Quick Workflow

**Stage 1: Critical Position (찾아내기)**
- Identify inconsistencies, missing elements, contradictions
- List potential problems without solutions
- Mindset: "What could be wrong here?"

**Stage 2: Counter-Critical Position (옹호하기)**
- Consider planned future states, alternative interpretations
- Check if issues are transition phases
- Mindset: "How could this actually be correct?"

**Stage 3: Collaborative Resolution (해결하기)**
- Verify actual current state through investigation
- Propose concrete actions for improvement
- Mindset: "What's the most practical solution?"

## Common Scenarios

**Document Inconsistencies**: Critical → Counter → Check use cases → Harmonize
**Missing Features**: Critical → Counter → Verify implementation status → Update docs
**Code vs Docs**: Critical → Counter → Align with reality → Note future plans separately

## Success Criteria

- [ ] Balanced analysis (not overly harsh, not blindly accepting)
- [ ] Evidence-based conclusions (actual investigation)
- [ ] Constructive outcome (focus on improvement)
- [ ] Clear action items (specific resolution steps)

## Integration

- Use before `/document-organization` for clean foundation
- Apply during `/ai-work-protocol` Phase 0 for document review
- Essential for `/careti-development` when modifying existing systems

---

**📖 For detailed workflow with examples:**
See `.agents/workflows/critical-verification.md`

**📖 For Korean developer documentation:**
See `careti-docs/development/critical-verification.md` (if exists)