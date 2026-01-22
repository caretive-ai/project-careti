import { Anthropic } from "@anthropic-ai/sdk"

export const imageBlockToDataUrl = (block: Anthropic.ImageBlockParam): string | null => {
	if (block.type !== "image" || block.source.type !== "base64") {
		return null
	}
	const mimeType = block.source.media_type || "image/png"
	return `data:${mimeType};base64,${block.source.data}`
}

export const dataUrlFromBase64 = (base64: string, mimeType: string): string => {
	return `data:${mimeType};base64,${base64}`
}
