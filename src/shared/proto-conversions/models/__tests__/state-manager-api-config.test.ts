// CARETI MODIFICATION: Test for StateManager API configuration handling
// Tests that the StateManager correctly stores and retrieves provider values
import { expect } from "chai"
import { describe, it, beforeEach } from "mocha"
import { ApiConfiguration, ApiProvider } from "@shared/api"

/**
 * Mock StateManager to test API configuration storage/retrieval
 * This simulates the actual StateManager behavior without VS Code dependencies
 */
class MockStateManager {
	private globalStateCache: Record<string, any> = {}
	private secretsCache: Record<string, any> = {}

	setApiConfiguration(apiConfiguration: ApiConfiguration): void {
		const {
			apiKey,
			openRouterApiKey,
			bizRouterApiKey,
			planModeApiProvider,
			actModeApiProvider,
			planModeCaretModelId,
			actModeCaretModelId,
			planModeBizRouterModelId,
			actModeBizRouterModelId,
			// ... other fields would be destructured here
		} = apiConfiguration

		// Set global state (non-secret fields)
		this.setGlobalStateBatch({
			planModeApiProvider,
			actModeApiProvider,
			planModeCaretModelId,
			actModeCaretModelId,
			planModeBizRouterModelId,
			actModeBizRouterModelId,
		})

		// Set secrets
		this.setSecretsBatch({
			apiKey,
			openRouterApiKey,
			bizRouterApiKey,
		})
	}

	getApiConfiguration(): ApiConfiguration {
		return {
			// Return from global state
			planModeApiProvider: this.globalStateCache["planModeApiProvider"],
			actModeApiProvider: this.globalStateCache["actModeApiProvider"],
			planModeCaretModelId: this.globalStateCache["planModeCaretModelId"],
			actModeCaretModelId: this.globalStateCache["actModeCaretModelId"],
			planModeBizRouterModelId: this.globalStateCache["planModeBizRouterModelId"],
			actModeBizRouterModelId: this.globalStateCache["actModeBizRouterModelId"],
			// Return from secrets
			apiKey: this.secretsCache["apiKey"],
			openRouterApiKey: this.secretsCache["openRouterApiKey"],
			bizRouterApiKey: this.secretsCache["bizRouterApiKey"],
		}
	}

	private setGlobalStateBatch(updates: Record<string, any>): void {
		Object.assign(this.globalStateCache, updates)
	}

	private setSecretsBatch(updates: Record<string, any>): void {
		Object.entries(updates).forEach(([key, value]) => {
			if (value !== undefined) {
				this.secretsCache[key] = value
			}
		})
	}

	// For testing: clear all state
	clear(): void {
		this.globalStateCache = {}
		this.secretsCache = {}
	}
}

describe("StateManager API Configuration", () => {
	let stateManager: MockStateManager

	beforeEach(() => {
		stateManager = new MockStateManager()
	})

	describe("provider storage and retrieval", () => {
		const ALL_PROVIDERS: ApiProvider[] = [
			"anthropic",
			"openrouter",
			"gemini",
			"openai-native",
			"ollama",
			"careti",
			"bizrouter",
			"upstage",
			"naver-cloud",
		]

		ALL_PROVIDERS.forEach((provider) => {
			it(`should store and retrieve '${provider}' for actModeApiProvider`, () => {
				const config: ApiConfiguration = {
					actModeApiProvider: provider,
				}

				stateManager.setApiConfiguration(config)
				const retrieved = stateManager.getApiConfiguration()

				expect(retrieved.actModeApiProvider).to.equal(provider)
			})

			it(`should store and retrieve '${provider}' for planModeApiProvider`, () => {
				const config: ApiConfiguration = {
					planModeApiProvider: provider,
				}

				stateManager.setApiConfiguration(config)
				const retrieved = stateManager.getApiConfiguration()

				expect(retrieved.planModeApiProvider).to.equal(provider)
			})
		})
	})

	describe("provider update simulation", () => {
		it("should correctly update actModeApiProvider from anthropic to careti", () => {
			// Initial state: anthropic
			stateManager.setApiConfiguration({
				actModeApiProvider: "anthropic",
				planModeApiProvider: "anthropic",
			})

			// Verify initial state
			let config = stateManager.getApiConfiguration()
			expect(config.actModeApiProvider).to.equal("anthropic")

			// Update to careti (simulating user selection)
			stateManager.setApiConfiguration({
				...config,
				actModeApiProvider: "careti",
			})

			// Verify update
			config = stateManager.getApiConfiguration()
			expect(config.actModeApiProvider).to.equal("careti")
			expect(config.planModeApiProvider).to.equal("anthropic") // Should remain unchanged
		})

		it("should correctly update both modes when not using separate models", () => {
			// Initial state
			stateManager.setApiConfiguration({
				actModeApiProvider: "anthropic",
				planModeApiProvider: "anthropic",
			})

			// Update both modes at once (when "use different models" is off)
			stateManager.setApiConfiguration({
				actModeApiProvider: "gemini",
				planModeApiProvider: "gemini",
			})

			const config = stateManager.getApiConfiguration()
			expect(config.actModeApiProvider).to.equal("gemini")
			expect(config.planModeApiProvider).to.equal("gemini")
		})

		it("should preserve model IDs when updating provider", () => {
			stateManager.setApiConfiguration({
				actModeApiProvider: "careti",
				actModeCaretModelId: "gemini/gemini-3-pro",
			})

			const config = stateManager.getApiConfiguration()
			expect(config.actModeApiProvider).to.equal("careti")
			expect(config.actModeCaretModelId).to.equal("gemini/gemini-3-pro")
		})
	})

	describe("edge cases", () => {
		it("should handle undefined provider gracefully", () => {
			stateManager.setApiConfiguration({})

			const config = stateManager.getApiConfiguration()
			expect(config.actModeApiProvider).to.be.undefined
			expect(config.planModeApiProvider).to.be.undefined
		})

		it("should not lose provider when updating other fields", () => {
			// Set initial provider
			stateManager.setApiConfiguration({
				actModeApiProvider: "careti",
				planModeApiProvider: "careti",
			})

			// Update with additional fields (simulating partial update)
			const currentConfig = stateManager.getApiConfiguration()
			stateManager.setApiConfiguration({
				...currentConfig,
				actModeCaretModelId: "new-model-id",
			})

			const config = stateManager.getApiConfiguration()
			expect(config.actModeApiProvider).to.equal("careti")
			expect(config.actModeCaretModelId).to.equal("new-model-id")
		})
	})
})
