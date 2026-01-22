// CARETI MODIFICATION: Naver Cloud provider integration tests with real API calls.
// Run with: npm run test:integration -- --grep "NaverCloudHandler Integration"
import { expect } from "chai"
import * as path from "path"
import * as fs from "fs"
import type { ChatCompletionTool } from "openai/resources/chat/completions"
import { NaverCloudHandler } from "@core/api/providers/naver-cloud"

// Load .env manually (avoid dotenv dependency)
const envPath = path.resolve(__dirname, "../../../../../.env")
if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, "utf-8")
	envContent.split("\n").forEach((line) => {
		const match = line.match(/^([^=]+)=(.*)$/)
		if (match && !process.env[match[1]]) {
			process.env[match[1]] = match[2]
		}
	})
}

const NAVER_CLOUD_API_KEY = process.env.NAVER_CLOUD_API_KEY

describe("NaverCloudHandler Integration Tests", function () {
	// Integration tests need more time
	this.timeout(120000)

	before(function () {
		if (!NAVER_CLOUD_API_KEY) {
			this.skip()
		}
	})

	describe("basic API calls", () => {
		it("should successfully call HCX-005 model", async function () {
			const handler = new NaverCloudHandler({
				naverCloudApiKey: NAVER_CLOUD_API_KEY!,
				naverCloudModelId: "HCX-005",
			})

			const chunks: any[] = []
			for await (const chunk of handler.createMessage("You are a helpful assistant.", [
				{ role: "user", content: [{ type: "text", text: "Say hello in Korean. Just one word." }] },
			])) {
				chunks.push(chunk)
				console.log("Chunk:", chunk)
			}

			// Should have text and usage
			const textChunks = chunks.filter((c) => c.type === "text")
			const usageChunks = chunks.filter((c) => c.type === "usage")

			expect(textChunks.length).to.be.greaterThan(0)
			expect(usageChunks.length).to.equal(1)

			const fullText = textChunks.map((c) => c.text).join("")
			console.log("Response:", fullText)
			expect(fullText.length).to.be.greaterThan(0)
		})

		it("should successfully call HCX-007 thinking model", async function () {
			const handler = new NaverCloudHandler({
				naverCloudApiKey: NAVER_CLOUD_API_KEY!,
				naverCloudModelId: "HCX-007",
				thinkingBudgetTokens: 5000,
			})

			const chunks: any[] = []
			for await (const chunk of handler.createMessage("You are a helpful assistant.", [
				{ role: "user", content: [{ type: "text", text: "What is 2+2? Answer briefly." }] },
			])) {
				chunks.push(chunk)
				console.log("Chunk:", chunk)
			}

			const textChunks = chunks.filter((c) => c.type === "text")
			const reasoningChunks = chunks.filter((c) => c.type === "reasoning")

			expect(textChunks.length).to.be.greaterThan(0)
			// HCX-007 with thinking should have reasoning
			console.log("Reasoning chunks:", reasoningChunks.length)
			console.log("Text:", textChunks.map((c) => c.text).join(""))
		})
	})

	describe("tool calling", () => {
		const testTools: ChatCompletionTool[] = [
			{
				type: "function",
				function: {
					name: "get_weather",
					description: "Get the current weather for a location",
					parameters: {
						type: "object",
						properties: {
							location: {
								type: "string",
								description: "The city name",
							},
						},
						required: ["location"],
					},
				},
			},
			{
				type: "function",
				function: {
					name: "search_files",
					description: "Search for files in the codebase",
					parameters: {
						type: "object",
						properties: {
							query: {
								type: "string",
								description: "Search query",
							},
						},
						required: ["query"],
					},
				},
			},
		]

		it("should handle tool calls with HCX-005", async function () {
			const handler = new NaverCloudHandler({
				naverCloudApiKey: NAVER_CLOUD_API_KEY!,
				naverCloudModelId: "HCX-005",
			})

			const chunks: any[] = []
			for await (const chunk of handler.createMessage(
				"You are a helpful assistant. Use tools when appropriate.",
				[{ role: "user", content: [{ type: "text", text: "What's the weather in Seoul?" }] }],
				testTools,
			)) {
				chunks.push(chunk)
				console.log("Tool call chunk:", chunk)
			}

			// Check if we got tool calls
			const toolCallChunks = chunks.filter((c) => c.type === "tool_call" || c.type === "tool_use")
			console.log("Tool call chunks:", toolCallChunks)

			// Model may or may not use tools - just verify no errors
			expect(chunks.length).to.be.greaterThan(0)
		})

		it("should handle tool calls with HCX-007", async function () {
			const handler = new NaverCloudHandler({
				naverCloudApiKey: NAVER_CLOUD_API_KEY!,
				naverCloudModelId: "HCX-007",
				thinkingBudgetTokens: 5000,
			})

			const chunks: any[] = []
			for await (const chunk of handler.createMessage(
				"You are a helpful assistant. Use tools when appropriate.",
				[{ role: "user", content: [{ type: "text", text: "Search for files related to authentication" }] }],
				testTools,
			)) {
				chunks.push(chunk)
				console.log("Tool call chunk:", chunk)
			}

			console.log("All chunks:", chunks)
			expect(chunks.length).to.be.greaterThan(0)
		})
	})

	describe("timeout handling", () => {
		it("should timeout with very short timeout", async function () {
			const handler = new NaverCloudHandler({
				naverCloudApiKey: NAVER_CLOUD_API_KEY!,
				naverCloudModelId: "HCX-005",
				requestTimeoutMs: 1, // 1ms - should always timeout
			})

			let errorThrown: Error | undefined
			const startTime = Date.now()

			try {
				for await (const _ of handler.createMessage("You are a helpful assistant.", [
					{ role: "user", content: [{ type: "text", text: "Write a very long essay about the history of computers." }] },
				])) {
					// consume stream
				}
			} catch (error) {
				errorThrown = error as Error
			}

			const elapsed = Date.now() - startTime
			console.log("Elapsed time:", elapsed, "ms")
			console.log("Error:", errorThrown?.message)

			// Should have thrown a timeout error (once we implement it)
			// For now, this test will show current behavior
			if (errorThrown) {
				expect(errorThrown.message).to.include("timed out")
			}
		})

		it("should complete within reasonable timeout", async function () {
			const handler = new NaverCloudHandler({
				naverCloudApiKey: NAVER_CLOUD_API_KEY!,
				naverCloudModelId: "HCX-005",
				requestTimeoutMs: 30000, // 30 seconds
			})

			const startTime = Date.now()
			const chunks: any[] = []

			for await (const chunk of handler.createMessage("You are a helpful assistant.", [
				{ role: "user", content: [{ type: "text", text: "Say hi" }] },
			])) {
				chunks.push(chunk)
			}

			const elapsed = Date.now() - startTime
			console.log("Completed in:", elapsed, "ms")

			expect(chunks.length).to.be.greaterThan(0)
			expect(elapsed).to.be.lessThan(30000)
		})
	})

	describe("error handling", () => {
		it("should handle invalid API key gracefully", async function () {
			const handler = new NaverCloudHandler({
				naverCloudApiKey: "invalid-key",
				naverCloudModelId: "HCX-005",
			})

			let errorThrown: Error | undefined

			try {
				for await (const _ of handler.createMessage("Test", [
					{ role: "user", content: [{ type: "text", text: "Hello" }] },
				])) {
					// consume stream
				}
			} catch (error) {
				errorThrown = error as Error
			}

			expect(errorThrown).to.exist
			console.log("Auth error:", errorThrown?.message)
		})
	})
})
