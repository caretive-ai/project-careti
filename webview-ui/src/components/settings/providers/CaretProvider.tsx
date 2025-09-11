import { EmptyRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretAccountServiceClient } from "@/services/grpc-client"
import { ApiKeyField } from "../common/ApiKeyField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface CaretProviderProps {
	currentMode: Mode
}

const CaretProvider = () => {
	const { apiConfiguration, caretUser } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	// Check authentication status
	useEffect(() => {
		setIsAuthenticated(!!caretUser)
	}, [caretUser])

	const handleLogin = () => {
		CaretAccountServiceClient.caretAccountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error(t("providers.caret.loginError", "settings"), err),
		)
	}

	const handleLogout = () => {
		CaretAccountServiceClient.caretAccountLogoutClicked(EmptyRequest.create()).catch((err) =>
			console.error("Logout error:", err),
		)
	}

	// Show profile page if authenticated
	if (isAuthenticated && caretUser) {
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
				<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
					{t("providers.caret.profile", "settings")}
				</p>

				{/* User Profile Section */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 8,
						padding: 12,
						backgroundColor: "var(--vscode-editor-background)",
						borderRadius: 4,
						border: "1px solid var(--vscode-widget-border)",
					}}>
					{caretUser.displayName && (
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<strong style={{ fontSize: 14, color: "var(--vscode-foreground)" }}>{caretUser.displayName}</strong>
						</div>
					)}
					<div style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)" }}>{caretUser.email}</div>
					{typeof caretUser.uid === "string" && (
						<div style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)" }}>ID: {caretUser.uid}</div>
					)}
				</div>

				{/* Actions */}
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<VSCodeButton appearance="secondary" className="w-full" onClick={handleLogout} style={{ minWidth: "120px" }}>
						{t("providers.caret.logout", "settings")}
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
			</div>
		)
	}

	// Show login page if not authenticated
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

			<p style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)", margin: 0 }}></p>
		</div>
	)
}

export default CaretProvider
