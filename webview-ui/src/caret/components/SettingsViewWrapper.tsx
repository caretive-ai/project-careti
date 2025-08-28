// CARET MODIFICATION: SettingsView wrapper with i18n support
// This component wraps the original SettingsView and adds UI language settings
import React, { useCallback, useEffect, useRef, useState } from "react"
import { VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CheckCheck, FlaskConical, Info, LucideIcon, Settings, SquareMousePointer, SquareTerminal, Webhook } from "lucide-react"
import { useEvent } from "react-use"

import HeroTooltip from "@/components/common/HeroTooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { ResetStateRequest } from "@shared/proto/cline/state"

import { Tab, TabContent, TabHeader, TabList, TabTrigger } from "@/components/common/Tab"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"

import FeatureSettingsSection from "@/components/settings/sections/FeatureSettingsSection"
import SectionHeader from "@/components/settings/SectionHeader"
import TerminalSettingsSection from "@/components/settings/sections/TerminalSettingsSection"
import ApiConfigurationSection from "@/components/settings/sections/ApiConfigurationSection"
import BrowserSettingsSection from "@/components/settings/sections/BrowserSettingsSection"
import DebugSection from "@/components/settings/sections/DebugSection"
import AboutSection from "@/components/settings/sections/AboutSection"
import PreferredLanguageSetting from "@/components/settings/PreferredLanguageSetting"
import Section from "@/components/settings/Section"

import { useCaretI18n } from "../hooks/useCaretI18n"
import { t, type SupportedLanguage } from "../utils/i18n"
import CaretGeneralSettingsSection from "./CaretGeneralSettingsSection"

const IS_DEV = process.env.IS_DEV

// CARET MODIFICATION: Components imported from separate files

// Styles for the tab system (keeping original styles)
const settingsTabsContainer = "flex flex-1 overflow-hidden [&.narrow_.tab-label]:hidden"
const settingsTabList =
	"w-48 data-[compact=true]:w-12 flex-shrink-0 flex flex-col overflow-y-auto overflow-x-hidden border-r border-[var(--vscode-sideBar-background)]"
const settingsTabTrigger =
	"whitespace-nowrap overflow-hidden min-w-0 h-12 px-4 py-3 box-border flex items-center border-l-2 border-transparent text-[var(--vscode-foreground)] opacity-70 bg-transparent hover:bg-[var(--vscode-list-hoverBackground)] data-[compact=true]:w-12 data-[compact=true]:p-4 cursor-pointer"
const settingsTabTriggerActive =
	"opacity-100 border-l-2 border-l-[var(--vscode-focusBorder)] border-t-0 border-r-0 border-b-0 bg-[var(--vscode-list-activeSelectionBackground)]"

// CARET MODIFICATION: i18n Tab definitions
interface SettingsTab {
	id: string
	nameKey: string // Changed from 'name' to 'nameKey' for i18n
	tooltipKey: string // Changed from 'tooltipText' to 'tooltipKey' for i18n
	headerKey: string // Changed from 'headerText' to 'headerKey' for i18n
	icon: LucideIcon
}

const getSettingsTabs = (): SettingsTab[] => [
	{
		id: "api-config",
		nameKey: "apiOptions.apiProvider",
		tooltipKey: "apiOptions.apiProvider",
		headerKey: "apiOptions.apiProvider",
		icon: Webhook,
	},
	{
		id: "general",
		nameKey: "settings.label", // "General Settings" key
		tooltipKey: "settings.label",
		headerKey: "settings.label",
		icon: Settings,
	},
	{
		id: "features",
		nameKey: "features.label", // Need to add this key
		tooltipKey: "features.label",
		headerKey: "features.label",
		icon: CheckCheck,
	},
	{
		id: "browser",
		nameKey: "browser.label", // Need to add this key
		tooltipKey: "browser.label",
		headerKey: "browser.label",
		icon: SquareMousePointer,
	},
	{
		id: "terminal",
		nameKey: "terminal.label", // Need to add this key
		tooltipKey: "terminal.label",
		headerKey: "terminal.label",
		icon: SquareTerminal,
	},
	// Only show in dev mode
	...(IS_DEV
		? [
				{
					id: "debug",
					nameKey: "debug.label", // Need to add this key
					tooltipKey: "debug.label",
					headerKey: "debug.label",
					icon: FlaskConical,
				},
			]
		: []),
	{
		id: "about",
		nameKey: "about.title",
		tooltipKey: "about.title",
		headerKey: "about.title",
		icon: Info,
	},
]

