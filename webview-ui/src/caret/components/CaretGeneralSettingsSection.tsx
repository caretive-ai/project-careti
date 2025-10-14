// CARET MODIFICATION: Copy-and-Modify from caret-main - General Settings Section with i18n

// CARET MODIFICATION: Import feature configuration for conditional rendering
// Frontend는 ExtensionState의 featureConfig 사용
import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import Section from "@/components/settings/Section"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getLocalizedUrl, type SupportedLanguage } from "../constants/urls"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"
// CARET MODIFICATION: 통합 언어 설정 컴포넌트와 전역 브랜드 모드 토글
import ModeSystemToggle from "./ModeSystemToggle"
import UnifiedLanguageSetting from "./UnifiedLanguageSetting"

interface CaretGeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const CaretGeneralSettingsSection: React.FC<CaretGeneralSettingsSectionProps> = ({ renderSectionHeader }) => {
	// CARET MODIFICATION: Add telemetry setting with i18n, modeSystem, and persona system restored
	const { telemetrySetting, modeSystem, enablePersonaSystem, setEnablePersonaSystem, featureConfig } = useExtensionState()
	const { currentLanguage } = useCaretI18n()

	return (
		<div className="flex flex-col gap-4">
			{renderSectionHeader("general")}

			<Section>
				{/* CARET MODIFICATION: 전역 브랜드 모드 토글 - 최상단에 배치 */}
				<div className="mb-6">
					<ModeSystemToggle />
				</div>

				{/* CARET MODIFICATION: 통합 언어 설정 - LLM과 UI 언어 자동 동기화 */}
				<div className="mb-6">
					<UnifiedLanguageSetting />
				</div>

				{/* CARET MODIFICATION: 페르소나 설정 - Caret 모드이고 브랜드 설정에서 허용할 때만 표시 */}
				{/* CARET MODIFICATION: Default to show if featureConfig undefined (no feature-config.json in current merge) */}
				{featureConfig?.showPersonaSettings !== false && modeSystem === "caret" && (
					<div className="mb-6">
						<div className="mb-[5px]">
							<VSCodeCheckbox
								checked={enablePersonaSystem}
								className="mb-[5px]"
								onChange={(e: any) => {
									const checked = e.target.checked === true
									console.log("[PERSONA-DEBUG] Toggle clicked:", {
										checked,
										currentState: enablePersonaSystem,
										timestamp: new Date().toISOString(),
									})

									setEnablePersonaSystem(checked)

									console.log("[PERSONA-DEBUG] setEnablePersonaSystem called with:", checked)
								}}>
								{t("persona.enablePersonaSystem", "settings")}
							</VSCodeCheckbox>
							<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
								{t("persona.description", "settings")}
							</p>
						</div>
						{/* TODO: 페르소나 선택 UI 추가 */}
					</div>
				)}

				{/* CARET MODIFICATION: Telemetry setting with i18n */}
				<div className="mb-[5px]">
					<VSCodeCheckbox
						checked={telemetrySetting !== "disabled"}
						className="mb-[5px]"
						onChange={(e: any) => {
							const checked = e.target.checked === true
							updateSetting("telemetrySetting", checked ? "enabled" : "disabled")
						}}>
						{t("telemetry.helpImprove", "common")}
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						{t("telemetry.description", "common")}{" "}
						<VSCodeLink
							className="text-inherit"
							href={getLocalizedUrl("CARETIVE_PRIVACY", currentLanguage as SupportedLanguage)}>
							{t("telemetry.settingsLink", "common")}
						</VSCodeLink>
					</p>
				</div>
			</Section>
		</div>
	)
}

export default React.memo(CaretGeneralSettingsSection)
