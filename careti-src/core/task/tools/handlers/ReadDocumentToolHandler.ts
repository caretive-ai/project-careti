// CARETI MODIFICATION: Read document files (PDF, DOCX, HWPX, PPTX, etc.) for LLM analysis
// This tool allows LLMs to read document files by path without requiring user attachment

import { ClineSayTool } from "@shared/ExtensionMessage"
import { ClineDefaultTool } from "@shared/tools"
import * as fs from "fs/promises"
import * as path from "path"
import { fileURLToPath } from "url"

import { Logger } from "@/services/logging/Logger"
import { telemetryService } from "@/services/telemetry"
import { ToolUse } from "@core/assistant-message"
import { formatResponse } from "@core/prompts/responses"
import { getReadablePath, isLocatedInPath } from "@utils/path"

import { DocumentExtractor } from "@careti/integrations/document/document-extractor"
import { ensureBlockOperationId } from "@careti/core/task/tools/utils/operationIdUtils"

import type { ToolResponse } from "@core/task"
import type { IFullyManagedTool } from "@core/task/tools/ToolExecutorCoordinator"
import type { TaskConfig } from "@core/task/tools/types/TaskConfig"
import type { StronglyTypedUIHelpers } from "@core/task/tools/types/UIHelpers"

type ToolReadDocumentMessage = ClineSayTool & {
	tool: "readDocument"
	documentPath?: string
	status?: "pending" | "reading" | "completed" | "error"
	progressText?: string // CARETI MODIFICATION: Progress text for UI display
	fileSize?: string // CARETI MODIFICATION: Human-readable file size
	result?: string
	format?: string
	errorMessage?: string
	operationIsLocatedInWorkspace?: boolean
}

const stripQuotes = (value: string): string => {
	const trimmed = value.trim()
	const match = trimmed.match(/^"(.*)"$/)
	return match ? match[1] : trimmed
}

/**
 * Format file size to human-readable string
 */
function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Resolve document path to absolute path
 */
function resolveDocumentPath(documentPath: string, cwd: string): string {
	let absolutePath = documentPath

	// Handle file:// URLs
	if (documentPath.startsWith("file://")) {
		try {
			absolutePath = fileURLToPath(documentPath)
		} catch {
			throw new Error(`Invalid file URL: ${documentPath}`)
		}
	}

	// Handle relative paths
	if (!path.isAbsolute(absolutePath)) {
		absolutePath = path.resolve(cwd, absolutePath)
	}

	// Normalize the path
	absolutePath = path.normalize(absolutePath)

	return absolutePath
}

export class ReadDocumentToolHandler implements IFullyManagedTool {
	readonly name = ClineDefaultTool.READ_DOCUMENT

	private extractor: DocumentExtractor

	constructor() {
		this.extractor = new DocumentExtractor()
	}

	getDescription(block: ToolUse): string {
		const documentPath = block.params.path
		return `[${block.name} for '${documentPath}']`
	}

	async handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void> {
		// CARETI MODIFICATION: Reuse a stable operationId for streaming UI updates (prevents duplicate tool cards)
		const operationId = ensureBlockOperationId(block, ["path"])
		const documentPath = block.params.path

		const sharedMessageProps: ToolReadDocumentMessage = {
			tool: "readDocument",
			documentPath: documentPath ? stripQuotes(documentPath) : undefined,
			status: "pending",
		}

		const partialMessage = JSON.stringify(sharedMessageProps)
		await uiHelpers.say("tool", partialMessage, undefined, undefined, block.partial, operationId)
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		// CARETI MODIFICATION: Reuse a stable operationId for progress updates (prevents duplicate tool cards)
		const operationId = ensureBlockOperationId(block, ["path"])
		const documentPath: string | undefined = block.params.path

		// Extract provider information for telemetry
		const apiConfig = config.services.stateManager.getApiConfiguration()
		const currentMode = config.services.stateManager.getGlobalSettingsKey("mode")
		const provider = (currentMode === "plan" ? apiConfig.planModeApiProvider : apiConfig.actModeApiProvider) as string

		// Validate required parameters
		if (!documentPath) {
			config.taskState.consecutiveMistakeCount++
			return await config.callbacks.sayAndCreateMissingParamError(this.name, "path")
		}

		config.taskState.consecutiveMistakeCount = 0

		const cleanDocumentPath = stripQuotes(documentPath)

		// Build message for UI
		const buildMessage = (overrides: Partial<ToolReadDocumentMessage> = {}): string => {
			const message: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: cleanDocumentPath,
				status: "pending",
				...overrides,
			}
			return JSON.stringify(message)
		}

