import CaretAccountView from "@careti/components/CaretAccountView"
import type { Boolean, EmptyRequest } from "@shared/proto/cline/common"
import { useEffect } from "react"
import PersonaTemplateSelector from "./careti/components/PersonaTemplateSelector"
// CARETI MODIFICATION: Add i18n support for the entire app
import CaretiI18nProvider from "./careti/context/CaretI18nContext"
// CARETI MODIFICATION: Import CaretStateContextProvider for persona system
import { CaretStateContextProvider, useCaretState } from "./careti/context/CaretStateContext"
import AccountView from "./components/account/AccountView"
import ChatView from "./components/chat/ChatView"
import HistoryView from "./components/history/HistoryView"
import McpView from "./components/mcp/configuration/McpConfigurationView"
import SettingsView from "./components/settings/SettingsView"
import WelcomeView from "./components/welcome/WelcomeView"
import { useCaretAuth } from "./context/CaretAuthContext"
import { useClineAuth } from "./context/ClineAuthContext"
import { useExtensionState } from "./context/ExtensionStateContext"
import { Providers } from "./Providers"
import { UiServiceClient } from "./services/grpc-client"

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

	const { showPersonaSelector } = useCaretState()
	const { clineUser, organizations, activeOrganization } = useClineAuth()
	const { caretUser } = useCaretAuth()

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

	return (
		<div className="flex h-screen w-full flex-col">
			{showSettings && <SettingsView onDone={hideSettings} />}
			{showHistory && <HistoryView onDone={hideHistory} />}
			{showMcp && <McpView initialTab={mcpTab} onDone={closeMcpView} />}
			{showAccount &&
				featureConfig?.showAccountUI !== false && // CARETI MODIFICATION: gate account UI by feature flag
				(isCaret ? (
					<CaretAccountView caretUser={caretUser} onDone={hideAccount} />
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
				isHidden={showSettings || showHistory || showMcp || (showAccount && featureConfig?.showAccountUI !== false)}
				showAnnouncement={showAnnouncement}
				showHistoryView={navigateToHistory}
			/>
		</div>
	)
}

const App = () => {
	return (
		<Providers>
			{/* CARETI MODIFICATION: Wrap app with i18n context for multilingual support */}
			<CaretiI18nProvider defaultLanguage="en">
				{/* CARETI MODIFICATION: Wrap with CaretStateContextProvider for persona system */}
				<CaretStateContextProvider>
					<AppContent />
				</CaretStateContextProvider>
			</CaretiI18nProvider>
		</Providers>
	)
}

export default App
