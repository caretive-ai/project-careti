// CARET MODIFICATION: Generate images via Caret API with branded notifications and Logger output.
import { CaretEnv } from "@caret/config"
import { CaretAuthService } from "@caret/services/auth/CaretAuthService"
import { getBrandGeneratedAssetsDirName, getCurrentBrandDisplayName } from "@caret/utils/brand-utils"
import { ClineAsk, ClineSayTool } from "@shared/ExtensionMessage"
import type { ToolImageEvent } from "@shared/proto/cline/ui"
import { ClineDefaultTool } from "@shared/tools"
import * as fs from "fs/promises"
import * as path from "path"
import { sendToolImageEvent } from "@/core/controller/ui/subscribeToToolImageEvents"
import { buildClineExtraHeaders } from "@/services/EnvUtils"
import { Logger } from "@/services/logging/Logger"
import { telemetryService } from "@/services/telemetry"
import { fetch } from "@/shared/net"
import { ToolUse } from "../../../assistant-message"
import { formatResponse } from "../../../prompts/responses"
import { ToolResponse } from "../.."
import { showNotificationForApproval } from "../../utils"
import type { IFullyManagedTool } from "../ToolExecutorCoordinator"
import type { TaskConfig } from "../types/TaskConfig"
import type { StronglyTypedUIHelpers } from "../types/UIHelpers"
import { ToolResultUtils } from "../utils/ToolResultUtils"

type ToolImageUsage = {
	inputTokens?: number
	outputTokens?: number
	totalTokens?: number
	totalCost?: number
}

type ToolImageStatus = "pending" | "generating" | "completed" | "error"

type ToolImageMessage = ClineSayTool & {
	tool: "generateImage"
	requestId?: string
	prompt?: string
	model?: string
	aspectRatio?: string
	imageSize?: string
	status?: ToolImageStatus
	progressText?: string
	workspaceRelativePath?: string
	workspaceAbsolutePath?: string
	imageUrl?: string
	usage?: ToolImageUsage
	errorMessage?: string
}

const MAX_PROGRESS_TEXT_LENGTH = 240
const DEFAULT_IMAGE_EXTENSION = "png"
const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/jpg": "jpg",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/avif": "avif",
	"image/svg+xml": "svg",
}

const getImageExtension = (mimeType?: string): string => {
	const normalized = mimeType?.toLowerCase().trim()
	if (normalized && IMAGE_EXTENSION_BY_MIME[normalized]) {
		return IMAGE_EXTENSION_BY_MIME[normalized]
	}
	return DEFAULT_IMAGE_EXTENSION
}

const extractBase64Payload = (
	value: string,
): {
	base64: string
	mimeType?: string
} => {
	const match = value.match(/^data:(.+);base64,(.+)$/)
	if (!match) {
		return { base64: value }
	}
	return { mimeType: match[1], base64: match[2] }
}

const buildImageMarkdown = ({
	prompt,
	model,
	aspectRatio,
	imageSize,
	requestId,
	mimeType,
	imageFileName,
	createdAt,
}: {
	prompt: string
	model?: string
	aspectRatio?: string
	imageSize?: string
	requestId: string
	mimeType: string
	imageFileName: string
	createdAt: string
}): string => {
	const promptLines = prompt.split(/\r?\n/)
	const promptBlock = promptLines.length ? promptLines.map((line) => `  ${line}`).join("\n") : "  "

	const frontmatterLines = [
		"---",
		`request_id: "${requestId}"`,
		`created_at: "${createdAt}"`,
		model ? `model: "${model}"` : undefined,
		aspectRatio ? `aspect_ratio: "${aspectRatio}"` : undefined,
		imageSize ? `image_size: "${imageSize}"` : undefined,
		`mime_type: "${mimeType}"`,
		`image_file: "${imageFileName}"`,
		"prompt: |",
		promptBlock,
		"---",
	]
		.filter(Boolean)
		.join("\n")

	return `${frontmatterLines}

## Prompt

\`\`\`text
${prompt}
\`\`\`

## Image

![Generated image](./${imageFileName})
`
}

export class GenerateImageToolHandler implements IFullyManagedTool {
	readonly name = ClineDefaultTool.GENERATE_IMAGE

	getDescription(block: ToolUse): string {
		const prompt = block.params.prompt || ""
		return `[${block.name} for '${prompt}']`
	}

