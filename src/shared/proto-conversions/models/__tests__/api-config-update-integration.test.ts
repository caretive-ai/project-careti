// CARETI MODIFICATION: Integration test for API configuration update flow
// Tests the full flow: App config → Proto → Backend processing → App config
import { expect } from "chai"
import { describe, it } from "mocha"
import { ApiConfiguration, ApiProvider } from "@shared/api"
import {
	convertApiConfigurationToProto,
	convertProtoToApiConfiguration,
} from "../api-configuration-conversion"

/**
 * Simulates the full update flow:
 * 1. Frontend creates ApiConfiguration with provider
 * 2. Converts to Proto
 * 3. Backend receives and converts back
 * 4. Verify the provider is preserved
 */
function simulateProviderUpdateFlow(provider: ApiProvider): {
	originalProvider: ApiProvider
	protoProvider: number
	roundtrippedProvider: ApiProvider | undefined
} {
	// Step 1: Create app config with the provider (simulating frontend)
	const appConfig: ApiConfiguration = {
		actModeApiProvider: provider,
		planModeApiProvider: provider,
	}

	// Step 2: Convert to proto (frontend does this before sending)
	const protoConfig = convertApiConfigurationToProto(appConfig)

	// Step 3: Backend receives proto and converts back
	const backendConfig = convertProtoToApiConfiguration(protoConfig)

	return {
		originalProvider: provider,
		protoProvider: protoConfig.actModeApiProvider!,
		roundtrippedProvider: backendConfig.actModeApiProvider,
	}
}

describe("API Configuration Update Integration", () => {
	describe("provider update flow", () => {
		const CARETI_PROVIDERS: ApiProvider[] = ["careti", "bizrouter"]
		const COMMON_PROVIDERS: ApiProvider[] = [
			"anthropic",
			"gemini",
			"openai-native",
			"openrouter",
			"ollama",
		]

		CARETI_PROVIDERS.forEach((provider) => {
			it(`should preserve '${provider}' through full update flow`, () => {
				const result = simulateProviderUpdateFlow(provider)

				expect(result.roundtrippedProvider).to.equal(
					result.originalProvider,
					`Provider '${provider}' was changed to '${result.roundtrippedProvider}' after roundtrip. Proto value: ${result.protoProvider}`,
				)
			})
		})

		COMMON_PROVIDERS.forEach((provider) => {
			it(`should preserve '${provider}' through full update flow`, () => {
				const result = simulateProviderUpdateFlow(provider)

				expect(result.roundtrippedProvider).to.equal(
					result.originalProvider,
					`Provider '${provider}' was changed to '${result.roundtrippedProvider}' after roundtrip`,
				)
			})
		})
	})

	describe("full ApiConfiguration roundtrip", () => {
		it("should preserve careti provider with model info", () => {
			const appConfig: ApiConfiguration = {
				actModeApiProvider: "careti",
				planModeApiProvider: "careti",
				actModeCaretModelId: "gemini/gemini-3-pro-preview",
				planModeCaretModelId: "gemini/gemini-3-pro-preview",
			}

			const protoConfig = convertApiConfigurationToProto(appConfig)
			const roundtripped = convertProtoToApiConfiguration(protoConfig)

			expect(roundtripped.actModeApiProvider).to.equal("careti")
			expect(roundtripped.planModeApiProvider).to.equal("careti")
			expect(roundtripped.actModeCaretModelId).to.equal("gemini/gemini-3-pro-preview")
			expect(roundtripped.planModeCaretModelId).to.equal("gemini/gemini-3-pro-preview")
		})

		it("should preserve bizrouter provider with API key", () => {
			const appConfig: ApiConfiguration = {
				actModeApiProvider: "bizrouter",
				planModeApiProvider: "bizrouter",
				bizRouterApiKey: "test-api-key",
			}

			const protoConfig = convertApiConfigurationToProto(appConfig)
			const roundtripped = convertProtoToApiConfiguration(protoConfig)

			expect(roundtripped.actModeApiProvider).to.equal("bizrouter")
			expect(roundtripped.planModeApiProvider).to.equal("bizrouter")
			expect(roundtripped.bizRouterApiKey).to.equal("test-api-key")
		})
	})
})
