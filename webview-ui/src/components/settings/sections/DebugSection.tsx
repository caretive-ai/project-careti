import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import Section from "../Section"

interface DebugSectionProps {
	onResetState: (resetGlobalState?: boolean) => Promise<void>
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const DebugSection = ({ onResetState, renderSectionHeader }: DebugSectionProps) => {
	return (
		<div>
			{renderSectionHeader("debug")}
			<Section>
				<VSCodeButton
					className="mt-[5px] w-auto"
					onClick={() => onResetState()}
					style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
					{t("debug.resetWorkspaceState", "settings")}
				</VSCodeButton>
				<VSCodeButton
					className="mt-[5px] w-auto"
					onClick={() => onResetState(true)}
					style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
					{t("debug.resetGlobalState", "settings")}
				</VSCodeButton>
				<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
					{t("debug.resetGlobalStateDescription", "settings")}
				</p>
			</Section>
		</div>
	)
}

export default DebugSection
