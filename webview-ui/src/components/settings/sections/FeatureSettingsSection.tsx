import { McpDisplayMode } from "@shared/McpDisplayMode"
import { OpenaiReasoningEffort } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import { t } from "@/caret/utils/i18n"
import McpDisplayModeDropdown from "@/components/mcp/chat-display/McpDisplayModeDropdown"
import { useExtensionState } from "@/context/ExtensionStateContext"
import Section from "../Section"
import { updateSetting } from "../utils/settingsHandlers"

interface FeatureSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const FeatureSettingsSection = ({ renderSectionHeader }: FeatureSettingsSectionProps) => {
	const {
		enableCheckpointsSetting,
		mcpMarketplaceEnabled,
		mcpDisplayMode,
		mcpResponsesCollapsed,
		openaiReasoningEffort,
		strictPlanModeEnabled,
		useAutoCondense,
		focusChainSettings,
		focusChainFeatureFlagEnabled,
	} = useExtensionState()

	const handleReasoningEffortChange = (newValue: OpenaiReasoningEffort) => {
		updateSetting("openaiReasoningEffort", newValue)
	}

	return (
		<div>
			{renderSectionHeader("features")}
			<Section>
				<div style={{ marginBottom: 20 }}>
					<div>
						<VSCodeCheckbox
							checked={enableCheckpointsSetting}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("enableCheckpointsSetting", checked)
							}}>
							{t("features.enableCheckpoints", "settings")}
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							{t("features.enableCheckpointsDescription", "settings")}
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<VSCodeCheckbox
							checked={mcpMarketplaceEnabled}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("mcpMarketplaceEnabled", checked)
							}}>
							{t("features.enableMcpMarketplace", "settings")}
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							{t("features.enableMcpMarketplaceDescription", "settings")}
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<label
							className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1"
							htmlFor="mcp-display-mode-dropdown">
							{t("features.mcpDisplayMode", "settings")}
						</label>
						<McpDisplayModeDropdown
							className="w-full"
							id="mcp-display-mode-dropdown"
							onChange={(newMode: McpDisplayMode) => updateSetting("mcpDisplayMode", newMode)}
							value={mcpDisplayMode}
						/>
						<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
							{t("features.mcpDisplayModeDescription", "settings")}
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<VSCodeCheckbox
							checked={mcpResponsesCollapsed}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("mcpResponsesCollapsed", checked)
							}}>
							{t("features.collapseMcpResponses", "settings")}
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							{t("features.collapseMcpResponsesDescription", "settings")}
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<label
							className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1"
							htmlFor="openai-reasoning-effort-dropdown">
							{t("features.openaiReasoningEffort", "settings")}
						</label>
						<VSCodeDropdown
							className="w-full"
							currentValue={openaiReasoningEffort || "medium"}
							id="openai-reasoning-effort-dropdown"
							onChange={(e: any) => {
								const newValue = e.target.currentValue as OpenaiReasoningEffort
								handleReasoningEffortChange(newValue)
							}}>
							<VSCodeOption value="low">{t("features.reasoningEffort.low", "settings")}</VSCodeOption>
							<VSCodeOption value="medium">{t("features.reasoningEffort.medium", "settings")}</VSCodeOption>
							<VSCodeOption value="high">{t("features.reasoningEffort.high", "settings")}</VSCodeOption>
						</VSCodeDropdown>
						<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
							{t("features.openaiReasoningEffortDescription", "settings")}
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<VSCodeCheckbox
							checked={strictPlanModeEnabled}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("strictPlanModeEnabled", checked)
							}}>
							{t("features.strictPlanMode", "settings")}
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							{t("features.strictPlanModeDescription", "settings")}
						</p>
					</div>
					{focusChainFeatureFlagEnabled && (
						<div style={{ marginTop: 10 }}>
							<VSCodeCheckbox
								checked={focusChainSettings?.enabled || false}
								onChange={(e: any) => {
									const checked = e.target.checked === true
									updateSetting("focusChainSettings", { ...focusChainSettings, enabled: checked })
								}}>
								{t("features.focusChain", "settings")}
							</VSCodeCheckbox>
							<p className="text-xs text-[var(--vscode-descriptionForeground)]">
								{t("features.focusChainDescription", "settings")}
							</p>
						</div>
					)}
					{focusChainFeatureFlagEnabled && focusChainSettings?.enabled && (
						<div style={{ marginTop: 10, marginLeft: 20 }}>
							<label
								className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1"
								htmlFor="focus-chain-remind-interval">
								{t("features.focusChainReminderInterval", "settings")}
							</label>
							<VSCodeTextField
								className="w-20"
								id="focus-chain-remind-interval"
								onChange={(e: any) => {
									const value = parseInt(e.target.value, 10)
									if (!Number.isNaN(value) && value >= 1 && value <= 100) {
										updateSetting("focusChainSettings", {
											...focusChainSettings,
											remindClineInterval: value,
										})
									}
								}}
								value={String(focusChainSettings?.remindClineInterval || 6)}
							/>
							<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
								{t("features.focusChainReminderIntervalDescription", "settings")}
							</p>
						</div>
					)}
					<div style={{ marginTop: 10 }}>
						<VSCodeCheckbox
							checked={useAutoCondense}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("useAutoCondense", checked)
							}}>
							{t("features.autoCompact", "settings")}
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							{t("features.autoCompactDescription", "settings")}{" "}
							<a
								className="text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]"
								href="https://docs.cline.bot/features/auto-compact"
								rel="noopener noreferrer"
								target="_blank">
								{t("features.learnMore", "settings")}
							</a>
						</p>
					</div>
				</div>
			</Section>
		</div>
	)
}

export default memo(FeatureSettingsSection)