		// Resolve absolute path
		const workspaceRoot = config.workspaceManager?.getPrimaryRoot()?.path ?? config.cwd
		let absolutePath: string

		try {
			absolutePath = resolveDocumentPath(cleanDocumentPath, workspaceRoot)
		} catch (error) {
			const message = (error as Error).message
			Logger.error(`[ReadDocument] Path resolution failed:`, error as Error)

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

		// Security: Check if file is within workspace
		const isInWorkspace = isLocatedInPath(absolutePath, workspaceRoot)
		const readablePath = getReadablePath(workspaceRoot, absolutePath)

		// Get file size for display
		let fileSizeStr: string | undefined
		try {
			const stats = await fs.stat(absolutePath)
			fileSizeStr = formatFileSize(stats.size)
		} catch {
			// File doesn't exist or can't be accessed - will be caught later
		}

		// Check if format is supported
		if (!this.extractor.isSupported(absolutePath)) {
			const ext = path.extname(absolutePath).toLowerCase()
			const supportedFormats = this.extractor.getSupportedFormats().join(", ")
			const errorMsg = `Unsupported document format: ${ext}. Supported formats: ${supportedFormats}`

			Logger.warn(`[ReadDocument] ${errorMsg}`)

			await config.callbacks.say(
				"tool",
				buildMessage({
					status: "error",
					errorMessage: errorMsg,
					operationIsLocatedInWorkspace: isInWorkspace,
				}),
				undefined,
				undefined,
				false,
				operationId,
			)

			return formatResponse.toolError(errorMsg)
		}

		// Show tool message (auto-approve since read-only)
		const completeMessage = buildMessage({
			status: "pending",
			fileSize: fileSizeStr,
			operationIsLocatedInWorkspace: isInWorkspace,
		})
		await config.callbacks.say("tool", completeMessage, undefined, undefined, false, operationId)

		// Telemetry
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

		// Run PreToolUse hook
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

		// Get file extension for progress message
		const ext = path.extname(absolutePath).toLowerCase().slice(1).toUpperCase() || "document"

		// Update status to reading (progressText will be translated in frontend)
		await config.callbacks.say(
			"tool",
			buildMessage({
				status: "reading",
				fileSize: fileSizeStr,
				operationIsLocatedInWorkspace: isInWorkspace,
			}),
			undefined,
			undefined,
			true,
			operationId,
		)

		try {
			Logger.debug(`[ReadDocument] Reading document: ${absolutePath}`)

			// CARETI MODIFICATION: Add timeout to prevent infinite waiting on large documents
			const DOCUMENT_TIMEOUT_MS = 120000 // 2 minutes

			const extractPromise = this.extractor.extract(absolutePath, {
				cwd: workspaceRoot,
			})

			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => {
					reject(new Error(`Document extraction timed out after ${DOCUMENT_TIMEOUT_MS / 1000} seconds`))
				}, DOCUMENT_TIMEOUT_MS)
			})

			const result = await Promise.race([extractPromise, timeoutPromise])

			Logger.info(`[ReadDocument] Successfully extracted ${result.content.length} chars from ${result.format}`)

			// Update status to completed
			await config.callbacks.say(
				"tool",
				buildMessage({
					status: "completed",
					format: result.format,
					fileSize: fileSizeStr,
					operationIsLocatedInWorkspace: isInWorkspace,
				}),
				undefined,
				undefined,
				false,
				operationId,
			)

			// Return extracted content with metadata
			const responseText = [
				`Document: ${readablePath}`,
				`Format: ${result.format.toUpperCase()}`,
				`---`,
				result.content,
			].join("\n")

			return formatResponse.toolResult(responseText)
		} catch (error) {
			const message = (error as Error).message || "Document extraction failed."
			Logger.error("[ReadDocument] Extraction failed:", error as Error)

			await config.callbacks.say(
				"tool",
				buildMessage({
					status: "error",
					errorMessage: message,
					fileSize: fileSizeStr,
					operationIsLocatedInWorkspace: isInWorkspace,
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
