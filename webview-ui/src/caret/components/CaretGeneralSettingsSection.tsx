// CARET MODIFICATION: Copy-and-Modify from caret-main - General Settings Section with i18n
import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import Section from "@/components/settings/Section"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { t } from "../utils/i18n"
// CARET MODIFICATION: 통합 언어 설정 컴포넌트와 전역 브랜드 모드 토글
import ModeSystemToggle from "./ModeSystemToggle"
import UnifiedLanguageSetting from "./UnifiedLanguageSetting"

interface CaretGeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const CaretGeneralSettingsSection: React.FC<CaretGeneralSettingsSectionProps> = ({ renderSectionHeader }) => {
	// CARET MODIFICATION: Add telemetry setting with i18n, modeSystem for persona conditional rendering, and persona system state
	const { telemetrySetting, modeSystem, enablePersonaSystem, setEnablePersonaSystem } = useExtensionState()

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

				{/* CARET MODIFICATION: 페르소나 설정 - Caret 모드일 때만 표시 */}
				{modeSystem === "caret" && (
					<div className="mb-6">
						<div className="mb-[5px]">
							<VSCodeCheckbox
								checked={enablePersonaSystem}
								className="mb-[5px]"
								onChange={(e: any) => {
									const checked = e.target.checked === true
									setEnablePersonaSystem(checked) // CARET MODIFICATION: localStorage는 setter 내부에서 처리
									console.log("Persona system toggle:", checked)
								}}>
								{t("persona.enablePersonaSystem", "common")}
							</VSCodeCheckbox>
							<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
								{t("persona.description", "common")}
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
						{t("telemetry.label", "common")}
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						{t("telemetry.description", "common")}{" "}
						<VSCodeLink className="text-inherit" href="https://docs.cline.bot/more-info/telemetry">
							{t("telemetry.telemetryOverview", "common")}
						</VSCodeLink>{" "}
						{t("telemetry.and", "common")}{" "}
						<VSCodeLink className="text-inherit" href="https://cline.bot/privacy">
							{t("telemetry.privacyPolicy", "common")}
						</VSCodeLink>{" "}
						{t("telemetry.forMoreDetails", "common")}
					</p>
				</div>
			</Section>
		</div>
	)
}

export default React.memo(CaretGeneralSettingsSection)
