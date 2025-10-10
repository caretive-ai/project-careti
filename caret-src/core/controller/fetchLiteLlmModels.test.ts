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

	it("should successfully fetch models from LiteLLM health endpoint", async () => {
		// CARET MODIFICATION: Test successful model fetching
		const mockHealthResponse = {
			data: {
				healthy_endpoints: [{ model: "gpt-3.5-turbo" }, { model: "gpt-4" }, { model: "claude-3-sonnet" }],
			},
		}

		mockedAxios.get.mockResolvedValueOnce(mockHealthResponse)

		const request = proto.caret.FetchLiteLlmModelsRequest.create({
			baseUrl: "https://api.litellm.com",
			apiKey: "test-key",
		})

		const result = await fetchLiteLlmModels(mockController, request)

		expect(result.success).toBe(true)
		expect(result.models).toEqual(["claude-3-sonnet", "gpt-3.5-turbo", "gpt-4"])
		expect(result.errorMessage).toBe("")
		expect(mockedAxios.get).toHaveBeenCalledWith("https://api.litellm.com/health", {
			headers: { "x-litellm-api-key": "test-key" },
			timeout: 10000,
		})
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

	it("should handle HTTP errors gracefully", async () => {
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
})
