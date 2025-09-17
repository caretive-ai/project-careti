import { EmptyRequest } from "@shared/proto/cline/common"
import { t } from "@/caret/utils/i18n"
import { CaretAccountServiceClient } from "@/services/grpc-client"

export const handleLogin = () => {
	CaretAccountServiceClient.caretAccountLoginClicked(EmptyRequest.create()).catch((err) =>
		console.error(t("providers.caret.loginError", "settings"), err),
	)
}

export const handleLogout = () => {
	CaretAccountServiceClient.caretAccountLogoutClicked(EmptyRequest.create()).catch((err) => console.error("Logout error:", err))
}
