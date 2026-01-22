// CARETI MODIFICATION: Analyze images via Careti API (Gemini 2.5 Flash or 3.0 Flash) for models that don't support images.
import { CaretEnv } from "@careti/config"
import { CaretAuthService } from "@careti/services/auth/CaretAuthService"
import { getCurrentBrandDisplayName } from "@careti/utils/brand-utils"
import { ClineSayTool } from "@shared/ExtensionMessage"
import { ClineDefaultTool } from "@shared/tools"
import * as fs from "fs/promises"
import * as path from "path"
import { fileURLToPath } from "url"
import { buildClineExtraHeaders } from "@/services/EnvUtils"
import { Logger } from "@/services/logging/Logger"
import { telemetryService } from "@/services/telemetry"
import { fetch } from "@/shared/net"
import { getMimeType } from "@integrations/misc/process-files"
import { ToolUse } from "@core/assistant-message"
import { formatResponse } from "@core/prompts/responses"
import { getReadablePath, isLocatedInPath } from "@utils/path"
import { ToolResultUtils } from "@core/task/tools/utils/ToolResultUtils"
import { optimizeImageDataUrl } from "@careti/utils/image-optimization"
import type { ToolResponse } from "@core/task"
import type { IFullyManagedTool } from "@core/task/tools/ToolExecutorCoordinator"
import type { ToolValidator } from "@core/task/tools/ToolValidator"
import type { TaskConfig } from "@core/task/tools/types/TaskConfig"
import type { StronglyTypedUIHelpers } from "@core/task/tools/types/UIHelpers"
import { ensureBlockOperationId } from "@careti/core/task/tools/utils/operationIdUtils"

type ToolAnalyzeImageMessage = ClineSayTool & {
	tool: "analyzeImage"
	imagePath?: string
	question?: string
	status?: "pending" | "analyzing" | "completed" | "error"
	progressText?: string // CARETI MODIFICATION: Progress text for UI display
	result?: string
	errorMessage?: string
	operationIsLocatedInWorkspace?: boolean // Security: track if file is within workspace
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".bmp", ".tiff"])

const isImagePath = (value: string): boolean => {
	const ext = path.extname(value).toLowerCase()
	return IMAGE_EXTENSIONS.has(ext)
}

const stripQuotes = (value: string): string => {
	const trimmed = value.trim()
	const match = trimmed.match(/^"(.*)"$/)
	return match ? match[1] : trimmed
}

/**
 * Resolve image path to absolute path with security validation
 */
function resolveImagePath(imagePath: string, cwd: string): string {
	let absolutePath = imagePath

	// Handle file:// URLs
	if (imagePath.startsWith("file://")) {
		try {
			absolutePath = fileURLToPath(imagePath)
		} catch {
			throw new Error(`Invalid file URL: ${imagePath}`)
		}
	}

	// Handle relative paths - use path.resolve which normalizes .. sequences
	if (!path.isAbsolute(absolutePath)) {
		absolutePath = path.resolve(cwd, absolutePath)
	}

	// Normalize the path to resolve any remaining .. or . segments
	absolutePath = path.normalize(absolutePath)

	return absolutePath
}

/**
 * Load image as data URL from file path
 */
async function loadImageAsDataUrl(absolutePath: string): Promise<string> {
	// Check if file exists
	try {
		await fs.access(absolutePath)
	} catch {
		throw new Error(`Image file not found: ${absolutePath}`)
	}

	// Validate file extension is an image
	const ext = path.extname(absolutePath).toLowerCase()
	if (!IMAGE_EXTENSIONS.has(ext)) {
		throw new Error(`Invalid image file type: ${ext}. Supported types: ${Array.from(IMAGE_EXTENSIONS).join(", ")}`)
	}

	// Read file and convert to data URL
	const buffer = await fs.readFile(absolutePath)
	const mimeType = getMimeType(absolutePath) || "image/png"
	const base64 = buffer.toString("base64")
	return `data:${mimeType};base64,${base64}`
}

export class AnalyzeImageToolHandler implements IFullyManagedTool {
	readonly name = ClineDefaultTool.ANALYZE_IMAGE

	constructor(private validator: ToolValidator) {}

	getDescription(block: ToolUse): string {
		const imagePath = block.params.image || block.params.path
		return `[${block.name} for '${imagePath}']`
	}

