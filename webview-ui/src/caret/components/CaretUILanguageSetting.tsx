// CARET MODIFICATION: Copy-and-Modify from caret-main - UI Language Setting Component
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { t, setGlobalUILanguage, type SupportedLanguage } from "../utils/i18n"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { TaskServiceClient } from "@/services/grpc-client"

interface CaretUILanguageSettingProps {
	hideLabel?: boolean
}

const languageOptions = [
	{ value: "ko" as SupportedLanguage, label: "🇰🇷 한국어 (Korean)" },
	{ value: "en" as SupportedLanguage, label: "🇺🇸 English" },
	{ value: "ja" as SupportedLanguage, label: "🇯🇵 日本語 (Japanese)" },
	{ value: "zh" as SupportedLanguage, label: "🇨🇳 中文 (Chinese)" },
]

const CaretUILanguageSetting: React.FC<CaretUILanguageSettingProps> = ({ hideLabel = false }) => {
	// CARET MODIFICATION: Use integrated hook instead of separate imports
	const { currentLanguage, changeLanguage } = useCaretI18n()

	const handleLanguageChange = async (event: any) => {
		const target = event.target || event.detail?.target
		const newUILanguage = target.value as SupportedLanguage

		console.log("🌐 UI Language change requested:", newUILanguage)

		try {
			// CARET MODIFICATION: Use integrated changeLanguage with lazy loading
			await changeLanguage(newUILanguage)

			// CARET MODIFICATION: Also update Preferred Language to match UI language
			const preferredLanguageMap: Record<SupportedLanguage, string> = {
				ko: "Korean - 한국어",
				en: "English",
				ja: "Japanese - 日本語",
				zh: "Simplified Chinese - 简体中文",
			}

			const preferredLanguage = preferredLanguageMap[newUILanguage]
			if (preferredLanguage) {
				updateSetting("preferredLanguage", preferredLanguage)
				console.log("🔄 Preferred Language also updated to:", preferredLanguage)
			}

			// CARET MODIFICATION: Start new task when language changes (from caret-main)
			TaskServiceClient.clearTask({})
			console.log("🆕 Starting new task due to language change")

			console.log("✅ UI Language changed successfully:", newUILanguage)
		} catch (error) {
			console.error("❌ Failed to change UI language:", error)
		}
	}

	return (
		<div className="setting-container">
			{!hideLabel && <label htmlFor="ui-language-select">{t("settings.uiLanguage.label", "settings")}</label>}
			<p>
				<VSCodeDropdown
					id="ui-language-select"
					value={currentLanguage}
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
				{t("settings.uiLanguage.description", "settings")}
			</p>
		</div>
	)
}

export default React.memo(CaretUILanguageSetting)
