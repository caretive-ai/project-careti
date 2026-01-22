import { StringRequest } from "@shared/proto/cline/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/careti/utils/i18n"
import CaretFooter from "../../../careti/components/CaretFooter"
import { getLocalizedUrl } from "../../../careti/constants/urls"
import { useCaretI18nContext } from "../../../careti/context/CaretI18nContext"
import { useExtensionState } from "../../../context/ExtensionStateContext"
import { UiServiceClient } from "../../../services/grpc-client"
import Announcement from "../../chat/Announcement"
import Section from "../Section"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	const { setShowAnnouncement } = useExtensionState()
	const { language } = useCaretI18nContext()

	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="flex flex-col items-center p-4">
					<VSCodeButton
						className="mt-4"
						onClick={() => {
							UiServiceClient.openUrl(
								StringRequest.create({ value: getLocalizedUrl("CARET_DOCS_MANUAL", language) }),
							)
						}}>
						{t("about.documentation_detailed", "settings")}
					</VSCodeButton>
				</div>
				<Announcement hideAnnouncement={() => setShowAnnouncement(false)} version={version} />
				<div className="mt-6 pt-4">
					<CaretFooter />
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
