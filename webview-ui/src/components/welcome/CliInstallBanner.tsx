import { EmptyRequest, Int64Request } from "@shared/proto/index.cline"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { vscode } from "@/utils/vscode"
import { getAsVar, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"

export const CURRENT_CLI_BANNER_VERSION = 1
const POLL_INTERVAL_MS = 1500

const CliInstallBanner = () => {
	const { isCliSubagent, modeSystem, lastDismissedCliBannerVersion } = useExtensionState()
	const [isInstalled, setIsInstalled] = useState(false)
	const [isDismissed, setIsDismissed] = useState(false)
	const [isCopied, setIsCopied] = useState(false)
	const isCaretMode = modeSystem === "caret"

	const installCommand = useMemo(
		() => (isCaretMode ? "npm install -g @caretive/caret-cli" : "npm install -g cline"),
		[isCaretMode],
	)
	const docsUrl = useMemo(
		() =>
			isCaretMode
				? "https://github.com/aicoding-caret/caret#cli-installation"
				: "https://docs.cline.bot/cline-cli/overview",
		[isCaretMode],
	)

	const shouldHideBanner =
		isCliSubagent || isInstalled || isDismissed || (lastDismissedCliBannerVersion ?? 0) >= CURRENT_CLI_BANNER_VERSION

	// Poll backend for CLI installation status (mode-aware on the controller side)
	useEffect(() => {
		let cancelled = false

		const checkInstallation = async () => {
			try {
				const result = await StateServiceClient.checkCliInstallation(EmptyRequest.create())
				if (!cancelled) {
					setIsInstalled(result.value)
				}
			} catch (error) {
				console.error("[CliInstallBanner] Failed to check CLI installation", error)
			}
		}

		checkInstallation()
		const interval = setInterval(checkInstallation, POLL_INTERVAL_MS)
		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [modeSystem])

	// Dismiss banner once installation is detected
	useEffect(() => {
		if (isInstalled && !isDismissed) {
			setIsDismissed(true)
			StateServiceClient.updateCliBannerVersion(Int64Request.create({ value: CURRENT_CLI_BANNER_VERSION })).catch(
				console.error,
			)
		}
	}, [isDismissed, isInstalled])

	const handleDismiss = useCallback((e?: React.MouseEvent) => {
		e?.preventDefault()
		e?.stopPropagation()
		setIsDismissed(true)
		StateServiceClient.updateCliBannerVersion(Int64Request.create({ value: CURRENT_CLI_BANNER_VERSION })).catch(console.error)
	}, [])

	const handleInstall = useCallback(() => {
		StateServiceClient.installClineCli(EmptyRequest.create()).catch((error) =>
			console.error("[CliInstallBanner] Failed to trigger CLI install", error),
		)
	}, [])

	const handleCopyCommand = useCallback(async () => {
		try {
			if (navigator?.clipboard) {
				await navigator.clipboard.writeText(installCommand)
				setIsCopied(true)
				setTimeout(() => setIsCopied(false), 1200)
				return
			}
		} catch (error) {
			console.error("[CliInstallBanner] Clipboard write failed, falling back to VSCode", error)
		}

		vscode.postMessage({
			type: "copyToClipboard",
			text: installCommand,
		} as any)
	}, [installCommand])

	const handleLearnMore = useCallback(() => {
		vscode.postMessage({ type: "openExternal", url: docsUrl } as any)
	}, [docsUrl])

	if (shouldHideBanner) {
		return null
	}

	return (
		<div
			className="flex flex-col gap-1 shrink-0 mb-1 relative text-sm mt-1.5 mx-4 no-underline transition-colors border-0 text-left"
			style={{
				backgroundColor: getAsVar(VSC_INACTIVE_SELECTION_BACKGROUND),
				borderRadius: "3px",
				color: "var(--vscode-foreground)",
				padding: "12px",
			}}>
			<h4 className="m-0 flex items-center gap-2" style={{ paddingRight: "24px" }}>
				<span className="codicon codicon-terminal" />
				{t("cliBanner.title", "welcome")}
			</h4>
			<p className="m-0" style={{ opacity: 0.95 }}>
				{t("cliBanner.description", "welcome")}
				&nbsp;
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault()
						handleLearnMore()
					}}
					style={{ color: "var(--vscode-textLink-foreground)" }}>
					Learn more
				</a>
			</p>
			<div
				className="p-2 rounded flex items-center justify-between"
				style={{
					backgroundColor: "var(--vscode-editor-background)",
					fontFamily: "var(--vscode-editor-font-family)",
					fontSize: 12,
				}}>
				<span style={{ overflowWrap: "anywhere" }}>{installCommand}</span>
				<VSCodeButton
					appearance="icon"
					onClick={handleCopyCommand}
					style={{ marginLeft: "8px", flexShrink: 0 }}
					title={isCopied ? t("cliBanner.copied", "welcome") : t("cliBanner.copyCommand", "welcome")}>
					<span className={`codicon ${isCopied ? "codicon-check" : "codicon-copy"}`}></span>
				</VSCodeButton>
			</div>
			<div className="flex gap-2">
				<VSCodeButton appearance="primary" className="flex-1" disabled={isInstalled} onClick={handleInstall}>
					{isInstalled ? t("cliBanner.installed", "welcome") : t("cliBanner.button", "welcome")}
				</VSCodeButton>
				<VSCodeButton appearance="secondary" className="flex-1" onClick={handleLearnMore}>
					{t("cliBanner.learnMore", "welcome")}
				</VSCodeButton>
			</div>

			<VSCodeButton
				appearance="icon"
				className="absolute top-2 right-2"
				onClick={handleDismiss}
				title={t("cliBanner.dismissTitle", "welcome")}>
				<span className="codicon codicon-close" />
			</VSCodeButton>
		</div>
	)
}

export default CliInstallBanner
