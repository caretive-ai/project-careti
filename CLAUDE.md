# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Caret** is an autonomous AI coding assistant VS Code extension that can create/edit files, run terminal commands, use the browser, and integrate with various AI models. It's a **Cline-based fork** with minimal extension strategy - preserving Cline core functionality while adding Caret-specific features through `caret-src/` directory.

- **Name Origin**: Caret refers to the '^' symbol (NOT carrot 🥕)
- **Architecture**: Direct Cline integration with Level 1-3 modification strategy
- **Repository**: https://github.com/aicoding-caret/caret

## Critical Caret-Specific Rules

### 🚨 File Modification Protocol (.cline backup deprecated - use CARET MODIFICATION only)
Before modifying ANY Cline original file:
1. **Check if it's protected**: `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`, root configs
2. **Add comment**: `// CARET MODIFICATION: [clear description]`
3. **Minimal changes**: Maximum 1-3 lines per file
4. **Complete replacement**: Never comment out old code
5. **Verify compilation**: `npm run compile` must pass

### Architecture Levels (L1→L2→L3 Framework)
- **Level 1 (Preferred)**: Independent modules in `caret-src/`, `caret-docs/` (full freedom)
- **Level 2 (Conditional)**: Minimal Cline modifications with CARET MODIFICATION comment
- **Level 3 (Last Resort)**: Direct modification with complete documentation

