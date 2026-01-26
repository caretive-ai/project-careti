// CARETI MODIFICATION: Generate images via Careti API with branded notifications and Logger output.
import { CaretEnv } from "@careti/config"
import { CaretiAuthService } from "@careti/services/auth/CaretiAuthService"
import { getBrandGeneratedAssetsDirName, getCurrentBrandDisplayName } from "@careti/utils/brand-utils"
import { ClineSayTool } from "@shared/ExtensionMessage"
import type { ToolImageEvent } from "@shared/proto/cline/ui"
import { ClineDefaultTool } from "@shared/tools"
import * as fs from "fs/promises"
import * as path from "path"
import { fileURLToPath } from "url"
import { sendToolImageEvent } from "@/core/controller/ui/subscribeToToolImageEvents"
import { buildClineExtraHeaders } from "@/services/EnvUtils"
import { Logger } from "@/services/logging/Logger"
import { telemetryService } from "@/services/telemetry"
import { fetch } from "@/shared/net"
import { getMimeType } from "@integrations/misc/process-files"
import { ToolUse } from "@core/assistant-message"
import { optimizeImageDataUrl } from "@careti/utils/image-optimization"
import { formatResponse } from "@core/prompts/responses"
import type { ToolResponse } from "@core/task"
import { showNotificationForApproval } from "@core/task/utils"
import type { IFullyManagedTool } from "@core/task/tools/ToolExecutorCoordinator"
import type { TaskConfig } from "@core/task/tools/types/TaskConfig"
import type { StronglyTypedUIHelpers } from "@core/task/tools/types/UIHelpers"
import { ToolResultUtils } from "@core/task/tools/utils/ToolResultUtils"
import { ensureBlockOperationId } from "@careti/core/task/tools/utils/operationIdUtils"

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
	imageId?: string
	status?: ToolImageStatus
	progressText?: string
	workspaceRelativePath?: string
	workspaceAbsolutePath?: string
	imageUrl?: string
	usage?: ToolImageUsage
	errorMessage?: string
}

const MAX_PROGRESS_TEXT_LENGTH = 240
const MAX_REFERENCE_IMAGE_BYTES = 2 * 1024 * 1024
const MAX_REFERENCE_IMAGES_TOTAL_BYTES = 6 * 1024 * 1024
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

type ReferenceImageParseResult = {
	dataUrls: string[]
	filePaths: string[]
}

