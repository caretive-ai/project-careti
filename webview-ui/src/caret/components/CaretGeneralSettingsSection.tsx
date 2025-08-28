// CARET MODIFICATION: Copy-and-Modify from caret-main - General Settings Section with i18n
import React from "react"
import PreferredLanguageSetting from "@/components/settings/PreferredLanguageSetting"
import Section from "@/components/settings/Section"
import { t } from "../utils/i18n"
import CaretModeSystemSetting from "./CaretModeSystemSetting"
import CaretUILanguageSetting from "./CaretUILanguageSetting"

interface CaretGeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const CaretGeneralSettingsSection: React.FC<CaretGeneralSettingsSectionProps> = ({ renderSectionHeader }) => {
	return (
		<div className="flex flex-col gap-4">
			{renderSectionHeader("general")}

			<Section>
				{/* CARET MODIFICATION: UI Language Setting */}
				<div className="mb-6">
					<CaretUILanguageSetting />
				</div>

				{/* CARET MODIFICATION: Mode System Setting */}
				<div className="mb-6">
					<CaretModeSystemSetting />
				</div>

				{/* Original Preferred Language Setting (LLM messages) */}
				<div className="mb-6">
					<PreferredLanguageSetting />
				</div>
			</Section>
		</div>
	)
}

export default React.memo(CaretGeneralSettingsSection)
