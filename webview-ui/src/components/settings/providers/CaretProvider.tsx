import { EmptyRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { ApiKeyField } from "../common/ApiKeyField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface CaretProviderProps {
	currentMode: Mode
	isPopup?: boolean
	showModelOptions: boolean
}

const CaretProvider = ({ currentMode, isPopup, showModelOptions }: CaretProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get Caret login URL:", err),
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

				<div style={{ textAlign: "center", color: "var(--vscode-descriptionForeground)", fontSize: 12 }}>
					{t("providers.caret.or", "settings")}
				</div>

				<ApiKeyField
					initialValue={apiConfiguration?.caretApiKey || ""}
					onChange={(value) => handleFieldChange("caretApiKey", value)}
					providerName="Caret"
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

			<p style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)", margin: 0 }}>
				{t("providers.caret.visit", "settings")}{" "}
				<VSCodeLink href="https://caret.team">caret.team</VSCodeLink>{" "}
				{t("providers.caret.getApiKey", "settings")}
			</p>
		</div>
	)
}

export default CaretProvider
