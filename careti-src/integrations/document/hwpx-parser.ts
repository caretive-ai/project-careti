// CARETI MODIFICATION: HWPX (한글) document parser
// HWPX is a ZIP-based format containing XML files
// Structure:
// - mimetype                    : application/hwp+zip
// - Preview/PrvText.txt         : Preview text (easiest extraction)
// - Contents/section0.xml       : Main document content
// - Contents/header.xml         : Header information

import * as fs from "fs/promises"
import JSZip from "jszip"

import { Logger } from "@/services/logging/Logger"

import type { HwpxStructure } from "./types"

/**
 * Parse HWPX document from file path and extract text content
 * @param filePath - Path to the HWPX file
 * @returns Extracted text content
 */
export async function parseHwpxFromFile(filePath: string): Promise<string> {
	// Check if file exists
	try {
		await fs.access(filePath)
	} catch {
		throw new Error(`File not found: ${filePath}`)
	}

	const buffer = await fs.readFile(filePath)
	return parseHwpx(buffer)
}

/**
 * Parse HWPX document from buffer and extract text content
 * @param buffer - Buffer containing HWPX file data
 * @returns Extracted text content
 */
export async function parseHwpx(buffer: Buffer): Promise<string> {
	Logger.debug("[HwpxParser] Starting HWPX extraction")

	let zip: JSZip

	try {
		zip = await JSZip.loadAsync(buffer)
	} catch {
		Logger.warn("[HwpxParser] Invalid ZIP archive")
		throw new Error("Invalid HWPX file: not a valid ZIP archive")
	}

	// Verify this is an HWPX file by checking mimetype
	const mimetypeFile = zip.file("mimetype")
	if (mimetypeFile) {
		const mimetype = await mimetypeFile.async("string")
		if (!mimetype.includes("hwp")) {
			throw new Error("Invalid HWPX file: incorrect mimetype")
		}
	}

	// Strategy 1: Try Preview/PrvText.txt first (easiest and most reliable)
	const prvTextFile = zip.file("Preview/PrvText.txt")
	if (prvTextFile) {
		const prvText = await prvTextFile.async("string")
		if (prvText && prvText.trim().length > 0) {
			Logger.debug(`[HwpxParser] Extracted ${prvText.trim().length} chars from Preview/PrvText.txt`)
			return prvText.trim()
		}
	}

	// Strategy 2: Parse Contents/section*.xml files
	const sections: string[] = []
	const sectionFiles = Object.keys(zip.files)
		.filter((name) => name.match(/^Contents\/section\d+\.xml$/))
		.sort((a, b) => {
			// Sort by section number
			const numA = parseInt(a.match(/section(\d+)/)?.[1] || "0")
			const numB = parseInt(b.match(/section(\d+)/)?.[1] || "0")
			return numA - numB
		})

	for (const filename of sectionFiles) {
		const file = zip.file(filename)
		if (file) {
			const xml = await file.async("string")
			const text = extractTextFromHwpxXml(xml)
			if (text.trim()) {
				sections.push(text.trim())
			}
		}
	}

	if (sections.length > 0) {
		const result = sections.join("\n\n")
		Logger.debug(`[HwpxParser] Extracted ${sections.length} sections, ${result.length} chars total`)
		return result
	}

	Logger.warn("[HwpxParser] No text content found in HWPX file")
	throw new Error("No text content found in HWPX file")
}

/**
 * Extract text from HWPX XML content
 * HWPX uses <hp:t> tags for text content within <hp:p> paragraphs
 * @param xml - XML string from section file
 * @returns Extracted plain text
 */
function extractTextFromHwpxXml(xml: string): string {
	const paragraphs: string[] = []

	// Extract text from <hp:t> tags
	// Pattern: <hp:t>text content</hp:t>
	const textRegex = /<hp:t[^>]*>([^<]*)<\/hp:t>/g
	let match
	let currentParagraph: string[] = []
	let lastIndex = 0

	// Also track paragraph boundaries with <hp:p> tags
	const paragraphStartRegex = /<hp:p[^>]*>/g
	const paragraphEndRegex = /<\/hp:p>/g

	// Simple approach: extract all <hp:t> content
	while ((match = textRegex.exec(xml)) !== null) {
		const text = match[1]
		if (text && text.trim()) {
			currentParagraph.push(text)
		}
	}

	// Join all text with spaces, then split by double spaces or patterns
	const allText = currentParagraph.join("")

	// Clean up the text
	return allText
		.replace(/\s+/g, " ") // Normalize whitespace
		.trim()
}

/**
 * Get structure information about an HWPX document
 * @param buffer - Buffer containing HWPX file data
 * @returns Structure information
 */
export async function getHwpxStructure(buffer: Buffer): Promise<HwpxStructure> {
	let zip: JSZip

	try {
		zip = await JSZip.loadAsync(buffer)
	} catch {
		throw new Error("Invalid HWPX file: not a valid ZIP archive")
	}

	const files = Object.keys(zip.files)

	// Check for Preview/PrvText.txt
	const hasPreviewText = files.includes("Preview/PrvText.txt")

	// Count section files
	const sectionCount = files.filter((name) => name.match(/^Contents\/section\d+\.xml$/)).length

	// Check for images in BinData folder
	const hasImages = files.some((name) => name.startsWith("BinData/") && /\.(png|jpg|jpeg|gif|bmp)$/i.test(name))

	return {
		hasPreviewText,
		sectionCount,
		hasImages,
	}
}
