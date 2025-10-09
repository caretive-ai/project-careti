export type LanguageKey =
	| "en"
	| "ar"
	| "pt-BR"
	| "cs"
	| "fr"
	| "de"
	| "hi"
	| "hu"
	| "it"
	| "ja"
	| "ko"
	| "pl"
	| "pt-PT"
	| "ru"
	| "zh-CN"
	| "es"
	| "zh-TW"
	| "tr"

export type LanguageDisplay =
	| "English"
	| "Arabic - العربية"
	| "Portuguese - Português (Brasil)"
	| "Czech - Čeština"
	| "French - Français"
	| "German - Deutsch"
	| "Hindi - हिन्दी"
	| "Hungarian - Magyar"
	| "Italian - Italiano"
	| "Japanese - 日本語"
	| "Korean - 한국어"
	| "Polish - Polski"
	| "Portuguese - Português (Portugal)"
	| "Russian - Русский"
	| "Simplified Chinese - 简体中文"
	| "Spanish - Español"
	| "Traditional Chinese - 繁體中文"
	| "Turkish - Türkçe"

export const DEFAULT_LANGUAGE_SETTINGS: LanguageKey = "en"

export const languageOptions: { key: LanguageKey; display: LanguageDisplay }[] = [
	{ key: "en", display: "English" },
	{ key: "ar", display: "Arabic - العربية" },
	{ key: "pt-BR", display: "Portuguese - Português (Brasil)" },
	{ key: "cs", display: "Czech - Čeština" },
	{ key: "fr", display: "French - Français" },
	{ key: "de", display: "German - Deutsch" },
	{ key: "hi", display: "Hindi - हिन्दी" },
	{ key: "hu", display: "Hungarian - Magyar" },
	{ key: "it", display: "Italian - Italiano" },
	{ key: "ja", display: "Japanese - 日本語" },
	{ key: "ko", display: "Korean - 한국어" },
	{ key: "pl", display: "Polish - Polski" },
	{ key: "pt-PT", display: "Portuguese - Português (Portugal)" },
	{ key: "ru", display: "Russian - Русский" },
	{ key: "zh-CN", display: "Simplified Chinese - 简体中文" },
	{ key: "es", display: "Spanish - Español" },
	{ key: "zh-TW", display: "Traditional Chinese - 繁體中文" },
	{ key: "tr", display: "Turkish - Türkçe" },
]

export function getLanguageKey(display: LanguageDisplay | undefined): LanguageKey {
	if (!display) {
		return DEFAULT_LANGUAGE_SETTINGS
	}
	const languageOption = languageOptions.find((option) => option.display === display)
	if (languageOption) {
		return languageOption.key
	}
	return DEFAULT_LANGUAGE_SETTINGS
}

// ============================================================================
// CARET MODIFICATION: F02 - Multilingual i18n System
// ============================================================================

/**
 * UI Language Key - Directly supported UI languages in Caret
 * These are the languages that have full UI translation support
 */
export type UILanguageKey = "ko" | "en" | "ja" | "zh-CN"

/**
 * Mapping from LLM LanguageKey to UI Language Key
 * Maps the broader LLM language set to the supported UI languages
 */
export const LLM_TO_UI_LANGUAGE_MAP: Record<LanguageKey, UILanguageKey> = {
	en: "en",
	ar: "en", // Arabic -> English fallback
	"pt-BR": "en", // Portuguese (Brazil) -> English fallback
	cs: "en", // Czech -> English fallback
	fr: "en", // French -> English fallback
	de: "en", // German -> English fallback
	hi: "en", // Hindi -> English fallback
	hu: "en", // Hungarian -> English fallback
	it: "en", // Italian -> English fallback
	ja: "ja", // Japanese -> Japanese (direct support)
	ko: "ko", // Korean -> Korean (direct support)
	pl: "en", // Polish -> English fallback
	"pt-PT": "en", // Portuguese (Portugal) -> English fallback
	ru: "en", // Russian -> English fallback
	"zh-CN": "zh-CN", // Simplified Chinese -> Simplified Chinese (direct support)
	es: "en", // Spanish -> English fallback
	"zh-TW": "zh-CN", // Traditional Chinese -> Simplified Chinese fallback
	tr: "en", // Turkish -> English fallback
}

/**
 * Array of directly supported UI languages
 * These languages have complete UI translation files
 */
export const DIRECT_UI_SUPPORTED_LANGUAGES: UILanguageKey[] = ["ko", "en", "ja", "zh-CN"]

/**
 * Check if a language key is directly supported by the UI
 * @param languageKey - The language key to check
 * @returns true if the language is directly supported, false otherwise
 */
export function isUILanguageSupported(languageKey: LanguageKey): boolean {
	return DIRECT_UI_SUPPORTED_LANGUAGES.includes(LLM_TO_UI_LANGUAGE_MAP[languageKey])
}

/**
 * Get the UI language key from an LLM language key
 * @param languageKey - The LLM language key
 * @returns The corresponding UI language key (with fallback)
 */
export function getUILanguageKey(languageKey: LanguageKey): UILanguageKey {
	return LLM_TO_UI_LANGUAGE_MAP[languageKey]
}
