import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { FolderOpenIcon, HistoryIcon, PlusIcon, SettingsIcon, UserCircleIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { t } from "@/careti/utils/i18n"
import { TaskServiceClient } from "@/services/grpc-client"
import { useExtensionState } from "../../context/ExtensionStateContext"
import HeroTooltip from "../common/HeroTooltip"
import { IS_STANDALONE } from "@/config/platform.config"

// Custom MCP Server Icon component using VSCode codicon
const McpServerIcon = ({ className, size }: { className?: string; size?: number }) => (
	<span
		className={`codicon codicon-server flex items-center ${className || ""}`}
		style={{ fontSize: size ? `${size}px` : "12.5px", marginBottom: "1px" }}
	/>
)

export const Navbar = () => {
	const { navigateToHistory, navigateToSettings, navigateToAccount, navigateToMcp, navigateToChat, featureConfig } =
		useExtensionState()

	// CARETI MODIFICATION: Track selected workspace folder path
	const [workspacePath, setWorkspacePath] = useState<string | null>(null)

	// CARETI MODIFICATION: Handle workspace folder selection for standalone mode
	const handleSelectWorkspaceFolder = async () => {
		if (IS_STANDALONE && (window as any).selectWorkspaceFolder) {
			try {
				const folder = await (window as any).selectWorkspaceFolder()
				if (folder) {
					console.log("[Navbar] Workspace folder selected:", folder)
					setWorkspacePath(folder)
				}
			} catch (error) {
				console.error("[Navbar] Folder selection error:", error)
			}
		} else {
			console.warn("[Navbar] selectWorkspaceFolder not available")
		}
	}

	// CARETI MODIFICATION: Get short folder name for display
	const shortFolderName = useMemo(() => {
		if (!workspacePath) return null
		const parts = workspacePath.split("/")
		return parts[parts.length - 1] || parts[parts.length - 2] || workspacePath
	}, [workspacePath])

	const SETTINGS_TABS = useMemo(
		() => [
			// CARETI MODIFICATION: Folder selection for standalone mode
			...(IS_STANDALONE
				? [
						{
							id: "folder",
							name: t("navbar.folder", "Folder"),
							tooltip: t("navbar.folderTooltip", "작업 폴더 선택"),
							icon: FolderOpenIcon,
							navigate: handleSelectWorkspaceFolder,
						},
					]
				: []),
			{
				id: "chat",
				name: t("navbar.chat", "Chat"),
				tooltip: t("navbar.newTaskTooltip", "New Task"),
				icon: PlusIcon,
				navigate: () => {
					// CARETI MODIFICATION: Navigate to chat first, then try to clear task
					// This ensures navigation works even if gRPC isn't ready
					navigateToChat()
					TaskServiceClient.clearTask({}).catch((error) => {
						console.error("Failed to clear task:", error)
					})
				},
			},
			{
				id: "mcp",
				name: t("navbar.mcp", "MCP"),
				tooltip: t("navbar.mcpServersTooltip", "MCP Servers"),
				icon: McpServerIcon,
				navigate: navigateToMcp,
			},
			{
				id: "history",
				name: t("navbar.history", "History"),
				tooltip: t("navbar.historyTooltip", "History"),
				icon: HistoryIcon,
				navigate: navigateToHistory,
			},
			{
				id: "account",
				name: t("navbar.account", "Account"),
				tooltip: t("navbar.accountTooltip", "Account"),
				icon: UserCircleIcon,
				navigate: navigateToAccount,
			},
			{
				id: "settings",
				name: t("navbar.settings", "Settings"),
				tooltip: t("navbar.settingsTooltip", "Settings"),
				icon: SettingsIcon,
				navigate: navigateToSettings,
			},
		],
		[t, navigateToAccount, navigateToChat, navigateToHistory, navigateToMcp, navigateToSettings],
	)

	return (
		<nav
			className="flex-none flex justify-between bg-transparent mb-1 z-10 border-none items-center px-2"
			id="cline-navbar-container">
			{/* CARETI MODIFICATION: Left side - workspace path */}
			<div className="flex items-center gap-1 text-xs text-[var(--vscode-descriptionForeground)] truncate max-w-[200px]">
				{IS_STANDALONE && shortFolderName && (
					<HeroTooltip content={workspacePath || ""} placement="bottom">
						<span className="truncate cursor-default">{shortFolderName}</span>
					</HeroTooltip>
				)}
			</div>
			{/* Right side - action buttons */}
			<div className="flex items-center" style={{ gap: "4px" }}>
				{SETTINGS_TABS.filter((tab) => featureConfig?.showAccountUI !== false || tab.id !== "account") // CARETI MODIFICATION: Hide account tab when disabled
					.map((tab) => (
						<HeroTooltip content={tab.tooltip} key={`navbar-tooltip-${tab.id}`} placement="bottom">
							<VSCodeButton
								appearance="icon"
								aria-label={tab.tooltip}
								data-testid={`tab-${tab.id}`}
								key={`navbar-button-${tab.id}`}
								onClick={() => tab.navigate()}
								style={{ padding: "0px", height: "20px" }}>
								<div className="flex items-center gap-1 text-xs whitespace-nowrap min-w-0 w-full">
									<tab.icon className="text-[var(--vscode-foreground)]" size={18} strokeWidth={1} />
								</div>
							</VSCodeButton>
						</HeroTooltip>
					))}
			</div>
		</nav>
	)
}
