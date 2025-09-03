// 글로벌 다국어/국제화 유틸 - Caret 전용 버전 (JSON 파일 기반)
// CARET MODIFICATION: Integrated performance monitoring

import enAnnouncement from "../locale/en/announcement.json"
import enCommon from "../locale/en/common.json"
import enPersona from "../locale/en/persona.json"
import enSettings from "../locale/en/settings.json"
import enValidateApiConf from "../locale/en/validate-api-conf.json"
import enWelcome from "../locale/en/welcome.json"
import jaAnnouncement from "../locale/ja/announcement.json"
import jaCommon from "../locale/ja/common.json"
import jaPersona from "../locale/ja/persona.json"
import jaSettings from "../locale/ja/settings.json"
import jaValidateApiConf from "../locale/ja/validate-api-conf.json"
import jaWelcome from "../locale/ja/welcome.json"
// CARET MODIFICATION: Announcement component translations
import koAnnouncement from "../locale/ko/announcement.json"
import koCommon from "../locale/ko/common.json"
import koPersona from "../locale/ko/persona.json"
import koSettings from "../locale/ko/settings.json"
import koValidateApiConf from "../locale/ko/validate-api-conf.json"
import koWelcome from "../locale/ko/welcome.json"
import zhAnnouncement from "../locale/zh/announcement.json"
import zhCommon from "../locale/zh/common.json"
import zhPersona from "../locale/zh/persona.json"
import zhSettings from "../locale/zh/settings.json"
import zhValidateApiConf from "../locale/zh/validate-api-conf.json"
import zhWelcome from "../locale/zh/welcome.json"
import { performanceMonitor } from "./i18n-performance"

// CARET MODIFICATION: Removed urls dependency for cline-latest compatibility
export type SupportedLanguage = "ko" | "en" | "ja" | "zh"

// JSON 파일에서 번역 데이터 로드
let translations = {
	ko: {
		common: koCommon,
		welcome: koWelcome,
		persona: koPersona,
		settings: koSettings,
		"validate-api-conf": koValidateApiConf,
		announcement: koAnnouncement,
	},
	en: {
		common: enCommon,
		welcome: enWelcome,
		persona: enPersona,
		settings: enSettings,
		"validate-api-conf": enValidateApiConf,
		announcement: enAnnouncement,
	},
	ja: {
		common: jaCommon,
		welcome: jaWelcome,
		persona: jaPersona,
		settings: jaSettings,
		"validate-api-conf": jaValidateApiConf,
		announcement: jaAnnouncement,
	},
	zh: {
		common: zhCommon,
		welcome: zhWelcome,
		persona: zhPersona,
		settings: zhSettings,
		"validate-api-conf": zhValidateApiConf,
		announcement: zhAnnouncement,
	},
}

// CARET MODIFICATION: 테스트 목적으로 translations 객체를 설정하는 함수 추가
export const setTranslationsForTesting = (mockTranslations: typeof translations) => {
	translations = mockTranslations
	performanceMonitor.reset() // 캐시 초기화 (resetCache 대신 reset 사용)
}

// CARET MODIFICATION: 웹뷰 전역 UI 언어 관리
let currentEffectiveLanguage: SupportedLanguage = "en" // 기본 언어 'en'
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["ko", "en", "ja", "zh"]

/**
 * 웹뷰 전역에 적용될 UI 언어를 설정합니다.
 * @param lang 설정할 언어 코드
 */
export const setGlobalUILanguage = (lang: SupportedLanguage) => {
	if (SUPPORTED_LANGUAGES.includes(lang)) {
		currentEffectiveLanguage = lang
	} else {
		currentEffectiveLanguage = "en" // 지원하지 않는 경우 영어로 폴백
	}
}

// 내부적으로 현재 적용된 UI 언어를 가져오는 함수
const getInternalCurrentLanguage = (): SupportedLanguage => {
	return currentEffectiveLanguage
}

