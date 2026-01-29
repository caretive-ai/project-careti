# F06 - Agent Standardization & Claude Code Compatibility

**Status**: ✅ v0.4.8 update (Claude Code Full Compatibility) | **Scope**: Backend (instructions/storage), Webview (settings), CLI | **Priority**: 🟡 Medium

> **For Claude Code Users**: Careti is **fully compatible** with Claude Code's Skills, Commands, and Hooks systems. Additionally, Careti provides a Workflows system for explicitly defining complex multi-step procedures.

## 📋 Overview
Careti standardizes agent rules to the AAIF model and adopts a **Dual-directory Architecture**:
- `.agents/` - AI-optimized (system context, English, token-efficient)
- `.users/` - Human-readable (user context, native language, detailed)

`AGENTS.md` is applied hierarchically, workflows are loaded on demand, and `/init` scaffolds the standard layout when missing.
Legacy rule paths are supported as fallback with migration guidance.

**v0.4.8 - Claude Code Full Compatibility (2026-01-26)**:
- **Skill System**: Full Claude Code frontmatter field support
  - `disable-model-invocation`: Disable AI auto-invocation
  - `user-invocable`: Show/hide from slash menu
  - `allowed-tools`: Tool allowlist restriction
  - `context: fork`: Isolated subagent execution
  - `!`command`` preprocessing syntax (dynamic context injection)
- **Hooks System**: Full Claude Code event support
  - `SessionStart`, `SessionEnd`, `Stop` hooks added
  - Matcher pattern support (`PreToolUse.Edit_Write`)
  - Priority: Personal > Project (same as Claude Code)
- **Interoperability**: Claude Code `.claude/` and Careti `.agents/` structures are interoperable

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

## 🔄 Claude Code Full Compatibility (v0.4.8)

Careti is fully compatible with Claude Code's Skill, Command, and Hooks systems.

### Skill System Compatibility

| Feature | Claude Code | Careti |
|---------|-------------|--------|
| `disable-model-invocation` | ✅ | ✅ |
| `user-invocable` | ✅ | ✅ |
| `allowed-tools` | ✅ | ✅ |
| `context: fork` | ✅ | ✅ |
| Preprocessing `!`command`` | ✅ | ✅ |

### Hooks System Compatibility

| Hook Event | Claude Code | Careti | Notes |
|------------|-------------|--------|-------|
| PreToolUse | ✅ | ✅ | With matcher patterns |
| PostToolUse | ✅ | ✅ | With matcher patterns |
| UserPromptSubmit | ✅ | ✅ | |
| SessionStart | ✅ | ✅ | |
| SessionEnd | ✅ | ✅ | |
| Stop | ✅ | ✅ | |
| TaskStart | - | ✅ | Careti extension |
| TaskResume | - | ✅ | Careti extension |
| TaskCancel | - | ✅ | Careti extension |

**Matcher Patterns**: `PreToolUse.Edit_Write` applies only to Edit or Write tools.

### Priority System

Same as Claude Code: Personal > Project > Enterprise

## 🧠 Design Philosophy: Claude Code vs Careti

### Why Claude Code Doesn't Have Workflows

Claude Code is designed with **strong trust in the model's reasoning capabilities**:

```
Claude Code Approach:
User Request → AI decomposes task → Combines Skills → Complete
```

- Claude model **autonomously breaks down** complex tasks
- Skills are a **toolbox**, composition is decided **by AI on-the-fly**
- Flexible response without explicit workflow definitions

### Why Careti Maintains Workflows

Careti must support **diverse environments and models**:

```
Careti Approach:
User Request → Reference Workflow → Step-by-step execution → Skills/Commands → Complete
```

| Aspect | Claude Code | Careti |
|--------|-------------|--------|
| **Target Models** | Claude only (top performance) | 266+ models supported |
| **Environment** | Individual developers | Team/Enterprise |
| **Process** | Flexibility first | Consistency first |
| **Model Trust** | 100% trust | Provides guidelines |

