# F06 - Agent Standardization (AAIF SoT)

**Status**: ✅ v0.4.5 update (M02 Phase 2 - Dual-directory Architecture Complete) | **Scope**: Backend (instructions/storage), Webview (settings), CLI | **Priority**: 🟡 Medium

## 📋 Overview
Careti standardizes agent rules to the AAIF model and adopts a **Dual-directory Architecture**:
- `.agents/` - AI-optimized (system context, English, token-efficient)
- `.users/` - Human-readable (user context, native language, detailed)

`AGENTS.md` is applied hierarchically, workflows are loaded on demand, and `/init` scaffolds the standard layout when missing.
Legacy rule paths are supported as fallback with migration guidance.

**M02 Phase 2 - Dual-directory Architecture (2025-01-15 Complete)**:
- Full separation of `.agents/` (AI) and `.users/` (Human)
- `.users/context/` mirrors `.agents/context/` (1:1 correspondence)
- Introduced `.agents/workflows/` and `.agents/workflows/atoms/` structure
- Legacy path fallback support (`.agents/context-for-user/`, `.agents/context/workflows/`)
- Dual-directory architecture philosophy injected into system prompt

## ✅ Why This Matters
- **Deterministic behavior**: one SoT and one workflow index eliminate rule conflicts.
- **Clear role separation**: AI and humans read different documents with different purposes.
- **Token optimization**: `.agents/` uses English for token efficiency.
- **Onboarding speed**: `/init` creates a ready-to-fill scaffold and provides guidance.

## ✨ Added Capabilities (Summary)
- `.agents/context/agents-rules.json` SoT + on-demand workflows.
- Hierarchical `AGENTS.md` discovery (root required, then recursive).
- Standard `.agents/skills/` + `.agents/hooks/` layout (AAIF aligned).
- `/init` scaffolding from `assets/agents_template` with no overwrite.
- System prompt notice when standard files are missing (Careti mode only).
- **M02 Phase 2**: `.users/context/` user context directory (legacy: `.agents/context-for-user/`)
- **M02 Phase 2**: `.agents/workflows/` workflow directory (legacy: `.agents/context/workflows/`)
- **M02 Phase 2**: `workflows/atoms/` reusable small protocols
- **M02 Phase 2**: Dual-directory architecture philosophy in system prompt
- **M02 Phase 2**: Legacy structure detection and migration guidance

## 🗂 Directory Structure

```
project/
├── .agents/                    # AI-optimized (English, token-efficient)
│   ├── context/               # System rules (JSON/YAML)
│   │   ├── agents-rules.json   # Main rules file (SoT)
│   │   ├── agents-rules.md     # Rules description (Markdown)
│   │   └── ai-work-index.yaml # Work index
│   ├── workflows/             # Task workflows
│   │   ├── atoms/             # Reusable small protocols
│   │   └── *.md               # Workflow files
│   ├── skills/                # AI skills
│   └── hooks/                 # Event hooks
│
├── .users/                     # Human-readable (native language, detailed)
│   ├── context/               # Project context (Markdown)
│   ├── workflows/             # Workflow guides
│   │   └── atoms/             # Atom descriptions
│   ├── skills/                # Skill guides
│   └── hooks/                 # Hook documentation
│
└── AGENTS.md                   # AI entry point
```

## 🆚 Improvements vs Cline
| Area | Cline | Careti |
| --- | --- | --- |
| Rule entry point | Multiple formats | Single SoT: `.agents/context` |
| Scope control | Mixed priority | `AGENTS.md` hierarchy + SoT |
| Extensibility | Ad-hoc files | Standard `.agents/` + `.users/` |
| Bootstrap | Manual setup | `/init` scaffolding + guidance |
| Legacy rules | Various formats | Fallback support + migration guide |
| Role separation | None | AI/Human separation |

## 🏗 Code Scope (current)
- **Rule discovery**: `src/core/context/instructions/user-instructions/external-rules.ts`
- **Rule helpers**: `src/core/context/instructions/user-instructions/rule-helpers.ts`
- **Workflows**: `src/core/context/instructions/user-instructions/workflows.ts`
- **Global rules**: `src/core/context/instructions/user-instructions/cline-rules.ts`
- **Prompt assembly**: `src/core/prompts/system-prompt/components/user_instructions.ts`
- **Standard paths**: `src/core/storage/disk.ts`, `careti-src/utils/brand-utils.ts`
- **Init scaffold**: `src/core/context/instructions/user-instructions/agents-init.ts`
- **Slash command**: `src/core/slash-commands/index.ts` (`/init`)
- **Templates**: `assets/agents_template/**` (AGENTS.md + .agents + .users)
- **Context separator**: `src/core/context/context-separator/index.ts` (ContextSeparator class)

