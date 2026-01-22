// CARETI MODIFICATION: TDD 회귀 테스트 - Gemini 3 Pro 계열은 thinkingLevel이 누락되면 기본 LOW로 채워지고, thinkingLevel이 있으면 includeThoughts가 활성화되어야 함 (R-3400-05)

import { GeminiHandler } from "@core/api/providers/gemini"
import { ThinkingLevel } from "@google/genai"
import { geminiModels } from "@shared/api"
import { expect } from "chai"
import { describe, it } from "mocha"
import sinon from "sinon"
import { ClineStorageMessage } from "@/shared/messages/content"

describe("GeminiHandler thinking config", () => {
	it("Gemini 3 Pro 모델인데 thinkingLevel이 정의되지 않으면 기본 LOW로 설정하고 includeThoughts를 켠다", async () => {
		const captured: any[] = []
		const fakeClient = {
			models: {
				generateContentStream: async (params: any) => {
					captured.push(params)
					return {
						async *[Symbol.asyncIterator]() {
							yield {
								text: "ok",
								candidates: [],
								usageMetadata: {
									promptTokenCount: 1,
									candidatesTokenCount: 1,
									thoughtsTokenCount: 0,
									cachedContentTokenCount: 0,
								},
							}
						},
					}
				},
			},
		}

		const handler = new GeminiHandler({
			geminiApiKey: "test",
			apiModelId: "gemini-3-pro-preview",
			thinkingBudgetTokens: 0,
		} as any)

		sinon.stub(handler as any, "ensureClient").returns(fakeClient)
		sinon.stub(handler as any, "getModel").returns({
			id: "gemini-3-pro-preview",
			info: { ...geminiModels["gemini-3-pro-preview"], thinkingConfig: undefined },
		})

		const messages: ClineStorageMessage[] = [{ role: "user", content: "hi" }]
		const gen = handler.createMessage("system", messages)
		await gen.next()

		expect(captured).to.have.length(1)
		expect(captured[0].config?.thinkingConfig?.thinkingLevel).to.equal(ThinkingLevel.LOW)
		expect(captured[0].config?.thinkingConfig?.thinkingBudget).to.equal(undefined)
		expect(captured[0].config?.thinkingConfig?.includeThoughts).to.equal(true)
	})
})
