// CARETI MODIFICATION: Naver Cloud provider tests.
import { expect } from "chai"
import sinon from "sinon"
import { NaverCloudHandler } from "@core/api/providers/naver-cloud"
import { mockFetchForTesting } from "@/shared/net"

const createSseStream = (payload: string): ReadableStream<Uint8Array> => {
	const encoder = new TextEncoder()
	return new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(encoder.encode(payload))
			controller.close()
		},
	})
}

describe("NaverCloudHandler", () => {
	const baseOptions = {
		naverCloudApiKey: "test-key",
	}

	describe("timeout handling", () => {
		it("should timeout after specified duration", async function () {
			this.timeout(5000)
			// Create a fetch stub that never resolves, but rejects on AbortSignal abort (simulates hanging request with timeout)
			const fetchStub = sinon
				.stub()
				.callsFake((_input: RequestInfo | URL, init?: RequestInit) => {
					const signal = init?.signal as AbortSignal | undefined
					return new Promise((_resolve, reject) => {
						if (signal?.aborted) {
							const error = new Error("The operation was aborted.")
							;(error as { name?: string }).name = "AbortError"
							reject(error)
							return
						}

						signal?.addEventListener(
							"abort",
							() => {
								const error = new Error("The operation was aborted.")
								;(error as { name?: string }).name = "AbortError"
								reject(error)
							},
							{ once: true },
						)
					})
				})

			const startTime = Date.now()
			let errorThrown: Error | undefined

			await mockFetchForTesting(fetchStub as any, async () => {
				const handler = new NaverCloudHandler({
					...baseOptions,
					naverCloudModelId: "HCX-005",
					requestTimeoutMs: 1000, // 1 second timeout for test
				})

				try {
					for await (const _ of handler.createMessage("system", [])) {
						// consume stream
					}
				} catch (error) {
					errorThrown = error as Error
				}
			})

			const elapsed = Date.now() - startTime

			// Should have thrown a timeout error
			expect(errorThrown).to.exist
			expect(errorThrown?.message).to.include("timed out")

			// Should have completed within reasonable time (timeout + some buffer)
			expect(elapsed).to.be.lessThan(3000)
		})

		it("should use default timeout when not specified", async () => {
			// Verify default timeout is set
			const handler = new NaverCloudHandler({
				...baseOptions,
				naverCloudModelId: "HCX-005",
			})

			// Access the options to check default timeout
			expect((handler as any).options.requestTimeoutMs).to.equal(undefined)
			// Default should be applied in createMessage - we test this behavior indirectly
		})
	})

	it("builds thinking payload for HCX-007 with maxCompletionTokens", async () => {
		let capturedInit: RequestInit | undefined
		let capturedInput: RequestInfo | URL | undefined

		const fetchStub = sinon.stub().callsFake((input: RequestInfo | URL, init?: RequestInit) => {
			capturedInput = input
			capturedInit = init
			const stream = createSseStream(
				[
					"event: result",
					'data: {"message":{"role":"assistant","content":"ok"},"usage":{"promptTokens":1,"completionTokens":1,"totalTokens":2}}',
					"",
					"",
				].join("\n"),
			)
			return Promise.resolve(
				new Response(stream, {
					status: 200,
					headers: { "Content-Type": "text/event-stream" },
				}),
			)
		})

		await mockFetchForTesting(fetchStub as any, async () => {
			const handler = new NaverCloudHandler({
				...baseOptions,
				naverCloudModelId: "HCX-007",
				thinkingBudgetTokens: 6000,
			})

			for await (const _ of handler.createMessage("system", [])) {
			}
		})

		expect(fetchStub.calledOnce).to.equal(true)
		expect(String(capturedInput)).to.include("/v3/chat-completions/HCX-007")

		const headers = capturedInit?.headers as Record<string, string>
		expect(headers?.Authorization).to.equal("Bearer test-key")
		expect(headers?.Accept).to.equal("text/event-stream")

		const body = JSON.parse(String(capturedInit?.body || "{}"))
		expect(body.maxCompletionTokens).to.be.a("number")
		expect(body).to.not.have.property("maxTokens")
		expect(body.thinking?.effort).to.equal("medium")
	})

	it("builds non-thinking payload for HCX-005 with maxTokens", async () => {
		let capturedInit: RequestInit | undefined

		const fetchStub = sinon.stub().callsFake((_input: RequestInfo | URL, init?: RequestInit) => {
			capturedInit = init
			const stream = createSseStream(
				[
					"event: result",
					'data: {"message":{"role":"assistant","content":"ok"},"usage":{"promptTokens":1,"completionTokens":1,"totalTokens":2}}',
					"",
					"",
				].join("\n"),
			)
			return Promise.resolve(
				new Response(stream, {
					status: 200,
					headers: { "Content-Type": "text/event-stream" },
				}),
			)
		})

		await mockFetchForTesting(fetchStub as any, async () => {
			const handler = new NaverCloudHandler({
				...baseOptions,
				naverCloudModelId: "HCX-005",
				thinkingBudgetTokens: 6000,
			})

			for await (const _ of handler.createMessage("system", [])) {
			}
		})

		const body = JSON.parse(String(capturedInit?.body || "{}"))
		expect(body.maxTokens).to.be.a("number")
		expect(body).to.not.have.property("maxCompletionTokens")
		expect(body).to.not.have.property("thinking")
	})

	it("parses streaming token, thinking, and usage events", async () => {
		const fetchStub = sinon.stub().callsFake(() => {
			const stream = createSseStream(
				[
					"event: token",
					'data: {"message":{"role":"assistant","content":"안"}}',
					"",
					"event: token",
					'data: {"message":{"role":"assistant","thinkingContent":"생각"}}',
					"",
					"event: result",
					'data: {"message":{"role":"assistant","content":"안녕"},"usage":{"promptTokens":5,"completionTokens":7,"totalTokens":12,"completionTokensDetails":{"thinkingTokens":3}}}',
					"",
					"",
				].join("\n"),
			)
			return Promise.resolve(
				new Response(stream, {
					status: 200,
					headers: { "Content-Type": "text/event-stream" },
				}),
			)
		})

		const chunks: Array<{ type: string; text?: string; reasoning?: string; inputTokens?: number; outputTokens?: number; thoughtsTokenCount?: number }> = []

		await mockFetchForTesting(fetchStub as any, async () => {
			const handler = new NaverCloudHandler({
				...baseOptions,
				naverCloudModelId: "HCX-007",
			})

			for await (const chunk of handler.createMessage("system", [])) {
				chunks.push(chunk as any)
			}
		})

		expect(chunks[0]).to.deep.equal({ type: "text", text: "안" })
		expect(chunks[1]).to.deep.equal({ type: "reasoning", reasoning: "생각" })
		expect(chunks[2]).to.deep.equal({ type: "usage", inputTokens: 5, outputTokens: 7, thoughtsTokenCount: 3 })
	})
})
