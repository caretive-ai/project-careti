// CARETI MODIFICATION: Resolve image mentions to attachments with optional setting toggle.
import { mentionRegexGlobal } from "@shared/context-mentions"
import { createImageId } from "@/careti/shared/images/image-id"
import WebviewLogger from "@/careti/utils/CaretWebviewLogger"
import { optimizeImageDataUrl } from "@/careti/utils/imageOptimization"
import { CaretSystemServiceClient } from "@/services/grpc-client"

const logger = new WebviewLogger("MentionImage")
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"]

const stripQuotes = (value: string): string => {
	const trimmed = value.trim()
	const match = trimmed.match(/^"(.*)"$/)
	return match ? match[1] : trimmed
}

const getMentionPathForExtension = (mention: string): string => {
	const workspaceMatch = mention.match(/^([\w-]+):(.+)$/)
	const pathPart = workspaceMatch && !mention.includes("://") ? workspaceMatch[2] : mention
	return stripQuotes(pathPart)
}

const isImageMention = (mention: string): boolean => {
	const path = getMentionPathForExtension(mention)
	if (!path || path.endsWith("/")) {
		return false
	}
	const lower = path.toLowerCase()
	return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

const extractMentions = (text: string): string[] => {
	const matches = Array.from(text.matchAll(mentionRegexGlobal))
	const mentions = matches.map((match) => match[1]).filter((mention): mention is string => Boolean(mention))
	return Array.from(new Set(mentions))
}

const dedupeImages = (images: string[]): string[] => {
	const seen = new Set<string>()
	const result: string[] = []
	for (const image of images) {
		const id = createImageId(image)
		if (seen.has(id)) {
			continue
		}
		seen.add(id)
		result.push(image)
	}
	return result
}

export const prepareMentionImagePayload = async (params: {
	text: string
	images: string[]
	files: string[]
	supportsImages: boolean
	maxAttachments: number
}): Promise<{ images: string[] }> => {
	const { text, images, files, supportsImages, maxAttachments } = params

	if (!supportsImages) {
		return { images }
	}

	const mentions = extractMentions(text).filter(isImageMention)
	if (mentions.length === 0) {
		return { images }
	}

	let mentionImagesEnabled = false
	try {
		const response = await CaretSystemServiceClient.GetMentionImageSendSetting({})
		mentionImagesEnabled = response.enabled === true
	} catch (error) {
		logger.warn("Failed to load mention image setting", error)
	}

	if (!mentionImagesEnabled) {
		return { images }
	}

	let resolvedDataUrls: string[] = []
	try {
		const response = await CaretSystemServiceClient.ResolveMentionImageDataUrls({ mentions })
		resolvedDataUrls = response.dataUrls ?? []
	} catch (error) {
		logger.warn("Failed to resolve mention image data URLs", error)
		return { images }
	}

	const optimized = await Promise.all(
		resolvedDataUrls.map(async (dataUrl) => {
			if (!dataUrl) {
				return null
			}
			try {
				return await optimizeImageDataUrl(dataUrl)
			} catch (error) {
				logger.warn("Mention image optimization failed", error)
				return null
			}
		}),
	)

	const mentionImages = optimized.filter((dataUrl): dataUrl is string => Boolean(dataUrl))
	if (mentionImages.length === 0) {
		return { images }
	}

	const combined = dedupeImages([...mentionImages, ...images])
	const maxImages = Math.max(0, maxAttachments - files.length)
	const limited = combined.slice(0, maxImages)
	if (combined.length > limited.length) {
		logger.warn("Mention images truncated due to attachment limit", {
			maxAttachments,
			files: files.length,
			images: combined.length,
		})
	}

	return { images: limited }
}
