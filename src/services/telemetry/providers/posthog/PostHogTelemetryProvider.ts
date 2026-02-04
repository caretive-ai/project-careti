import { PostHog } from "posthog-node"
import * as vscode from "vscode"
import { HostProvider } from "@/hosts/host-provider"
import { Setting } from "@/shared/proto/index.host"
import type { ClineAccountUserInfo } from "../../../auth/AuthService"
import type { ITelemetryProvider, TelemetryProperties, TelemetrySettings } from "../ITelemetryProvider"
// CARETI MODIFICATION: Import OpenTelemetry provider for redirect
import { OpenTelemetryTelemetryProvider } from "../opentelemetry/OpenTelemetryTelemetryProvider"

/**
 * PostHog implementation of the telemetry provider interface
 * Handles PostHog-specific analytics tracking
 *
 * CARETI MODIFICATION: All telemetry is redirected to OpenTelemetry.
 * PostHog client is kept for API compatibility but not used.
 */
export class PostHogTelemetryProvider implements ITelemetryProvider {
	private client: PostHog | null = null
	private telemetrySettings: TelemetrySettings
	private isSharedClient: boolean
	// CARETI MODIFICATION: OpenTelemetry provider for redirect
	private otelProvider: OpenTelemetryTelemetryProvider

	constructor(sharedClient?: PostHog) {
		this.isSharedClient = !!sharedClient

		// CARETI MODIFICATION: Don't create PostHog client, use OpenTelemetry instead
		// Keep client reference for API compatibility
		this.client = sharedClient ?? null
		this.otelProvider = new OpenTelemetryTelemetryProvider()

		// Initialize telemetry settings
		this.telemetrySettings = {
			extensionEnabled: true,
			hostEnabled: true,
			level: "all",
		}
	}
	public async initialize(): Promise<PostHogTelemetryProvider> {
		// CARETI MODIFICATION: Initialize OpenTelemetry provider
		await this.otelProvider.initialize()

		// Listen for host telemetry changes
		HostProvider.env.subscribeToTelemetrySettings(
			{},
			{
				onResponse: (event: { isEnabled: Setting }) => {
					const hostEnabled = event.isEnabled === Setting.ENABLED || event.isEnabled === Setting.UNSUPPORTED
					this.telemetrySettings.hostEnabled = hostEnabled
				},
			},
		)

		// Check host-specific telemetry setting (e.g. VS Code setting)
		const hostSettings = await HostProvider.env.getTelemetrySettings({})
		if (hostSettings.isEnabled === Setting.DISABLED) {
			this.telemetrySettings.hostEnabled = false
		}

		this.telemetrySettings.level = await this.getTelemetryLevel()
		return this
	}

	public log(event: string, properties?: TelemetryProperties): void {
		// CARETI MODIFICATION: Redirect to OpenTelemetry
		this.otelProvider.log(event, properties)
	}

	public logRequired(event: string, properties?: TelemetryProperties): void {
		// CARETI MODIFICATION: Redirect to OpenTelemetry
		this.otelProvider.logRequired(event, properties)
	}

	public identifyUser(userInfo: ClineAccountUserInfo, properties: TelemetryProperties = {}): void {
		// CARETI MODIFICATION: Redirect to OpenTelemetry
		this.otelProvider.identifyUser(userInfo, properties)
	}

	// Set extension-specific telemetry setting - opt-in/opt-out via UI
	public setOptIn(optIn: boolean): void {
		// CARETI MODIFICATION: Redirect to OpenTelemetry
		this.otelProvider.setOptIn(optIn)
		this.telemetrySettings.extensionEnabled = optIn
	}

	public isEnabled(): boolean {
		// CARETI MODIFICATION: Use OpenTelemetry's isEnabled
		return this.otelProvider.isEnabled()
	}

	public getSettings(): TelemetrySettings {
		// CARETI MODIFICATION: Use OpenTelemetry's settings
		return this.otelProvider.getSettings()
	}

	/**
	 * CARETI MODIFICATION: Metrics are now supported via OpenTelemetry.
	 */
	public incrementCounter(name: string, value: number = 1, attributes?: TelemetryProperties): void {
		this.otelProvider.incrementCounter(name, value, attributes)
	}

	public recordHistogram(name: string, value: number, attributes?: TelemetryProperties): void {
		this.otelProvider.recordHistogram(name, value, attributes)
	}

	public async dispose(): Promise<void> {
		// CARETI MODIFICATION: Dispose OpenTelemetry provider
		await this.otelProvider.dispose()
	}

	/**
	 * Get the current telemetry level from VS Code settings
	 */
	private async getTelemetryLevel(): Promise<TelemetrySettings["level"]> {
		const hostSettings = await HostProvider.env.getTelemetrySettings({})
		if (hostSettings.isEnabled === Setting.DISABLED) {
			return "off"
		}
		const config = vscode.workspace.getConfiguration("telemetry")
		return config?.get<TelemetrySettings["level"]>("telemetryLevel") || "all"
	}
}
