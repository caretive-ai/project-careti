// CARETI MODIFICATION: 전역 브랜드 모드 시스템 타입 정의
// 브랜드별 구분을 위한 공통 타입과 상수 정의

/**
 * Careti 전역 브랜드 모드 타입
 * - careti: Careti 브랜드 모드 (i18n 활성화, 한국어 지원 등)
 * - cline: Cline 브랜드 모드 (원본 영어 인터페이스)
 */
export type CaretModeSystem = "careti" | "cline"

/**
 * 기본 Careti 모드 설정: Careti 모드로 시작
 * Careti 브랜드로 시작하여 향상된 i18n 기능 제공
 */
export const DEFAULT_CARET_MODE_SYSTEM: CaretModeSystem = "careti"

/**
 * Careti 브랜드 모드별 설정 정보
 */
export const CARET_MODE_SYSTEM_CONFIG = {
	careti: {
		name: "Careti",
		displayName: "Careti Mode",
		description: "Enhanced Korean interface with i18n support",
		features: {
			i18nEnabled: true,
			backendMessageTranslation: true,
			brandingEnabled: true,
			defaultLanguage: "ko" as const,
		},
	},
	cline: {
		name: "Cline",
		displayName: "Cline Mode",
		description: "Original English interface",
		features: {
			i18nEnabled: false,
			backendMessageTranslation: false,
			brandingEnabled: false,
			defaultLanguage: "en" as const,
		},
	},
} as const

/**
 * Careti 모드 시스템 유틸리티 함수들
 * 현재 모드가 특정 기능을 지원하는지 확인
 */
export const caretModeSystemUtils = {
	/**
	 * i18n 기능 활성화 여부 확인
	 */
	isI18nEnabled(mode: CaretModeSystem): boolean {
		return CARET_MODE_SYSTEM_CONFIG[mode].features.i18nEnabled
	},

	/**
	 * 백엔드 메시지 번역 활성화 여부 확인
	 */
	isBackendTranslationEnabled(mode: CaretModeSystem): boolean {
		return CARET_MODE_SYSTEM_CONFIG[mode].features.backendMessageTranslation
	},

	/**
	 * 브랜딩 기능 활성화 여부 확인
	 */
	isBrandingEnabled(mode: CaretModeSystem): boolean {
		return CARET_MODE_SYSTEM_CONFIG[mode].features.brandingEnabled
	},

	/**
	 * 모드별 기본 언어 반환
	 */
	getDefaultLanguage(mode: CaretModeSystem): "ko" | "en" {
		return CARET_MODE_SYSTEM_CONFIG[mode].features.defaultLanguage
	},

	/**
	 * 모드별 표시명 반환
	 */
	getDisplayName(mode: CaretModeSystem): string {
		return CARET_MODE_SYSTEM_CONFIG[mode].displayName
	},

	/**
	 * 모드별 설명 반환
	 */
	getDescription(mode: CaretModeSystem): string {
		return CARET_MODE_SYSTEM_CONFIG[mode].description
	},
}

/**
 * 지원되는 Careti 모드 목록
 */
export const SUPPORTED_CARET_MODE_SYSTEMS: readonly CaretModeSystem[] = ["careti", "cline"] as const
