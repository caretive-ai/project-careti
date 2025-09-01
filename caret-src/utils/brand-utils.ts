// CARET MODIFICATION: Caret brand utilities - centralized brand detection and configuration
// Provides brand-specific functionality without cluttering Cline's env.ts

import fs from "fs"
import path from "path"
import { CARET_MODE_SYSTEM_CONFIG, type CaretModeSystem } from "@caret/shared/ModeSystem"

// Cached brand detection for performance
let _cachedBrand: CaretModeSystem | null = null

/**
 * Detect current brand from package.json (cached for performance)
 * @returns The current brand mode ("caret" or "cline")
 */
export function detectCurrentBrand(): CaretModeSystem {
	if (_cachedBrand) {
		return _cachedBrand
	}

	try {
		const packageJsonPath = path.join(__dirname, '..', '..', 'package.json')
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
		const displayName = (packageJson.displayName || '').toLowerCase()
		
		// Detect brand from displayName
		if (displayName.includes('caret')) {
			_cachedBrand = 'caret'
		} else if (displayName.includes('cline')) {
			_cachedBrand = 'cline'  
		} else {
			_cachedBrand = 'caret' // Default to caret
		}
		
		return _cachedBrand
	} catch (error) {
		console.error('Failed to detect brand from package.json:', error)
		_cachedBrand = 'caret' // Safe default
		return _cachedBrand
	}
}

/**
 * Get current brand display name (for UI, output channels, etc.)
 * @returns Brand display name ("Caret" or "Cline")
 */
export function getCurrentBrandName(): string {
	const brand = detectCurrentBrand()
	return CARET_MODE_SYSTEM_CONFIG[brand].name
}

/**
 * Check if current brand supports i18n features
 * @returns true if i18n is enabled for current brand
 */
export function isBrandI18nEnabled(): boolean {
	const brand = detectCurrentBrand()
	return CARET_MODE_SYSTEM_CONFIG[brand].features.i18nEnabled
}

/**
 * Check if current brand supports backend message translation
 * @returns true if backend translation is enabled for current brand
 */
export function isBackendTranslationEnabled(): boolean {
	const brand = detectCurrentBrand()
	return CARET_MODE_SYSTEM_CONFIG[brand].features.backendMessageTranslation
}

/**
 * Check if current brand supports branding features
 * @returns true if branding is enabled for current brand
 */
export function isBrandingEnabled(): boolean {
	const brand = detectCurrentBrand()
	return CARET_MODE_SYSTEM_CONFIG[brand].features.brandingEnabled
}

/**
 * Get current brand's default language
 * @returns Default language for current brand ("ko" | "en")
 */
export function getBrandDefaultLanguage(): "ko" | "en" {
	const brand = detectCurrentBrand()
	return CARET_MODE_SYSTEM_CONFIG[brand].features.defaultLanguage
}

/**
 * Get current brand configuration
 * @returns Complete brand configuration object
 */
export function getCurrentBrandConfig() {
	const brand = detectCurrentBrand()
	return CARET_MODE_SYSTEM_CONFIG[brand]
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
 * Clear cached brand (for testing)
 */
export function clearBrandCache(): void {
	_cachedBrand = null
}