# F12 - AI-Developer Knowledge Parity

**Status**: ✅ Phase 0 complete  
**Scope**: Documentation (.agents/context, AGENTS.md), Process  
**Priority**: 🔴 High

---

## 📋 Overview

The **AI-Developer Knowledge Parity** system ensures AI and developers share the same rules, conventions, and architecture. It uses **atomic knowledge** and **on-demand loading** to minimize tokens while eliminating information gaps.

---

## 🆚 Improvements vs Cline

| Area | Cline (Original) | Careti (Enhanced) |
| --- | --- | --- |
| **Knowledge Sharing** | Single `.agents/context` text file | **Atomic Knowledge System**: split into reusable atoms and compose only what is needed. |
| **Efficiency** | Always loads every rule | **On-Demand Loading** via JSON index to pull only task-relevant rules. |
| **Sync** | Separate AI rules vs human docs | **Single Source of Truth**: developer docs (`careti-docs`) map 1:1 to AI rules (`.agents/context`). |

---

## 🏗 Code/Doc Scope

Implemented through project structure and documentation rather than runtime code changes.

### 1. Root Configuration
- **`.agents/context/careti-rules.json`**: JSON index/entry point for the rule system.  
- **`AGENTS.md`**: Entry point that instructs agents to read `careti-rules.json` and load workflows on demand.

### 2. Knowledge Base
- **`.agents/context/workflows/`**: Task-specific procedures (for AI).  
- **`.agents/context/workflows/atoms/`**: Reusable knowledge atoms (TDD cycle, naming rules, etc.).

### 3. Developer Docs
- **`careti-docs/`**: Human-readable counterparts to the AI rules.

---

## 🏗️ System Structure

This is a contract about how docs are organized and how AI consumes them.

### 1. Core File: `careti-rules.json`
- **Location**: `.agents/context/careti-rules.json`  
- **Role**: JSON index that defines how AI discovers workflows/atoms.  
- **Access pattern**:
  ```text
  1) Read AGENTS.md
  2) Read .agents/context/careti-rules.json
  3) Load only the needed workflow (e.g., .agents/context/workflows/ai-feature.md)
  ```

---

## 🔄 How It Works

**Example: creating a new component**

1. **Analyze the task**: AI reads the index (e.g., `ai-work-index.yaml`) and recognizes it as `new-component`.  
2. **Load workflow**: Following `careti-rules.json`, it loads `.agents/context/workflows/new-component.md`.  
3. **Compose atoms**: The workflow references required atoms (`tdd-cycle`, `naming-conventions`, etc.); AI loads them from `workflows/atoms/` and composes the full procedure.  
4. **Execute**: AI follows the composed steps to write tests, implement the component, and iterate with TDD.

---

## 💡 Key Benefits

1. **True partnership**: AI and developers communicate from the same documents.  
2. **Token efficiency**: Load only the atoms required for the task, not the entire rulebook.  
3. **Maintainability**: Update a small atom file instead of a monolithic doc when rules change.  
4. **Transparency**: Developers can see the exact procedures AI follows via `careti-docs`.
