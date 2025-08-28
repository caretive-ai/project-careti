# Caret Project Comprehensive Rules and Development Guide

**Caret**: VSCode AI Coding Assistant Extension - Cline-based Fork Project

## Project Overview

**Project Name**: Caret (pronounced "caret" - the '^' symbol, NOT a carrot🥕)
**Description**: A VSCode AI assistant extension focused on personalized development partnership
**Basis**: Directly integrated as a Fork of the Cline project
**Repository**: https://github.com/aicoding-caret/caret

**Naming Convention**: Caret refers to the text cursor symbol '^' used in programming, representing position and direction in programming contexts.

## Architecture Principles

**Fork-based Structure**: Direct integration of the Cline codebase into the `src/` directory, adopting a minimal extension strategy.

**Directory Structure**:
```
caret/
├── src/                      # Cline Original Code (must preserve)
├── caret-src/                # Caret Extension Features (minimal)
├── webview-ui/               # React Frontend (utilizing Cline build system)
├── caret-assets/             # Caret-specific Resources
├── caret-docs/               # Caret Documentation System
└── caret-scripts/            # Caret Automation Scripts
```

**Code Management Principles (CRITICAL - AI Must Adhere)**:

### 1. Absolute Principles for Modifying Cline Original Files
- **Directories**: `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`, and root configuration files
- **Principle 1 (Principle of Extensibility): Inheritance vs. Direct Modification**
    - **Adding New Features**: When adding new features by extending existing class functionalities, prioritize `inheritance`. (Create new class files within `caret-src`)
    - **Modifying Existing Features**: When needing to change the behavior of existing features, use `overriding` via inheritance if possible.
    - **Condition for Direct Modification**: If extension via inheritance is impossible because core properties or methods of the parent class are declared as `private`, direct modification of the original file is exceptionally permitted **after backup**. This aligns better with the 'Principle of Minimal Modification'.
- **Principle 2**: **Never touch commented-out unused code** (for merging considerations)
- **Principle 3**: **Principle of Minimal Modification** - 1-3 lines recommended
- **Principle 4**: **Completely replace, do not comment out when modifying**
- **Principle 5**: **Must add CARET MODIFICATION comment**

### 2. Backup Rules (MANDATORY)
```bash
# Step 1: Create backup (mandatory before modification)
cp src/extension.ts src/extension-ts.cline

# Step 2: Add CARET MODIFICATION comment at the top of the file
// CARET MODIFICATION: Detailed description of Caret-specific modification
// Original backed up to: src/extension-ts.cline
// Purpose: Purpose of modification
```

