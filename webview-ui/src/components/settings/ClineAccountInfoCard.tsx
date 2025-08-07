import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
<<<<<<< HEAD
import { EmptyRequest } from "@shared/proto/common"
// CARET MODIFICATION: Import Caret version for conditional rendering
import { CaretAccountInfoCard } from "@/caret/components/CaretAccountInfoCard"

export const ClineAccountInfoCard = () => {
	// CARET MODIFICATION: Use Caret version by default
	return <CaretAccountInfoCard />
=======
import { EmptyRequest } from "@shared/proto/cline/common"

export const ClineAccountInfoCard = () => {
	const { clineUser } = useClineAuth()
	const { apiConfiguration, navigateToAccount } = useExtensionState()

	let user = apiConfiguration?.clineAccountId ? clineUser : undefined

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleShowAccount = () => {
		navigateToAccount()
	}

	return (
		<div className="max-w-[600px]">
			{user ? (
				<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
					View Billing & Usage
				</VSCodeButton>
			) : (
				<div>
					<VSCodeButton onClick={handleLogin} className="mt-0">
						Sign Up with Cline
					</VSCodeButton>
				</div>
			)}
		</div>
	)
>>>>>>> upstream/main
}
