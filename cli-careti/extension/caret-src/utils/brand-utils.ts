// CARETI MODIFICATION: Caret brand utilities - centralized brand detection and configuration
// Provides brand-specific functionality without cluttering Cline's env.ts

import fs from "fs"
import path from "path"
import { CARET_MODE_SYSTEM_CONFIG, type CaretModeSystem } from "../shared/ModeSystem"

// Cached brand name for performance
let _cachedBrandName: string | null = null

/**
 * Detect current brand name from package.json (cached for performance)
 * @returns The current brand name (e.g., "Cline", "Caret", "CodeCenter")
 */
export function detectCurrentBrandName(): string {
	if (_cachedBrandName) {
		return _cachedBrandName!
	}

	const candidates = [
		path.join(__dirname, "..", "..", "package.json"),
		path.join(__dirname, "..", "package.json"),
		path.join(__dirname, "package.json"),
		path.join(process.cwd(), "package.json"),
	]

	try {
		const packageJsonPath = candidates.find((candidate) => fs.existsSync(candidate))
		if (!packageJsonPath) {
			console.warn("Failed to detect brand from package.json: no candidate file found")
			_cachedBrandName = "Caret"
			return _cachedBrandName!
		}

		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
		// CARETI MODIFICATION: default brand fallback uses Caret when displayName is missing
		const displayName = packageJson.displayName || "Caret"

		// displayName을 그대로 브랜드명으로 사용
		_cachedBrandName = displayName

		return _cachedBrandName!
	} catch (error) {
		console.error("Failed to detect brand from package.json:", error)
		_cachedBrandName = "Caret" // CARETI MODIFICATION: safe default brand fallback
		return _cachedBrandName!
	}
}

/**
 * Get current user mode (separate from brand detection)
 * @returns The current user mode setting
 */
export function getCurrentUserMode(): CaretModeSystem {
	// TODO: Get from user settings/preferences
	// For now, return default based on brand
	const brandName = detectCurrentBrandName().toLowerCase()
	return brandName === "cline" ? "cline" : "caret"
}

/**
 * Get current brand display name (for UI, output channels, etc.)
 * @returns Brand display name ("Caret" or "Cline")
 */
export function getCurrentBrandDisplayName(): string {
	return detectCurrentBrandName()
}

/**
 * Get current brand name (alias for getCurrentBrandDisplayName for compatibility)
 * @returns Brand name from package.json displayName
 */
export function getCurrentBrandName(): string {
	return detectCurrentBrandName()
}

/**
 * Check if current mode supports i18n features
 * @returns true if i18n is enabled for current mode
 */
export function isModeI18nEnabled(): boolean {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode].features.i18nEnabled
}

/**
 * Check if current mode supports backend message translation
 * @returns true if backend translation is enabled for current mode
 */
export function isBackendTranslationEnabled(): boolean {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode].features.backendMessageTranslation
}

/**
 * Check if current mode supports branding features
 * @returns true if branding is enabled for current mode
 */
export function isBrandingEnabled(): boolean {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode].features.brandingEnabled
}

/**
 * Get current mode's default language
 * @returns Default language for current mode ("ko" | "en")
 */
export function getModeDefaultLanguage(): "ko" | "en" {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode].features.defaultLanguage
}

/**
 * Get current mode configuration
 * @returns Complete mode configuration object
 */
export function getCurrentModeConfig() {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode]
}

/**
 * Get brand display name for specific mode
 * @param mode - The mode to get display name for
 * @returns Brand display name
 */
export function getBrandDisplayName(mode: CaretModeSystem): string {
	return CARET_MODE_SYSTEM_CONFIG[mode].displayName
}

/**
 * Get brand description for specific mode
 * @param mode - The mode to get description for
 * @returns Brand description
 */
export function getBrandDescription(mode: CaretModeSystem): string {
	return CARET_MODE_SYSTEM_CONFIG[mode].description
}

/**
 * Get standard agents context directory name.
 * @returns Agents context directory name (".agents/context")
 */
export function getBrandRulesFileName(): string {
	return ".agents/context"
}

/**
 * Get standard agents workflows directory name.
 * @returns Workflows directory name (".agents/context/workflows")
 */
export function getBrandWorkflowsDirName(): string {
	return ".agents/context/workflows"
}

/**
 * Get brand MCP settings file name based on current brand
 * @returns MCP settings file name (e.g., "caret_mcp_settings.json", "codecenter_mcp_settings.json")
 */
export function getBrandMcpSettingsFileName(): string {
	const brandName = getCurrentBrandName().toLowerCase()
	return `${brandName}_mcp_settings.json`
}

/**
 * CARETI MODIFICATION: Get brand-specific assets directory name (e.g., ".caretassets").
 */
export function getBrandAssetsDirName(): string {
	const brandName = getCurrentBrandName().toLowerCase()
	return `.${brandName}assets`
}

/**
 * Get standard generated assets directory name (".agents/generated-assets").
 */
export function getBrandGeneratedAssetsDirName(): string {
	return ".agents/generated-assets"
}

/**
 * CARETI MODIFICATION: Get brand-specific ignore filename (e.g., ".caretignore")
 */
export function getBrandIgnoreFileName(): string {
	const brandName = getCurrentBrandName().toLowerCase()
	return `.${brandName}ignore`
}

/**
 * CARETI MODIFICATION: Legacy Cline ignore filename for compatibility checks
 */
export function getLegacyClineIgnoreFileName(): string {
	return ".clineignore"
}

/**
 * Clear cached values (for testing)
 */
export function clearCache(): void {
	_cachedBrandName = null
}
