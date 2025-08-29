// CARET MODIFICATION: Copy-and-Modify from caret-main - General Settings Section with i18n
import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import PreferredLanguageSetting from "@/components/settings/PreferredLanguageSetting"
import Section from "@/components/settings/Section"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { t } from "../utils/i18n"
import CaretUILanguageSetting from "./CaretUILanguageSetting"

interface CaretGeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const CaretGeneralSettingsSection: React.FC<CaretGeneralSettingsSectionProps> = ({ renderSectionHeader }) => {
	// CARET MODIFICATION: Add telemetry setting with i18n
	const { telemetrySetting } = useExtensionState()

	return (
		<div className="flex flex-col gap-4">
			{renderSectionHeader("general")}

			<Section>
				{/* CARET MODIFICATION: UI Language Setting */}
				<div className="mb-6">
					<CaretUILanguageSetting />
				</div>

				{/* Original Preferred Language Setting (LLM messages) */}
				<div className="mb-6">
					<PreferredLanguageSetting />
				</div>

				{/* CARET MODIFICATION: Telemetry setting with i18n */}
				<div className="mb-[5px]">
					<VSCodeCheckbox
						checked={telemetrySetting !== "disabled"}
						className="mb-[5px]"
						onChange={(e: any) => {
							const checked = e.target.checked === true
							updateSetting("telemetrySetting", checked ? "enabled" : "disabled")
						}}>
						{t("telemetry.label", "settings")}
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						{t("telemetry.description", "settings")}{" "}
						<VSCodeLink className="text-inherit" href="https://docs.cline.bot/more-info/telemetry">
							{t("telemetry.telemetryOverview", "settings")}
						</VSCodeLink>{" "}
						{t("telemetry.and", "settings")}{" "}
						<VSCodeLink className="text-inherit" href="https://cline.bot/privacy">
							{t("telemetry.privacyPolicy", "settings")}
						</VSCodeLink>{" "}
						{t("telemetry.forMoreDetails", "settings")}
					</p>
				</div>
			</Section>
		</div>
	)
}

export default React.memo(CaretGeneralSettingsSection)
