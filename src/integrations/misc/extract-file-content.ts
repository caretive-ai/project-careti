import { Anthropic } from "@anthropic-ai/sdk"
import fs from "fs/promises"
import * as path from "path"
import { extractImageContent } from "./extract-images"
import { callTextExtractionFunctions } from "./extract-text"

export type FileContentResult = {
	text: string
	imageBlock?: Anthropic.ImageBlockParam
}

/**
 * CARETI MODIFICATION: Get similar file suggestions when file not found
 * Searches the parent directory for files with similar names
 */
async function getFileSuggestions(filepath: string): Promise<string[]> {
	const dir = path.dirname(filepath)
	const base = path.basename(filepath).toLowerCase()

	try {
		const entries = await fs.readdir(dir)
		return entries
			.filter((entry) => {
				const entryLower = entry.toLowerCase()
				// Match if filename contains search term or vice versa
				return entryLower.includes(base) || base.includes(entryLower)
			})
			.map((entry) => path.join(dir, entry))
			.slice(0, 3)
	} catch {
		// Directory doesn't exist or can't be read
		return []
	}
}

/**
 * Extract content from a file, handling both text and images
 * Extra logic for handling images based on whether the model supports images
 */
export async function extractFileContent(absolutePath: string, modelSupportsImages: boolean): Promise<FileContentResult> {
	// Check if file exists first
	try {
		await fs.access(absolutePath)
	} catch (_error) {
		// CARETI MODIFICATION: Add "Did you mean?" file suggestions
		const suggestions = await getFileSuggestions(absolutePath)
		if (suggestions.length > 0) {
			throw new Error(`File not found: ${absolutePath}\n\nDid you mean one of these?\n${suggestions.join("\n")}`)
		}
		throw new Error(`File not found: ${absolutePath}`)
	}

	const fileExtension = path.extname(absolutePath).toLowerCase()
	const imageExtensions = [".png", ".jpg", ".jpeg", ".webp"]
	const isImage = imageExtensions.includes(fileExtension)

	if (isImage && modelSupportsImages) {
		const imageResult = await extractImageContent(absolutePath)

		if (imageResult.success) {
			return {
				text: "Successfully read image",
				imageBlock: imageResult.imageBlock,
			}
		} else {
			throw new Error(imageResult.error)
		}
	} else if (isImage && !modelSupportsImages) {
		// CARETI MODIFICATION: Text-only models can't view images, return path info instead
		// Model can use analyze_image tool if it needs to examine the image content
		const fileName = path.basename(absolutePath)
		return {
			text: `[Image file: ${fileName}]\nPath: ${absolutePath}\nNote: Current model cannot view images directly. Use the analyze_image tool to examine this image.`,
		}
	} else {
		// Handle text files using existing extraction functions
		try {
			const textContent = await callTextExtractionFunctions(absolutePath)
			return {
				text: textContent,
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			throw new Error(`Error reading file: ${errorMessage}`)
		}
	}
}
