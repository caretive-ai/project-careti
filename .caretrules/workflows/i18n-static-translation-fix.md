# i18n Static Translation Issue Resolution Workflow

> **Automated Guide for AI Workers to Resolve Static i18n Translation Issues**

## 🎯 **Objective**
Systematically resolve the issue where translations are fixed at module load time and do not update when the language changes.

## 🔍 **Step 1: Problem Detection**

### Automated Search Commands
```bash
# 1. Search for t() function usage in static constants
grep -r "export const.*=" webview-ui/src/ | grep "t("

# 2. Search for top-level module t() function calls
grep -r "^[[:space:]]*export const.*t(" webview-ui/src/ --include="*.ts" --include="*.tsx"

# 3. Search for translations inside arrays/objects
grep -r -A5 -B5 "t(['\"].*['\"].*['\"].*['\"])" webview-ui/src/ --include="*.ts" --include="*.tsx"
```

### Identifying Problematic Patterns
- ✅ `export const ITEMS = [{ name: t("key", "ns") }]` ← **Problem**
- ✅ `const data = { title: t("title", "common") }` ← **Problem**  
- ❌ `<div>{t("key", "ns")}</div>` ← OK (at render time)

## 🔧 **Step 2: Applying the Solution Pattern**

### A. Convert to a Dynamic Function
```typescript
// Before (Problem)
export const SETTINGS_TABS = [
    {
        id: "general",
        name: t("tabs.general.name", "settings"),  // Fixed to the initial language
        tooltip: t("tabs.general.tooltip", "settings")
    }
]

// After (Solution)
export const getSettingsTabs = () => [
    {
        id: "general", 
        name: t("tabs.general.name", "settings"),  // Translated at call time
        tooltip: t("tabs.general.tooltip", "settings")
    }
]
```

### B. Handle Language Reactivity in the Component
```typescript
// Apply CARET MODIFICATION pattern
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"

function Component() {
    // CARET MODIFICATION: Use i18n context to detect language changes
    const { language } = useCaretI18nContext()
    
    // CARET MODIFICATION: Use dynamic function with language dependency for i18n updates
    const settingsTabs = useMemo(() => getSettingsTabs(), [language])
    
    // Use settingsTabs instead of the old SETTINGS_TABS
}
```

### C. Update All References
```typescript
// Change all references to SETTINGS_TABS within the component to settingsTabs
// e.g., SETTINGS_TABS.map() → settingsTabs.map()
// e.g., SETTINGS_TABS.find() → settingsTabs.find()
```

## ⚡ **Step 3: Automated Verification**

### Type Check
```bash
npm run check-types
```

### Build Test
```bash
npm run build:webview
```

### Manual Verification
1. Run the VS Code extension (`npm run watch`)
2. Change the language in the settings.
3. Confirm that the translation is applied immediately in the component.

## 📋 **Checklist**

### Required Modifications
- [ ] Convert static constant to a dynamic function
- [ ] Add `useCaretI18nContext` import
- [ ] Handle language dependency with `useMemo`
- [ ] Update all references to the dynamic variable
- [ ] Add `CARET MODIFICATION` comments

### Test Items
- [ ] TypeScript compilation succeeds
- [ ] Webview build succeeds
- [ ] Immediate translation update on language change is confirmed

## 🎯 **Known Problem Patterns**

### 1. AutoApproveBar Pattern
**File**: `webview-ui/src/components/chat/auto-approve-menu/constants.ts`
**Problem**: `ACTION_METADATA`, `NOTIFICATIONS_SETTING` constants
**Solution**: Convert to `getActionMetadata()`, `getNotificationsSetting()` functions

### 2. SettingsView Pattern  
**File**: `webview-ui/src/components/settings/SettingsView.tsx`
**Problem**: `SETTINGS_TABS` constant
**Solution**: Convert to `getSettingsTabs()` function

### 3. ChatTextArea Pattern (Future)
**File**: `webview-ui/src/components/chat/ChatTextArea.tsx`
**Problem**: Plan/Act mode labels, placeholder text
**Solution**: Needs application of the same pattern

## 🚀 **Completion Criteria**
1. ✅ Static translation issues are fully resolved
2. ✅ UI updates immediately on language change  
3. ✅ No TypeScript compilation errors
4. ✅ Existing functionality is fully preserved
5. ✅ `CARET MODIFICATION` comments are complete

---
**Workflow Version**: v1.1 (2025-09-06)
**Related Documents**: f02-multilingual-i18n.mdx, merging-strategy-guide.md
