// CARETI MODIFICATION: State Keys Type Safety Tests
// 이 테스트는 Careti의 현재 state-keys.ts 구조를 검증합니다.

import { expect } from "chai"
import { describe, it } from "mocha"

import { type GlobalStateAndSettingsKey, type GlobalStateKey, type SecretKey, type SettingsKey } from "../state-keys"

describe("API Configuration Management", () => {
	describe("Type definitions", () => {
		it("should have SecretKey type", () => {
			const secretKey: SecretKey = "apiKey"
			expect(secretKey).to.be.a("string")
		})

		it("should have SettingsKey type", () => {
			const settingsKey: SettingsKey = "awsRegion"
			expect(settingsKey).to.be.a("string")
		})

		it("should have GlobalStateKey type", () => {
			const globalStateKey: GlobalStateKey = "taskHistory"
			expect(globalStateKey).to.be.a("string")
		})

		it("should have GlobalStateAndSettingsKey type", () => {
			const key: GlobalStateAndSettingsKey = "awsRegion"
			expect(key).to.be.a("string")
		})
	})

	describe("Secret identification", () => {
		it("should identify API keys as secrets", () => {
			const secretKeys: SecretKey[] = [
				"apiKey",
				"openRouterApiKey",
				"openAiApiKey",
				"geminiApiKey",
				"zaiApiKey",
				"bizRouterApiKey",
				"naverCloudApiKey",
			]

			secretKeys.forEach((key) => {
				expect(key.toLowerCase()).to.include("apikey", `${key} should contain 'apikey'`)
			})
		})
	})

	describe("Settings identification", () => {
		it("should identify configuration settings", () => {
			const settingsKeys: SettingsKey[] = [
				"awsRegion",
				"vertexProjectId",
				"openAiBaseUrl",
				"anthropicBaseUrl",
				"geminiBaseUrl",
			]

			settingsKeys.forEach((key) => {
				expect(key).to.be.a("string")
			})
		})
	})
})
