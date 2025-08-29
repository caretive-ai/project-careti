# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cline is an autonomous AI coding assistant VS Code extension that can create/edit files, run terminal commands, use the browser, and integrate with various AI models. It's built with TypeScript and React, supporting multiple AI providers (Anthropic, OpenAI, OpenRouter, etc.) and the Model Context Protocol (MCP) for extensibility.

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
# Run all tests
npm run test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:ci           # Full CI test suite

# Run webview tests
npm run test:webview
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

### Core Structure
```
src/
├── extension.ts         # VS Code extension entry point
├── core/               # Main extension logic
│   ├── webview/        # Webview lifecycle management
│   ├── controller/     # Message handling & task management
│   ├── task/          # Tool execution & API requests
│   ├── api/           # AI provider integrations
│   ├── context/       # Context management & tracking
│   ├── prompts/       # System prompt generation
│   └── storage/       # State persistence
├── integrations/      # External service integrations
├── services/         # Shared services (auth, logging, etc.)
├── shared/           # Types & utilities shared between extension/webview
├── hosts/            # Host platform abstractions (VS Code, external)
└── utils/           # General utilities
```

### Key Components

**Extension Flow**: `extension.ts` → `WebviewProvider` → `Controller` → `Task` execution

**Webview**: React-based UI built separately in `webview-ui/` directory using Vite

**AI Integration**: Modular provider system in `src/core/api/providers/` supporting 20+ AI services

**Tool System**: Extensible tool handlers in `src/core/task/tools/handlers/` for file operations, terminal commands, browser automation, etc.

**Context Management**: Smart context window management with file tracking and AST parsing

**MCP Integration**: Model Context Protocol support for custom tool extensions

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
- **Formatter**: Biome (configured in `biome.jsonc`)
- **Indentation**: Tabs (width 4)
- **Line width**: 130 characters
- **Semicolons**: As needed
- **Quotes**: Double quotes for JSX, preference for consistency elsewhere

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

- `src/extension.ts` - Extension activation and command registration
- `src/core/webview/WebviewProvider.ts` - Webview lifecycle and communication
- `src/core/controller/index.ts` - Main message routing and task coordination
- `src/core/task/index.ts` - Task execution engine and tool orchestration
- `src/core/prompts/system-prompt/` - Dynamic system prompt generation
- `src/shared/ExtensionMessage.ts` - Message types between extension and webview
- `webview-ui/src/App.tsx` - Main React application entry point

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