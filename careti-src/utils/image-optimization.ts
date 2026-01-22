// CARETI MODIFICATION: Backend image validation - 7500px pixel limit only (matches cline-latest behavior).
// No resize or format conversion - just validate dimensions.
// Large file handling is server's responsibility (nginx client_max_body_size).

// Safe logging that doesn't require HostProvider (for test environments)
const safeLog = {
	warn: (msg: string) => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const { Logger } = require("@/services/logging/Logger")
			Logger.warn(msg)
		} catch {
			console.warn(msg)
		}
	},
	debug: (msg: string) => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const { Logger } = require("@/services/logging/Logger")
			Logger.debug(msg)
		} catch {
			// Silent in test environments
		}
	},
}

type SharpFactory = typeof import("sharp")

let sharpPromise: Promise<SharpFactory | null> | null = null

const loadSharp = async (): Promise<SharpFactory | null> => {
	if (sharpPromise) {
		return sharpPromise
	}
	sharpPromise = (async () => {
		try {
			const mod = (await import("sharp")) as SharpFactory | { default?: SharpFactory }
			if (typeof (mod as { default?: SharpFactory }).default === "function") {
				return (mod as { default: SharpFactory }).default
			}
			return mod as SharpFactory
		} catch {
			return null
		}
	})()
	return sharpPromise
}

const MAX_INPUT_DIMENSION = 7500

const parseDataUrl = (value: string): { mimeType: string; base64: string } => {
	const match = value.match(/^data:([^;]+);base64,(.+)$/i)
	if (!match) {
		throw new Error("Invalid data URL.")
	}
	return { mimeType: match[1].toLowerCase(), base64: match[2] }
}

/**
 * Validate image dimensions (7500px max, same as cline-latest).
 * No optimization/resize - returns original if valid.
 */
export const optimizeImageDataUrl = async (dataUrl: string): Promise<string> => {
	const sharp = await loadSharp()
	if (!sharp) {
		safeLog.warn("[ImageOptimization] Sharp library not available, skipping validation")
		return dataUrl
	}

	const { base64 } = parseDataUrl(dataUrl)
	const inputBuffer = Buffer.from(base64, "base64")
	const metadata = await sharp(inputBuffer, { failOnError: false }).metadata()

	if (!metadata.width || !metadata.height) {
		throw new Error("Failed to determine image dimensions.")
	}

	if (metadata.width > MAX_INPUT_DIMENSION || metadata.height > MAX_INPUT_DIMENSION) {
		throw new Error(`Image dimensions exceed maximum allowed size of ${MAX_INPUT_DIMENSION}px.`)
	}

	safeLog.debug(`[ImageOptimization] Image validated: ${metadata.width}x${metadata.height}px`)
	return dataUrl
}
