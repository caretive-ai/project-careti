// CARETI MODIFICATION: Add i18n support for General Settings
import CaretiGeneralSettingsSection from "@/careti/components/CaretiGeneralSettingsSection"

interface GeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const GeneralSettingsSection = ({ renderSectionHeader }: GeneralSettingsSectionProps) => {
	// CARETI MODIFICATION: Use Careti's i18n-enabled General Settings Section
	return <CaretiGeneralSettingsSection renderSectionHeader={renderSectionHeader} />
}

export default GeneralSettingsSection
