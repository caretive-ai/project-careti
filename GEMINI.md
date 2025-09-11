# GEMINI.md: Your Guide to the Caret VS Code Extension

This document provides a comprehensive overview of the Caret project, a VS Code extension that enhances the open-source [Cline](https://github.com/cline/cline) AI coding assistant. This guide is intended to be used as a context for future interactions with the Gemini CLI.

## Project Overview

Caret is a VS Code extension that acts as an AI companion for developers. It builds upon the solid foundation of the open-source Cline project, adding a layer of powerful and flexible features to enhance the development experience.

The project follows an "overlay" architecture, where the original Cline codebase is preserved in the `src` directory, and Caret-specific features are developed in the `caret-src` directory. This approach allows for easy integration of upstream changes from Cline while maintaining a clean separation of concerns.

### Key Features

*   **Chatbot & Agent Mode:** A more intuitive and powerful way to interact with the AI.
*   **Custom Personas:** Choose from a variety of AI personas or create your own.
*   **Multilingual Support:** Full support for multiple languages, including Korean, Japanese, and Chinese.
*   **Overlay Architecture:** A stable and extensible architecture that preserves the core of Cline while adding new features.

### Technologies Used

*   **TypeScript:** The primary language for the extension's backend.
*   **React:** Used for the webview-based UI.
*   **esbuild:** A fast and efficient bundler for TypeScript and JavaScript.
*   **VS Code API:** The core API for building VS Code extensions.

## Building and Running

The project includes a set of scripts for building, running, and testing the extension. The following are the most important commands:

### Environment Setup

The recommended way to set up the development environment is to use the `setup` script:

```bash
npm run setup
```

This script will automatically install the correct version of Node.js, install all project dependencies, compile the Protocol Buffers, and run a test compile of the TypeScript code.

### Development

To compile the extension for development, use the `compile` script:

```bash
npm run compile
```

To watch for file changes and automatically recompile, use the `watch` script:

```bash
npm run watch
```

To run the extension in a development host, open the project in VS Code and press `F5`. This will open a new VS Code window with the Caret extension installed and running.

### Testing

The project uses a Test-Driven Development (TDD) approach. There are several scripts for running tests:

*   `npm run test`: Runs all tests, including unit and integration tests.
*   `npm run test:backend`: Runs the backend tests.
*   `npm run test:webview`: Runs the webview (frontend) tests.

### Packaging

To package the extension as a `.vsix` file for distribution, use the `package:release` script:

```bash
npm run package:release
```

This will create a distributable `.vsix` file in the `output` directory.

## Development Conventions

The project follows a set of conventions to ensure code quality and maintainability.

### Architecture

As mentioned earlier, the project uses a fork-based "overlay" architecture. The original Cline code is in the `src` directory, and Caret-specific code is in the `caret-src` directory. When extending the functionality, developers should create new files in the `caret-src` directory and use patterns like the "Wrapper Pattern" to extend the original Cline classes.

### Testing

The project follows a TDD methodology. All new features and business logic should be developed with a test-first approach. The goal is to maintain 100% test coverage for all new Caret-specific logic.

### Workflow

The `DEVELOPER_GUIDE.md` file outlines a recommended workflow for developing new features, which includes a phased approach:

*   **Phase 0:** Architecture review and documentation.
*   **Phase 1:** Write failing tests (TDD RED).
*   **Phase 2:** Write the minimum amount of code to pass the tests (TDD GREEN).
*   **Phase 3:** Refactor the code to improve its quality (TDD REFACTOR).
