import { EmptyRequest } from "@shared/proto/cline/common"
import { memo } from "react"
import { t } from "@/careti/utils/i18n"
// CARETI MODIFICATION: Use CaretAccountServiceClient for Careti auth flow
import { CaretAccountServiceClient } from "@/services/grpc-client"

const AccountOptions = () => {
	const handleAccountClick = () => {
		// CARETI MODIFICATION: Use caretAccountLoginClicked instead of accountLoginClicked
		CaretAccountServiceClient.caretAccountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error(t("account.failedToGetLoginUrl", "common"), err),
		)
	}

	// Call handleAccountClick immediately when component mounts
	handleAccountClick()

	return null // This component doesn't render anything
}

export default memo(AccountOptions)
