import type { Boolean, EmptyRequest } from "@shared/proto/cline/common"
import { useEffect } from "react"
import AccountView from "./components/account/AccountView"
import ChatView from "./components/chat/ChatView"
import HistoryView from "./components/history/HistoryView"
import McpView from "./components/mcp/configuration/McpConfigurationView"
import SettingsView from "./components/settings/SettingsView"
import WelcomeView from "./components/welcome/WelcomeView"
import { useClineAuth } from "./context/ClineAuthContext"
import { useExtensionState } from "./context/ExtensionStateContext"
import { Providers } from "./Providers"
<<<<<<< HEAD
import { Boolean, EmptyRequest } from "@shared/proto/common"
import { WebviewProviderType } from "@shared/webview/types"
import { setGlobalUILanguage } from "./caret/utils/i18n"
import { type SupportedLanguage } from "./caret/constants/urls"
=======
import { UiServiceClient } from "./services/grpc-client"
>>>>>>> upstream/main

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
		showAnnouncement,
		setShowAnnouncement,
		setShouldShowAnnouncement,
		closeMcpView,
		navigateToHistory,
		hideSettings,
		hideHistory,
		hideAccount,
		hideAnnouncement,
		uiLanguage,
	} = useExtensionState()

<<<<<<< HEAD
	// CARET MODIFICATION: Added useEffect to set global UI language based on context state (uiLanguage).
	// This ensures that when the uiLanguage changes in ExtensionStateContext (e.g., via settings),
	// the i18n instance used throughout the webview is updated to reflect the new language.
	useEffect(() => {
		if (uiLanguage) {
			setGlobalUILanguage(uiLanguage as SupportedLanguage)
		}
	}, [uiLanguage])
=======
	const { clineUser, organizations, activeOrganization } = useClineAuth()
>>>>>>> upstream/main

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

	return (
		<div className="flex h-screen w-full flex-col">
			{showSettings && <SettingsView onDone={hideSettings} />}
			{showHistory && <HistoryView onDone={hideHistory} />}
			{showMcp && <McpView initialTab={mcpTab} onDone={closeMcpView} />}
			{showAccount && (
				<AccountView
					onDone={hideAccount}
					clineUser={clineUser}
					organizations={organizations}
					activeOrganization={activeOrganization}
				/>
			)}
			{/* Do not conditionally load ChatView, it's expensive and there's state we don't want to lose (user input, disableInput, askResponse promise, etc.) */}
			<ChatView
				showHistoryView={navigateToHistory}
				isHidden={showSettings || showHistory || showMcp || showAccount}
				showAnnouncement={showAnnouncement}
				hideAnnouncement={hideAnnouncement}
			/>
		</div>
	)
}

const App = () => {
	return (
		<Providers>
			<AppContent />
		</Providers>
	)
}

export default App
