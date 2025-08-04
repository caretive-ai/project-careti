# 🛠️ Caret Developer Guide

Detailed information related to the development of the Caret project, including build, test, and packaging.

## Build and Packaging 🛠️

Follow these steps to set up your local development environment and build the extension.

### 1. Repository Setup

Caret adopts a **Fork-based architecture** from the [Cline](https://github.com/cline/cline) project. It directly includes Cline's stable codebase in the `src/` directory, while developing Caret-specific extension features in `caret-src/`.

1.  **Clone Caret Repository**:
    ```bash
    git clone https://github.com/aicoding-caret/caret.git
    cd caret
    ```

2.  **Understand Architecture Structure**:
    ```
    caret/
    ├── src/                    # Cline original code (preserved)
    │   ├── extension.ts        # Cline main entry point
    │   └── core/              # Cline core logic
    ├── caret-src/             # Caret extension features
    │   ├── extension.ts       # Caret entry point (utilizes src/ modules)
    │   └── core/webview/      # Caret-specific WebView Provider
    ├── caret-assets/          # Caret asset management
    │   ├── template_characters/ # AI character templates
    │   ├── rules/             # Default mode and rule definitions
    │   └── icons/             # Project icons
    ├── caret-docs/            # Caret-specific documentation
    └── webview-ui/            # Frontend (utilizes Cline build system)
        ├── src/components/    # Cline original components
        └── src/caret/         # Caret-specific components
    ```
    
    This structure allows you to **leverage Cline's powerful features** while **safely extending Caret's unique functionalities**.

### 2. Development Environment Setup and Dependency Installation

Instructions on how to install all dependencies for the Caret project.

#### 2-1. Automatic Setup (Recommended) 🚀

**Cross-platform (All operating systems):**
```bash
# Automatic setup using npm script (auto-detects OS)
npm run setup
```

**OS-specific direct execution:**
```bash
# Linux/macOS
npm run setup:linux
# or
./scripts/setup-dev-env.sh

# Windows
npm run setup:windows
# or
scripts\setup-dev-env.bat
```

These scripts automatically perform the following tasks:
- ✅ Node.js 20 installation and configuration
- ✅ Project dependency installation
- ✅ Protocol Buffer compilation
- ✅ TypeScript compilation test
- ✅ WebView UI build test

#### 2-2. Manual Setup

**Node.js Version Check and Update (Required):**

Caret requires Node.js 20.x. Check your current version and update if necessary:

**Linux/macOS:**
```bash
# Check current Node.js version
node --version

# Update if Node.js 12.x or below
# Recommended method: Use nvm (project-specific version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Or use system package manager
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
```cmd
# Check current Node.js version
node --version

# Install nvm-windows (https://github.com/coreybutler/nvm-windows/releases)
# After installation, install Node.js 20
nvm install 20.19.4
nvm use 20.19.4

# Or install directly from Node.js official site
# https://nodejs.org/en/download/
```

> **💡 Tip**: The project has a `.nvmrc` file, so running `nvm use` will automatically switch to Node.js 20.

**Dependency Installation:**

```bash
# Recommended for all platforms - installs dependencies for both root and webview-ui at once
npm run install:all
```

This command performs the following tasks:
- Installs root project dependencies (`npm install`)
- Installs webview-ui directory dependencies (`cd webview-ui && npm install`)

> **Note**: `npm run install:all` is **for dependency installation only**. It is separate from VSIX file building.

### 3. Manual Setup (if issues occur)

If the automatic setup script fails or you wish to execute specific steps manually, follow the procedures below.

```bash
# 1. Check Node.js version (required)
node --version  # Must be 20.x or higher

# 2. Install Dependencies
npm install
cd webview-ui && npm install && cd ..

# 3. Compile Protocol Buffers
npm run protos

# 4. Verify TypeScript Compilation
npm run compile
```

#### 🔧 Common Problem Solutions

**Node.js version errors (`ERR_MODULE_NOT_FOUND: Cannot find package 'fs'` etc.):**
```bash
# Install Node.js 20 and retry
nvm install 20 && nvm use 20
npm run install:all
npm run compile
```

**Dependency-related errors:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules webview-ui/node_modules
npm run install:all
```

**Windows nvm-related errors:**
```cmd
# If nvm is not recognized
# 1. Open new command prompt window
# 2. Or check system environment variables
# 3. Consider reinstalling nvm-windows
```

**Linux/macOS npm_config_prefix errors:**
```bash
# Resolve nvm compatibility issues
unset npm_config_prefix
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### 4. Development Build

Compiles the extension's TypeScript code:

```bash
# Compile Protocol Buffers (if needed)
npm run protos

# Compile TypeScript
npm run compile
```

### 5. Run in Development Environment

Press `F5` in VS Code to start a debugging session, which allows you to test the extension in a new `[Extension Development Host]` window.

**How to Run Caret:**
- Once the extension runs, a **Caret icon** will be added to the VS Code **Primary Sidebar**.
- Click this icon to open the Caret webview and start using it.

**Development Mode Features:**
- **Hot Reload**: Automatic compilation on code changes with `npm run watch` command
- **Debugging**: Backend code debugging support via VS Code debugger
- **Integrated Logging**: Optimized log output with automatic development/production mode detection (Development: DEBUG+console, Production: INFO+VSCode only)

### 6. VSIX Release Packaging 🎯

Package the developed extension into a `.vsix` file for local installation or distribution.
**All build artifacts are generated in the `output/` directory in the format `caret-{version}-{datetime}.vsix`.**

#### 6-1. JavaScript Script Method (✅ Recommended - All Environments)

```bash
# Run from project root
npm run package:release
```

**File created by this command**: `output/caret-0.1.0-202501271545.vsix`

This command automatically performs the following tasks:
- ✅ Reads version information from `package.json`
- ✅ Generates timestamp (YYYYMMDDHHMM format)
- ✅ Creates `output/` directory (if it doesn't exist)
- ✅ Cleans previous builds (`webview-ui/build/`, `dist/`)
- ✅ Full clean build (`npm run protos`, `npm run compile`, `npm run build:webview`)
- ✅ VSIX packaging (`vsce package --out output/caret-{version}-{timestamp}.vsix`)
- ✅ Package size analysis and warnings (300MB/750MB thresholds)


#### 🚀 Verify Build Results

Both methods produce the same results:
- **Location**: `output/caret-{version}-{datetime}.vsix`
- **Example**: `output/caret-0.1.0-202501271545.vsix`
- **Installation**: `code --install-extension output/caret-0.1.0-202501271545.vsix`

## 🧪 Testing and Quality Management

Caret adopts **TDD (Test-Driven Development) methodology** to maintain high code quality.

### 📊 Run All Tests + Coverage

```bash
# 🌟 Recommended: All tests + coverage analysis (at once)
npm run test:all; npm run caret:coverage

# Or including backend detailed coverage
npm run test:all; npm run test:backend:coverage; npm run caret:coverage
```

### 🎯 Run Individual Tests

**⚠️ Important: Correct Test Command Usage**

**❌ Caution: Do NOT use `npm test`**
- `npm test` runs full build + compile + lint + all tests (very slow)
- During development, **individual test commands** below are recommended

**✅ Recommended Test Commands during development:**

```bash
# Backend individual test (specific file)
npm run test:backend caret-src/__tests__/your-test-file.test.ts

# Backend individual test (specific test name)
npm run test:backend caret-src/__tests__/your-test-file.test.ts -t "your test name"

# Frontend test
npm run test:webview

# Backend watch mode (auto-run during development)
npm run test:backend:watch

# Fast development test (excludes webview, stops immediately on failure)
npm run dev:build-test:fast
```

**📊 All tests + Coverage (for CI/CD or final verification):**

```bash
# All tests + coverage analysis
npm run test:all && npm run caret:coverage

# Integration test (VSCode Extension environment)
npm run test:integration
```

### 📈 Coverage Analysis

```bash
# Caret-specific code coverage analysis (detailed by file)
npm run caret:coverage

# Backend Vitest coverage (detailed by line)
npm run test:backend:coverage

# VSCode Extension integration coverage
npm run test:coverage
```

### 🎯 Check Test Status

Running the above commands will allow you to check the current test pass rate and coverage of your project in real-time.

### 📋 TDD Principles and Coverage Goals

Caret project adheres to the following TDD principles:

1. **🔴 RED**: Write a failing test first
2. **🟢 GREEN**: Write the minimum code to pass the test
3. **🔄 REFACTOR**: Improve code quality

#### 🎯 Coverage Goals and Reality

- **🥕 Caret New Logic**: **100% coverage required** - All new features and business logic must be developed test-first.
- **🔗 Existing Re-export**: Some files are simple re-exports of Cline modules and do not require separate testing.
- **📦 Type Definitions**: Files containing only interface definitions can be excluded from testing as they have no runtime logic.

**Always write tests first when developing new features!**

For detailed test guidelines, please refer to the **[Testing Guide](./caret-docs/development/testing-guide.en.mdx)**.

## 🔄 Development Workflow

### 1. New Feature Development (Recommended Process)

#### Backend Extension Pattern
```typescript
// caret-src/core/feature/NewFeature.ts
import { WebviewProvider } from "../../../src/core/webview/WebviewProvider"

export class NewFeature extends WebviewProvider {
	// Extends Cline functionality
	override async handleRequest(request: any) {
		// Caret-specific logic
		const caretResult = await this.processCaretSpecific(request)

		// Combine with Cline's base handling
		const baseResult = await super.handleRequest(request)

		return { ...baseResult, ...caretResult }
	}
}
```

#### Frontend Extension Pattern
```typescript
// webview-ui/src/caret/components/NewComponent.tsx
import React from 'react'
import { useExtensionState } from '../../context/ExtensionStateContext'

export const NewComponent: React.FC = () => {
	const { state } = useExtensionState()
	
	// Caret-specific UI logic
	return <div>New Feature</div>
}
```

### 2. Verification by Development Stage
