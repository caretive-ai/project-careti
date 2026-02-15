import CaretiAccountView from "@careti/components/CaretiAccountView"
import type { Boolean, EmptyRequest } from "@shared/proto/cline/common"
import { useEffect } from "react"
import PersonaTemplateSelector from "./careti/components/PersonaTemplateSelector"
// CARETI MODIFICATION: Add i18n support for the entire app
import CaretiI18nProvider from "./careti/context/CaretiI18nContext"
// CARETI MODIFICATION: Import CaretiStateContextProvider for persona system
import { CaretiStateContextProvider, useCaretiState } from "./careti/context/CaretiStateContext"
import AccountView from "./components/account/AccountView"
import ChatView from "./components/chat/ChatView"
import HistoryView from "./components/history/HistoryView"
import McpView from "./components/mcp/configuration/McpConfigurationView"
import SettingsView from "./components/settings/SettingsView"
import WelcomeView from "./components/welcome/WelcomeView"
import { useCaretiAuth } from "./context/CaretiAuthContext"
import { useClineAuth } from "./context/ClineAuthContext"
import { useExtensionState } from "./context/ExtensionStateContext"
import { Providers } from "./Providers"
import { UiServiceClient } from "./services/grpc-client"
// CARETI MODIFICATION: Import Avatar and Navbar for standalone mode
import { AvatarContainer } from "./components/avatar"
import { Navbar } from "./components/menu/Navbar"
import { IS_STANDALONE } from "./config/platform.config"

const AppContent = () => {
	const {
		didHydrateState,
		showWelcome,
		shouldShowAnnouncement,
		showMcp,
		mcpTab,
		showSettings,
		showHistory,
		showAccount,
		featureConfig,
		showAnnouncement,
		setShowAnnouncement,
		setShouldShowAnnouncement,
		closeMcpView,
		navigateToHistory,
		hideSettings,
		hideHistory,
		hideAccount,
		hideAnnouncement,
	} = useExtensionState()

	const { showPersonaSelector } = useCaretiState()
	const { clineUser, organizations, activeOrganization } = useClineAuth()
	const { caretUser } = useCaretiAuth()

	const isCaret = caretUser !== null
	const accountOrganizations = caretUser ? null : organizations
	const accountActiveOrganization = caretUser ? null : activeOrganization

	useEffect(() => {
		if (shouldShowAnnouncement) {
			setShowAnnouncement(true)

			// Use the gRPC client instead of direct WebviewMessage
			UiServiceClient.onDidShowAnnouncement({} as EmptyRequest)
				.then((response: Boolean) => {
					setShouldShowAnnouncement(response.value)
				})
				.catch((error) => {
					console.error("Failed to acknowledge announcement:", error)
				})
		}
	}, [shouldShowAnnouncement, setShouldShowAnnouncement, setShowAnnouncement])

	if (!didHydrateState) {
		return null
	}

	if (showWelcome) {
		return <WelcomeView />
	}

	if (showPersonaSelector) {
		// onSelectPersona는 필수 prop이지만, 여기서는 선택 후 화면 전환만 하면 되므로 빈 함수를 전달합니다.
		return <PersonaTemplateSelector onSelectPersona={() => {}} />
	}

	// CARETI MODIFICATION: Check if overlay view (settings/history/etc.) is showing
	const isOverlayShowing = showSettings || showHistory || showMcp || (showAccount && featureConfig?.showAccountUI !== false)

	return (
		<div className="flex h-screen w-full flex-col">
			{/* CARETI MODIFICATION: Avatar and Navbar always visible at top in standalone mode */}
			{IS_STANDALONE && (
				<div className="flex-none">
					<AvatarContainer state="idle" />
					<Navbar />
				</div>
			)}
			{/* Content area below avatar */}
			<div className="flex-1 overflow-hidden relative">
				{showSettings && <SettingsView onDone={hideSettings} />}
				{showHistory && <HistoryView onDone={hideHistory} />}
				{showMcp && <McpView initialTab={mcpTab} onDone={closeMcpView} />}
				{showAccount &&
					featureConfig?.showAccountUI !== false && // CARETI MODIFICATION: gate account UI by feature flag
					(isCaret ? (
						<CaretiAccountView caretUser={caretUser} onDone={hideAccount} />
					) : (
						<AccountView
							activeOrganization={accountActiveOrganization}
							clineUser={clineUser}
							onDone={hideAccount}
							organizations={accountOrganizations}
						/>
					))}
				{/* Do not conditionally load ChatView, it's expensive and there's state we don't want to lose (user input, disableInput, askResponse promise, etc.) */}
				<ChatView
					hideAnnouncement={hideAnnouncement}
					isHidden={isOverlayShowing}
					showAnnouncement={showAnnouncement}
					showHistoryView={navigateToHistory}
				/>
			</div>
		</div>
	)
}

const App = () => {
	return (
		<Providers>
			{/* CARETI MODIFICATION: Wrap app with i18n context for multilingual support */}
			<CaretiI18nProvider defaultLanguage="en">
				{/* CARETI MODIFICATION: Wrap with CaretiStateContextProvider for persona system */}
				<CaretiStateContextProvider>
					<AppContent />
				</CaretiStateContextProvider>
			</CaretiI18nProvider>
		</Providers>
	)
}

export default App
