# Merge Log for `.vscodeignore`

## 1. Merge Analysis (3-way diff)

### `UPSTREAM` (Cline) Changes
- **Approach**: Continues to use a "blacklist" approach, where specific files and directories are excluded.
- **New Ignores**: Added rules to ignore Storybook files (`**/*.stories.tsx`, `storybook-static`) and the `standalone/**` directory.

### `HEAD` (Caret) Changes
- **Approach**: Fundamentally changed to a "whitelist" approach. It ignores everything by default (`**`) and then explicitly includes (`!`) only the necessary files and directories for the final extension package.
- **Rationale**: This change was a deliberate architectural decision in Caret to prevent complex submodules (`caret-b2b`, `spec-kit`, etc.) from being accidentally packaged into the VSCode extension, which could lead to a bloated and incorrect build.
- **Caret-Specific Inclusions**: Added `!caret-src/**` to ensure Caret's core extension source code is included in the final package.

## 2. Merge Strategy

A simple line-by-line merge is not feasible due to the conflicting approaches (blacklist vs. whitelist).

The Caret "whitelist" approach is architecturally superior for this project's complexity, as it provides a more robust and safer way to build the extension package. It guarantees that no unintended files are included.

Therefore, the merge strategy is to **adopt the `HEAD` (Caret) version entirely**. This preserves the safer whitelist architecture while implicitly respecting Cline's new ignores (like Storybook files), as they are already excluded by the default `**` rule.

**Decision**: Use the `HEAD` version of the file (`--ours`).

## 3. Final Merged Code

(The final code will be identical to the `HEAD` version.)
