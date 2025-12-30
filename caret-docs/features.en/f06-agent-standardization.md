# F06 - Agent Standardization (AAIF SoT)

**Status**: ✅ v0.4.4 update | **Scope**: Backend (instructions/storage), Webview (settings), CLI | **Priority**: 🟡 Medium

## 📋 Overview
Caret standardizes agent rules to the AAIF model and fixes `.agents/context` as the single source of truth (SoT).
`AGENTS.md` is applied hierarchically, workflows are loaded on demand, and `/init` scaffolds the standard layout when missing.
Legacy rule paths are removed and never read.

## ✅ Why This Matters
- **Deterministic behavior**: one SoT and one workflow index eliminate rule conflicts.
- **Merge safety**: legacy rule paths are fully retired, reducing upstream drift.
- **Onboarding speed**: `/init` creates a ready-to-fill scaffold and provides guidance.

## ✨ Added Capabilities (Summary)
- `.agents/context/caret-rules.json` SoT + on-demand workflows.
- Hierarchical `AGENTS.md` discovery (root required, then recursive).
- Standard `.agents/skills/` + `.agents/hooks/` layout (AAIF aligned).
- `/init` scaffolding from `assets/agents_template` with no overwrite.
- System prompt notice when standard files are missing (Caret mode only).

## 🆚 Improvements vs Cline
| Area | Cline | Caret |
| --- | --- | --- |
| Rule entry point | Multiple formats | Single SoT: `.agents/context` |
| Scope control | Mixed priority | `AGENTS.md` hierarchy + SoT |
| Extensibility | Ad-hoc files | Standard `.agents/skills` + `.agents/hooks` |
| Bootstrap | Manual setup | `/init` scaffolding + guidance |
| Legacy rules | Various formats | Fully removed |

## 🏗 Code Scope (current)
- **Rule discovery**: `src/core/context/instructions/user-instructions/external-rules.ts`
- **Rule helpers**: `src/core/context/instructions/user-instructions/rule-helpers.ts`
- **Global rules**: `src/core/context/instructions/user-instructions/cline-rules.ts`
- **Prompt assembly**: `src/core/prompts/system-prompt/components/user_instructions.ts`
- **Standard paths**: `src/core/storage/disk.ts`, `caret-src/utils/brand-utils.ts`
- **Init scaffold**: `src/core/context/instructions/user-instructions/agents-init.ts`
- **Slash command**: `src/core/slash-commands/index.ts` (`/init`)
- **Templates**: `assets/agents_template/**` (AGENTS.md + .agents context)
- **Tests**: `src/core/slash-commands/__tests__/index.test.ts`, `src/core/storage/__tests__/disk.test.ts`

## 🎯 Goals
- Keep `.agents/context` as the only SoT for workspace rules.
- Apply `AGENTS.md` hierarchically without overriding the SoT.
- Provide a safe, guided bootstrap for new workspaces.

## 🔧 Architecture & Flows
- **Session start**: read `.agents/context/caret-rules.json`, then load workflows on demand using its index.
- **AGENTS hierarchy**: load root `AGENTS.md`, then combine nested `AGENTS.md` files (recursive).
- **Prompt assembly order**: preferred language → global rules (Documents/<Brand>/Rules) → workspace `.agents/context` → `AGENTS.md` → ignore rules.
- **Init notice**: in Caret mode, missing standard files trigger a system prompt notice with `/init` guidance.
- **/init**: copies `assets/agents_template` to the workspace, never overwrites existing files, and injects `agents-init.md` instructions.

## 🧪 Testing Checklist
1) Remove `.agents/context` and `AGENTS.md`, then verify system prompt shows init notice.
2) Run `/init` and confirm scaffold is created without overwriting existing files.
3) Confirm `.agents/context` and `AGENTS.md` are both included in prompt assembly.
4) Confirm workflows load only when referenced (on-demand).

## 🧭 Maintenance Notes
- Keep `caret-rules.json` and `caret-rules.md` meaning-aligned.
- Update `.agents/context/ai-work-index.yaml` when adding workflows.
- Do not reintroduce legacy rule paths.

## 🔗 Related
- **F12 - AI-Developer Knowledge Parity**: docs ↔ SoT alignment.
- **Rules Reference**: `caret-docs/rules-reference/caretrules-file-guide.md`
