You are implementing comprehensive testing following integration-first TDD methodology.

<detailed_sequence_of_steps>
# Testing Work - Comprehensive Testing Implementation

## Atomic Components Used
- `/tdd-cycle` - RED→GREEN→REFACTOR with integration tests first
- `/verification-steps` - Test→Compile→Execute validation sequence
- `/naming-conventions` - Consistent test file naming and structure

## Pre-Testing Phase

### Step 1: Test Strategy Planning
**Define testing scope and approach:**
- [ ] What is the main user scenario being tested?
- [ ] Which system components need integration testing?
- [ ] What edge cases and error conditions exist?
- [ ] Are there performance or reliability requirements?
- [ ] What external dependencies need mocking?

### Step 2: Test Environment Setup
```bash
# Verify test infrastructure
npm run test:webview     # Frontend testing capability
# npm run test:backend   # Backend testing (planned)
npm run test:coverage    # Coverage reporting available
```

## TDD Implementation Cycle

### Step 3: RED - Integration Test First (`/tdd-cycle`)
**Write failing integration test for real user scenario:**

```typescript
// Example: Complete feature integration test
describe('Persona System Integration', () => {
  it('should allow user to select persona, persist choice, and affect AI responses', async () => {
    // Setup real-like environment
    const mockContext = createMockExtensionContext();
    const mockAIService = createMockAIService();
    const mockWebview = createMockWebviewProvider();
    
    // Initialize complete system
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    const ui = render(<PersonaSelector personaSystem={personaSystem} />);
    
    // User interaction: Select creative persona
    const creativePersona = ui.getByText('Creative Assistant');
    fireEvent.click(creativePersona);
    
    // Wait for async operations
    await waitFor(() => {
      // Verify storage persistence  
      expect(mockContext.workspaceState.update).toHaveBeenCalledWith(
        'selectedPersona', 'creative'
      );
      
      // Verify AI system update
      expect(mockAIService.updateSystemPrompt).toHaveBeenCalledWith(
        expect.stringContaining('creative and imaginative')
      );
      
      // Verify UI feedback
      expect(ui.getByText('Creative Assistant Selected')).toBeInTheDocument();
    });
    
    // Test AI response with new persona
    const chatInput = ui.getByPlaceholderText('Type your message...');
    fireEvent.change(chatInput, { target: { value: 'Help me write a story' } });
    fireEvent.submit(chatInput.closest('form'));
    
    await waitFor(() => {
      // Verify AI called with creative context
      expect(mockAIService.query).toHaveBeenCalledWith({
        systemPrompt: expect.stringContaining('creative persona'),
        userQuery: 'Help me write a story',
        context: expect.objectContaining({ persona: 'creative' })
      });
    });
  });
});
```

### Step 4: GREEN - Minimal Implementation
**Create just enough code to make integration test pass:**

```typescript
// PersonaSystem - minimal implementation
export class PersonaSystem {
  constructor(
    private context: vscode.ExtensionContext,
    private aiService: AIService
  ) {}
  
  async selectPersona(personaId: string): Promise<void> {
    // Persist selection
    await this.context.workspaceState.update('selectedPersona', personaId);
    
    // Update AI system
    const prompt = this.buildPersonaPrompt(personaId);
    await this.aiService.updateSystemPrompt(prompt);
    
    // Notify UI (simplified)
    this.notifyUIUpdate(personaId);
  }
  
  private buildPersonaPrompt(personaId: string): string {
    const personas = {
      'creative': 'You are a creative and imaginative assistant...',
      'technical': 'You are a precise technical assistant...',
      'default': 'You are a helpful assistant...'
    };
    return personas[personaId] || personas.default;
  }
}
```

### Step 5: REFACTOR - Add Comprehensive Testing
**Improve implementation and add supporting tests:**

```typescript
// Add edge case tests
describe('PersonaSystem Edge Cases', () => {
  it('should handle invalid persona selection gracefully', async () => {
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    // Test invalid persona ID
    await expect(personaSystem.selectPersona('invalid-persona')).resolves.not.toThrow();
    
    // Should fallback to default
    expect(mockAIService.updateSystemPrompt).toHaveBeenCalledWith(
      expect.stringContaining('helpful assistant')
    );
  });
  
  it('should handle storage failures gracefully', async () => {
    mockContext.workspaceState.update.mockRejectedValue(new Error('Storage failed'));
    
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    // Should not crash on storage failure
    await expect(personaSystem.selectPersona('creative')).resolves.not.toThrow();
    
    // Should log error appropriately
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Storage failed'));
  });
});

// Add performance tests
describe('PersonaSystem Performance', () => {
  it('should select persona within reasonable time', async () => {
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    const startTime = performance.now();
    await personaSystem.selectPersona('creative');
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(100); // 100ms limit
  });
});
```

## Testing Validation Phase

### Step 6: Test Coverage Verification (`/verification-steps`)
```bash
# Run comprehensive test suite
npm run test:webview
npm run test:coverage

# Verify coverage meets requirements
# Target: >90% line coverage for new features
# Target: 100% integration test coverage for user flows
```

### Step 7: Test Quality Validation
- [ ] **Integration tests cover real user scenarios** (not just isolated units)
- [ ] **Edge cases tested** (invalid inputs, network failures, storage errors)
- [ ] **Error handling verified** (graceful degradation, user feedback)
- [ ] **Performance requirements met** (response times, memory usage)
- [ ] **Cross-browser/platform compatibility** (if applicable)

### Step 8: Test Naming Verification (`/naming-conventions`)
```
✅ PersonaSystem.test.ts          (matches PersonaSystem.ts)
✅ persona-service.test.ts        (matches persona-service.ts) 
✅ PersonaSelector.test.tsx       (matches PersonaSelector.tsx)

❌ TestPersonaSystem.ts           (wrong pattern)
❌ persona-system-test.ts         (wrong pattern)
❌ PersonaSelectorTests.tsx       (wrong pattern)
```

## Post-Testing Phase

### Step 9: Complete Verification Cycle (`/verification-steps`)
```bash
# Full validation sequence
npm run test:coverage     # Comprehensive test run
npm run compile          # TypeScript compilation
npm run check-types      # Type validation
npm run watch           # Runtime testing (F5 in VSCode)
```

### Step 10: Test Maintenance Setup
- [ ] **Test documentation** - README with test running instructions
- [ ] **CI integration** - Tests run on every commit
- [ ] **Test data management** - Mock data and fixtures organized
- [ ] **Flaky test monitoring** - Process for handling unstable tests

## Testing Patterns & Best Practices

### Effective Test Structure:
```typescript
describe('Feature Integration', () => {
  // Setup once per test suite
  beforeEach(() => {
    // Reset mocks and state
  });
  
  describe('Happy Path Scenarios', () => {
    it('should handle typical user workflow', () => {
      // Test main success path
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle invalid inputs gracefully', () => {
      // Test error conditions
    });
  });
  
  describe('Performance', () => {
    it('should complete operations within time limits', () => {
      // Test performance requirements
    });
  });
});
```

## Related Workflows
- Essential completion step for `/new-component` development
- Critical validation for `/ai-feature` implementations  
- Required before `/cline-modification` changes
- Apply `/critical-verification` when test strategy is complex
</detailed_sequence_of_steps>

<general_guidelines>
Comprehensive testing prevents regressions and ensures reliable user experiences.

Integration-first testing catches real-world problems that unit tests often miss.

Good test coverage enables confident refactoring and feature development.
</general_guidelines>