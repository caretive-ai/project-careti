import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import Section from "../Section"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="text-center text-[var(--vscode-descriptionForeground)] text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<p className="break-words m-0 p-0">
						{t("about.description", "settings")}{" "}
						<VSCodeLink className="inline" href={t("about.link", "settings")}>
							{t("about.link", "settings")}
						</VSCodeLink>
					</p>
					<p className="italic mt-[10px] mb-0 p-0">{t("about.version", "settings", { version })}</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
