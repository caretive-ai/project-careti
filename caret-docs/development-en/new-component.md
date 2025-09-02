You are creating new components using TDD and consistent patterns.

<detailed_sequence_of_steps>
# New Component - TDD Component Creation Workflow

## Atomic Components Used
- `/tdd-cycle` - RED→GREEN→REFACTOR methodology
- `/naming-conventions` - Consistent file and variable naming
- `/storage-patterns` - Appropriate state management
- `/verification-steps` - Complete testing validation

## Pre-Development Phase

### Step 1: Component Planning
**Define component purpose and integration:**
- [ ] What user interaction does this component handle?
- [ ] How does it integrate with existing system?
- [ ] What storage scope is needed (workspace vs global)?
- [ ] Is this a React component (.tsx) or service class (.ts)?

### Step 2: Naming Decision (`/naming-conventions`)
```
// For React Components (Frontend)
PersonaSelector.tsx → PersonaSelector.test.tsx

// For Service Classes (Backend)  
persona-service.ts → persona-service.test.ts

// For Utility Functions
message-processor.ts → message-processor.test.ts
```

## TDD Implementation Phase

### Step 3: RED - Integration Test First (`/tdd-cycle`)
**Write test for actual user scenario, not isolated units:**

```typescript
// Example: React Component Integration Test
describe('PersonaSelector Component', () => {
  it('should update AI behavior when user selects new persona', async () => {
    render(<PersonaSelector />);
    
    // User interaction
    const personaOption = screen.getByText('Creative Assistant');
    fireEvent.click(personaOption);
    
    // Expected system behavior  
    expect(mockPersonaService.setActive).toHaveBeenCalledWith('creative');
    expect(mockAIService.updateContext).toHaveBeenCalled();
  });
});
```

```typescript
// Example: Service Integration Test
describe('PersonaService', () => {
  it('should persist persona selection and update AI context', async () => {
    const service = new PersonaService(mockContext);
    
    // Business operation
    await service.selectPersona('creative');
    
    // Expected outcomes
    expect(mockContext.workspaceState.update).toHaveBeenCalledWith(
      'selectedPersona', 'creative'
    );
    expect(mockAIService.updateSystemPrompt).toHaveBeenCalled();
  });
});
```

### Step 4: GREEN - Implementation (`/storage-patterns`)
**Create minimal implementation to pass integration test:**

```typescript
// Apply storage patterns appropriately
export class PersonaService {
  constructor(private context: vscode.ExtensionContext) {}
  
  async selectPersona(personaId: string): Promise<void> {
    // Workspace storage - persona selection is project-specific
    await this.context.workspaceState.update('selectedPersona', personaId);
    
    // Update AI system with new context
    await this.aiService.updateSystemPrompt(this.buildPrompt(personaId));
  }
  
  getSelectedPersona(): string {
    // Consistent storage pattern
    return this.context.workspaceState.get('selectedPersona', 'default');
  }
}
```

### Step 5: REFACTOR - Quality Improvement
**Improve implementation while keeping tests passing:**
- Extract common patterns
- Add error handling
- Optimize performance
- Add unit tests as byproducts (not starting points)

## Post-Implementation Phase

### Step 6: Full Verification (`/verification-steps`)
```bash
# Test verification
npm run test:webview      # For React components
# (test:backend when available) # For service classes

# Compile verification  
npm run compile
npm run check-types

# Execute verification
npm run watch            # Start development
# F5 in VSCode to test extension
```

### Step 7: Integration Validation
- [ ] Component integrates with existing UI/system
- [ ] Storage patterns work correctly (data persists/loads)
- [ ] No memory leaks or performance issues
- [ ] Error handling works appropriately
- [ ] Naming follows project conventions

## File Structure Examples

### React Component Creation:
```
webview-ui/src/caret/components/
├── PersonaSelector.tsx
├── PersonaSelector.test.tsx
└── PersonaSelector.module.css (if needed)
```

### Service Class Creation:
```
caret-src/services/
├── persona-service.ts
├── persona-service.test.ts
└── types/
    └── persona-types.ts
```

## Integration with Other Workflows

### Use with `/message-flow`:
```typescript
// Component that communicates with backend
const PersonaSelector: React.FC = () => {
  const sendMessage = useExtensionMessage();
  
  const handlePersonaSelect = (personaId: string) => {
    sendMessage({
      type: 'personaUpdate',
      payload: { personaId },
      requestId: generateId()
    });
  };
};
```

### Use with `/modification-levels`:
- **Level 1**: New components in caret-src/ or caret components
- **Level 2**: Integration points with existing Cline components  
- **Level 3**: Major modifications to existing Cline components (avoid)

## Related Workflows
- Apply `/critical-verification` when component design is complex
- Use `/cline-modification` if integration with Cline components needed
- Consider `/message-flow` for frontend-backend communication
</detailed_sequence_of_steps>

<general_guidelines>
This workflow ensures new components follow TDD principles and integrate cleanly with the existing system.

The focus on integration tests first prevents isolated components that don't work in real scenarios.

Consistent naming and storage patterns maintain codebase coherence and predictability.
</general_guidelines>