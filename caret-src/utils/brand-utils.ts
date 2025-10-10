// CARET MODIFICATION: Caret brand utilities - centralized brand detection and configuration
// Provides brand-specific functionality without cluttering Cline's env.ts

import fs from "fs"
import path from "path"
import { CARET_MODE_SYSTEM_CONFIG, type CaretModeSystem } from "@caret/shared/ModeSystem"

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

	try {
		const packageJsonPath = path.join(__dirname, '..', '..', 'package.json')
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
		const displayName = packageJson.displayName || 'Cline'
		
		// displayName을 그대로 브랜드명으로 사용
		_cachedBrandName = displayName

		return _cachedBrandName!
	} catch (error) {
		console.error('Failed to detect brand from package.json:', error)
		_cachedBrandName = 'Cline' // Safe default
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
	return brandName === 'cline' ? 'cline' : 'caret'
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
 * Clear cached values (for testing)
 */
export function clearCache(): void {
	_cachedBrandName = null
}