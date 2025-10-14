# Frontend-Backend Message Flow Pattern

## Overview
Standardized patterns for webview (React) ↔ Extension Host (Node.js) communication in Caret.

## Critical: Caret gRPC Service Principle

**NEVER modify Cline's original proto files**. Create separate proto files for Caret-specific communication.

### Required Implementation Steps:

1. **Create `proto/caret/` directory** - Namespace for Caret `.proto` files
2. **Define new `.proto` files** - e.g., `proto/caret/persona.proto` with service and message definitions
3. **Implement independent service** - gRPC handlers in `caret-src`
4. **Register in `extension.ts`** - Add Caret service to gRPC server separately from Cline's `UiService`
5. **Use webview client** - Webview uses gRPC client to communicate with backend

### Benefits:
- **Independence**: No conflicts with future Cline updates
- **Clarity**: Clear separation of Caret-specific APIs

## Core Principles

### 1. Single Field Update Principle

**Wrong Pattern:**
```typescript
// Sends all settings even when changing one field
setChatSettings({
  ...currentSettings,
  uiLanguage: "ja", // Only this changed
  // But apiConfiguration, telemetrySetting etc. all sent
})
```

**Correct Pattern:**
```typescript
// Send only changed field
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
```

### 3. Circular Message Prevention

**Problem Scenario:**
```
1. webview: Change setting → updateSettings request
2. backend: Save all settings → postStateToWebview()
3. webview: Receive new state via subscription → User changes overwritten ❌
```

**Solution Pattern:**
```typescript
// Backend: src/core/controller/state/updateSettings.ts
export async function updateSettings(request: UpdateSettingsRequest): Promise<Empty> {
  // Count changed fields
  const changedFields = Object.keys(request).filter(
    key => request[key] !== undefined && request[key] !== null
  )
  
  // Save individual fields
  if (request.uiLanguage) {
    await saveUILanguage(request.uiLanguage)
  }
  
  if (request.currentPersona) {
    await savePersona(request.currentPersona)
  }
  
  // Skip broadcast for single field changes (prevent circular messages)
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
```

### Backend Processing Template

```typescript
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
  await Promise.all(updates.map(update => update()))
  
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

## Persona Development Example

```typescript
// Applying standard pattern for persona settings
interface PersonaConfig {
  name: string
  mode: "helper" | "expert" | "creative"
  personality: PersonalityTraits
  avatar: string
}

// Frontend
const setPersona = async (persona: PersonaConfig) => {
  const previous = state.currentPersona
  
  setState((prev) => ({ ...prev, currentPersona: persona }))
  
  try {
    await StateServiceClient.updateSettings({
      currentPersona: convertPersonaToProto(persona),
    })
  } catch (error) {
    setState((prev) => ({ ...prev, currentPersona: previous }))
    throw error
  }
}

// Backend
if (request.currentPersona) {
  await saveToWorkspaceState("currentPersona", request.currentPersona)
  // Persona change is single field, skip broadcast
}
```

## Debugging Guide

### Circular Message Debugging
```typescript
// Frontend message flow tracking
const debugMessageFlow = (actionName: string, data: any) => {
  console.log(`[${actionName}] Frontend → Backend:`, data)
}

// Backend broadcast tracking
const debugBroadcast = (reason: string, stateSnapshot: any) => {
  console.log(`[Broadcast] ${reason}:`, Object.keys(stateSnapshot))
}
```

### State Inconsistency Detection
```typescript
// Frontend state inconsistency detection
useEffect(() => {
  const checkStateConsistency = () => {
    if (state.uiLanguage !== expectedLanguage) {
      console.warn("State inconsistency detected:", {
        expected: expectedLanguage,
        actual: state.uiLanguage,
        timestamp: Date.now(),
      })
    }
  }
  
  checkStateConsistency()
}, [state.uiLanguage])
```

## Checklist for New Settings

### Adding New Setting Field:
- [ ] Define field in Proto file
- [ ] Frontend: Write single field update function
- [ ] Backend: Add individual processing logic in updateSettings.ts
- [ ] Verify circular message prevention logic
- [ ] Write TDD tests (RED → GREEN → REFACTOR)
- [ ] Validate with integration tests
- [ ] Manual test in Extension Host environment

### Modifying Existing Settings:
- [ ] Verify no impact on existing behavior
- [ ] Review circular message possibility
- [ ] Update related tests
- [ ] Run regression tests