// 기존 getCurrentLanguage 함수는 외부에서 직접 사용하지 않도록 하거나, getInternalCurrentLanguage로 대체합니다.
// 여기서는 혼동을 피하기 위해 주석 처리하거나 삭제하는 것을 고려할 수 있으나,
// 일단은 내부 로직 변경을 우선합니다.
export const getCurrentLanguage = (): SupportedLanguage => {
	// 이 함수는 이제 getInternalCurrentLanguage를 통해 전역 상태를 반영해야 합니다.
	// 하지만 App.tsx에서 setGlobalUILanguage를 호출하기 전까지는
	// Context가 완전히 준비되지 않았을 수 있으므로 주의가 필요합니다.
	// 우선은 이전처럼 동작하되, t 함수 등에서는 getInternalCurrentLanguage를 사용합니다.
	return "en" // 이 부분은 App.tsx 연동 후 역할 재검토 필요
}

// Helper function to get nested value using dot notation
const getNestedValue = (obj: any, path: string): any => {
	return path.split(".").reduce((current, key) => current?.[key], obj)
}

// CARET MODIFICATION: 한글 조사 규칙 매핑
const koreanJosaRules = {
	을: (word: string) => (hasLastConsonant(word) ? "을" : "를"),
	은: (word: string) => (hasLastConsonant(word) ? "은" : "는"),
	이: (word: string) => (hasLastConsonant(word) ? "이" : "가"),
	로: (word: string) => (hasLastConsonant(word) ? "으로" : "로"),
	와: (word: string) => (hasLastConsonant(word) ? "과" : "와"),
}

// CARET MODIFICATION: 받침 검사 헬퍼 함수 (export 추가)
export const hasLastConsonant = (word: string): boolean => {
	if (!word || word.length === 0) {
		return false
	}

	const lastChar = word[word.length - 1]
	const lastCharCode = lastChar.charCodeAt(0)

	// 한글 유니코드 범위 확인 (가-힣: 44032-55203)
	if (lastCharCode >= 44032 && lastCharCode <= 55203) {
		// 종성 확인: (유니코드 - 44032) % 28
		return (lastCharCode - 44032) % 28 !== 0
	}

	// 영어/숫자인 경우 발음에 따른 처리
	// 'e'는 보통 발음하지 않으므로 받침이 있다고 처리
	if (lastChar.toLowerCase() === "e") {
		return true
	}
	// 숫자는 받침이 있다고 처리 (예: "1" -> "원")
	if (/[0-9]$/.test(lastChar)) {
		return true
	}
	const consonantEnding = /[bcdfgjklmnpqrstvwxz]$/i.test(lastChar)
	return consonantEnding
}

// CARET MODIFICATION: Enhanced template processing with performance monitoring
const replaceTemplateVariables = (
	text: any,
	language: SupportedLanguage,
	options?: Record<string, string | number>,
	namespace: string = "common",
): string => {
	// Start template processing timer
	const startTime = performance.now()

	try {
		// 타입 체크: 문자열이 아니면 문자열로 변환하거나 그대로 반환
		if (typeof text !== "string") {
			return String(text)
		}

		let result = text

		// CARET MODIFICATION: 한글 조사 처리 및 브랜드 참조 처리
		result = result.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
			// 한글 조사 처리 (예: brand.appName|을)
			if (language === "ko" && expression.includes("|")) {
				const [keyPath, josa] = expression.split("|")
				let value: string | undefined

				// 브랜드 참조 처리
				if (keyPath.startsWith("brand.")) {
					const brandKey = keyPath.substring(6)
					// namespace 내에서 브랜드 참조 처리
					const namespaceData = translations[language]?.[namespace as keyof (typeof translations)[typeof language]]
					value = getNestedValue(namespaceData, `brand.${brandKey}`)
					if (!value) {
						// Fallback to English namespace
						const enNamespaceData = translations.en[namespace as keyof (typeof translations)["en"]]
						value = getNestedValue(enNamespaceData, `brand.${brandKey}`)
					}
				} else {
					const namespaceData = translations[language]?.[namespace as keyof (typeof translations)[typeof language]]
					value = getNestedValue(namespaceData, keyPath)
				}

				if (value && koreanJosaRules[josa as keyof typeof koreanJosaRules]) {
					return value + koreanJosaRules[josa as keyof typeof koreanJosaRules](value)
				}
			}

			// 브랜드 참조 처리 (예: brand.appName)
			if (expression.startsWith("brand.")) {
				const brandKey = expression.substring(6)
				// namespace 내에서 브랜드 참조 처리
				const namespaceData = translations[language]?.[namespace as keyof (typeof translations)[typeof language]]
				const brandValue = getNestedValue(namespaceData, `brand.${brandKey}`)
				if (brandValue) {
					return brandValue
				}

				// Fallback to English
				const enNamespaceData = translations.en[namespace as keyof (typeof translations)["en"]]
				const enBrandValue = getNestedValue(enNamespaceData, `brand.${brandKey}`)
				if (enBrandValue) {
					return enBrandValue
				}
			}

			// 기존 변수 처리
			const namespaceData = translations[language]?.[namespace as keyof (typeof translations)[typeof language]]
			const value = getNestedValue(namespaceData, expression)
			if (value) {
				return value
			}

			return match
		})

		// 추가된 동적 옵션 변수 치환
		if (options) {
			for (const key in options) {
				if (Object.hasOwn(options, key)) {
					const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g")
					result = result.replace(regex, String(options[key]))
				}
			}
		}

		return result
	} finally {
		// Record template processing performance
		const duration = performance.now() - startTime
		performanceMonitor.recordTemplateProcessing(duration)

		// Record Korean particle processing if applicable
		if (language === "ko" && text.includes("|")) {
			performanceMonitor.recordKoreanParticleProcessing(duration)
		}
	}
}

