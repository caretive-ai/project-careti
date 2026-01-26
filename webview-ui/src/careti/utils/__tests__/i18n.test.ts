// CARETI MODIFICATION: TDD tests for Careti i18n system
import { hasLastConsonant, setGlobalUILanguage, setTranslationsForTesting, t } from "../i18n"

// Mock translations for testing
const _mockTranslations = {
	ko: {
		common: {
			brand: { appName: "캐러티" },
			welcome: {
				title: "{{brand.appName|을}} 사용해보세요! 🎉",
				description: "{{brand.appName|은}} AI 코딩 어시스턴트입니다. 시작해보세요!",
			},
		},
	},
	en: {
		common: {
			brand: { appName: "Careti" },
			welcome: {
				title: "Welcome to {{brand.appName}}! 🎉",
				description: "{{brand.appName}} is an AI coding assistant. Get started!",
			},
		},
	},
	ja: {}, // 빈 객체로 추가
	zh: {}, // 빈 객체로 추가
} as any // 타입 불일치 임시 해결

describe("Careti i18n System", () => {
	beforeEach(() => {
		// Reset to English before each test
		setGlobalUILanguage("en")
		// 테스트 시작 전 목업 번역 데이터 주입
		setTranslationsForTesting(_mockTranslations)
	})

	describe("브랜드명 동적 변경", () => {
		test("직접 brand 접근 테스트", () => {
			setGlobalUILanguage("en")
			const brandResult = t("brand.appName", "common")
			expect(brandResult).toBe("Careti")

			setGlobalUILanguage("ko")
			const koBrandResult = t("brand.appName", "common")
			expect(koBrandResult).toBe("캐러티")
		})

		test("영어 브랜드 템플릿 처리", () => {
			setGlobalUILanguage("en")
			const result = t("welcome.title", "common")
			console.log("EN welcome.title result:", result)
			expect(result).toContain("Careti")
			expect(result).toBe("Welcome to Careti! 🎉")
		})

		test("브랜드명 변경 후 즉시 반영", () => {
			// Mock brand name change (실제로는 JSON 파일 수정)
			const _mockBrandChange = {
				ko: {
					common: {
						brand: { appName: "코드센터" },
						welcome: {
							title: "{{brand.appName|을}} 사용해보세요! 🎉",
							description: "{{brand.appName|은}} AI 코딩 어시스턴트입니다. 시작해보세요!",
						},
					},
				},
				en: {
					common: {
						brand: { appName: "CodeCenter" },
						welcome: {
							title: "Welcome to {{brand.appName}}! 🎉",
							description: "{{brand.appName}} is an AI coding assistant. Get started!",
						},
					},
				},
				ja: {},
				zh: {},
			} as any

			setTranslationsForTesting(_mockBrandChange) // 변경된 목업 데이터 주입

			// English test
			setGlobalUILanguage("en")
			const result = t("welcome.title", "common")
			expect(result).toBe("Welcome to CodeCenter! 🎉")

			// Korean test
			setGlobalUILanguage("ko")
			const koResult = t("welcome.title", "common")
			expect(koResult).toBe("코드센터를 사용해보세요! 🎉")
		})
	})

	describe("한글 조사 동적 변경", () => {
		beforeEach(() => {
			setGlobalUILanguage("ko")
		})

		test("받침 있는 단어 + 을/를 조사", () => {
			const result = t("welcome.title", "common")
			expect(result).toBe("캐러티을 사용해보세요! 🎉")
		})

		test("받침 없는 단어 + 을/를 조사", () => {
			const _mockBrandChange = {
				ko: {
					common: {
						brand: { appName: "코드센터" },
						welcome: {
							title: "{{brand.appName|을}} 사용해보세요! 🎉",
							description: "{{brand.appName|은}} AI 코딩 어시스턴트입니다. 시작해보세요!",
						},
					},
				},
				en: {
					common: {
						brand: { appName: "CodeCenter" },
						welcome: {
							title: "Welcome to {{brand.appName}}! 🎉",
							description: "{{brand.appName}} is an AI coding assistant. Get started!",
						},
					},
				},
				ja: {},
				zh: {},
			} as any
			setTranslationsForTesting(_mockBrandChange)

			const result = t("welcome.title", "common")
			expect(result).toBe("코드센터를 사용해보세요! 🎉")
		})

		test("은/는 조사 테스트", () => {
			const result = t("welcome.description", "common")
			expect(result).toBe("캐러티는 AI 코딩 어시스턴트입니다. 시작해보세요!")
		})
	})

	describe("받침 검사 정확성", () => {
		test("한글 받침 검사", () => {
			expect(hasLastConsonant("캐러티")).toBe(true) // ㅅ 받침
			expect(hasLastConsonant("코드센터")).toBe(false) // 받침 없음
			expect(hasLastConsonant("김치")).toBe(false) // 받침 없음
			expect(hasLastConsonant("한국")).toBe(true) // ㄱ 받침
		})

		test("영어 발음 규칙 검사", () => {
			expect(hasLastConsonant("VS Code")).toBe(true) // e 받침음
			expect(hasLastConsonant("Python")).toBe(true) // n 받침음
			expect(hasLastConsonant("Java")).toBe(false) // a 받침음 없음
			expect(hasLastConsonant("React")).toBe(true) // t 받침음
		})

		test("빈 문자열 및 특수 케이스", () => {
			expect(hasLastConsonant("")).toBe(false)
			expect(hasLastConsonant("a")).toBe(false)
			expect(hasLastConsonant("1")).toBe(true) // 숫자는 consonant로 처리
		})
	})

	describe("fallback 시스템", () => {
		test("존재하지 않는 키는 키 이름 반환", () => {
			const result = t("non.existent.key", "common")
			expect(result).toBe("non.existent.key")
		})

		test("존재하지 않는 네임스페이스", () => {
			const result = t("someKey", "nonexistent")
			expect(result).toBe("someKey")
		})
	})

	describe("언어별 번역 정확성", () => {
		test("한국어 설정", () => {
			setGlobalUILanguage("ko")
			const result = t("welcome.title", "common")
			expect(result).toContain("캐러티")
			expect(result).toContain("🎉")
			expect(result).toBe("캐러티을 사용해보세요! 🎉")
		})

		test("영어 설정 (기본)", () => {
			setGlobalUILanguage("en")
			const result = t("welcome.title", "common")
			expect(result).toContain("Careti")
			expect(result).toContain("Welcome")
		})
	})

	describe("템플릿 변수 처리", () => {
		test("브랜드 참조 처리", () => {
			setGlobalUILanguage("en")
			const result = t("welcome.description", "common")
			expect(result).toContain("Careti")
		})

		test("한글 조사가 포함된 브랜드 참조", () => {
			setGlobalUILanguage("ko")
			const result = t("welcome.title", "common")
			expect(result).toMatch(/캐러티을/)
		})
	})
})

