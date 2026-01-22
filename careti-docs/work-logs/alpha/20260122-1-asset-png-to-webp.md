# PNG to WebP Asset Path Migration Plan

**Date:** 2026-01-22
**Agent:** Alpha

## 1. Objective
Project-wide asset path migration from `.png` to `.webp` format to reflect the new asset standards.

## 2. Analysis
A `grep` command was executed to find all occurrences of `.png` references. The results indicate that multiple source code files, documentation files, and configuration files contain direct references to `.png` assets. These paths need to be updated.

## 3. Files to Modify

The following files have been identified for modification:

- `careti-src/core/prompts/SYSTEM_PROMPT_MESSAGE.ts`
- `careti-src/core/webview/WelcomeBanner.ts`
- `cli-careti/README.md`
- `docs/core-features/context-awareness.md`
- `docs/core-features/model-context-protocol.md`
- `docs/getting-started/installation.md`
- `docs/introduction/overview.md`
- `docs/merging/introduction-to-merging.md`
- `webview-ui/src/careti/components/PersonaAvatar.tsx`
- `webview-ui/src/careti/components/Welcome/CaretWelcome.tsx`

## 4. Execution Strategy

Each file will be updated using the `replace_in_file` tool to replace the `.png` extension with `.webp` in the relevant asset paths.

### Step 1: Backend & Core Logic
- **File**: `careti-src/core/prompts/SYSTEM_PROMPT_MESSAGE.ts`
  - **Change**: `assets/agent_profile.png` -> `assets/agent_profile.webp`, `assets/agent_thinking.png` -> `assets/agent_thinking.webp`
- **File**: `careti-src/core/webview/WelcomeBanner.ts`
  - **Change**: `assets/welcome-banner.png` -> `assets/welcome-banner.webp`

### Step 2: CLI Documentation
- **File**: `cli-careti/README.md`
  - **Change**: `./assets/icon.png` -> `./assets/icon.webp` (Assuming converted file exists)

### Step 3: General Documentation
- **Files**: All `docs/**/*.md` files listed above.
  - **Change**: `image-name.png` -> `image-name.webp`

### Step 4: Frontend Components
- **File**: `webview-ui/src/careti/components/PersonaAvatar.tsx`
  - **Change**: `.../${persona}.png` -> `.../${persona}.webp`
- **File**: `webview-ui/src/careti/components/Welcome/CaretWelcome.tsx`
  - **Change**: `/assets/welcome-banner.png` -> `/assets/welcome-banner.webp`

## 5. Verification
After all modifications are complete, a final `grep` will be run to ensure no `.png` references remain in the modified files.
