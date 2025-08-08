import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { ChatSettings } from "@shared/ChatSettings"
import { t } from "@/caret/utils/i18n"
import { useCurrentLanguage } from "@/caret/hooks/useCurrentLanguage"

interface PreferredLanguageSettingProps {
	chatSettings: ChatSettings
	setChatSettings: (settings: ChatSettings) => void
	hideLabel?: boolean
}

const PreferredLanguageSetting: React.FC<PreferredLanguageSettingProps> = ({
	chatSettings,
	setChatSettings,
	hideLabel = false,
}) => {
	const currentLanguage = useCurrentLanguage()

	// VSCode 기본값 따라가기 - UI 언어와 매칭
	const getDefaultLanguage = () => {
		switch (currentLanguage) {
			case "ko":
				return "Korean - 한국어"
			case "ja":
				return "Japanese - 日本語"
			case "zh":
				return "Simplified Chinese - 简体中文"
			case "en":
			default:
				return "English"
		}
	}

	const currentValue = chatSettings.preferredLanguage || getDefaultLanguage()

	return (
		<div className="setting-container">
			{!hideLabel && (
				<label htmlFor="preferred-language-dropdown">
					{t("settings.preferredLanguage.label", "common", currentLanguage)}
				</label>
			)}
			<p>
				<VSCodeDropdown
					id="preferred-language-dropdown"
					value={currentValue}
					onChange={(e: any) => {
						const newLanguage = e.target.value
						setChatSettings({
							...chatSettings,
							preferredLanguage: newLanguage,
						})
					}}
					style={{ width: "100%" }}>
					<VSCodeOption value="English">English</VSCodeOption>
					<VSCodeOption value="Arabic - العربية">Arabic - العربية</VSCodeOption>
					<VSCodeOption value="Portuguese - Português (Brasil)">Portuguese - Português (Brasil)</VSCodeOption>
					<VSCodeOption value="Czech - Čeština">Czech - Čeština</VSCodeOption>
					<VSCodeOption value="French - Français">French - Français</VSCodeOption>
					<VSCodeOption value="German - Deutsch">German - Deutsch</VSCodeOption>
					<VSCodeOption value="Hindi - हिन्दी">Hindi - हिन्दी</VSCodeOption>
					<VSCodeOption value="Hungarian - Magyar">Hungarian - Magyar</VSCodeOption>
					<VSCodeOption value="Italian - Italiano">Italian - Italiano</VSCodeOption>
					<VSCodeOption value="Japanese - 日本語">Japanese - 日本語</VSCodeOption>
					<VSCodeOption value="Korean - 한국어">Korean - 한국어</VSCodeOption>
					<VSCodeOption value="Polish - Polski">Polish - Polski</VSCodeOption>
					<VSCodeOption value="Portuguese - Português (Portugal)">Portuguese - Português (Portugal)</VSCodeOption>
					<VSCodeOption value="Russian - Русский">Russian - Русский</VSCodeOption>
					<VSCodeOption value="Simplified Chinese - 简体中文">Simplified Chinese - 简体中文</VSCodeOption>
					<VSCodeOption value="Spanish - Español">Spanish - Español</VSCodeOption>
					<VSCodeOption value="Traditional Chinese - 繁體中文">Traditional Chinese - 繁體中文</VSCodeOption>
					<VSCodeOption value="Turkish - Türkçe">Turkish - Türkçe</VSCodeOption>
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
				{t("settings.preferredLanguage.description", "common", currentLanguage)}
			</p>
		</div>
	)
}

export default React.memo(PreferredLanguageSetting)