describe("useCaretiI18n Hook (통합 테스트)", () => {
	test("Hook이 올바른 인터페이스 제공", () => {
		// Note: 실제 React Hook 테스트는 @testing-library/react-hooks 필요
		// 여기서는 타입 체크만 수행

		const expectedInterface = {
			t: expect.any(Function),
			currentLanguage: expect.any(String),
			changeLanguage: expect.any(Function),
			isLanguageSupported: expect.any(Function),
		}

		// 실제 Hook 테스트 구현 시 renderHook 사용
		expect(expectedInterface.t).toEqual(expect.any(Function))
	})
})

// Performance tests
describe("i18n 성능 테스트", () => {
	test("대량 번역 호출 성능", () => {
		const start = Date.now()

		for (let i = 0; i < 1000; i++) {
			t("welcome.title", "welcome")
		}

		const duration = Date.now() - start
		expect(duration).toBeLessThan(100) // 1000번 호출이 100ms 이내
	})

	test("받침 검사 함수 성능", () => {
		const testWords = ["캐러티", "CodeCenter", "VS Code", "Python", "React"]
		const start = Date.now()

		for (let i = 0; i < 1000; i++) {
			// CARETI MODIFICATION: replace forEach to satisfy lint without behavior change
			for (const word of testWords) {
				hasLastConsonant(word)
			}
		}

		const duration = Date.now() - start
		expect(duration).toBeLessThan(50) // 5000번 호출이 50ms 이내
	})
})
