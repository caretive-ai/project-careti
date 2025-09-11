// CARET MODIFICATION: URL constants for Caret WelcomeView links and external resources
export const CARET_URLS = {
	// GitHub Repository
	GITHUB_REPOSITORY: "https://github.com/aicoding-caret/caret",

	// Company and Service
	CARETIVE_COMPANY: "https://caretive.co.kr",
	CARET_SERVICE: "https://caret.kr",

	// Legal and Support
	TERMS_OF_SERVICE: "https://caret.kr/terms",
	PRIVACY_POLICY: "https://caret.kr/privacy",
	YOUTH_PROTECTION: "https://caret.kr/youth-protection",
	SUPPORT: "https://caret.kr/support",
}

// Language-specific URLs for educational content and documentation
export const CARET_LOCALIZED_URLS = {
	CARETIVE_PRIVACY: {
		ko: "https://caret.kr/privacy",
		en: "https://caret.kr/privacy",
		ja: "https://caret.kr/privacy",
		zh: "https://caret.kr/privacy",
	},
	YOUTH_PROTECTION: {
		ko: "https://caret.kr/youth-protection",
		en: "https://caret.kr/youth-protection",
		ja: "https://caret.kr/youth-protection",
		zh: "https://caret.kr/youth-protection",
	},
	EDUCATION_PROGRAM: {
		ko: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/education-program.ko.md",
		en: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/education-program.en.md",
		ja: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/education-program.ja.md",
		zh: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/education-program.zh.md",
	},
	GEMINI_CREDIT_GUIDE: {
		ko: "https://blog.naver.com/fstory97/223887376667",
		en: "https://blog.naver.com/fstory97/223887376667",
		ja: "https://blog.naver.com/fstory97/223887376667",
		zh: "https://blog.naver.com/fstory97/223887376667",
	},
	SUPPORT_MODEL_LIST: {
		ko: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.mdx",
		en: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.en.mdx",
		ja: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.ja.mdx",
		zh: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.zh.mdx",
	},
}

export type SupportedLanguage = "ko" | "en" | "ja" | "zh"

// Helper function to get localized URL
export const getLocalizedUrl = (key: keyof typeof CARET_LOCALIZED_URLS, language: SupportedLanguage): string => {
	const urls = CARET_LOCALIZED_URLS[key]
	return urls[language] || urls.en // Fallback to English
}
