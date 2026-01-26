// CARETI MODIFICATION: Web Search tool handler using SerpAPI
import { ClineAsk, ClineSayTool } from "@shared/ExtensionMessage"
import { ClineDefaultTool } from "@shared/tools"
import { getCurrentBrandName } from "@careti/utils/brand-utils"
import { telemetryService } from "@/services/telemetry"
import { ToolUse } from "../../../assistant-message"
import { formatResponse } from "../../../prompts/responses"
import { ToolResponse } from "../.."
import { showNotificationForApproval } from "../../utils"
import type { IFullyManagedTool } from "../ToolExecutorCoordinator"
import type { TaskConfig } from "../types/TaskConfig"
import type { StronglyTypedUIHelpers } from "../types/UIHelpers"
import { ToolResultUtils } from "../utils/ToolResultUtils"

interface SerpApiOrganicResult {
	title: string
	link: string
	snippet: string
	position: number
}

interface SerpApiResponse {
	organic_results?: SerpApiOrganicResult[]
	error?: string
}

export class WebSearchToolHandler implements IFullyManagedTool {
	readonly name = ClineDefaultTool.WEB_SEARCH

	getDescription(block: ToolUse): string {
		return `[${block.name} for '${block.params.query}']`
	}

	async handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void> {
		const query = block.params.query || ""
		const sharedMessageProps: ClineSayTool = {
			tool: "webSearch",
			path: uiHelpers.removeClosingTag(block, "query", query),
			content: `Searching web for: ${uiHelpers.removeClosingTag(block, "query", query)}`,
			operationIsLocatedInWorkspace: false,
		} satisfies ClineSayTool

		const partialMessage = JSON.stringify(sharedMessageProps)

		await uiHelpers.removeLastPartialMessageIfExistsWithType("say", "tool")
		await uiHelpers.ask("tool" as ClineAsk, partialMessage, block.partial).catch(() => {})
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		try {
			const query: string | undefined = block.params.query
			const numResults = Math.min(Math.max(parseInt(block.params.num_results || "5") || 5, 1), 10)

			// Extract provider information for telemetry
			const apiConfig = config.services.stateManager.getApiConfiguration()
			const currentMode = config.services.stateManager.getGlobalSettingsKey("mode")
			const provider = (currentMode === "plan" ? apiConfig.planModeApiProvider : apiConfig.actModeApiProvider) as string

			// Validate required parameter
			if (!query) {
				config.taskState.consecutiveMistakeCount++
				return await config.callbacks.sayAndCreateMissingParamError(this.name, "query")
			}
			config.taskState.consecutiveMistakeCount = 0

			// Get SerpAPI key from API configuration
			const serpApiKey = config.services.stateManager.getApiConfiguration().serpApiKey
			if (!serpApiKey) {
				return formatResponse.toolError(
					"SerpAPI key is not configured. Please add your SerpAPI key in Settings > Features > Web Search.",
				)
			}

			// Create message for approval
			const sharedMessageProps: ClineSayTool = {
				tool: "webSearch",
				path: query,
				content: `Searching web for: ${query}`,
				operationIsLocatedInWorkspace: false,
			}
			const completeMessage = JSON.stringify(sharedMessageProps)

			if (config.callbacks.shouldAutoApproveTool(this.name)) {
				// Auto-approve flow
				await config.callbacks.removeLastPartialMessageIfExistsWithType("ask", "tool")
				await config.callbacks.say("tool", completeMessage, undefined, undefined, false)
				telemetryService.captureToolUsage(
					config.ulid,
					"web_search",
					config.api.getModel().id,
					provider,
					true,
					true,
					undefined,
					block.isNativeToolCall,
				)
			} else {
				// Manual approval flow
				showNotificationForApproval(
					`${getCurrentBrandName()} wants to search the web for "${query}"`,
					config.autoApprovalSettings.enableNotifications,
				)
				await config.callbacks.removeLastPartialMessageIfExistsWithType("say", "tool")

				const didApprove = await ToolResultUtils.askApprovalAndPushFeedback("tool", completeMessage, config)
				if (!didApprove) {
					telemetryService.captureToolUsage(
						config.ulid,
						block.name,
						config.api.getModel().id,
						provider,
						false,
						false,
						undefined,
						block.isNativeToolCall,
					)
					return formatResponse.toolDenied()
				} else {
					telemetryService.captureToolUsage(
						config.ulid,
						block.name,
						config.api.getModel().id,
						provider,
						false,
						true,
						undefined,
						block.isNativeToolCall,
					)
				}
			}

			// Run PreToolUse hook after approval but before execution
			try {
				const { ToolHookUtils } = await import("../utils/ToolHookUtils")
				await ToolHookUtils.runPreToolUseIfEnabled(config, block)
			} catch (error) {
				const { PreToolUseHookCancellationError } = await import("@core/hooks/PreToolUseHookCancellationError")
				if (error instanceof PreToolUseHookCancellationError) {
					return formatResponse.toolDenied()
				}
				throw error
			}

			// Execute the search using SerpAPI
			const searchUrl = new URL("https://serpapi.com/search")
			searchUrl.searchParams.set("q", query)
			searchUrl.searchParams.set("api_key", serpApiKey)
			searchUrl.searchParams.set("engine", "google")
			searchUrl.searchParams.set("num", String(numResults))

			const response = await fetch(searchUrl.toString())

			if (!response.ok) {
				return formatResponse.toolError(`SerpAPI request failed: ${response.status} ${response.statusText}`)
			}

			const data = (await response.json()) as SerpApiResponse

			if (data.error) {
				return formatResponse.toolError(`SerpAPI error: ${data.error}`)
			}

			// Format results
			const results = data.organic_results || []
			if (results.length === 0) {
				return formatResponse.toolResult(`No search results found for: "${query}"`)
			}

			const formattedResults = results
				.map((result, index) => {
					return `${index + 1}. **${result.title}**
   URL: ${result.link}
   ${result.snippet}`
				})
				.join("\n\n")

			const resultText = `Search results for "${query}":\n\n${formattedResults}`

			return formatResponse.toolResult(resultText)
		} catch (error) {
			return formatResponse.toolError(`Error performing web search: ${(error as Error).message}`)
		}
	}
}
