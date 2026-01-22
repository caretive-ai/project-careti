// CARETI MODIFICATION: PPTX (PowerPoint) document parser
// PPTX is a ZIP-based OOXML format
// Structure:
// - [Content_Types].xml         : Content type definitions
// - ppt/presentation.xml        : Presentation metadata
// - ppt/slides/slide1.xml       : Slide content (text in <a:t> tags)
// - ppt/media/                  : Embedded media files

import * as fs from "fs/promises"
import JSZip from "jszip"

import { Logger } from "@/services/logging/Logger"

import type { PptxStructure } from "./types"

/**
 * Parse PPTX document from file path and extract text content
 * @param filePath - Path to the PPTX file
 * @returns Extracted text content
 */
export async function parsePptxFromFile(filePath: string): Promise<string> {
	// Check if file exists
	try {
		await fs.access(filePath)
	} catch {
		throw new Error(`File not found: ${filePath}`)
	}

	const buffer = await fs.readFile(filePath)
	return parsePptx(buffer)
}

/**
 * Parse PPTX document from buffer and extract text content
 * @param buffer - Buffer containing PPTX file data
 * @returns Extracted text content
 */
export async function parsePptx(buffer: Buffer): Promise<string> {
	Logger.debug("[PptxParser] Starting PPTX extraction")

	let zip: JSZip

	try {
		zip = await JSZip.loadAsync(buffer)
	} catch {
		Logger.warn("[PptxParser] Invalid ZIP archive")
		throw new Error("Invalid PPTX file: not a valid ZIP archive")
	}

	// Verify this is a PPTX file by checking for presentation.xml
	const presentationFile = zip.file("ppt/presentation.xml")
	if (!presentationFile) {
		throw new Error("Invalid PPTX file: missing presentation.xml")
	}

	// Get all slide files and sort them by number
	const slideFiles = Object.keys(zip.files)
		.filter((name) => name.match(/^ppt\/slides\/slide\d+\.xml$/))
		.sort((a, b) => {
			// Sort by slide number
			const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0")
			const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0")
			return numA - numB
		})

	if (slideFiles.length === 0) {
		throw new Error("No slides found in PPTX file")
	}

	// Extract text from each slide
	const slideTexts: string[] = []

	for (const filename of slideFiles) {
		const file = zip.file(filename)
		if (file) {
			const xml = await file.async("string")
			const text = extractTextFromPptxSlide(xml)
			if (text.trim()) {
				slideTexts.push(text.trim())
			}
		}
	}

	if (slideTexts.length === 0) {
		Logger.warn("[PptxParser] No text content found in PPTX file")
		throw new Error("No text content found in PPTX file")
	}

	// Join slides with double newlines
	const result = slideTexts.join("\n\n---\n\n")
	Logger.debug(`[PptxParser] Extracted ${slideTexts.length} slides, ${result.length} chars total`)
	return result
}

/**
 * Extract text from PPTX slide XML content
 * PPTX uses <a:t> tags for text content within text runs
 * @param xml - XML string from slide file
 * @returns Extracted plain text
 */
function extractTextFromPptxSlide(xml: string): string {
	const textParts: string[] = []

	// Extract text from <a:t> tags
	// Pattern: <a:t>text content</a:t>
	const textRegex = /<a:t>([^<]*)<\/a:t>/g
	let match

	while ((match = textRegex.exec(xml)) !== null) {
		const text = match[1]
		if (text) {
			textParts.push(text)
		}
	}

	// Join all text parts
	// Note: In PPTX, consecutive <a:t> tags within same <a:p> should be joined without space
	// We'll use a simple approach here and let natural spacing work
	const rawText = textParts.join("")

	// Clean up: normalize whitespace but preserve intentional line breaks
	return rawText
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n")
		.replace(/[ \t]+/g, " ") // Normalize horizontal whitespace
		.replace(/\n\s*\n/g, "\n\n") // Normalize paragraph breaks
		.trim()
}

/**
 * Get structure information about a PPTX document
 * @param buffer - Buffer containing PPTX file data
 * @returns Structure information
 */
export async function getPptxStructure(buffer: Buffer): Promise<PptxStructure> {
	let zip: JSZip

	try {
		zip = await JSZip.loadAsync(buffer)
	} catch {
		throw new Error("Invalid PPTX file: not a valid ZIP archive")
	}

	const files = Object.keys(zip.files)

	// Count slide files
	const slideCount = files.filter((name) => name.match(/^ppt\/slides\/slide\d+\.xml$/)).length

	// Check for media files
	const hasMedia = files.some((name) => name.startsWith("ppt/media/"))

	return {
		slideCount,
		hasMedia,
	}
}
