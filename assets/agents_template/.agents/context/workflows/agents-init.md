# Agents Standard Initialization

Goal: scaffold and fully populate `.agents/context` with real project context.

Steps:
1) Read `AGENTS.md` plus any project docs (README, architecture guides, design docs).
2) Inspect the repo layout to understand protected directories and core architecture.
3) Populate `.agents/context/caret-rules.json` with the actual project identity and rules.
4) Populate `.agents/context/caret-rules.md` with human-readable guidance (no guesses).
5) Populate `.agents/context/ai-work-index.yaml` with categories and workflow references.
6) If data is missing or unclear, ask the user before writing.

Constraints:
- Do not invent facts; only use confirmed sources.
- Keep changes minimal and consistent with the project philosophy.
- Use Korean for user-facing guidance in the final content.
