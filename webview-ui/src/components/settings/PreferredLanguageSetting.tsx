import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { SupportedLanguage, t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { updateSetting } from "./utils/settingsHandlers"

const supportedLanguages: SupportedLanguage[] = ["en", "ko", "zh", "ja"]

const PreferredLanguageSetting: React.FC = () => {
	const { preferredLanguage } = useExtensionState()

	const handleLanguageChange = (newLanguage: SupportedLanguage) => {
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
				<VSCodeOption value="en">🇺🇸 English</VSCodeOption>
				<VSCodeOption value="ko">🇰🇷 한국어 (Korean)</VSCodeOption>
				<VSCodeOption value="zh">🇨🇳 中文 (Chinese)</VSCodeOption>
				<VSCodeOption value="ja">🇯🇵 日本語 (Japanese)</VSCodeOption>
			</VSCodeDropdown>
			<p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
				{t("settings.preferredLanguage.description", "settings")}
			</p>
		</div>
	)
}

export default React.memo(PreferredLanguageSetting)
