// CARET MODIFICATION: Import full language support
import { type LanguageDisplay, languageOptions } from "@shared/Languages"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { useCaretI18n } from "@/caret/hooks/useCaretI18n"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { updateSetting } from "./utils/settingsHandlers"

const PreferredLanguageSetting: React.FC = () => {
	const { preferredLanguage } = useExtensionState()
	const { changeLanguage } = useCaretI18n()

	const handleLanguageChange = async (newLanguageDisplay: LanguageDisplay) => {
		// CARET MODIFICATION: Handle full language support and immediate UI switching
		try {
			console.log(`🌐 [PreferredLanguageSetting] Language change requested: ${newLanguageDisplay}`)

			// First update the backend preference setting (this will trigger ExtensionState change)
			updateSetting("preferredLanguage", newLanguageDisplay)

			console.log(`✅ [PreferredLanguageSetting] Language setting updated: ${newLanguageDisplay}`)
		} catch (error) {
			console.error(t("settings.preferredLanguage.changeError", "settings"), error)
		}
	}

	return (
		<div style={{}}>
			<label className="block mb-1 text-sm font-medium" htmlFor="preferred-language-dropdown">
				{t("settings.preferredLanguage.label", "settings")}
			</label>
			<VSCodeDropdown
				currentValue={preferredLanguage || "English"}
				id="preferred-language-dropdown"
				onChange={(e: any) => {
					handleLanguageChange(e.target.value as LanguageDisplay)
				}}
				style={{ width: "100%" }}>
				{languageOptions.map((option) => (
					<VSCodeOption key={option.key} value={option.display}>
						{option.display}
					</VSCodeOption>
				))}
			</VSCodeDropdown>
			<p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
				{t("settings.preferredLanguage.description", "settings")}
			</p>
		</div>
	)
}

export default React.memo(PreferredLanguageSetting)
