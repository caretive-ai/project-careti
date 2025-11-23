# Workflow: Merging Upstream Changes

## 🎯 Goal
Merge the latest Cline upstream version into Caret while preserving all Caret features.

## 📚 References
- **Master Guide**: `caret-docs/merging/merge-standard-guide.md` (READ THIS FIRST)
- **Strategy Guide**: `caret-docs/merging/merging-strategy-guide.md`

## 🚦 Steps
1. **Preparation**:
   - Read `caret-docs/merging/merge-standard-guide.md` to understand the current phase and critical files.
   - Ensure `auto_read_paths` are loaded.

2. **Execution**:
   - Follow the "Phase-by-Phase" process in the Master Guide.
   - Apply the **Hybrid Pattern** for any logic conflicts.
   - Use **Logic-based 3-way Comparison** for verification.

3. **Verification**:
   - Verify `Critical Files` (App.tsx, Providers.tsx, etc.) as listed in the Master Guide.
   - Run `npm run compile` and `npm run test:backend`.
