You are following consistent storage patterns for VSCode extension state management.

<detailed_sequence_of_steps>
# Storage Patterns - Consistent State Management

## Core Principle
**Use appropriate storage scope for data lifecycle and sharing requirements**

## Storage Types

### WorkspaceState (Project-Specific)
**Use for**: Settings that vary per project/workspace
```typescript
// chatSettings - conversation history, project-specific AI context
context.workspaceState.update('chatSettings', settings);
const chatSettings = context.workspaceState.get('chatSettings');
```

**Characteristics**:
- Isolated per VSCode workspace
- Persists across VSCode sessions
- Lost when workspace deleted
- Shared among workspace members (in team settings)

### GlobalState (User-Wide)  
**Use for**: User preferences that apply across all projects
```typescript
// globalSettings - user preferences, API keys, general config
context.globalState.update('globalSettings', preferences);
const globalSettings = context.globalState.get('globalSettings');
```

**Characteristics**:
- Available across all workspaces
- User-specific settings
- Persists across VSCode reinstalls
- Private to individual user

## Consistency Rules

### Settings Categorization:
- **Chat/Conversation Data** → `workspaceState`
- **User Preferences** → `globalState` 
- **API Credentials** → `globalState`
- **Project Configuration** → `workspaceState`
- **UI State** (panels, views) → depends on sharing needs

### Naming Conventions:
```typescript
// Good: Clear scope indication
'chatSettings'     // workspace-specific
'globalSettings'   // user-specific
'projectConfig'    // workspace-specific

// Bad: Ambiguous scope
'settings'         // Which scope?
'config'           // Global or workspace?
```

## Implementation Pattern
```typescript
export class StorageService {
  constructor(private context: vscode.ExtensionContext) {}
  
  // Workspace-scoped
  getChatSettings(): ChatSettings {
    return this.context.workspaceState.get('chatSettings', defaultChatSettings);
  }
  
  setChatSettings(settings: ChatSettings): void {
    this.context.workspaceState.update('chatSettings', settings);
  }
  
  // Global-scoped  
  getGlobalPreferences(): GlobalPreferences {
    return this.context.globalState.get('globalSettings', defaultGlobalSettings);
  }
  
  setGlobalPreferences(prefs: GlobalPreferences): void {
    this.context.globalState.update('globalSettings', prefs);
  }
}
```

## Related Workflows
- Apply when implementing new features with `/modification-levels`
- Test storage behavior with `/tdd-cycle` integration tests
- Verify data persistence with `/verification-steps`
</detailed_sequence_of_steps>

<general_guidelines>
Consistent storage patterns prevent data loss and provide predictable user experience.

The workspace vs global distinction should be clear from the data's intended usage.

Always provide sensible defaults for missing storage values.
</general_guidelines>