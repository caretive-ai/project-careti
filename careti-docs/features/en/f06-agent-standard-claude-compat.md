# F06 - Agent Standardization & Claude Code Compatibility

**Status**: ✅ Implemented
**Implementation Date**: 2026-01-28
**Impact**: Agent Configuration, Commands
**Priority**: 🟢 High

---

## Overview

Agent standardization following the Claude Code pattern. Create command files in `.agents/commands/` folder to use slash commands.

## Folder Structure

```
.agents/
├── commands/         # Slash command definitions
│   ├── init.md      # /init command
│   ├── commit.md    # /commit command
│   └── review.md    # /review command
├── context/         # Project context files
├── skills/          # AI skills
└── workflows/       # Task workflows
```

## Command File Format

```markdown
---
description: Command description
argument-hint: "[optional arguments]"
---

Command instructions for AI to follow...
```

## Usage

1. Create `.agents/commands/` folder in your project
2. Add command markdown files (e.g., `commit.md`)
3. Use slash command in Careti (e.g., `/commit`)

## Claude Code Compatibility

- Same folder structure: `.agents/commands/`
- Same file format: Markdown with YAML frontmatter
- Seamless migration between Claude Code and Careti

## Benefits

- No migration cost when switching tools
- Use both Claude Code and Careti simultaneously
- Standardized agent configuration across projects
