# Component Architecture Principles

## Context
You are implementing UI components in Caret project, maintaining Cline compatibility while adding Caret-specific features.

## Core Principles

### 1. Structure Preservation
**Rule**: Maintain Cline's original component structure and patterns.

**Anti-pattern** (Hardcoded):
```typescript
// ❌ Don't do this
const CaretWelcome = () => (
  <div style={{ padding: "20px", border: "1px solid red" }}>
    <h2>Hardcoded Title</h2>
  </div>
)
```

**Correct Pattern** (Preserving structure):
```typescript
// ✅ Do this
const CaretWelcome = () => {
  const renderSection = (headerKey: string, bodyKey: string) => (
    <div style={{
      marginBottom: "25px",
      padding: "20px",
      border: "1px solid var(--vscode-settings-headerBorder)",
      borderRadius: "8px"
    }}>
      <h3>{t(headerKey, 'welcome')}</h3>
      <p>{t(bodyKey, 'welcome')}</p>
    </div>
  )

  return (
    <div className="careti-welcome">
      {renderSection('coreFeatures.header', 'coreFeatures.description')}
    </div>
  )
}
```

### 2. Component Separation
**Rule**: Create clearly separated components for each function.

```typescript
// ✅ Separated components
interface CaretWelcomeSectionProps {
  headerKey: string
  bodyKey: string
  buttonConfig?: ButtonConfig
}

const CaretWelcomeSection: React.FC<CaretWelcomeSectionProps> = ({
  headerKey, bodyKey, buttonConfig
}) => {
  return (
    <div className="careti-welcome-section">
      <h3>{t(headerKey, 'welcome')}</h3>
      <p>{t(bodyKey, 'welcome')}</p>
      {buttonConfig && <CaretButton {...buttonConfig} />}
    </div>
  )
}
```

### 3. State Management Pattern
**Rule**: Follow Cline's state management patterns.

```typescript
// ✅ Cline-compatible state management
const CaretWelcome = () => {
  const { apiConfiguration, caretBanner } = useExtensionState()
  const [showApiOptions, setShowApiOptions] = useState(false)
  const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>()

  // Validation following Cline pattern
  useEffect(() => {
    setApiErrorMessage(validateApiConfiguration(apiConfiguration))
  }, [apiConfiguration])

  if (showApiOptions) {
    return <CaretApiSetup onBack={() => setShowApiOptions(false)} />
  }

  return <CaretWelcomeContent onShowApiOptions={() => setShowApiOptions(true)} />
}
```

### 4. Styling Consistency
**Rule**: Use VSCode theme variables for consistent styling.

```typescript
// ✅ VSCode theme variables
const sectionStyle = {
  marginBottom: "25px",
  padding: "20px",
  border: "1px solid var(--vscode-settings-headerBorder)",
  borderRadius: "8px",
  backgroundColor: "var(--vscode-sideBar-background)",
}

// Define theme constants
const CARET_THEME = {
  section: {
    border: "var(--vscode-settings-headerBorder)",
    background: "var(--vscode-sideBar-background)",
    text: "var(--vscode-editor-foreground)",
    description: "var(--vscode-descriptionForeground)",
  },
}
```

### 5. i18n Integration
**Rule**: All text must be managed through i18n system.

```typescript
// ✅ Always use translation function
import { t } from '@/caret/utils/i18n'

const MyComponent = () => {
  return (
    <div>
      <h3>{t('header.title', 'common')}</h3>
      <p>{t('description.text', 'common', { name: userName })}</p>
    </div>
  )
}

// ❌ Never hardcode text
const MyComponent = () => {
  return <h3>Hardcoded Title</h3> // Wrong!
}
```

### 6. Single-Responsibility Components
**Rule**: Each component should have one clear responsibility.

**Avatar Component Example**:
```typescript
// ✅ Single-responsibility avatar component
interface PersonaAvatarProps {
  persona: string  // "alpha" | "beta" | "gamma" | "delta"
  size?: number
  className?: string
}

const PersonaAvatar: React.FC<PersonaAvatarProps> = ({
  persona, size = 24, className
}) => {
  const avatarPath = `/assets/template_characters/${persona}.png`
  return <img src={avatarPath} width={size} height={size} className={className} />
}
```

## Implementation Checklist

Before committing new components, verify:
- [ ] Preserves Cline's structure patterns
- [ ] Components are properly separated
- [ ] Uses `useExtensionState()` for state management
- [ ] All styles use VSCode theme variables
- [ ] All text uses `t()` translation function
- [ ] Each component has single responsibility
- [ ] TypeScript interfaces properly defined
- [ ] Tests written following TDD principles

## Related Documents
- `.caretrules/frontend-backend-patterns.md`: Frontend-backend communication
- `.caretrules/webview-communication.md`: Webview message flow
- `careti-docs/development/component-architecture-principles.md`: Full guide (Korean)
