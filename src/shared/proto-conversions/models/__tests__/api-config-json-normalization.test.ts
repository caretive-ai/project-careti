// CARETI MODIFICATION: Test for JSON request normalization in standalone/Tauri mode
// This tests the scenario where enum values are sent as strings (e.g., "UPSTAGE")
// instead of numbers (e.g., 40) when the request comes from the stdio-adapter
import { expect } from "chai"
import { describe, it } from "mocha"
import { UpdateApiConfigurationRequest, ApiProvider as ProtoApiProvider } from "@shared/proto/cline/models"

describe("API Configuration JSON Normalization", () => {
	describe("UpdateApiConfigurationRequest.fromJSON with string enum values", () => {
		it("should convert string enum 'UPSTAGE' to numeric enum value", () => {
			// Simulate JSON from webview (standalone mode sends string enum values)
			const jsonRequest = {
				apiConfiguration: {
					planModeApiProvider: "UPSTAGE",
					actModeApiProvider: "UPSTAGE",
				},
			}

			// fromJSON should convert string to numeric enum
			const protoRequest = UpdateApiConfigurationRequest.fromJSON(jsonRequest)

			expect(protoRequest.apiConfiguration?.planModeApiProvider).to.equal(ProtoApiProvider.UPSTAGE)
			expect(protoRequest.apiConfiguration?.actModeApiProvider).to.equal(ProtoApiProvider.UPSTAGE)
		})

		it("should convert string enum 'GEMINI' to numeric enum value", () => {
			const jsonRequest = {
				apiConfiguration: {
					planModeApiProvider: "GEMINI",
					actModeApiProvider: "ANTHROPIC",
				},
			}

			const protoRequest = UpdateApiConfigurationRequest.fromJSON(jsonRequest)

			expect(protoRequest.apiConfiguration?.planModeApiProvider).to.equal(ProtoApiProvider.GEMINI)
			expect(protoRequest.apiConfiguration?.actModeApiProvider).to.equal(ProtoApiProvider.ANTHROPIC)
		})

		it("should convert CARETI-specific providers correctly", () => {
			const jsonRequest = {
				apiConfiguration: {
					planModeApiProvider: "CARETI",
					actModeApiProvider: "BIZROUTER",
				},
			}

			const protoRequest = UpdateApiConfigurationRequest.fromJSON(jsonRequest)

			expect(protoRequest.apiConfiguration?.planModeApiProvider).to.equal(ProtoApiProvider.CARETI)
			expect(protoRequest.apiConfiguration?.actModeApiProvider).to.equal(ProtoApiProvider.BIZROUTER)
		})

		it("should handle numeric enum values (proto format) correctly", () => {
			// Simulate proto format (VS Code mode uses numeric enum values)
			const protoRequest = {
				apiConfiguration: {
					planModeApiProvider: 40, // UPSTAGE
					actModeApiProvider: 7, // GEMINI
				},
			}

			const normalized = UpdateApiConfigurationRequest.fromJSON(protoRequest)

			expect(normalized.apiConfiguration?.planModeApiProvider).to.equal(ProtoApiProvider.UPSTAGE)
			expect(normalized.apiConfiguration?.actModeApiProvider).to.equal(ProtoApiProvider.GEMINI)
		})

		it("should handle undefined provider values", () => {
			const jsonRequest = {
				apiConfiguration: {
					planModeApiModelId: "some-model-id",
					// planModeApiProvider and actModeApiProvider are not set
				},
			}

			const protoRequest = UpdateApiConfigurationRequest.fromJSON(jsonRequest)

			expect(protoRequest.apiConfiguration?.planModeApiProvider).to.be.undefined
			expect(protoRequest.apiConfiguration?.actModeApiProvider).to.be.undefined
		})

		it("should preserve other configuration fields", () => {
			const jsonRequest = {
				apiConfiguration: {
					planModeApiProvider: "UPSTAGE",
					planModeApiModelId: "solar-pro2-preview",
					upstageApiKey: "test-key-123",
				},
			}

			const protoRequest = UpdateApiConfigurationRequest.fromJSON(jsonRequest)

			expect(protoRequest.apiConfiguration?.planModeApiProvider).to.equal(ProtoApiProvider.UPSTAGE)
			expect(protoRequest.apiConfiguration?.planModeApiModelId).to.equal("solar-pro2-preview")
			expect(protoRequest.apiConfiguration?.upstageApiKey).to.equal("test-key-123")
		})
	})

	describe("Detection of JSON vs Proto format", () => {
		it("should detect JSON format when planModeApiProvider is a string", () => {
			const jsonRequest = {
				apiConfiguration: {
					planModeApiProvider: "UPSTAGE",
				},
			}

			const isJson = typeof jsonRequest.apiConfiguration.planModeApiProvider === "string"
			expect(isJson).to.be.true
		})

		it("should detect proto format when planModeApiProvider is a number", () => {
			const protoRequest = {
				apiConfiguration: {
					planModeApiProvider: 40,
				},
			}

			const isJson = typeof protoRequest.apiConfiguration.planModeApiProvider === "string"
			expect(isJson).to.be.false
		})
	})
})
