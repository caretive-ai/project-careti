# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Project Overview

**Caret** is an autonomous AI coding assistant VS Code extension that can create/edit files, run terminal commands, use the browser, and integrate with various AI models. It's a **Cline-based fork** with minimal extension strategy - preserving Cline core functionality while adding Caret-specific features through `caret-src/` directory.

- **Name Origin**: Caret refers to the '^' symbol (NOT carrot 🥕)
- **Architecture**: Direct Cline integration with Level 1-3 modification strategy
- **Repository**: https://github.com/aicoding-caret/caret

## 🤖 Agent Configuration
```json
{
    "auto_read_paths": [
        ".caretrules/caret-rules.json"
    ],
    "instruction": "Read .caretrules/caret-rules.json first. It contains the project rules and an index of workflows. Read specific workflow files ON DEMAND as needed."
}
```

## Critical Caret-Specific Rules

### 🚨 File Modification Protocol (.cline backup deprecated - use CARET MODIFICATION only)
Before modifying ANY Cline original file:
1. **Check if it's protected**: `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`, root configs/
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
- **assets/**: Caret resources
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