## 🎯 Goals
- Keep `.agents/context` as the only SoT for workspace rules.
- Apply `AGENTS.md` hierarchically without overriding the SoT.
- Provide a safe, guided bootstrap for new workspaces.
- Clearly separate AI and human documentation.

## 🔧 Architecture & Flows
- **Session start**: read `.agents/context/agents-rules.json`, then load workflows on demand using its index.
- **AGENTS hierarchy**: load root `AGENTS.md`, then combine nested `AGENTS.md` files (recursive).
- **Prompt assembly order**: preferred language → architecture philosophy → global rules → `.agents/context` → `.users/context` → `AGENTS.md` → ignore rules.
- **Init notice**: in Careti mode, missing standard files trigger a system prompt notice with `/init` guidance.
- **/init**: copies `assets/agents_template` to the workspace, never overwrites existing files, and injects `agents-init.md` instructions.
- **Context separation**: `ContextSeparator` loads system context (JSON) and user context (Markdown) separately.
- **Legacy fallback**: if new paths don't exist, automatically checks legacy paths and provides migration guidance.
- **Philosophy injection**: dual-directory architecture philosophy automatically injected into system prompt.

## 📍 Path Mapping

### Project-level Paths
| Category | New Path | Legacy Path (Fallback) |
| --- | --- | --- |
| User context | `.users/context/` | `.agents/context-for-user/` |
| Workflows | `.agents/workflows/` | `.agents/context/workflows/` |
| Atoms | `.agents/workflows/atoms/` | (new) |

### Global Paths (User Home)
Global agent configuration is stored in `~/Documents/.agents/` for consistency with project-level structure.

```
~/Documents/.agents/
├── context/           # Global rules (*.md files)
├── workflows/         # Global workflows
├── skills/            # Global skills
├── hooks/             # Global hooks
└── mcp/               # MCP server configs
```

| Category | New Path | Legacy Path (Migration) |
| --- | --- | --- |
| Global rules | `~/Documents/.agents/context/` | `~/Documents/Careti/Rules/` |
| Global workflows | `~/Documents/.agents/workflows/` | `~/Documents/Careti/Workflows/` |
| Global skills | `~/Documents/.agents/skills/` | `~/Documents/Careti/Skills/` |
| Global hooks | `~/Documents/.agents/hooks/` | `~/Documents/Careti/Hooks/` |
| Global MCP | `~/Documents/.agents/mcp/` | `~/Documents/Careti/MCP/` |

**Note**: Hidden folder (`.agents`) keeps Documents folder clean while maintaining consistency with project structure.

## 🧪 Testing Checklist
1) Remove `.agents/context` and `AGENTS.md`, then verify system prompt shows init notice.
2) Run `/init` and confirm scaffold is created without overwriting existing files.
3) Confirm `.agents/context` and `AGENTS.md` are both included in prompt assembly.
4) Confirm workflows load only when referenced (on-demand).
5) Confirm `.users/context/` user context loads as Markdown.
6) Confirm legacy path (`.agents/context-for-user/`) fallback works.
7) Confirm dual-directory architecture philosophy is included in system prompt.
8) Confirm legacy structure detection and migration guidance work.

## 🧭 Maintenance Notes
- Keep `agents-rules.json` and `agents-rules.md` meaning-aligned.
- Update `.agents/context/ai-work-index.yaml` when adding workflows.
- **New paths first**: recommend new paths, support legacy paths with migration guidance.
- `.users/` structure must mirror `.agents/` structure 1:1.
- Workflows vs Atoms: workflows are complete task flows, atoms are reusable building blocks.

## 🔗 Related
- **F12 - AI-Developer Knowledge Parity**: docs ↔ SoT alignment.
- **Rules Reference**: `careti-docs/rules-reference/caretrules-file-guide.md`
- **Master Plan**: `work-logs/luke/careti/todo/todo/context-improvement/master-implementation-plan.md`
