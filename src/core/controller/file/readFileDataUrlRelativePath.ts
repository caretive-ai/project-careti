// CARET MODIFICATION: Support data URL reads for tool-generated images with safe path checks.
import { workspaceResolver } from "@core/workspace"
import { String, StringRequest } from "@shared/proto/cline/common"
import { getBrandGeneratedAssetsDirName } from "@caret/utils/brand-utils" // CARET MODIFICATION: brand-aware generated assets path
import { getWorkspacePath } from "@utils/path"
import * as fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { getSavedClineMessages } from "@/core/storage/disk"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@/services/logging/Logger"
import type { ClineMessage } from "@/shared/ExtensionMessage"
import { HistoryItem } from "@/shared/HistoryItem"
import { Controller } from ".."

const MIME_BY_EXTENSION: Record<string, string> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
	".avif": "image/avif",
	".svg": "image/svg+xml",
}

const getMimeType = (filePath: string): string => {
	const extension = path.extname(filePath).toLowerCase()
	return MIME_BY_EXTENSION[extension] ?? "application/octet-stream"
}

/**
 * Reads a file from the workspace (relative path) and returns a data URL for webview rendering.
 */
export async function readFileDataUrlRelativePath(controller: Controller, request: StringRequest): Promise<String> {
	if (!request.value) {
		return String.create({ value: "" })
	}

	const readDataUrl = async (absolutePath: string, logError = false): Promise<string | undefined> => {
		try {
			const buffer = await fs.readFile(absolutePath)
			const mimeType = getMimeType(absolutePath)
			const base64 = buffer.toString("base64")
			return `data:${mimeType};base64,${base64}`
		} catch (error) {
			if (logError) {
				Logger.error(`Error in readFileDataUrlRelativePath: Failed to read file ${absolutePath}`, error as Error)
			}
			return undefined
		}
	}

	const normalizeRequestPath = (value: string): string => {
		const trimmed = value.trim()
		if (trimmed.startsWith("file://")) {
			try {
				return fileURLToPath(trimmed)
			} catch {
				return trimmed
			}
		}
		return trimmed
	}

	const requestPath = normalizeRequestPath(request.value)
	if (!requestPath) {
		return String.create({ value: "" })
	}

	const workspacePaths = (await HostProvider.workspace.getWorkspacePaths({})).paths
	const uniqueRoots = new Set(workspacePaths.filter(Boolean))
	if (uniqueRoots.size === 0) {
		const fallbackRoot = await getWorkspacePath()
		if (fallbackRoot) {
			uniqueRoots.add(fallbackRoot)
		}
	}

	for (const root of controller.getWorkspaceManager()?.getRoots() ?? []) {
		if (root.path) {
			uniqueRoots.add(root.path)
		}
	}

	const taskHistory = controller.stateManager.getGlobalStateKey("taskHistory") as HistoryItem[] | undefined
	for (const item of taskHistory ?? []) {
		if (item?.cwdOnTaskInitialization) {
			uniqueRoots.add(item.cwdOnTaskInitialization)
		}
	}

	const rootList = Array.from(uniqueRoots)
	const isPathWithinRoots = (absolutePath: string): boolean => {
		if (rootList.length === 0) {
			return false
		}
		const normalizedPath = path.resolve(absolutePath)
		return rootList.some((root) => {
			const normalizedRoot = path.resolve(root)
			return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}${path.sep}`)
		})
	}

	if (path.isAbsolute(requestPath)) {
		if (!isPathWithinRoots(requestPath)) {
			Logger.warn(`Error in readFileDataUrlRelativePath: Refusing absolute path ${requestPath}`)
			return String.create({ value: "" })
		}
		const dataUrl = await readDataUrl(requestPath, true)
		if (!dataUrl) {
			Logger.error(`Error in readFileDataUrlRelativePath: Failed to read absolute path ${requestPath}`)
		}
		return String.create({ value: dataUrl ?? "" })
	}

	const findAbsolutePathInMessages = (messages: ClineMessage[], relativePath: string): string | undefined => {
		const requestMatch = relativePath.match(
			new RegExp(
				`(?:${getBrandGeneratedAssetsDirName()
					.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")
					.replace(/\//g, "[\\\\/]")}|assets)[\\\\/](img_[^\\\\/]+?)(?:\\.[^\\\\/]+)?$`,
			),
		)
		const requestId = requestMatch ? requestMatch[1] : undefined
		for (const message of messages) {
			const isToolMessage =
				(message.type === "say" && message.say === "tool") || (message.type === "ask" && message.ask === "tool")
			if (!isToolMessage || !message.text) {
				continue
			}
			let payload: Record<string, unknown>
			try {
				payload = JSON.parse(message.text)
			} catch {
				continue
			}
			if (payload.tool !== "generateImage") {
				continue
			}
			const absolutePath = typeof payload.workspaceAbsolutePath === "string" ? payload.workspaceAbsolutePath : undefined
			if (!absolutePath) {
				continue
			}
			const relativeMatch = typeof payload.workspaceRelativePath === "string" ? payload.workspaceRelativePath : undefined
			const requestIdMatch = typeof payload.requestId === "string" ? payload.requestId : undefined
			if (relativeMatch === relativePath || (requestId && requestIdMatch === requestId)) {
				return absolutePath
			}
		}
		return undefined
	}

	const taskMessages = controller.task?.messageStateHandler.getClineMessages() ?? []
	let taskAbsolutePath = findAbsolutePathInMessages(taskMessages, requestPath)
	if (!taskAbsolutePath && controller.task?.taskId) {
		try {
			const savedMessages = await getSavedClineMessages(controller.task.taskId)
			taskAbsolutePath = findAbsolutePathInMessages(savedMessages, requestPath)
		} catch (error) {
			Logger.error("Error in readFileDataUrlRelativePath: Failed to read saved task messages", error as Error)
		}
	}
	if (taskAbsolutePath) {
		const dataUrl = await readDataUrl(taskAbsolutePath, true)
		if (dataUrl) {
			return String.create({ value: dataUrl })
		}
	}

	if (rootList.length === 0) {
		Logger.error("Error in readFileDataUrlRelativePath: No workspace path available")
		return String.create({ value: "" })
	}

	for (const workspacePath of rootList) {
		try {
			const resolvedPath = workspaceResolver.resolveWorkspacePath(
				workspacePath,
				requestPath,
				"Controller.readFileDataUrlRelativePath",
			)
			const absolutePath = typeof resolvedPath === "string" ? resolvedPath : resolvedPath.absolutePath
			const dataUrl = await readDataUrl(absolutePath)
			if (dataUrl) {
				return String.create({ value: dataUrl })
			}
		} catch {}
	}

	Logger.error(`Error in readFileDataUrlRelativePath: Failed to resolve path ${requestPath}`)
	return String.create({ value: "" })
}
