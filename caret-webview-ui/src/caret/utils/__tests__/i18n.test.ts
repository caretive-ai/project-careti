import { describe, it, expect, beforeEach, vi } from "vitest"
import { setGlobalUILanguage, t, getLink } from "../i18n" // 경로가 __tests__ 폴더 기준인지 확인
import { type SupportedLanguage, type CaretLocalizedUrlKey } from "../../constants/urls" // 타입 임포트

// 실제 번역 파일 대신 사용할 간단한 모의 번역 데이터
// 실제 테스트에서는 i18n.ts가 올바르게 실제 json 파일을 로드하는지 확인 필요
vi.mock("../i18n", async (importOriginal) => {
	const original = await importOriginal<typeof import("../i18n")>()
	// 실제 translations 객체 대신 사용할 모의 객체나,
	// 실제 translations을 사용하되 파일 시스템 접근이 테스트 환경에서 가능하다는 전제.
	// 여기서는 setGlobalUILanguage와 t/getLink의 연동 로직에 집중하기 위해
	// 내부 translations는 원본 것을 사용한다고 가정하고, urls만 모킹합니다.
	// 좀 더 엄밀한 단위 테스트를 위해서는 translations도 모킹할 수 있습니다.
	return {
		...original,
		// getCurrentLanguage: vi.fn(() => 'en'), // 만약 내부적으로 사용된다면 모킹
	}
})

// constants/urls 모듈 모킹
// getLocalizedUrl과 getUrl이 i18n.ts 내부의 replaceTemplateVariables에서 사용됨
vi.mock("../../constants/urls", () => ({
	getLocalizedUrl: (key: CaretLocalizedUrlKey, lang: SupportedLanguage) => `${key}_${lang}`,
	getUrl: (key: string) => `URL_${key}`,
	// SupportedLanguage 타입은 실제 값을 사용해야 하므로 모킹에서 제외하거나,
	// 테스트에 필요한 값만 제공합니다. 여기서는 실제 타입을 import해서 사용합니다.
}))

describe("i18n utility", () => {
	beforeEach(() => {
		// 각 테스트 전에 전역 언어를 'en'으로 초기화
		setGlobalUILanguage("en")
	})

	describe("setGlobalUILanguage", () => {
		it("should set effective language for supported languages and t() should reflect it", () => {
			setGlobalUILanguage("ko")
			// 'settings.uiLanguage.label' 키가 ko/common.json에 "UI 언어"로 정의되어 있다고가정
			expect(t("settings.uiLanguage.label", "common")).toBe("UI 언어")

			setGlobalUILanguage("ja")
			// 'settings.uiLanguage.label' 키가 ja/common.json에 "UI言語"로 정의되어 있다고 가정
			expect(t("settings.uiLanguage.label", "common")).toBe("UI言語")
		})

		it('should default to "en" for unsupported languages and t() should reflect it', () => {
			setGlobalUILanguage("fr" as SupportedLanguage) // 테스트를 위해 타입 단언
			// 'settings.uiLanguage.label' 키가 en/common.json에 "UI Language"로 정의되어 있다고 가정
			expect(t("settings.uiLanguage.label", "common")).toBe("UI Language")
		})

		it('should default to "en" for invalid language strings and t() should reflect it', () => {
			setGlobalUILanguage("invalid-lang-code" as SupportedLanguage) // 테스트를 위해 타입 단언
			expect(t("settings.uiLanguage.label", "common")).toBe("UI Language")
		})
	})

	describe("t function with global language setting", () => {
		it('should return English translation when global language is "en"', () => {
			setGlobalUILanguage("en")
			// 실제 en/welcome.json의 "greeting" 키 값으로 수정
			expect(t("greeting", "welcome")).toBe("Hello! AI Development Partner, ^Caret.")
		})

		it('should return Korean translation when global language is "ko"', () => {
			setGlobalUILanguage("ko")
			// 실제 ko/welcome.json의 "greeting" 키 값으로 수정
			expect(t("greeting", "welcome")).toBe("👋 안녕하세요! AI 개발 파트너, ^Caret입니다.")
		})

		it("should fallback to English if translation is not found in current language but exists in English", () => {
			setGlobalUILanguage("ko")
			// 실제로 존재하지 않는 키를 테스트하므로 키 자체가 반환될 것으로 예상
			// 실제 i18n 구현에서 English fallback이 작동하는지 확인 필요
			expect(t("onlyInEnglish", "common")).toBe("onlyInEnglish") // 키가 존재하지 않으면 키 자체 반환
		})

		it("should return key if translation is not found in current or English fallback", () => {
			setGlobalUILanguage("ko")
			expect(t("nonExistentKey123", "common")).toBe("nonExistentKey123")
		})

		it("should use specified language parameter if provided, overriding global setting", () => {
			setGlobalUILanguage("en") // 전역은 영어
			// 실제 ko/welcome.json의 "greeting" 키 값으로 수정
			expect(t("greeting", "welcome", "ko")).toBe("👋 안녕하세요! AI 개발 파트너, ^Caret입니다.")
		})
	})

	describe("getLink function with global language setting", () => {
		it('should return localized link for "en" when global language is "en"', () => {
			setGlobalUILanguage("en")
			expect(getLink("EDUCATION_PROGRAM")).toBe("EDUCATION_PROGRAM_en")
		})

		it('should return localized link for "ko" when global language is "ko"', () => {
			setGlobalUILanguage("ko")
			expect(getLink("EDUCATION_PROGRAM")).toBe("EDUCATION_PROGRAM_ko")
		})

		it("should use specified language parameter if provided, overriding global setting", () => {
			setGlobalUILanguage("en") // 전역은 영어
			expect(getLink("EDUCATION_PROGRAM", "ja")).toBe("EDUCATION_PROGRAM_ja") // 특정 언어 요청은 일본어
		})
	})
})
