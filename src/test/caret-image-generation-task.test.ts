// CARET MODIFICATION: Unit tests for gateway-backed image generation task loop.

import { describe, it } from "mocha"
import "should"
import { runCaretImageGenerationTask } from "@caret/core/task/image/runCaretImageGenerationTask"
import { CaretAuthService } from "@caret/services/auth/CaretAuthService"
import type { ClineSay } from "@shared/ExtensionMessage"
import * as sinon from "sinon"
import { mockFetchForTesting } from "@/shared/net"

describe("Caret image generation task runner", () => {
	it("renders a generated image as markdown data URL and continues on completion response", async () => {
		const ONE_BY_ONE_PNG_BASE64 =
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

		const sandbox = sinon.createSandbox()
		try {
			const authStub = {
				getAuthToken: sandbox.stub().resolves("test-token"),
			}
			sandbox.stub(CaretAuthService, "getInstance").returns(authStub as any)

			type SayCall = [ClineSay, string | undefined, string[] | undefined, string[] | undefined, boolean | undefined]
			const sayCalls: SayCall[] = []
			const askStub = sandbox.stub()
			askStub.onCall(0).resolves({ response: "messageResponse", text: "Next prompt" })
			askStub.onCall(1).resolves({ response: "yesButtonClicked" })

			let fetchCallCount = 0
			const fakeFetch = async (_input: any, init?: any) => {
				fetchCallCount++
				// Basic contract checks (auth + JSON body)
				init.headers["X-AnyLLM-Key"].should.equal("Bearer test-token")
				JSON.parse(init.body).should.have.property("prompt")
				JSON.parse(init.body).should.have.property("stream", true)

				return {
					ok: true,
					status: 200,
					statusText: "OK",
					headers: { get: () => "application/json" },
					json: async () => ({
						mimeType: "image/png",
						base64: ONE_BY_ONE_PNG_BASE64,
						texts: ["caption"],
						thoughts: ["thinking"],
					}),
					text: async () => "",
				} as any
			}

			const io = {
				controller: {},
				ulid: "test-ulid",
				isAborted: () => false,
				say: async (...args: SayCall) => {
					sayCalls.push(args)
					return undefined
				},
				ask: askStub,
			} as any

			await mockFetchForTesting(fakeFetch as any, async () => {
				await runCaretImageGenerationTask(io, "Initial prompt")
			})

			askStub.callCount.should.equal(2)
			askStub.getCall(0)!.args[0].should.equal("completion_result")
			;(askStub.getCall(0)!.args[1] as string).should.equal("")
			askStub.getCall(1)!.args[0].should.equal("completion_result")
			;(askStub.getCall(1)!.args[1] as string).should.equal("")
			fetchCallCount.should.equal(2)

			// Initial prompt generation
			sayCalls[0]![0].should.equal("text")
			;(sayCalls[0]![1] as string).should.match(/이미지 생성 중 \[/)
			;(sayCalls[0]![4] as boolean).should.equal(true)

			sayCalls[1]![0].should.equal("text")
			;(sayCalls[1]![1] as string).should.equal("")
			;(sayCalls[1]![4] as boolean).should.equal(false)

			sayCalls[2]![0].should.equal("reasoning")
			;(sayCalls[2]![1] as string).should.equal("thinking")

			sayCalls[3]![0].should.equal("text")
			;(sayCalls[3]![1] as string).should.equal("caption")

			;(sayCalls[4]![1] as string).should.match(/\[Gemini_Generated_Image_test-ulid_1\.png 1x1\]/)
			;(sayCalls[4]![1] as string).should.match(/!\[\]\(data:image\/png;base64,/)
			;(sayCalls[4]![1] as string).should.match(/완료/)
			;(sayCalls[4]![4] as boolean).should.equal(false)

			const userFeedbackIndex = sayCalls.findIndex(
				([type, text]) => type === "user_feedback" && text === "Next prompt",
			)
			userFeedbackIndex.should.be.greaterThan(-1)

			const firstImageIndex = sayCalls.findIndex(([type, text]) =>
				Boolean(type === "text" && text?.includes("Gemini_Generated_Image_test-ulid_1.png")),
			)
			const secondImageIndex = sayCalls.findIndex(([type, text]) =>
				Boolean(type === "text" && text?.includes("Gemini_Generated_Image_test-ulid_2.png")),
			)
			firstImageIndex.should.be.greaterThan(-1)
			secondImageIndex.should.be.greaterThan(firstImageIndex)
		} finally {
			sandbox.restore()
		}
	})

	it("streams thought before image output", async () => {
		const ONE_BY_ONE_PNG_BASE64 =
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

		const sandbox = sinon.createSandbox()
		try {
			const authStub = {
				getAuthToken: sandbox.stub().resolves("test-token"),
			}
			sandbox.stub(CaretAuthService, "getInstance").returns(authStub as any)

			type SayCall = [ClineSay, string | undefined, string[] | undefined, string[] | undefined, boolean | undefined]
			const sayCalls: SayCall[] = []
			const askStub = sandbox.stub()
			askStub.onCall(0).resolves({ response: "yesButtonClicked" })

			const encoder = new TextEncoder()
			const events = [
				{ type: "thought", content: "thinking" },
				{ type: "text", content: "caption" },
				{ type: "image", mimeType: "image/png", base64: ONE_BY_ONE_PNG_BASE64 },
				{ type: "done" },
			]
			const stream = new ReadableStream<Uint8Array>({
				start(controller) {
					for (const event of events) {
						controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
					}
					controller.close()
				},
			})

			const fakeFetch = async (_input: any, init?: any) => {
				init.headers["X-AnyLLM-Key"].should.equal("Bearer test-token")
				JSON.parse(init.body).should.have.property("prompt")
				JSON.parse(init.body).should.have.property("stream", true)

				return {
					ok: true,
					status: 200,
					statusText: "OK",
					headers: { get: () => "text/event-stream" },
					body: stream,
					json: async () => ({}),
					text: async () => "",
				} as any
			}

			const io = {
				controller: {},
				ulid: "test-ulid",
				isAborted: () => false,
				say: async (...args: SayCall) => {
					sayCalls.push(args)
					return undefined
				},
				ask: askStub,
			} as any

			await mockFetchForTesting(fakeFetch as any, async () => {
				await runCaretImageGenerationTask(io, "Initial prompt")
			})

			askStub.callCount.should.equal(1)
			askStub.getCall(0)!.args[0].should.equal("completion_result")

			const reasoningIndex = sayCalls.findIndex(([type, text]) => type === "reasoning" && text === "thinking")
			const textIndex = sayCalls.findIndex(([type, text]) => type === "text" && text === "caption")
			const imageIndex = sayCalls.findIndex(
				([type, text]) => type === "text" && Boolean(text?.includes("data:image/png;base64,")),
			)
			const doneIndex = sayCalls.findIndex(
				([type, text]) => type === "text" && Boolean(text?.includes("data:image/png;base64,") && text?.includes("완료")),
			)

			reasoningIndex.should.be.greaterThan(-1)
			textIndex.should.be.greaterThan(reasoningIndex)
			imageIndex.should.be.greaterThan(textIndex)
			doneIndex.should.be.greaterThan(textIndex)
		} finally {
			sandbox.restore()
		}
	})

	it("adds a thinking spinner while streaming reasoning", async () => {
		const ONE_BY_ONE_PNG_BASE64 =
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

		const sandbox = sinon.createSandbox()
		try {
			const clock = sandbox.useFakeTimers()
			const authStub = {
				getAuthToken: sandbox.stub().resolves("test-token"),
			}
			sandbox.stub(CaretAuthService, "getInstance").returns(authStub as any)

			type SayCall = [ClineSay, string | undefined, string[] | undefined, string[] | undefined, boolean | undefined]
			const sayCalls: SayCall[] = []
			const askStub = sandbox.stub()
			askStub.onCall(0).resolves({ response: "yesButtonClicked" })

			const encoder = new TextEncoder()
			const stream = new ReadableStream<Uint8Array>({
				start(controller) {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "thought", content: "thinking" })}\n\n`))
					setTimeout(() => {
						controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content: "caption" })}\n\n`))
					}, 1000)
					setTimeout(() => {
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({
									type: "image",
									mimeType: "image/png",
									base64: ONE_BY_ONE_PNG_BASE64,
								})}\n\n`,
							),
						)
						controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`))
						controller.close()
					}, 1200)
				},
			})

			const fakeFetch = async (_input: any, init?: any) => {
				init.headers["X-AnyLLM-Key"].should.equal("Bearer test-token")
				JSON.parse(init.body).should.have.property("prompt")
				JSON.parse(init.body).should.have.property("stream", true)

				return {
					ok: true,
					status: 200,
					statusText: "OK",
					headers: { get: () => "text/event-stream" },
					body: stream,
					json: async () => ({}),
					text: async () => "",
				} as any
			}

			const io = {
				controller: {},
				ulid: "test-ulid",
				isAborted: () => false,
				say: async (...args: SayCall) => {
					sayCalls.push(args)
					return undefined
				},
				ask: askStub,
			} as any

			const taskPromise = mockFetchForTesting(fakeFetch as any, async () => {
				await runCaretImageGenerationTask(io, "Initial prompt")
			})

			await clock.tickAsync(900)
			await clock.tickAsync(400)
			await taskPromise

			askStub.callCount.should.equal(1)
			askStub.getCall(0)!.args[0].should.equal("completion_result")

			const reasoningPartial = sayCalls.filter(
				([type, _text, _images, _files, partial]) => type === "reasoning" && partial,
			)
			const reasoningFinal = sayCalls.find(([type, _text, _images, _files, partial]) => type === "reasoning" && !partial)

			;(reasoningPartial.length > 1).should.equal(true)
			const spinnerFrames = new Set(
				reasoningPartial
					.map((call) => call[1] as string)
					.filter((text) => text.includes("생각중"))
					.map((text) => text.match(/\[[^\]]+\]/)?.[0])
					.filter(Boolean) as string[],
			)
			spinnerFrames.size.should.be.greaterThan(1)

			if (!reasoningFinal) {
				throw new Error("Expected final reasoning message")
			}
			;(reasoningFinal[1] as string).should.equal("thinking")
			;(reasoningFinal[1] as string).should.not.containEql("생각중")
		} finally {
			sandbox.restore()
		}
	})

	it("returns a handoff prompt when the model switches away from image generation", async () => {
		const ONE_BY_ONE_PNG_BASE64 =
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

		const sandbox = sinon.createSandbox()
		try {
			const authStub = {
				getAuthToken: sandbox.stub().resolves("test-token"),
			}
			sandbox.stub(CaretAuthService, "getInstance").returns(authStub as any)

			type SayCall = [ClineSay, string | undefined, string[] | undefined, string[] | undefined, boolean | undefined]
			const sayCalls: SayCall[] = []
			const askStub = sandbox.stub()
			askStub.onCall(0).resolves({
				response: "messageResponse",
				text: "Next prompt",
				images: ["data:image/png;base64,AA=="],
			})

			const isImageModel = sandbox.stub()
			isImageModel.onCall(0).returns(true)
			isImageModel.onCall(1).returns(false)

			let fetchCallCount = 0
			const fakeFetch = async (_input: any, init?: any) => {
				fetchCallCount++
				init.headers["X-AnyLLM-Key"].should.equal("Bearer test-token")
				JSON.parse(init.body).should.have.property("prompt")
				JSON.parse(init.body).should.have.property("stream", true)

				return {
					ok: true,
					status: 200,
					statusText: "OK",
					headers: { get: () => "application/json" },
					json: async () => ({
						mimeType: "image/png",
						base64: ONE_BY_ONE_PNG_BASE64,
						texts: [],
						thoughts: [],
					}),
					text: async () => "",
				} as any
			}

			const io = {
				controller: {},
				ulid: "test-ulid",
				isAborted: () => false,
				isImageModel,
				say: async (...args: SayCall) => {
					sayCalls.push(args)
					return undefined
				},
				ask: askStub,
			} as any

			const handoff = await mockFetchForTesting(fakeFetch as any, async () => {
				return await runCaretImageGenerationTask(io, "Initial prompt")
			})

			fetchCallCount.should.equal(1)
			askStub.callCount.should.equal(1)
			askStub.getCall(0)!.args[0].should.equal("completion_result")

			handoff.should.deepEqual({
				prompt: "Next prompt",
				images: ["data:image/png;base64,AA=="],
				files: undefined,
			})

			const feedbackIndex = sayCalls.findIndex(
				([type, text]) => type === "user_feedback" && text === "Next prompt",
			)
			feedbackIndex.should.be.greaterThan(-1)
		} finally {
			sandbox.restore()
		}
	})
})
