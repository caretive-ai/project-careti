import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"

const CliInstallBanner = () => {
	const { isCliSubagent, modeSystem } = useExtensionState()
	const [isInstalled, setIsInstalled] = useState<boolean | null>(null)

	useEffect(() => {
		// Check if CLI is installed
		// Since we don't have direct FS access in webview, we rely on a message or context
		// For now, we'll assume we can check via a command or it's passed in context
		// If not available in context, we might need to add it to ExtensionState
		// For this implementation, we'll use a placeholder check or message

		// TODO: Add isClineCliInstalled to ExtensionState or handle via message
		// For now, we will default to showing it if not in subagent mode
		setIsInstalled(false)
	}, [])

	const handleInstall = () => {
		const isCaret = modeSystem === "caret"
		const installUrl = isCaret
			? "https://github.com/aicoding-caret/caret#cli-installation"
			: "https://github.com/cline/cline#cli-installation"
		const installCommand = isCaret ? "npm install -g @caret-ai/cli" : "npm install -g cline-cli"
		vscode.postMessage({
			type: "openExternal",
			url: installUrl,
		} as any)
		// Or copy command to clipboard
		vscode.postMessage({
			type: "copyToClipboard",
			text: installCommand,
		} as any)
	}

	if (isCliSubagent || isInstalled === true) {
		return null
	}

	return (
		<div
			style={{
				backgroundColor: "var(--vscode-textBlockQuote-background)",
				borderLeft: "4px solid var(--vscode-textLink-foreground)",
				padding: "10px 15px",
				marginBottom: "20px",
				borderRadius: "2px",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}>
			<div>
				<div style={{ fontWeight: "bold", marginBottom: "4px" }}>{t("cliBanner.title", "welcome")}</div>
				<div style={{ fontSize: "12px", opacity: 0.9 }}>{t("cliBanner.description", "welcome")}</div>
			</div>
			<VSCodeButton appearance="secondary" onClick={handleInstall}>
				{t("cliBanner.button", "welcome")}
			</VSCodeButton>
		</div>
	)
}

export default CliInstallBanner
