# F07 - Careti Prompt System

**Status**: ✅ Phase 4 complete | **Scope**: Core prompt + settings | **Priority**: 🔴 High

## 📋 Overview
JSON-driven system prompts plus a hybrid architecture that delivers **Chatbot/Agent** modes. Replaces hardcoded prompts with structured JSON while keeping Cline’s tooling intact.

## 🆚 Improvements vs Cline
| Area | Cline | Careti |
| --- | --- | --- |
| Prompt management | Hardcoded `system.ts` strings | JSON configs in `careti-src/core/prompts/json/` |
| Modes | Plan/Act (technical) | **Chatbot/Agent** (UX-focused) |
| Tool control | Limited | **Granular**: Chatbot blocks write/execute tools |
| Terminology | Fixed Plan/Act | Runtime replacement to Chatbot/Agent terminology |

## 🏗 Code Scope
- **Core switch**: `src/core/prompts/system-prompt/index.ts` branches to `CaretiPromptWrapper` when `modeSystem === "careti"`; otherwise returns Cline registry prompt.
- **Careti modules**: `careti-src/core/prompts/CaretiPromptWrapper.ts`, `CaretModeManager.ts`, `CaretiJsonAdapter.ts` (JSON parsing + terminology replacement).
- **JSON resources**: `careti-src/core/prompts/json/AGENT_BEHAVIOR_DIRECTIVES.json`, `CHATBOT_BEHAVIOR_DIRECTIVES.json`, `CARET_SYSTEM_INFO.json`.
- **Init guard**: `src/common.ts` must call `JsonTemplateLoader.initialize(<extension>/careti-src/core/prompts/sections)` right after `StateManager.initialize` (avoids “JsonTemplateLoader has not been initialized”).

## 🤖 Chatbot vs Agent
- **Chatbot mode** (read-only): allows `read_file`, `list_files`, `search_files`, `ask_followup_question`, `web_fetch`; blocks `write_to_file`, `execute_command`.
- **Agent mode**: all tools enabled.
- Tool enforcement in `CaretModeManager.isToolAllowed()`.

## 🔧 Hybrid Architecture
- **JSON**: behavior directives/system info (easy to edit, localized terminology).
- **Cline code**: tool prompts from `PromptBuilder.getToolsPrompts` reused; filtered per mode.
- **Terminology replacement** (`CaretiJsonAdapter`): replaces PLAN/ACT with CHATBOT/AGENT inside tool descriptions so users only see Careti wording.

## 🛡️ Cline Independence
- When `StateManager.setMode("cline")`, Cline registry is used directly; CaretiPromptWrapper is not touched. 
- Careti prompt code resides in `careti-src/` with no upstream dependency.

## 🚀 Usage
- Mode switch handled via settings/ExtensionState; current mode metadata stored with each task.
- Chatbot mode for safe analysis/conversation; Agent mode for full execution.

## 💡 Benefits
- Structured, editable prompts without touching Cline core. 
- Safer default (Chatbot) with explicit escalation to Agent. 
- Terminology matches UX while preserving backend logic.
