/**
 * 🎯 브랜드별 i18n 백엔드 메시지 토글 시스템
 * Luke 피드백 1차: "프론트는 i18n 넣고 가자.. 주석으로 잘 분리해서"
 *
 * 🔄 핵심 개념:
 * - 브랜드 인식: 브랜드에 따라 동적으로 변경되는 텍스트 시스템
 * - i18n 토글: Cline 모드에서는 비활성화, Caret 모드에서는 활성화
 * - 백엔드 매핑: 하드코딩된 백엔드 메시지를 i18n 키로 변환
 *
 * 🎯 목표:
 * - Cline 모드: i18n 기능을 비활성화하여 최대한 Cline처럼 보이게 함
 * - Caret 모드: 전체 i18n 기능 활성화하여 다국어 지원
 * - B2B 모드: 브랜드별 커스텀 템플릿 지원 (codecenter 등)
 */

export interface BrandConfig {
	appName: string
	appNameUpper: string
	appNameLower: string
	appNameKorean: string
	enableI18n: boolean // i18n 시스템 활성화 여부
	enableBackendMessages: boolean // 백엔드 메시지 i18n 활성화 여부
}

// 브랜드별 설정 (Luke 요청: 한글 주석으로 코드 이해 돕기)
// brand-i18n.json의 BRAND_CONFIGS와 동기화된 설정
const BRAND_CONFIGS: Record<string, BrandConfig> = {
	// Cline 모드: 원본 호환성을 위해 i18n 비활성화
	cline: {
		appName: "Cline",
		appNameUpper: "CLINE",
		appNameLower: "cline",
		appNameKorean: "클라인",
		enableI18n: false, // 업스트림 머징 호환을 위해 i18n 꺼둠
		enableBackendMessages: false, // 백엔드 메시지도 원본 영어 유지
	},
	// Caret 모드: 완전한 다국어 지원 활성화
	caret: {
		appName: "Caret",
		appNameUpper: "CARET",
		appNameLower: "caret",
		appNameKorean: "캐럿",
		enableI18n: true, // 다국어 지원 완전 활성화
		enableBackendMessages: true, // 백엔드 메시지도 브랜드별 번역
	},
}

/**
 * 현재 브랜드 모드 감지
 */
export function getCurrentBrandMode(): string {
	// VS Code 설정에서 modeSystem 값 확인
	try {
		const vscode = (window as any).acquireVsCodeApi?.()
		if (vscode) {
			// 설정에서 모드 시스템 값 가져오기
			const savedState = vscode.getState()
			const modeSystem = savedState?.settings?.modeSystem || "caret"
			return modeSystem.toLowerCase()
		}
	} catch (error) {
		console.warn("브랜드 모드 감지 실패, 기본값 사용:", error)
	}

	// package.json displayName 기반 폴백
	return "caret" // 기본값
}

/**
 * 현재 브랜드 설정 가져오기
 */
export function getCurrentBrandConfig(): BrandConfig {
	const currentMode = getCurrentBrandMode()
	return BRAND_CONFIGS[currentMode] || BRAND_CONFIGS["caret"]
}

/**
 * i18n이 활성화되었는지 확인
 */
export function isI18nEnabled(): boolean {
	return getCurrentBrandConfig().enableI18n
}

/**
 * 백엔드 메시지 i18n이 활성화되었는지 확인
 */
export function isBackendI18nEnabled(): boolean {
	return getCurrentBrandConfig().enableBackendMessages
}

/**
 * 브랜드별 메시지 처리
 * Cline 모드: 원본 영어 메시지 반환
 * Caret 모드: i18n 번역 메시지 반환
 */
export function processBackendMessage(
	originalMessage: string,
	translatedMessage?: string,
	context?: Record<string, any>,
): string {
	const config = getCurrentBrandConfig()

	// Cline 모드에서는 항상 원본 영어 메시지
	if (!config.enableBackendMessages) {
		return originalMessage
	}

	// Caret 모드에서는 번역된 메시지 (있는 경우)
	if (translatedMessage) {
		// 브랜드 변수 치환
		let processedMessage = translatedMessage
		if (context) {
			Object.entries(context).forEach(([key, value]) => {
				const placeholder = `{{${key}}}`
				processedMessage = processedMessage.replace(new RegExp(placeholder, "g"), String(value))
			})
		}

		// 브랜드명 치환
		processedMessage = processedMessage
			.replace(/\{\{brand\.appName\}\}/g, config.appName)
			.replace(/\{\{brand\.appNameUpper\}\}/g, config.appNameUpper)
			.replace(/\{\{brand\.appNameLower\}\}/g, config.appNameLower)
			.replace(/\{\{brand\.appNameKorean\}\}/g, config.appNameKorean)

		return processedMessage
	}

	// 번역이 없으면 원본 반환
	return originalMessage
}

/**
 * 시스템 메시지용 특별 처리
 * 백엔드에서 오는 시스템 메시지들을 브랜드에 따라 처리
 */
export function processSystemMessage(messageKey: string, defaultMessage: string, variables?: Record<string, any>): string {
	const config = getCurrentBrandConfig()

	// Cline 모드에서는 브랜드명만 교체하고 영어 유지
	if (!config.enableBackendMessages) {
		let processedMessage = defaultMessage
			.replace(/Caret/g, config.appName)
			.replace(/CARET/g, config.appNameUpper)
			.replace(/caret/g, config.appNameLower)

		if (variables) {
			Object.entries(variables).forEach(([key, value]) => {
				const placeholder = `{{${key}}}`
				processedMessage = processedMessage.replace(new RegExp(placeholder, "g"), String(value))
			})
		}

		return processedMessage
	}

	// Caret 모드에서는 전체 i18n 처리
	// TODO: 실제 i18n 시스템과 연동
	try {
		// i18n 시스템에서 번역 가져오기
		const translatedMessage = getTranslation(messageKey)
		return processBackendMessage(defaultMessage, translatedMessage, variables)
	} catch (error) {
		console.warn(`i18n 번역 실패: ${messageKey}`, error)
		return processBackendMessage(defaultMessage, undefined, variables)
	}
}

/**
 * 번역 가져오기 (실제 i18n 시스템과 연동)
 * TODO: 실제 i18n 라이브러리와 연동 필요
 */
function getTranslation(key: string): string | undefined {
	// 실제 구현에서는 react-i18next 또는 다른 i18n 라이브러리 사용
	// 현재는 플레이스홀더
	return undefined
}

/**
 * 브랜드 설정 변경 감지 및 업데이트
 */
export function initBrandToggleSystem() {
	const config = getCurrentBrandConfig()

	console.log(`🎯 브랜드 토글 시스템 초기화: ${config.appName} 모드`)
	console.log(`   - i18n 활성화: ${config.enableI18n}`)
	console.log(`   - 백엔드 메시지 i18n: ${config.enableBackendMessages}`)

	// 설정 변경 감지 리스너 등록
	// TODO: VS Code 설정 변경 이벤트 리스너 추가

	return config
}
