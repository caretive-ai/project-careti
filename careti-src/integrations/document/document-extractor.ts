// CARETI MODIFICATION: Unified document extractor for read_document tool
// Supports: PDF, DOCX, XLSX, PPTX, HWPX, HWP, IPYNB

import * as fs from "fs/promises"
import * as path from "path"

// Import existing extractors from Cline codebase
// @ts-ignore-next-line
import pdf from "pdf-parse/lib/pdf-parse"
import mammoth from "mammoth"
import ExcelJS from "exceljs"

import { Logger } from "@/services/logging/Logger"

// Import Careti-specific parsers
import { parseHwpx } from "./hwpx-parser"
import { parseHwp } from "./hwp-parser"
import { parsePptx } from "./pptx-parser"

import type { DocumentFormat, ExtractOptions, ExtractResult } from "./types"

/** Default maximum file size: 50MB */
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024

/** Supported document formats */
const SUPPORTED_FORMATS: DocumentFormat[] = ["pdf", "docx", "xlsx", "pptx", "hwpx", "hwp", "ipynb"]

/** Extension to format mapping */
const EXTENSION_MAP: Record<string, DocumentFormat> = {
	".pdf": "pdf",
	".docx": "docx",
	".xlsx": "xlsx",
	".pptx": "pptx",
	".hwpx": "hwpx",
	".hwp": "hwp",
	".ipynb": "ipynb",
}

/** Legacy formats that are detected but not supported (with user-friendly messages) */
const LEGACY_UNSUPPORTED_FORMATS: Record<string, string> = {
	".ppt":
		"Legacy PowerPoint (.ppt) format is not supported. No pure JavaScript parser exists for this binary format. " +
		"Please convert to .pptx using: LibreOffice, Google Slides, or Microsoft PowerPoint.",
	".doc":
		"Legacy Word (.doc) format is not supported. No pure JavaScript parser exists for this binary format. " +
		"Please convert to .docx using: LibreOffice, Google Docs, or Microsoft Word.",
	".xls":
		"Legacy Excel (.xls) format is not supported. No pure JavaScript parser exists for this binary format. " +
		"Please convert to .xlsx using: LibreOffice, Google Sheets, or Microsoft Excel.",
}

/**
 * Unified document extractor class
 * Extracts text content from various document formats
 */
export class DocumentExtractor {
	/**
	 * Extract text content from a document file
	 * @param filePath - Path to the document (absolute or relative)
	 * @param options - Extraction options
	 * @returns Extraction result with content and metadata
	 */
	async extract(filePath: string, options: ExtractOptions): Promise<ExtractResult> {
		// Resolve to absolute path
		const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(options.cwd, filePath)

		Logger.debug(`[DocumentExtractor] Processing file: ${absolutePath}`)

		// Check if file exists
		try {
			await fs.access(absolutePath)
		} catch {
			Logger.warn(`[DocumentExtractor] File not found: ${absolutePath}`)
			throw new Error(`File not found: ${absolutePath}`)
		}

		// Check file size
		const stats = await fs.stat(absolutePath)
		const maxSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE
		if (stats.size > maxSize) {
			Logger.warn(`[DocumentExtractor] File too large: ${stats.size} bytes (max: ${maxSize} bytes)`)
			throw new Error(`File too large: ${stats.size} bytes (max: ${maxSize} bytes)`)
		}

		// Detect format from extension
		const ext = path.extname(absolutePath).toLowerCase()

		// Check for legacy unsupported formats first (provide helpful message)
		if (ext in LEGACY_UNSUPPORTED_FORMATS) {
			const message = LEGACY_UNSUPPORTED_FORMATS[ext]
			Logger.warn(`[DocumentExtractor] Legacy format detected: ${ext}`)
			throw new Error(message)
		}

		const format = EXTENSION_MAP[ext]

		if (!format) {
			Logger.warn(`[DocumentExtractor] Unsupported format: ${ext}`)
			throw new Error(`Unsupported document format: ${ext}`)
		}

		Logger.debug(`[DocumentExtractor] Detected format: ${format} (${stats.size} bytes)`)

		// Extract content based on format
		const content = await this.extractByFormat(absolutePath, format)

		return {
			content,
			format,
			filePath: absolutePath,
		}
	}

	/**
	 * Extract content based on document format
	 */
	private async extractByFormat(filePath: string, format: DocumentFormat): Promise<string> {
		switch (format) {
			case "pdf":
				return this.extractPdf(filePath)
			case "docx":
				return this.extractDocx(filePath)
			case "xlsx":
				return this.extractXlsx(filePath)
			case "pptx":
				return this.extractPptx(filePath)
			case "hwpx":
				return this.extractHwpx(filePath)
			case "hwp":
				return this.extractHwp(filePath)
			case "ipynb":
				return this.extractIpynb(filePath)
			default:
				throw new Error(`Unsupported format: ${format}`)
		}
	}

