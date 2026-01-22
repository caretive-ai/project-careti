// CARETI MODIFICATION: Resolve mention image data URLs with workspace-aware paths.
import path from "path"
import type { Controller } from "@/core/controller"
import { readFileDataUrlRelativePath } from "@/core/controller/file/readFileDataUrlRelativePath"
import { Logger } from "@/services/logging/Logger"
import * as proto from "@/shared/proto"
import { StringRequest } from "@/shared/proto/cline/common"

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"])

const stripQuotes = (value: string): string => {
	const trimmed = value.trim()
	const match = trimmed.match(/^"(.*)"$/)
	return match ? match[1] : trimmed
}

const parseWorkspaceMention = (mention: string): { workspaceHint: string; path: string } | null => {
	const workspaceMatch = mention.match(/^([\w-]+):(.+)$/)
	if (!workspaceMatch) {
		return null
	}
	if (mention.includes("://")) {
		return null
	}
	const [, workspaceHint, pathPart] = workspaceMatch
	return { workspaceHint, path: stripQuotes(pathPart) }
}

const parseMentionPath = (mention: string): { workspaceHint?: string; path: string } | null => {
	const trimmed = mention.trim().replace(/^@/, "")
	const workspaceMention = parseWorkspaceMention(trimmed)
	if (workspaceMention) {
		return workspaceMention
	}
	const pathPart = stripQuotes(trimmed)
	if (!pathPart.startsWith("/")) {
		return null
	}
	return { path: pathPart }
}

const toRelativePath = (mentionPath: string): string => {
	return mentionPath.startsWith("/") ? mentionPath.slice(1) : mentionPath
}

const isSupportedImagePath = (mentionPath: string): boolean => {
	if (!mentionPath || mentionPath.endsWith("/")) {
		return false
	}
	const extension = path.extname(mentionPath).toLowerCase()
	return IMAGE_EXTENSIONS.has(extension)
}

const resolveMentionDataUrl = async (controller: Controller, mention: string): Promise<string | undefined> => {
	const parsed = parseMentionPath(mention)
	if (!parsed) {
		return undefined
	}
	const relativePath = toRelativePath(parsed.path)
	if (!isSupportedImagePath(relativePath)) {
		return undefined
	}

	try {
		if (parsed.workspaceHint) {
			const root = controller.getWorkspaceManager()?.getRootByName(parsed.workspaceHint)
			if (!root?.path) {
				return undefined
			}
			const absolutePath = path.resolve(root.path, relativePath)
			const response = await readFileDataUrlRelativePath(controller, StringRequest.create({ value: absolutePath }))
			return response.value || undefined
		}

		const response = await readFileDataUrlRelativePath(controller, StringRequest.create({ value: relativePath }))
		return response.value || undefined
	} catch (error) {
		Logger.error(`[ResolveMentionImageDataUrls] Failed to resolve mention ${mention}`, error as Error)
		return undefined
	}
}

export async function ResolveMentionImageDataUrls(
	controller: Controller,
	request: proto.careti.ResolveMentionImageDataUrlsRequest,
): Promise<proto.careti.ResolveMentionImageDataUrlsResponse> {
	const mentions = request.mentions ?? []
	const dataUrls = await Promise.all(mentions.map((mention) => resolveMentionDataUrl(controller, mention)))
	return proto.careti.ResolveMentionImageDataUrlsResponse.create({
		dataUrls: dataUrls.map((dataUrl: string | undefined) => dataUrl ?? ""),
	})
}