type WorkspaceRootInfo = {
	path: string
	name?: string
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"])

const stripQuotes = (value: string): string => {
	const trimmed = value.trim()
	const match = trimmed.match(/^"(.*)"$/)
	return match ? match[1] : trimmed
}

const isImagePath = (value: string): boolean => {
	const ext = path.extname(value).toLowerCase()
	return IMAGE_EXTENSIONS.has(ext)
}

const isWindowsDrivePath = (value: string): boolean => /^[a-zA-Z]:[\\/]/.test(value)

const parseWorkspaceHint = (value: string): { workspaceHint: string; pathPart: string } | undefined => {
	const match = value.match(/^([\w-]+):(.+)$/)
	if (!match || value.includes("://")) {
		return undefined
	}
	const [, workspaceHint, pathPart] = match
	if (workspaceHint.length === 1 && isWindowsDrivePath(`${workspaceHint}:${pathPart}`)) {
		return undefined
	}
	return { workspaceHint, pathPart }
}

const parseReferenceImagePath = (
	value: string,
): { workspaceHint?: string; relativePath?: string; absolutePath?: string } | undefined => {
	if (!value) {
		return undefined
	}

	let trimmed = stripQuotes(value)
	if (!trimmed || trimmed.startsWith("data:") || trimmed.includes("://")) {
		return undefined
	}

	if (trimmed.startsWith("file://")) {
		try {
			trimmed = fileURLToPath(trimmed)
		} catch {
			return undefined
		}
	}

	if (trimmed.startsWith("@/")) {
		trimmed = trimmed.slice(1)
	}

	const workspaceHint = parseWorkspaceHint(trimmed)
	if (workspaceHint) {
		const relPath = stripQuotes(workspaceHint.pathPart).replace(/^\/+/, "")
		return { workspaceHint: workspaceHint.workspaceHint, relativePath: relPath }
	}

	if (trimmed.startsWith("/")) {
		return { relativePath: trimmed.replace(/^\/+/, "") }
	}

	if (path.isAbsolute(trimmed)) {
		return { absolutePath: trimmed }
	}

	return { relativePath: trimmed }
}

const parseReferenceImagesParam = (value?: string): ReferenceImageParseResult | undefined => {
	if (!value) {
		return undefined
	}

	const trimmed = value.trim()
	if (!trimmed) {
		return undefined
	}

	const result: ReferenceImageParseResult = { dataUrls: [], filePaths: [] }
	const pushValue = (item: string) => {
		const normalized = item.trim()
		if (!normalized) {
			return
		}
		if (normalized.startsWith("data:")) {
			result.dataUrls.push(normalized)
		} else {
			result.filePaths.push(normalized)
		}
	}

	try {
		const parsed = JSON.parse(trimmed)
		if (Array.isArray(parsed)) {
			for (const item of parsed) {
				if (typeof item === "string") {
					pushValue(item)
				}
			}
			if (result.dataUrls.length > 0 || result.filePaths.length > 0) {
				return result
			}
			return undefined
		}
	} catch {
		// Fall back to treating the value as a single data URL.
	}

	if (trimmed.startsWith("data:")) {
		return { dataUrls: [trimmed], filePaths: [] }
	}

	// Handle XML <image>...</image> format that some models (e.g., Gemini) use
	const xmlImagePattern = /<image>\s*(.*?)\s*<\/image>/gi
	const xmlMatches = [...trimmed.matchAll(xmlImagePattern)]
	if (xmlMatches.length > 0) {
		for (const match of xmlMatches) {
			pushValue(match[1])
		}
		if (result.dataUrls.length > 0 || result.filePaths.length > 0) {
			return result
		}
	}

	const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
	if (lines.length > 1) {
		for (const line of lines) {
			pushValue(line)
		}
		if (result.dataUrls.length > 0 || result.filePaths.length > 0) {
			return result
		}
	}

	return { dataUrls: [], filePaths: [trimmed] }
}

const collectWorkspaceRoots = (config: TaskConfig): WorkspaceRootInfo[] => {
	const roots = new Map<string, WorkspaceRootInfo>()
	for (const root of config.workspaceManager?.getRoots() ?? []) {
		if (!root.path) {
			continue
		}
		roots.set(root.path, { path: root.path, name: root.name })
	}
	if (config.cwd) {
		roots.set(config.cwd, { path: config.cwd })
	}
	return Array.from(roots.values())
}

const isPathWithinRoots = (absolutePath: string, roots: WorkspaceRootInfo[]): boolean => {
	const normalizedPath = path.resolve(absolutePath)
	return roots.some((root) => {
		const normalizedRoot = path.resolve(root.path)
		return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}${path.sep}`)
	})
}

const findRootByHint = (roots: WorkspaceRootInfo[], hint?: string): WorkspaceRootInfo | undefined => {
	if (!hint) {
		return undefined
	}
	const normalized = hint.trim().toLowerCase()
	return (
		roots.find((root) => root.name?.toLowerCase() === normalized) ??
		roots.find((root) => path.basename(root.path).toLowerCase() === normalized)
	)
}

const resolveReferenceImagePaths = async (config: TaskConfig, paths: string[]): Promise<string[]> => {
	const roots = collectWorkspaceRoots(config)
	if (roots.length === 0) {
		Logger.warn("[GenerateImage] No workspace roots available for reference image resolution.")
		return []
	}
	const rootNames = roots
		.map((root) => root.name || path.basename(root.path))
		.filter(Boolean)
		.join(", ")
	Logger.debug(`[GenerateImage] Reference image roots: count=${roots.length} names=${rootNames}`)
	const results: string[] = []

	for (const rawPath of paths) {
		const parsed = parseReferenceImagePath(rawPath)
		if (!parsed) {
			continue
		}

		let absolutePath: string | undefined
		if (parsed.absolutePath) {
			if (!isPathWithinRoots(parsed.absolutePath, roots)) {
				continue
			}
			absolutePath = parsed.absolutePath
		} else if (parsed.relativePath) {
			const candidateRoots = parsed.workspaceHint
				? [findRootByHint(roots, parsed.workspaceHint)].filter(Boolean)
				: roots

			for (const root of candidateRoots) {
				if (!root) {
					continue
				}
				const candidatePath = path.resolve(root.path, parsed.relativePath)
				try {
					const stat = await fs.stat(candidatePath)
					if (stat.isFile()) {
						absolutePath = candidatePath
						break
					}
				} catch {
					continue
				}
			}
		}

		if (!absolutePath || !isImagePath(absolutePath)) {
			continue
		}

		try {
			const buffer = await fs.readFile(absolutePath)
			const mimeType = getMimeType(absolutePath)
			const rawDataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`
			try {
				const optimized = await optimizeImageDataUrl(rawDataUrl)
				if (optimized !== rawDataUrl) {
					Logger.debug(
						`[GenerateImage] Optimized reference image ${path.basename(absolutePath)} (before=${Buffer.byteLength(
							rawDataUrl,
							"utf8",
						)} bytes, after=${Buffer.byteLength(optimized, "utf8")} bytes)`,
					)
				}
				results.push(optimized)
			} catch (error) {
				const message = error instanceof Error ? ` ${error.message}` : ""
				Logger.warn(`[GenerateImage] Failed to optimize reference image: ${absolutePath}${message}`)
			}
		} catch (error) {
			const message = error instanceof Error ? ` ${error.message}` : ""
			Logger.warn(`[GenerateImage] Failed to read reference image path: ${absolutePath}${message}`)
		}
	}

	return results
}