### Hierarchy Structure

```
Workflows (Top) - Complex multi-step procedures
  └── Commands/Skills (Middle) - Single tasks via slash commands
       └── Tools (Bottom) - Read, Write, Bash, etc.
```

### Real-world Example: "Develop a new feature"

**Claude Code** (Implicit workflow):
```
AI decides:
1. Analyze requirements
2. Write tests first
3. Implement
4. Refactor
(Order may vary each time)
```

**Careti** (Explicit workflow):
```
References .agents/workflows/feature-development.md:
1. Analysis phase (Checklist A)
2. Design phase (Checklist B)
3. Implementation phase (TDD required)
4. Verification phase (80%+ test coverage)
(Same procedure guaranteed)
```

### When Do You Need Workflows?

| Scenario | Claude Code | Careti |
|----------|-------------|--------|
| Solo developer | ✅ Sufficient | ✅ Sufficient |
| Team needs consistent process | 🟡 Model-dependent | ✅ Workflows |
| Audit trail / Compliance | 🟡 Model-dependent | ✅ Workflows |
| Using lower-performance models | ❌ Unstable | ✅ Workflows guide |
| New hire onboarding | 🟡 Varies | ✅ Workflows standardize |

### Compatibility Summary

- **Claude Code → Careti**: Skills, Commands, Hooks 100% compatible
- **Careti Extensions**: Workflows, Atoms, Task Hooks
- **Migration Cost**: None (only path differs: `.claude/` → `.agents/`)

## 🆚 Improvements vs Cline
| Area | Cline | Careti |
| --- | --- | --- |
| Rule entry point | Multiple formats | Single SoT: `.agents/context` |
| Scope control | Mixed priority | `AGENTS.md` hierarchy + SoT |
| Extensibility | Ad-hoc files | Standard `.agents/` + `.users/` |
| Bootstrap | Manual setup | `/init` scaffolding + guidance |
| Legacy rules | Various formats | Fallback support + migration guide |
| Role separation | None | AI/Human separation |
| Claude Code compat | - | ✅ **Full compatibility** |

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

### Version History

| Version | Brand | Project Path | Global Path |
|---------|-------|--------------|-------------|
| v0.4.4 and below | Caret | `.caretrules/` | `~/Documents/Caret/` |
| v0.4.5 | Caret | `.agents/` | `~/Documents/.agents/` |
| v0.4.6+ | **Careti** | `.agents/` | `~/Documents/.agents/` |

### Project-level Paths (v0.4.5+)
| Category | New Path | v0.4.5 Early Legacy | v0.4.4 Legacy |
| --- | --- | --- | --- |
| Rules/Context | `.agents/context/` | - | `.caretrules/` |
| User context | `.users/context/` | `.agents/context-for-user/` | (none) |
| Workflows | `.agents/workflows/` | `.agents/context/workflows/` | `.caretrules/workflows/` |
| Commands | `.agents/commands/` | `.agents/skills/` | (none) |
| Hooks | `.agents/hooks/` | - | (none) |
| Atoms | `.agents/workflows/atoms/` | (new) | - |

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

| Category | New Path (v0.4.5+) | v0.4.4 Legacy |
| --- | --- | --- |
| Global rules | `~/Documents/.agents/context/` | `~/Documents/Caret/Rules/` |
| Global workflows | `~/Documents/.agents/workflows/` | `~/Documents/Caret/Workflows/` |
| Global commands | `~/Documents/.agents/commands/` | (none) |
| Global hooks | `~/Documents/.agents/hooks/` | (none) |
| Global MCP | `~/Documents/.agents/mcp/` | `~/Documents/Caret/MCP/` |

**Note**: Since v0.4.5, the hidden folder (`.agents`) keeps Documents folder clean while maintaining consistency with project structure.

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
