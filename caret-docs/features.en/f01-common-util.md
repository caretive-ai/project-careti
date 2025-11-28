# f01 - Common Utilities

## 📋 Overview

Shared backend/frontend utility library for Caret. Provides build scripts, URL helpers, logging helpers, and the global mode manager.

## ✅ Completed Components

### 1. Build & Dev Scripts

**Location**: `scripts/`, `caret-scripts/`

Ported, battle-tested scripts from caret-main to speed up development.

```json
{
  "scripts": {
    "setup": "node caret-scripts/setup-dev-env.js",
    "compile:fast": "node esbuild.mjs",
    "test:all": "node caret-scripts/test-report.js",
    "package:release": "node caret-scripts/build/package-release.js",
    "caret:coverage": "node caret-scripts/caret-coverage-check.js",
    "caretrules:sync": "node caret-scripts/sync-caretrules.js",
    "models:generate": "node caret-scripts/generate-support-model-list.js"
  }
}
```

**Key scripts (6+)**
- `setup-dev-env.js`: Cross-platform dev environment setup  
- `test-report.js`: Unified test report generator  
- `package-release.js`: VSIX release packaging automation  
- `caret-coverage-check.js`: Caret vs Cline coverage diff  
- `sync-caretrules.js`: Sync `.caretrules` (.cursorrules, .clinerules, etc.)  
- `generate-support-model-list.js`: Auto-generate supported model docs  
- Includes colored logging/error helpers

### 2. URL Constant Manager

**Location**: `webview-ui/src/caret/utils/urls.ts`

- Language-aware URL constants and helpers  
- Type-safe grouping by locale with fallbacks

```typescript
// Locale-agnostic URLs
export const CARET_URLS = {
	CARET_SERVICE: "https://caret.team",
	CARET_GITHUB: "https://github.com/aicoding-caret/caret",
	CARET_APP_CREDITS: "https://app.caret.team/credits",
	// ...
} as const

// Localized URLs
export const CARET_LOCALIZED_URLS = {
	EDUCATION_PROGRAM: {
		ko: "https://github.com/aicoding-caret/multi-post-agent/...",
		en: "https://github.com/aicoding-caret/multi-post-agent/...",
		ja: "https://github.com/aicoding-caret/multi-post-agent/...",
		zh: "https://github.com/aicoding-caret/multi-post-agent/...",
	},
	// ...
} as const
```

### 3. Webview Logging System

**Location**: `webview-ui/src/caret/utils/CaretWebviewLogger.ts`

- Safe logging channel from webview to Extension Host  
- Dev/prod aware with built-in guards  
- Class name/file name match (CaretWebviewLogger)  
- Used by logging feature (f02)

```typescript
export enum LogLevel {
	DEBUG = "debug",
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
}

class CaretWebviewLogger {
	constructor(component: string)
	debug(message: string, data?: any): void
	info(message: string, data?: any): void
	warn(message: string, data?: any): void
	error(message: string, data?: any): void
}
```

### 4. CaretGlobalManager Singleton

**Location**: `caret-src/managers/CaretGlobalManager.ts`

- Central manager for global brand/mode system  
- Keeps ExtensionState and CaretGlobalManager in sync  
- Singleton for global access  
- Consolidates brand settings and i18n toggles

```typescript
export class CaretGlobalManager {
	private static _instance: CaretGlobalManager | null = null
	private _currentMode: CaretModeSystem = "caret"

	public static get(): CaretGlobalManager

	// Mode system
	public getCurrentMode(): CaretModeSystem
	public setCurrentMode(mode: CaretModeSystem): void

	// Brand info
	public getCurrentBrandName(): string
	public isI18nEnabled(): boolean
	public isBrandingEnabled(): boolean
	public getModeDefaultLanguage(): "ko" | "en"

	// Static shortcuts
	public static get currentMode(): CaretModeSystem
	public static get brandName(): string
	public static get isI18nEnabled(): boolean
}
```

#### ExtensionStateContext Integration

**Location**: `webview-ui/src/context/ExtensionStateContext.tsx`

