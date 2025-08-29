# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Caret** is an AI coding assistant VSCode extension built as a Cline fork. It provides autonomous coding capabilities with a human-in-the-loop approval system. The name "Caret" refers to the `^` symbol used in programming, representing position and direction in code.

- **Repository**: https://github.com/aicoding-caret/caret
- **Based on**: Cline (autonomous AI coding assistant)
- **Architecture**: Fork-based with minimal extension strategy

## Development Commands

### Build & Package Commands
```bash
# Install all dependencies (extension + webview)
npm run install:all

# Generate protobuf files (run this first)
npm run protos

# Compile TypeScript
npm run compile

# Build webview UI
npm run build:webview

# Watch mode for development
npm run watch

# Package for distribution
npm run package

# Clean build artifacts
npm clean
```

### Testing Commands
```bash
# Run all tests (backend + webview)
npm test

# Run Caret-specific tests (Vitest)
npm run test:caret

# Backend tests with watch mode
npm run test:backend:watch

# Webview/frontend tests only
npm run test:webview

# Run tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Run specific test file
npx vitest path/to/test.ts
```

### Code Quality Commands
```bash
# Type checking
npm run check-types

# Linting (Biome)
npm run lint

# Code formatting
npm run format:fix

# Fix all formatting issues (including unsafe)
npm run fix:all
```

## Architecture Overview

### Fork-Based Structure

This project extends Cline using a **minimal modification strategy**:

- **`src/`**: Cline original code (preserve as much as possible)
- **`caret-src/`**: Caret-specific extensions and features
- **`webview-ui/`**: React frontend (shared between Cline and Caret)
- **`proto/`**: Protocol buffer definitions for gRPC communication
- **`caret-docs/`**: Caret-specific documentation system

### Core Principle: Minimal Modification

When modifying Cline original files (`src/`, `webview-ui/`, `proto/`, `scripts/`):
1. **Always create backup**: `cp file.ts file-ts.cline`
2. **Add modification comment**: `// CARET MODIFICATION: description`
3. **Keep changes minimal**: 1-3 lines preferred
4. **Replace completely**: Don't comment out old code
5. **Prefer inheritance**: Extend via `caret-src/` when possible instead of direct modification

### Key Entry Points

- **Backend Entry**: `src/extension.ts` (with Caret wrapper integration)
- **Caret Extensions**: `caret-src/extension.ts` and `caret-src/core/webview/CaretProviderWrapper.ts`
- **Frontend Entry**: `webview-ui/src/App.tsx`
- **Protocol Definitions**: `proto/cline/*.proto` and `proto/caret/*.proto`

### Mode System Architecture

Caret implements a dual-mode system:
- **Chatbot Mode**: Conversational AI assistance
- **Agent Mode**: Autonomous code execution with approval

Mode switching is handled through:
- `caret-src/core/mode-system/ModeSystemRegistry.ts`
- `caret-src/core/messaging/MessageHandlerFactory.ts`

### System Prompt Architecture

Caret uses a JSON-based system prompt system:
- **Templates**: `caret-src/core/prompts/sections/*.json`
- **Assembler**: `caret-src/core/prompts/JsonSectionAssembler.ts`
- **Loader**: `caret-src/core/prompts/JsonTemplateLoader.ts`

### Persona System

AI character management through:
- **Service**: `caret-src/services/persona/persona-service.ts`
- **Storage**: `caret-src/services/persona/persona-storage.ts`
- **Controller**: `caret-src/controllers/persona/`

## Testing Strategy

### Test Framework: Vitest

Configuration in `vitest.config.ts`:
- **Include**: `caret-src/**/*.test.ts`
- **Exclude**: Cline original tests (`src/**/*`)
- **Coverage**: v8 provider with text, json, html reports

### Test Architecture Principles

1. **Service Code Purity**: Never include test-only methods in production classes
2. **TestHelper Pattern**: Use separate `*TestHelper.ts` classes in `__tests__/helpers/`
3. **TDD Methodology**: Red-Green-Refactor cycle mandatory
4. **Integration Testing**: Test complete flows in Extension Host environment
5. **Caret Testing**: Only test files in `caret-src/` to avoid Cline conflicts

