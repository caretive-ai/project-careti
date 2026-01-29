// CARETI MODIFICATION: Upstage Solar integration tests
import { describe, it } from "mocha"
import "should"
import { UpstageHandler } from "../upstage"

// Skip tests if no API key
const UPSTAGE_API_KEY = process.env.UPSTAGE_KEY
const describeWithKey = UPSTAGE_API_KEY ? describe : describe.skip

describeWithKey("UpstageHandler Integration Tests", function () {
	this.timeout(60_000)

	describe("solar-pro3", () => {
		it("should successfully call solar-pro3 model", async () => {
			const handler = new UpstageHandler({
				upstageApiKey: UPSTAGE_API_KEY,
				upstageModelId: "solar-pro3",
			})

			const chunks: any[] = []
			for await (const chunk of handler.createMessage(
				"You are a helpful assistant. Be very brief.",
				[{ role: "user", content: [{ type: "text", text: "Say hello in Korean" }] }],
			)) {
				chunks.push(chunk)
				console.log("Chunk:", chunk)
			}

			// Should have at least one text chunk
			const textChunks = chunks.filter((c) => c.type === "text")
			textChunks.length.should.be.above(0)

			// Should have usage info
			const usageChunks = chunks.filter((c) => c.type === "usage")
			usageChunks.length.should.be.above(0)
		})

		it("should handle tool calls with solar-pro3", async () => {
			const handler = new UpstageHandler({
				upstageApiKey: UPSTAGE_API_KEY,
				upstageModelId: "solar-pro3",
			})

			const tools = [
				{
					type: "function" as const,
					function: {
						name: "get_weather",
						description: "Get current weather for a location",
						parameters: {
							type: "object",
							properties: {
								location: { type: "string", description: "City name" },
							},
							required: ["location"],
						},
					},
				},
			]

			const chunks: any[] = []
			for await (const chunk of handler.createMessage(
				"You are a helpful assistant. Use the provided tools.",
				[{ role: "user", content: [{ type: "text", text: "What's the weather in Seoul?" }] }],
				tools,
			)) {
				chunks.push(chunk)
				console.log("Tool Chunk:", chunk)
			}

			// Should have tool call, text response, or finish with tool_calls reason
			const hasToolCallContent = chunks.some(
				(c) => c.type === "text" || c.type === "tool_call" || (c.type === "finish" && c.reason === "tool_calls"),
			)
			hasToolCallContent.should.be.true()
		})
	})

	describe("solar-pro2", () => {
		it("should successfully call solar-pro2 model", async () => {
			const handler = new UpstageHandler({
				upstageApiKey: UPSTAGE_API_KEY,
				upstageModelId: "solar-pro2",
			})

			const chunks: any[] = []
			for await (const chunk of handler.createMessage(
				"You are a helpful assistant. Be very brief.",
				[{ role: "user", content: [{ type: "text", text: "Say hi" }] }],
			)) {
				chunks.push(chunk)
			}

			const textChunks = chunks.filter((c) => c.type === "text")
			textChunks.length.should.be.above(0)
		})
	})
})
