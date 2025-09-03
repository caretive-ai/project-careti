// CARET MODIFICATION: Add i18n support for General Settings
import CaretGeneralSettingsSection from "@/caret/components/CaretGeneralSettingsSection"

interface GeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const GeneralSettingsSection = ({ renderSectionHeader }: GeneralSettingsSectionProps) => {
	// CARET MODIFICATION: Use Caret's i18n-enabled General Settings Section
	return <CaretGeneralSettingsSection renderSectionHeader={renderSectionHeader} />
}

export default GeneralSettingsSection
