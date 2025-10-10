# i18n Dynamic Translation Pattern (Atom)

> **AI Reusable Code Pattern Block**

## 🧩 **Pattern Summary**
The standard pattern for converting static, module-load-time translations into dynamic, reactive translations using a dynamic function + useMemo.

## 📝 **Code Template**

### A. Dynamic Function Conversion
```typescript
// Before: Static Constant (Problem)
export const STATIC_DATA = [
    { name: t("key1", "namespace") },
    { name: t("key2", "namespace") }
]

// After: Dynamic Function (Solution)
export const getDynamicData = () => [
    { name: t("key1", "namespace") },
    { name: t("key2", "namespace") }
]
```

### B. Usage Pattern within a Component
```typescript
// Required imports
import { useMemo } from "react"
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
import { getDynamicData } from "./constants"

function Component() {
    // CARET MODIFICATION: Use i18n context to detect language changes
    const { language } = useCaretI18nContext()
    
    // CARET MODIFICATION: Use dynamic function with language dependency for i18n updates
    const dynamicData = useMemo(() => getDynamicData(), [language])
    
    // Use dynamicData instead of the old STATIC_DATA
    return <div>{dynamicData.map(...)}</div>
}
```

## 🔧 **Application Steps**

### 1. Constant → Function Conversion
```typescript
// Create function name by adding 'get' prefix to the constant name
SETTINGS_TABS → getSettingsTabs()
ACTION_METADATA → getActionMetadata()
MENU_ITEMS → getMenuItems()
```

### 2. Add Imports
```typescript
// CARET MODIFICATION: Added useMemo for i18n reactivity
import { useMemo } from "react"
// CARET MODIFICATION: Import i18n context for language reactivity  
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
```

### 3. Create Variables within the Component
```typescript
const { language } = useCaretI18nContext()
const dynamicData = useMemo(() => getDynamicData(), [language])
```

### 4. Change All References
```typescript
// Before: STATIC_DATA.map(...)
// After: dynamicData.map(...)
```

## ⚠️ **Important Notes**

### Required Dependencies
- `useCaretI18nContext`: To detect language changes
- `useMemo`: For performance optimization and handling the language dependency
- `[language]`: Must be included in the dependency array

### CARET MODIFICATION Comments
```typescript
// CARET MODIFICATION: Convert static constant to dynamic function for i18n support
export const getDynamicData = () => [...]

// CARET MODIFICATION: Use i18n context to detect language changes  
const { language } = useCaretI18nContext()

// CARET MODIFICATION: Use dynamic function with language dependency for i18n updates
const dynamicData = useMemo(() => getDynamicData(), [language])
```

## 🎯 **Verification Method**

### Automated Verification
```bash
# Type Check
npm run check-types

# Build Test  
npm run build:webview
```

### Manual Verification
1. Change the language to a different one in the settings.
2. Confirm that the translation is applied immediately in the component.
3. Change back to another language to re-confirm.

## 📋 **Checklist**
- [ ] Convert static constant to a function
- [ ] Use `useCaretI18nContext`
- [ ] Handle language dependency with `useMemo`  
- [ ] Update all references to the dynamic variable
- [ ] Add `CARET MODIFICATION` comments
- [ ] Verify compilation and functionality

---
**Pattern Version**: v1.0
**Usage Examples**: AutoApproveBar, SettingsView
