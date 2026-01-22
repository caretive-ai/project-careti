// CARETI MODIFICATION: Document extraction types for read_document tool

/**
 * Supported document formats for extraction
 */
export type DocumentFormat = "pdf" | "docx" | "xlsx" | "pptx" | "hwpx" | "hwp" | "ipynb"

/**
 * Options for document extraction
 */
export interface ExtractOptions {
	/** Working directory for resolving relative paths */
	cwd: string
	/** Extraction mode: text (plain text) or markdown (formatted) */
	mode?: "text" | "markdown"
	/** Maximum file size in bytes (default: 50MB) */
	maxFileSize?: number
}

/**
 * Result of document extraction
 */
export interface ExtractResult {
	/** Extracted text content */
	content: string
	/** Detected document format */
	format: DocumentFormat
	/** Number of pages (if applicable) */
	pages?: number
	/** Original file path */
	filePath: string
}

/**
 * HWPX document structure information
 */
export interface HwpxStructure {
	/** Whether Preview/PrvText.txt exists */
	hasPreviewText: boolean
	/** Number of section files (Contents/section*.xml) */
	sectionCount: number
	/** Whether the document has embedded images */
	hasImages: boolean
}

/**
 * PPTX document structure information
 */
export interface PptxStructure {
	/** Number of slides */
	slideCount: number
	/** Whether the document has embedded media */
	hasMedia: boolean
}
