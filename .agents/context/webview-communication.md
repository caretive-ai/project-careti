# Webview-Extension Communication Guide

## Context
You are implementing communication between Caret's Webview (React) and VSCode Extension Host using gRPC.

## Communication Structure

### Basic Flow
```
Webview UI (React)
    ↕ [gRPC Client]
Extension Host (Node.js)
    ↕ [gRPC Server]
Controller → Task
```

### Key Components

1. **Webview Layer**:
   - React components
   - ExtensionStateContext (state management)
   - gRPC clients (auto-generated)

2. **Extension Layer**:
   - WebviewProvider/CaretProvider
   - gRPC server and service handlers
   - Controller (message routing)

## gRPC Communication Pattern

### Cline Services (DO NOT MODIFY)
- `UiService`: Cline's original UI communication
- `StateService`: Settings and state management
- `McpService`: Model Context Protocol

### Caret Services (Independent Implementation)
Create new services in `proto/caret/`:

```protobuf
// proto/caret/persona.proto
syntax = "proto3";
package caret;

service PersonaService {
  rpc GetCurrentPersona (Empty) returns (PersonaResponse);
  rpc SetPersona (SetPersonaRequest) returns (Empty);
}

message SetPersonaRequest {
  string persona_id = 1;
}

message PersonaResponse {
  string persona_id = 1;
  string name = 2;
  string avatar_url = 3;
}
```

### Client Usage (Webview)
```typescript
// Auto-generated client from proto
import { PersonaServiceClient } from "@/services/grpc-client"

// Usage in components
const { currentPersona } = useExtensionState()

const handlePersonaChange = async (personaId: string) => {
  try {
    await PersonaServiceClient.SetPersona({ persona_id: personaId })
    // State updated via subscription
  } catch (error) {
    console.error("Failed to set persona:", error)
  }
}
```

### Server Implementation (Extension)
```typescript
// careti-src/core/controller/persona/setPersona.ts
export async function SetPersona(
  controller: Controller,
  request: proto.careti.SetPersonaRequest
): Promise<proto.google.protobuf.Empty> {
  const { persona_id } = request

  // Validate
  if (!VALID_PERSONAS.includes(persona_id)) {
    throw new Error(`Invalid persona: ${persona_id}`)
  }

  // Save to state
  await controller.context.globalState.update("currentPersona", persona_id)

  // Broadcast update
  await controller.postStateToWebview()

  return proto.google.protobuf.Empty.create()
}
```

## State Management

### ExtensionStateContext Pattern

```typescript
// webview-ui/src/context/ExtensionStateContext.tsx
interface ExtensionState {
  // UI state
  theme: string
  language: string
  currentPersona: string
  isReady: boolean

  // API state
  apiConfiguration: ApiConfiguration

  // Update functions
  setUILanguage: (lang: string) => Promise<void>
  setPersona: (persona: string) => Promise<void>
}

// Provider implementation
export const ExtensionStateContextProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<ExtensionState>(initialState)

  // Subscribe to state updates from extension
  useEffect(() => {
    const subscription = StateServiceClient.subscribeToState()
    subscription.on("data", (update) => {
      setState((prev) => ({ ...prev, ...convertFromProto(update) }))
    })

    return () => subscription.cancel()
  }, [])

  return (
    <ExtensionStateContext.Provider value={state}>
      {children}
    </ExtensionStateContext.Provider>
  )
}
```

## Message Flow Patterns

### 1. Request-Response Pattern
**Use for**: Immediate operations (save, load, validate)

```typescript
// Frontend
const saveConfig = async (config: ApiConfig) => {
  try {
    await StateServiceClient.updateSettings({ apiConfiguration: config })
    // Success
  } catch (error) {
    // Handle error
  }
}
```

### 2. Subscription Pattern
**Use for**: State updates, streaming data

```typescript
// Frontend
useEffect(() => {
  const subscription = StateServiceClient.subscribeToState()

  subscription.on("data", (state) => {
    setState(state)
  })

  subscription.on("error", (error) => {
    console.error("State subscription error:", error)
  })

  return () => subscription.cancel()
}, [])
```

### 3. Bidirectional Streaming
**Use for**: Real-time chat, continuous updates

```typescript
// Frontend (if needed for Caret features)
const chatStream = ChatServiceClient.streamChat()

chatStream.on("data", (message) => {
  addMessageToUI(message)
})

// Send messages
chatStream.write({ content: "Hello", role: "user" })
```

## Implementation Guidelines

### DO's
- ✅ Use separate `proto/caret/` for Caret services
- ✅ Follow single-field update pattern
- ✅ Implement optimistic updates with rollback
- ✅ Use TypeScript for type safety
- ✅ Handle errors gracefully
- ✅ Cancel subscriptions on cleanup

### DON'Ts
- ❌ Never modify Cline's proto files
- ❌ Don't send entire state on single-field updates
- ❌ Don't create circular message loops
- ❌ Don't ignore error handling
- ❌ Don't forget to cancel subscriptions

## Error Handling Pattern

```typescript
// Consistent error handling
const performOperation = async () => {
  try {
    const result = await ServiceClient.someOperation(request)
    return result
  } catch (error) {
    if (error.code === grpc.status.NOT_FOUND) {
      // Handle not found
    } else if (error.code === grpc.status.PERMISSION_DENIED) {
      // Handle permission error
    } else {
      // Generic error
      Logger.error("Operation failed:", error)
    }
    throw error // Re-throw for caller to handle
  }
}
```

## Testing Considerations

### Unit Tests
```typescript
// Mock gRPC client
jest.mock("@/services/grpc-client", () => ({
  PersonaServiceClient: {
    SetPersona: jest.fn().mockResolvedValue(Empty.create()),
  },
}))

test("should update persona", async () => {
  await setPersona("alpha")
  expect(PersonaServiceClient.SetPersona).toHaveBeenCalledWith({
    persona_id: "alpha",
  })
})
```

### Integration Tests
```typescript
// Test full flow
test("persona change updates UI", async () => {
  const { getByTestId } = render(<PersonaSelector />)
  const selector = getByTestId("persona-selector")

  fireEvent.change(selector, { target: { value: "beta" } })

  await waitFor(() => {
    expect(getByTestId("current-persona")).toHaveTextContent("Beta")
  })
})
```

## Related Documents
- `.agents/context/frontend-backend-patterns.md`: Interaction patterns and anti-patterns
- `.agents/context/component-architecture.md`: Component design principles
- `careti-docs/development/webview-extension-communication.md`: Full guide (Korean)
