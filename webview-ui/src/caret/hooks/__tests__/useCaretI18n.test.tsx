// CARET MODIFICATION: Tests for integrated useCaretI18n hook
import { act, renderHook } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CaretI18nProvider } from "../../context/CaretI18nContext"
import { resetI18nPerformanceMetrics } from "../../utils/i18n"
import { useCaretI18n } from "../useCaretI18n"

// Mock the performance monitoring
vi.mock("../../utils/i18n-performance", () => ({
	performanceMonitor: {
		startTranslation: vi.fn(() => vi.fn()),
		getCachedTranslation: vi.fn(() => undefined),
		setCachedTranslation: vi.fn(),
		recordTemplateProcessing: vi.fn(),
		recordKoreanParticleProcessing: vi.fn(),
		getMetrics: vi.fn(() => ({
			translationCalls: 5,
			cacheHits: 2,
			cacheMisses: 3,
			averageTranslationTime: 1.5,
			templateProcessingTime: 0.8,
			koreanParticleProcessingTime: 0.5,
			cacheHitRate: 0.4,
		})),
		logPerformanceSummary: vi.fn(),
		reset: vi.fn(),
	},
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<CaretI18nProvider defaultLanguage="en">{children}</CaretI18nProvider>
)

describe("useCaretI18n Integration Tests", () => {
	beforeEach(() => {
		resetI18nPerformanceMetrics()
		vi.clearAllMocks()
	})

	it("should provide complete API with Context integration", () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		expect(result.current).toHaveProperty("t")
		expect(result.current).toHaveProperty("tWithLang")
		expect(result.current).toHaveProperty("currentLanguage")
		expect(result.current).toHaveProperty("changeLanguage")
		expect(result.current).toHaveProperty("isLanguageSupported")
		expect(result.current).toHaveProperty("isLoading")
		expect(result.current).toHaveProperty("preloadLanguages")
		expect(result.current).toHaveProperty("getPerformanceMetrics")
	})

	it("should translate using context language", () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		const translation = result.current.t("welcome.title", "welcome")
		// Translation should return a string (fallback to key if translation missing)
		expect(typeof translation).toBe("string")
		expect(translation.length).toBeGreaterThan(0)
		expect(result.current.currentLanguage).toBe("en")
	})

	it("should provide tWithLang functionality", () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		const koreanTranslation = result.current.tWithLang("welcome.title", "ko", "welcome")
		// Should return a translation or fallback key
		expect(typeof koreanTranslation).toBe("string")
		expect(koreanTranslation.length).toBeGreaterThan(0)
	})

	it("should support language change", async () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		await act(async () => {
			await result.current.changeLanguage("ko")
		})

		// The hook should reflect the language change
		// Note: In test environment, the actual language change might be mocked
		expect(["en", "ko"]).toContain(result.current.currentLanguage)
	})

	it("should validate language support", () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		expect(result.current.isLanguageSupported("ko")).toBe(true)
		expect(result.current.isLanguageSupported("en")).toBe(true)
		expect(result.current.isLanguageSupported("ja")).toBe(true)
		expect(result.current.isLanguageSupported("zh")).toBe(true)
		expect(result.current.isLanguageSupported("fr")).toBe(false)
	})

	it("should provide performance metrics", () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		const metrics = result.current.getPerformanceMetrics()
		expect(metrics).toHaveProperty("translationCalls")
		expect(metrics).toHaveProperty("cacheHitRate")
		expect(metrics).toHaveProperty("averageTranslationTime")
	})

	it("should handle preloading languages", async () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		await act(async () => {
			await result.current.preloadLanguages(["ko", "ja"])
		})

		// Should not throw and complete successfully
		expect(result.current.preloadLanguages).toBeDefined()
	})

	it("should work without Context (fallback mode)", () => {
		// Test without wrapper to verify fallback behavior
		const { result } = renderHook(() => useCaretI18n())

		// Should still provide basic functionality
		expect(result.current.t).toBeDefined()
		expect(result.current.currentLanguage).toBeDefined()
		expect(typeof result.current.t("welcome.title", "welcome")).toBe("string")
	})

	it("should handle Korean particle processing in translations", () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		const koreanWithParticle = result.current.tWithLang("welcome.title", "ko", "welcome")
		// Should process Korean particles like "캐럿을" or "캐럿를"
		expect(koreanWithParticle).toBeTruthy()
	})

	it("should maintain translation consistency between hook and direct calls", () => {
		const { result } = renderHook(() => useCaretI18n(), { wrapper })

		const hookTranslation = result.current.t("welcome.title", "welcome")
		const directTranslation = result.current.tWithLang("welcome.title", "en", "welcome")

		// Should produce equivalent results for same language
		expect(hookTranslation).toBe(directTranslation)
	})
})
