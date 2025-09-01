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

// CARET MODIFICATION: UI에서 지원하는 언어 목록 (Caret i18n 시스템 기준)
export type UILanguageKey = "ko" | "en" | "ja" | "zh-CN"

// CARET MODIFICATION: LLM 언어 코드를 UI 언어 코드로 매핑
export const LLM_TO_UI_LANGUAGE_MAP: Record<LanguageKey, UILanguageKey | null> = {
	en: "en", // 영어 → 영어 UI
	ko: "ko", // 한국어 → 한국어 UI
	ja: "ja", // 일본어 → 일본어 UI
	"zh-CN": "zh-CN", // 중국어 간체 → 중국어 UI
	"zh-TW": "zh-CN", // 중국어 번체 → 중국어 UI (간체로 매핑, 하지만 직접 지원은 아님)
	// UI 지원하지 않는 언어들은 null (영어 UI 유지)
	ar: null, // 아랍어 → 영어 UI 유지
	"pt-BR": null, // 포르투갈어(브라질) → 영어 UI 유지
	cs: null, // 체코어 → 영어 UI 유지
	fr: null, // 프랑스어 → 영어 UI 유지
	de: null, // 독일어 → 영어 UI 유지
	hi: null, // 힌디어 → 영어 UI 유지
	hu: null, // 헝가리어 → 영어 UI 유지
	it: null, // 이탈리아어 → 영어 UI 유지
	pl: null, // 폴란드어 → 영어 UI 유지
	"pt-PT": null, // 포르투갈어(포르투갈) → 영어 UI 유지
	ru: null, // 러시아어 → 영어 UI 유지
	es: null, // 스페인어 → 영어 UI 유지
	tr: null, // 터키어 → 영어 UI 유지
}

// CARET MODIFICATION: 직접적인 UI 지원 언어 목록 (🎨 아이콘 표시용)
export const DIRECT_UI_SUPPORTED_LANGUAGES: LanguageKey[] = ["en", "ko", "ja", "zh-CN"]

export const languageOptions: { key: LanguageKey; display: LanguageDisplay }[] = [
	// UI 지원 언어 우선 (영어 > 한국어 > 중국어 > 일본어)
	{ key: "en", display: "English" },
	{ key: "ko", display: "Korean - 한국어" },
	{ key: "zh-CN", display: "Simplified Chinese - 简体中文" },
	{ key: "ja", display: "Japanese - 日本語" },
	// UI 미지원 언어들 (알파벳 순)
	{ key: "ar", display: "Arabic - العربية" },
	{ key: "cs", display: "Czech - Čeština" },
	{ key: "de", display: "German - Deutsch" },
	{ key: "es", display: "Spanish - Español" },
	{ key: "fr", display: "French - Français" },
	{ key: "hi", display: "Hindi - हिन्दी" },
	{ key: "hu", display: "Hungarian - Magyar" },
	{ key: "it", display: "Italian - Italiano" },
	{ key: "pl", display: "Polish - Polski" },
	{ key: "pt-BR", display: "Portuguese - Português (Brasil)" },
	{ key: "pt-PT", display: "Portuguese - Português (Portugal)" },
	{ key: "ru", display: "Russian - Русский" },
	{ key: "tr", display: "Turkish - Türkçe" },
	{ key: "zh-TW", display: "Traditional Chinese - 繁體中文" },
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

// CARET MODIFICATION: 언어 통합 유틸리티 함수들
/**
 * LLM 언어가 UI에서 직접 지원되는지 확인 (🎨 아이콘 표시용)
 */
export function isUILanguageSupported(languageKey: LanguageKey): boolean {
	return DIRECT_UI_SUPPORTED_LANGUAGES.includes(languageKey)
}

/**
 * LLM 언어 코드를 대응하는 UI 언어 코드로 변환
 * UI 지원하지 않는 언어는 기본 영어("en") 반환
 */
export function getUILanguageFromLLM(languageKey: LanguageKey): UILanguageKey {
	return LLM_TO_UI_LANGUAGE_MAP[languageKey] || "en"
}

/**
 * UI 언어 코드를 Caret i18n 시스템의 SupportedLanguage로 변환
 */
export function getCaretSupportedLanguage(uiLanguageKey: UILanguageKey): "ko" | "en" | "ja" | "zh" {
	// zh-CN을 zh로 매핑 (Caret i18n 시스템 호환성)
	if (uiLanguageKey === "zh-CN") {
		return "zh"
	}
	return uiLanguageKey as "ko" | "en" | "ja"
}

/**
 * 통합 언어 설정 유틸리티
 * LLM 언어 설정 시 UI 언어도 자동 결정
 */
export function getLanguageSettings(languageKey: LanguageKey) {
	return {
		llmLanguage: languageKey,
		uiLanguage: getUILanguageFromLLM(languageKey),
		caretLanguage: getCaretSupportedLanguage(getUILanguageFromLLM(languageKey)),
		isUISupported: isUILanguageSupported(languageKey),
	}
}
