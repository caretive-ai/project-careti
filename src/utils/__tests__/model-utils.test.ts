// CARETI MODIFICATION: TDD 회귀 테스트 - GPT-5.2 모델 판별 및 프롬프트 매처 동작 보장

import { expect } from "chai"
import { describe, it } from "mocha"
import { config as gpt5Config } from "@/core/prompts/system-prompt/variants/native-gpt-5/config"
import { config as gpt51Config } from "@/core/prompts/system-prompt/variants/native-gpt-5-1/config"
import { openAiNativeModels } from "@/shared/api"
import { isGPT52Model } from "../model-utils"

describe("model-utils GPT-5.2", () => {
	it("GPT-5.2 모델 ID를 올바르게 판별한다", () => {
		expect(isGPT52Model("gpt-5.2")).to.equal(true)
		expect(isGPT52Model("gpt-5-2")).to.equal(true)
		expect(isGPT52Model("gpt-5.1")).to.equal(false)
	})

	it("Native GPT-5.2는 gpt-5-1 계열 프롬프트 매처로 매칭된다", () => {
		const providerInfo = {
			providerId: "openai-native",
			model: { id: "gpt-5.2", info: openAiNativeModels["gpt-5.2"] },
		}

		expect(gpt51Config.matcher({ enableNativeToolCalls: true, providerInfo } as any)).to.equal(true)
		expect(gpt5Config.matcher({ enableNativeToolCalls: true, providerInfo } as any)).to.equal(false)
	})
})