### Caret Extensions
- **caret-src/**: Caret-specific code (complete freedom)
- **caret-docs/**: Caret documentation system
- **caret-assets/**: Caret resources
- **caret-scripts/**: Caret automation scripts

## TDD Development Guidelines

### 🚨 Critical: Proper TDD Order

**❌ Wrong Approach (Bottom-up)**:
```
1. Write unit tests for helper functions → Implement helpers → Refactor
2. Later: "Integrate into actual usage"
```

**✅ Correct Approach (Top-down)**:
```  
1. RED: Write integration/E2E test for actual usage scenario
2. GREEN: Implement all necessary code to make integration test pass
3. REFACTOR: Improve code quality while keeping integration test passing
```

**Example - WebView Feature Development**:
- ❌ Wrong: Start with `isValidInput()` unit test
- ✅ Correct: Start with "User clicks button → Expected result shown" component test

**Example - Backend Feature Development**:
- ❌ Wrong: Start with `parseConfig()` unit test  
- ✅ Correct: Start with "Config change → System behavior change" integration test

### TDD Checklist
- [ ] Start with actual usage scenario test (integration/E2E)
- [ ] Verify test fails (RED)
- [ ] Implement minimum code to make test pass (GREEN)
- [ ] Refactor while keeping test passing
- [ ] Unit tests are byproducts, not starting points

## Common Commands

### Development
```bash
# Install dependencies for both extension and webview
npm run install:all

# Start development (launches new VS Code window with extension)
npm run watch

# Build extension
npm run compile

# Build for production
npm run package

# Build standalone version
npm run compile-standalone
```

### Testing
```bash
# 🚨 CARET SPECIFIC: Fast testing commands (use these)
npm run test:backend        # Backend tests (fast)
npm run test:webview       # Frontend tests (fast)
npm run test:backend:watch # Watch mode

# Full test suites (slower)
npm run test:all           # Complete test suite
npm run test:ci            # Full CI test suite
npm run caret:coverage     # Coverage report

# ❌ NEVER USE: npm test (extremely slow - full build+compile+lint+all tests)
```

### Code Quality
```bash
# Type checking
npm run check-types

# Linting
npm run lint

# Auto-format code
npm run format:fix

# Fix all issues (including unsafe fixes)
npm run fix:all

# Protocol buffer generation
npm run protos
```

### Webview Development
```bash
# Start webview dev server
npm run dev:webview

# Build webview for production  
npm run build:webview
```

## Architecture Overview

### Core Structure (Caret Fork)
```
src/                   # Cline original (preserve, backup before changes)
├── extension.ts       # VS Code extension entry point
├── core/             # Main extension logic
│   ├── webview/      # Webview lifecycle management
│   ├── controller/   # Message handling & task management
│   ├── task/        # Tool execution & API requests
│   ├── api/         # AI provider integrations
│   ├── context/     # Context management & tracking
│   ├── prompts/     # System prompt generation
│   └── storage/     # State persistence
├── integrations/    # External service integrations
├── services/       # Shared services (auth, logging, etc.)
├── shared/         # Types & utilities shared between extension/webview
├── hosts/          # Host platform abstractions (VS Code, external)
└── utils/         # General utilities

caret-src/            # Caret extensions (full freedom)
├── extension.ts      # Caret-specific entry points
├── core/            # Caret-specific core logic
├── shared/         # Caret-specific shared utilities
└── utils/          # Caret-specific utilities

caret-docs/          # Caret documentation (full freedom)
caret-assets/        # Caret resources (full freedom)
caret-scripts/       # Caret automation (full freedom)
webview-ui/          # React frontend (Cline original, backup before changes)
```

### Key Components

**Extension Flow**: `extension.ts` → `WebviewProvider` → `Controller` → `Task` execution

**Caret Extensions**: `CaretProvider extends WebviewProvider` (Level 1 architecture)

**Webview**: React-based UI built separately in `webview-ui/` directory using Vite

**AI Integration**: Modular provider system in `src/core/api/providers/` supporting 20+ AI services

**Tool System**: Extensible tool handlers in `src/core/task/tools/handlers/` for file operations, terminal commands, browser automation, etc.

**Context Management**: Smart context window management with file tracking and AST parsing

**MCP Integration**: Model Context Protocol support for custom tool extensions

### Caret-Specific Components
- **Brand Management**: Dynamic branding system (Caret ↔ CodeCenter switching)
- **Backend Message Processing**: OS notification and webview message branding
- **Storage Patterns**: globalState vs workspaceState consistency
- **Rule System**: JSON-based rules (`.caretrules/caret-rules.json`) with Korean docs

## Development Patterns

### Path Aliases
The project uses TypeScript path aliases defined in `tsconfig.json`:
- `@/*` → `src/*`
- `@core/*` → `src/core/*`
- `@integrations/*` → `src/integrations/*`
- `@services/*` → `src/services/*`
- `@shared/*` → `src/shared/*`
- `@utils/*` → `src/utils/*`

### Code Style
- **Formatter**: Biome (configured in `biome.jsonc`) - NOT Prettier
- **Testing**: Vitest - NOT Jest
- **Indentation**: Tabs (width 4)
- **Line width**: 130 characters
- **Semicolons**: As needed
- **Quotes**: Double quotes for JSX, preference for consistency elsewhere

### Naming Conventions (Caret-Specific)
- **Utilities**: kebab-case (`brand-utils.ts`)
- **Components**: PascalCase (`CaretProvider.ts`)
- **Tests**: Match source (`brand-utils.test.ts`)
- **Docs**: kebab-case (`new-developer-guide.mdx`)
- **Backups**: `{filename-extension}.cline`

### Testing Strategy
- **Unit tests**: Core logic and utilities
- **Integration tests**: Extension functionality with VS Code API
- **E2E tests**: Full user workflows with Playwright
- **Test files**: Located alongside source files with `.test.ts` suffix

### Protocol Buffers
The project uses protobuf for type-safe communication:
- Definitions in `proto/` directory
- Generated code in `src/generated/`
- Run `npm run protos` after modifying `.proto` files

### State Management
- Extension state persisted via VS Code's storage API
- Context tracking for file changes and model usage
- State migrations handled in `src/core/storage/state-migrations.ts`

## Key Files to Understand

### Cline Original Files (Backup Before Modifying)
- `src/extension.ts` - Extension activation and command registration
- `src/core/webview/WebviewProvider.ts` - Webview lifecycle and communication
- `src/core/controller/index.ts` - Main message routing and task coordination
- `src/core/task/index.ts` - Task execution engine and tool orchestration
- `src/core/prompts/system-prompt/` - Dynamic system prompt generation
- `src/shared/ExtensionMessage.ts` - Message types between extension and webview
- `webview-ui/src/App.tsx` - Main React application entry point

### Caret-Specific Files (Full Freedom)
- `caret-src/extension.ts` - Caret extension entry points
- `caret-src/core/webview/CaretProvider.ts` - Caret webview provider
- `caret-src/shared/brand-utils.ts` - Brand management utilities
- `caret-src/utils/` - Caret-specific utilities
- `.caretrules/caret-rules.json` - Caret development rules (AI reference)
- `caret-docs/development/caret-rules.ko.md` - Korean rule documentation

## Common Issues

### Build Issues
- Run `npm run clean` to clear build artifacts
- Ensure protobuf generation is up to date with `npm run protos`
- Check that both root and webview-ui dependencies are installed

### Testing Issues
- Linux requires specific system libraries (see CONTRIBUTING.md)
- E2E tests need the extension packaged first
- Use `npm run test:ci` for complete test validation

### Development Setup
- Install recommended VS Code extensions when prompted
- Use F5 to launch development instance
- Webview changes require extension reload in development window

## Caret Development Quick Reference

### 🚨 Pre-Development Checklist
1. **Read Rules**: Check `.caretrules/caret-rules.json` for current constraints
2. **Korean Docs**: Reference `caret-docs/development/caret-rules.ko.md` for detailed explanations
3. **TDD First**: Always start with integration tests, not unit tests
4. **Backup Required**: Before modifying any `src/`, `webview-ui/` files

### Storage Usage Patterns
- **chatSettings**: Use `workspaceState` (project-specific)
- **globalSettings**: Use `globalState` (user-wide)
- **Consistency Rule**: Save and load must use same storage type

### Protocol Buffer Field Numbering (Caret Extensions)
- **Caret Fields**: Use `current_cline_max + 1000` to avoid merge conflicts
- **Example**: If Cline's last field is `72`, Caret uses `1072+`
- **Location**: `proto/cline/models.proto` ModelsApiConfiguration message
- **Comment Format**: `// CARET MODIFICATION: Caret-specific fields (72 + 1000 = 1072+ to avoid Cline conflicts)`

### Testing Workflow
```bash
# 1. Write integration test first (TDD RED)
npm run test:webview  # Verify test fails

# 2. Implement minimal code (TDD GREEN)
npm run compile       # Verify compilation
npm run test:backend  # Verify backend tests

# 3. Refactor (TDD REFACTOR)
npm run test:all      # Full verification
```

### Rule Management System
- **AI Reference**: `.caretrules/` directory (workflows and rules)
- **Workflows**: `.caretrules/workflows/*.md` (English, AI procedures)
- **Korean Dev Docs**: `caret-docs/development/*.mdx` (Korean architecture guides)
- **English Workflows**: `caret-docs/development-en/*.md` (English workflows)
- **Note**: Korean folder has MDX architecture docs, English folder has MD workflows

### Available Workflows and Documentation

#### Workflows (`.caretrules/workflows/`)
- **Main**: `ai-work-index.md`, `ai-work-protocol.md`, `caret-development.md`
- **Architecture**: `merge-strategy.md`, `architecture-guide.md`
- **Development**: `cline-modification.md`, `new-component.md`, `testing-work.md`
- **Atoms**: `tdd-cycle.md`, `naming-conventions.md`, `storage-patterns.md`

#### Korean Dev Docs (`caret-docs/development/`)
- **Architecture**: `caret-architecture-and-implementation-guide.mdx`
- **Components**: `component-architecture-principles.mdx`
- **Frontend-Backend**: `frontend-backend-interaction-patterns.mdx`
- **AI Flow**: `ai-message-flow-guide.mdx`
- **Testing**: `testing-guide.mdx`

#### Utility Scripts (`caret-scripts/`)
- `ai-semantic-analyzer.js` - AI-powered semantic comparison
- `universal-semantic-analyzer.js` - Format comparison tool
- `token-efficiency-analyzer.js` - Token usage analysis