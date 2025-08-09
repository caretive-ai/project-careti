import React from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { t } from "../utils/i18n"
import ApiOptions from "../../components/settings/ApiOptions"
import { vscode } from "../../utils/vscode"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { normalizeApiConfiguration, ApiProvider } from "@shared/api"

interface CaretApiSetupProps {
	onSubmit: () => void
	onBack: () => void
	disabled?: boolean
	errorMessage?: string
}

const CaretApiSetup: React.FC<CaretApiSetupProps> = ({ onSubmit, onBack, disabled = false, errorMessage }) => {
	const { apiConfiguration } = useExtensionState()
	const { selectedProvider } = normalizeApiConfiguration(apiConfiguration)

	const containerStyle = {
		maxWidth: "600px",
		margin: "0 auto",
		padding: "0",
	}

	const backButtonStyle = {
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
		color: "var(--vscode-textLink-foreground)",
		textDecoration: "none",
		margin: "5px 0",
		cursor: "pointer",
	}

	return (
		<div className="caret-api-setup" style={containerStyle}>
			{/* Header with Back Button and Title */}
			<div style={headerStyle}>
				<VSCodeButton appearance="secondary" onClick={onBack}>
					{t("apiSetup.backButton", "welcome")}
				</VSCodeButton>
				<div style={{ textAlign: "center" }}>
					{" "}
					<h2 style={titleStyle}>{t("apiSetup.title", "welcome")}</h2>{" "}
				</div>
			</div>

			{/* Description */}
			<p style={descriptionStyle}>{t("apiSetup.description", "welcome")}</p>

			{/* Support Links */}
			<div style={linkStyle}>
				<p style={{ margin: "0 0 10px 0", fontWeight: "600" }}>{t("apiSetup.instructions", "welcome")}</p>
				<a
					style={linkItemStyle}
					onClick={() => {
						vscode.postMessage({
							type: "openExternalLink",
							link: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.mdx",
						})
					}}>
					• {t("apiSetup.supportLinks.llmList", "welcome")}
				</a>
				<a
					style={linkItemStyle}
					onClick={() => {
						vscode.postMessage({ type: "openExternalLink", link: "https://blog.naver.com/fstory97/223887376667" })
					}}>
					• {t("apiSetup.supportLinks.geminiCredit", "welcome")}
				</a>
			</div>

			{/* API Configuration Section */}
			<div style={apiSectionStyle}>
				{/* API Options */}
				<ApiOptions showModelOptions={true} />

				{/* Submit Button */}
				{selectedProvider !== "caret" && (
					<VSCodeButton onClick={onSubmit} disabled={disabled} appearance="primary" style={submitButtonStyle}>
						{t("apiSetup.saveButton", "welcome")}
					</VSCodeButton>
				)}

				{/* Error Message */}
				{errorMessage && <div style={errorStyle}>{errorMessage}</div>}
			</div>

			{/* Help Section */}
			<div style={helpSectionStyle}>
				<h4 style={{ marginBottom: "15px" }}>{t("apiSetup.help.title", "welcome")}</h4>
				<VSCodeButton
					appearance="secondary"
					onClick={() => {
						vscode.postMessage({ type: "openExternalLink", link: "https://docs.caret.team" })
					}}>
					{t("apiSetup.help.button", "welcome")}
				</VSCodeButton>
			</div>
		</div>
	)
}

export default CaretApiSetup
