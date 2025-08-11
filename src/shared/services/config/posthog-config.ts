// CARET MODIFICATION: Caret ?�용 PostHog ?�정?�로 변�?
// ?�본 백업: posthog-config-ts.cline
// Caret?� ?�체 ?�레메트�??�스?�을 ?�용?��?�?PostHog 비활?�화
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
