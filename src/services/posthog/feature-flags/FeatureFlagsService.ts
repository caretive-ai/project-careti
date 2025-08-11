// CARET MODIFICATION: PostHog ?�전 비활?�화 (백업: FeatureFlagsService-ts.cline)
import { posthogClientProvider } from "../PostHogClientProvider"

class FeatureFlagsService {
	private static instance: FeatureFlagsService
	private readonly client: any // DummyPostHogClient

	private constructor() {
		// Get the shared dummy client (PostHog disabled in Caret)
		this.client = posthogClientProvider.getClient()
		console.log("[Caret] FeatureFlagsService using dummy PostHog client")
	}

	public static getInstance(): FeatureFlagsService {
		if (!FeatureFlagsService.instance) {
			FeatureFlagsService.instance = new FeatureFlagsService()
		}
		return FeatureFlagsService.instance
	}

	/**
	 * Check if a feature flag is enabled
	 * @param flagName The feature flag key
	 * @returns Boolean indicating if the feature is enabled
	 */
	public async isFeatureFlagEnabled(flagName: string): Promise<boolean> {
		// CARET MODIFICATION: PostHog 비활?�화�??�해 모든 feature flag??false 반환
		console.log(`[Caret] Feature flag ${flagName} disabled (PostHog not used)`)
		return false
	}
}

export const featureFlagsService = FeatureFlagsService.getInstance()
