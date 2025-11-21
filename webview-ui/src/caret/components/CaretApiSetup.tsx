import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import ApiOptions from "../../components/settings/ApiOptions"
import { getLocalizedUrl } from "../constants/urls"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"

interface CaretApiSetupProps {
	onSubmit: () => void
	onBack: () => void
	disabled?: boolean
	errorMessage?: string
}

const CaretApiSetup: React.FC<CaretApiSetupProps> = ({ onSubmit, onBack, disabled = false, errorMessage }) => {
	const { apiConfiguration, mode } = useExtensionState()
	const { currentLanguage } = useCaretI18n()
	const { selectedProvider } = normalizeApiConfiguration(apiConfiguration, mode)

	const containerStyle = {
		maxWidth: "600px",
		margin: "0 auto",
		padding: "0",
	}

	const _backButtonStyle = {
		marginBottom: "30px",
		padding: "8px 16px",
	}

	const apiSectionStyle = {
		marginBottom: "30px",
		padding: "25px",
		border: "1px solid var(--vscode-inputValidation-infoBorder)",
		borderRadius: "12px",
		backgroundColor: "var(--vscode-sideBar-background)",
	}

	const submitButtonStyle = {
		width: "calc(100% - 20px)",
		padding: "12px",
		fontSize: "0.95rem",
		fontWeight: "500",
		marginTop: "20px",
		marginRight: "20px",
	}

	const errorStyle = {
		marginTop: "20px",
		padding: "15px",
		backgroundColor: "var(--vscode-inputValidation-errorBackground)",
		border: "1px solid var(--vscode-inputValidation-errorBorder)",
		borderRadius: "8px",
		color: "var(--vscode-inputValidation-errorForeground)",
	}

	const helpSectionStyle = {
		marginTop: "30px",
		padding: "20px",
		border: "1px solid var(--vscode-panel-border)",
		borderRadius: "12px",
		backgroundColor: "var(--vscode-panel-background)",
		textAlign: "center" as const,
	}

	const headerStyle = {
		display: "flex",
		alignItems: "center",
		marginBottom: "30px",
		gap: "20px",
	}

	const titleStyle = {
		margin: 0,
		fontSize: "1.2rem",
		fontWeight: "500",
	}

	const descriptionStyle = {
		marginBottom: "20px",
		lineHeight: "1.6",
		color: "var(--vscode-descriptionForeground)",
	}

	const linkStyle = {
		marginTop: "15px",
		padding: "15px",
		backgroundColor: "var(--vscode-panel-background)",
		border: "1px solid var(--vscode-panel-border)",
		borderRadius: "8px",
	}

	const linkItemStyle = {
		display: "block",
		margin: "5px 0",
	}

	return (
		<div className="caret-api-setup" style={containerStyle}>
			{/* Header with Back Button and Title */}
			<div style={headerStyle}>
				<VSCodeButton appearance="secondary" onClick={onBack}>
					{t("apiSetup.backButton", "welcome")}
				</VSCodeButton>
				<div style={{ textAlign: "center" }}>
					<h2 style={titleStyle}>{t("apiSetup.title", "welcome")}</h2>
				</div>
			</div>

			{/* Description */}
			<p style={descriptionStyle}>{t("apiSetup.description", "welcome")}</p>

			{/* Support Links */}
			<div style={linkStyle}>
				<p style={{ margin: "0 0 10px 0", fontWeight: "600" }}>{t("apiSetup.instructions", "welcome")}</p>
				<div style={linkItemStyle}>
					•{" "}
					<VSCodeLink href={getLocalizedUrl("SUPPORT_MODEL_LIST", currentLanguage)}>
						{t("apiSetup.supportLinks.llmList", "welcome")}
					</VSCodeLink>
				</div>
				<div style={linkItemStyle}>
					•{" "}
					<VSCodeLink href={getLocalizedUrl("GEMINI_CREDIT_GUIDE", currentLanguage)}>
						{t("apiSetup.supportLinks.geminiCredit", "welcome")}
					</VSCodeLink>
				</div>
			</div>

			{/* API Configuration Section */}
			<div style={apiSectionStyle}>
				{/* API Options */}
				<ApiOptions currentMode={mode} showModelOptions={true} />

				{/* Submit Button */}
				{selectedProvider !== "caret" && (
					<VSCodeButton appearance="primary" disabled={disabled} onClick={onSubmit} style={submitButtonStyle}>
						{t("apiSetup.saveButton", "welcome")}
					</VSCodeButton>
				)}

				{/* Error Message */}
				{errorMessage && <div style={errorStyle}>{errorMessage}</div>}
			</div>

			{/* Help Section */}
			<div style={helpSectionStyle}>
				<h4 style={{ marginBottom: "15px" }}>{t("apiSetup.help.title", "welcome")}</h4>
				<VSCodeLink href="https://docs.caret.team">
					<VSCodeButton appearance="secondary">{t("apiSetup.help.button", "welcome")}</VSCodeButton>
				</VSCodeLink>
			</div>
		</div>
	)
}

export default CaretApiSetup