### Test Categories

- **Unit Tests**: Individual components and functions
- **Integration Tests**: Complete feature flows
- **E2E Tests**: Full extension functionality

## Frontend Development

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: @heroui/react, @vscode/webview-ui-toolkit
- **State Management**: React Context (ExtensionStateContext)
- **Styling**: TailwindCSS

### Key Frontend Files

- **Main App**: `webview-ui/src/App.tsx`
- **State Context**: `webview-ui/src/context/ExtensionStateContext.tsx`
- **Caret Components**: `webview-ui/src/caret/`

### Frontend Commands

```bash
# Development server with HMR
cd webview-ui && npm run dev

# Build for production
cd webview-ui && npm run build

# Run frontend tests
cd webview-ui && npm run test
```

## Protocol Buffer System

### Proto Organization

- **Cline Protocols**: `proto/cline/*.proto`
- **Caret Extensions**: `proto/caret/*.proto`
- **Host Integration**: `proto/host/*.proto`

### Code Generation

```bash
# Generate TypeScript from proto files
npm run protos
```

Generated files go to `src/generated/` and are used for type-safe gRPC communication.

## Development Workflow

### Starting Development

1. Clone repository
2. Run `npm run install:all`
3. Run `npm run protos`
4. Run `npm run compile`
5. Press F5 in VSCode to launch extension

### File Modification Rules

**For Cline original files** (`src/`, `webview-ui/`, `proto/`, `scripts/`):
- Create `.cline` backup before modification
- Add `// CARET MODIFICATION:` comment
- Keep changes minimal (1-3 lines preferred)
- Test thoroughly after changes

**For Caret files** (`caret-src/`, `caret-docs/`, `caret-assets/`):
- No restrictions, modify freely
- Follow TypeScript and React best practices
- Write tests for new functionality

### Git Workflow

- **Main branch**: `main`
- **Feature branches**: Use descriptive names
- **Commit format**: `[type]: [description]` (feat, fix, docs, etc.)

## Key Dependencies

### Backend Dependencies

- **@anthropic-ai/sdk**: Claude AI integration
- **@modelcontextprotocol/sdk**: MCP protocol support
- **@grpc/grpc-js**: gRPC communication
- **ollama**: Local model support
- **openai**: OpenAI API integration

### Frontend Dependencies

- **react**: UI framework
- **@heroui/react**: UI components
- **@vscode/webview-ui-toolkit**: VSCode-style components
- **i18next**: Internationalization
- **framer-motion**: Animations

### Development Dependencies

- **vitest**: Testing framework (3.2.4)
- **@biomejs/biome**: Modern linting and formatting
- **esbuild**: Ultra-fast build system
- **@vscode/test-cli**: VSCode extension testing
- **@playwright/test**: E2E testing framework

## Documentation System

- **Main docs**: `caret-docs/` directory
- **Architecture guide**: `caret-docs/development/caret-architecture-and-implementation-guide.mdx`
- **Testing guide**: `caret-docs/development/testing-guide.mdx`
- **New developer guide**: `caret-docs/development/new-developer-guide.mdx`

## Important Notes

1. **VSCode Extension Testing**: Requires specific Linux libraries for headless testing
2. **Protocol Buffers**: Always run `npm run protos` after proto file changes
3. **Backup Strategy**: Critical for Cline file modifications - prevents merge conflicts
4. **TypeScript Paths**: Configured with aliases (`@caret/*`, `@src/*`, etc.)
5. **Mode System**: Central to Caret's architecture - understand before making changes
6. **Git Integration**: Claude Code settings are already excluded in `.gitignore` to prevent initialization conflicts

## Common Issues

- **Build Errors**: Often resolved by running `npm run protos` then `npm run compile`
- **Test Failures**: Check VSCode extension host setup and required libraries
- **Import Errors**: Verify TypeScript path aliases in `tsconfig.json`
- **Proto Issues**: Ensure protobuf generation completed successfully

This architecture enables Caret to extend Cline's capabilities while maintaining compatibility and minimizing maintenance overhead during upstream merges.