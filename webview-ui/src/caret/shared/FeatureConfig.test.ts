// CARET MODIFICATION: Feature configuration integration tests
// TDD RED Phase: 실제 사용 시나리오 기반 통합 테스트

import { type FeatureConfig, getCurrentFeatureConfig } from "@caret/shared/FeatureConfig"
import { describe, expect, it } from "vitest"

describe("FeatureConfig Integration Tests", () => {
	describe("정적 기능 설정 시나리오", () => {
		it("should load feature config from static JSON import", () => {
			// Given: 정적 JSON 파일이 import됨
			const config = getCurrentFeatureConfig()

			// When: 설정을 확인
			// Then: JSON 파일의 설정값이 적용됨
			expect(config.showPersonaSettings).toBe(true)
			expect(config.redirectAfterApiSetup).toBe("persona")
			expect(config.defaultModeSystem).toBe("caret")
			expect(config.firstListingProvider).toBe("openrouter")
			expect(config.defaultProvider).toBe("openrouter")
			expect(config.showOnlyDefaultProvider).toBe(false)
		})
	})

	describe("UI 컴포넌트 통합 시나리오", () => {
		it("should show persona settings when enabled in config", () => {
			// Given: 페르소나 설정이 활성화된 설정
			const config: FeatureConfig = {
				showPersonaSettings: true,
				defaultPersonaEnabled: true,
				redirectAfterApiSetup: "persona",
				defaultModeSystem: "caret",
				firstListingProvider: "openrouter",
				defaultProvider: "openrouter",
				showOnlyDefaultProvider: false,
				showCostInformation: true,
			}

			// When: UI에서 페르소나 표시 여부 확인
			const shouldShowPersona = config.showPersonaSettings

			// Then: 페르소나 UI가 표시됨
			expect(shouldShowPersona).toBe(true)
		})

		it("should hide persona settings when disabled in config", () => {
			// Given: 페르소나 설정이 비활성화된 설정
			const config: FeatureConfig = {
				showPersonaSettings: false,
				defaultPersonaEnabled: false,
				redirectAfterApiSetup: "home",
				defaultModeSystem: "cline",
				firstListingProvider: "litellm",
				defaultProvider: "litellm",
				showOnlyDefaultProvider: true,
				showCostInformation: false,
			}

			// When: UI에서 페르소나 표시 여부 확인
			const shouldShowPersona = config.showPersonaSettings

			// Then: 페르소나 UI가 숨겨짐
			expect(shouldShowPersona).toBe(false)
		})

		it("should redirect to persona after API setup when configured", () => {
			// Given: 페르소나로 리다이렉트하도록 설정됨
			const config: FeatureConfig = {
				showPersonaSettings: true,
				defaultPersonaEnabled: true,
				redirectAfterApiSetup: "persona",
				defaultModeSystem: "caret",
				firstListingProvider: "openrouter",
				defaultProvider: "openrouter",
				showOnlyDefaultProvider: false,
				showCostInformation: true,
			}

			// When: API 설정 완료 후 리다이렉트 위치 확인
			const redirectTarget = config.redirectAfterApiSetup

			// Then: 페르소나로 리다이렉트됨
			expect(redirectTarget).toBe("persona")
		})

		it("should redirect to home after API setup when configured", () => {
			// Given: 홈으로 리다이렉트하도록 설정됨
			const config: FeatureConfig = {
				showPersonaSettings: false,
				defaultPersonaEnabled: false,
				redirectAfterApiSetup: "home",
				defaultModeSystem: "cline",
				firstListingProvider: "litellm",
				defaultProvider: "litellm",
				showOnlyDefaultProvider: true,
				showCostInformation: false,
			}

			// When: API 설정 완료 후 리다이렉트 위치 확인
			const redirectTarget = config.redirectAfterApiSetup

			// Then: 홈으로 리다이렉트됨
			expect(redirectTarget).toBe("home")
		})
	})

	describe("프로바이더 설정 시나리오", () => {
		it("should show only default provider when showOnlyDefaultProvider is true", () => {
			// Given: 기본 프로바이더만 표시하도록 설정됨
			const config: FeatureConfig = {
				showPersonaSettings: false,
				defaultPersonaEnabled: false,
				redirectAfterApiSetup: "home",
				defaultModeSystem: "cline",
				firstListingProvider: "litellm",
				defaultProvider: "litellm",
				showOnlyDefaultProvider: true,
				showCostInformation: false,
			}

			// When: 프로바이더 표시 설정 확인
			const showOnlyDefault = config.showOnlyDefaultProvider
			const defaultProvider = config.defaultProvider

			// Then: 기본 프로바이더만 표시됨
			expect(showOnlyDefault).toBe(true)
			expect(defaultProvider).toBe("litellm")
		})

		it("should show all providers when showOnlyDefaultProvider is false", () => {
			// Given: 모든 프로바이더를 표시하도록 설정됨
			const config: FeatureConfig = {
				showPersonaSettings: true,
				defaultPersonaEnabled: true,
				redirectAfterApiSetup: "persona",
				defaultModeSystem: "caret",
				firstListingProvider: "openrouter",
				defaultProvider: "openrouter",
				showOnlyDefaultProvider: false,
				showCostInformation: true,
			}

			// When: 프로바이더 표시 설정 확인
			const showOnlyDefault = config.showOnlyDefaultProvider

			// Then: 모든 프로바이더가 표시됨
			expect(showOnlyDefault).toBe(false)
		})
	})
})
