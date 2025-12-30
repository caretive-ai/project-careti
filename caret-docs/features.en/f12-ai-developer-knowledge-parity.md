# F12 - AI-Developer Knowledge Parity

**Status**: ✅ Phase 0 complete  
**Scope**: Documentation (.agents/context, AGENTS.md), Process  
**Priority**: 🔴 High

---

## 📋 Overview

The **AI-Developer Knowledge Parity** system ensures AI and developers share the same rules, conventions, and architecture. It uses **atomic knowledge** and **on-demand loading** to minimize tokens while eliminating information gaps.

---

## 🆚 Improvements vs Cline

| Area | Cline (Original) | Caret (Enhanced) |
| --- | --- | --- |
| **Knowledge Sharing** | Single `.agents/context` text file | **Atomic Knowledge System**: split into reusable atoms and compose only what is needed. |
| **Efficiency** | Always loads every rule | **On-Demand Loading** via JSON index to pull only task-relevant rules. |
| **Sync** | Separate AI rules vs human docs | **Single Source of Truth**: developer docs (`caret-docs`) map 1:1 to AI rules (`.agents/context`). |

---

## 🏗 Code/Doc Scope

Implemented through project structure and documentation rather than runtime code changes.

### 1. Root Configuration
- **`.agents/context/caret-rules.json`**: Index/entry point for the rule system.  
- **`AGENTS.md`**: Instructs agents to read `.agents/context` first.

### 2. Knowledge Base
- **`.agents/context/workflows/`**: Task-specific procedures (for AI).  
- **`.agents/context/workflows/atoms/`**: Reusable knowledge atoms (TDD cycle, naming rules, etc.).

### 3. Developer Docs
- **`caret-docs/`**: Human-readable counterparts to the AI rules.

---

## 🏗️ System Structure

This is a contract about how docs are organized and how AI consumes them.

### 1. Core File: `caret-rules.md`
- **Location**: `.agents/context/caret-rules.md`  
- **Role**: Explains the hierarchy and navigation path for the AI.  
- **Key logic**:
  ```markdown
  ### Document Access Pattern (On-Demand System)
  - **1. Initialize**: AI reads `.agents/context/caret-rules.json` (JSON index)
  - **2. Analyze**: AI identifies the workflow from `workflows.index`
  - **3. Load**: AI reads the specific workflow (e.g., `.agents/context/workflows/ai-feature.md`) only when needed
  ```

---

## 🔄 How It Works

**Example: creating a new component**

1. **Analyze the task**: AI reads the index (e.g., `ai-work-index.yaml`) and recognizes it as `new-component`.  
2. **Load workflow**: Following `caret-rules.md`, it loads `.agents/context/workflows/new-component.md`.  
3. **Compose atoms**: The workflow references required atoms (`tdd-cycle`, `naming-conventions`, etc.); AI loads them from `workflows/atoms/` and composes the full procedure.  
4. **Execute**: AI follows the composed steps to write tests, implement the component, and iterate with TDD.

---

## 💡 Key Benefits

1. **True partnership**: AI and developers communicate from the same documents.  
2. **Token efficiency**: Load only the atoms required for the task, not the entire rulebook.  
3. **Maintainability**: Update a small atom file instead of a monolithic doc when rules change.  
4. **Transparency**: Developers can see the exact procedures AI follows via `caret-docs`.
