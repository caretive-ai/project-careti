# Careti Features Index

## Catalog of Careti-Only Additions

Careti builds on Cline while adding the following enhancements.

### Patches & Fixes

- **[F00: Cline Bugfix & Patch](./f00-cline-bugfix-patch.md)**  
  Upstream fixes and Careti-specific stability/branding patches (e.g., terminal hang, terminal branding).

### Core Features

- **[F01: Common Utilities](./f01-common-util.md)**  
  Shared utility functions and helper scripts for Careti.

- **[F02: Multilingual i18n](./f02-multilingual-i18n.md)**  
  Full 4-language support (Korean, English, Japanese, Chinese).

- **[F03: Branding & UI System](./f03-branding-ui.md)**  
  Dynamic branding switching (Careti ↔ CodeCenter) and UI customization.

- **[F04: Cline Compatibility & CLI](./f04-cline-compatibility-and-cli.md)**  
  100% Cline mode compatibility plus CLI/extension principles (Dual Mode System).

- **[F05: Careti Account System](./f05-careti-account.md)**  
  Careti-only account management and authentication (gRPC-based).

- **[F06: Agent Standardization (AAIF SoT)](./f06-agent-standard-claude-compat.md)**  
  Standardized `.agents/context` SoT, AGENTS.md hierarchy, and init scaffolding.

### AI Systems

- **[F07: Careti Prompt System](./f07-careti-prompt-system.md)**  
  JSON-driven system prompts and Chatbot/Agent mode switching.

- **[F08: Persona System](./f08-persona-system.md)**  
  Persona selection/management with chat avatars.

### Configuration & Integration

- **[F09: Feature Config System](./f09-feature-config-system.md)**  
  Environment-based feature toggles and white-labeling support.

- **[F10: Enhanced Provider Setup](./f10-enhanced-provider-setup.md)**  
  Improved AI provider setup and automation (LiteLLM, BizRouter, etc.).

- **[F11: Input History & Shortcuts](./f11-input-history-and-shortcuts.md)**  
  Terminal-style history navigation and productivity shortcuts.

- **[F12: AI-Developer Knowledge Parity](./f12-ai-developer-knowledge-parity.md)**
  1:1 AI ↔ developer knowledge synchronization.

### Tools & Extensions

- **[F13: Image Tool](./f13-image-tool.md)**
  Image generation, analysis, and history display features.

- **[F14: Document Read Tool](./f14-document-read-tool.md)**
  LLM reads PDF, DOCX, HWPX, HWP, PPTX documents directly by path (Careti-only).

- **[F17: GFM Table & Extended Markdown](./f17-gfm-table-markdown-support.md)**
  GitHub Flavored Markdown tables, strikethrough, etc. (not supported in Cline)

---

## Feature Map

```
Careti Features
├── Patch (F00)
│   └── Bugfix & Patch
├── Core Systems (F01–F06)
│   ├── Common Utilities
│   ├── Multilingual i18n
│   ├── Branding & UI
│   ├── Cline Compatibility / CLI
│   ├── Account System
│   └── Agent Standardization
├── AI Systems (F07–F08)
│   ├── Prompt System
│   └── Persona System
├── Config & Integration (F09–F12)
│   ├── Feature Config
│   ├── Provider Setup
│   ├── Input History
│   └── Knowledge Parity
└── Tools & Extensions (F13–F17)
    ├── Image Tool
    ├── Document Read Tool (PDF, HWPX, HWP, PPTX)
    └── GFM Table & Extended Markdown (not in Cline)
```

## How to Use These Docs

Each feature document provides:
- **Overview**: What the feature does and why it exists
- **Architecture**: Structure and design
- **Implementation**: Key files and logic
- **Merge Guide**: Notes for syncing with Cline upstream
- **Testing**: Strategy and checklist

## Related References

- **Architecture**: `careti-docs/development/careti-architecture-and-implementation-guide.md`
- **Merging**: `careti-docs/merging/merge-execution-master-plan.md`
- **Workflows**: `.agents/context/workflows/` (AI development procedures)

---

**Last Updated**: 2026-01-27
**Document Version**: v2.6 (added F17 GFM Table & Extended Markdown)
