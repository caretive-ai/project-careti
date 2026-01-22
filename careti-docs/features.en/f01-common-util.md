# f01 - Common Utilities

## 📋 Overview

Shared backend/frontend utility library for Careti. Provides build scripts, URL helpers, logging helpers, and the global mode manager.

## ✅ Completed Components

### 1. Build & Dev Scripts

**Location**: `scripts/`, `careti-scripts/`

Ported, battle-tested scripts from careti-main to speed up development.

```json
{
  "scripts": {
    "setup": "node careti-scripts/setup-dev-env.js",
    "compile:fast": "node esbuild.mjs",
    "test:all": "node careti-scripts/test-report.js",
    "package:release": "node careti-scripts/build/package-release.js",
    "careti:coverage": "node careti-scripts/careti-coverage-check.js",
    "models:generate": "node careti-scripts/generate-support-model-list.js"
  }
}
```

**Key scripts**
- `setup-dev-env.js`: Cross-platform dev environment setup  
- `test-report.js`: Unified test report generator  
- `package-release.js`: VSIX release packaging automation  
- `careti-coverage-check.js`: Careti vs Cline coverage diff  
- `generate-support-model-list.js`: Auto-generate supported model docs  
- Includes colored logging/error helpers

### 2. URL Constant Manager

**Location**: `webview-ui/src/careti/utils/urls.ts`

- Language-aware URL constants and helpers  
- Type-safe grouping by locale with fallbacks

```typescript
// Locale-agnostic URLs
export const CARET_URLS = {
	CARET_SERVICE: "https://careti.ai",
	CARET_GITHUB: "https://github.com/aicoding-careti/careti",
	CARET_APP_CREDITS: "https://careti.ai/billing",
	// ...
} as const

// Localized URLs
export const CARET_LOCALIZED_URLS = {
	EDUCATION_PROGRAM: {
		ko: "https://github.com/aicoding-careti/multi-post-agent/...",
		en: "https://github.com/aicoding-careti/multi-post-agent/...",
		ja: "https://github.com/aicoding-careti/multi-post-agent/...",
		zh: "https://github.com/aicoding-careti/multi-post-agent/...",
	},
	// ...
} as const
```

### 3. Webview Logging System

**Location**: `webview-ui/src/careti/utils/CaretWebviewLogger.ts`

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

### 4. CaretiGlobalManager Singleton

**Location**: `careti-src/managers/CaretiGlobalManager.ts`

- Central manager for global brand/mode system  
- Keeps ExtensionState and CaretiGlobalManager in sync  
- Singleton for global access  
- Consolidates brand settings and i18n toggles

```typescript
export class CaretiGlobalManager {
	private static _instance: CaretiGlobalManager | null = null
	private _currentMode: CaretModeSystem = "careti"

	public static get(): CaretiGlobalManager

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

Keeps `modeSystem` in ExtensionState and CaretiGlobalManager fully synchronized:

```typescript
// CARETI MODIFICATION: integrate CaretiGlobalManager
import { CaretiGlobalManager } from "../../../careti-src/managers/CaretiGlobalManager"

setModeSystem: (modeSystem: CaretModeSystem) => {
    const previousMode = state.modeSystem
    const timestamp = new Date().toISOString()

    // 1) Combined logging (frontend/backend)
    console.log("[GLOBAL-BACKEND] modeSystem state:", { before: previousMode, after: modeSystem, timestamp })
    console.debug("[GLOBAL-FRONTEND] modeSystem state:", { before: previousMode, after: modeSystem, timestamp })

    // 2) Update singleton (core)
    try {
        CaretiGlobalManager.get().setCurrentMode(modeSystem)
        console.log(`[GLOBAL-MANAGER] CaretiGlobalManager.setCurrentMode called with: ${modeSystem}`)
    } catch (error) {
        console.error("[GLOBAL-MANAGER] Failed to update CaretiGlobalManager:", error)
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

**Location**: `careti-src/utils/brand-utils.ts`

CaretiGlobalManager delegates to brand-utils for dynamic brand data:

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

### CaretiGlobalManager Usage

```typescript
import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"

const manager = CaretiGlobalManager.get()
const currentMode = manager.getCurrentMode()            // "careti" | "cline"
manager.setCurrentMode("careti")                         // usually driven by ExtensionStateContext

const brandName = manager.getCurrentBrandName()         // "Careti" | "Cline"
const isI18nEnabled = manager.isI18nEnabled()           // true | false
const defaultLang = manager.getModeDefaultLanguage()    // "ko" | "en"

// Static shortcuts
const mode = CaretiGlobalManager.currentMode
const brand = CaretiGlobalManager.brandName
const i18nSupport = CaretiGlobalManager.isI18nEnabled
```

## 🧪 How to Verify

### CaretiGlobalManager Integration

Toggle **Settings → Mode System** in VS Code and confirm logs such as:

```bash
# Careti → Cline
[GLOBAL-BACKEND] modeSystem state: { before: "careti", after: "cline", timestamp: "2025-09-05T18:30:00.000Z" }
[BACKEND] modeSystem changed: careti -> cline
[GLOBAL-FRONTEND] modeSystem state: { before: "careti", after: "cline", timestamp: "2025-09-05T18:30:00.000Z" }
[FRONTEND] Global modeSystem updated: cline
[GLOBAL-MANAGER] CaretiGlobalManager.setCurrentMode called with: cline
[API] StateServiceClient.updateSettings called with modeSystem: cline

# Cline → Careti
[BACKEND] modeSystem changed: cline -> careti
[GLOBAL-MANAGER] CaretiGlobalManager.setCurrentMode called with: careti
```

Seeing these messages confirms ExtensionState and CaretiGlobalManager stay in sync.
