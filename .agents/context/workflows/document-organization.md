You are organizing documentation to keep AI rules and developer docs aligned (AI-Developer Knowledge Parity).

<detailed_sequence_of_steps>
# Document Organization Workflow - Knowledge Parity

## Core Principle
**Developer Knowledge = AI Knowledge (1:1 parity required)**
- AI reads `.agents/context` (SoT) and loads workflows on-demand.
- Humans read `caret-docs` (KO-first), with `features.en` kept in English (optionally with KO links).
- `docs/` is the original Cline documentation (English). Do not edit.
- `docs.caret.team/` is a multilingual delivery site generated from `docs/` + Caret additions.
- Avoid knowledge silos and avoid duplicating the same content in multiple places.

## Source Of Truth (SoT)
- Entry point / index: `.agents/context/caret-rules.json`
- Detailed procedures: `.agents/context/workflows/*.md`
- Reusable atoms: `.agents/context/workflows/atoms/*`

## Developer Docs (Human-Facing)
- Primary entry: `caret-docs/development/index.md` (KO-first dashboard)
- Feature specs: `caret-docs/features.en/**` (EN; may link to KO counterparts)
- Work logs: `caret-docs/work-logs/**` (who/when/why/decision 기록)

## What To Do When Adding/Changing Docs

### 1) Decide doc type
- **Rule/Workflow**: anything the AI must follow → update `.agents/context` first.
- **Developer guide**: how to build/test/run/use tools locally → update `caret-docs/development/**`.
- **Feature spec**: product requirement/spec → update `caret-docs/features.en/**`.
- **User-facing content**: update `caret-docs/user-guide/**` (KO) and create `.en` variants if English is required.

### 2) Prefer pointers over mirrors
- If you already have an SoT workflow, do not keep a second “full copy” elsewhere.
- If a mirror exists (e.g., `caret-docs/development/workflows/**`), mark it deprecated and point to SoT.

### 3) Keep navigation consistent
- Any new/important doc should be discoverable from `caret-docs/development/index.md`.
- If a workflow exists, ensure the dashboard references the matching guide and vice versa.

## How To Update Documentation & AI Guides

### A) Document Updates (Human Guides)
1. Update the SoT in `.agents/context` first (rule or workflow).
2. Update the Korean guide in `caret-docs/development/**` for human-readable parity.
3. If the feature spec is user-facing, update `caret-docs/features.en/**` (English).
4. Add/refresh links in `caret-docs/development/index.md`.

### B) AI Guide Updates (System Prompt / Behavior)
1. Update SoT rules or system prompt sources under `.agents/context/**`.
2. Update the readable Korean prompt docs under `caret-docs/system-prompts-ko/**`.
3. If prompt behavior changes affect developers, add notes to `caret-docs/development/**`.
4. Verify `ai-work-index.yaml` if new workflows or categories are added.

## Workflow → Skill Candidate Review

If a workflow is repetitive, deterministic, and already backed by a script, consider converting it into a Skill:
- **Good candidates**: model list regeneration, proto generation, lint/test preset runs.
- **Not candidates**: tasks requiring architecture decisions or human judgment.

## Verification Checklist (Evidence-Based)
Run lightweight checks to prevent drift:

```bash
# Verify scripts mentioned in docs exist
rg -n "npm run (test:backend|clean\\b|CLAUDE\\.md)" .agents/context caret-docs/development || true

# Verify webview path assumptions
rg -n "src/caret" .agents/context caret-docs/development || true

# Confirm test scripts and build commands (SoT)
cat package.json | sed -n '310,390p'
```

## Success Criteria
- `.agents/context` workflows reference real paths/scripts and match repository structure.
- `caret-docs/development/index.md` links to the current guides (no “orphan docs”).
- Feature specs live under `caret-docs/features.en/**` and do not duplicate developer runbooks.
</detailed_sequence_of_steps>

<general_guidelines>
Keep changes minimal and reversible: avoid deleting docs without agreement; prefer deprecating and linking first.

Never hardcode snapshot numbers (counts, exact file lists) inside workflows; they drift quickly.
</general_guidelines>