// CARET MODIFICATION: Enhanced translation function with performance monitoring and caching
export const t = (
	key: string,
	namespace: string = "common",
	optionsOrLanguage?: Record<string, string | number> | SupportedLanguage,
	language?: SupportedLanguage,
): string => {
	// Start performance monitoring
	const endTimer = performanceMonitor.startTranslation()

	try {
		// Check cache first for performance
		const cacheKey = `${language || getInternalCurrentLanguage()}_${namespace}_${key}_${JSON.stringify(optionsOrLanguage || {})}`
		const cachedResult = performanceMonitor.getCachedTranslation(cacheKey)
		if (cachedResult) {
			return cachedResult
		}

		// Handle overloaded parameters
		let options: Record<string, string | number> | undefined
		let targetLanguage: SupportedLanguage

		if (typeof optionsOrLanguage === "string") {
			// If third parameter is a string, it's a language
			options = undefined
			targetLanguage = optionsOrLanguage
		} else {
			// If third parameter is an object or undefined, it's options
			options = optionsOrLanguage
			targetLanguage = language || getInternalCurrentLanguage()
		}

		const currentLang = targetLanguage
		const namespaceData = translations[currentLang]?.[namespace as keyof (typeof translations)[typeof currentLang]]

		let result: string

		if (namespaceData) {
			const value = getNestedValue(namespaceData, key)
			if (value !== undefined && value !== null) {
				result = replaceTemplateVariables(value, currentLang, options, namespace)
				// Cache the result
				performanceMonitor.setCachedTranslation(cacheKey, result)
				return result
			}
		}

		// Fallback to Korean (temporary for development)
		const koNamespaceData = translations.ko[namespace as keyof (typeof translations)["ko"]]
		if (koNamespaceData) {
			const value = getNestedValue(koNamespaceData, key)
			if (value !== undefined && value !== null) {
				result = replaceTemplateVariables(value, "ko", options, namespace)
				// Cache the fallback result
				performanceMonitor.setCachedTranslation(cacheKey, result)
				return result
			}
		}

		// Last fallback - return the key itself
		result = key
		performanceMonitor.setCachedTranslation(cacheKey, result)
		return result
	} finally {
		endTimer()
	}
}

// CARET MODIFICATION: Enhanced tWithLang with performance monitoring
export const tWithLang = (key: string, language: SupportedLanguage, namespace: string = "common"): string => {
	const endTimer = performanceMonitor.startTranslation()

	try {
		// Check cache first
		const cacheKey = `${language}_${namespace}_${key}`
		const cachedResult = performanceMonitor.getCachedTranslation(cacheKey)
		if (cachedResult) {
			return cachedResult
		}

		const namespaceData = translations[language]?.[namespace as keyof (typeof translations)[typeof language]]

		let result: string

		if (namespaceData) {
			const value = getNestedValue(namespaceData, key)
			if (value) {
				result = replaceTemplateVariables(value, language, undefined, namespace)
				performanceMonitor.setCachedTranslation(cacheKey, result)
				return result
			}
		}

		// Fallback to Korean (temporary for development)
		const koNamespaceData = translations.ko[namespace as keyof (typeof translations)["ko"]]
		if (koNamespaceData) {
			const value = getNestedValue(koNamespaceData, key)
			if (value) {
				result = replaceTemplateVariables(value, "ko", undefined, namespace)
				performanceMonitor.setCachedTranslation(cacheKey, result)
				return result
			}
		}

		result = key
		performanceMonitor.setCachedTranslation(cacheKey, result)
		return result
	} finally {
		endTimer()
	}
}

