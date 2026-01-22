// CARETI MODIFICATION: Image reading utility with optimization support

import { optimizeImageDataUrl } from "@careti/utils/image-optimization"
import { getMimeType } from "@integrations/misc/process-files"
import * as fs from "fs/promises"
import * as path from "path"
import { Logger } from "@/services/logging/Logger"

export type ImageContent = {
	data: string
	mimeType: string
	dimensions: {
		width: number
		height: number
	}
	size: number
}

export const ImageReader = {
	async readAndOptimize(
		filePath: string,
		options?: {
			optimize?: boolean
			log?: boolean
		},
	): Promise<ImageContent> {
		const absolutePath = path.resolve(filePath)

		try {
			await fs.access(absolutePath)
		} catch {
			throw new Error(`Image file not found: ${absolutePath}`)
		}

		const buffer = await fs.readFile(absolutePath)
		const mimeType = getMimeType(filePath)

		const sharp = await import("sharp")
		const metadata = await sharp.default(buffer).metadata()

		const content: ImageContent = {
			data: `data:${mimeType};base64,${buffer.toString("base64")}`,
			mimeType,
			dimensions: {
				width: metadata.width || 0,
				height: metadata.height || 0,
			},
			size: buffer.length,
		}

		if (options?.optimize !== false) {
			content.data = await optimizeImageDataUrl(content.data)
		}

		if (options?.log) {
			Logger.info(
				`[ImageReader] Read: ${absolutePath} (${content.dimensions.width}x${content.dimensions.height}, ${formatBytes(content.size)})`,
			)
		}

		return content
	},

	async readMultiple(
		filePaths: string[],
		options?: {
			optimize?: boolean
			log?: boolean
		},
	): Promise<ImageContent[]> {
		return Promise.all(filePaths.map((p) => ImageReader.readAndOptimize(p, options)))
	},
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B"
	const k = 1024
	const sizes = ["B", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}
