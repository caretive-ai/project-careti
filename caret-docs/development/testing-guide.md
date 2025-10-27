# Caret Testing Guide

## 1. Overview

This document is a comprehensive guide to the testing strategy, writing methods, and execution procedures for the Caret project. Caret aims for **100% test coverage** and recommends a **Test-Driven Development (TDD)** approach.

## 1.1 Quick Start - Test Execution Commands

### 🚨 Important: Use the Correct Test Commands

**❌ Caution: Do not use `npm test`**

- The `npm test` command runs the entire build + compile + lint + all tests, making it very slow.
- It is recommended to use the **individual test commands** below during development.

### 🎯 Running Individual Tests (Recommended for Development)

```bash
# ✅ Run a specific backend test file
npm run test:backend caret-src/__tests__/your-test-file.test.ts

# ✅ Run a specific backend test by name
npm run test:backend caret-src/__tests__/your-test-file.test.ts -t "your test name"

# ✅ Run frontend tests (React components, UI logic)
npm run test:webview

# ✅ Run backend in watch mode (auto-runs on changes)
npm run test:backend:watch

# ✅ Fast development test (excludes webview, stops on first failure)
npm run dev:build-test:fast
```

### 📊 Running All Tests + Coverage (For CI/CD or Final Verification)

```bash
# 🌟 Highly Recommended: All tests + coverage analysis in one go
npm run test:all; npm run caret:coverage

# Or include detailed backend coverage
npm run test:all; npm run test:backend:coverage; npm run caret:coverage

# Integration tests (VSCode Extension environment)
npm run test:integration
```

### 📈 Coverage Analysis

```bash
# Caret-specific code coverage analysis (detailed per file)
npm run caret:coverage

# Backend Vitest coverage (detailed per line)
npm run test:backend:coverage

# VSCode Extension integrated coverage
npm run test:coverage
```

### 📝 Practical Test Workflow Example

```bash
# 1. During development: Test a specific feature
npm run test:backend caret-src/__tests__/json-overlay-real-files.test.ts

# 2. During development: Test only a specific case
npm run test:backend caret-src/__tests__/json-overlay-real-files.test.ts -t "should load and apply Alpha personality"

# 3. Develop in watch mode (auto-tests on code change)
npm run test:backend:watch

# 4. Quick overall verification (stops on first failure)
npm run dev:build-test:fast

# 5. Final verification (before PR)
npm run test:all && npm run caret:coverage
```

## 2. Test Strategy

### 2.1 Test Coverage Goals

**Principle of 100% Coverage for Caret-Specific Code:**

- **🥕 New Caret Logic**: **100% test coverage is mandatory** for business logic and feature code in `caret-src/` and `webview-ui/src/caret/` directories.
- **🔗 Re-export Files**: Simple re-export files from Cline modules (e.g., `export { ... } from "..."`) can be excluded from testing.
- **📦 Type Definitions**: Files containing only TypeScript interface/type definitions with no runtime logic can be excluded.
- **🤖 Original Cline Code**: `src/` and `webview-ui/src/` (excluding the caret folder) utilize Cline's existing tests, and writing additional tests is not enforced.
- **📊 Coverage Analysis**: Use `caret-scripts/caret-coverage-check.js` to separately analyze the coverage of Caret vs. Cline code.
- **🔍 Testing Cline Code Modifications**: If modifying Cline source code requires additional tests, create separate test files in the `caret-src/__tests__/` directory whenever possible to manage them separately and prevent excessive expansion of the test scope.

#### Currently Excluded Files (with Justification)

- `caret-src/core/prompts/system.ts` - Re-export of a Cline module.
- `caret-src/shared/providers/types.ts` - Contains only TypeScript interface definitions.
- `caret-src/core/task/index.ts` - Some wrapper logic (tests to be added in the future).

### 2.2 Test Types

#### 2.2.1 Unit Tests

- **Target**: Individual functions, classes, components.
- **Tool**: Vitest (unified for backend/frontend).
- **Location**: `__tests__/` folder or `.test.ts/.test.tsx` files.

#### 2.2.2 Integration Tests

- **Target**: Interaction between multiple modules, actual build verification, overall system behavior.
- **Tools**: Vitest (backend), VSCode Extension Test Runner, React Testing Library.
- **Location**: `caret-src/__tests__/integration.test.ts`, `src/test/`, `webview-ui/src/__tests__/`.
- **Feature**: Verifies build/compilation through actual command execution (Updated 2025-01-21).
- **New Approach**: Shifted from mocked environments to verifying the actual build process.

#### 2.2.3 E2E (End-to-End) Tests

- **Target**: Entire workflows.
- **Tool**: VSCode Extension Development Host.
- **Method**: Manual/automated testing via F5 debugging.

### 2.3 TDD (Test-Driven Development) Approach ⚡ **Mandatory**

Caret **requires the TDD approach**:

1. **Red**: Write a failing test.
2. **Green**: Write the minimum code to make the test pass.
3. **Refactor**: Improve code quality while keeping tests passing.

**🚨 Mandatory Principles for AI Developers**:

