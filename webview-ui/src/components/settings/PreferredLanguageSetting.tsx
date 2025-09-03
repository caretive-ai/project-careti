import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { SupportedLanguage, t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { updateSetting } from "./utils/settingsHandlers"

const languageOptions: { value: SupportedLanguage; label: string }[] = [
	{ value: "en", label: "🇺🇸 English" },
	{ value: "ko", label: "🇰🇷 한국어 (Korean)" },
	{ value: "ja", label: "🇯🇵 日本語 (Japanese)" },
	{ value: "zh", label: "🇨🇳 中文 (Chinese)" },
]

const PreferredLanguageSetting: React.FC = () => {
	const { preferredLanguage } = useExtensionState()

	const handleLanguageChange = (newLanguage: string) => {
		updateSetting("preferredLanguage", newLanguage)
	}

	return (
		<div style={{}}>
			<label className="block mb-1 text-sm font-medium" htmlFor="preferred-language-dropdown">
				{t("settings.preferredLanguage.label", "settings")}
			</label>
			<VSCodeDropdown
				currentValue={preferredLanguage || "en"}
				id="preferred-language-dropdown"
				onChange={(e: any) => {
					handleLanguageChange(e.target.value)
				}}
				style={{ width: "100%" }}>
				{languageOptions.map((option) => (
					<VSCodeOption key={option.value} value={option.value}>
						{option.label}
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
