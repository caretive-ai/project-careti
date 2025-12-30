# Frontend-Backend Interaction Patterns

## Context
You are implementing communication between Caret's webview (React) and extension host (Node.js) using gRPC.

## CRITICAL: Caret gRPC Service Isolation

> **NEVER modify `cline`'s original proto files.** Caret-specific communication MUST use separate proto files.

**Required Implementation Steps:**

1. **Create `proto/caret/` directory**: Establish Caret namespace
2. **Define new `.proto` file**: Example: `proto/caret/persona.proto`
3. **Implement independent service**: Create gRPC handlers in `caret-src`
4. **Register in `extension.ts`**: Add Caret service separately from Cline's `UiService`
5. **Use in webview**: Access via Caret-specific gRPC client

**Benefits**:
- **Independence**: No conflicts with Cline updates
- **Clarity**: Clear separation of Caret-specific APIs

## Core Principles

### 1. Single-Field Update Principle

**Anti-pattern** (Sends all fields):
```typescript
// ❌ Don't do this - sends ALL settings even when only one changes
setChatSettings({
  ...currentSettings,
  uiLanguage: "ja", // Only this changed
  // But apiConfiguration, telemetrySetting, etc. all sent too
})
```

**Correct Pattern** (Sends only changed field):
```typescript
// ✅ Do this - sends ONLY changed field
setUILanguage: async (language: string) => {
  setState((prev) => ({ ...prev, uiLanguage: language }))

  await StateServiceClient.updateSettings({
    uiLanguage: language, // Only this field
  })
}
```

### 2. Optimistic Update Pattern

```typescript
const updateSingleField = async <T>(
  fieldName: keyof ExtensionState,
  newValue: T,
  updateFn: (value: T) => Promise<void>
) => {
  // 1. Backup previous value
  const previousValue = state[fieldName]

  // 2. Immediate UI update (better UX)
  setState((prev) => ({ ...prev, [fieldName]: newValue }))

  try {
    // 3. Backend update
    await updateFn(newValue)
  } catch (error) {
    // 4. Rollback on failure
    setState((prev) => ({ ...prev, [fieldName]: previousValue }))
    throw error
  }
}

// Usage example
const setPersona = (persona: PersonaConfig) =>
  updateSingleField("currentPersona", persona, async (value) => {
    await StateServiceClient.updateSettings({
      currentPersona: convertPersonaToProto(value),
    })
  })
```

### 3. Circular Message Prevention Pattern

**Problem Scenario:**
```
1. webview: Setting change → updateSettings request
2. backend: Saves all settings → calls postStateToWebview()
3. webview: subscription receives new state → overwrites user changes ❌
```

**Solution Pattern:**
```typescript
// Backend: src/core/controller/state/updateSettings.ts
export async function updateSettings(request: UpdateSettingsRequest): Promise<Empty> {
  // Count changed fields
  const changedFields = Object.keys(request).filter(
    (key) => request[key] !== undefined && request[key] !== null
  )

  // Save individual fields
  if (request.uiLanguage) {
    await saveUILanguage(request.uiLanguage)
  }

  if (request.currentPersona) {
    await savePersona(request.currentPersona)
  }

  // Skip broadcast for single-field updates (prevents circular messages)
  if (changedFields.length > 1) {
    await controller.postStateToWebview()
  }

  return Empty.create()
}
```

## Standard Implementation Templates

### Frontend Setting Update Function

```typescript
// webview-ui/src/context/ExtensionStateContext.tsx
interface SettingUpdateFunctions {
  setUILanguage: (language: string) => Promise<void>
  setPersona: (persona: PersonaConfig) => Promise<void>
  setTheme: (theme: ThemeConfig) => Promise<void>
}

const createSettingUpdater = <T>(
  fieldName: keyof ExtensionState,
  protoConverter: (value: T) => any
) => async (value: T) => {
  const previousValue = state[fieldName]

  // Optimistic update
  setState((prev) => ({ ...prev, [fieldName]: value }))

  try {
    await StateServiceClient.updateSettings({
      [fieldName]: protoConverter(value),
    })
  } catch (error) {
    // Rollback on failure
    setState((prev) => ({ ...prev, [fieldName]: previousValue }))
    console.error(`Failed to update ${fieldName}:`, error)
    throw error
  }
}

// Concrete functions
const setUILanguage = createSettingUpdater("uiLanguage", (lang: string) => lang)
const setPersona = createSettingUpdater("currentPersona", convertPersonaToProto)
```

### Backend Processing Template

```typescript
// Pattern to follow when adding new setting fields
export async function updateSettings(request: UpdateSettingsRequest): Promise<Empty> {
  const updates: Array<() => Promise<void>> = []

  // Individual field processing
  if (request.uiLanguage) {
    updates.push(() => saveToGlobalState("uiLanguage", request.uiLanguage))
  }

  if (request.currentPersona) {
    updates.push(() => saveToWorkspaceState("currentPersona", request.currentPersona))
  }

  if (request.chatSettings) {
    updates.push(() => saveToWorkspaceState("chatSettings", request.chatSettings))
  }

  // Execute all updates
  await Promise.all(updates.map((update) => update()))

  // Broadcast condition
  const shouldBroadcast = updates.length > 1 || isComplexUpdate(request)
  if (shouldBroadcast) {
    await controller.postStateToWebview()
  }

  return Empty.create()
}

function isComplexUpdate(request: UpdateSettingsRequest): boolean {
  // Complex updates (e.g., API config changes) need broadcast
  return !!(request.apiConfiguration || request.telemetrySetting)
}
```

## Implementation Checklist

When implementing new settings or state updates:
- [ ] Caret-specific proto defined in `proto/caret/`
- [ ] Single-field update pattern used (not bulk updates)
- [ ] Optimistic update with rollback implemented
- [ ] Circular message prevention logic added
- [ ] TDD tests written (RED → GREEN → REFACTOR)
- [ ] Both frontend and backend verified

## Common Pitfalls

1. **Modifying Cline proto files** → Use `proto/caret/` instead
2. **Sending all settings on single change** → Send only changed field
3. **No rollback on failure** → Implement optimistic update pattern
4. **Broadcasting on every update** → Skip broadcast for single-field updates
5. **No error handling** → Always catch and rollback on errors

## Related Documents
- `.agents/context/webview-communication.md`: Webview message flow details
- `.agents/context/component-architecture.md`: Frontend component patterns
- `caret-docs/development/frontend-backend-interaction-patterns.md`: Full guide (Korean)
