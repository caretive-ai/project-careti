// CARETI MODIFICATION: TDD 회귀 테스트 - 신규 모델 구성(Gemini 3 Flash Preview, GPT-5.2) 존재 보장

import { expect } from "chai"
import { describe, it } from "mocha"
import { geminiModels, openAiNativeModels, vertexModels, xaiModels } from "../api"

describe("shared api model catalogs", () => {
	it("Gemini 3 Flash Preview 모델이 Gemini/Vertex 모델 목록에 존재해야 한다", () => {
		expect("gemini-3-flash-preview" in geminiModels).to.equal(true)
		expect("gemini-3-flash-preview" in vertexModels).to.equal(true)
	})

	it("OpenAI Native GPT-5.2 모델이 모델 목록에 존재해야 한다", () => {
		expect("gpt-5.2" in openAiNativeModels).to.equal(true)
	})

	it("XAI Grok 4.1/Grok Code 모델이 모델 목록에 존재해야 한다", () => {
		expect("grok-4-1-fast-reasoning" in xaiModels).to.equal(true)
		expect("grok-4-1-fast-non-reasoning" in xaiModels).to.equal(true)
		expect("grok-code-fast-1" in xaiModels).to.equal(true)
	})
})
