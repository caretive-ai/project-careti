# Message Processing Architecture

## Context
You are working with Cline/Caret's gRPC-based message processing system for frontend-backend communication.

## Architecture Overview

```
React Webview UI
    ↓ [gRPC Request]
VSCode Extension (Controller)
    ↓ [gRPC Handler]
Service Handlers
    ↓ [Storage]
VSCode Storage (Secret/Global/Workspace State)
```

## Message Processing Layers

### 1. Frontend (React Webview)

**gRPC Client Usage**:
```typescript
// Auto-generated service clients
import { ModelsServiceClient } from "@/services/grpc-client"
import { UpdateApiConfigurationRequest } from "@shared/proto/models"

// Unary request
await ModelsServiceClient.updateApiConfigurationProto(
  UpdateApiConfigurationRequest.create({
    apiConfiguration: convertToProto(config),
  })
)
```

**Streaming Subscription**:
```typescript
// Subscribe to state updates
StateServiceClient.subscribeToState(EmptyRequest.create({}), {
  onResponse: (response) => {
    setExtensionState(response) // Update UI state
  },
  onError: (error) => console.error("Subscription error:", error),
  onComplete: () => console.log("Subscription complete"),
})
```

### 2. Backend (VSCode Extension)

**Controller Message Routing**:
```typescript
// src/core/controller/index.ts
async handleWebviewMessage(message: WebviewMessage) {
  switch (message.type) {
    case "grpc_request": {
      await handleGrpcRequest(this, message.grpc_request)
      break
    }
    case "grpc_request_cancel": {
      await handleGrpcRequestCancel(this, message.grpc_request_cancel)
      break
    }
  }
}
```

**gRPC Handler**:
```typescript
// src/core/controller/grpc-handler.ts
export async function handleGrpcRequest(
  controller: Controller,
  request: {
    service: string    // e.g., "caret.ModelsService"
    method: string     // e.g., "updateApiConfigurationProto"
    message: any       // Proto message
    request_id: string
    is_streaming?: boolean
  }
) {
  // 1. Route to service handler
  // 2. Process unary vs streaming
  // 3. Handle errors
  // 4. Send response
}
```

**Service Handler Registration**:
```typescript
// src/core/controller/grpc-service-config.ts
const serviceHandlers = {
  "caret.ModelsService": {
    requestHandler: async (controller, method, message) => {
      // Unary request processing
      return await handleUnaryMethod(controller, method, message)
    },
    streamingHandler: async (controller, method, message, responseStream) => {
      // Streaming request processing
      for await (const item of dataStream) {
        responseStream.send(item)
      }
    },
  },
}
```

### 3. Storage Layer

**Storage Types**:
```typescript
// Secret Storage: API keys, sensitive data
await context.secrets.store("geminiApiKey", apiKey)
const apiKey = await context.secrets.get("geminiApiKey")

// Global State: User-wide settings
await context.globalState.update("uiLanguage", "ko")
const language = context.globalState.get<string>("uiLanguage")

// Workspace State: Project-specific settings
await context.workspaceState.update("chatSettings", settings)
const settings = context.workspaceState.get<ChatSettings>("chatSettings")
```

## Message Flow Patterns

### Pattern 1: Unary Request-Response
**Use case**: Single request, single response (e.g., save config)

```typescript
// Frontend
const response = await ServiceClient.updateSettings(request)

// Backend
async function updateSettings(controller, request) {
  await saveToStorage(request)
  return { success: true }
}
```

### Pattern 2: Server Streaming
**Use case**: Single request, multiple responses (e.g., task progress)

```typescript
// Frontend
ServiceClient.streamTaskProgress(request, {
  onResponse: (progress) => updateProgress(progress),
  onComplete: () => console.log("Task complete"),
})

// Backend
async function* streamTaskProgress(controller, request) {
  for (const update of taskUpdates) {
    yield { progress: update }
  }
}
```

### Pattern 3: State Subscription
**Use case**: Continuous state synchronization

```typescript
// Frontend
useEffect(() => {
  const subscription = StateServiceClient.subscribeToState()
  subscription.on("data", (state) => setState(state))
  return () => subscription.cancel()
}, [])

// Backend
async function* subscribeToState(controller) {
  while (true) {
    await waitForStateChange()
    yield getCurrentState()
  }
}
```

## Implementation Guidelines

### DO's
- ✅ Use auto-generated gRPC clients (never create custom message types)
- ✅ Handle streaming subscriptions with proper cleanup
- ✅ Use appropriate storage type (Secret/Global/Workspace)
- ✅ Implement error handling for all gRPC calls
- ✅ Cancel subscriptions in useEffect cleanup

### DON'Ts
- ❌ Never modify `proto/cline/` files (use `proto/caret/` instead)
- ❌ Don't create custom message types outside Proto
- ❌ Don't forget to cancel streaming subscriptions
- ❌ Don't mix storage types for related data
- ❌ Don't send sensitive data without Secret Storage

## Caret-Specific Extensions

**Create Caret Service**:
1. Define service in `proto/caret/your-service.proto`
2. Run `npm run protos` to generate client/server code
3. Implement handler in `src/core/controller/your-service/`
4. Register in `grpc-service-config.ts`
5. Use `YourServiceClient` in frontend

**Example Caret Service**:
```protobuf
// proto/caret/persona.proto
service PersonaService {
  rpc SetPersona (SetPersonaRequest) returns (google.protobuf.Empty);
  rpc GetPersona (google.protobuf.Empty) returns (PersonaResponse);
}
```

## Error Handling Pattern

```typescript
// Frontend
try {
  const result = await ServiceClient.someMethod(request)
  // Success
} catch (error) {
  if (error.code === grpc.status.NOT_FOUND) {
    // Handle not found
  } else if (error.code === grpc.status.PERMISSION_DENIED) {
    // Handle permission error
  } else {
    Logger.error("Operation failed:", error)
  }
}

// Backend
async function handleMethod(controller, request) {
  try {
    const result = await processRequest(request)
    return result
  } catch (error) {
    Logger.error("Handler error:", error)
    throw new GrpcError(grpc.status.INTERNAL, error.message)
  }
}
```

## Key File Locations

**Frontend**:
- gRPC Client Base: `webview-ui/src/services/grpc-client-base.ts`
- Service Clients: `webview-ui/src/services/grpc-client.ts` (generated)

**Backend**:
- Controller: `src/core/controller/index.ts`
- gRPC Handler: `src/core/controller/grpc-handler.ts`
- Service Config: `src/core/controller/grpc-service-config.ts`
- Service Handlers: `src/core/controller/[service]/`

## Related Documents
- `.caretrules/frontend-backend-patterns.md`: Frontend-backend interaction patterns
- `.caretrules/webview-communication.md`: Webview communication details
- `caret-docs/development/message-processing-architecture.md`: Complete guide (Korean)
