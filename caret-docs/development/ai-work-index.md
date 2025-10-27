# 🤖 AI Work Index Guide

**Purpose**: To enable the AI to understand the nature of a task and selectively read only the necessary documents to maximize context efficiency.

## 📋 **Step-by-Step Work Process**

### Phase 0: Mandatory Prerequisite Reading (Always Read)

The AI **must** read the following documents before starting any task:

1. **`.caretrules`** - Absolute project rules
2. **`caret-docs/development/index.md`** - Development guide overview (quick scan)
3. **This file (`ai-work-index.md`)** - Work index guide

### Phase 1: Determine Task Nature (Keyword-based)

Extract keywords from the user request to classify the task nature:

## 🎯 **Required Document Mapping by Task Nature**

### 🏗️ **Architecture & Design**

**Keywords**: architecture, design, structure, system, scaling, fork, Cline modification
**Required Documents**:

- `caret-architecture-and-implementation-guide.md` (Overall Architecture)
- `extension-architecture.mmd` (Visual Structure Diagram)
- `new-developer-guide.md` (For New Developers)

### 🤖 **AI System Development**

**Keywords**: AI, message, system prompt, chatbot, agent, conversation
**Required Documents**:

- `ai-message-flow-guide.md` (Message Flow)
- `system-prompt-implementation.md` (System Prompt)
- `message-processing-architecture.md` (Message Processing)

### 🔄 **Frontend-Backend Communication**

**Keywords**: webview, communication, state management, message passing, UI integration
**Required Documents**:

- `frontend-backend-interaction-patterns.md` (Interaction Patterns)
- `webview-extension-communication.md` (Communication Structure)
- `ui-to-storage-flow.md` (Data Flow)

### 🎨 **UI/UX Development**

**Keywords**: Component, React, UI, UX, Persona, Multilingual, i18n
**Required Documents**:

- `component-architecture-principles.md` (Component Principles)
- `../../features/f02-multilingual-i18n.md` (Frontend i18n - **Source of Truth**)
- `backend-i18n-system.md` (Backend i18n)

### 🧪 **Testing & Quality Assurance**

**Keywords**: test, TDD, quality, coverage, verification, bug
**Required Documents**:

- `testing-guide.md` (Testing Guide)
- `logging.md` (Logging System)

### 🔧 **Development Tools & Utilities**

**Keywords**: utility, tool, file handling, image, link, build
**Required Documents**:

- `utilities.md` (Utilities)
- `file-storage-and-image-loading-guide.md` (File Handling)
- `link-management-guide.md` (Link Management)

### 📖 **Documentation & Conventions**

**Keywords**: documentation, convention, writing, standard, guide, comment
**Required Documents**:

- `documentation-guide.md` (Documentation Guide)
- `json-comment-conventions.md` (JSON Comment Conventions)

### 🚨 **Cline Source Modification**

**Keywords**: Cline modification, source change, src/ directory, backup
**Required Documents**:

- `caret-architecture-and-implementation-guide.md` (Modification Principles)
- **+** Re-check file modification checklist in `.caretrules`

## ⚡ **Efficient Reading Strategy**

### 🎯 **Step-by-Step Approach**

1. **Identify Task Nature** (30s): Extract keywords → Classify category
2. **Select Required Documents** (1m): Choose documents based on the mapping table
3. **Selective Reading** (5-10m): Focus only on the necessary sections
4. **Pre-execution Check** (1m): Re-check `.caretrules` checklist

### 📚 **Reading Priority**

1. **High Priority**: Core documents directly related (1-2 max)
2. **Medium Priority**: Indirectly related documents (only if needed)
3. **Low Priority**: Reference documents (check links only)

### 🔍 **Smart Reading Methods**

- **Scan Table of Contents First**: Identify relevant sections
- **Keyword Search**: Quickly find specific content
- **Prioritize Code Examples**: Check actual implementation patterns
- **Utilize Checklists**: Review essential points that are easy to miss

## 🚨 **Absolute Must-Checks**

### Common to All Tasks

- [ ] Confirm `.caretrules` file modification checklist
- [ ] TDD Principle (Red → Green → Refactor)
- [ ] Create backup (for Cline source modifications)
- [ ] Add CARET MODIFICATION comment (for Cline source modifications)

### Task-Specific Checks

- [ ] **AI System**: Understand the system prompt structure
- [ ] **Frontend-Backend**: Patterns to prevent circular messages
- [ ] **UI Development**: Component design principles
- [ ] **Testing**: Aim for 100% test coverage

## 🎁 **AI Work Efficiency Tips**

### 🔄 **Optimizing Repetitive Tasks**

- Memorize frequently used document combinations
- Utilize templates for different task patterns
- Automate checklists

### 🎯 **Context Management**

- Keep only essential information in memory
- Discard unnecessary details
- Prioritize core patterns and principles

### 📈 **Optimizing the Learning Curve**

- Refer to more documents for the first few tasks
- Read selectively as experience accumulates
- Record and improve upon mistake patterns

---

**💡 Pre-Task Checklist for AI:**

- [ ] Task nature identified
- [ ] Required documents selected
- [ ] Selective reading completed
- [ ] `.caretrules` checklist confirmed
- [ ] Execution plan established

**🎯 Goal**: Achieve maximum efficiency with minimum context!
