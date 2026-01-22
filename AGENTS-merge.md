# Repository Guidelines

## Project Structure & Module Organization
- Core VS Code extension code lives in `src/` (activation in `src/extension.ts`; hosts, services, and proto-generated helpers under `src/hosts`, `src/services`, `src/generated`).
- Webview UI (React + Vite + Tailwind) sits in `webview-ui/` with Storybook support; shared assets in `assets/`.
- CLI and packaging helpers reside in `cli/`, `scripts/`, and `careti-scripts/`; protocol definitions in `proto/`.
- Tests are split across `tests/` (e2e/flow), `src/test/` (extension integration harness), and `webview-ui` tests.

## Build, Test, and Development Commands
- Install deps: `npm run install:all` (root + `webview-ui`).
- Develop extension: `npm run dev` (build protos + watch TypeScript) and `npm run dev:webview` for UI-only work.
- Type checks/lint: `npm run check-types`, `npm run lint`, `npm run format` (changed files), `npm run fix:all` (aggressive).
- Build: `npm run compile` for extension, `npm run build:webview` for UI, `npm run package` for production bundle.
- Tests: `npm test` (unit + integration), `npm run test:unit`, `npm run test:integration`, `npm run e2e` (Playwright), `npm run test:webview` (Vitest), `npm run test:coverage` for coverage.

## Coding Style & Naming Conventions
- TypeScript everywhere; prefer explicit types on exports and async boundaries. React components in `webview-ui` use functional components/hooks.
- Follow Biome defaults (imports sorted, single quotes allowed per config). Run linters/formatters before pushing.
- Use `PascalCase` for React components and classes, `camelCase` for functions/variables, `SCREAMING_SNAKE_CASE` for env constants.
- Co-locate module-specific helpers with their feature directories; avoid deep relative paths by using existing tsconfig path aliases.

## Careti/Cline Merge Discipline
- When adding or altering logic not present in upstream Cline, mark the block with `// CARETI MODIFICATION` (or file-level note) adjacent to the change; keep changes minimal and localized.
- Prefer 3-way comparisons (base/cline/careti snapshots) instead of ad‑hoc edits; do not silently override upstream behavior.
- Avoid hardcoding provider or account defaults; derive from callback payload/state and keep Cline/Careti flows separate.
- Tests that encode Careti-specific expectations should clearly state the Careti path (comment or test name) so upstream/Cline behavior stays traceable.

## Testing Guidelines
- Unit tests use Mocha/Chai (`*.test.ts`) for extension logic; integration uses `vscode-test`. Webview tests use Vitest and React Testing Library.
- E2E flows use Playwright; run `npm run test:e2e:build` before `npm run e2e` if packaging is needed locally.
- Update prompt snapshots with `UPDATE_SNAPSHOTS=true npm run test:unit`.
- Prefer deterministic fixtures and avoid hitting real APIs; mock providers and file I/O where possible. Keep coverage healthy with `npm run test:coverage`.

## Commit & Pull Request Guidelines
- Write concise, present-tense commit subjects (e.g., `Fix webview auth timeout`, `Add proto build guard`). Keep related changes together.
- Before opening a PR: ensure `npm run check-types`, `npm run lint`, and relevant tests pass; include `npm run test:webview` for UI changes.
- PR description should state the problem, the solution, and test evidence; link related issues and add screenshots for UI-visible changes.
- Avoid committing generated artifacts (`dist/`, `dist-standalone/`, `out/`, `node_modules/`); run `npm run clean:build` if needed before packaging.

## 한국어 안내
- 문서/PR/커밋은 영어가 기본이지만, 설명이 더 명확하다면 한국어도 허용합니다. PR 본문에는 영어 요약 한 줄을 추가해 주세요.
- 에러 로그나 재현 절차는 원문(영문/한글) 그대로 첨부하고, 필요한 경우 짧은 영어 주석을 덧붙여 주세요.

## Security & Configuration Tips
- Do not commit API keys or user data; prefer local env files and VS Code secret storage. Check `.gitignore` before adding new config.
- When adding MCP providers or external calls, validate inputs and sanitize logs to avoid leaking tokens. Use existing config helpers in `src/config.ts`.