	async handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void> {
		// CARETI MODIFICATION: Generate deterministic operationId based on block content (not time-based)
		// This ensures same tool call always gets same operationId even if block object is recreated
		const operationId = ensureBlockOperationId(block, ["image", "path", "question", "prompt"])

		const imagePath = block.params.image || block.params.path
		const question = block.params.question || block.params.prompt

		const sharedMessageProps: ToolAnalyzeImageMessage = {
			tool: "analyzeImage",
			imagePath: imagePath ? stripQuotes(imagePath) : undefined,
			question: question ? uiHelpers.removeClosingTag(block, "question", question) : undefined,
			status: "pending",
		}

		const partialMessage = JSON.stringify(sharedMessageProps)
		// CARETI MODIFICATION: Use deterministic operationId for reliable message updates (prevents duplicate UI)
		await uiHelpers.say("tool", partialMessage, undefined, undefined, block.partial, operationId)
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		// CARETI MODIFICATION: Generate deterministic operationId based on block content (not time-based)
		// This ensures same tool call always gets same operationId even if block object is recreated
		const operationId = ensureBlockOperationId(block, ["image", "path", "question", "prompt"])

		// Support both 'image' and 'path' parameter names
		const imagePath: string | undefined = block.params.image || block.params.path
		// Support both 'question' and 'prompt' parameter names
		const question: string | undefined = block.params.question || block.params.prompt

		// Extract provider information for telemetry
		const apiConfig = config.services.stateManager.getApiConfiguration()
		const currentMode = config.services.stateManager.getGlobalSettingsKey("mode")
		const provider = (currentMode === "plan" ? apiConfig.planModeApiProvider : apiConfig.actModeApiProvider) as string

		// Validate required parameters
		if (!imagePath) {
			config.taskState.consecutiveMistakeCount++
			return await config.callbacks.sayAndCreateMissingParamError(this.name, "image")
		}

		if (!question) {
			config.taskState.consecutiveMistakeCount++
			return await config.callbacks.sayAndCreateMissingParamError(this.name, "question")
		}

		config.taskState.consecutiveMistakeCount = 0

		const cleanImagePath = stripQuotes(imagePath)
		const cleanQuestion = stripQuotes(question)
		const workspaceRoot = config.workspaceManager?.getPrimaryRoot()?.path ?? config.cwd

		// Resolve and validate the image path early for security
		let absoluteImagePath: string | undefined
		let isInWorkspace = false

		if (!cleanImagePath.startsWith("data:")) {
			// Resolve to absolute path with normalization (handles .. sequences)
			absoluteImagePath = resolveImagePath(cleanImagePath, workspaceRoot)
			// Check if the resolved path is within workspace
			isInWorkspace = isLocatedInPath(workspaceRoot, absoluteImagePath)
			Logger.debug(
				`[AnalyzeImage] Path resolved: ${cleanImagePath} -> ${absoluteImagePath}, inWorkspace: ${isInWorkspace}`,
			)
		} else {
			// Data URLs are always considered "in workspace" (no file access)
			isInWorkspace = true
		}

		// Build message for UI with workspace location info
		const displayPath = absoluteImagePath ? getReadablePath(workspaceRoot, absoluteImagePath) : cleanImagePath
		const buildMessage = (overrides: Partial<ToolAnalyzeImageMessage> = {}): string => {
			const message: ToolAnalyzeImageMessage = {
				tool: "analyzeImage",
				imagePath: displayPath,
				question: cleanQuestion,
				status: "pending",
				operationIsLocatedInWorkspace: isInWorkspace,
				...overrides,
			}
			return JSON.stringify(message)
		}

		// Show tool message
		const completeMessage = buildMessage({ status: "pending" })

		// Check if should auto-approve based on settings and path location
		const shouldAutoApprove = await config.callbacks.shouldAutoApproveToolWithPath(this.name, absoluteImagePath)

		// CARETI MODIFICATION: Use operationId for reliable message updates (no need for removeLastPartialMessageIfExistsWithType)
		if (shouldAutoApprove) {
			// Auto-approve: show message with partial=true to maintain chain for later updates
			await config.callbacks.say("tool", completeMessage, undefined, undefined, true, operationId)
		} else {
			// Manual approval required - show approval UI and wait for user decision
			const didApprove = await ToolResultUtils.askApprovalAndPushFeedback("tool", completeMessage, config, operationId)
			if (!didApprove) {
				// User rejected
				telemetryService.captureToolUsage(
					config.ulid,
					block.name,
					config.api.getModel().id,
					provider,
					false,
					false, // Not approved
					undefined,
					block.isNativeToolCall,
				)
				return formatResponse.toolDenied()
			}
		}

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

		// Run PreToolUse hook after approval but before execution
		try {
			const { ToolHookUtils } = await import("@core/task/tools/utils/ToolHookUtils")
			await ToolHookUtils.runPreToolUseIfEnabled(config, block)
		} catch (error) {
			const { PreToolUseHookCancellationError } = await import("@core/hooks/PreToolUseHookCancellationError")
			if (error instanceof PreToolUseHookCancellationError) {
				return formatResponse.toolDenied()
			}
			throw error
		}

		try {
			// Check authentication
			const authToken = await CaretAuthService.getInstance().getAuthToken()
			if (!authToken) {
				const brandName = getCurrentBrandDisplayName()
				// CARETI MODIFICATION: Use JSON structure for i18n support in ErrorRow
				const authErrorData = {
					type: "auth_required",
					action: "analyze images",
					toolName: "Analyze images",
					brandName: brandName,
				}
				const authError = new Error(JSON.stringify(authErrorData)) as Error & { status: number }
				authError.status = 401
				throw authError
			}

			// Update status to analyzing (progressText will be translated in frontend)
			await config.callbacks.say(
				"tool",
				buildMessage({ status: "analyzing" }),
				undefined,
				undefined,
				true,
				operationId,
			)

			// Load image as data URL
			Logger.debug(`[AnalyzeImage] Loading image: ${cleanImagePath}`)
			let imageDataUrl: string

			if (cleanImagePath.startsWith("data:")) {
				// Already a data URL
				imageDataUrl = cleanImagePath
			} else if (absoluteImagePath) {
				// Load from resolved file path (already validated)
				imageDataUrl = await loadImageAsDataUrl(absoluteImagePath)
			} else {
				throw new Error("Image path could not be resolved")
			}

			// Optimize image to reduce size (max 1024px, WebP format)
			// This prevents 413 Request Entity Too Large errors
			Logger.debug(`[AnalyzeImage] Optimizing image before sending to API...`)
			try {
				imageDataUrl = await optimizeImageDataUrl(imageDataUrl)
			} catch (optimizeError) {
				Logger.warn(`[AnalyzeImage] Image optimization failed, using original: ${optimizeError}`)
				// Continue with original image if optimization fails
			}

			Logger.debug(`[AnalyzeImage] Image loaded, sending to Careti API (chat/completions)`)

			// Get image analysis model from settings (default: gemini-3-flash-preview)
			// Note: Model ID is "gemini-3-flash-preview" (without .0)
			const imageAnalysisModel = config.services.stateManager.getGlobalSettingsKey("imageAnalysisModel") || "gemini-3-flash-preview"
			const modelId = `gemini/${imageAnalysisModel}`
			Logger.debug(`[AnalyzeImage] Using model: ${modelId}`)

			// Use existing /v1/chat/completions endpoint
			const url = new URL("/v1/chat/completions", CaretEnv.config().apiBaseUrl).toString()
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
				"X-AnyLLM-Key": `Bearer ${authToken}`,
				"X-Task-ID": config.ulid,
				...(await buildClineExtraHeaders()),
			}

			// Build system prompt with usage context hints
			const systemPrompt = `You are an AI assistant specialized in analyzing images for software development tasks.

Common use cases:
- UI/UX issues: Check for misalignment, layout problems, visual bugs, responsive design issues
- Text extraction: Extract text from screenshots, dialogs, error messages, logs
- Code review: Analyze screenshots of code, identify issues or patterns
- Design comparison: Compare UI implementations with design mockups
- Error analysis: Interpret error dialogs, stack traces, or debug output shown in images

Provide clear, structured analysis relevant to the user's question. If analyzing UI issues, be specific about element positions, colors, and alignment. If extracting text, preserve formatting where relevant.`

			// OpenAI-compatible message format with image
			const body = {
				model: modelId,
				messages: [
					{
						role: "system",
						content: systemPrompt,
					},
					{
						role: "user",
						content: [
							{
								type: "image_url",
								image_url: {
									url: imageDataUrl,
								},
							},
							{
								type: "text",
								text: cleanQuestion,
							},
						],
					},
				],
				max_tokens: 4096,
			}

			// CARETI MODIFICATION: Add timeout to prevent infinite waiting
			const API_TIMEOUT_MS = 60000 // 60 seconds
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

			let response: Response
			try {
				response = await fetch(url, {
					method: "POST",
					headers,
					body: JSON.stringify(body),
					signal: controller.signal,
				})
			} finally {
				clearTimeout(timeoutId)
			}

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Image analysis failed (${response.status}): ${errorText || response.statusText}`)
			}

			const result = await response.json()
			// Extract response from OpenAI-compatible format
			const analysisResult =
				result.choices?.[0]?.message?.content || result.result || result.response || JSON.stringify(result)

			Logger.debug(`[AnalyzeImage] Analysis completed successfully`)

			// Update status to completed
			await config.callbacks.say(
				"tool",
				buildMessage({
					status: "completed",
					result: analysisResult,
				}),
				undefined,
				undefined,
				false,
				operationId,
			)

			return formatResponse.toolResult(analysisResult)
		} catch (error) {
			// CARETI MODIFICATION: Handle timeout error specifically
			let message: string
			if (error instanceof Error && error.name === "AbortError") {
				message = "Image analysis timed out after 60 seconds. The server may be overloaded. Please try again."
				Logger.warn("[AnalyzeImage] Request timed out")
			} else {
				message = (error as Error).message || "Image analysis failed."
				Logger.error("[AnalyzeImage] Error:", error as Error)
			}

			// CARETI MODIFICATION: Use deterministic operationId for reliable message updates
			await config.callbacks.say(
				"tool",
				buildMessage({
					status: "error",
					errorMessage: message,
				}),
				undefined,
				undefined,
				false,
				operationId,
			)

			return formatResponse.toolError(message)
		}
	}
}
