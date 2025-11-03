// CARET MODIFICATION: URL constants for Caret WelcomeView links and external resources
export const CARET_URLS = {
	// GitHub Repository
	GITHUB_REPOSITORY: "https://github.com/aicoding-caret/caret",
	CARET_GITHUB: "https://github.com/aicoding-caret/caret",

	// Company and Service
	CARETIVE_COMPANY: "https://caretive.ai",
	CARET_SERVICE: "https://caret.team",

	// Account Related
	CARET_APP_CREDITS: "https://caret.team/credits",
	CARET_APP_CREDITS_BUY: "https://caret.team/credits/#buy",

	// BizRouter
	BIZROUTER_DOCS: "https://bizrouter.ai/docs",
	BIZROUTER_MODELS: "https://bizrouter.ai/docs/models"
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
		ko: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/posting/ko/gemini-credit-guide.ko.md",
		en: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/posting/en/gemini-credit-guide.en.md",
		ja: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/posting/ja/gemini-credit-guide.ja.md",
		zh: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/posting/zh/gemini-credit-guide.zh.md",
	},
	SUPPORT_MODEL_LIST: {
		ko: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.mdx",
		en: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.en.mdx",
		ja: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.en.mdx",
		zh: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.en.mdx",
	},
	REMOTE_MCP_SERVER_DOCS: {
		ko: "https://docs.caret.team/ko/mcp/connecting-to-a-remote-server",
		en: "https://docs.caret.team/en/mcp/connecting-to-a-remote-server",
		ja: "https://docs.caret.team/ja/mcp/connecting-to-a-remote-server",
		zh: "https://docs.caret.team/zh/mcp/connecting-to-a-remote-server",
	},
	LOCAL_MCP_SERVER_DOCS: {
		ko: "https://docs.caret.team/ko/mcp/configuring-mcp-servers#editing-mcp-settings-files",
		en: "https://docs.caret.team/en/mcp/configuring-mcp-servers#editing-mcp-settings-files",
		ja: "https://docs.caret.team/ja/mcp/configuring-mcp-servers#editing-mcp-settings-files",
		zh: "https://docs.caret.team/zh/mcp/configuring-mcp-servers#editing-mcp-settings-files",
	},
	CARET_GITHUB_DETAILED: {
		ko: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/ko/README.md",
		en: "https://github.com/aicoding-caret/caret/blob/main/README.md",
		ja: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/ja/README.md",
		zh: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/zh/README.md",
	},
	CARETIVE_TERMS: {
		ko: "https://caretive.ai/terms.ko.html",
		en: "https://caretive.ai/terms.en.html",
		ja: "https://caretive.ai/terms.en.html",
		zh: "https://caretive.ai/terms.en.html",
	},	
	CARET_DOCS_MANUAL: {
		ko: "https://docs.caret.team/ko/getting-started/what-is-caret",
		en: "https://docs.caret.team/en/getting-started/what-is-caret",
		ja: "https://docs.caret.team/ja/getting-started/what-is-caret",
		zh: "https://docs.caret.team/zh/getting-started/what-is-caret",
	},
	TERMINAL_QUICK_FIXES: {
		ko: "https://docs.caret.team/ko/troubleshooting/terminal-quick-fixes",
		en: "https://docs.caret.team/en/troubleshooting/terminal-quick-fixes",
		ja: "https://docs.caret.team/ja/troubleshooting/terminal-quick-fixes",
		zh: "https://docs.caret.team/zh/troubleshooting/terminal-quick-fixes",
	},
	TERMINAL_TROUBLESHOOTING_GUIDE: {
		ko: "https://docs.caret.team/ko/troubleshooting/terminal-integration-guide",
		en: "https://docs.caret.team/en/troubleshooting/terminal-integration-guide",
		ja: "https://docs.caret.team/ja/troubleshooting/terminal-integration-guide",
		zh: "https://docs.caret.team/zh/troubleshooting/terminal-integration-guide",
	},
	AUTO_COMPACT_GUIDE: {
		ko: "https://docs.caret.team/ko/features/auto-compact",
		en: "https://docs.caret.team/en/features/auto-compact",
		ja: "https://docs.caret.team/ja/features/auto-compact",
		zh: "https://docs.caret.team/zh/features/auto-compact",
	},
} as const

export type CaretUrlKey = keyof typeof CARET_URLS
export type CaretLocalizedUrlKey = keyof typeof CARET_LOCALIZED_URLS
export type SupportedLanguage = "ko" | "en" | "ja" | "zh"

// Helper function to get localized URL
export function getLocalizedUrl(key: CaretLocalizedUrlKey, language: SupportedLanguage = "ko"): string {
	const urlMap = CARET_LOCALIZED_URLS[key]
	return urlMap[language] || urlMap.ko // Fallback to Korean
}

// Helper function to get general URL
export function getUrl(key: CaretUrlKey): string {
	return CARET_URLS[key]
}
