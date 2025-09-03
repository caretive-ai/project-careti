import { EmptyRequest } from "@shared/proto/cline/common"
import { memo } from "react"
import { t } from "@/caret/utils/i18n"
import { AccountServiceClient } from "@/services/grpc-client"

const AccountOptions = () => {
	const handleAccountClick = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error(t("account.failedToGetLoginUrl"), err),
		)
	}

	// Call handleAccountClick immediately when component mounts
	handleAccountClick()

	return null // This component doesn't render anything
}

export default memo(AccountOptions)