// CARET MODIFICATION: Integrated lazy loading system
const loadedLanguages = new Set<SupportedLanguage>(["en"]) // English is always loaded
const languageLoadingPromises = new Map<SupportedLanguage, Promise<any>>()

/**
 * Lazy load a language pack if not already loaded
 * Integrates with existing translation system
 */
export const ensureLanguageLoaded = async (language: SupportedLanguage): Promise<void> => {
	// Skip if already loaded
	if (loadedLanguages.has(language)) {
		return
	}

	// Return existing promise if loading
	if (languageLoadingPromises.has(language)) {
		await languageLoadingPromises.get(language)
		return
	}

	// Start loading
	const loadingPromise = loadLanguagePack(language)
	languageLoadingPromises.set(language, loadingPromise)

	try {
		await loadingPromise
		loadedLanguages.add(language)
		console.log(`✅ Language pack loaded: ${language}`)
	} catch (error) {
		console.warn(`⚠️ Failed to load language pack: ${language}`, error)
	} finally {
		languageLoadingPromises.delete(language)
	}
}

/**
 * Internal function to load language pack dynamically
 * Uses dynamic imports for code splitting
 */
const loadLanguagePack = async (lang: SupportedLanguage): Promise<void> => {
	try {
		// Dynamic imports for each namespace
		const [commonModule, welcomeModule, personaModule, settingsModule, validateModule, announcementModule] =
			await Promise.all([
				import(`../locale/${lang}/common.json`),
				import(`../locale/${lang}/welcome.json`),
				import(`../locale/${lang}/persona.json`),
				import(`../locale/${lang}/settings.json`),
				import(`../locale/${lang}/validate-api-conf.json`),
				import(`../locale/${lang}/announcement.json`),
			])

		// Update translations object with loaded data
		translations[lang] = {
			...translations[lang],
			common: commonModule.default || commonModule,
			welcome: welcomeModule.default || welcomeModule,
			persona: personaModule.default || personaModule,
			settings: settingsModule.default || settingsModule,
			"validate-api-conf": validateModule.default || validateModule,
			announcement: announcementModule.default || announcementModule,
		}
	} catch (error) {
		console.error(`❌ Failed to load language pack for ${lang}:`, error)
		throw error
	}
}

/**
 * Enhanced changeLanguage with lazy loading
 */
export const changeLanguage = async (newLang: SupportedLanguage): Promise<void> => {
	// Ensure language pack is loaded before switching
	await ensureLanguageLoaded(newLang)

	// Update global language
	setGlobalUILanguage(newLang)
}

/**
 * Preload multiple language packs for better UX
 */
export const preloadLanguages = async (languages: SupportedLanguage[] = ["ko", "en"]): Promise<void> => {
	const loadingTasks = languages.map((lang) => ensureLanguageLoaded(lang))

	try {
		await Promise.all(loadingTasks)
		console.log(`✅ Preloaded ${languages.length} language packs`)
	} catch (error) {
		console.warn("⚠️ Some language packs failed to preload:", error)
	}
}

/**
 * Get loading statistics
 */
export const getLanguageLoadingStats = () => {
	return {
		loaded: Array.from(loadedLanguages),
		loading: Array.from(languageLoadingPromises.keys()),
		totalSupported: ["ko", "en", "ja", "zh"].length,
	}
}

/**
 * Export performance monitoring functions for easy access
 */
export const getI18nPerformanceMetrics = () => performanceMonitor.getMetrics()
export const logI18nPerformanceSummary = () => performanceMonitor.logPerformanceSummary()
export const resetI18nPerformanceMetrics = () => performanceMonitor.reset()

// 링크 관련 함수는 추후 구현 예정
// export const getLink = (key: string, language?: SupportedLanguage): string => {
//   return `#${key}` // placeholder
// }
//
// export const getGlobalLink = (key: string): string => {
//   return `#${key}` // placeholder
// }

// Export as default for compatibility
export default { t, tWithLang, setGlobalUILanguage }

// 필요한 경우 여기서 언어 관련 util 함수 추가 가능
