import * as proto from "@shared/proto"
import axios from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Controller } from "@/core/controller"
import { fetchLiteLlmModels } from "./fetchLiteLlmModels"

// Mock axios
vi.mock("axios")
const mockedAxios = axios as any

// Mock Logger
vi.mock("@services/logging/Logger", () => ({
	Logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}))

describe("fetchLiteLlmModels", () => {
	const mockController = {} as Controller

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it("should successfully fetch and filter models using /health and /v1/models endpoints", async () => {
		// CARETI MODIFICATION: Test health-based filtering with model name normalization
		// Mock /health response (includes ollama_chat prefix and colon separator)
		const mockHealthResponse = {
			data: {
				healthy_endpoints: [
					{ model: "ollama_chat/phi3:mini" }, // Will match phi3-mini after normalization
					{ model: "ollama_chat/qwen2.5:1.5b-instruct" }, // Will match qwen2.5-1.5b-instruct
					{ model: "openrouter/z-ai/glm-4.5-air" }, // Exact match
					{ model: "openai/Qwen3/Qwen3-Coder-30B-A3B-Instruct" }, // Exact match
					{ model: "openrouter/qwen/qwen3-235b-a22b-2507" }, // Not in /v1/models - will be filtered out
				],
				unhealthy_endpoints: [],
			},
		}

		// Mock /v1/models response (normalized names)
		const mockModelsResponse = {
			data: {
				data: [
					{ id: "phi3-mini", object: "model", created: 1677610602, owned_by: "openai" },
					{ id: "qwen2.5-1.5b-instruct", object: "model", created: 1677610602, owned_by: "openai" },
					{ id: "openrouter/z-ai/glm-4.5-air", object: "model", created: 1677610602, owned_by: "openai" },
					{ id: "openai/Qwen3/Qwen3-Coder-30B-A3B-Instruct", object: "model", created: 1677610602, owned_by: "openai" },
					{ id: "unavailable-model", object: "model", created: 1677610602, owned_by: "other" }, // Available but not healthy
				],
				object: "list",
			},
		}

		// First call: /health, Second call: /v1/models
		mockedAxios.get.mockResolvedValueOnce(mockHealthResponse).mockResolvedValueOnce(mockModelsResponse)

		const request = proto.caret.FetchLiteLlmModelsRequest.create({
			baseUrl: "https://api.litellm.com",
			apiKey: "test-key",
		})

		const result = await fetchLiteLlmModels(mockController, request)

		// Should return healthy models with FULL NAMES (not normalized)
		// After filtering by availability in /v1/models
		expect(result.success).toBe(true)
		expect(result.models).toEqual([
			"ollama_chat/phi3:mini", // Full name from /health (matched phi3-mini in /v1/models)
			"ollama_chat/qwen2.5:1.5b-instruct", // Full name from /health
			"openai/Qwen3/Qwen3-Coder-30B-A3B-Instruct",
			"openrouter/z-ai/glm-4.5-air",
		])
		expect(result.errorMessage).toBe("")

		// Verify both endpoints were called
		expect(mockedAxios.get).toHaveBeenCalledTimes(2)
		expect(mockedAxios.get).toHaveBeenNthCalledWith(1, "https://api.litellm.com/health", {
			headers: {
				accept: "application/json",
				Authorization: "Bearer test-key",
			},
			timeout: 60000,
		})
		expect(mockedAxios.get).toHaveBeenNthCalledWith(
			2,
			"https://api.litellm.com/v1/models?return_wildcard_routes=false&include_model_access_groups=false&only_model_access_groups=false&include_metadata=false",
			{
				headers: {
					accept: "application/json",
					"x-litellm-api-key": "test-key",
				},
				timeout: 10000,
			},
		)
	})

	it("should handle missing base URL", async () => {
		const request = proto.caret.FetchLiteLlmModelsRequest.create({
			baseUrl: "",
			apiKey: "test-key",
		})

		const result = await fetchLiteLlmModels(mockController, request)

		expect(result.success).toBe(false)
		expect(result.models).toEqual([])
		expect(result.errorMessage).toBe("Base URL is required")
		expect(mockedAxios.get).not.toHaveBeenCalled()
	})

	it("should handle /health failure and fallback to /v1/models only", async () => {
		// /health fails
		mockedAxios.get.mockRejectedValueOnce(new Error("Health check unavailable"))

		// /v1/models succeeds
		const mockModelsResponse = {
			data: {
				data: [
					{ id: "gpt-3.5-turbo", object: "model", created: 1677610602, owned_by: "openai" },
					{ id: "gpt-4", object: "model", created: 1677610602, owned_by: "openai" },
				],
				object: "list",
			},
		}
		mockedAxios.get.mockResolvedValueOnce(mockModelsResponse)

		const request = proto.caret.FetchLiteLlmModelsRequest.create({
			baseUrl: "https://api.litellm.com",
			apiKey: "test-key",
		})

		const result = await fetchLiteLlmModels(mockController, request)

		// Should succeed with all available models (no health filtering)
		expect(result.success).toBe(true)
		expect(result.models).toEqual(["gpt-3.5-turbo", "gpt-4"])
		expect(result.errorMessage).toBe("")
	})

	it("should handle HTTP errors gracefully when /v1/models fails", async () => {
		// /health succeeds
		mockedAxios.get.mockResolvedValueOnce({
			data: { healthy_endpoints: [{ model: "gpt-4" }], unhealthy_endpoints: [] },
		})

		// /v1/models fails
		mockedAxios.get.mockRejectedValueOnce(new Error("Network error"))

		const request = proto.caret.FetchLiteLlmModelsRequest.create({
			baseUrl: "https://api.litellm.com",
			apiKey: "test-key",
		})

		const result = await fetchLiteLlmModels(mockController, request)

		expect(result.success).toBe(false)
		expect(result.models).toEqual([])
		expect(result.errorMessage).toBe("Failed to fetch models: Network error")
	})

	it("should handle empty models list", async () => {
		// /health returns some healthy models
		mockedAxios.get.mockResolvedValueOnce({
			data: { healthy_endpoints: [{ model: "gpt-4" }], unhealthy_endpoints: [] },
		})

		// /v1/models returns empty list
		const mockEmptyResponse = {
			data: {
				data: [],
				object: "list",
			},
		}
		mockedAxios.get.mockResolvedValueOnce(mockEmptyResponse)

		const request = proto.caret.FetchLiteLlmModelsRequest.create({
			baseUrl: "https://api.litellm.com",
			apiKey: "test-key",
		})

		const result = await fetchLiteLlmModels(mockController, request)

		expect(result.success).toBe(true)
		expect(result.models).toEqual([]) // Empty intersection
		expect(result.errorMessage).toBe("")
	})

	it("should work without API key (for public endpoints)", async () => {
		// /health without API key
		mockedAxios.get.mockResolvedValueOnce({
			data: { healthy_endpoints: [{ model: "public-model" }], unhealthy_endpoints: [] },
		})

		// /v1/models without API key
		const mockModelsResponse = {
			data: {
				data: [{ id: "public-model", object: "model", created: 1677610602, owned_by: "provider" }],
				object: "list",
			},
		}
		mockedAxios.get.mockResolvedValueOnce(mockModelsResponse)

		const request = proto.caret.FetchLiteLlmModelsRequest.create({
			baseUrl: "https://api.litellm.com",
			apiKey: "",
		})

		const result = await fetchLiteLlmModels(mockController, request)

		expect(result.success).toBe(true)
		expect(result.models).toEqual(["public-model"])

		// Verify both calls made without API key
		expect(mockedAxios.get).toHaveBeenCalledTimes(2)
		expect(mockedAxios.get).toHaveBeenNthCalledWith(1, "https://api.litellm.com/health", {
			headers: {
				accept: "application/json",
				// No Authorization header when API key is empty
			},
			timeout: 60000,
		})
		expect(mockedAxios.get).toHaveBeenNthCalledWith(
			2,
			"https://api.litellm.com/v1/models?return_wildcard_routes=false&include_model_access_groups=false&only_model_access_groups=false&include_metadata=false",
			{
				headers: {
					accept: "application/json",
					// No x-litellm-api-key header when API key is empty
				},
				timeout: 10000,
			},
		)
	})

})

// CARETI MODIFICATION: Integration test with real LiteLLM server (separate file to avoid mock conflicts)
// Run this test separately: npx vitest run caret-src/core/controller/fetchLiteLlmModels.test.ts --grep "Integration"
describe.skip("Integration test with real LiteLLM server", () => {
	// This test is skipped by default to avoid mock conflicts
	// To run: remove .skip and run with --no-isolate flag
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
		},
		90000,
	) // 90 second timeout for real API calls
})
