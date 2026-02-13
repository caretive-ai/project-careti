import { getCurrentBrandName } from "@careti/utils/brand-utils" // CARETI MODIFICATION: brand-aware VS Code config scope
import { HostProvider } from "@/hosts/host-provider"

// CARETI MODIFICATION: Safe vscode import for standalone/CLI environments
let vscode: typeof import("vscode") | undefined
try {
	vscode = require("vscode")
} catch {
	// Running in standalone/CLI mode — vscode module unavailable
}
import { getDistinctId } from "@/services/logging/distinctId"
import { PostHogClientProvider } from "@/services/telemetry/providers/posthog/PostHogClientProvider"
import { Setting } from "@/shared/proto/index.host"
import * as pkg from "../../../../package.json"
import { PostHogClientValidConfig } from "../../../shared/services/config/posthog-config"
import { ClineError } from "../ClineError"
import type { ErrorSettings, IErrorProvider } from "./IErrorProvider"

type MinimalPostHog = {
	capture(...args: any[]): void
	shutdown(): Promise<void>
}
type PostHogCtor = new (...args: any[]) => MinimalPostHog

const isTestEnv = process.env.NODE_ENV === "test"

// CARETI MODIFICATION: Avoid ESM translator crashes by skipping posthog-node require during tests,
// and falling back to a minimal stub if the package is unavailable.
const PostHogImpl: PostHogCtor = (() => {
	// Tests: always use a stub to keep mocha/ts-node running without touching posthog-node
	if (isTestEnv) {
		return class {
			constructor(..._args: any[]) {}
			capture() {}
			shutdown() {
				return Promise.resolve()
			}
		}
	}

	try {
		// Prefer CJS require to sidestep ESM module translation issues under ts-node
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const mod = require("posthog-node") as { PostHog: PostHogCtor }
		return mod.PostHog
	} catch (error) {
		// Minimal stub for environments where posthog-node ESM loader is unavailable
		console.warn("[PostHogErrorProvider] Falling back to stub PostHog (non-test)", error)
		return class {
			constructor(..._args: any[]) {}
			capture() {}
			shutdown() {
				return Promise.resolve()
			}
		}
	}
})()

const isDev = process.env.IS_DEV === "true"

/**
 * PostHog implementation of the error provider interface
 * Handles PostHog-specific error tracking and logging
 */
export class PostHogErrorProvider implements IErrorProvider {
	private client: MinimalPostHog
	private errorSettings: ErrorSettings
	// Does not accept shared client
	private readonly isSharedClient = false

	constructor(clientConfig: PostHogClientValidConfig) {
		// Use shared PostHog client if provided, otherwise create a new one
		this.client = new PostHogImpl(clientConfig.errorTrackingApiKey, {
			host: clientConfig.host,
			enableExceptionAutocapture: false, // NOTE: Re-enable it once the api key is set to env var
			before_send: (event: any) => PostHogClientProvider.eventFilter(event),
		})
		// Initialize error settings
		this.errorSettings = {
			enabled: true,
			hostEnabled: true,
			level: "all",
		}
	}

	public async initialize(): Promise<PostHogErrorProvider> {
		// Listen for host telemetry changes
		HostProvider.env.subscribeToTelemetrySettings(
			{},
			{
				onResponse: (event: { isEnabled: Setting }) => {
					const hostEnabled = event.isEnabled === Setting.ENABLED || event.isEnabled === Setting.UNSUPPORTED
					this.errorSettings.hostEnabled = hostEnabled
				},
			},
		)

		const hostSettings = await HostProvider.env.getTelemetrySettings({})
		if (hostSettings.isEnabled === Setting.DISABLED) {
			this.errorSettings.hostEnabled = false
		}

		// Check extension-specific telemetry setting
		// CARETI MODIFICATION: Read telemetry setting from brand namespace, fallback to legacy cline for compatibility
		// Skip when vscode is unavailable (standalone/CLI mode)
		if (vscode) {
			const brandNamespace = getCurrentBrandName().toLowerCase()
			const caretConfig = vscode.workspace.getConfiguration(brandNamespace)
			const clineConfig = vscode.workspace.getConfiguration("cline")
			const telemetrySetting = caretConfig.get("telemetrySetting") ?? clineConfig.get("telemetrySetting")

			if (telemetrySetting === "disabled") {
				this.errorSettings.enabled = false
			}
		}

		this.errorSettings.level = await this.getErrorLevel()
		return this
	}

	public logException(error: Error | ClineError, properties: Record<string, unknown> = {}): void {
		if (!this.isEnabled() || this.errorSettings.level === "off") {
			return
		}

		const errorDetails = {
			message: error.message,
			stack: error.stack,
			name: error.name,
			extension_version: pkg.version,
			is_dev: isDev,
			...properties,
		}

		if (error instanceof ClineError) {
			Object.assign(errorDetails, {
				modelId: error.modelId,
				providerId: error.providerId,
				serialized_error: error.serialize(),
			})
		}

		this.client.capture({
			distinctId: this.distinctId,
			event: "extension.error",
			properties: {
				error_type: "exception",
				...errorDetails,
				timestamp: new Date().toISOString(),
			},
		})

		console.error("[PostHogErrorProvider] Logging exception", error)
	}

	public logMessage(
		message: string,
		level: "error" | "warning" | "log" | "debug" | "info" = "log",
		properties: Record<string, unknown> = {},
	): void {
		if (!this.isEnabled() || this.errorSettings.level === "off") {
			return
		}

		// Filter messages based on error level
		if (this.errorSettings.level === "error" && level !== "error") {
			return
		}

		this.client.capture({
			distinctId: this.distinctId,
			event: "extension.message",
			properties: {
				message: message.substring(0, 500), // Truncate long messages
				level,
				extension_version: pkg.version,
				is_dev: isDev,
				timestamp: new Date().toISOString(),
				...properties,
			},
		})
	}

	public isEnabled(): boolean {
		return this.errorSettings.enabled && this.errorSettings.hostEnabled
	}

	public getSettings(): ErrorSettings {
		return { ...this.errorSettings }
	}

	private async getErrorLevel(): Promise<ErrorSettings["level"]> {
		const hostSettings = await HostProvider.env.getTelemetrySettings({})
		if (hostSettings.isEnabled === Setting.DISABLED) {
			return "off"
		}
		// CARETI MODIFICATION: Skip vscode config in standalone/CLI mode
		if (!vscode) {
			return "all"
		}
		const config = vscode.workspace.getConfiguration("telemetry")
		return config?.get<ErrorSettings["level"]>("telemetryLevel") || "all"
	}

	private get distinctId(): string {
		return getDistinctId()
	}

	public async dispose(): Promise<void> {
		// Only shut down the client if it's not shared (we own it)
		if (!this.isSharedClient) {
			await this.client.shutdown().catch((error) => console.error("Error shutting down PostHog client:", error))
		}
	}
}
