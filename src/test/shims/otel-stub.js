// CARETI MODIFICATION: test stub for OpenTelemetry provider
class OpenTelemetryTelemetryProvider {
	async initialize() {
		return this
	}
	track() {}
	flush() {
		return Promise.resolve()
	}
}
module.exports = { OpenTelemetryTelemetryProvider, default: OpenTelemetryTelemetryProvider }
