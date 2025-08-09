import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useCurrentLanguage, useCurrentLanguageWithLog } from "../useCurrentLanguage"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { caretWebviewLogger } from "@/caret/utils/webview-logger"

// Mock dependencies
vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: vi.fn(),
}))

vi.mock("@/caret/utils/webview-logger", () => ({
	caretWebviewLogger: {
		debug: vi.fn(),
	},
}))

const mockUseExtensionState = vi.mocked(useExtensionState)
const mockLogger = vi.mocked(caretWebviewLogger)

describe("useCurrentLanguage", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("useCurrentLanguage", () => {
		it("should return language from extension state when available", () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "ko",
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("ko")
			expect(mockLogger.debug).toHaveBeenCalledWith("🌐 useCurrentLanguage returning: ko")
		})

		it('should return "en" for supported language', () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "en",
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("en")
		})

		it('should return "ja" for supported language', () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "ja",
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("ja")
		})

		it('should return "zh" for supported language', () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "zh",
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("zh")
		})

		it('should return "en" for unsupported language', () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "fr",
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("en")
			expect(mockLogger.debug).toHaveBeenCalledWith("🌐 useCurrentLanguage returning fallback: en")
		})

		it('should return "en" when uiLanguage is undefined', () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: undefined,
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("en")
			expect(mockLogger.debug).toHaveBeenCalledWith("🌐 useCurrentLanguage returning fallback: en")
		})

		it('should return "en" when uiLanguage is null', () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: null,
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("en")
			expect(mockLogger.debug).toHaveBeenCalledWith("🌐 useCurrentLanguage returning fallback: en")
		})

		it('should return "en" when uiLanguage is empty string', () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "",
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("en")
			expect(mockLogger.debug).toHaveBeenCalledWith("🌐 useCurrentLanguage returning fallback: en")
		})

		it("should handle useExtensionState throwing error", () => {
			mockUseExtensionState.mockImplementation(() => {
				throw new Error("Context not available")
			})

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("en")
			expect(mockLogger.debug).toHaveBeenCalledWith(
				"🌐 useCurrentLanguage context error, using fallback: Error: Context not available",
			)
		})

		it("should handle useExtensionState returning null", () => {
			mockUseExtensionState.mockReturnValue(null as any)

			const { result } = renderHook(() => useCurrentLanguage())

			expect(result.current).toBe("en")
		})

		it("should handle case sensitivity correctly", () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "KO",
			} as any)

			const { result } = renderHook(() => useCurrentLanguage())

			// Should fall back to 'en' since 'KO' is not in supported languages array
			expect(result.current).toBe("en")
		})
	})

	describe("useCurrentLanguageWithLog", () => {
		const originalEnv = process.env.NODE_ENV

		beforeEach(() => {
			vi.clearAllMocks()
		})

		afterEach(() => {
			process.env.NODE_ENV = originalEnv
		})

		it("should return the same value as useCurrentLanguage", () => {
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "ko",
			} as any)

			const { result } = renderHook(() => useCurrentLanguageWithLog())

			expect(result.current).toBe("ko")
		})

		it("should log in development environment", () => {
			process.env.NODE_ENV = "development"
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "ja",
			} as any)

			renderHook(() => useCurrentLanguageWithLog())

			expect(mockLogger.debug).toHaveBeenCalledWith("[UI Language] Current language: ja")
			expect(mockLogger.debug).toHaveBeenCalledWith("[UI Language] Note: ExtensionState integration pending")
		})

		it("should not log in production environment", () => {
			process.env.NODE_ENV = "production"
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "zh",
			} as any)

			renderHook(() => useCurrentLanguageWithLog())

			// Should only have the log from useCurrentLanguage, not the development logs
			expect(mockLogger.debug).toHaveBeenCalledWith("🌐 useCurrentLanguage returning: zh")
			expect(mockLogger.debug).not.toHaveBeenCalledWith("[UI Language] Current language: zh")
			expect(mockLogger.debug).not.toHaveBeenCalledWith("[UI Language] Note: ExtensionState integration pending")
		})

		it("should not log in test environment", () => {
			process.env.NODE_ENV = "test"
			mockUseExtensionState.mockReturnValue({
				uiLanguage: "en",
			} as any)

			renderHook(() => useCurrentLanguageWithLog())

			// Should only have the log from useCurrentLanguage, not the development logs
			expect(mockLogger.debug).toHaveBeenCalledWith("🌐 useCurrentLanguage returning: en")
			expect(mockLogger.debug).not.toHaveBeenCalledWith("[UI Language] Current language: en")
			expect(mockLogger.debug).not.toHaveBeenCalledWith("[UI Language] Note: ExtensionState integration pending")
		})

		it("should handle fallback language in development", () => {
			process.env.NODE_ENV = "development"
			mockUseExtensionState.mockImplementation(() => {
				throw new Error("Context error")
			})

			renderHook(() => useCurrentLanguageWithLog())

			expect(mockLogger.debug).toHaveBeenCalledWith("[UI Language] Current language: en")
		})
	})

	describe("supported languages validation", () => {
		it("should only accept exact matches from supported languages", () => {
			const testCases = [
				{ input: "ko", expected: "ko" },
				{ input: "en", expected: "en" },
				{ input: "ja", expected: "ja" },
				{ input: "zh", expected: "zh" },
				{ input: "korean", expected: "en" },
				{ input: "english", expected: "en" },
				{ input: "japanese", expected: "en" },
				{ input: "chinese", expected: "en" },
				{ input: "es", expected: "en" },
				{ input: "fr", expected: "en" },
				{ input: "de", expected: "en" },
			]

			testCases.forEach(({ input, expected }) => {
				mockUseExtensionState.mockReturnValue({
					uiLanguage: input,
				} as any)

				const { result } = renderHook(() => useCurrentLanguage())
				expect(result.current).toBe(expected)
			})
		})
	})
})
