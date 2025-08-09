/**
 * Caret 서비스 및 회사 URL 상수
 */
export const CARET_URLS = {
	// 서비스 관련 (언어 무관)
	CARET_SERVICE: "https://caret.team",
	CARET_GITHUB: "https://github.com/aicoding-caret/caret",

	// 계정 관련 (언어 무관)
	CARET_APP_CREDITS: "https://app.caret.team/credits",
	CARET_APP_CREDITS_BUY: "https://app.caret.team/credits/#buy",
	CARET_TERMS_OF_SERVICE: "https://caretive.ai/terms",
	CARET_PRIVACY_POLICY: "https://caretive.ai/privacy",

	// 회사 관련 (언어 무관)
	CARETIVE_COMPANY: "https://caretive.ai",
	CARETIVE_ABOUT: "https://caretive.ai/about",
	CARETIVE_TERMS: "https://caretive.ai/terms",
	CARETIVE_PRIVACY: "https://caretive.ai/privacy",
	CARETIVE_YOUTH_PROTECTION: "https://caretive.ai/youth-protection",
	CARETIVE_SUPPORT: "https://caretive.ai/support",
} as const

/**
 * 언어별 링크 상수
 * 각 언어코드(ko, en, ja, zh)에 따라 다른 링크를 제공
 */
export const CARET_LOCALIZED_URLS = {
	// 교육 프로그램 링크
	EDUCATION_PROGRAM: {
		ko: "https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes",
		en: "https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes",
		ja: "https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes",
		zh: "https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes",
	},

	// Gemini 크레딧 가이드
	GEMINI_CREDIT_GUIDE: {
		ko: "https://blog.naver.com/fstory97/223887376667",
		en: "https://blog.naver.com/fstory97/223887376667",
		ja: "https://blog.naver.com/fstory97/223887376667",
		zh: "https://blog.naver.com/fstory97/223887376667",
	},

	// Caret GitHub (README 언어별)
	CARET_GITHUB_DETAILED: {
		ko: "https://github.com/aicoding-caret/caret/blob/main/README.md",
		en: "https://github.com/aicoding-caret/caret/blob/main/README.en.md",
		ja: "https://github.com/aicoding-caret/caret/blob/main/README.en.md",
		zh: "https://github.com/aicoding-caret/caret/blob/main/README.en.md",
	},

	// 이용약관 및 개인정보취급방침 (한국어 별도, 그 외 영어 기본)
	CARETIVE_TERMS: {
		ko: "https://caretive.ai/terms.ko.html",
		en: "https://caretive.ai/terms.en.html",
		ja: "https://caretive.ai/terms.en.html",
		zh: "https://caretive.ai/terms.en.html",
	},
	CARETIVE_PRIVACY: {
		ko: "https://caretive.ai/privacy.ko.html",
		en: "https://caretive.ai/privacy.en.html",
		ja: "https://caretive.ai/privacy.en.html",
		zh: "https://caretive.ai/privacy.en.html",
	},
} as const

export type CaretUrlKey = keyof typeof CARET_URLS
export type CaretLocalizedUrlKey = keyof typeof CARET_LOCALIZED_URLS
export type SupportedLanguage = "ko" | "en" | "ja" | "zh"

/**
 * 현재 언어에 맞는 링크를 가져오는 헬퍼 함수
 */
export function getLocalizedUrl(key: CaretLocalizedUrlKey, language: SupportedLanguage = "ko"): string {
	const urlMap = CARET_LOCALIZED_URLS[key]
	return urlMap[language] || urlMap.ko // fallback to Korean
}

/**
 * 일반 URL을 가져오는 헬퍼 함수
 */
export function getUrl(key: CaretUrlKey): string {
	return CARET_URLS[key]
}