type SettingsViewWrapperProps = {
	onDone: () => void
	targetSection?: string
}

const SettingsViewWrapper = ({ onDone, targetSection }: SettingsViewWrapperProps) => {
	const [isCollapsed, setIsCollapsed] = useState(false)
	const [activeTab, setActiveTab] = useState(targetSection || "general")
	const tabsContainerRef = useRef<HTMLDivElement>(null)

	// Get version from extension state
	const { version } = useExtensionState()

	// CARET MODIFICATION: Use i18n context for real-time language updates
	const { currentLanguage } = useCaretI18n()

	const SETTINGS_TABS = getSettingsTabs()

	// Handle extension messages
	useEvent("message", (event: MessageEvent) => {
		const message: ExtensionMessage = event.data
		switch (message.type) {
			case "grpc_response":
				if (message.grpc_response?.message?.key === "scrollToSettings") {
					const tabId = message.grpc_response?.message?.value
					if (tabId) {
						console.log("Opening settings tab from GRPC response:", tabId)
						// Check if the value corresponds to a valid tab ID
						const isValidTabId = SETTINGS_TABS.some((tab) => tab.id === tabId)

						if (isValidTabId) {
							setActiveTab(tabId)
						} else {
							// Fall back to general tab
							setActiveTab("general")
						}
					}
				}
				break
		}
	})

	const renderSectionHeader = useCallback(
		(tabId: string) => {
			const tab = SETTINGS_TABS.find((t) => t.id === tabId)
			return tab ? <SectionHeader>{t(tab.headerKey, "common")}</SectionHeader> : null
		},
		[SETTINGS_TABS],
	)

	const handleResetState = async () => {
		await StateServiceClient.resetState(ResetStateRequest.create())
	}

	// CARET MODIFICATION: Tab content with i18n applied
	const renderTabContent = (tabId: string) => {
		switch (tabId) {
			case "api-config":
				return <ApiConfigurationSection renderSectionHeader={renderSectionHeader} />
			case "general":
				return <CaretGeneralSettingsSection renderSectionHeader={renderSectionHeader} />
			case "features":
				return <FeatureSettingsSection renderSectionHeader={renderSectionHeader} />
			case "browser":
				return <BrowserSettingsSection renderSectionHeader={renderSectionHeader} />
			case "terminal":
				return <TerminalSettingsSection renderSectionHeader={renderSectionHeader} />
			case "debug":
				return <DebugSection renderSectionHeader={renderSectionHeader} onResetState={handleResetState} />
			case "about":
				return <AboutSection version={version} renderSectionHeader={renderSectionHeader} />
			default:
				return null
		}
	}

	return (
		<div className="size-full">
			<div className={settingsTabsContainer}>
				<TabList
					ref={tabsContainerRef}
					value={activeTab}
					onValueChange={setActiveTab}
					className={settingsTabList}
					data-compact={isCollapsed}>
					{SETTINGS_TABS.map((tab) => (
						<TabTrigger
							key={tab.id}
							value={tab.id}
							className={`${settingsTabTrigger} ${activeTab === tab.id ? settingsTabTriggerActive : ""}`}
							data-compact={isCollapsed}>
							<HeroTooltip content={t(tab.tooltipKey, "common")} placement="right">
								<div className="flex items-center gap-3 min-w-0">
									<tab.icon size={16} className="flex-shrink-0" />
									<span className="tab-label flex-1 text-left min-w-0 overflow-hidden text-ellipsis">
										{t(tab.nameKey, "common")}
									</span>
								</div>
							</HeroTooltip>
						</TabTrigger>
					))}
				</TabList>

				<TabContent className="flex-1 overflow-y-auto p-4 focus:outline-none">{renderTabContent(activeTab)}</TabContent>
			</div>

			{/* Done button */}
			<div className="flex-shrink-0 p-4 border-t border-[var(--vscode-sideBar-background)]">
				<VSCodeButton appearance="primary" onClick={onDone} className="w-full">
					{t("button.save", "common")}
				</VSCodeButton>
			</div>
		</div>
	)
}

export default SettingsViewWrapper
