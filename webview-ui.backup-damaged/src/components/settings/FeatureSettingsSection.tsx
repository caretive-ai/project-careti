import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { memo } from "react"
import { OpenAIReasoningEffort } from "@shared/ChatSettings"
// CARET MODIFICATION: 다국어 지원 추가
import { t } from "../../caret/utils/i18n"
import { useCurrentLanguage } from "../../caret/hooks/useCurrentLanguage"

const FeatureSettingsSection = () => {
	// CARET MODIFICATION: 현재 언어 추가
	const currentLanguage = useCurrentLanguage()
	const {
		enableCheckpointsSetting,
		setEnableCheckpointsSetting,
		mcpMarketplaceEnabled,
		setMcpMarketplaceEnabled,
		mcpRichDisplayEnabled,
		setMcpRichDisplayEnabled,
		mcpResponsesCollapsed,
		setMcpResponsesCollapsed,
		chatSettings,
		setChatSettings,
	} = useExtensionState()

	return (
		<div style={{ marginBottom: 20 }}>
			<div>
				<VSCodeCheckbox
					checked={enableCheckpointsSetting}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setEnableCheckpointsSetting(checked)
					}}>
					{t("features.enableCheckpoints", "settings", currentLanguage)}
				</VSCodeCheckbox>
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					{t("features.enableCheckpointsDescription", "settings", currentLanguage)}
				</p>
			</div>
			<div style={{ marginTop: 10 }}>
				<VSCodeCheckbox
					checked={mcpMarketplaceEnabled}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setMcpMarketplaceEnabled(checked)
					}}>
					{t("features.enableMcpMarketplace", "settings", currentLanguage)}
				</VSCodeCheckbox>
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					{t("features.enableMcpMarketplaceDescription", "settings", currentLanguage)}
				</p>
			</div>
			<div style={{ marginTop: 10 }}>
				<VSCodeCheckbox
					checked={mcpRichDisplayEnabled}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setMcpRichDisplayEnabled(checked)
					}}>
					{t("features.enableRichMcpDisplay", "settings", currentLanguage)}
				</VSCodeCheckbox>
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					{t("features.enableRichMcpDisplayDescription", "settings", currentLanguage)}
				</p>
			</div>
			<div style={{ marginTop: 10 }}>
				<VSCodeCheckbox
					checked={mcpResponsesCollapsed}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setMcpResponsesCollapsed(checked)
					}}>
					{t("features.collapseMcpResponses", "settings", currentLanguage)}
				</VSCodeCheckbox>
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					{t("features.collapseMcpResponsesDescription", "settings", currentLanguage)}
				</p>
			</div>
			<div style={{ marginTop: 10 }}>
				<label
					htmlFor="openai-reasoning-effort-dropdown"
					className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1">
					{t("features.openaiReasoningEffort", "settings", currentLanguage)}
				</label>
				<VSCodeDropdown
					id="openai-reasoning-effort-dropdown"
					currentValue={chatSettings.openAIReasoningEffort || "medium"}
					onChange={(e: any) => {
						const newValue = e.target.currentValue as OpenAIReasoningEffort
						setChatSettings({
							...chatSettings,
							openAIReasoningEffort: newValue,
						})
					}}
					className="w-full">
					<VSCodeOption value="low">{t("features.reasoningEffort.low", "settings", currentLanguage)}</VSCodeOption>
					<VSCodeOption value="medium">{t("features.reasoningEffort.medium", "settings", currentLanguage)}</VSCodeOption>
					<VSCodeOption value="high">{t("features.reasoningEffort.high", "settings", currentLanguage)}</VSCodeOption>
				</VSCodeDropdown>
				<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
					{t("features.openaiReasoningEffortDescription", "settings", currentLanguage)}
				</p>
			</div>
		</div>
	)
}

export default memo(FeatureSettingsSection)
