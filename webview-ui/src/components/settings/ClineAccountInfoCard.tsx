import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import { useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"

export const ClineAccountInfoCard = () => {
	const { clineUser } = useClineAuth()
	const { apiConfiguration, navigateToAccount } = useExtensionState()

	const user = apiConfiguration?.clineAccountId ? clineUser : undefined

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error(t("clineAccountInfoCard.loginError", "settings"), err),
		)
	}

	const handleShowAccount = () => {
		navigateToAccount()
	}

	return (
		<div className="max-w-[600px]">
			{user ? (
				<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
					{t("clineAccountInfoCard.viewBillingAndUsage", "settings")}
				</VSCodeButton>
			) : (
				<div>
					<VSCodeButton className="mt-0" onClick={handleLogin}>
						{t("clineAccountInfoCard.signUpWithCline", "settings")}
					</VSCodeButton>
				</div>
			)}
		</div>
	)
}