	/**
	 * Extract text from PDF file
	 */
	private async extractPdf(filePath: string): Promise<string> {
		const buffer = await fs.readFile(filePath)
		const data = await pdf(buffer)
		return data.text
	}

	/**
	 * Extract text from DOCX file
	 */
	private async extractDocx(filePath: string): Promise<string> {
		const result = await mammoth.extractRawText({ path: filePath })
		return result.value
	}

	/**
	 * Extract text from XLSX file
	 */
	private async extractXlsx(filePath: string): Promise<string> {
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.readFile(filePath)

		const sheets: string[] = []

		workbook.eachSheet((worksheet, _sheetId) => {
			// Skip hidden sheets
			if (worksheet.state === "hidden" || worksheet.state === "veryHidden") {
				return
			}

			const sheetLines: string[] = [`--- Sheet: ${worksheet.name} ---`]

			worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
				// Limit processing for very large sheets
				if (rowNumber > 50000) {
					sheetLines.push(`[... truncated at row ${rowNumber} ...]`)
					return false
				}

				const rowTexts: string[] = []
				let hasContent = false

				row.eachCell({ includeEmpty: true }, (cell, _colNumber) => {
					const cellText = this.formatCellValue(cell)
					if (cellText.trim()) {
						hasContent = true
					}
					rowTexts.push(cellText)
				})

				if (hasContent) {
					sheetLines.push(rowTexts.join("\t"))
				}

				return true
			})

			sheets.push(sheetLines.join("\n"))
		})

		return sheets.join("\n\n")
	}

	/**
	 * Format Excel cell value
	 */
	private formatCellValue(cell: ExcelJS.Cell): string {
		const value = cell.value
		if (value === null || value === undefined) {
			return ""
		}

		// Handle error values
		if (typeof value === "object" && "error" in value) {
			return `[Error: ${value.error}]`
		}

		// Handle dates
		if (value instanceof Date) {
			return value.toISOString().split("T")[0]
		}

		// Handle rich text
		if (typeof value === "object" && "richText" in value) {
			return value.richText.map((rt) => rt.text).join("")
		}

		// Handle hyperlinks
		if (typeof value === "object" && "text" in value && "hyperlink" in value) {
			return `${value.text} (${value.hyperlink})`
		}

		// Handle formulas
		if (typeof value === "object" && "formula" in value) {
			if ("result" in value && value.result !== undefined && value.result !== null) {
				return value.result.toString()
			}
			return `[Formula: ${value.formula}]`
		}

		return value.toString()
	}

	/**
	 * Extract text from PPTX file (Careti-specific)
	 */
	private async extractPptx(filePath: string): Promise<string> {
		const buffer = await fs.readFile(filePath)
		return parsePptx(buffer)
	}

	/**
	 * Extract text from HWPX file (Careti-specific)
	 */
	private async extractHwpx(filePath: string): Promise<string> {
		const buffer = await fs.readFile(filePath)
		return parseHwpx(buffer)
	}

	/**
	 * Extract text from HWP 5.0 file (Careti-specific, uses @ohah/hwpjs)
	 */
	private async extractHwp(filePath: string): Promise<string> {
		const buffer = await fs.readFile(filePath)
		return parseHwp(buffer)
	}

	/**
	 * Extract text from Jupyter Notebook file
	 */
	private async extractIpynb(filePath: string): Promise<string> {
		const content = await fs.readFile(filePath, "utf-8")

		let notebook: { cells?: Array<{ cell_type?: string; source?: string | string[] }> }
		try {
			notebook = JSON.parse(content)
		} catch (error) {
			Logger.warn(`[DocumentExtractor] Invalid IPYNB JSON: ${(error as Error).message}`)
			throw new Error(`Invalid Jupyter Notebook file: malformed JSON`)
		}

		const parts: string[] = []

		for (const cell of notebook.cells || []) {
			if ((cell.cell_type === "markdown" || cell.cell_type === "code") && cell.source) {
				const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source
				parts.push(source)
			}
		}

		Logger.debug(`[DocumentExtractor] Extracted ${parts.length} cells from IPYNB`)
		return parts.join("\n\n")
	}

	/**
	 * Get list of supported document formats
	 */
	getSupportedFormats(): DocumentFormat[] {
		return [...SUPPORTED_FORMATS]
	}

	/**
	 * Check if a file format is supported
	 * @param filePath - File path or name to check
	 */
	isSupported(filePath: string): boolean {
		const ext = path.extname(filePath).toLowerCase()
		return ext in EXTENSION_MAP
	}
}
