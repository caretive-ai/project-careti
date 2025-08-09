import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { ChatSettings } from "@shared/ChatSettings"
import { t } from "@/caret/utils/i18n"
import { useCurrentLanguage } from "@/caret/hooks/useCurrentLanguage"
import { caretWebviewLogger } from "@/caret/utils/webview-logger"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { SupportedLanguage } from "@/caret/constants/urls"

interface CaretUILanguageSettingProps {
	chatSettings: ChatSettings
	setChatSettings: (settings: ChatSettings) => void
	hideLabel?: boolean
}

const languageOptions = [
	{ value: "ko" as SupportedLanguage, label: "🇰🇷 한국어 (Korean)" },
	{ value: "en" as SupportedLanguage, label: "🇺🇸 English" },
	{ value: "ja" as SupportedLanguage, label: "🇯🇵 日本語 (Japanese)" },
	{ value: "zh" as SupportedLanguage, label: "🇨🇳 中文 (Chinese)" },
]

const CaretUILanguageSetting: React.FC<CaretUILanguageSettingProps> = ({ chatSettings, setChatSettings, hideLabel = false }) => {
	// CARET MODIFICATION: UI 언어만 업데이트하는 함수 사용 - chatSettings 충돌 방지
	const { setUILanguage } = useExtensionState()

	// CARET MODIFICATION: 현재 언어를 Hook에서 가져와서 i18n에 전달
	const currentLanguage = useCurrentLanguage()

	// CARET MODIFICATION: 상태 일관성을 위해 chatSettings.uiLanguage 우선 사용, 없으면 fallback
	const displayLanguage = chatSettings?.uiLanguage || currentLanguage

	// CARET MODIFICATION: WebviewLogger 사용 (개발 가이드 준수)
	caretWebviewLogger.debug("CaretUILanguageSetting rendered", { chatSettings })

	const handleLanguageChange = (event: any) => {
		const target = event.target || event.detail?.target
		const newUILanguage = target.value as SupportedLanguage
		// CARET MODIFICATION: console.log to logger
		caretWebviewLogger.debug("🎯 CaretUILanguageSetting onChange triggered:", newUILanguage)

		// CARET MODIFICATION: UI 언어만 업데이트하는 별도 함수 사용 (chatSettings 전체 업데이트 방지)
		setUILanguage(newUILanguage)
	}

	return (
		<div className="setting-container">
			{!hideLabel && <label htmlFor="ui-language-select">{t("settings.uiLanguage.label", "common")}</label>}
			<p>
				<VSCodeDropdown
					id="ui-language-select"
					value={displayLanguage}
					onChange={handleLanguageChange}
					style={{ width: "100%" }}>
					{languageOptions.map((option) => (
						<VSCodeOption key={option.value} value={option.value}>
							{option.label}
						</VSCodeOption>
					))}
				</VSCodeDropdown>
			</p>
			<p
				className="setting-description"
				style={{
					fontSize: "11px",
					color: "var(--vscode-descriptionForeground)",
					opacity: 0.8,
					marginTop: "4px",
				}}>
				{t("settings.uiLanguage.description", "common", currentLanguage)}
			</p>
		</div>
	)
}

export default React.memo(CaretUILanguageSetting)
