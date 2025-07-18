import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useFirebaseAuth } from "@/context/FirebaseAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
import WebviewLogger from "@/caret/utils/webview-logger"
import { t } from "@/caret/utils/i18n"

const logger = new WebviewLogger("[CARET-UI-ACCOUNT]")

export const CaretAccountInfoCard = () => {
	const { user: firebaseUser, handleSignOut } = useFirebaseAuth()
	const { userInfo, apiConfiguration, navigateToAccount } = useExtensionState()

	let user = apiConfiguration?.caretApiKey ? firebaseUser || userInfo : undefined //clineApiKey -> caretApiKey

	const handleLogin = () => {
		logger.info("User clicked Caret sign up button")
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) => {
			logger.error("Failed to get login URL:", err)
			console.error("Failed to get login URL:", err)
		})
	}

	const handleShowAccount = () => {
		logger.info("User clicked View Billing & Usage")
		navigateToAccount()
	}

	return (
		<div className="max-w-[600px]">
			{user ? (
				<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
					{t("account.viewBillingUsage", "common")}
				</VSCodeButton>
			) : (
				<div>
					<VSCodeButton onClick={handleLogin} className="mt-0">
						{t("account.signUpWithCaret", "common")}
					</VSCodeButton>
				</div>
			)}
		</div>
	)
}
