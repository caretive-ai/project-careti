// CARETI MODIFICATION: URL constants for Careti WelcomeView links and external resources
export const CARET_URLS = {
	// GitHub Repository
	GITHUB_REPOSITORY: "https://github.com/aicoding-careti/careti",
	CARET_GITHUB: "https://github.com/aicoding-careti/careti",

	// Company and Service
	CARETIVE_COMPANY: "https://caretive.ai",
	CARET_SERVICE: "https://careti.ai",

	// Account Related
	CARET_APP_CREDITS: "https://careti.ai/credits",
	CARET_APP_CREDITS_BUY: "https://careti.ai/credits/#buy",

	// BizRouter
	BIZROUTER_DOCS: "https://bizrouter.ai/docs",
	BIZROUTER_MODELS: "https://bizrouter.ai/docs/models",

	// Upstage
	UPSTAGE_CORP: "https://www.upstage.ai/",
	UPSTAGE_API_DOCS: "https://console.upstage.ai/api/chat",

	// Naver Cloud
	NAVER_CLOUD_CORP: "https://www.navercloudcorp.com/",
	CLOVA_AI: "https://clova.ai/",
} as const

// Language-specific URLs for educational content and documentation
export const CARET_LOCALIZED_URLS = {
	CARETIVE_PRIVACY: {
		ko: "https://caretive.ai/privacy.ko.html",
		en: "https://caretive.ai/privacy.en.html",
		ja: "https://caretive.ai/privacy.en.html",
		zh: "https://caretive.ai/privacy.en.html",
	},
	GEMINI_CREDIT_GUIDE: {
		ko: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/posting/ko/gemini-credit-guide.ko.md",
		en: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/posting/en/gemini-credit-guide.en.md",
		ja: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/posting/ja/gemini-credit-guide.ja.md",
		zh: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/posting/zh/gemini-credit-guide.zh.md",
	},
	SUPPORT_MODEL_LIST: {
		ko: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/development/support-model-list.mdx",
		en: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/development/support-model-list.en.mdx",
		ja: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/development/support-model-list.en.mdx",
		zh: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/development/support-model-list.en.mdx",
	},
	REMOTE_MCP_SERVER_DOCS: {
		ko: "https://docs.careti.ai/ko/mcp/connecting-to-a-remote-server",
		en: "https://docs.careti.ai/en/mcp/connecting-to-a-remote-server",
		ja: "https://docs.careti.ai/ja/mcp/connecting-to-a-remote-server",
		zh: "https://docs.careti.ai/zh/mcp/connecting-to-a-remote-server",
	},
	LOCAL_MCP_SERVER_DOCS: {
		ko: "https://docs.careti.ai/ko/mcp/configuring-mcp-servers#editing-mcp-settings-files",
		en: "https://docs.careti.ai/en/mcp/configuring-mcp-servers#editing-mcp-settings-files",
		ja: "https://docs.careti.ai/ja/mcp/configuring-mcp-servers#editing-mcp-settings-files",
		zh: "https://docs.careti.ai/zh/mcp/configuring-mcp-servers#editing-mcp-settings-files",
	},
	CARET_GITHUB_DETAILED: {
		ko: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/ko/README.md",
		en: "https://github.com/aicoding-careti/careti/blob/main/README.md",
		ja: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/ja/README.md",
		zh: "https://github.com/aicoding-careti/careti/blob/main/careti-docs/zh/README.md",
	},
	CARETIVE_TERMS: {
		ko: "https://caretive.ai/terms.ko.html",
		en: "https://caretive.ai/terms.en.html",
		ja: "https://caretive.ai/terms.en.html",
		zh: "https://caretive.ai/terms.en.html",
	},
	CARET_DOCS_MANUAL: {
		ko: "https://docs.careti.ai/ko/getting-started/what-is-careti",
		en: "https://docs.careti.ai/en/getting-started/what-is-careti",
		ja: "https://docs.careti.ai/ja/getting-started/what-is-careti",
		zh: "https://docs.careti.ai/zh/getting-started/what-is-careti",
	},
	TERMINAL_QUICK_FIXES: {
		ko: "https://docs.careti.ai/ko/troubleshooting/terminal-quick-fixes",
		en: "https://docs.careti.ai/en/troubleshooting/terminal-quick-fixes",
		ja: "https://docs.careti.ai/ja/troubleshooting/terminal-quick-fixes",
		zh: "https://docs.careti.ai/zh/troubleshooting/terminal-quick-fixes",
	},
	TERMINAL_TROUBLESHOOTING_GUIDE: {
		ko: "https://docs.careti.ai/ko/troubleshooting/terminal-integration-guide",
		en: "https://docs.careti.ai/en/troubleshooting/terminal-integration-guide",
		ja: "https://docs.careti.ai/ja/troubleshooting/terminal-integration-guide",
		zh: "https://docs.careti.ai/zh/troubleshooting/terminal-integration-guide",
	},
	AUTO_COMPACT_GUIDE: {
		ko: "https://docs.careti.ai/ko/features/auto-compact",
		en: "https://docs.careti.ai/en/features/auto-compact",
		ja: "https://docs.careti.ai/ja/features/auto-compact",
		zh: "https://docs.careti.ai/zh/features/auto-compact",
	},
} as const

export type CaretUrlKey = keyof typeof CARET_URLS
export type CaretLocalizedUrlKey = keyof typeof CARET_LOCALIZED_URLS
export type SupportedLanguage = "ko" | "en" | "ja" | "zh" | "fr" | "de" | "ru"

// Helper function to get localized URL
export function getLocalizedUrl(key: CaretLocalizedUrlKey, language: SupportedLanguage = "ko"): string {
	const urlMap = CARET_LOCALIZED_URLS[key]
	// fr, de, ru는 URL이 없으므로 en으로 fallback, 그 외는 ko로 fallback
	const fallbackLang = ["fr", "de", "ru"].includes(language) ? "en" : language
	return (urlMap as Record<string, string>)[fallbackLang] || urlMap.ko
}

// Helper function to get general URL
export function getUrl(key: CaretUrlKey): string {
	return CARET_URLS[key]
}
