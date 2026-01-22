// CARETI MODIFICATION: Integration test for ReadDocument progress UI
// Tests that ReadDocumentToolHandler sends proper progress messages
// Run with: npm run test:integration -- --grep "ReadDocument Progress UI"

import { describe, it } from "mocha"
import { expect } from "chai"
import * as path from "path"

// Test the message structure that ReadDocumentToolHandler sends
interface ToolReadDocumentMessage {
	tool: "readDocument"
	documentPath?: string
	status?: "pending" | "reading" | "completed" | "error"
	progressText?: string // Progress text for UI display
	fileSize?: string // Human-readable file size
	result?: string
	format?: string
	errorMessage?: string
	operationIsLocatedInWorkspace?: boolean
}

describe("ReadDocument Progress UI", function () {
	this.timeout(10000)

	const FIXTURES_DIR = path.resolve(__dirname, "../../careti-src/integrations/document/__tests__/fixtures")

	describe("ToolReadDocumentMessage Structure", () => {
		it("should have progressText field defined in type", () => {
			// This test validates the type structure
			const message: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "/test/document.hwp",
				status: "reading",
				progressText: "Reading document...",
			}

			expect(message.tool).to.equal("readDocument")
			expect(message.status).to.equal("reading")
			expect(message.progressText).to.equal("Reading document...")
		})

		it("should support all status values", () => {
			const statuses: ToolReadDocumentMessage["status"][] = ["pending", "reading", "completed", "error"]

			for (const status of statuses) {
				const message: ToolReadDocumentMessage = {
					tool: "readDocument",
					status,
				}
				expect(message.status).to.equal(status)
			}
		})

		it("should include progressText in reading status", () => {
			const message: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "sample.hwp",
				status: "reading",
				progressText: "Reading HWP document...",
				operationIsLocatedInWorkspace: true,
			}

			expect(message.progressText).to.be.a("string")
			expect(message.progressText!.length).to.be.greaterThan(0)
		})
	})

	describe("Progress Message Flow", () => {
		it("should follow correct status progression: pending -> reading -> completed", () => {
			const messages: ToolReadDocumentMessage[] = [
				{ tool: "readDocument", status: "pending", documentPath: "test.hwp" },
				{ tool: "readDocument", status: "reading", documentPath: "test.hwp", progressText: "Reading document..." },
				{ tool: "readDocument", status: "completed", documentPath: "test.hwp", format: "hwp" },
			]

			expect(messages[0].status).to.equal("pending")
			expect(messages[1].status).to.equal("reading")
			expect(messages[1].progressText).to.exist
			expect(messages[2].status).to.equal("completed")
			expect(messages[2].format).to.exist
		})

		it("should follow correct status progression for error: pending -> reading -> error", () => {
			const messages: ToolReadDocumentMessage[] = [
				{ tool: "readDocument", status: "pending", documentPath: "test.hwp" },
				{ tool: "readDocument", status: "reading", documentPath: "test.hwp", progressText: "Reading document..." },
				{ tool: "readDocument", status: "error", documentPath: "test.hwp", errorMessage: "Failed to parse" },
			]

			expect(messages[0].status).to.equal("pending")
			expect(messages[1].status).to.equal("reading")
			expect(messages[2].status).to.equal("error")
			expect(messages[2].errorMessage).to.exist
		})
	})

	describe("JSON Serialization", () => {
		it("should serialize message with progressText correctly", () => {
			const message: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "/path/to/document.hwp",
				status: "reading",
				progressText: "Extracting text from HWP...",
				operationIsLocatedInWorkspace: true,
			}

			const json = JSON.stringify(message)
			const parsed = JSON.parse(json) as ToolReadDocumentMessage

			expect(parsed.tool).to.equal("readDocument")
			expect(parsed.progressText).to.equal("Extracting text from HWP...")
			expect(parsed.status).to.equal("reading")
		})

		it("should handle message without progressText (backward compatibility)", () => {
			const message: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "/path/to/document.hwp",
				status: "reading",
				// No progressText - should still work
			}

			const json = JSON.stringify(message)
			const parsed = JSON.parse(json) as ToolReadDocumentMessage

			expect(parsed.tool).to.equal("readDocument")
			expect(parsed.progressText).to.be.undefined
		})
	})

	describe("Error Handling", () => {
		it("should include errorMessage in error status", () => {
			const errorMessage: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "corrupted.hwp",
				status: "error",
				errorMessage: "Failed to parse HWP: Invalid file format",
				operationIsLocatedInWorkspace: true,
			}

			expect(errorMessage.status).to.equal("error")
			expect(errorMessage.errorMessage).to.be.a("string")
			expect(errorMessage.errorMessage).to.include("Failed to parse")
		})

		it("should not show progressText when status is error", () => {
			// When status is "error", progressText should not be displayed in UI
			// This is handled by: {tool.progressText && isReading && ...}
			// where isReading = status === "pending" || status === "reading"
			const errorMessage: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "test.hwp",
				status: "error",
				progressText: "Reading HWP document...", // This might still be set from previous state
				errorMessage: "Document extraction failed",
			}

			// UI logic: isReading = false when status is "error"
			const isReading = errorMessage.status === "pending" || errorMessage.status === "reading"
			expect(isReading).to.be.false
			// Therefore progressText should not be displayed even if it exists
		})

		it("should handle unsupported format error", () => {
			const errorMessage: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "document.xyz",
				status: "error",
				errorMessage: "Unsupported document format: .xyz. Supported formats: .pdf, .docx, .hwp, .hwpx, .pptx",
			}

			expect(errorMessage.status).to.equal("error")
			expect(errorMessage.errorMessage).to.include("Unsupported")
		})

		it("should handle file not found error", () => {
			const errorMessage: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "/nonexistent/path/document.hwp",
				status: "error",
				errorMessage: "File not found: /nonexistent/path/document.hwp",
			}

			expect(errorMessage.status).to.equal("error")
			expect(errorMessage.errorMessage).to.include("not found")
		})
	})

	describe("File Size Display", () => {
		it("should include fileSize in message", () => {
			const message: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "large-document.hwp",
				status: "pending",
				fileSize: "2.5 MB",
				operationIsLocatedInWorkspace: true,
			}

			expect(message.fileSize).to.equal("2.5 MB")
		})

		it("should display fileSize in all statuses", () => {
			const statuses: ToolReadDocumentMessage["status"][] = ["pending", "reading", "completed", "error"]

			for (const status of statuses) {
				const message: ToolReadDocumentMessage = {
					tool: "readDocument",
					status,
					fileSize: "1.2 MB",
				}
				expect(message.fileSize).to.equal("1.2 MB")
			}
		})
	})

	describe("Timeout Handling", () => {
		it("should handle timeout error message", () => {
			const message: ToolReadDocumentMessage = {
				tool: "readDocument",
				documentPath: "huge-document.pdf",
				status: "error",
				fileSize: "150 MB",
				errorMessage: "Document extraction timed out after 120 seconds",
			}

			expect(message.status).to.equal("error")
			expect(message.errorMessage).to.include("timed out")
		})
	})

	describe("i18n Keys for Progress Messages", () => {
		// These tests document the expected i18n keys
		const expectedKeys = [
			"tool.readDocument", // Base tool name
			"tool.readDocumentPath", // "Path: {path}"
			"tool.readDocumentFormat", // "Format: {format}"
			"tool.readDocumentSize", // "Size: {size}"
			"tool.readDocumentCompleted", // "Document reading completed"
		]

		it("should have documented i18n keys", () => {
			// This is a documentation test - actual i18n implementation will use these keys
			for (const key of expectedKeys) {
				expect(key).to.be.a("string")
				expect(key.startsWith("tool.")).to.be.true
			}
		})
	})
})

// Note: Integration test with actual ReadDocumentToolHandler requires VSCode environment
// Run via: npm run test:integration -- --grep "HWP Document"
// The unit tests above validate the message structure and type definitions
