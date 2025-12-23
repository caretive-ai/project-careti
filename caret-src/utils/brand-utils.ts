// CARET MODIFICATION: Caret brand utilities - centralized brand detection and configuration
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
		// CARET MODIFICATION: default brand fallback uses Caret when displayName is missing
		const displayName = packageJson.displayName || "Caret"

		// displayName을 그대로 브랜드명으로 사용
		_cachedBrandName = displayName

		return _cachedBrandName!
	} catch (error) {
		console.error("Failed to detect brand from package.json:", error)
		_cachedBrandName = "Caret" // CARET MODIFICATION: safe default brand fallback
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
 * Convert a display name into a safe CLI/package slug.
 * - lowercased
 * - spaces -> '-'
 * - removes characters outside [a-z0-9-]
 */
export function toBrandSlug(displayName: string): string {
	return (displayName || "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

/**
 * Get brand slug for the current Caret-mode brand (white-label capable).
 */
export function getCurrentBrandSlug(): string {
	return toBrandSlug(getCurrentBrandDisplayName()) || "caret"
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
 * Get the user-facing brand name for the given modeSystem.
 * - caret: current product brand (white-label capable)
 * - cline: upstream brand (stable label)
 */
export function getModeSystemBrandName(modeSystem: CaretModeSystem): string {
	if (modeSystem === "caret") {
		return getCurrentBrandDisplayName()
	}

	return CARET_MODE_SYSTEM_CONFIG.cline.name
}

/**
 * Get the user-facing CLI label for the given modeSystem.
 */
export function getModeSystemCliLabel(modeSystem: CaretModeSystem): string {
	return `${getModeSystemBrandName(modeSystem)} CLI`
}

/**
 * Get the CLI command name for the given modeSystem.
 * - caret: brand slug (e.g., "caret", "codecenter")
 * - cline: upstream "cline"
 */
export function getModeSystemCliCommandName(modeSystem: CaretModeSystem): string {
	if (modeSystem === "caret") {
		return getCurrentBrandSlug()
	}
	return "cline"
}

/**
 * Get the npm package name for the CLI for the given modeSystem.
 * - caret: `@caretive/<brandSlug>-cli` (default: `@caretive/caret-cli`)
 * - cline: `cline` (upstream)
 */
export function getModeSystemCliNpmPackageName(modeSystem: CaretModeSystem): string {
	if (modeSystem === "caret") {
		return `@caretive/${getCurrentBrandSlug()}-cli`
	}
	return "cline"
}

export function getModeSystemCliInstallCommand(modeSystem: CaretModeSystem): string {
	if (modeSystem === "caret") {
		return `npm install -g ${getModeSystemCliNpmPackageName("caret")}`
	}
	return "npm install -g cline"
}

/**
 * Get brand rules file name based on current brand
 * @returns Rules file name (e.g., ".caretrules", ".codecenterrules")
 */
export function getBrandRulesFileName(): string {
	const brandName = getCurrentBrandName().toLowerCase()
	return `.${brandName}rules`
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
 * CARET MODIFICATION: Get brand-specific ignore filename (e.g., ".caretignore")
 */
export function getBrandIgnoreFileName(): string {
	const brandName = getCurrentBrandName().toLowerCase()
	return `.${brandName}ignore`
}

/**
 * CARET MODIFICATION: Legacy Cline ignore filename for compatibility checks
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
