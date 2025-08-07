// CARET MODIFICATION: Caret 전용 PostHog 설정으로 변경
// 원본 백업: posthog-config-ts.cline
// Caret은 자체 텔레메트리 시스템을 사용하므로 PostHog 비활성화
const posthogProdConfig = {
	apiKey: process.env.POSTHOG_API_KEY || "",
	host: process.env.POSTHOG_HOST || "", // self-hosted PostHog (e.g., https://posthog.caret.team)
	uiHost: process.env.POSTHOG_UIHOST || "", // optional UI host
}

// Public PostHog key for Development Environment project
const posthogDevEnvConfig = {
	apiKey: process.env.POSTHOG_API_KEY || "phc_uY24EJXNBcc9kwO1K8TJUl5hPQntGM6LL1Mtrz0CBD4",
	host: process.env.POSTHOG_HOST || "https://data.cline.bot",
	uiHost: process.env.POSTHOG_UIHOST || "https://us.i.posthog.com",
}

export const posthogConfig = process.env.IS_DEV === "true" ? posthogDevEnvConfig : posthogProdConfig