### 3. Freely Modifiable Areas
- **caret-src/**: Caret-specific directory - completely free modification
- **caret-docs/**: Caret documentation - completely free modification
- **caret-assets/**: Caret resources - completely free modification

### 4. Modification Example (Correct Way)
```typescript
// ❌ Incorrect Way - Left as commented out
// const oldValue = "claude-dev.SidebarProvider"  // Original
const newValue = "claude-dev.SidebarProvider"  // New value

// ✅ Correct Way - Complete Replacement
const newValue = "claude-dev.SidebarProvider"  // CARET: Sidebar ID changed
```

**Utilizing Cline Patterns**:
- **Task Execution System**: Streaming processing, race condition prevention with locking mechanisms
- **API Management**: Token tracking and automatic context management
- **Error Handling**: Automatic retry and user confirmation processes
- **State Management**: Global/Workspace/Secrets multi-store, instance synchronization
- **Real-time Communication**: Controller ↔ ExtensionStateContext pattern

## Development Environment and Build

**Required Prerequisites**: Node.js 18+, npm/yarn, VSCode, Git

**Recommended Development Environment Setup**:
The easiest and fastest way is to run the automated script provided at the project root.

```bash
# Recommended for all platforms
npm run install:all

# Or for Windows users
powershell .\\clean-build-package.ps1
```
This script automatically handles all processes including dependency installation and Protocol Buffer compilation.

**Manual Setup (if issues occur)**:
If the automated script encounters problems, you can set it up manually by following these steps:
```bash
git clone https://github.com/aicoding-caret/caret.git
cd caret
npm install
cd webview-ui && npm install && cd ..
npm run protos
npm run compile
# Run in development mode with F5 in VSCode
```

**Key Build Commands**:
```bash
npm run protos          # Compile Protocol Buffers
npm run compile         # Compile TypeScript
npm run build:webview   # Build React
npm run watch           # Watch mode for development
npm run package         # Create VSIX package
```

## Development Process

**Git Commit Convention**:
```
[type]: [description]
feat: Add new feature
fix: Fix bug
docs: Document changes
style: Code formatting
refactor: Code refactoring
test: Test code
chore: Build/configuration changes
```

**State Management**: CaretProvider extends Cline's WebviewProvider, adhering to Cline patterns for minimal extension and utilization of existing features.

**Tool Integration**: Utilize Cline's existing integrations (`src/integrations/`), API providers (`src/api/providers/`), and checkpoints (`src/integrations/checkpoints/`).

## AI Task Protocol

**🚨 Important: The AI assistant must prioritize and thoroughly understand the detailed execution procedure in [`./guides/ai-work-method-guide.mdx`](./guides/ai-work-method-guide.mdx) for performing the following protocol, and all tasks must be executed according to the instructions in that document.**

**Task Start Protocol (CRITICAL)** - The AI assistant **must** adhere to the following sequence:

**Phase 0: Mandatory Pre-Review & Architecture Decision (MANDATORY)**
*   **Goal:** This phase aims to set the direction of the work and design the optimal architecture that complies with project rules before full-scale development begins.

1.  **User Identification**: Confirm current user with `git config user.name`
2.  **Date Confirmation**: Confirm current date with OS-specific command
3.  **Work Log Check/Creation**: `caret-docs/work-logs/{username}/{date}.md`
4.  **Identify Related Task Documents**: Refer to `caret-docs/tasks/task-status.md`

**🚨 CRITICAL: Task Nature Analysis and Mandatory Document Review**
- [ ] Identify task type and **fully** read the corresponding mandatory documents:
  - Frontend-Backend Interaction → `frontend-backend-interaction-patterns.mdx`
  - Cline Original Modification → File modification checklist + `caretrules.ko.md`
  - Component Development → `component-architecture-principles.mdx`
  - Testing Related → `testing-guide.mdx`
  - Persona → setPersona pattern document

**🚨 CRITICAL: Architecture Decision Checklist**
- [ ] Is this feature Caret-specific?
  - YES → `caret-src/` or `webview-ui/src/caret/`
  - NO → Minimal modification of Cline original + backup mandatory
- [ ] Does it require modifying Cline original files?
  - YES → Create backup + CARET MODIFICATION comment + minimal modification principle
- [ ] Is a new component needed?
  - YES → Select appropriate directory (caret/ vs src/)
- [ ] Where are the test files located?
  - webview → `webview-ui/src/caret/**/*.test.tsx`
  - backend → `caret-src/__tests__/`

5. **Plan Establishment and Developer Approval**: State architecture decisions and request developer approval.

**Core Development Principles**:
- **Quality First**: Prioritize accuracy and quality over speed
- **Tests Must Pass**: All tests must pass; resolve root causes when tests fail
- **No Problem Avoidance**: No temporary fixes or 'fix later' approaches
- **Prevent Technical Debt**: Implement correctly from the start
- **Pursue Completeness**: Never finish work in a partial/incomplete state
- **Verification First**: Always verify through compilation, testing, execution after code changes
- **CARET Comment Mandatory**: Must add CARET MODIFICATION comment when modifying Caret

**Phase-Based Work Design (Enhanced Checkpoints)**:

**Phase 1: TDD RED - Write Failing Tests**
*   **Goal:** Clearly define the requirements of the feature to be implemented by first writing 'failing' test code.

🚨 **STOP POINT 1: Confirm Path Before Test File Creation**
- [ ] Confirm include path in test settings:
  - webview: `src/caret/**/*.test.{ts,tsx}`
  - backend: `caret-src/__tests__/`
- [ ] Is the test file created in the correct directory?
- [ ] **Immediate Verification**: After creating the test file, run `npm run test:webview` to confirm recognition.

**Phase 2: TDD GREEN - Implement to Pass Tests**
*   **Goal:** Implement the 'minimal' code to pass the tests written in the previous phase.

🚨 **STOP POINT 2: Before Modifying Cline Original Files (MANDATORY)**
**If any of the following apply, STOP and execute the checklist:**
- Modifying files in `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`
- Adding features to existing Cline components

**Mandatory Checklist:**
- [ ] Plan to create backup file: `cp {original_file} {filename-extension}.cline`
- [ ] Plan to add CARET MODIFICATION comment
- [ ] Plan to adhere to minimal modification principle (1-3 lines)
- [ ] Plan for complete replacement (no commenting out)

🚨 **STOP POINT 3: Confirm Directory Before New File Creation**
- [ ] Is the Caret-specific feature implemented in the `caret/` folder?
- [ ] Is the import path correct?
- [ ] **Immediate Verification**: After modifying Cline originals, run `npm run compile` to check for errors.

**Phase 3: TDD REFACTOR - Improve Code Quality and Full Verification**
*   **Goal:** Improve the code structure while maintaining functionality, and finally confirm that the entire system operates normally.

- [ ] Full system verification: `npm run compile` success
- [ ] All tests pass: `npm run test:webview`, `npm run test:backend`
- [ ] Confirm no impact on existing features

**Execution Principle**: **Mandatory** re-confirmation of related guide documents and principles before starting each Phase.

## 🚨 **Mandatory Coding Task Checklist (AI Must Adhere)**

### **📋 MANDATORY Checklist Before Starting Any Coding Task**

**The AI assistant must confirm the following before starting any coding task:**

#### **1. Mandatory TDD Principle Confirmation**
- [ ] **Test Writing Plan**: Is there a plan to write tests before implementation?
- [ ] **Red-Green-Refactor**: Will the TDD 3-step cycle be adhered to?
- [ ] **Refuse Implementation Without Tests**: Will implementation be refused without tests, and TDD approach suggested?
- [ ] **Test Guide Confirmation**: Has the content of `caret-docs/development/testing-guide.mdx` been thoroughly understood?

#### **2. Mandatory Logging System Confirmation**
- [ ] **Backend Logging**: Is there a plan to use the `Cline integrated logger`? (backend caretLogger was removed)
- [ ] **Frontend Logging**: Is there a plan to use `WebviewLogger`? (`webview-ui/src/caret/utils/webview-logger.ts`)
- [ ] **No console.log**: Will `WebviewLogger` be used instead of `console.log` in the webview?
- [ ] **Logging Guide Confirmation**: Has the content of `caret-docs/development/logging.mdx` been thoroughly understood?
- [ ] **Appropriate Log Level**: Has the appropriate level (DEBUG/INFO/WARN/ERROR) been selected?

#### **3. Mandatory Standard Message Storage Method Confirmation**
- [ ] **Storage Type Decision**: Has the correct storage type (globalState vs workspaceState) been chosen?
  - chatSettings → workspaceState (project-specific settings)
  - globalSettings → globalState (global settings)
- [ ] **Save/Load Consistency**: Do the save and load locations use the same storage type?
- [ ] **Standard Pattern Confirmation**: Has section 10-11 of `caret-docs/development/caret-architecture-and-implementation-guide.mdx` been reviewed?
- [ ] **Message Flow**: Has a webview ↔ backend message flow diagram been created?

#### **4. Mandatory File Saving Method Confirmation**
- [ ] **Cline Original File**: Is there a plan to create a backup?
- [ ] **Architecture Decision**: Has the correct choice been made between Caret-specific (`caret-src/`) vs Cline modification (`src/`)?
- [ ] **Import Path**: Is the import path for new files correct?
- [ ] **Directory Structure**: Does it adhere to the project directory structure principles?

#### **5. Mandatory Large Code Change Refactoring Confirmation**
- [ ] **Code Increase Prediction**: Is the new code expected to increase by more than 500 lines?
- [ ] **Prioritize Refactoring Plan**: If over 500 lines, has refactoring of existing code been planned first?
- [ ] **Phased Approach Plan**: Has a plan been made for Refactoring → Structure Improvement → Gradual Addition?
- [ ] **Preserve Existing Functionality**: Is there a plan to ensure the integrity of existing features during refactoring?

### **✅ MANDATORY Verification Checklist After Completing Coding Task**

**The AI assistant must verify the following after completing any coding task:**

#### **1. TDD Completeness Verification**
- [ ] **RED**: Was a failing test written first?
- [ ] **GREEN**: Was the minimal implementation to pass the test completed?
- [ ] **REFACTOR**: Was code quality improvement completed?
- [ ] **All Tests Pass**: Does `npm run test:all` or the relevant test command succeed?
- [ ] **Test Coverage**: Is the test coverage for the newly written code sufficient?

#### **2. Logging System Application Verification**
- [ ] **Backend Logging Applied**: Has the `Integrated Logger` been applied to all major logic?
- [ ] **Frontend Logging Applied**: Has `WebviewLogger` been applied to all major events?
- [ ] **console.log Removed**: Has all `console.log` usage in the webview been replaced with `WebviewLogger`?
- [ ] **Log Level Appropriateness**: Is the level (DEBUG/INFO/WARN/ERROR) of each log appropriate?
- [ ] **Log Operation Confirmation**: Are actual logs displayed in the VSCode output channel?

#### **3. Standard Message Storage Method Verification**
- [ ] **Save Operation Confirmation**: Are settings saved to the correct storage (globalState/workspaceState)?
- [ ] **Load Operation Confirmation**: Are saved settings loaded correctly?
- [ ] **Consistency Confirmation**: Do all files handling the same settings use the same storage type?
- [ ] **Message Flow Verification**: Does the webview ↔ backend message flow operate correctly without circular references?

#### **4. File Saving and System Integrity Verification**
- [ ] **Compile Success**: Does `npm run compile` succeed?
- [ ] **Build Success**: Does `npm run build:webview` succeed?
- [ ] **Backup Confirmation**: If Cline original files were modified, do `.cline` backup files exist?
- [ ] **CARET MODIFICATION**: Has the appropriate comment been added to modified files?
- [ ] **Existing Feature Impact**: Is there no negative impact on existing features?

#### **5. Large Code Change Refactoring Verification**
- [ ] **Code Increase Check**: Was the actual code increase managed to be less than 500 lines?
- [ ] **Refactoring Completed**: If over 500 lines, was refactoring of existing code completed?
- [ ] **Structure Improvement Confirmation**: Was duplication removed, functions separated, and modularization applied appropriately?
- [ ] **Readability Improvement**: Is the code structure more readable and maintainable than before?
- [ ] **Performance Impact**: Is there no performance degradation due to refactoring?

**Mandatory Checklist Before File Modification**:
1. **Is this a Cline original file?** (`src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`)
2. **Have you created a backup?** (⚠️ Refer to **Backup Rules**)
3. **Have you added the CARET MODIFICATION comment?**
4. **Have you adhered to the minimal modification principle?** (within 1-3 lines)
5. **Have you completely replaced instead of commenting out?**
6. **Have you checked the storage type?** (globalState vs workspaceState)
7. **Do save and load locations match?**
8. **Do related files use consistent storage patterns?**
9. **🚨 When modifying rule files**: Have you run `node caret-scripts/sync-caretrules.js` after changing `caretrules.ko.md`?

## 🔄 **Mandatory Checklist Execution Rules**

**The AI assistant must execute the corresponding checklist in the following situations:**

1.  **When starting a coding task**: Confirm the entire "MANDATORY Checklist Before Starting Any Coding Task".
2.  **Before modifying each file**: Confirm the "Mandatory Checklist Before File Modification".
3.  **When completing a coding task**: Confirm the entire "MANDATORY Verification Checklist After Completing Coding Task".
4.  **If a checklist item is not adhered to**: Stop work and resume after completing the item.

**Actions for Violations**:
- If a checklist item is not adhered to, **immediately stop work**.
- Resume work after completing the item.
- In case of repeated violations, perform **self-diagnosis and request improvements**.

**🛡️ Cline Original File Backup Rules (MANDATORY)**:

**Backup Target Files**:
- All files within `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`
- Root configuration files (`package.json`, `tsconfig.json`, `.vscode/settings.json`, etc.)

**Backup Creation Conditions**:
1.  **New Modification**: Must create a backup if a `.cline` backup does not exist.
2.  **Existing Backup**: Never overwrite existing `.cline` backup files (preserve existing backups).
3.  **Backup Confirmation Method**: `Get-ChildItem -Recurse -Filter "*.cline" | Where-Object { $_.Name -like "*filename*" }`

**Backup Naming Convention**:
- Format: `{original_filename-extension}.cline`
- Examples:
  - `ChatTextArea.tsx` → `ChatTextArea.tsx.cline`
  - `package.json` → `package-json.cline`
  - `extension.ts` → `extension-ts.cline`

**Backup Creation Command (PowerShell)**:
```powershell
# Check if backup exists
Test-Path "filepath.cline"

