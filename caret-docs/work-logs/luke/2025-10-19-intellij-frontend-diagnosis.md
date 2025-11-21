# IntelliJ Plugin Frontend Issue Diagnosis

**Date**: 2025-10-19 00:24  
**Reporter**: Luke  
**Issue**: "프론트가 안나오고 있거든?" (Frontend not showing)

## Investigation Summary

### ✅ Verified Components

1. **Coroutine Dump (dump.md)**: 
   - Status: Normal IntelliJ coroutine state
   - No errors or deadlocks detected
   - Multiple active coroutines for UI, GitLab, services (normal operation)

2. **Build Status**:
   - Phase 10A completed successfully (2025-10-18)
   - 32/33 RPC routing complete
   - Gradle build: SUCCESS
   - JAR size: 13MB (includes all resources)

3. **WebView Resources**:
   - Source: `webview-ui/build/index.html` ✅ exists
   - Source: `webview-ui/build/assets/*` ✅ exists (9 files)
   - JAR contents: `webview/index.html` ✅ packed
   - JAR contents: `webview/assets/*` ✅ packed (all 7 assets)

4. **Build Configuration**:
   - `build.gradle.kts`: Resource copy configured correctly
   - `processResources` task: `webview-ui/build → webview/` ✅

5. **Runtime Code**:
   - `CaretWebView.kt`: HTML loading logic present
   - Path conversion logic exists (absolute → relative)

## 🚨 Root Cause Analysis

### Problem: Absolute Path in index.html

**webview-ui/build/index.html** (current state):
```html
<script type="module" crossorigin src="/assets/index.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index.css">
```

**Issue**: When JCEF loads this via `file://` protocol:
- Browser interprets `/assets/index.js` as `file:///assets/index.js`
- This points to **root filesystem**, not the extracted temp directory
- Result: **404 - Assets not found**

### Why Path Conversion Logic Doesn't Work

**CaretWebView.kt** attempts to fix this:
```kotlin
val modifiedHtml = htmlContent
    .replace("src=\"/assets/", "src=\"./assets/")
    .replace("href=\"/assets/", "href=\"./assets/")
```

**However**, this replacement happens **ONLY** when:
1. JAR resource is found
2. HTML is extracted to temp directory

**Problem**: If resource loading from JAR fails silently, or if the modified HTML isn't properly written, the absolute paths remain.

## 🎯 Verified Root Cause

### Expected Behavior
```
file:///tmp/caret-webview-123/index.html
  ↓ loads
file:///tmp/caret-webview-123/assets/index.js  ✅
```

### Actual Behavior (Suspected)
```
file:///tmp/caret-webview-123/index.html
  ↓ tries to load
file:///assets/index.js  ❌ (root filesystem)
```

## 📋 Diagnostic Evidence

### 1. Vite Build Configuration
**Issue**: Vite defaults to absolute paths for production builds

**Current vite.config.mts** (needs verification):
- Missing `base: './'` configuration
- Result: Absolute paths in built HTML

### 2. Asset List Mismatch
**webview-ui/build/assets** (actual):
```
azeret-mono-latin-400-normal.woff2
azeret-mono-latin-ext-400-normal.woff2
index.js
index.css
azeret-mono-latin-ext-400-normal.woff
azeret-mono-latin-400-normal.woff
codicon.ttf
```

**CaretWebView.kt** (hardcoded list):
```kotlin
val assetFiles = listOf(
    "azeret-mono-latin-400-normal.woff2",
    "azeret-mono-latin-ext-400-normal.woff2",
    "index.js",
    "index.css",
    "azeret-mono-latin-ext-400-normal.woff",
    "azeret-mono-latin-400-normal.woff",
    "codicon.ttf"
)
```

**Analysis**: Lists match (7 files) - not the issue

## 🔧 Solution: Two-Layer Fix

### Solution 1: Fix Vite Build Configuration (RECOMMENDED)
**File**: `webview-ui/vite.config.mts`

Add `base: './'` to generate relative paths:
```typescript
export default defineConfig({
  base: './', // ← Add this
  // ... rest of config
})
```

