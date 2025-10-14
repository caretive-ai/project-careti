# Repository Guidelines

## Project Structure & Module Organization
Source code for the VS Code extension lives in `src/`, split across `core/`, `services/`, `hosts/`, and generated clients under `src/generated/`. Extension tests are under `src/test`, with Playwright suites in `src/test/e2e`. The webview client is isolated in `webview-ui/` (Vite + TypeScript), while shared assets sit in `assets/`. Documentation belongs in `docs/` and `caret-docs/`, and automation utilities reside in `caret-scripts/` and `scripts/`. Protocol definitions appear in `proto/` and must be regenerated via project scripts.

## Build, Test, and Development Commands
Run `pnpm run compile` for type-checking, linting, and bundling. Use `pnpm run watch` while developing the extension to rebuild incrementally. Inside `webview-ui/`, `pnpm run dev:webview` launches the local Vite dev server and `pnpm run build:webview` produces production assets. Regenerate protocol clients with `pnpm run protos`, then rerun `pnpm run compile`. Execute `pnpm run test` for the core suite and `pnpm run e2e` for Playwright coverage.

## Coding Style & Naming Conventions
Biome enforces formatting (tabs width 4, trailing commas, sorted imports). Favor camelCase for functions and variables, PascalCase for classes and React components, and UPPER_SNAKE_CASE for shared constants. Keep helpers near their consumers (e.g., `src/utils/`, `webview-ui/src/lib/`). Before pushing, run `pnpm run lint` and `pnpm run format:fix` to align with repository standards.

## Caret State Management Pattern
For persistent Caret state that requires backend integration, use the CaretGlobalManager singleton pattern:
- **Hybrid storage**: Local cache for fast access, gRPC backend for persistence
- **Cross-session**: State survives VS Code restart/workspace switching
- **Example**: Input history, user preferences, authentication state
- **Implementation**: Add methods to `caret-src/managers/CaretGlobalManager.ts` using `StateServiceClient.updateSettings()` for backend communication
- **Usage**: Static accessors like `CaretGlobalManager.getInputHistory()` for frontend hooks

## Testing Guidelines
Vitest powers unit tests (`*.test.ts`) in both `src/` and `webview-ui/src/`. Integration flows rely on `vscode-test`, while browser-driven cases live in `src/test/e2e` using Playwright. After behavioral changes, capture coverage with `pnpm run test:coverage` (or the webview equivalent) and ensure Playwright specs clean up temporary workspaces.

## Commit & Pull Request Guidelines
Commit messages follow Conventional Commits (e.g., `feat(extension): add MCP registry cache`) with subjects under 72 characters and issue references like `#123` when relevant. Pull requests should summarize intent, list validation commands, and include artifacts (screenshots, recordings) for UI updates. Confirm lint, type-check, and targeted tests locally before requesting review.

## B2B Branding Workflow
When preparing a Caret → CodeCenter (or other brand) conversion, run the flow from `caret-b2b/tools/brand-converter.js` and document the session in `caret-b2b/worklog/`. If rules or guidelines change, update the matching entries in `.caretrules/workflows/` and this `AGENTS.md` together (and mirror the note in `CLAUDE.md` when access is available) so both AI and human contributors stay aligned.
