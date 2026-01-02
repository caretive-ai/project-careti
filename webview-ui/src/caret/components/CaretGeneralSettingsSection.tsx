// CARET MODIFICATION: Copy-and-Modify from caret-main - General Settings Section with i18n

// CARET MODIFICATION: Import feature configuration for conditional rendering
// Frontend는 ExtensionState의 featureConfig 사용
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import Section from "@/components/settings/Section"
// CODECENTER: updateSetting removed
import { useExtensionState } from "@/context/ExtensionStateContext"
// CODECENTER: Telemetry imports removed
// CODECENTER: useCaretI18n removed
import { t } from "../utils/i18n"
import ModeSystemToggle from "./ModeSystemToggle"
// CARET MODIFICATION: 통합 언어 설정 컴포넌트와 전역 브랜드 모드 토글
import UnifiedLanguageSetting from "./UnifiedLanguageSetting"

interface CaretGeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const CaretGeneralSettingsSection: React.FC<CaretGeneralSettingsSectionProps> = ({ renderSectionHeader }) => {
	// CARET MODIFICATION: Add telemetry setting with i18n, modeSystem, and persona system restored
	const { modeSystem, enablePersonaSystem, setEnablePersonaSystem, featureConfig } = useExtensionState()
	// CODECENTER: currentLanguage removed

	return (
		<div className="flex flex-col gap-4">
			{renderSectionHeader("general")}

			<Section>
				{/* 모드 시스템 토글 - feature flag로 제어*/}
				{featureConfig?.showModeSystemToggle !== false && (
					<div className="mb-6">
						<ModeSystemToggle />
					</div>
				)}

				{/* CARET MODIFICATION: 통합 언어 설정 - LLM과 UI 언어 자동 동기화 */}
				<div className="mb-6">
					<UnifiedLanguageSetting />
				</div>

				{/* CARET MODIFICATION: 페르소나 설정 - Caret 모드이고 브랜드 설정에서 허용할 때만 표시 */}
				{/* CARET MODIFICATION: Only show when explicitly enabled in feature config */}
				{featureConfig?.showPersonaSettings === true && modeSystem === "caret" && (
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

				{/* CARET MODIFICATION: CodeCenter telemetry disabled */}
			</Section>
		</div>
	)
}

export default React.memo(CaretGeneralSettingsSection)
