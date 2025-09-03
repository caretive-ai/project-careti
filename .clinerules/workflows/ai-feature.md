You are implementing AI-related features with proper message flow and testing.

<detailed_sequence_of_steps>
# AI Feature - AI Integration Development Workflow

## Atomic Components Used
- `/message-flow` - Frontend ↔ Backend ↔ AI communication patterns
- `/tdd-cycle` - Integration-first testing methodology
- `/verification-steps` - Complete system validation
- `/storage-patterns` - AI context and settings persistence

## Pre-Development Phase

### Step 1: AI Feature Architecture
**Define AI integration points:**
- [ ] What AI service does this feature use? (Claude, GPT, Local model)
- [ ] How does it integrate with existing AI context?
- [ ] What user interactions trigger AI requests?
- [ ] How are AI responses processed and displayed?
- [ ] What context needs to persist across conversations?

### Step 2: Message Flow Design (`/message-flow`)
```typescript
// Define message types for AI feature
interface AIFeatureMessages {
  // Frontend → Backend
  'ai-feature-request': {
    userInput: string;
    context: FeatureContext;
    settings: FeatureSettings;
  };
  
  // Backend → Frontend  
  'ai-feature-response': {
    aiOutput: string;
    updatedContext: FeatureContext;
    status: 'success' | 'error' | 'partial';
  };
  
  // Backend → AI Service
  'ai-service-query': {
    systemPrompt: string;
    userQuery: string;
    conversationContext: AIContext;
  };
}
```

## TDD Implementation Phase  

### Step 3: RED - AI Integration Test (`/tdd-cycle`)
**Write integration test for complete AI interaction flow:**

```typescript
describe('AI Persona Feature Integration', () => {
  it('should process user input through AI with persona context and return formatted response', async () => {
    // Setup: User has selected creative persona
    const mockContext = createMockExtensionContext();
    await mockContext.workspaceState.update('selectedPersona', 'creative');
    
    const aiFeature = new AIPersonaFeature(mockContext);
    
    // User interaction: Ask AI question
    const userInput = "Help me write a creative story";
    const response = await aiFeature.processUserRequest(userInput);
    
    // Expected AI integration flow:
    expect(mockAIService.query).toHaveBeenCalledWith({
      systemPrompt: expect.stringContaining('creative persona'),
      userQuery: userInput,
      conversationContext: expect.objectContaining({
        persona: 'creative'
      })
    });
    
    // Expected output formatting
    expect(response.content).toBeDefined();
    expect(response.persona).toBe('creative');
    expect(response.formatted).toBe(true);
  });
});
```

### Step 4: GREEN - AI Service Integration
**Implement AI service integration with proper message flow:**

```typescript
export class AIPersonaFeature {
  constructor(
    private context: vscode.ExtensionContext,
    private aiService: AIService,
    private messageHandler: MessageHandler
  ) {}
  
  async processUserRequest(userInput: string): Promise<AIResponse> {
    // Apply storage patterns - get persona context
    const selectedPersona = this.getSelectedPersona(); // workspace-specific
    const userPreferences = this.getUserPreferences(); // global settings
    
    // Build AI context with persona
    const aiContext = this.buildAIContext(selectedPersona, userPreferences);
    
    // Query AI service with context
    const aiResponse = await this.aiService.query({
      systemPrompt: this.buildPersonaPrompt(selectedPersona),
      userQuery: userInput,
      conversationContext: aiContext
    });
    
    // Process and format response
    const formattedResponse = this.formatAIResponse(aiResponse, selectedPersona);
    
    // Update conversation context (workspace storage)
    await this.updateConversationHistory(userInput, formattedResponse);
    
    return formattedResponse;
  }
  
  private getSelectedPersona(): string {
    return this.context.workspaceState.get('selectedPersona', 'default');
  }
  
  private getUserPreferences(): UserPreferences {
    return this.context.globalState.get('userPreferences', defaultPreferences);
  }
}
```

### Step 5: Frontend Integration (`/message-flow`)
**Implement frontend component with proper message handling:**

```typescript
const AIPersonaChat: React.FC = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage, onMessage } = useExtensionMessage();
  
  // Handle AI responses
  useEffect(() => {
    const handleAIResponse = (message: ExtensionMessage) => {
      if (message.type === 'ai-feature-response') {
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: message.payload.aiOutput,
          persona: message.payload.context.persona
        }]);
        setIsLoading(false);
      }
    };
    
    onMessage(handleAIResponse);
  }, [onMessage]);
  
  const handleUserInput = async (input: string) => {
    setIsLoading(true);
    setConversation(prev => [...prev, { role: 'user', content: input }]);
    
    // Send to backend AI feature
    sendMessage({
      type: 'ai-feature-request',
      payload: {
        userInput: input,
        context: getConversationContext(),
        settings: getUserSettings()
      },
      requestId: generateRequestId()
    });
  };
  
  return (
    <div className="ai-persona-chat">
      <ConversationView messages={conversation} />
      <UserInput onSubmit={handleUserInput} disabled={isLoading} />
    </div>
  );
};
```

### Step 6: REFACTOR - AI Performance & Error Handling
```typescript
// Add proper error handling and performance optimization
class AIPersonaFeature {
  async processUserRequest(userInput: string): Promise<AIResponse> {
    try {
      // Rate limiting
      await this.rateLimiter.checkLimit();
      
      // Context optimization - limit conversation history size
      const optimizedContext = this.optimizeContext(this.getConversationHistory());
      
      // AI query with timeout and retry
      const aiResponse = await this.aiService.queryWithRetry({
        systemPrompt: this.buildPersonaPrompt(selectedPersona),
        userQuery: userInput,  
        conversationContext: optimizedContext,
        timeout: 30000
      });
      
      return this.formatAIResponse(aiResponse);
      
    } catch (error) {
      this.logger.error('AI feature request failed', { error, userInput });
      return this.createErrorResponse(error);
    }
  }
}
```

## Post-Implementation Phase

### Step 7: AI Feature Validation (`/verification-steps`)
```bash
# Test AI integration end-to-end
npm run test:webview  # Frontend component tests
# npm run test:backend (when available) # AI service integration tests

# Compile verification
npm run compile
npm run check-types

# Live testing
npm run watch  # F5 to test full AI interaction flow
```

### Step 8: AI Performance Validation  
- [ ] AI responses render correctly in UI
- [ ] Conversation context persists properly
- [ ] Error states handled gracefully
- [ ] Rate limiting works correctly
- [ ] Memory usage stable during long conversations
- [ ] AI service integration robust to API failures

## Related Workflows
- Use `/storage-patterns` for conversation and context persistence
- Apply `/critical-verification` for complex AI integration decisions
- Consider `/new-component` when creating AI-related UI components
- Use `/cline-modification` sparingly for AI system integration points
</detailed_sequence_of_steps>

<general_guidelines>
AI features require careful attention to message flow, context management, and error handling.

The integration-first testing approach ensures the complete AI interaction flow works correctly.

Proper storage patterns prevent loss of conversation context and maintain user experience.
</general_guidelines>