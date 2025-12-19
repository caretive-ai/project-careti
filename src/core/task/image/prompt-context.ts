// CARET MODIFICATION: Utility to derive the user's prompt context when routing to the image generation loop.
import {
	ClineContent,
	ClineDocumentContentBlock,
	ClineImageContentBlock,
} from "@/shared/messages/content"

export interface ImagePromptContext {
	prompt: string
	images: string[]
	files: string[]
	hasLikelyUserText: boolean
}

const SYSTEM_TEXT_PREFIXES = ["[ERROR]", "[NOTE]", "[TASK", "<", "#"]

export function buildImagePromptContext(userContent: ClineContent[]): ImagePromptContext {
	const textChunks: string[] = []
	const imageUrls: string[] = []
	const fileEntries: string[] = []
	let hasLikelyUserText = false

	for (const block of userContent) {
		if (block.type === "text") {
			const trimmedText = block.text?.trim()
			if (!trimmedText) {
				continue
			}
			textChunks.push(trimmedText)
			if (!isSystemLikeText(trimmedText)) {
				hasLikelyUserText = true
			}
		} else if (block.type === "image") {
			const imageBlock = block as ClineImageContentBlock
			const source = imageBlock.source
			if (source?.type === "base64" && source.media_type && source.data) {
				imageUrls.push(`data:${source.media_type};base64,${source.data}`)
			}
		} else if (block.type === "document") {
			const documentBlock = block as ClineDocumentContentBlock
			const title = documentBlock.title?.trim() || "document"
			const context = documentBlock.context?.trim()
			const parts = [`[Document: ${title}]`]
			if (context) {
				parts.push(context)
			}
			fileEntries.push(parts.join("\n"))
		}
	}

	return {
		prompt: textChunks.join("\n\n").trim(),
		images: imageUrls,
		files: fileEntries,
		hasLikelyUserText,
	}
}

function isSystemLikeText(text: string): boolean {
	if (!text) {
		return true
	}
	const normalized = text.trim()
	return SYSTEM_TEXT_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}