Keeps `modeSystem` in ExtensionState and CaretGlobalManager fully synchronized:

```typescript
// CARET MODIFICATION: integrate CaretGlobalManager
import { CaretGlobalManager } from "../../../caret-src/managers/CaretGlobalManager"

setModeSystem: (modeSystem: CaretModeSystem) => {
    const previousMode = state.modeSystem
    const timestamp = new Date().toISOString()

    // 1) Combined logging (frontend/backend)
    console.log("[GLOBAL-BACKEND] modeSystem state:", { before: previousMode, after: modeSystem, timestamp })
    console.debug("[GLOBAL-FRONTEND] modeSystem state:", { before: previousMode, after: modeSystem, timestamp })

    // 2) Update singleton (core)
    try {
        CaretGlobalManager.get().setCurrentMode(modeSystem)
        console.log(`[GLOBAL-MANAGER] CaretGlobalManager.setCurrentMode called with: ${modeSystem}`)
    } catch (error) {
        console.error("[GLOBAL-MANAGER] Failed to update CaretGlobalManager:", error)
    }

    // 3) Update ExtensionState
    setState((prevState) => ({ ...prevState, modeSystem }))

    // 4) Notify backend API
    try {
        StateServiceClient.updateSettings({ modeSystem: modeSystem })
        console.log(`[API] StateServiceClient.updateSettings called with modeSystem: ${modeSystem}`)
    } catch (error) {
        console.error("[API] Failed to update modeSystem via StateServiceClient:", error)
    }
}
```

#### Brand Utility Integration

**Location**: `caret-src/utils/brand-utils.ts`

CaretGlobalManager delegates to brand-utils for dynamic brand data:

```typescript
import {
    getCurrentBrandName,
    getCurrentUserMode,
    isModeI18nEnabled,
    isBrandingEnabled,
    getModeDefaultLanguage
} from "../utils/brand-utils"

public getCurrentBrandName(): string {
    return getCurrentBrandName()  // based on package.json displayName
}

public isI18nEnabled(): boolean {
    return isModeI18nEnabled()    // i18n flag for current mode
}
```

> 📌 **CLI/Go note**: For CLI/host bridge branding labels, call `BrandDisplayName()` from `cli/pkg/common/branding.go` instead of the TS helper. Updating the npm package `displayName` keeps VS Code and CLI in sync.

### CaretGlobalManager Usage

```typescript
import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"

const manager = CaretGlobalManager.get()
const currentMode = manager.getCurrentMode()            // "caret" | "cline"
manager.setCurrentMode("caret")                         // usually driven by ExtensionStateContext

const brandName = manager.getCurrentBrandName()         // "Caret" | "Cline"
const isI18nEnabled = manager.isI18nEnabled()           // true | false
const defaultLang = manager.getModeDefaultLanguage()    // "ko" | "en"

// Static shortcuts
const mode = CaretGlobalManager.currentMode
const brand = CaretGlobalManager.brandName
const i18nSupport = CaretGlobalManager.isI18nEnabled
```

## 🧪 How to Verify

### CaretGlobalManager Integration

Toggle **Settings → Mode System** in VS Code and confirm logs such as:

```bash
# Caret → Cline
[GLOBAL-BACKEND] modeSystem state: { before: "caret", after: "cline", timestamp: "2025-09-05T18:30:00.000Z" }
[BACKEND] modeSystem changed: caret -> cline
[GLOBAL-FRONTEND] modeSystem state: { before: "caret", after: "cline", timestamp: "2025-09-05T18:30:00.000Z" }
[FRONTEND] Global modeSystem updated: cline
[GLOBAL-MANAGER] CaretGlobalManager.setCurrentMode called with: cline
[API] StateServiceClient.updateSettings called with modeSystem: cline

# Cline → Caret
[BACKEND] modeSystem changed: cline -> caret
[GLOBAL-MANAGER] CaretGlobalManager.setCurrentMode called with: caret
```

Seeing these messages confirms ExtensionState and CaretGlobalManager stay in sync.
