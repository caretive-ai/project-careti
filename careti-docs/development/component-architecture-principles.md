# Careti Component Architecture Principles

## 📋 **Overview**

This document defines the architectural principles to be followed when developing UI components in the Careti project. These principles have been established to effectively implement Careti's unique features while maintaining compatibility with the original Cline source code.

## 🎯 **Core Principles**

### **1. Structure Preservation**

**Principle**: Maintain the structure and patterns of the original Cline components as much as possible.

```typescript
// ❌ Incorrect Example: Hardcoded structure
const CaretWelcome = () => {
  return (
    <div style={{ padding: "20px", border: "1px solid red" }}>
      <h2>Hardcoded Title</h2>
      <p>Hardcoded content</p>
    </div>
  )
}

// ✅ Correct Example: Preserving original structure
const CaretWelcome = () => {
  const renderSection = (headerKey: string, bodyKey: string, buttonConfig?: ButtonConfig) => (
    <div style={{
      marginBottom: "25px",
      padding: "20px",
      border: "1px solid var(--vscode-settings-headerBorder)",
      borderRadius: "8px"
    }}>
      <h3>{t(headerKey, 'welcome')}</h3>
      <p>{t(bodyKey, 'welcome')}</p>
      {buttonConfig && renderButton(buttonConfig)}
    </div>
  )

  return (
    <div className="careti-welcome">
      {renderSection('coreFeatures.header', 'coreFeatures.description')}
      {renderSection('apiSetup.header', 'apiSetup.description', {
        text: 'apiSetup.button',
        handler: handleApiSetup
      })}
    </div>
  )
}
```

### **2. Component Separation**

**Principle**: Create clearly separated components for each function.

```typescript
// ✅ Component Separation Example
// components/careti/CaretWelcomeSection.tsx
interface CaretWelcomeSectionProps {
  headerKey: string
  bodyKey: string
  buttonConfig?: ButtonConfig
  className?: string
}

const CaretWelcomeSection: React.FC<CaretWelcomeSectionProps> = ({
  headerKey, bodyKey, buttonConfig, className
}) => {
  return (
    <div className={`careti-welcome-section ${className || ''}`}>
      <h3>{t(headerKey, 'welcome')}</h3>
      <p>{t(bodyKey, 'welcome')}</p>
      {/* {buttonConfig && <CaretButton {...buttonConfig} />} */}
    </div>
  )
}

// components/careti/CaretApiSetup.tsx
const CaretApiSetup: React.FC<CaretApiSetupProps> = ({ onConfigSave }) => {
  return (
    <div className="careti-api-setup">
      <CaretWelcomeSection
        headerKey="apiSetup.title"
        bodyKey="apiSetup.description"
      />
      <ApiOptions showModelOptions={true} />
      {/* <CaretButton onClick={onConfigSave} appearance="primary">
        {t('apiSetup.saveButton', 'welcome')}
      </CaretButton> */}
    </div>
  )
}
```

### **3. State Management Pattern**

**Principle**: Follow the state management patterns of the original Cline.

```typescript
// ✅ Correct State Management
const CaretWelcome = () => {
  const { apiConfiguration, caretBanner } = useExtensionState()
  const [showApiOptions, setShowApiOptions] = useState(false)
  const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)

  // Validation logic identical to Cline's pattern
  useEffect(() => {
    setApiErrorMessage(validateApiConfiguration(apiConfiguration))
  }, [apiConfiguration])

  // State-based conditional rendering
  if (showApiOptions) {
    return <CaretApiSetup onBack={() => setShowApiOptions(false)} />
  }

  return <CaretWelcomeContent onShowApiOptions={() => setShowApiOptions(true)} />
}
```

### **4. Styling Consistency**

**Principle**: Use VSCode theme variables and maintain consistent styling patterns.

```typescript
// ✅ Correct Styling
const sectionStyle = {
	marginBottom: "25px",
	padding: "20px",
	border: "1px solid var(--vscode-settings-headerBorder)",
	borderRadius: "8px",
	backgroundColor: "var(--vscode-sideBar-background)",
}

// Utilizing CSS variables
const CARET_THEME = {
	section: {
		border: "var(--vscode-settings-headerBorder)",
		background: "var(--vscode-sideBar-background)",
		text: "var(--vscode-editor-foreground)",
		description: "var(--vscode-descriptionForeground)",
	},
}
```

### **5. i18n Integration**

**Principle**: All text must be managed through the i18n system.

### **6. Single-Responsibility Avatar Component**

**Principle**: Encapsulate all logic for displaying persona avatars into a single component named `PersonaAvatar` to maximize reusability and maintainability.