# Create only if backup does not exist
if (!(Test-Path "filepath.cline")) { Copy-Item "original_filepath" "filepath.cline" }
```

**Backup Verification Procedure**:
1. Confirm backup file exists.
2. Confirm backup file is identical to the original before modification.
3. Test that it can be restored from backup at any time after modification.

**❌ Prohibited Actions**:
- Overwriting existing `.cline` backup files.
- Modifying Cline original files without backup.
- Directly editing or modifying backup files.

**Storage Usage Principles (NEW)**:
- chatSettings: Use workspaceState (project-specific settings)
- globalSettings: Use globalState (global settings)
- Save and load must use the same storage type.

**Complexity Explosion Prevention Principle**:
- Modify a maximum of 3 files at once.
- Analyze the impact on existing features before adding new ones.
- Proceed step-by-step: Proto change → Backend → Frontend.
- Complete testing and verification after each step.

**🚨 Prioritize Refactoring for Large Code Changes (NEW)**:
- **500-line Threshold**: If the total code is expected to increase by more than 500 lines due to new code additions.
- **Mandatory Refactoring**: Prioritize minimizing code increase by improving existing code structure first.
- **Phased Approach**:
  1.  **Refactor Existing Code**: Remove duplication, separate functions, modularize.
  2.  **Improve Structure**: Extract common logic, create utility functions.
  3.  **Gradual Addition**: Add new features incrementally to the refactored structure.
- **Quality First**: Prioritize maintainability and readability over lines of code.
- **Mandatory Verification**: Verify the integrity of existing features at each refactoring stage.

**Additional Principles for Modifying Cline Originals**:
- [ ] Test existing functionality before modification.
- [ ] Verify no impact on existing features after modification.
- [ ] Confirm backup file allows recovery at any time.
- [ ] Document reason for modification and expected impact.

**Systematic Approach to Problem Analysis**:
1. Record symptoms (e.g., alert usage, log not showing).
2. Establish hypotheses (list multiple possibilities).
3. Explore root causes (code-level analysis).
4. Identify impact scope (check related systems).
5. Prioritize solution approaches.

**Message Flow Analysis and Circular Message Prevention (NEW - 2025-06-22)**:

**Mandatory Principles for Developing webview ↔ Backend Interaction Features**:
- [ ] Message flow diagram creation is mandatory.
- [ ] Subscription impact analysis is mandatory.
- [ ] Circular message possibility review is mandatory.
- [ ] Actual Extension Host environment testing is mandatory.

**Additional Checklist for Modifying Cline Message System**:
- [ ] Understand and document existing message flow.
- [ ] Analyze the impact of changes on other subscribers.
- [ ] Review the necessity of `postStateToWebview()` calls.
- [ ] Review potential subscription timing issues.
- [ ] Plan tests to prevent circular messages.

**Recognizing Circular Message Problem Patterns**:
```
Dangerous Flow: webview setting change → backend save → postStateToWebview() →
subscription → webview setState() → settings overwritten ❌
```

**Mandatory Logging Standard (Adhere to Development Guide)**:
- webview: Use WebviewLogger (no console.log)
- Backend: Use Cline integrated logger (caretLogger was removed)
- Set appropriate log levels (debug, info, warn, error)

**Self-Diagnosis and Improvement Request**: If principle violations or unclear guidelines are detected, halt work and request guide improvements.

**🚨 AI Mistake Prevention Key Checkpoints Summary**:
1.  **Architecture Decision Mistakes Prevention**: Caret-specific features must be in `caret/` folders; Cline originals require minimal modification.
2.  **Test Location Mistakes Prevention**: webview tests only in `src/caret/**/*.test.tsx`; include path confirmation is mandatory.
3.  **Backup Omission Prevention**: Cline original modification requires backup creation and CARET MODIFICATION comment before any changes.
4.  **Immediate Verification Principle**: File creation/modification followed by immediate compile/test verification for early problem detection.
5.  **🚨 Rule Sync Omission Prevention**: `caretrules.ko.md` modification **MUST** be followed by `node caret-scripts/sync-caretrules.js` execution.

**Ensuring Session Continuity (Next-Session-Guide Rule)**:

**next-session-guide.md Usage Principles**:
-   **Location**: `caret-docs/work-logs/{username}/next-session-guide.md`
-   **Purpose**: Perfect preservation of work context during AI session transitions.
-   **Update Timing**: Mandatory creation/update immediately after each subtask completion.

**next-session-guide.md Standard Structure**:
```markdown
# Next Session Guide - Task XXX-XX

