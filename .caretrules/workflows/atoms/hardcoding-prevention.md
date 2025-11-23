# Hardcoding Prevention Rules (Atom)

> **AI Reusable Code Pattern Block**

## 🧩 **Pattern Summary**
Standard rules and patterns for preventing hardcoded values and ensuring maintainable, configurable code.

## 📝 **Hardcoding Categories to Avoid**

### A. File Names and Paths
```typescript
// ❌ Wrong - Hardcoded filenames
const personaMdPath = path.join(rulesDir, "persona.md")
const profilePath = path.join(personaDir, "agent_profile.png")
const configDir = path.join(baseDir, "configs")

// ✅ Correct - Use constants
import { GlobalFileNames } from "@/core/storage/disk"
const personaMdPath = path.join(rulesDir, GlobalFileNames.persona)
const profilePath = path.join(personaDir, PERSONA_CONSTANTS.PROFILE_IMAGE)
const configDir = path.join(baseDir, FILE_CONSTANTS.CONFIG_DIR)
```

### B. Magic Numbers and Strings
```typescript
// ❌ Wrong - Magic values
if (retryCount > 3) { ... }
await delay(5000)
const maxFileSize = 1048576 // 1MB

// ✅ Correct - Named constants
const MAX_RETRY_COUNT = 3
const DEFAULT_DELAY_MS = 5000
const MAX_FILE_SIZE_BYTES = 1024 * 1024 // 1MB

if (retryCount > MAX_RETRY_COUNT) { ... }
await delay(DEFAULT_DELAY_MS)
```

### C. UI Text and Messages
```typescript
// ❌ Wrong - Hardcoded UI text
const message = "Profile saved successfully"
const errorMsg = "Failed to load data"

// ✅ Correct - Use i18n system
const message = t('profile.saveSuccess', 'common')
const errorMsg = t('errors.loadFailed', 'common')
```

### D. Configuration Values
```typescript
// ❌ Wrong - Hardcoded config
const apiTimeout = 30000
const defaultLanguage = "en"
const maxConcurrency = 5

// ✅ Correct - Configuration object
const CONFIG = {
    API_TIMEOUT_MS: 30000,
    DEFAULT_LANGUAGE: "en" as const,
    MAX_CONCURRENCY: 5,
} as const
```

## 🔧 **Implementation Patterns**

### 1. Constants File Structure
```typescript
// constants/file-names.ts
export const FILE_CONSTANTS = {
    PERSONA_IMAGES_DIR: "personas",
    PROFILE_IMAGE: "agent_profile.png",
    THINKING_IMAGE: "agent_thinking.png",
    CONFIG_DIR: "configs",
} as const

// constants/limits.ts
export const LIMITS = {
    MAX_RETRY_COUNT: 3,
    DEFAULT_TIMEOUT_MS: 5000,
    MAX_FILE_SIZE_MB: 10,
} as const
```

### 2. Enum Usage for Related Constants
```typescript
// For related string constants
export enum PersonaImageType {
    PROFILE = "agent_profile.png",
    THINKING = "agent_thinking.png",
}

// For numeric constants
export enum RetryLimits {
    MAX_ATTEMPTS = 3,
    BACKOFF_MS = 1000,
    MAX_BACKOFF_MS = 10000,
}
```

### 3. Configuration Objects
```typescript
// config/persona.ts
export const PERSONA_CONFIG = {
    FILES: {
        PROFILE_MD: "persona.md",
        IMAGES_DIR: "personas",
        PROFILE_IMAGE: "agent_profile.png",
        THINKING_IMAGE: "agent_thinking.png",
    },
    LIMITS: {
        MAX_DESCRIPTION_LENGTH: 500,
        MAX_INSTRUCTION_LENGTH: 5000,
    },
    DEFAULTS: {
        NAME: "Default",
        DESCRIPTION: "Default Persona",
    },
} as const
```

## ⚠️ **Common Violation Patterns**

### 1. File Operations
```typescript
// ❌ Common mistake
await fs.writeFile("output.json", data)
const configPath = path.join(dir, "config.yml")

// ✅ Prevention
const OUTPUT_FILE = "output.json"
await fs.writeFile(OUTPUT_FILE, data)
const configPath = path.join(dir, CONFIG_FILES.MAIN)
```

### 2. Error Messages
```typescript
// ❌ Common mistake
throw new Error("Invalid input provided")
Logger.error("Connection failed")

// ✅ Prevention
const ERROR_MESSAGES = {
    INVALID_INPUT: "Invalid input provided",
    CONNECTION_FAILED: "Connection failed",
} as const

throw new Error(ERROR_MESSAGES.INVALID_INPUT)
Logger.error(ERROR_MESSAGES.CONNECTION_FAILED)
```

### 3. Timeouts and Intervals
```typescript
// ❌ Common mistake
setTimeout(callback, 1000)
setInterval(poll, 5000)

// ✅ Prevention
const INTERVALS = {
    CALLBACK_DELAY_MS: 1000,
    POLL_INTERVAL_MS: 5000,
} as const

setTimeout(callback, INTERVALS.CALLBACK_DELAY_MS)
setInterval(poll, INTERVALS.POLL_INTERVAL_MS)
```

## 🔍 **Detection and Prevention**

### Code Review Checklist
- [ ] No hardcoded file names or paths
- [ ] No magic numbers without explanation
- [ ] No hardcoded UI text (use i18n)
- [ ] No hardcoded URLs or endpoints
- [ ] No hardcoded timeouts or limits
- [ ] All repeated values extracted to constants

### Automated Detection (TODO)
```bash
# Grep patterns to catch common hardcoding
rg '"[a-zA-Z_]+\.(md|json|png|jpg|txt)"' --type ts
rg 'setTimeout\([^,]+,\s*\d+' --type ts
rg 'setInterval\([^,]+,\s*\d+' --type ts
```

## 📋 **Implementation Checklist**
- [ ] Create constants file for related values
- [ ] Use `as const` for immutable objects
- [ ] Group related constants logically
- [ ] Add descriptive comments for non-obvious values
- [ ] Use TypeScript enums for related string/number constants
- [ ] Reference existing constant systems (GlobalFileNames, etc.)
- [ ] Update imports to use constants

## 🎯 **Benefits**
- **Maintainability**: Single source of truth for values
- **Refactoring**: Easy to change values across codebase
- **Type Safety**: TypeScript can catch invalid references
- **Documentation**: Named constants are self-documenting
- **Testing**: Easier to mock and test with known constants

---
**Pattern Version**: v1.0
**Usage Examples**: persona-storage.ts constant extraction