// CARET MODIFICATION: Lazy loading system for i18n optimization
// This module provides lazy loading capabilities for language bundles to improve initial load performance

import type { SupportedLanguage } from "./i18n"

// Language bundle cache
const languageCache = new Map<string, any>()
const loadingPromises = new Map<string, Promise<any>>()

/**
 * Lazy load a language bundle
 * @param language - The language code to load
 * @param namespace - The namespace to load (default: 'common')
 * @returns Promise that resolves to the loaded translations
 */
export async function loadLanguageBundle(language: SupportedLanguage, namespace: string = "common"): Promise<any> {
	const cacheKey = `${language}-${namespace}`

	// Return cached version if available
	if (languageCache.has(cacheKey)) {
		return languageCache.get(cacheKey)
	}

	// Return existing loading promise if in progress
	if (loadingPromises.has(cacheKey)) {
		return loadingPromises.get(cacheKey)
	}

	// Start loading the bundle
	const loadingPromise = loadBundle(language, namespace)
	loadingPromises.set(cacheKey, loadingPromise)

	try {
		const bundle = await loadingPromise
		languageCache.set(cacheKey, bundle)
		loadingPromises.delete(cacheKey)
		return bundle
	} catch (error) {
		loadingPromises.delete(cacheKey)
		throw error
	}
}

/**
 * Preload language bundles for better UX
 * @param languages - Languages to preload
 * @param namespaces - Namespaces to preload
 */
export async function preloadLanguageBundles(
	languages: SupportedLanguage[] = ["ko", "en"],
	namespaces: string[] = ["common"],
): Promise<void> {
	const loadingTasks: Promise<any>[] = []

	for (const language of languages) {
		for (const namespace of namespaces) {
			loadingTasks.push(loadLanguageBundle(language, namespace))
		}
	}

	try {
		await Promise.all(loadingTasks)
		console.log(`✅ i18n: Preloaded ${languages.length} languages × ${namespaces.length} namespaces`)
	} catch (error) {
		console.warn("⚠️ i18n: Some bundles failed to preload:", error)
	}
}

/**
 * Get cache statistics for performance monitoring
 */
export function getCacheStats() {
	return {
		cached: languageCache.size,
		loading: loadingPromises.size,
		keys: Array.from(languageCache.keys()),
	}
}

/**
 * Clear language cache (useful for development)
 */
export function clearLanguageCache(): void {
	languageCache.clear()
	loadingPromises.clear()
}

/**
 * Internal function to load a language bundle
 */
async function loadBundle(language: SupportedLanguage, namespace: string): Promise<any> {
	try {
		// Dynamic import for code splitting
		const module = await import(`../locale/${language}/${namespace}.json`)
		return module.default || module
	} catch (error) {
		console.warn(`⚠️ i18n: Failed to load ${language}/${namespace}:`, error)

		// Fallback to English if available
		if (language !== "en") {
			try {
				const fallback = await import(`../locale/en/${namespace}.json`)
				return fallback.default || fallback
			} catch (fallbackError) {
				console.error(`❌ i18n: Fallback to English also failed:`, fallbackError)
				return {}
			}
		}

		return {}
	}
}
