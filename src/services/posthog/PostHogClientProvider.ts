// CARET MODIFICATION: PostHog completely disabled (backup: PostHogClientProvider-ts.cline)
// Since Caret does not use PostHog, replaced with dummy client
import { posthogConfig } from "@/shared/services/config/posthog-config"

// Dummy client that mimics PostHog interface
class DummyPostHogClient {
	capture() {
		/* no-op */
	}
	identify() {
		/* no-op */
	}
	alias() {
		/* no-op */
	}
	optIn() {
		/* no-op */
	}
	optOut() {
		/* no-op */
	}
	async shutdown() {
		/* no-op */
	}
}

class PostHogClientProvider {
	private static instance: PostHogClientProvider
	private client: any

	private constructor() {
		// CARET MODIFICATION: Check env for PostHog settings, use dummy client if not available
		if (posthogConfig.apiKey && posthogConfig.host) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { PostHog } = require("posthog-node")
			this.client = new PostHog(posthogConfig.apiKey, { host: posthogConfig.host })
			console.log(`[Caret] PostHog enabled at ${posthogConfig.host}`)
		} else {
			console.log("[Caret] PostHog disabled - using dummy client")
			this.client = new DummyPostHogClient()
		}
	}

	public static getInstance(): PostHogClientProvider {
		if (!PostHogClientProvider.instance) {
			PostHogClientProvider.instance = new PostHogClientProvider()
		}
		return PostHogClientProvider.instance
	}

	public getClient(): DummyPostHogClient {
		return this.client
	}

	public async shutdown(): Promise<void> {
		await this.client.shutdown()
	}
}

export const posthogClientProvider = PostHogClientProvider.getInstance()