	async handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void> {
		const prompt = uiHelpers.removeClosingTag(block, "prompt", block.params.prompt || "")
		const sharedMessageProps: ToolImageMessage = {
			tool: "generateImage",
			prompt,
			model: uiHelpers.removeClosingTag(block, "model", block.params.model || ""),
			aspectRatio: uiHelpers.removeClosingTag(block, "aspect_ratio", block.params.aspect_ratio || ""),
			imageSize: uiHelpers.removeClosingTag(block, "image_size", block.params.image_size || ""),
			status: "pending",
			progressText: prompt ? `Generating image for: ${prompt}` : "Generating image...",
		}

		const partialMessage = JSON.stringify(sharedMessageProps)

		await uiHelpers.removeLastPartialMessageIfExistsWithType("say", "tool")
		await uiHelpers.ask("tool" as ClineAsk, partialMessage, block.partial).catch(() => {})
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		try {
			const prompt = (block.params.prompt || "").trim()
			const model = (block.params.model || "").trim()
			const aspectRatio = (block.params.aspect_ratio || "").trim()
			const imageSize = (block.params.image_size || "").trim()
			const globalAspectRatio = config.services.stateManager.getGlobalSettingsKey("imageGenerationAspectRatio")?.trim()
			const globalImageSize = config.services.stateManager.getGlobalSettingsKey("imageGenerationSize")?.trim()
			const finalAspectRatio = aspectRatio || globalAspectRatio || undefined
			const finalImageSize = imageSize || globalImageSize || undefined

			// Extract provider information for telemetry
			const apiConfig = config.services.stateManager.getApiConfiguration()
			const currentMode = config.services.stateManager.getGlobalSettingsKey("mode")
			const provider = (currentMode === "plan" ? apiConfig.planModeApiProvider : apiConfig.actModeApiProvider) as string

			if (!prompt) {
				config.taskState.consecutiveMistakeCount++
				return await config.callbacks.sayAndCreateMissingParamError(this.name, "prompt")
			}
			config.taskState.consecutiveMistakeCount = 0

			const requestId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

			const buildMessage = (overrides: Partial<ToolImageMessage> = {}): string =>
				JSON.stringify({
					tool: "generateImage",
					requestId,
					prompt,
					model: model || undefined,
					aspectRatio: finalAspectRatio,
					imageSize: finalImageSize,
					status: "generating",
					progressText: "Generating image...",
					...overrides,
				} satisfies ToolImageMessage)

			const completeMessage = buildMessage()

			if (config.callbacks.shouldAutoApproveTool(this.name)) {
				await config.callbacks.removeLastPartialMessageIfExistsWithType("ask", "tool")
				await config.callbacks.say("tool", completeMessage, undefined, undefined, true)
				telemetryService.captureToolUsage(
					config.ulid,
					"generate_image",
					config.api.getModel().id,
					provider,
					true,
					true,
					undefined,
					block.isNativeToolCall,
				)
			} else {
				const brandName = getCurrentBrandDisplayName()
				showNotificationForApproval(
					`${brandName} wants to generate an image`,
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
				await config.callbacks.say("tool", completeMessage, undefined, undefined, true)
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

			const authToken = await CaretAuthService.getInstance().getAuthToken()
			if (!authToken) {
				throw new Error("Caret account authentication required to generate images.")
			}

			const url = new URL("/v1/generate/image", CaretEnv.config().apiBaseUrl).toString()
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
				"X-AnyLLM-Key": `Bearer ${authToken}`,
				"X-Task-ID": config.ulid,
				...(await buildClineExtraHeaders()),
			}

			const body = {
				prompt,
				model: model || undefined,
				aspect_ratio: finalAspectRatio,
				image_size: finalImageSize,
				stream: true,
			}

			const response = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Image generation failed (${response.status}): ${errorText || response.statusText}`)
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error("Image generation response has no stream body.")
			}

			const decoder = new TextDecoder()
			let buffer = ""
			let progressText = ""
			const textOutputs: string[] = []
			let usage: ToolImageUsage | undefined
			let streamError: string | undefined
			let didReceiveDone = false
			let savedImagePath: string | undefined
			let savedMarkdownPath: string | undefined
			let savedImageRelativePath: string | undefined
			const workspaceRoot = config.workspaceManager?.getPrimaryRoot()?.path ?? config.cwd
			// CARET MODIFICATION: Save generated assets under standard .agents/generated-assets
			const assetsDir = path.join(workspaceRoot, getBrandGeneratedAssetsDirName())

			const updateToolMessage = async (overrides: Partial<ToolImageMessage>) => {
				const nextProgress = overrides.progressText ? overrides.progressText.trim() : progressText
				const trimmedProgress =
					nextProgress.length > MAX_PROGRESS_TEXT_LENGTH
						? `${nextProgress.slice(0, MAX_PROGRESS_TEXT_LENGTH - 3)}...`
						: nextProgress
				progressText = trimmedProgress

				await config.callbacks.say(
					"tool",
					buildMessage({
						progressText: progressText || undefined,
						workspaceRelativePath: savedImageRelativePath,
						workspaceAbsolutePath: savedImagePath,
						usage,
						...overrides,
					}),
					undefined,
					undefined,
					true,
				)
			}

			while (true) {
				const { done, value } = await reader.read()
				if (done) {
					break
				}

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (!line.startsWith("data: ")) {
						continue
					}
					const data = line.slice(6).trim()
					if (!data) {
						continue
					}

					let parsed: any
					try {
						parsed = JSON.parse(data)
					} catch {
						continue
					}

					switch (parsed.type) {
						case "text": {
							if (typeof parsed.content === "string") {
								textOutputs.push(parsed.content)
								await updateToolMessage({ progressText: parsed.content })
							}
							break
						}
						case "thought": {
							// Ignore internal thoughts for UI and tool result
							break
						}
						case "image": {
							if (typeof parsed.base64 === "string" && parsed.base64) {
								const rawMimeType = typeof parsed.mimeType === "string" ? parsed.mimeType : "image/png"
								if (!savedImagePath || !savedMarkdownPath) {
									try {
										const { base64, mimeType: inlineMimeType } = extractBase64Payload(parsed.base64.trim())
										const finalMimeType = inlineMimeType || rawMimeType
										const extension = getImageExtension(finalMimeType)
										const imageFileName = `${requestId}.${extension}`
										const markdownFileName = `${requestId}.md`
										const imagePath = path.join(assetsDir, imageFileName)
										const markdownPath = path.join(assetsDir, markdownFileName)

										await fs.mkdir(assetsDir, { recursive: true })
										if (!savedImagePath) {
											const imageBuffer = Buffer.from(base64.replace(/\s/g, ""), "base64")
											await fs.writeFile(imagePath, imageBuffer)

											savedImagePath = imagePath
											const relativePath = path.relative(workspaceRoot, imagePath)
											savedImageRelativePath = relativePath.split(path.sep).join(path.posix.sep)
										}

										if (!savedMarkdownPath) {
											const markdown = buildImageMarkdown({
												prompt,
												model: model || undefined,
												aspectRatio: finalAspectRatio,
												imageSize: finalImageSize,
												requestId,
												mimeType: finalMimeType,
												imageFileName,
												createdAt: new Date().toISOString(),
											})
											await fs.writeFile(markdownPath, markdown, "utf8")
											savedMarkdownPath = markdownPath
										}
									} catch (error) {
										Logger.error("Failed to save generated image assets", error as Error)
									}
								}
								const toolImageEvent: ToolImageEvent = {
									requestId,
									mimeType: rawMimeType,
									base64: parsed.base64,
									workspaceRelativePath: savedImageRelativePath || "",
									workspaceAbsolutePath: savedImagePath || "",
								}

								await sendToolImageEvent(toolImageEvent)
								await updateToolMessage({ status: "generating" })
							}
							break
						}
						case "usage": {
							usage = {
								inputTokens: parsed.inputTokens,
								outputTokens: parsed.outputTokens,
								totalTokens: parsed.totalTokens,
								totalCost: parsed.totalCost,
							}
							await updateToolMessage({ usage })
							break
						}
						case "error": {
							streamError = typeof parsed.message === "string" ? parsed.message : "Image generation failed."
							break
						}
						case "done": {
							didReceiveDone = true
							break
						}
						default:
							break
					}

					if (parsed.type === "done" || parsed.type === "error") {
						break
					}
				}

				if (streamError || didReceiveDone) {
					break
				}
			}

			if (streamError) {
				await config.callbacks.say(
					"tool",
					buildMessage({
						status: "error",
						errorMessage: streamError,
						workspaceRelativePath: savedImageRelativePath,
						workspaceAbsolutePath: savedImagePath,
					}),
					undefined,
					undefined,
					false,
				)
				return formatResponse.toolError(streamError)
			}

			await config.callbacks.say(
				"tool",
				buildMessage({
					status: "completed",
					usage,
					workspaceRelativePath: savedImageRelativePath,
					workspaceAbsolutePath: savedImagePath,
				}),
				undefined,
				undefined,
				false,
			)

			const savedMarkdownRelativePath = savedMarkdownPath
				? path.relative(workspaceRoot, savedMarkdownPath).split(path.sep).join(path.posix.sep)
				: undefined

			const summaryParts = [
				"Image generated.",
				model ? `Model: ${model}` : undefined,
				finalAspectRatio ? `Aspect ratio: ${finalAspectRatio}` : undefined,
				finalImageSize ? `Image size: ${finalImageSize}` : undefined,
				savedImageRelativePath ? `Image file: ${savedImageRelativePath}` : undefined,
				savedMarkdownRelativePath ? `Metadata file: ${savedMarkdownRelativePath}` : undefined,
				textOutputs.length ? `Text output: ${textOutputs.join(" ")}` : undefined,
			].filter(Boolean)

			return formatResponse.toolResult(summaryParts.join("\n"))
		} catch (error) {
			const message = (error as Error).message || "Image generation failed."
			await config.callbacks.say(
				"tool",
				JSON.stringify({
					tool: "generateImage",
					status: "error",
					errorMessage: message,
				} satisfies ToolImageMessage),
				undefined,
				undefined,
				false,
			)
			return formatResponse.toolError(message)
		}
	}
}
