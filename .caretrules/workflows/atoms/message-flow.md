You are following the message flow patterns for Frontend ↔ Backend ↔ AI communication.

<detailed_sequence_of_steps>
# Message Flow - Frontend ↔ Backend ↔ AI Communication

## Core Principle
**Prevent circular messages while maintaining clean separation of concerns**

## Communication Architecture

### Primary Flow:
```
Frontend (React) ↔ Backend (Extension) ↔ AI Services
     ↑                    ↓
WebView Messages    Protocol Buffers/JSON
```

### Key Components:
- **Frontend**: `webview-ui/src/` React components
- **Backend**: `src/core/` extension logic + `caret-src/` extensions
- **Protocols**: `proto/` definitions for type-safe communication

## Message Types & Patterns

### Frontend → Backend Messages:
```typescript
// User interactions, settings changes, commands
interface FrontendMessage {
  type: 'userInput' | 'settingsUpdate' | 'commandTrigger';
  payload: unknown;
  requestId: string;
}
```

### Backend → Frontend Messages:
```typescript
// AI responses, status updates, data changes  
interface BackendMessage {
  type: 'aiResponse' | 'statusUpdate' | 'dataChange';
  payload: unknown;
  responseId: string; // Links to original requestId
}
```

### Backend → AI Messages:
```typescript
// System prompts, user queries, context
interface AIMessage {
  systemPrompt: string;
  userQuery: string;  
  context: ConversationContext;
}
```

## Circular Message Prevention

### Anti-Patterns to Avoid:
```typescript
❌ // Infinite loop risk
onAIResponse(response => {
  sendToFrontend(response);
  sendToAI(generateFollowup(response)); // Creates loop!
});

❌ // Frontend triggering backend triggering frontend
onUserInput(input => {
  processInput(input);
  updateUI(newState); // Triggers more user events!
});
```

### Safe Patterns:
```typescript
✅ // Request-Response with clear termination
async handleUserInput(input: UserInput): Promise<void> {
  const aiResponse = await queryAI(input);
  await sendToFrontend({ type: 'aiResponse', payload: aiResponse });
  // Clear termination - no further automatic messages
}

✅ // State-based updates with guards
updateConversationState(newState: ConversationState): void {
  if (this.currentState.id !== newState.id) { // Guard against duplicates
    this.currentState = newState;
    this.notifyFrontend(newState);
  }
}
```

## Message Processing Pipeline

### 1. Input Validation:
```typescript
function validateMessage(msg: unknown): msg is ValidMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg;
}
```

### 2. Type-Safe Routing:
```typescript
function routeMessage(msg: ValidMessage): void {
  switch (msg.type) {
    case 'userInput': return handleUserInput(msg);
    case 'settingsUpdate': return handleSettings(msg);
    default: throw new Error(`Unknown message type: ${msg.type}`);
  }
}
```

### 3. Response Correlation:
```typescript
const pendingRequests = new Map<string, PendingRequest>();

function sendRequest(msg: FrontendMessage): void {
  pendingRequests.set(msg.requestId, { timestamp: Date.now(), type: msg.type });
  sendToBackend(msg);
}

function handleResponse(msg: BackendMessage): void {
  const request = pendingRequests.get(msg.responseId);
  if (request) {
    pendingRequests.delete(msg.responseId);
    processResponse(msg, request);
  }
}
```

## Integration with Other Systems

### With Storage Patterns:
- Message state → `workspaceState` (conversation-specific)
- User preferences → `globalState` (cross-project)

### With Persona System:
- Include persona context in AI messages
- Filter responses based on persona settings

### With Branding System:  
- Apply brand filters to outgoing messages
- Maintain brand consistency across communication

## Related Workflows
- Essential for implementing features with `/modification-levels`
- Test message flows with `/tdd-cycle` integration tests  
- Apply `/storage-patterns` for message persistence
</detailed_sequence_of_steps>

<general_guidelines>
This message flow architecture ensures predictable, maintainable communication between system components.

The key is preventing circular dependencies while maintaining responsive user interactions.

Always design with clear request-response patterns and proper state management.
</general_guidelines>