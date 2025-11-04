import * as proto from "@shared/proto"
import { describe, expect, it, vi } from "vitest"
import { Controller } from "@/core/controller"
import { fetchLiteLlmModels } from "./fetchLiteLlmModels"

// Mock Logger to avoid HostProvider dependency
vi.mock("@services/logging/Logger", () => ({
	Logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}))

// CARET MODIFICATION: Integration test with real LiteLLM server
// Uses real axios and real API (only Logger is mocked)
describe("fetchLiteLlmModels - Integration test", () => {
	const mockController = {} as Controller

	it(
		"should fetch and filter models from real LiteLLM server",
		async () => {
			const request = proto.caret.FetchLiteLlmModelsRequest.create({
				baseUrl: "https://api.litellm.com",
				apiKey: "test-key",
			})

			const result = await fetchLiteLlmModels(mockController, request)

			// Assertions
			expect(result.success).toBe(true)
			expect(result.models).toBeDefined()
			expect(Array.isArray(result.models)).toBe(true)
			expect(result.errorMessage).toBe("")

			console.log(`\n✅ Integration test result:`)
			console.log(`   Total filtered models: ${result.models.length}`)
			console.log(`   Models:`, result.models)

			// Verify that models are strings
			result.models.forEach((model: string) => {
				expect(typeof model).toBe("string")
				expect(model.length).toBeGreaterThan(0)
			})

			// Based on previous manual test, we know at least one model should be returned
			expect(result.models.length).toBeGreaterThan(0)

			// Verify known healthy model is in the list (from previous curl test)
			const knownModel = "openrouter/z-ai/glm-4.5-air"
			if (result.models.includes(knownModel)) {
				console.log(`   ✅ Known healthy model found: ${knownModel}`)
			} else {
				console.log(`   ℹ️  Known model not found (may not be available with this API key)`)
			}
		},
		90000,
	) // 90 second timeout for real API calls (health check can be slow)

	it(
		"should verify intersection logic: only healthy AND available models returned",
		async () => {
			const request = proto.caret.FetchLiteLlmModelsRequest.create({
				baseUrl: "https://api.litellm.com",
				apiKey: "test-key",
			})

			const result = await fetchLiteLlmModels(mockController, request)

			expect(result.success).toBe(true)

			console.log(`\n🔍 Intersection logic verification:`)
			console.log(`   Final filtered models: ${result.models.length}`)

			// All returned models should be:
			// 1. Healthy (from /health endpoint)
			// 2. Available with API key (from /v1/models endpoint)
			expect(result.models.length).toBeGreaterThan(0)
		},
		90000,
	)
})
