// CARET MODIFICATION: Context-aware 언어 Hook
import { useExtensionState } from "@/context/ExtensionStateContext"
import { SupportedLanguage } from "../constants/urls"
import { caretWebviewLogger } from "@/caret/utils/webview-logger"

/**
 * 현재 사용자가 설정한 UI 언어를 가져오는 Hook
 * ExtensionStateContext에서 실제 uiLanguage 값을 읽어옵니다.
 * 테스트 환경에서는 기본값을 반환합니다.
 */
export const useCurrentLanguage = (): SupportedLanguage => {
	// CARET MODIFICATION: 실제 ExtensionState에서 언어 가져오기
	let uiLanguage: string | undefined

	try {
		// useExtensionState Hook 사용 (에러 처리로 테스트 환경 대응)
		const state = useExtensionState()
		uiLanguage = state.uiLanguage
	} catch (error) {
		caretWebviewLogger.debug(`🌐 useCurrentLanguage context error, using fallback: ${error}`)
		return "en"
	}

	if (uiLanguage) {
		// 지원하는 언어인지 확인
		const supportedLanguages: SupportedLanguage[] = ["ko", "en", "ja", "zh"]
		if (supportedLanguages.includes(uiLanguage as SupportedLanguage)) {
			caretWebviewLogger.debug(`🌐 useCurrentLanguage returning: ${uiLanguage}`)
			return uiLanguage as SupportedLanguage
		}
	}

	// 기본값은 영어 (Context 없을 때)
	caretWebviewLogger.debug(`🌐 useCurrentLanguage returning fallback: en`)
	return "en"
}

/**
 * 디버깅용 로그와 함께 현재 언어를 가져오는 Hook
 */
export const useCurrentLanguageWithLog = (): SupportedLanguage => {
	const language = useCurrentLanguage()

	// 개발 환경에서만 로그 출력
	if (process.env.NODE_ENV === "development") {
		caretWebviewLogger.debug(`[UI Language] Current language: ${language}`)
		caretWebviewLogger.debug("[UI Language] Note: ExtensionState integration pending")
	}

	return language
}