const dedupeReferenceImages = (images: string[]): string[] => {
	const seen = new Set<string>()
	const result: string[] = []
	for (const image of images) {
		if (seen.has(image)) {
			continue
		}
		seen.add(image)
		result.push(image)
	}
	return result
}

const summarizeReferencePaths = (paths: string[]): string => {
	const samples = paths
		.slice(0, 3)
		.map((value) => {
			const trimmed = stripQuotes(value).replace(/^@/, "")
			const withoutHint = trimmed.includes("://") ? trimmed : trimmed.split(":").pop() || trimmed
			return path.basename(withoutHint)
		})
		.filter(Boolean)
	return samples.join(", ")
}

const logReferenceImagesDebug = (source: string, images: string[]): void => {
	if (images.length === 0) {
		return
	}
	const totalBytes = images.reduce((sum, image) => sum + Buffer.byteLength(image, "utf8"), 0)
	Logger.debug(
		`[GenerateImage] Reference images resolved (source=${source}, count=${images.length}, totalBytes=${totalBytes})`,
	)
}

const limitReferenceImagesBySize = (images: string[], source: string): string[] => {
	let remainingBytes = MAX_REFERENCE_IMAGES_TOTAL_BYTES
	const result: string[] = []

	for (const image of images) {
		const size = Buffer.byteLength(image, "utf8")
		if (size > MAX_REFERENCE_IMAGE_BYTES) {
			Logger.warn(`[GenerateImage] Reference image too large from ${source}, skipping.`)
			continue
		}
		if (size > remainingBytes) {
			Logger.warn(`[GenerateImage] Reference image budget exceeded for ${source}, skipping.`)
			continue
		}
		remainingBytes -= size
		result.push(image)
	}

	return result
}

