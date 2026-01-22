You are organizing documentation to keep AI rules and developer docs aligned (AI-Developer Knowledge Parity).

<detailed_sequence_of_steps>
# Document Organization Workflow - Knowledge Parity

## Core Principle
**Developer Knowledge = AI Knowledge (1:1 parity required)**
- AI reads `.caretrules` (SoT) and loads workflows on-demand.
- Humans read `careti-docs` (KO-first), with `features.en` kept in English (optionally with KO links).
- Avoid knowledge silos and avoid duplicating the same content in multiple places.

## Source Of Truth (SoT)
- Entry point / index: `.caretrules/careti-rules.json`
- Detailed procedures: `.caretrules/workflows/*.md`
- Reusable atoms: `.caretrules/workflows/atoms/*`

## Developer Docs (Human-Facing)
- Primary entry: `careti-docs/development/index.md` (KO-first dashboard)
- Feature specs: `careti-docs/features.en/**` (EN; may link to KO counterparts)
- Work logs: `careti-docs/work-logs/**` (who/when/why/decision 기록)

## What To Do When Adding/Changing Docs

### 1) Decide doc type
- **Rule/Workflow**: anything the AI must follow → update `.caretrules` first.
- **Developer guide**: how to build/test/run/use tools locally → update `careti-docs/development/**`.
- **Feature spec**: product requirement/spec → update `careti-docs/features.en/**`.

### 2) Prefer pointers over mirrors
- If you already have an SoT workflow, do not keep a second “full copy” elsewhere.
- If a mirror exists (e.g., `careti-docs/development/workflows/**`), mark it deprecated and point to SoT.

### 3) Keep navigation consistent
- Any new/important doc should be discoverable from `careti-docs/development/index.md`.
- If a workflow exists, ensure the dashboard references the matching guide and vice versa.

## Verification Checklist (Evidence-Based)
Run lightweight checks to prevent drift:

```bash
# Verify scripts mentioned in docs exist
rg -n "npm run (test:backend|clean\\b|CLAUDE\\.md)" .caretrules careti-docs/development || true

# Verify webview path assumptions
rg -n "src/caret" .caretrules careti-docs/development || true

# Confirm test scripts and build commands (SoT)
cat package.json | sed -n '310,390p'
```

## Success Criteria
- `.caretrules` workflows reference real paths/scripts and match repository structure.
- `careti-docs/development/index.md` links to the current guides (no “orphan docs”).
- Feature specs live under `careti-docs/features.en/**` and do not duplicate developer runbooks.
</detailed_sequence_of_steps>

<general_guidelines>
Keep changes minimal and reversible: avoid deleting docs without agreement; prefer deprecating and linking first.

Never hardcode snapshot numbers (counts, exact file lists) inside workflows; they drift quickly.
</general_guidelines>
