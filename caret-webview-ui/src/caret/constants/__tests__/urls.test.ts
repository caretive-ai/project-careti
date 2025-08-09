import { describe, it, expect } from "vitest"
import {
	CARET_URLS,
	CARET_LOCALIZED_URLS,
	getLocalizedUrl,
	getUrl,
	type CaretUrlKey,
	type CaretLocalizedUrlKey,
	type SupportedLanguage,
} from "../urls"

describe("URLs Constants", () => {
	describe("CARET_URLS", () => {
		it("should contain all required service URLs", () => {
			expect(CARET_URLS.CARET_SERVICE).toBe("https://caret.team")
			expect(CARET_URLS.CARET_GITHUB).toBe("https://github.com/aicoding-caret/caret")
		})

		it("should contain all required company URLs", () => {
			expect(CARET_URLS.CARETIVE_COMPANY).toBe("https://caretive.ai")
			expect(CARET_URLS.CARETIVE_ABOUT).toBe("https://caretive.ai/about")
			expect(CARET_URLS.CARETIVE_TERMS).toBe("https://caretive.ai/terms")
			expect(CARET_URLS.CARETIVE_PRIVACY).toBe("https://caretive.ai/privacy")
			expect(CARET_URLS.CARETIVE_YOUTH_PROTECTION).toBe("https://caretive.ai/youth-protection")
			expect(CARET_URLS.CARETIVE_SUPPORT).toBe("https://caretive.ai/support")
		})

		it("should have valid URL format for all entries", () => {
			const expectedUrls = [
				"https://caret.team",
				"https://github.com/aicoding-caret/caret",
				"https://app.caret.team/credits",
				"https://app.caret.team/credits/#buy",
				"https://caretive.ai/terms",
				"https://caretive.ai/privacy",
				"https://caretive.ai",
				"https://caretive.ai/about",
				"https://caretive.ai/terms",
				"https://caretive.ai/privacy",
				"https://caretive.ai/youth-protection",
				"https://caretive.ai/support",
			]

			const actualUrls = Object.values(CARET_URLS)

			actualUrls.forEach((url, index) => {
				expect(url).toBe(expectedUrls[index])
				expect(url).toMatch(/^https:\/\//)
				expect(() => new URL(url)).not.toThrow()
			})
		})
	})

	describe("CARET_LOCALIZED_URLS", () => {
		it("should contain education program URLs for all languages", () => {
			const educationUrls = CARET_LOCALIZED_URLS.EDUCATION_PROGRAM
			const expectedUrl =
				"https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes"

			expect(educationUrls.ko).toBe(expectedUrl)
			expect(educationUrls.en).toBe(expectedUrl)
			expect(educationUrls.ja).toBe(expectedUrl)
			expect(educationUrls.zh).toBe(expectedUrl)
		})

		it("should contain Gemini credit guide URLs for all languages", () => {
			const geminiUrls = CARET_LOCALIZED_URLS.GEMINI_CREDIT_GUIDE
			const expectedUrl = "https://blog.naver.com/fstory97/223887376667"

			expect(geminiUrls.ko).toBe(expectedUrl)
			expect(geminiUrls.en).toBe(expectedUrl)
			expect(geminiUrls.ja).toBe(expectedUrl)
			expect(geminiUrls.zh).toBe(expectedUrl)
		})

		it("should contain Caret GitHub detailed URLs with language-specific README files", () => {
			const githubUrls = CARET_LOCALIZED_URLS.CARET_GITHUB_DETAILED

			expect(githubUrls.ko).toBe("https://github.com/aicoding-caret/caret/blob/main/README.md")
			expect(githubUrls.en).toBe("https://github.com/aicoding-caret/caret/blob/main/README.en.md")
			expect(githubUrls.ja).toBe("https://github.com/aicoding-caret/caret/blob/main/README.en.md")
			expect(githubUrls.zh).toBe("https://github.com/aicoding-caret/caret/blob/main/README.en.md")
		})

		it("should have all supported languages for each localized URL", () => {
			const supportedLanguages: SupportedLanguage[] = ["ko", "en", "ja", "zh"]

			Object.values(CARET_LOCALIZED_URLS).forEach((urlMap) => {
				supportedLanguages.forEach((lang) => {
					expect(urlMap[lang]).toBeDefined()
					expect(typeof urlMap[lang]).toBe("string")
					expect(urlMap[lang].length).toBeGreaterThan(0)
				})
			})
		})

		it("should have valid URL format for all localized entries", () => {
			Object.values(CARET_LOCALIZED_URLS).forEach((urlMap) => {
				Object.values(urlMap).forEach((url) => {
					expect(url).toMatch(/^https:\/\//)
					expect(() => new URL(url)).not.toThrow()
				})
			})
		})
	})

	describe("getUrl function", () => {
		it("should return correct URL for valid keys", () => {
			expect(getUrl("CARET_SERVICE")).toBe("https://caret.team")
			expect(getUrl("CARET_GITHUB")).toBe("https://github.com/aicoding-caret/caret")
			expect(getUrl("CARETIVE_COMPANY")).toBe("https://caretive.ai")
			expect(getUrl("CARETIVE_ABOUT")).toBe("https://caretive.ai/about")
			expect(getUrl("CARETIVE_TERMS")).toBe("https://caretive.ai/terms")
			expect(getUrl("CARETIVE_PRIVACY")).toBe("https://caretive.ai/privacy")
			expect(getUrl("CARETIVE_YOUTH_PROTECTION")).toBe("https://caretive.ai/youth-protection")
			expect(getUrl("CARETIVE_SUPPORT")).toBe("https://caretive.ai/support")
		})

		it("should work with all available URL keys", () => {
			const allKeys: CaretUrlKey[] = [
				"CARET_SERVICE",
				"CARET_GITHUB",
				"CARETIVE_COMPANY",
				"CARETIVE_ABOUT",
				"CARETIVE_TERMS",
				"CARETIVE_PRIVACY",
				"CARETIVE_YOUTH_PROTECTION",
				"CARETIVE_SUPPORT",
			]

			const expectedUrls = [
				"https://caret.team",
				"https://github.com/aicoding-caret/caret",
				"https://caretive.ai",
				"https://caretive.ai/about",
				"https://caretive.ai/terms",
				"https://caretive.ai/privacy",
				"https://caretive.ai/youth-protection",
				"https://caretive.ai/support",
			]

			allKeys.forEach((key, index) => {
				const result = getUrl(key)
				expect(result).toBe(expectedUrls[index])
				expect(typeof result).toBe("string")
				expect(result.length).toBeGreaterThan(0)
				expect(result).toMatch(/^https:\/\//)
			})
		})
	})

	describe("getLocalizedUrl function", () => {
		it("should return correct URL for valid keys and default language (ko)", () => {
			expect(getLocalizedUrl("EDUCATION_PROGRAM")).toBe(
				"https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes",
			)
			expect(getLocalizedUrl("GEMINI_CREDIT_GUIDE")).toBe("https://blog.naver.com/fstory97/223887376667")
			expect(getLocalizedUrl("CARET_GITHUB_DETAILED")).toBe("https://github.com/aicoding-caret/caret/blob/main/README.md")
		})

		it("should return correct URL for valid keys and specific languages", () => {
			// Test Korean
			expect(getLocalizedUrl("CARET_GITHUB_DETAILED", "ko")).toBe(
				"https://github.com/aicoding-caret/caret/blob/main/README.md",
			)

			// Test English
			expect(getLocalizedUrl("CARET_GITHUB_DETAILED", "en")).toBe(
				"https://github.com/aicoding-caret/caret/blob/main/README.en.md",
			)

			// Test Japanese
			expect(getLocalizedUrl("CARET_GITHUB_DETAILED", "ja")).toBe(
				"https://github.com/aicoding-caret/caret/blob/main/README.en.md",
			)

			// Test Chinese
			expect(getLocalizedUrl("CARET_GITHUB_DETAILED", "zh")).toBe(
				"https://github.com/aicoding-caret/caret/blob/main/README.en.md",
			)
		})

		it("should fallback to Korean when language is not found", () => {
			// Test with invalid language - should fallback to Korean
			const result = getLocalizedUrl("CARET_GITHUB_DETAILED", "invalid" as SupportedLanguage)
			expect(result).toBe("https://github.com/aicoding-caret/caret/blob/main/README.md")
		})

		it("should work with all available localized URL keys", () => {
			const allLocalizedKeys: CaretLocalizedUrlKey[] = ["EDUCATION_PROGRAM", "GEMINI_CREDIT_GUIDE", "CARET_GITHUB_DETAILED"]

			const allLanguages: SupportedLanguage[] = ["ko", "en", "ja", "zh"]

			allLocalizedKeys.forEach((key) => {
				allLanguages.forEach((lang) => {
					const result = getLocalizedUrl(key, lang)
					expect(typeof result).toBe("string")
					expect(result.length).toBeGreaterThan(0)
					expect(result).toMatch(/^https:\/\//)
				})
			})
		})

		it("should handle all education program URLs consistently", () => {
			const languages: SupportedLanguage[] = ["ko", "en", "ja", "zh"]
			const expectedUrl =
				"https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes"

			languages.forEach((lang) => {
				expect(getLocalizedUrl("EDUCATION_PROGRAM", lang)).toBe(expectedUrl)
			})
		})

		it("should handle all Gemini credit guide URLs consistently", () => {
			const languages: SupportedLanguage[] = ["ko", "en", "ja", "zh"]
			const expectedUrl = "https://blog.naver.com/fstory97/223887376667"

			languages.forEach((lang) => {
				expect(getLocalizedUrl("GEMINI_CREDIT_GUIDE", lang)).toBe(expectedUrl)
			})
		})
	})

	describe("Type definitions", () => {
		it("should have correct CaretUrlKey type", () => {
			// This test ensures type safety at compile time
			const validKeys: CaretUrlKey[] = [
				"CARET_SERVICE",
				"CARET_GITHUB",
				"CARETIVE_COMPANY",
				"CARETIVE_ABOUT",
				"CARETIVE_TERMS",
				"CARETIVE_PRIVACY",
				"CARETIVE_YOUTH_PROTECTION",
				"CARETIVE_SUPPORT",
			]

			validKeys.forEach((key) => {
				expect(CARET_URLS[key]).toBeDefined()
			})
		})

		it("should have correct CaretLocalizedUrlKey type", () => {
			// This test ensures type safety at compile time
			const validKeys: CaretLocalizedUrlKey[] = ["EDUCATION_PROGRAM", "GEMINI_CREDIT_GUIDE", "CARET_GITHUB_DETAILED"]

			validKeys.forEach((key) => {
				expect(CARET_LOCALIZED_URLS[key]).toBeDefined()
			})
		})

		it("should have correct SupportedLanguage type", () => {
			// This test ensures type safety at compile time
			const validLanguages: SupportedLanguage[] = ["ko", "en", "ja", "zh"]

			validLanguages.forEach((lang) => {
				// Test that language is accepted by getLocalizedUrl
				expect(() => getLocalizedUrl("EDUCATION_PROGRAM", lang)).not.toThrow()
			})
		})
	})
})
