import type { Environment } from "../../../src/config"

/**
 * Environment별 색상 헬퍼 (cline v3.38.1 동작 일치)
 */
export const getEnvironmentColor = (environment: Environment | undefined, type: "primary" | "border" = "primary"): string => {
	if (type === "border") {
		return environment === "local"
			? "var(--vscode-activityWarningBadge-background)" // yellow/orange
			: environment === "staging"
				? "var(--vscode-focusBorder)" // blue
				: "var(--vscode-editorGroup-border)"
	}

	return environment === "local"
		? "var(--vscode-activityWarningBadge-background)"
		: environment === "staging"
			? "var(--vscode-focusBorder)"
			: "var(--vscode-foreground)"
}

export function getClineEnvironmentClassname(environment: Environment | undefined, type = "text") {
	if (type === "border") {
		switch (environment) {
			case "local":
				return "border-(--vscode-activityWarningBadge-background)"
			case "staging":
				return "border-(--vscode-focusBorder)"
			case "production":
			default:
				return "border-(--vscode-editorGroup-border)"
		}
	}

	switch (environment) {
		case "local":
			return "var(--vscode-activityWarningBadge-background)"
		case "staging":
			return "var(--vscode-focusBorder)"
		case "production":
		default:
			return "var(--vscode-foreground)"
	}
}