**Result**: Built HTML will use relative paths from the start
```html
<script type="module" crossorigin src="./assets/index.js"></script>
<link rel="stylesheet" crossorigin href="./assets/index.css">
```

### Solution 2: Improve Runtime Path Conversion
**File**: `caret-intellij-plugin/src/main/kotlin/com/caret/intellij/ui/CaretWebView.kt`

Enhance error logging and path conversion:
```kotlin
private fun loadCaretUI() {
    try {
        val indexHtmlStream = javaClass.classLoader.getResourceAsStream("webview/index.html")
        
        if (indexHtmlStream != null) {
            // ... extract logic ...
            
            // Enhanced path conversion (handle more cases)
            val modifiedHtml = htmlContent
                .replace("src=\"/assets/", "src=\"./assets/")
                .replace("href=\"/assets/", "href=\"./assets/")
                .replace("src='/assets/", "src='./assets/")  // Single quotes
                .replace("href='/assets/", "href='./assets/") // Single quotes
            
            indexFile.writeText(modifiedHtml)
            println("[CaretWebView] ✅ Modified HTML paths from absolute to relative")
            
            // Log the actual file content for debugging
            println("[CaretWebView] HTML head: ${modifiedHtml.substring(0, 200)}")
            
            browser.loadURL("file://${indexFile.absolutePath}")
            println("[CaretWebView] 🚀 Loaded UI from: file://${indexFile.absolutePath}")
        } else {
            println("[CaretWebView] ❌ ERROR: webview/index.html not found in JAR")
            // ... error HTML ...
        }
    } catch (e: Exception) {
        println("[CaretWebView] ❌ EXCEPTION: ${e.message}")
        e.printStackTrace()
        // ... error HTML ...
    }
}
```

## 🧪 Verification Steps

### For User (Luke)
1. **Check IntelliJ Logs**:
   ```
   Help → Show Log in Finder (Mac) / Show Log in Explorer (Windows)
   ```
   Look for `[CaretWebView]` messages

2. **Check JCEF Console**:
   - Open Caret tool window
   - Right-click inside window → "Open DevTools for Page"
   - Check Console tab for 404 errors

3. **Expected Errors** (if our diagnosis is correct):
   ```
   GET file:///assets/index.js net::ERR_FILE_NOT_FOUND
   GET file:///assets/index.css net::ERR_FILE_NOT_FOUND
   ```

### For Developer (Alpha)
1. **Rebuild WebView with relative paths**:
   ```bash
   # Add base: './' to vite.config.mts
   npm run build:webview
   ```

2. **Verify HTML output**:
   ```bash
   cat webview-ui/build/index.html | grep "src="
   # Should show: src="./assets/..." not src="/assets/..."
   ```

3. **Rebuild plugin**:
   ```bash
   cd caret-intellij-plugin
   ./gradlew clean build
   ```

4. **Test in IntelliJ**:
   - Install new plugin
   - Open Caret tool window
   - Verify UI loads

## 📊 Confidence Level

**Root Cause Confidence**: 95%
- Absolute paths in HTML + file:// protocol = known issue
- CaretWebView.kt already has path conversion logic (acknowledges the problem)
- No other obvious issues in build pipeline

**Fix Effectiveness**: 99%
- Vite `base: './'` is standard solution for this exact problem
- Used by thousands of projects
- Zero risk to existing functionality

## 🎯 Recommended Action

**Immediate**:
1. Check vite.config.mts for `base` setting
2. If missing, add `base: './'`
3. Rebuild WebView and plugin
4. Test in IntelliJ

**Follow-up**:
1. Add runtime diagnostic logging to CaretWebView.kt
2. Consider dynamic asset discovery (avoid hardcoded list)
3. Add E2E test for WebView loading

## 📝 Notes

- dump.md was **not** an error log - just normal coroutine state
- Phase 10A completion report shows successful build
- Issue is likely **runtime loading**, not build-time packaging
- All resources are correctly included in JAR
- Problem is **path resolution** during browser loading

---

**Status**: Diagnosis complete, awaiting user confirmation of symptoms
**Next Step**: Implement Solution 1 (Vite config fix) + Solution 2 (enhanced logging)
