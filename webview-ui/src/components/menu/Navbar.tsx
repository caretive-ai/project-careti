import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { HistoryIcon, PlusIcon, SettingsIcon, UserCircleIcon } from "lucide-react"
import { useMemo } from "react"
import { t } from "@/caret/utils/i18n"
import { TaskServiceClient } from "@/services/grpc-client"
import { useExtensionState } from "../../context/ExtensionStateContext"
import HeroTooltip from "../common/HeroTooltip"

// Custom MCP Server Icon component using VSCode codicon
const McpServerIcon = ({ className, size }: { className?: string; size?: number }) => (
	<span
		className={`codicon codicon-server flex items-center ${className || ""}`}
		style={{ fontSize: size ? `${size}px` : "12.5px", marginBottom: "1px" }}
	/>
)

export const Navbar = () => {
	const { navigateToHistory, navigateToSettings, navigateToAccount, navigateToMcp, navigateToChat } = useExtensionState()

	const SETTINGS_TABS = useMemo(
		() => [
			{
				id: "chat",
				name: t("navbar.chat", "Chat"),
				tooltip: t("navbar.newTaskTooltip", "New Task"),
				icon: PlusIcon,
				navigate: () => {
					// Close the current task, then navigate to the chat view
					TaskServiceClient.clearTask({})
						.catch((error) => {
							console.error("Failed to clear task:", error)
						})
						.finally(() => navigateToChat())
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
			className="flex-none inline-flex justify-end bg-transparent gap-2 mb-1 z-10 border-none items-center mr-4!"
			id="cline-navbar-container"
			style={{ gap: "4px" }}>
			{SETTINGS_TABS.map((tab) => (
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
		</nav>
	)
}
