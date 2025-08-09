import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useFirebaseAuth } from "@/context/FirebaseAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
// CARET MODIFICATION: Import Caret version for conditional rendering
import { CaretAccountInfoCard } from "@/caret/components/CaretAccountInfoCard"

export const ClineAccountInfoCard = () => {
	// CARET MODIFICATION: Use Caret version by default
	return <CaretAccountInfoCard />
}