- ❌ **No Implementation First**: Always write tests before code.
- ✅ **Test First**: Must declare "I will write the tests first."
- ✅ **Step-by-Step**: Strictly follow the RED → GREEN → REFACTOR cycle.

**Practical Example (UI Language Setting)**:

```typescript
// RED: Write a failing test
it("should update only uiLanguage without affecting other settings", async () => {
	await setUILanguage("ja");
	expect(mockUpdateSettings).toHaveBeenCalledWith({
		uiLanguage: "ja", // Only this
	});
	expect(state.chatSettings.model).toBe("claude-3"); // No impact on other settings
});

// GREEN: Minimal implementation
const setUILanguage = async (language: string) => {
	await StateServiceClient.updateSettings({ uiLanguage: language });
};

// REFACTOR: Improve error handling, state updates, etc.
```

#### 2.3.1 Core TDD Rules (Kent Beck)

1. **Do not write production code unless it is to make a failing unit test pass.**
2. **Do not write more of a unit test than is sufficient to fail.**
3. **Do not write more production code than is sufficient to pass the one failing unit test.**

#### 2.3.2 TDD Step-by-Step Checklist

**Red Stage Checklist:**

- [ ] Does the test actually fail?
- [ ] Is the reason for failure what you expected?
- [ ] Is the test name specific and clear?
- [ ] Does it test only one behavior?
- [ ] Is the test simple and easy to understand?

**Green Stage Checklist:**

- [ ] Does the test pass?
- [ ] Was it implemented with the minimum amount of code?
- [ ] Do all other tests still pass?
- [ ] Did you not shy away from hardcoding or temporary solutions?

**Refactor Stage Checklist:**

- [ ] Do all tests still pass?
- [ ] Has code duplication been removed?
- [ ] Is the code more readable?
- [ ] Has performance improved?
- [ ] Has the design improved?

### 2.4 Test Code Architecture Principles 🏗️ **Mandatory**

#### 2.4.1 Principle of Separating Test-Only Code

**🚨 Strictly Forbidden: Including test-only methods in service code.**

```typescript
// ❌ Strictly Forbidden: Test-only methods in a service class
export class CaretSystemPrompt {
  // ✅ Production method
  generateFromJsonSections() { ... }

  // ❌ Forbidden: Test-only methods are in the service class
  generateSystemPrompt() { ... }          // Used only in tests
  generateSystemPromptWithTemplates() { ... } // Used only in tests
  callOriginalSystemPrompt() { ... }      // Used only in tests
}
```

**✅ Correct Approach: Separate into a TestHelper class.**

```typescript
// ✅ Service Class: Production code only
export class CaretSystemPrompt {
  generateFromJsonSections() { ... }
  getMetrics() { ... }
  clearMetrics() { ... }
}

// ✅ Test Helper: Test-only methods
export class CaretSystemPromptTestHelper {
  generateSystemPrompt() { ... }          // Test-only
  generateSystemPromptWithTemplates() { ... } // Test-only
  callOriginalSystemPrompt() { ... }      // Test-only
}
```

### 2.5 Test File Structure and Naming Standards

#### 2.5.1 Test File Location Rules

**Backend Tests (`caret-src/`)**

```
caret-src/
├── core/
│   ├── webview/
│   │   ├── CaretProvider.ts
│   │   └── __tests__/
│   │       └── CaretProvider.test.ts
│   └── utils/
│       ├── caret-logger.ts
│       └── caret-logger.test.ts  // Same directory is allowed
```

**Frontend Tests (`webview-ui/src/caret/`)**

```
webview-ui/src/caret/
├── components/
│   ├── CaretWelcome.tsx
│   └── __tests__/
│       └── CaretWelcome.test.tsx
├── hooks/
│   ├── useCaretState.ts
│   └── useCaretState.test.ts
└── utils/
    ├── i18n.ts
    └── __tests__/
        └── i18n.test.ts
```

### 2.6 Test Code Structure Standards

#### 2.6.2 Test Grouping (`describe` blocks)

**Class Test Grouping:**

```typescript
describe("CaretLogger", () => {
	describe("constructor", () => {
		// Tests related to the constructor
	})

	describe("info method", () => {
		// Tests related to the info method
	})
})
```

**Feature-based Grouping:**

```typescript
describe("i18n utility", () => {
	describe("translation", () => {
		// Tests for translation functionality
	})

	describe("language detection", () => {
		// Tests for language detection functionality
	})
})
```

### 2.7 Test Case Writing Standards

#### 2.7.1 Test Name Rules

**Naming Pattern:**

```typescript
// Pattern: should {expected result} when {condition}
it("should return user data when valid ID is provided", () => {})
it("should throw error when invalid ID is provided", () => {})
```

#### 2.7.2 AAA Pattern (Arrange-Act-Assert) **Mandatory**

```typescript
it("should format log message with context", () => {
	// Arrange
	const logger = new CaretLogger("test-context");
	const message = "test message";

	// Act
	const result = logger.formatMessage("INFO", message);

	// Assert
	expect(result).toBe("[INFO][test-context] test message");
})
```

---
**Last Updated**: 2025-09-06 - Translated to English and aligned with current standards.
**Author**: Alpha (AI Assistant)
**Reviewed By**: Luke (Developer)
