import { EmptyRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CARET_LOCALIZED_URLS, getLocalizedUrl, type SupportedLanguage } from "@/caret/constants/urls"
import { useCaretI18n } from "@/caret/hooks/useCaretI18n"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretAccountServiceClient } from "@/services/grpc-client"
import { ApiKeyField } from "../common/ApiKeyField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface CaretProviderProps {
	currentMode: Mode
}

const CaretProvider = () => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()
	const { currentLanguage } = useCaretI18n()

	const handleLogin = () => {
		CaretAccountServiceClient.caretAccountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error(t("providers.caret.loginError", "settings"), err),
		)
	}

	// Use caretApiKey field directly (no mode-specific variants needed)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.caret.description", "settings")}
			</p>

			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<VSCodeButton appearance="primary" className="w-full" onClick={handleLogin} style={{ minWidth: "120px" }}>
					{t("providers.caret.login", "settings")}
				</VSCodeButton>

				<ApiKeyField
					initialValue={apiConfiguration?.caretApiKey || ""}
					onChange={(value) => handleFieldChange("caretApiKey", value)}
					providerName={t("providers.caret.name", "settings")}
					signupUrl="https://caret.team"
				/>
			</div>

			{apiConfiguration?.caretApiKey && (
				<p style={{ fontSize: 12, color: "var(--vscode-foreground)", margin: 0 }}>
					{t("providers.caret.apiKeyConfigured", "settings")}
				</p>
			)}

			<div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
				<p style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)", margin: 0 }}>
					{t("providers.caret.features", "settings")}
				</p>
				<ul style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)", margin: 0, paddingLeft: 16 }}>
					<li>{t("providers.caret.feature1", "settings")}</li>
					<li>{t("providers.caret.feature2", "settings")}</li>
					<li>{t("providers.caret.feature3", "settings")}</li>
					<li>{t("providers.caret.feature4", "settings")}</li>
				</ul>
			</div>

			<div style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)", margin: "8px 0 0 0" }}>
				<p style={{ margin: 0 }}>
					{t("account.byContining", "common")}{" "}
					<VSCodeLink
						className="text-inherit"
						href={getLocalizedUrl("CARETIVE_PRIVACY", currentLanguage as SupportedLanguage)}>
						{t("account.privacyPolicy", "common")}
					</VSCodeLink>{" "}
					{t("common.and", "common")}{" "}
					<VSCodeLink
						className="text-inherit"
						href={getLocalizedUrl("YOUTH_PROTECTION", currentLanguage as SupportedLanguage)}>
						{t("account.youthProtection", "common")}
					</VSCodeLink>
				</p>
			</div>
		</div>
	)
}

export default CaretProvider
