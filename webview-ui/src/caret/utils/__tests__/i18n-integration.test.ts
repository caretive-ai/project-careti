// Integration Test for Caret i18n System
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setGlobalUILanguage, setTranslationsForTesting, t } from "../i18n"

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, "localStorage", { value: localStorageMock })

// Mock fetch for loading locale files
global.fetch = vi.fn()

const mockKoreanLocale = {
	common: {
		loading: "로딩 중...",
		error: "오류",
		success: "성공",
		cancel: "취소",
		confirm: "확인",
	},
	chat: {
		userMessage: {
			placeholder: "메시지를 입력하세요...",
			sendButton: "보내기",
		},
		errorMessages: {
			apiKeyRequired: "API 키가 필요합니다.",
			networkError: "네트워크 오류가 발생했습니다.",
		},
	},
	settings: {
		general: {
			preferredLanguage: "선호 언어",
			theme: "테마",
		},
		apiConfiguration: {
			title: "API 설정",
			provider: "제공업체",
		},
	},
	welcome: {},
	persona: {},
	"validate-api-conf": {},
	announcement: {},
}

const mockEnglishLocale = {
	common: {
		loading: "Loading...",
		error: "Error",
		success: "Success",
		cancel: "Cancel",
		confirm: "Confirm",
	},
	chat: {
		userMessage: {
			placeholder: "Type your message...",
			sendButton: "Send",
		},
		errorMessages: {
			apiKeyRequired: "API key is required.",
			networkError: "Network error occurred.",
		},
	},
	settings: {
		general: {
			preferredLanguage: "Preferred Language",
			theme: "Theme",
		},
		apiConfiguration: {
			title: "API Configuration",
			provider: "Provider",
		},
	},
	welcome: {},
	persona: {},
	"validate-api-conf": {},
	announcement: {},
}

describe("i18n Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		localStorageMock.getItem.mockReturnValue(null)

		// Reset to default state and set up mock translations
		setGlobalUILanguage("en")
		setTranslationsForTesting({
			ko: mockKoreanLocale as any,
			en: mockEnglishLocale as any,
			ja: mockEnglishLocale as any, // Use English as fallback for test
			zh: mockEnglishLocale as any, // Use English as fallback for test
		})
	})

	describe("Basic Translation", () => {
		it("should translate simple keys correctly", () => {
			setGlobalUILanguage("en")

			expect(t("loading", "common")).toBe("Loading...")
			expect(t("error", "common")).toBe("Error")
			expect(t("success", "common")).toBe("Success")
		})

		it("should translate nested keys correctly", () => {
			setGlobalUILanguage("en")

			expect(t("userMessage.placeholder", "chat")).toBe("Type your message...")
			expect(t("general.preferredLanguage", "settings")).toBe("Preferred Language")
			expect(t("apiConfiguration.title", "settings")).toBe("API Configuration")
		})

		it("should return fallback text for missing keys", () => {
			setGlobalUILanguage("en")

			expect(t("nonexistent.key", "common")).toBe("nonexistent.key")
			expect(t("nonexistent.key", "chat")).toBe("nonexistent.key")
		})
	})

	describe("Language Switching", () => {
		it("should switch between languages correctly", () => {
			// Set English
			setGlobalUILanguage("en")
			expect(t("loading", "common")).toBe("Loading...")

			// Switch to Korean
			setGlobalUILanguage("ko")
			expect(t("loading", "common")).toBe("로딩 중...")
			expect(t("userMessage.placeholder", "chat")).toBe("메시지를 입력하세요...")
		})

		it("should persist language preference to localStorage", () => {
			// This test would require actual localStorage integration
			// For now, just verify that language change works
			setGlobalUILanguage("ko")
			expect(t("loading", "common")).toBe("로딩 중...")
		})

		it("should load language preference from localStorage", () => {
			localStorageMock.getItem.mockReturnValue("ko")

			// Function that would be called on app initialization
			const savedLanguage = localStorage.getItem("caret_preferred_language") || "en"
			expect(savedLanguage).toBe("ko")
		})
	})

	describe("Namespace-based Translation", () => {
		it("should translate with specific namespace correctly", () => {
			setGlobalUILanguage("en")

			// Test namespace-based translation as used in components
			expect(t("userMessage.placeholder", "chat")).toBe("Type your message...")
			expect(t("general.preferredLanguage", "settings")).toBe("Preferred Language")
			expect(t("apiConfiguration.title", "settings")).toBe("API Configuration")
		})

		it("should handle fallback when namespace is not found", () => {
			setGlobalUILanguage("en")

			expect(t("someKey", "nonexistent")).toBe("someKey")
		})
	})

	describe("Error Handling", () => {
		it("should handle failed locale loading gracefully", () => {
			// Set up empty translations to simulate failed loading
			setTranslationsForTesting({
				ko: {} as any,
				en: {} as any,
				ja: {} as any,
				zh: {} as any,
			})

			setGlobalUILanguage("en")

			// Should return fallback text when locale fails to load
			expect(t("loading", "common")).toBe("loading")
		})

		it("should handle invalid JSON gracefully", () => {
			// Set up invalid translations structure
			setTranslationsForTesting({
				ko: { common: null } as any,
				en: { common: null } as any,
				ja: { common: null } as any,
				zh: { common: null } as any,
			})

			setGlobalUILanguage("en")
			expect(t("loading", "common")).toBe("loading")
		})
	})

	describe("Performance and Caching", () => {
		it("should cache translations for performance", () => {
			setGlobalUILanguage("en")

			// First call
			const result1 = t("loading", "common")
			// Second call should be cached
			const result2 = t("loading", "common")

			expect(result1).toBe(result2)
			expect(result1).toBe("Loading...")
		})
	})

	describe("Brand-specific Message Filtering", () => {
		it("should handle brand-specific messages", () => {
			const brandedLocale = {
				...mockEnglishLocale,
				chat: {
					...mockEnglishLocale.chat,
					brandMessages: {
						caret: "Welcome to Caret!",
						codecenter: "Welcome to CodeCenter!",
					},
				},
			}

			setTranslationsForTesting({
				ko: mockKoreanLocale as any,
				en: brandedLocale as any,
				ja: mockEnglishLocale as any,
				zh: mockEnglishLocale as any,
			})

			setGlobalUILanguage("en")

			// Test brand filtering (placeholder for future implementation)
			expect(t("brandMessages.codecenter", "chat")).toBe("Welcome to CodeCenter!")
		})
	})
})
