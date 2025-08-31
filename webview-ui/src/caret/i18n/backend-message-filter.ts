/**
 * TDD Phase 3 (REFACTOR): 백엔드 메시지 i18n 필터링 시스템
 *
 * 목적: 웹뷰에서 받은 ClineMessage.text 중 하드코딩된 백엔드 메시지를
 *       브랜드 모드에 따라 i18n 필터링
 *
 * 아키텍처 원칙:
 * - 백엔드 수정 없음: 웹뷰에서만 필터링 처리
 * - Level 1 독립 모듈: /webview-ui/src/caret/ 하위에 구현
 * - 옵션 기능: Cline 모드에서는 비활성화
 *
 * 사용법:
 * ```typescript
 * import { processBackendMessage } from '@/caret/i18n/backend-message-filter'
 *
 * const translatedMessage = processBackendMessage(clineMessage.text, {
 *   mode: 'caret',
 *   enableBackendI18n: true,
 *   language: 'ko'
 * })
 * ```
 */

import messageMappings from "./backend-message-mappings.json"

// 지원되는 언어 타입
export type SupportedLanguage = "ko" | "en"

// 브랜드 모드 타입
export type BrandMode = "cline" | "caret"

// 메시지 처리 옵션
export interface ProcessBackendMessageOptions {
	mode: BrandMode
	enableBackendI18n?: boolean
	language?: SupportedLanguage
	brandName?: string
}

// 번역 옵션
export interface TranslateMessageOptions {
	brandName?: string
}

// 메시지 타입 정의
export type MessageType =
	| "wants_to_edit"
	| "wants_to_create"
	| "wants_to_read"
	| "wants_to_execute_command"
	| "wants_to_use_browser"
	| "task_completed"
	| "api_request_pending"

/**
 * 백엔드 메시지인지 패턴 매칭으로 확인
 *
 * @param message - 검사할 메시지
 * @returns 백엔드 메시지 여부
 */
export function isBackendMessage(message: string): boolean {
	if (!message || typeof message !== "string") {
		return false
	}

	return getMessageType(message) !== null
}

/**
 * 메시지 타입 식별
 *
 * @param message - 분석할 메시지
 * @returns 메시지 타입 또는 null (매칭되지 않는 경우)
 */
export function getMessageType(message: string): MessageType | null {
	if (!message || typeof message !== "string") {
		return null
	}

	const patterns = messageMappings.messagePatterns

	for (const [type, patternConfig] of Object.entries(patterns)) {
		const regex = new RegExp(patternConfig.pattern, "i")
		if (regex.test(message)) {
			return type as MessageType
		}
	}

	return null
}

/**
 * 메시지 타입을 i18n 키로 번역
 *
 * @param messageType - 번역할 메시지 타입
 * @param language - 대상 언어 (기본값: 'ko')
 * @param options - 번역 옵션 (브랜드명 등)
 * @returns 번역된 메시지
 */
export function translateBackendMessage(
	messageType: MessageType,
	language: SupportedLanguage = "ko",
	options: TranslateMessageOptions = {},
): string {
	const { brandName = "Caret" } = options

	// fallbacks에서 번역 찾기
	const fallbacks = messageMappings.fallbacks as Record<SupportedLanguage, Record<string, string>>

	const languageMap = fallbacks[language]
	if (languageMap?.[messageType]) {
		let translation = languageMap[messageType]

		// 브랜드명 처리
		if (translation.includes("{brandName}")) {
			translation = translation.replace("{brandName}", brandName)
		} else if (shouldAddBrandName(messageType, language)) {
			translation = `${brandName}이 ${translation}`
		}

		return translation
	}

	// 영어로 폴백
	if (language !== "en") {
		const englishTranslation = fallbacks.en?.[messageType]
		if (englishTranslation) {
			return englishTranslation
		}
	}

	// 마지막 폴백: 원본 키 반환
	return messageType
}

/**
 * 브랜드명 추가 여부 결정
 */
function shouldAddBrandName(messageType: MessageType, language: SupportedLanguage): boolean {
	return language === "ko" && messageType.startsWith("wants_to")
}

/**
 * 백엔드 메시지 처리 메인 함수
 *
 * 이 함수는 웹뷰에서 ClineMessage.text를 처리할 때 사용됩니다.
 * 브랜드 모드와 옵션 설정에 따라 백엔드 메시지를 i18n으로 필터링합니다.
 *
 * @param message - 처리할 원본 메시지
 * @param options - 처리 옵션 (모드, i18n 활성화, 언어, 브랜드명)
 * @returns 처리된 메시지 (번역되거나 원본)
 */
export function processBackendMessage(message: string, options: ProcessBackendMessageOptions | null = null): string {
	// 옵션 기본값 설정
	const config: ProcessBackendMessageOptions = {
		mode: "caret",
		enableBackendI18n: true,
		language: "ko",
		brandName: "Caret",
		...options,
	}

	// 입력 검증
	if (!isValidMessage(message)) {
		return message
	}

	// Cline 모드에서는 항상 원본 반환
	if (config.mode === "cline") {
		return message
	}

	// i18n이 비활성화된 경우 원본 반환
	if (!config.enableBackendI18n) {
		return message
	}

	// 백엔드 메시지가 아니면 원본 반환
	const messageType = getMessageType(message)
	if (!messageType) {
		return message
	}

	// i18n 번역 수행
	return translateBackendMessage(messageType, config.language, {
		brandName: config.brandName,
	})
}

/**
 * 유효한 메시지인지 검증
 */
function isValidMessage(message: string): boolean {
	return Boolean(message && typeof message === "string")
}
