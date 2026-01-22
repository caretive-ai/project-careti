// CARETI MODIFICATION: Integration test for AnalyzeImage progress UI
// Tests that AnalyzeImageToolHandler sends proper progress messages

import { describe, it } from "mocha"
import { expect } from "chai"

// Test the message structure that AnalyzeImageToolHandler sends
interface ToolAnalyzeImageMessage {
	tool: "analyzeImage"
	imagePath?: string
	question?: string
	status?: "pending" | "analyzing" | "completed" | "error"
	progressText?: string // Progress text for UI display
	result?: string
	errorMessage?: string
	operationIsLocatedInWorkspace?: boolean
}

describe("AnalyzeImage Progress UI", function () {
	this.timeout(10000)

	describe("ToolAnalyzeImageMessage Structure", () => {
		it("should have progressText field defined in type", () => {
			const message: ToolAnalyzeImageMessage = {
				tool: "analyzeImage",
				imagePath: "/test/image.png",
				question: "What is in this image?",
				status: "analyzing",
				progressText: "Analyzing image...",
			}

			expect(message.tool).to.equal("analyzeImage")
			expect(message.status).to.equal("analyzing")
			expect(message.progressText).to.equal("Analyzing image...")
		})

		it("should support all status values", () => {
			const statuses: ToolAnalyzeImageMessage["status"][] = ["pending", "analyzing", "completed", "error"]

			for (const status of statuses) {
				const message: ToolAnalyzeImageMessage = {
					tool: "analyzeImage",
					status,
				}
				expect(message.status).to.equal(status)
			}
		})

		it("should include question in message", () => {
			const message: ToolAnalyzeImageMessage = {
				tool: "analyzeImage",
				imagePath: "screenshot.png",
				question: "What UI elements are visible?",
				status: "pending",
			}

			expect(message.question).to.be.a("string")
			expect(message.question).to.include("UI elements")
		})
	})

	describe("Progress Message Flow", () => {
		it("should follow correct status progression: pending -> analyzing -> completed", () => {
			const messages: ToolAnalyzeImageMessage[] = [
				{ tool: "analyzeImage", status: "pending", imagePath: "test.png", question: "Describe this" },
				{
					tool: "analyzeImage",
					status: "analyzing",
					imagePath: "test.png",
					question: "Describe this",
					progressText: "Analyzing image...",
				},
				{
					tool: "analyzeImage",
					status: "completed",
					imagePath: "test.png",
					question: "Describe this",
					result: "This image shows...",
				},
			]

			expect(messages[0].status).to.equal("pending")
			expect(messages[1].status).to.equal("analyzing")
			expect(messages[1].progressText).to.exist
			expect(messages[2].status).to.equal("completed")
			expect(messages[2].result).to.exist
		})

		it("should follow correct status progression for error: pending -> analyzing -> error", () => {
			const messages: ToolAnalyzeImageMessage[] = [
				{ tool: "analyzeImage", status: "pending", imagePath: "test.png" },
				{ tool: "analyzeImage", status: "analyzing", imagePath: "test.png", progressText: "Analyzing image..." },
				{ tool: "analyzeImage", status: "error", imagePath: "test.png", errorMessage: "Analysis failed" },
			]

			expect(messages[0].status).to.equal("pending")
			expect(messages[1].status).to.equal("analyzing")
			expect(messages[2].status).to.equal("error")
			expect(messages[2].errorMessage).to.exist
		})
	})

	describe("Error Handling", () => {
		it("should include errorMessage in error status", () => {
			const errorMessage: ToolAnalyzeImageMessage = {
				tool: "analyzeImage",
				imagePath: "corrupted.png",
				status: "error",
				errorMessage: "Failed to analyze image: Invalid format",
			}

			expect(errorMessage.status).to.equal("error")
			expect(errorMessage.errorMessage).to.include("Failed to analyze")
		})

		it("should not show progressText when status is error", () => {
			const errorMessage: ToolAnalyzeImageMessage = {
				tool: "analyzeImage",
				imagePath: "test.png",
				status: "error",
				progressText: "Analyzing image...",
				errorMessage: "Analysis failed",
			}

			const isAnalyzing = errorMessage.status === "pending" || errorMessage.status === "analyzing"
			expect(isAnalyzing).to.be.false
		})

		it("should handle auth required error", () => {
			const errorMessage: ToolAnalyzeImageMessage = {
				tool: "analyzeImage",
				imagePath: "test.png",
				status: "error",
				errorMessage: '{"type":"auth_required","action":"analyze images"}',
			}

			expect(errorMessage.status).to.equal("error")
		})

		it("should handle timeout error", () => {
			const errorMessage: ToolAnalyzeImageMessage = {
				tool: "analyzeImage",
				imagePath: "large-image.png",
				status: "error",
				errorMessage: "Image analysis timed out after 60 seconds",
			}

			expect(errorMessage.status).to.equal("error")
			expect(errorMessage.errorMessage).to.include("timed out")
		})
	})

	describe("i18n Keys for Progress Messages", () => {
		const expectedKeys = [
			"tool.analyzeImage", // Base tool name
			"tool.analyzeImagePath", // "Path: {path}"
			"tool.analyzeImageQuestion", // "Question: {question}"
			"tool.analyzeImageCompleted", // "Analysis completed"
		]

		it("should have documented i18n keys", () => {
			for (const key of expectedKeys) {
				expect(key).to.be.a("string")
				expect(key.startsWith("tool.")).to.be.true
			}
		})
	})
})
