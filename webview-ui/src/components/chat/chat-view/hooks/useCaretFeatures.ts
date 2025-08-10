// CARET MODIFICATION: Caret 고유 기능들을 통합한 전용 Hook
import { useMemo } from "react"
import { t } from "@/caret/utils/i18n"
import WebviewLogger from "@/caret/utils/webview-logger"

/**
 * Caret 고유 기능들을 제공하는 Hook
 * - WebviewLogger: 체계적인 로깅 시스템
 * - i18n: 다국어 지원 함수
 */
export const useCaretFeatures = (componentName: string = "ChatView") => {
	// WebviewLogger 인스턴스 (컴포넌트별 고유)
	const logger = useMemo(() => new WebviewLogger(componentName), [componentName])

	return {
		// 로깅 시스템
		logger,
		
		// 다국어 지원 함수
		t,
	}
}

export default useCaretFeatures