export const resolveReferenceImages = async (config: TaskConfig, paramValue?: string): Promise<string[] | undefined> => {
	if (paramValue) {
		const trimmed = paramValue.trim()
		Logger.debug(
			`[GenerateImage] reference_images param received (length=${paramValue.length}, hasNewlines=${paramValue.includes("\n")}, startsWithArray=${trimmed.startsWith("[")})`,
		)
	}
	const parsed = parseReferenceImagesParam(paramValue)
	if (parsed) {
		Logger.debug(
			`[GenerateImage] reference_images parsed (dataUrls=${parsed.dataUrls.length}, filePaths=${parsed.filePaths.length})`,
		)
		const resolvedPaths =
			parsed.filePaths.length > 0 ? await resolveReferenceImagePaths(config, parsed.filePaths) : []
		const combined = dedupeReferenceImages([...parsed.dataUrls, ...resolvedPaths])
		const limited = limitReferenceImagesBySize(combined, "reference_images")
		if (limited.length > 0) {
			logReferenceImagesDebug("reference_images", limited)
			return limited
		}
		if (parsed.filePaths.length > 0 && resolvedPaths.length === 0) {
			const mentionSet = config.services.imageRegistry.getLatestAttachmentSet("mention")
			const mentionDataUrls = mentionSet?.imageIds.length
				? await config.services.imageRegistry.resolveDataUrls(mentionSet.imageIds)
				: []

			if (mentionDataUrls.length > 0) {
				const mentionCombined = dedupeReferenceImages([...parsed.dataUrls, ...mentionDataUrls])
				const mentionLimited = limitReferenceImagesBySize(mentionCombined, "mention")
				if (mentionLimited.length > 0) {
					logReferenceImagesDebug("mention", mentionLimited)
					return mentionLimited
				}
			}
		}
		if (parsed.filePaths.length > 0) {
			Logger.warn(
				`[GenerateImage] No reference images resolved (paths=${parsed.filePaths.length}, samples=${summarizeReferencePaths(
					parsed.filePaths,
				) || "n/a"})`,
			)
		}
	}

	const scopedIds = config.taskState.imageScope?.selectedImageIds ?? []
	if (scopedIds.length > 0) {
		const scopedUrls = await config.services.imageRegistry.resolveDataUrls(scopedIds)
		const limited = limitReferenceImagesBySize(scopedUrls, "scope")
		if (limited.length > 0) {
			logReferenceImagesDebug("scope", limited)
			return limited
		}
	}

	const mentionSet = config.services.imageRegistry.getLatestAttachmentSet("mention")
	if (mentionSet?.imageIds.length) {
		const mentionUrls = await config.services.imageRegistry.resolveDataUrls(mentionSet.imageIds)
		const limited = limitReferenceImagesBySize(mentionUrls, "mention")
		if (limited.length > 0) {
			logReferenceImagesDebug("mention", limited)
			return limited
		}
	}

	return undefined
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
		// CARETI MODIFICATION: Generate deterministic operationId based on block content (not time-based)
		// This ensures same tool call always gets same operationId even if block object is recreated
		const operationId = ensureBlockOperationId(block, ["prompt", "model", "aspect_ratio", "image_size"])

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

		// CARETI MODIFICATION: Use deterministic operationId for reliable message updates (prevents duplicate UI)
		await uiHelpers.say("tool", partialMessage, undefined, undefined, block.partial, operationId)
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		// CARETI MODIFICATION: Generate deterministic operationId based on block content (not time-based)
		// This ensures same tool call always gets same operationId even if block object is recreated
		const operationId = ensureBlockOperationId(block, ["prompt", "model", "aspect_ratio", "image_size"])

		try {

			const prompt = (block.params.prompt || "").trim()
			const model = (block.params.model || "").trim()
			const aspectRatio = (block.params.aspect_ratio || "").trim()
			const imageSize = (block.params.image_size || "").trim()
			const referenceImages = await resolveReferenceImages(config, block.params.reference_images)
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
			Logger.debug(
				`[GenerateImage] Request ready (promptLength=${prompt.length}, model=${model || "default"}, aspectRatio=${finalAspectRatio || "default"}, imageSize=${finalImageSize || "default"}, referenceImages=${referenceImages?.length ?? 0})`,
			)

			const requestId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

			let generatedImageId: string | undefined

			const buildMessage = (overrides: Partial<ToolImageMessage> = {}): string =>
				JSON.stringify({
					tool: "generateImage",
					requestId,
					prompt,
					model: model || undefined,
					aspectRatio: finalAspectRatio,
					imageSize: finalImageSize,
					imageId: generatedImageId,
					status: "generating",
					progressText: "Generating image...",
					...overrides,
				} satisfies ToolImageMessage)

			const completeMessage = buildMessage()

			// CARETI MODIFICATION: Use operationId for reliable message updates (no need for removeLastPartialMessageIfExistsWithType)
			if (config.callbacks.shouldAutoApproveTool(this.name)) {
				await config.callbacks.say("tool", completeMessage, undefined, undefined, true, operationId)
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

				const didApprove = await ToolResultUtils.askApprovalAndPushFeedback("tool", completeMessage, config, operationId)
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
				// CARETI MODIFICATION: Removed duplicate say() call - askApprovalAndPushFeedback already displays the message
			}

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

			const authToken = await CaretiAuthService.getInstance().getAuthToken()
			if (!authToken) {
				const brandName = getCurrentBrandDisplayName()
				// CARETI MODIFICATION: Use JSON structure for i18n support in ErrorRow
				const authErrorData = {
					type: "auth_required",
					action: "generate images",
					toolName: "Generate images",
					brandName: brandName,
				}
				const authError = new Error(JSON.stringify(authErrorData)) as Error & { status: number }
				authError.status = 401
				throw authError
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
				reference_images: referenceImages && referenceImages.length > 0 ? referenceImages : undefined,
				stream: true,
			}

			Logger.debug(`[GenerateImage] Calling API: ${url}`)
			const IMAGE_GENERATION_TIMEOUT_MS = 120000 // 2 minutes
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), IMAGE_GENERATION_TIMEOUT_MS)

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
			Logger.debug(`[GenerateImage] API response: status=${response.status}`)

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
			let savedImageDataUrl: string | undefined
			const workspaceRoot = config.workspaceManager?.getPrimaryRoot()?.path ?? config.cwd
			// CARETI MODIFICATION: Save generated assets under standard .agents/generated-assets
			const assetsDir = path.join(workspaceRoot, getBrandGeneratedAssetsDirName())

			const updateToolMessage = async (overrides: Partial<ToolImageMessage>) => {
				const nextProgress = overrides.progressText ? overrides.progressText.trim() : progressText
				const trimmedProgress =
					nextProgress.length > MAX_PROGRESS_TEXT_LENGTH
						? `${nextProgress.slice(0, MAX_PROGRESS_TEXT_LENGTH - 3)}...`
						: nextProgress
				progressText = trimmedProgress

				// CARETI MODIFICATION: Use operationId for reliable message updates
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
					operationId,
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

										if (!generatedImageId) {
											const dataUrl = `data:${finalMimeType};base64,${base64}`
											savedImageDataUrl = dataUrl
											generatedImageId = config.services.imageRegistry.registerGeneratedImage({
												dataUrl,
												filePath: imagePath,
												originMessageTs: config.taskState.lastMessageTs,
											})
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

			// CARETI MODIFICATION: If image was saved successfully, treat as success even if there was a stream error
			// This handles cases where server sends both error event and image data
			if (streamError && !savedImagePath) {
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
					operationId,
				)
				return formatResponse.toolError(streamError)
			}

			// Log warning if there was an error but image was saved successfully
			if (streamError && savedImagePath) {
				Logger.warn(`[GenerateImage] Stream error occurred but image saved successfully: ${streamError}`)
			}

			// CARETI MODIFICATION: If stream completed but no image was saved, that's an error
			if (!savedImagePath) {
				const noImageError = "Image generation completed but no image was received from the server."
				Logger.error(`[GenerateImage] ${noImageError}`)
				await config.callbacks.say(
					"tool",
					buildMessage({
						status: "error",
						errorMessage: noImageError,
					}),
					undefined,
					undefined,
					false,
					operationId,
				)
				return formatResponse.toolError(noImageError)
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
				operationId,
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

			// CARETI MODIFICATION: Include image in tool result only for models that support images
			// Otherwise, the generated image would cause 400 errors on non-vision models like GLM-4.7
			const supportsImages = config.api.getModel().info.supportsImages ?? false
			const images = supportsImages && savedImageDataUrl ? [savedImageDataUrl] : undefined
			if (!supportsImages && savedImageDataUrl) {
				summaryParts.push("\n[Image generated and saved to file. The current model does not support viewing images directly.]")
			}
			return formatResponse.toolResult(summaryParts.join("\n"), images)
		} catch (error) {
			const message = (error as Error).message || "Image generation failed."
			Logger.error(`[GenerateImage] Failed: ${message}`, error as Error)
			// CARETI MODIFICATION: Use deterministic operationId for reliable message updates
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
				operationId,
			)
			return formatResponse.toolError(message)
		}
	}
}
