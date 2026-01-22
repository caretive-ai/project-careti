// CARETI MODIFICATION: TDD 회귀 테스트 - OpenRouter Featured 모델 목록에 Gemini 3 Flash Preview 포함

import { describe, expect, it } from "vitest"
import { openRouterFeaturedModels } from "../openrouter-featured-models"

describe("openRouterFeaturedModels", () => {
	it("Gemini 3 Flash Preview 모델이 포함되어야 한다", () => {
		expect(openRouterFeaturedModels.some((m) => m.id === "google/gemini-3-flash-preview")).to.equal(true)
	})
})
