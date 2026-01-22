import { buildApiHandler } from "@core/api"
import { Empty } from "@shared/proto/cline/common"
import {
	PlanActMode,
	McpDisplayMode as ProtoMcpDisplayMode,
	OpenaiReasoningEffort as ProtoOpenaiReasoningEffort,
	UpdateSettingsRequest,
} from "@shared/proto/cline/state"
import { convertProtoToApiProvider } from "@shared/proto-conversions/models/api-configuration-conversion"
import { OpenaiReasoningEffort } from "@shared/storage/types"
import { TelemetrySetting } from "@shared/TelemetrySetting"
import { HostProvider } from "@/hosts/host-provider"
import { TerminalInfo } from "@/integrations/terminal/TerminalRegistry"
import { McpDisplayMode } from "@/shared/McpDisplayMode"
import { ShowMessageType } from "@/shared/proto/host/window"
import { telemetryService } from "../../../services/telemetry"
import { BrowserSettings as SharedBrowserSettings } from "../../../shared/BrowserSettings"
import { Controller } from ".."

/**careti-docs/merging/v3.38.1/attempt-2-claude-review.md
 * Updates multiple extension settings in a single request
 * @param controller The controller instance
 * @param request The request containing the settings to update
 * @returns An empty response
 */
export async function updateSettings(controller: Controller, request: UpdateSettingsRequest): Promise<Empty> {
	try {
		if (request.apiConfiguration) {
			const protoApiConfiguration = request.apiConfiguration

			const convertedApiConfigurationFromProto = {
				...protoApiConfiguration,
				// Convert proto ApiProvider enums to native string types
				planModeApiProvider: protoApiConfiguration.planModeApiProvider
					? convertProtoToApiProvider(protoApiConfiguration.planModeApiProvider)
					: undefined,
				actModeApiProvider: protoApiConfiguration.actModeApiProvider
					? convertProtoToApiProvider(protoApiConfiguration.actModeApiProvider)
					: undefined,
			}

			controller.stateManager.setApiConfiguration(convertedApiConfigurationFromProto)

			if (controller.task) {
				const currentMode = controller.stateManager.getGlobalSettingsKey("mode")
				const apiConfigForHandler = {
					...convertedApiConfigurationFromProto,
					ulid: controller.task.ulid,
				}
				controller.task.api = buildApiHandler(apiConfigForHandler, currentMode)
			}
		}

		// Update telemetry setting
		if (request.telemetrySetting) {
			await controller.updateTelemetrySetting(request.telemetrySetting as TelemetrySetting)
		}

		// Update plan/act separate models setting
		if (request.planActSeparateModelsSetting !== undefined) {
			controller.stateManager.setGlobalState("planActSeparateModelsSetting", request.planActSeparateModelsSetting)
		}

		// Update checkpoints setting
		if (request.enableCheckpointsSetting !== undefined) {
			controller.stateManager.setGlobalState("enableCheckpointsSetting", request.enableCheckpointsSetting)
		}

		// Update MCP marketplace setting
		if (request.mcpMarketplaceEnabled !== undefined) {
			controller.stateManager.setGlobalState("mcpMarketplaceEnabled", request.mcpMarketplaceEnabled)
		}

		// Update MCP responses collapsed setting
		if (request.mcpResponsesCollapsed !== undefined) {
			controller.stateManager.setGlobalState("mcpResponsesCollapsed", request.mcpResponsesCollapsed)
		}

		// Update MCP display mode setting
		if (request.mcpDisplayMode !== undefined) {
			// Convert proto enum to string type
			let displayMode: McpDisplayMode
			switch (request.mcpDisplayMode) {
				case ProtoMcpDisplayMode.RICH:
					displayMode = "rich"
					break
				case ProtoMcpDisplayMode.PLAIN:
					displayMode = "plain"
					break
				case ProtoMcpDisplayMode.MARKDOWN:
					displayMode = "markdown"
					break
				default:
					throw new Error(`Invalid MCP display mode value: ${request.mcpDisplayMode}`)
			}
			controller.stateManager.setGlobalState("mcpDisplayMode", displayMode)
		}

		if (request.mode !== undefined) {
			const mode = request.mode === PlanActMode.PLAN ? "plan" : "act"
			controller.stateManager.setGlobalState("mode", mode)
			// CARETI MODIFICATION: update caretModeSystem alongside plan/act mode
			if (request.modeSystem !== undefined) {
				controller.stateManager.setGlobalState("caretModeSystem", request.modeSystem as any)
			}
		}

		if (request.openaiReasoningEffort !== undefined) {
			// Convert proto enum to string type
			let reasoningEffort: OpenaiReasoningEffort
			switch (request.openaiReasoningEffort) {
				case ProtoOpenaiReasoningEffort.LOW:
					reasoningEffort = "low"
					break
				case ProtoOpenaiReasoningEffort.MEDIUM:
					reasoningEffort = "medium"
					break
				case ProtoOpenaiReasoningEffort.HIGH:
					reasoningEffort = "high"
					break
				case ProtoOpenaiReasoningEffort.MINIMAL:
					reasoningEffort = "minimal"
					break
				default:
					throw new Error(`Invalid OpenAI reasoning effort value: ${request.openaiReasoningEffort}`)
			}

			controller.stateManager.setGlobalState("openaiReasoningEffort", reasoningEffort)
		}

		if (request.preferredLanguage !== undefined) {
			controller.stateManager.setGlobalState("preferredLanguage", request.preferredLanguage)
		}

		// Update terminal timeout setting
		if (request.shellIntegrationTimeout !== undefined) {
			controller.stateManager.setGlobalState("shellIntegrationTimeout", Number(request.shellIntegrationTimeout))
		}

		// Update terminal reuse setting
		if (request.terminalReuseEnabled !== undefined) {
			controller.stateManager.setGlobalState("terminalReuseEnabled", request.terminalReuseEnabled)
		}

		// Update terminal output line limit
		if (request.terminalOutputLineLimit !== undefined) {
			controller.stateManager.setGlobalState("terminalOutputLineLimit", Number(request.terminalOutputLineLimit))
		}

		// Update strict plan mode setting
		if (request.strictPlanModeEnabled !== undefined) {
			controller.stateManager.setGlobalState("strictPlanModeEnabled", request.strictPlanModeEnabled)
		}
		// Update yolo mode setting
		if (request.yoloModeToggled !== undefined) {
			if (controller.task) {
				telemetryService.captureYoloModeToggle(controller.task.ulid, request.yoloModeToggled)
			}
			controller.stateManager.setGlobalState("yoloModeToggled", request.yoloModeToggled)
		}

		if (request.dictationSettings !== undefined) {
			// Convert from protobuf format (snake_case) to TypeScript format (camelCase)
			const dictationSettings = {
				// CARETI MODIFICATION: Default featureEnabled to false (voice feature removed)
				featureEnabled: request.dictationSettings.featureEnabled ?? false,
				dictationEnabled: request.dictationSettings.dictationEnabled ?? true,
				dictationLanguage: request.dictationSettings.dictationLanguage ?? "en",
			}
			controller.stateManager.setGlobalState("dictationSettings", dictationSettings)
		}
		// Update auto-condense setting
		if (request.useAutoCondense !== undefined) {
			if (controller.task) {
				telemetryService.captureAutoCondenseToggle(
					controller.task.ulid,
					request.useAutoCondense,
					controller.task.api.getModel().id,
				)
			}
			controller.stateManager.setGlobalState("useAutoCondense", request.useAutoCondense)
		}

		// Update focus chain settings
		if (request.focusChainSettings !== undefined) {
			{
				const currentSettings = controller.stateManager.getGlobalSettingsKey("focusChainSettings")
				const wasEnabled = currentSettings?.enabled ?? false
				const isEnabled = request.focusChainSettings.enabled

				const focusChainSettings = {
					enabled: isEnabled,
					remindClineInterval: request.focusChainSettings.remindClineInterval,
				}
				controller.stateManager.setGlobalState("focusChainSettings", focusChainSettings)

				// Capture telemetry when setting changes
				if (wasEnabled !== isEnabled) {
					telemetryService.captureFocusChainToggle(isEnabled)
				}
			}
		}

		// Update custom prompt choice
		if (request.customPrompt !== undefined) {
			const value = request.customPrompt === "compact" ? "compact" : undefined
			controller.stateManager.setGlobalState("customPrompt", value)
		}

		// Update browser settings
		if (request.browserSettings !== undefined) {
			// Get current browser settings to preserve fields not in the request
			const currentSettings = controller.stateManager.getGlobalSettingsKey("browserSettings")

			// Convert from protobuf format to shared format, merging with existing settings
			const newBrowserSettings: SharedBrowserSettings = {
				...currentSettings, // Start with existing settings (and defaults)
				viewport: {
					// Apply updates from request
					width: request.browserSettings.viewport?.width || currentSettings.viewport.width,
					height: request.browserSettings.viewport?.height || currentSettings.viewport.height,
				},
				// Explicitly handle optional boolean and string fields from the request
				remoteBrowserEnabled:
					request.browserSettings.remoteBrowserEnabled === undefined
						? currentSettings.remoteBrowserEnabled
						: request.browserSettings.remoteBrowserEnabled,
				remoteBrowserHost:
					request.browserSettings.remoteBrowserHost === undefined
						? currentSettings.remoteBrowserHost
						: request.browserSettings.remoteBrowserHost,
				chromeExecutablePath:
					// If chromeExecutablePath is explicitly in the request (even as ""), use it.
					// Otherwise, fall back to mergedWithDefaults.
					"chromeExecutablePath" in request.browserSettings
						? request.browserSettings.chromeExecutablePath
						: currentSettings.chromeExecutablePath,
				disableToolUse:
					request.browserSettings.disableToolUse === undefined
						? currentSettings.disableToolUse
						: request.browserSettings.disableToolUse,
				customArgs:
					"customArgs" in request.browserSettings ? request.browserSettings.customArgs : currentSettings.customArgs,
			}

			// Update global state with new settings
			controller.stateManager.setGlobalState("browserSettings", newBrowserSettings)
		}

		// Update default terminal profile
		if (request.defaultTerminalProfile !== undefined) {
			const profileId = request.defaultTerminalProfile

			// Update the terminal profile in the state
			controller.stateManager.setGlobalState("defaultTerminalProfile", profileId)

			let closedCount = 0
			let busyTerminals: TerminalInfo[] = []

			// Update the terminal manager of the current task if it exists
			if (controller.task) {
				// Call the updated setDefaultTerminalProfile method that returns closed terminal info
				const result = controller.task.terminalManager.setDefaultTerminalProfile(profileId)
				closedCount = result.closedCount
				busyTerminals = result.busyTerminals

				// Show information message if terminals were closed
				if (closedCount > 0) {
					const message = `Closed ${closedCount} ${closedCount === 1 ? "terminal" : "terminals"} with different profile.`
					HostProvider.window.showMessage({
						type: ShowMessageType.INFORMATION,
						message,
					})
				}

				// Show warning if there are busy terminals that couldn't be closed
				if (busyTerminals.length > 0) {
					const message =
						`${busyTerminals.length} busy ${busyTerminals.length === 1 ? "terminal has" : "terminals have"} a different profile. ` +
						`Close ${busyTerminals.length === 1 ? "it" : "them"} to use the new profile for all commands.`
					HostProvider.window.showMessage({
						type: ShowMessageType.WARNING,
						message,
					})
				}
			}
		}

		if (request.autoCondenseThreshold !== undefined) {
			const threshold = Math.min(1, Math.max(0, request.autoCondenseThreshold)) // Clamp to 0-1 range
			controller.stateManager.setGlobalState("autoCondenseThreshold", threshold)
		}

		if (request.imageGenerationAspectRatio !== undefined) {
			const ratio = (request.imageGenerationAspectRatio || "").trim()
			controller.stateManager.setGlobalState("imageGenerationAspectRatio", ratio || undefined)
		}

		if (request.imageGenerationSize !== undefined) {
			const size = (request.imageGenerationSize || "").trim()
			controller.stateManager.setGlobalState("imageGenerationSize", size || undefined)
		}

		// CARETI MODIFICATION: Image analysis model selection
		if (request.imageAnalysisModel !== undefined) {
			const model = (request.imageAnalysisModel || "").trim()
			controller.stateManager.setGlobalState("imageAnalysisModel", model || undefined)
		}

		if (request.multiRootEnabled !== undefined) {
			controller.stateManager.setGlobalState("multiRootEnabled", !!request.multiRootEnabled)
		}

		if (request.hooksEnabled !== undefined) {
			const isEnabled = !!request.hooksEnabled
			controller.stateManager.setGlobalState("hooksEnabled", isEnabled)
		}

		// CARETI MODIFICATION: Prevent enabling subagents in Careti mode
		const effectiveModeSystem = request.modeSystem ?? controller.stateManager.getGlobalStateKey("caretModeSystem") ?? "careti"

		if (request.subagentsEnabled !== undefined) {
			// CARETI MODIFICATION: block enabling subagents on unsupported platforms (Windows)
			if (request.subagentsEnabled && process.platform !== "darwin" && process.platform !== "linux") {
				throw new Error("CLI subagents are only supported on macOS and Linux platforms")
			}
			if (request.subagentsEnabled && effectiveModeSystem === "careti") {
				throw new Error("CLI subagents are disabled in Careti mode")
			}
			const currentSettings = controller.stateManager.getGlobalSettingsKey("subagentsEnabled")
			const wasEnabled = currentSettings ?? false
			const isEnabled = !!request.subagentsEnabled

			controller.stateManager.setGlobalState("subagentsEnabled", isEnabled)

			// Capture telemetry when setting changes
			if (wasEnabled !== isEnabled) {
				telemetryService.captureSubagentToggle(isEnabled)
			}
			controller.stateManager.setGlobalState("subagentsEnabled", !!request.subagentsEnabled)
		}

		if (request.nativeToolCallEnabled !== undefined) {
			controller.stateManager.setGlobalState("nativeToolCallEnabled", !!request.nativeToolCallEnabled)
			if (controller.task) {
				telemetryService.captureFeatureToggle(
					controller.task.ulid,
					"native-tool-call",
					request.nativeToolCallEnabled,
					controller.task.api.getModel().id,
				)
			}
		}

		// CARETI MODIFICATION: Update mode system setting
		if (request.modeSystem !== undefined) {
			const modeSystem = request.modeSystem === "careti" ? "careti" : "cline"
			controller.stateManager.setGlobalState("caretModeSystem", modeSystem)
		}

		// CARETI MODIFICATION: Update persona system settings
		if (request.enablePersonaSystem !== undefined) {
			controller.stateManager.setGlobalState("enablePersonaSystem", request.enablePersonaSystem)
		}

		if (request.currentPersona !== undefined) {
			controller.stateManager.setGlobalState("currentPersona", request.currentPersona)
		}

		// CARETI MODIFICATION: F11 - Input History System
		if (request.inputHistory !== undefined) {
			controller.stateManager.setGlobalState("inputHistory", request.inputHistory)
		}

		// Post updated state to webview
		await controller.postStateToWebview()

		return Empty.create()
	} catch (error) {
		console.error("Failed to update settings:", error)
		throw error
	}
}
