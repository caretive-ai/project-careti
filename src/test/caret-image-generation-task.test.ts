// CARET MODIFICATION: Unit tests for gateway-backed image generation task loop.

import { describe, it } from "mocha"
import "should"
import { runCaretImageGenerationTask } from "@caret/core/task/image/runCaretImageGenerationTask"
import { CaretAuthService } from "@caret/services/auth/CaretAuthService"
import type { ClineSay } from "@shared/ExtensionMessage"
import * as sinon from "sinon"
import { mockFetchForTesting } from "@/shared/net"

describe("Caret image generation task runner", () => {
	it("renders a generated image as markdown data URL and continues via followup", async () => {
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
			askStub.onCall(1).rejects(new Error("stop"))

			let fetchCallCount = 0
			const fakeFetch = async (_input: any, init?: any) => {
				fetchCallCount++
				// Basic contract checks (auth + JSON body)
				init.headers["X-AnyLLM-Key"].should.equal("Bearer test-token")
				JSON.parse(init.body).should.have.property("prompt")

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
			const followupRequest = JSON.parse(askStub.getCall(0)!.args[1] as string)
			followupRequest.question.should.equal("이미지 프롬프트를 입력해 주세요.")

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
			;(sayCalls[4]![4] as boolean).should.equal(false)

			sayCalls[5]![0].should.equal("text")
			;(sayCalls[5]![1] as string).should.equal("완료")

			// Followup prompt is echoed as user feedback, then generates another image
			sayCalls[6]![0].should.equal("user_feedback")
			;(sayCalls[6]![1] as string).should.equal("Next prompt")

			sayCalls[7]![0].should.equal("text")
			;(sayCalls[7]![1] as string).should.match(/이미지 생성 중 \[/)
			;(sayCalls[7]![4] as boolean).should.equal(true)

			sayCalls[8]![0].should.equal("text")
			;(sayCalls[8]![1] as string).should.equal("")
			;(sayCalls[8]![4] as boolean).should.equal(false)

			sayCalls[9]![0].should.equal("reasoning")
			;(sayCalls[9]![1] as string).should.equal("thinking")

			sayCalls[10]![0].should.equal("text")
			;(sayCalls[10]![1] as string).should.equal("caption")

			;(sayCalls[11]![1] as string).should.match(/\[Gemini_Generated_Image_test-ulid_2\.png 1x1\]/)
			;(sayCalls[11]![1] as string).should.match(/!\[\]\(data:image\/png;base64,/)

			sayCalls[12]![0].should.equal("text")
			;(sayCalls[12]![1] as string).should.equal("완료")
		} finally {
			sandbox.restore()
		}
	})
})
