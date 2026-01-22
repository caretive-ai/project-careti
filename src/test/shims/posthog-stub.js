// CARETI MODIFICATION: test stub for PostHog providers to avoid ESM loader issues
class PostHogErrorProvider {
	constructor() {
		this.errorSettings = { enabled: false, hostEnabled: false, level: "off" }
		this.isSharedClient = false
	}
	async initialize() {
		return this
	}
	logException() {}
	logMessage() {}
	isEnabled() {
		return false
	}
	getSettings() {
		return { ...this.errorSettings }
	}
	async dispose() {
		return
	}
}
class PostHogTelemetryProvider {
	async initialize() {
		return this
	}
	track() {}
	flush() {
		return Promise.resolve()
	}
}
module.exports = { PostHogErrorProvider, PostHogTelemetryProvider, default: PostHogErrorProvider }
