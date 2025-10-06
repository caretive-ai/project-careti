export const FEATURE_FLAGS = {
	CUSTOM_INSTRUCTIONS: "custom-instructions",
	// Further flags here
	DEV_ENV_POSTHOG: "dev-env-posthog",
	MULTI_ROOT_WORKSPACE: "multi-root-workspace",
	WORKOS_AUTH: "workos-auth",
} as const

export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS]
