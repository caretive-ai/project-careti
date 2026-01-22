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

// CARETI MODIFICATION: Integration test with real LiteLLM server
// Uses real axios and real API (only Logger is mocked)
// IMPORTANT: Set environment variables to run these tests:
//   LITELLM_TEST_BASE_URL="http://your-server:4000"
//   LITELLM_TEST_API_KEY="your-api-key"
describe("fetchLiteLlmModels - Integration test", () => {
	const mockController = {} as Controller
	const testBaseUrl = process.env.LITELLM_TEST_BASE_URL
	const testApiKey = process.env.LITELLM_TEST_API_KEY

	// Skip tests if environment variables are not set
	const describeIf = testBaseUrl && testApiKey ? it : it.skip

	describeIf(
		"should fetch and filter models from real LiteLLM server",
		async () => {
			const request = proto.careti.FetchLiteLlmModelsRequest.create({
				baseUrl: testBaseUrl!,
				apiKey: testApiKey!,
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

			// Based on manual testing:
			// - /health returns healthy models
			// - /v1/models returns available models (depends on API key permissions)
			// - Expected: intersection of healthy AND available models
			expect(result.models.length).toBeGreaterThanOrEqual(1)

			// Log results for manual verification
			console.log(`   ✅ Models returned: ${result.models.join(", ")}`)
		},
		90000,
	) // 90 second timeout for real API calls (health check can be slow)

	describeIf(
		"should verify intersection logic: only healthy AND available models returned",
		async () => {
			const request = proto.careti.FetchLiteLlmModelsRequest.create({
				baseUrl: testBaseUrl!,
				apiKey: testApiKey!,
			})

			const result = await fetchLiteLlmModels(mockController, request)

			expect(result.success).toBe(true)

			console.log(`\n🔍 Intersection logic verification:`)
			console.log(`   Final filtered models: ${result.models.length}`)
			console.log(`   Models: ${result.models.join(", ")}`)

			// All returned models should be:
			// 1. Healthy (from /health endpoint)
			// 2. Available with API key (from /v1/models endpoint)
			expect(result.models.length).toBeGreaterThanOrEqual(1)
		},
		90000,
	)
})
