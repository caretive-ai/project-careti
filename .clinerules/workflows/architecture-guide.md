You are accessing the comprehensive architecture guide for Caret project development.

<detailed_sequence_of_steps>
# Architecture Guide - System Design & Implementation

## Core Architecture Principles
1. **Minimal Cline Extension**: Fork strategy with maximum preservation
2. **Level-based Modification**: L1 Independent → L2 Conditional → L3 Direct
3. **Clean Separation**: caret-src/ vs src/ distinction

## Architecture Levels
**Level 1 - Independent Modules** (Preferred):
- Location: caret-src/, caret-docs/
- Freedom: Complete implementation freedom
- No backup or comment requirements

**Level 2 - Conditional Integration** (Careful):
- Minimal Cline file modifications (1-3 lines max)
- Mandatory: backup + CARET MODIFICATION comment
- Protected directories: src/, webview-ui/, proto/, scripts/

**Level 3 - Direct Modification** (Last Resort):
- Full documentation required
- Complete impact analysis
- Emergency situations only

## Storage & State Patterns
- **chatSettings**: workspaceState (project-specific)
- **globalSettings**: globalState (user-wide)
- Consistency rule: same storage type for related settings

## Extension Architecture
- **Entry Point**: extension.ts
- **Communication**: WebviewProvider ↔ Controller ↔ Task
- **Message Flow**: Protocol Buffers for type safety
- **Context Management**: Smart window management with AST parsing

## Implementation Patterns
1. **TDD Integration First**: Real usage scenarios, not unit tests
2. **Backup Protocol**: {filename-extension}.cline format
3. **Comment Protocol**: // CARET MODIFICATION: [clear description]
4. **Verification Protocol**: Test → Compile → Execute

## Key File Locations
- Core logic: src/core/
- Caret extensions: caret-src/
- Communication: src/shared/ExtensionMessage.ts
- Webview: webview-ui/src/App.tsx

## Integration Points
- VS Code API integration points
- AI provider abstraction layers
- Tool system extensibility points
- MCP (Model Context Protocol) integration
</detailed_sequence_of_steps>

<general_guidelines>
This workflow provides AI access to the same architectural knowledge developers have through the caret-architecture-and-implementation-guide.mdx document.

Focus on understanding the three-level modification strategy and always prefer Level 1 independent modules over Cline modifications.

The architecture is designed for minimal disruption to Cline's core functionality while enabling Caret-specific extensions.
</general_guidelines>