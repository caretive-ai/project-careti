import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect } from "react"
import { getLocalizedUrl, type SupportedLanguage } from "@/caret/constants/urls"
import { useCaretI18n } from "@/caret/hooks/useCaretI18n"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { handleLogin, handleLogout } from "../CaretAuthHandler"
import { ApiKeyField } from "../common/ApiKeyField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface CaretProviderProps {
	currentMode: Mode
}

const CaretProvider = () => {
	const { apiConfiguration } = useExtensionState()
	console.log("apiConfiguration=====>", apiConfiguration)
	// const caretUser = apiConfiguration?.caretUserProfile
	const caretUser = {
		id: "123",
		name: "John Doe",
		displayName: "John Doe1",
		email: "john.doe@example.com",
	}
	// const caretApiKey = apiConfiguration?.caretApiKey
	const caretApiKey = "jikime-api-key"

	const { handleFieldChange } = useApiConfigurationHandlers()
	const { currentLanguage } = useCaretI18n()

	useEffect(() => {
		console.log("caretUser=====>", caretUser)
		handleFieldChange("caretUserProfile", caretUser)
		handleFieldChange("caretApiKey", caretApiKey)
		handleFieldChange(
			"caretAuthToken",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJZTFA3eTRzQUoiLCJ0b2tlblR5cGUiOiJhY2Nlc3MiLCJyb2xlIjoidXNlciIsImV4cCI6MTc4OTYzMzEzNiwiaWF0IjoxNzU4MDk3MTM2fQ.j8c0sdkw7TGcateRelvT6Y96zZFPriR_Te6GYgBnvSY",
		)
	}, [handleFieldChange, caretUser, caretApiKey])

	// Show profile page if authenticated
	if (caretUser) {
		const name = caretUser.name || caretUser.displayName
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
					{name && (
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<strong style={{ fontSize: 14, color: "var(--vscode-foreground)" }}>{name}</strong>
						</div>
					)}
					<div style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)" }}>{caretUser.email}</div>
					{typeof caretUser.id === "string" && (
						<div style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)" }}>ID: {caretUser.id}</div>
					)}
				</div>

				{/* Actions */}
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<VSCodeButton appearance="secondary" className="w-full" onClick={handleLogout} style={{ minWidth: "120px" }}>
						{t("providers.caret.logout", "settings")}
					</VSCodeButton>

					<ApiKeyField
						initialValue={caretApiKey || ""}
						onChange={(value) => handleFieldChange("caretApiKey", value)}
						providerName={t("providers.caret.name", "settings")}
						signupUrl="https://caret.team"
					/>
				</div>

				{caretApiKey && (
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
					initialValue={caretApiKey || ""}
					onChange={(value) => handleFieldChange("caretApiKey", value)}
					providerName={t("providers.caret.name", "settings")}
					signupUrl="https://caret.team"
				/>
			</div>

			{caretApiKey && (
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