**Description**: The `PersonaAvatar` component is responsible for displaying images for a persona's normal and thinking states. It manages image URIs internally, updating them dynamically from the `ExtensionStateContext` initial values and through `RESPONSE_PERSONA_IMAGES` messages from the backend. It also includes built-in fallback images for loading or error states, ensuring a broken image is never displayed.

**Key Features**:

- **State Branching**: Easily switch between thinking and normal avatars via the `isThinking` boolean prop.
- **Dynamic Updates**: Sends a `REQUEST_PERSONA_IMAGES` message on mount to always request the latest images.
- **Flexible Styling**: Adjust size with the `size` prop and apply additional styling with `className` and `style` props.
- **Robust Error Handling**: Displays a built-in SVG fallback image on load failure to maintain user experience.

```typescript
// ✅ Correct PersonaAvatar Usage Example

// HomeHeader.tsx: Simple avatar display
import PersonaAvatar from "@/careti/components/PersonaAvatar"

const HomeHeader = () => (
  <div className="flex flex-col items-center mb-5">
    <div className="my-5">
      <PersonaAvatar size={64} />
    </div>
    {/* ... */}
  </div>
)

// ChatRow.tsx: Branching between thinking and normal states
const ChatRowContent = ({ message }) => {
  // ...
  if (message.say === "text") {
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <PersonaAvatar isThinking={false} size={64} />
        {/* ... */}
      </div>
    )
  }
  if (message.say === "reasoning") {
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <PersonaAvatar isThinking={true} size={64} />
        {/* ... */}
      </div>
    )
  }
  // ...
}
```

```typescript
// ✅ Correct i18n Usage
const CaretWelcomeHeader = () => {
  return (
    <div className="careti-welcome-header">
      <h2>{t('greeting', 'welcome')}</h2>
      <p>{t('catchPhrase', 'welcome')}</p>
      <img
        src={caretBanner}
        alt={t('bannerAlt', 'welcome')}
        className="careti-banner-image"
      />
    </div>
  )
}
```

## 🔧 **Implementation Guidelines**

### **Component File Structure**

```
webview-ui/src/careti/
├── components/
│   ├── CaretWelcome.tsx         # Main welcome component
│   ├── CaretWelcomeSection.tsx  # Reusable section
│   ├── CaretApiSetup.tsx        # Dedicated API setup component
│   └── CaretFooter.tsx          # Footer component
├── hooks/
│   └── useCaretWelcome.ts       # Hook for welcome-related logic
├── utils/
│   └── welcomeHelpers.ts        # Helper functions
└── styles/
    └── CaretWelcome.css         # Style definitions
```

### **Property Interface Design**

```typescript
interface CaretWelcomeProps {
	onGetStarted?: () => void
	initialView?: "welcome" | "apiSetup"
	theme?: "light" | "dark" | "auto"
}

interface CaretSectionProps {
	headerKey: string
	bodyKey: string
	buttonConfig?: {
		textKey: string
		handler: () => void
		appearance?: "primary" | "secondary"
		disabled?: boolean
	}
	className?: string
	children?: React.ReactNode
}
```

## 🚨 **Anti-patterns**

### **❌ Hardcoded Structure**

```typescript
// Pattern to avoid
const BadComponent = () => (
  <div style={{ padding: "20px", border: "1px solid red" }}>
    <h2>Hardcoded Title</h2>
    <p>Hardcoded Description</p>
    <button onClick={() => alert("Clicked!")}>Button</button>
  </div>
)
```

### **❌ Excessive Inline Styles**

```typescript
// Pattern to avoid
const BadStyling = () => (
  <div style={{
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
    padding: "15px",
    marginBottom: "10px"
  }}>
    Content
  </div>
)
```

### **❌ Text without Translation**

```typescript
// Pattern to avoid
const BadI18n = () => (
  <div>
    <h2>Careti Settings</h2>
    <p>Please enter your API key</p>
  </div>
)
```

## 📋 **Checklist**

When developing a new component, please verify the following:

- [ ] Analysis of the original Cline component structure is complete
- [ ] Design for separation of components by function is complete
- [ ] VSCode theme variables are used
- [ ] All text is implemented with i18n
- [ ] State management patterns are consistent
- [ ] Reusable components are designed
- [ ] TypeScript interfaces are defined
- [ ] Test code is written
- [ ] Documentation is complete

## 🔗 **Related Documents**

- [Careti Architecture Guide](./careti-architecture-and-implementation-guide.md)
- [Testing Guide](./testing-guide.md)
- [i18n Development Guide (EN)](../features.en/f02-multilingual-i18n.md)
