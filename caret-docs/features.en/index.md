# Caret Features Index

## Catalog of Caret-Only Additions

Caret builds on Cline while adding the following enhancements.

### Patches & Fixes

- **[F00: Cline Bugfix & Patch](./f00-cline-bugfix-patch.md)**  
  Upstream fixes and Caret-specific stability/branding patches (e.g., terminal hang, terminal branding).

### Core Features

- **[F01: Common Utilities](./f01-common-util.md)**  
  Shared utility functions and helper scripts for Caret.

- **[F02: Multilingual i18n](./f02-multilingual-i18n.md)**  
  Full 4-language support (Korean, English, Japanese, Chinese).

- **[F03: Branding & UI System](./f03-branding-ui.md)**  
  Dynamic branding switching (Caret ↔ CodeCenter) and UI customization.

- **[F04: Cline Compatibility & CLI](./f04-cline-compatibility-and-cli.md)**  
  100% Cline mode compatibility plus CLI/extension principles (Dual Mode System).

- **[F05: Caret Account System](./f05-caret-account.md)**  
  Caret-only account management and authentication (gRPC-based).

- **[F06: Rule Priority System](./f06-rule-priority-system.md)**  
  Rule precedence management for `.caretrules` and conflict resolution.

### AI Systems

- **[F07: Caret Prompt System](./f07-caret-prompt-system.md)**  
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

---

## Feature Map

```
Caret Features
├── Patch (F00)
│   └── Bugfix & Patch
├── Core Systems (F01–F06)
│   ├── Common Utilities
│   ├── Multilingual i18n
│   ├── Branding & UI
│   ├── Cline Compatibility / CLI
│   ├── Account System
│   └── Rule Priority
├── AI Systems (F07–F08)
│   ├── Prompt System
│   └── Persona System
└── Config & Integration (F09–F12)
    ├── Feature Config
    ├── Provider Setup
    ├── Input History
    └── Knowledge Parity
```

## How to Use These Docs

Each feature document provides:
- **Overview**: What the feature does and why it exists
- **Architecture**: Structure and design
- **Implementation**: Key files and logic
- **Merge Guide**: Notes for syncing with Cline upstream
- **Testing**: Strategy and checklist

## Related References

- **Architecture**: `caret-docs/development/caret-architecture-and-implementation-guide.md`
- **Merging**: `caret-docs/merging/merge-execution-master-plan.md`
- **Workflows**: `.caretrules/workflows/` (AI development procedures)

---

**Last Updated**: 2025-11-24  
**Document Version**: v2.2 (added Cline compatibility/CLI item; renumbering prep)
