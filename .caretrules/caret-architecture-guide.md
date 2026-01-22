# Caret Architecture Guide

## Context
You are working with Careti, a Cline fork implementing minimal extension strategy with hybrid pattern architecture.

## Core Architecture Principles

### 1. Fork-Based Architecture
Caret directly includes Cline's entire codebase in `src/` directory:
- Preserves Cline's stable, verified functionality
- Efficient upstream integration via Git merge
- No complex submodule management

### 2. Hybrid Pattern (v3.1+) ✨ Recommended

**Backend**: Wrapper pattern (complete wrapping)
**Frontend**: Minimal modifications with `CARETI MODIFICATION` comments

```typescript
// Backend: Wrapper pattern
const clineController = await initialize(context) // Full Cline init
const clineProvider = new VscodeWebviewProvider(context, clineController)
const caretWrapper = new CaretProviderWrapper(context, clineProvider)

// Frontend: Minimal modification + comment
// CARETI MODIFICATION: Added PersonaAvatar for visual identification
<PersonaAvatar personaProfile={personaProfile} />
```

**Why Hybrid?**
- ✅ Backend: 100% preserved via wrapping
- ✅ Frontend: Direct integration (no complex conditional rendering)
- ✅ Performance: Optimized (no runtime condition checks)
- ✅ Maintainability: Clear modification points with comments

### 3. Three-Level Modification Strategy

**Level 1 (Preferred)**: Independent Modules
- Location: `careti-src/`, `careti-docs/`, `assets/`
- Freedom: Complete implementation freedom
- Requirements: None (no backup or comments needed)

**Level 2 (Conditional)**: Minimal Cline Modifications
- Modifications: 1-3 lines max per file
- Mandatory: `// CARETI MODIFICATION: [description]` comment
- Protected: `src/`, `webview-ui/`, `proto/`, `scripts/`
- Use: Only when Level 1 impossible

**Level 3 (Last Resort)**: Direct Modification
- Requirements: Full documentation + impact analysis
- Use: Emergency situations only

## Directory Structure

```
caret/
├── src/                      # Cline original (preserve)
│   ├── extension.ts          # Cline entry point
│   ├── core/                 # Cline core logic
│   │   ├── webview/          # WebviewProvider
│   │   ├── task/             # Task management
│   │   └── prompts/          # Prompt system
│   └── shared/               # Common types/utilities
├── careti-src/                # Caret extensions (wrapper pattern)
│   ├── extension.ts          # Caret entry point
│   └── core/webview/
│       └── CaretProviderWrapper.ts  # Wrapper pattern (v3.0+)
├── assets/                   # Caret-specific assets
│   ├── template_characters/  # AI persona templates
│   └── rules/                # Mode & rule definitions
├── careti-docs/               # Caret documentation
└── webview-ui/               # Frontend (Cline build system)
    ├── src/components/       # Cline components (preserve)
    └── src/caret/            # Caret components
```

## Wrapper Pattern Implementation

### Core Wrapper Structure

```typescript
// careti-src/core/webview/CaretProviderWrapper.ts
export class CaretProviderWrapper implements vscode.WebviewViewProvider {
  private clineProvider: VscodeWebviewProvider

  constructor(context: ExtensionContext, clineWebviewProvider: VscodeWebviewProvider) {
    this.clineProvider = clineWebviewProvider
  }

  async resolveWebviewView(webviewView: vscode.WebviewView) {
    // 1. Activate Cline core functionality
    await this.clineProvider.resolveWebviewView(webviewView)

    // 2. Inject Caret features
    await this.enhanceWebviewWithCaretFeatures(webviewView)
  }

  // Transparent access to Cline Controller
  public get controller(): Controller {
    return this.clineProvider.controller
  }
}
```

### Benefits of Wrapper Pattern
- **Original Preservation**: Complete preservation of Cline files
- **Full Initialization**: Guaranteed complete Cline initialization
- **Merge Safety**: Minimal upstream merge conflicts
- **Clear Boundaries**: Explicit separation between Cline/Caret code
- **Extensibility**: Flexible feature additions

## Storage Patterns

```typescript
// chatSettings: Use workspaceState (project-specific)
await context.workspaceState.update("chatSettings", settings)

// globalSettings: Use globalState (user-wide)
await context.globalState.update("uiLanguage", language)

// Rule: Save and load must use same storage type
```

## Extension Architecture Flow

```
extension.ts → initialize(context)
    ↓
VscodeWebviewProvider (Cline)
    ↓
CaretProviderWrapper (Caret)
    ↓
WebviewPanel ↔ Controller ↔ Task
```

## Implementation Guidelines

### DO's
- ✅ Prefer Level 1 (independent modules in `careti-src/`)
- ✅ Use wrapper pattern for backend extensions
- ✅ Add `CARETI MODIFICATION` comments for Cline file changes
- ✅ Follow TDD: Integration test first, then implement
- ✅ Use Protocol Buffers for frontend-backend communication

### DON'Ts
- ❌ Never modify Cline files without `CARETI MODIFICATION` comment
- ❌ Don't exceed 1-3 lines per Cline file modification
- ❌ Don't use Level 3 (direct modification) without full documentation
- ❌ Don't create custom message types (use gRPC only)
- ❌ Don't mix workspaceState and globalState for related settings

## Key File Locations

**Core Logic**: `src/core/`
**Caret Extensions**: `careti-src/`
**Communication**: `src/shared/ExtensionMessage.ts`
**Webview**: `webview-ui/src/App.tsx`
**Caret Components**: `webview-ui/src/caret/`

## Integration Points

- VS Code API integration
- AI provider abstraction layers
- Tool system extensibility
- MCP (Model Context Protocol)
- gRPC services (`proto/caret/` for Caret-specific)

## Verification Protocol

Every change must pass:
1. **Test**: `npm run test:unit`, `npm run test:integration`, `npm run test:webview`
2. **Compile**: `npm run compile`
3. **Execute**: Manual testing in development window

## Related Documents
- `.caretrules/architecture-guide.yaml`: Quick reference (30-second read)
- `careti-docs/development/careti-architecture-and-implementation-guide.md`: Complete guide (Korean)
- `.caretrules/component-architecture.md`: Frontend component patterns
- `.caretrules/frontend-backend-patterns.md`: Communication patterns
