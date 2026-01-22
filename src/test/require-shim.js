// CARETI MODIFICATION: Test shim to bypass ESM loader issues for specific modules
const Module = require("module")
const path = require("path")
const originalResolveFilename = Module._resolveFilename

Module._resolveFilename = function (request, parent, isMain, options) {
	// Stub shell.ts to avoid ESM translator crashes under ts-node
	if (request.includes("src/utils/shell")) {
		return path.join(__dirname, "shims", "shell-stub.js")
	}
	// Stub PostHog/Telemetry providers to avoid ESM loader
	if (request.includes("PostHogErrorProvider") || request.includes("PostHogTelemetryProvider")) {
		return path.join(__dirname, "shims", "posthog-stub.js")
	}
	if (request.includes("OpenTelemetryTelemetryProvider")) {
		return path.join(__dirname, "shims", "otel-stub.js")
	}
	if (request.includes("hostbridge/workspace/getWorkspacePaths")) {
		return path.join(__dirname, "shims", "workspace-paths-stub.js")
	}
	return originalResolveFilename.call(this, request, parent, isMain, options)
}
