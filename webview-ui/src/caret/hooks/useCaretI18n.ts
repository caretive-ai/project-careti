// CARET MODIFICATION: Complete useCaretI18n Hook with Context integration and lazy loading
import { useCallback, useMemo } from "react"
import { useCaretI18nContext } from "../context/CaretI18nContext"
import { getCurrentLanguage, type SupportedLanguage, setGlobalUILanguage, t } from "../utils/i18n"
import { performanceMonitor } from "../utils/i18n-performance"
import { loadLanguageBundle, preloadLanguageBundles } from "../utils/lazy-i18n"

// Define a compatible TFunction type to remove i18next dependency
export type TFunction = (key: string, namespace?: string, options?: Record<string, string | number>) => string

export interface UseCaretI18nReturn {
	t: TFunction
	tWithLang: (key: string, language: SupportedLanguage, namespace?: string) => string
	currentLanguage: SupportedLanguage
	changeLanguage: (language: SupportedLanguage) => Promise<void>
	isLanguageSupported: (language: string) => language is SupportedLanguage
	isLoading: boolean
	preloadLanguages: (languages?: SupportedLanguage[]) => Promise<void>
	getPerformanceMetrics: () => ReturnType<typeof performanceMonitor.getMetrics>
}

// CARET MODIFICATION: Complete hook with Context integration, lazy loading, and performance monitoring
export const useCaretI18n = (): UseCaretI18nReturn => {
	// Try to use context if available, fallback to direct function calls
	let contextLanguage: SupportedLanguage | undefined
	let contextSetLanguage: ((lang: SupportedLanguage) => Promise<void>) | undefined
	let contextIsLoading = false

	try {
		const context = useCaretI18nContext()
		contextLanguage = context.language
		contextSetLanguage = context.setLanguage
		contextIsLoading = context.isLoading
	} catch {
		// Context not available, use direct functions
		contextLanguage = getCurrentLanguage()
	}

	const currentLanguage = contextLanguage || getCurrentLanguage()

	// Enhanced translation function with performance monitoring
	const translationFunction = useCallback(
		(key: string, namespace: string = "common", options?: Record<string, string | number>): string => {
			const endTimer = performanceMonitor.startTranslation()
			const result = t(key, namespace, options, currentLanguage)
			endTimer()
			return result
		},
		[currentLanguage],
	)

	// Translation with explicit language parameter
	const tWithLang = useCallback((key: string, language: SupportedLanguage, namespace: string = "common"): string => {
		const endTimer = performanceMonitor.startTranslation()
		const result = t(key, namespace, language)
		endTimer()
		return result
	}, [])

	const changeLanguage = useCallback(
		async (newLanguage: SupportedLanguage) => {
			try {
				// Use context if available
				if (contextSetLanguage) {
					await contextSetLanguage(newLanguage)
					return
				}

				// Lazy load language bundle before switching
				await loadLanguageBundle(newLanguage)

				// Update global language state
				setGlobalUILanguage(newLanguage)

				console.log(`🌐 Caret i18n: Language changed to ${newLanguage}`)
			} catch (error) {
				console.error("❌ Failed to change language:", error)
				throw error
			}
		},
		[contextSetLanguage],
	)

	const isLanguageSupported = useCallback((language: string): language is SupportedLanguage => {
		return ["ko", "en", "ja", "zh"].includes(language)
	}, [])

	// Preload multiple languages for better UX
	const preloadLanguages = useCallback(async (languages: SupportedLanguage[] = ["ko", "en"]) => {
		try {
			await preloadLanguageBundles(languages)
		} catch (error) {
			console.warn("⚠️ Some languages failed to preload:", error)
		}
	}, [])

	// Get performance metrics
	const getPerformanceMetrics = useCallback(() => {
		return performanceMonitor.getMetrics()
	}, [])

	// Memoize the return object to prevent unnecessary re-renders
	const returnValue = useMemo(
		() => ({
			t: translationFunction,
			tWithLang,
			currentLanguage,
			changeLanguage,
			isLanguageSupported,
			isLoading: contextIsLoading,
			preloadLanguages,
			getPerformanceMetrics,
		}),
		[
			translationFunction,
			tWithLang,
			currentLanguage,
			changeLanguage,
			isLanguageSupported,
			contextIsLoading,
			preloadLanguages,
			getPerformanceMetrics,
		],
	)

	return returnValue
}

export default useCaretI18n