## 🎯 **Current Progress**
- **Completed Work**: Specifically what has been completed
- **Current State**: Current state of code, tests, and documents
- **Verification Results**: Passed tests and confirmed functionalities

## 🚨 **Important Decisions**
- **Design Decisions**: Why it was implemented this way
- **Constraints**: Principles to adhere to
- **Cautions**: Points to be careful about in the next task

## 🔄 **Next Step Preparation**
- **Next Task**: Specific goals for XXX-XX
- **Required Files**: List of files to modify/create
- **Verification Methods**: Things to confirm in the next step

## 💡 **Notes for Developer**
- **Design Intent**: Why this approach was chosen
- **Alternative Considerations**: Other methods considered
- **Future Improvements**: Areas for future improvement
```

**Mandatory Checklist for AI Session Transition**:
1.  **Current Work Completion Confirmation**: Commit all changes.
2.  **next-session-guide.md Update**: Record current situation and next steps.
3.  **Verification Results Recording**: Passed tests and confirmed functions.
4.  **Important Decision Documentation**: Document design intent and constraints.
5.  **Next Session Preparation**: Enable new AI to start work immediately.

**Guide Update for Development Method Changes (MANDATORY)**:
-   **Change Detection**: Immediately document when new development patterns, tools, or methodologies are introduced.
-   **Guide Synchronization**: Prioritize updates when inconsistencies between actual implementation and documentation are found.
-   **Experience Accumulation**: Reflect insights gained from problem-solving processes into guides.
-   **Practical Reflection**: Prioritize methodologies verified in actual work over theoretical content.
-   **Examples**: Integration test method changes (mocking → actual build verification), module system compatibility issue resolution, etc.

## Documentation System

**Document Structure and Standardization (Completed on 2025-01-21)**:
-   **MDX Format**: All development documents unified to `.mdx` format.
-   **Integration Completed**: 10 split UI-to-Storage-Flow related documents merged into 1.
-   **Real Code Alignment**: All paths/examples match the actual codebase.
-   **Framework Update**: Jest → Vitest conversion completed.
-   **Unnecessary Document Cleanup**: Work documents/review reports cleaned up.
-   **Cline Pattern Integration**: Cline technical patterns integrated into architecture guide.

**Directory Structure**:
```
caret-docs/
├── development/              # Development Guides (.mdx standardization completed)
├── guides/                   # Work Methodologies
├── tasks/                    # Task Documents
└── work-logs/               # User-specific Work Logs
```

**Core Documents**:
-   **Development Guide**: `./development/index.mdx`
-   **Architecture Guide**: `./development/caret-architecture-and-implementation-guide.mdx`
-   **Testing Guide**: `./development/testing-guide.mdx` (Vitest-based)
-   **Logging Guide**: `./development/logging.mdx`

**Document Writing Standards**:
-   **Term Consistency**: Caret refers to the '^' symbol (NOT carrot 🥕).
-   **Path Accuracy**: Must exactly match the actual codebase.
-   **Example Code**: Include only working code examples.
-   **MDX Format**: All technical documents in `.mdx` format.

**Task Document Format**:
```
Task Number: 3-digit numbers (001, 002, ...)
Plan: {task-number}-01-plan-{task-name}.md
Checklist: {task-number}-02-action-checklist-{task-name}.md
Report: {task-number}-03-report-{task-name}.md
```

## Testing and Quality Management

**Test Framework**: Vitest (Updated)

**Test Coverage Scope**:
-   **Mandatory Test Scope**: Only `caret-src/` and `webview-ui/src/caret/` directories (100% coverage goal).
-   **Cline Original Code**: For `src/` and `webview-ui/src/` (excluding Caret parts), only existing tests are maintained; no additional tests needed.
-   **Testing Cline Code Modifications**: If absolutely necessary, manage as separate test files in `caret-src/__tests__/`.

**Basic Commands**:
```bash
npm test                    # Run all tests
npm run test:coverage      # Test with coverage
npm run test:watch         # Watch mode
```

**Test Writing Standards**:
```typescript
import { describe, it, expect, vi } from 'vitest'
describe('Caret Feature', () => {
  it('should expected behavior when condition', () => {
    // Arrange, Act, Assert pattern
  })
})
```

**Quality Standards**:
-   **🥕 Caret New Logic**: 100% test coverage **mandatory** - all new features and business logic must be developed test-first.
-   **🔗 Re-export Files**: Simple re-export files of Cline modules can be excluded from tests.
-   **📦 Type Definitions**: Files containing only interface/type definitions without runtime logic can be excluded from tests.
-   **TDD Methodology**: Red-Green-Refactor cycle.
-   **Test First**: Write tests before implementing features.

**Currently Excluded Test Files (Justified Reasons)**:
-   `caret-src/core/prompts/system.ts` - Cline module re-export.
-   `caret-src/shared/providers/types.ts` - Contains only TypeScript interface definitions.
-   `caret-src/core/task/index.ts` - Some wrapper logic (tests to be added later).

**TDD Mandatory Checklist (MANDATORY)**:
- [ ] Test code written (RED)
- [ ] Minimal implementation passes test (GREEN)
- [ ] Refactoring completed (REFACTOR)
- [ ] No code commits without these 3 steps.

**AI Assistant TDD Adherence Principles**:
- Start with "I'll write tests first" when implementation is requested.
- Refuse implementation without tests and suggest TDD approach.
- Break complex features into step-by-step TDD.
- **Apply Frontend-Backend Interaction Standard Patterns** (setUILanguage pattern).

**Integration Test Mandatory Requirements**:
- Run actual tests in the Extension Host environment.
- Verify the entire settings save/load flow.
- Test both mocked and actual environments.
- Include storage inconsistency verification tests.

**Test Stage Verification**:
1. Unit tests: Individual functions/components.
2. Integration tests: Complete flow (MANDATORY).
3. E2E tests: Actual Extension Host environment.

**Logging System (Integrated Logging System)**:
-   **Cline integrated logger (Backend)**: Improved version of existing Cline logger (caretLogger removed)
-   **WebviewLogger (Frontend)**: `webview-ui/src/caret/utils/webview-logger.ts`.
-   **Automatic Mode Detection**: Development mode (DEBUG level + console output), Production mode (INFO level + VSCode output channel only).

**Test Code Architecture Principles (MANDATORY)**:
-   **🚨 ABSOLUTELY FORBIDDEN: Include Test-Only Methods in Service Code**
    -   Do not add methods used only by tests to production classes.
    -   Do not include test-specific setup/teardown logic.
    -   Do not include mock-related functionality.
    -   Do not include test validation methods.

-   **✅ Mandatory TestHelper Pattern Usage**:
    -   Format: `caret-src/__tests__/helpers/{ServiceName}TestHelper.ts`
    -   All test-specific functionalities must be separated into TestHelper classes.
    -   Service classes must focus solely on business logic.

-   **⚠️ Exception: Use `forTest` Prefix**:
    -   Allow test methods in service code only when absolutely necessary.
    -   Must use `forTestOnly_` or `forTest_` prefix.
    -   Only applies when internal state access is unavoidable or mocking is impossible.
    -   Must document why the TestHelper pattern cannot be used.

-   **Architecture Separation Benefits**:
    -   Clear separation of responsibilities: Service class vs. Test Helper.
    -   Improved code readability: Prevents confusion for maintainers.
    -   Enhanced maintainability: Test changes do not affect production code.
    -   Clean API documentation: Test-only methods are not exposed in the API.

## Project Management

**Script Management**: Caret scripts are located in `caret-scripts/` (separated from Cline `scripts/`).

**Key Scripts**:
```bash
node caret-scripts/caret-coverage-check.js    # Check coverage
node caret-scripts/sync-caretrules.js         # Sync rule files
node caret-scripts/test-report.js             # Generate test report
```

**Upstream Merging**: Cline update integration process - change verification, conflict resolution (`src/` directory), compatibility testing, documentation updates.

**Rule File Management**:
-   **Master File**: `caretrules.ko.md` (Korean template for human readability)
-   **Source of Truth**: `.caretrules` (JSON format, actual rule data)
-   **Rule Modification Procedure (MANDATORY)**:
    1.  Modify `caretrules.ko.md` to document the rule change for readability.
    2.  **Directly modify the `.caretrules` JSON file** to change the actual rule data.
    3.  Run `node caret-scripts/sync-caretrules.js` script to synchronize changes from `.caretrules` to other rule files (e.g., `.cursorrules`).
-   **AI Mandatory Task**: The AI must **strictly** follow the 3-step sync procedure without skipping or changing the order.
-   **Synchronization Targets**: `.cursorrules`, `.windsurfrules` (JSON format)

## Key Reference Files

**Configuration Files**: `.caretrules`, `caret-docs/caretrules.ko.md`, `caret-docs/development/index.mdx`
**Entry Points**: `caret-src/extension.ts`, `caret-src/core/webview/CaretProvider.ts`, `src/extension.ts`
**Frontend**: `webview-ui/src/App.tsx`, `webview-ui/src/context/ExtensionStateContext.tsx`, `webview-ui/src/caret/`

## Recent Updates (2025-01-21)

**Key Improvements Completed**:
1.  **Document Standardization**: All development documents unified to `.mdx` format.
2.  **Document Integration**: 10 split UI-to-Storage-Flow documents integrated into 1.
3.  **Real Code Alignment**: All paths/examples precisely match the actual codebase.
4.  **Test Framework**: Jest → Vitest full conversion.
5.  **Logging System**: Cline integrated logger (backend), WebviewLogger (frontend) with automatic mode detection
6.  **Unnecessary Document Cleanup**: Work documents, review reports, etc., cleaned up.
7.  **Link Integrity**: Fixed broken links in README.md.
8.  **Build System**: Added Protocol Buffer compilation step.
9.  **Cline Technical Patterns**: Integrated Task execution, streaming, state management, API management patterns.

**Improvement Effects**:
-   **Practical Accuracy**: 100% alignment between documentation and actual code.
-   **Development Efficiency**: Improved information accessibility with integrated documents.
-   **Standardization**: Established a consistent MDX-based documentation system.
-   **Test Consistency**: Unified Vitest-based testing environment.
-   **Technical Pattern Utilization**: Actively leveraging Cline's proven architectural patterns.

**Last Update**: 2025-06-22 - Enhanced TDD principles, storage consistency verification, mandatory integration testing, added complexity management principles, and **added message flow analysis and circular message prevention principles**.
