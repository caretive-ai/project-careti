// CARETI MODIFICATION: PPT (구형 PowerPoint) document parser
// Uses SheetJS ppt library for parsing legacy PPT binary format
// PPT is an OLE Compound Document format (different from ZIP-based PPTX)

import * as fs from "fs/promises"

import { Logger } from "@/services/logging/Logger"

// SheetJS ppt library
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PPT = require("ppt")
// CFB (Compound File Binary) library for OLE document parsing
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CFB = require("cfb")

/**
 * Parse PPT document from file path and extract text content
 * @param filePath - Path to the PPT file
 * @returns Extracted text content
 */
export async function parsePptFromFile(filePath: string): Promise<string> {
	// Check if file exists
	try {
		await fs.access(filePath)
	} catch {
		throw new Error(`File not found: ${filePath}`)
	}

	const buffer = await fs.readFile(filePath)
	return parsePpt(buffer)
}

/**
 * Parse PPT document from buffer and extract text content
 * @param buffer - Buffer containing PPT file data
 * @returns Extracted text content
 */
export async function parsePpt(buffer: Buffer): Promise<string> {
	Logger.debug("[PptParser] Starting PPT extraction")

	try {
		// Parse CFB (OLE Compound Document) from buffer
		const cfb = CFB.read(buffer, { type: "buffer" })

		// Parse PPT structure from CFB
		const presentation = PPT.parse_pptcfb(cfb, {})

		// Extract text using utility function
		const textArray = PPT.utils.to_text(presentation)

		if (!textArray || textArray.length === 0) {
			Logger.warn("[PptParser] No text content found in PPT")
			return ""
		}

		// Join all text content with newlines
		const result = textArray
			.filter((text: unknown) => text && typeof text === "string")
			.map((text: string) => text.trim())
			.filter((text: string) => text.length > 0)
			.join("\n\n")

		Logger.debug(`[PptParser] Extracted ${result.length} chars from PPT file`)

		return result
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		Logger.warn(`[PptParser] Failed to parse PPT: ${errorMessage}`)
		throw new Error(`Invalid PPT file or parse error: ${errorMessage}`)
	}
}
