import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"

interface ButtonConfig {
	textKey: string
	handler: () => void
	appearance?: "primary" | "secondary"
	disabled?: boolean
}

interface CaretWelcomeSectionProps {
	headerKey: string
	bodyKey: string
	buttonConfig?: ButtonConfig
	className?: string
	children?: React.ReactNode
	allowHtml?: boolean
}

const CaretWelcomeSection: React.FC<CaretWelcomeSectionProps> = ({
	headerKey,
	bodyKey,
	buttonConfig,
	className = "",
	children,
	allowHtml = false,
}) => {
	const { currentLanguage } = useCaretI18n()

	const sectionStyle = {
		marginBottom: "10px",
		padding: "12px",
		border: "1px solid var(--vscode-settings-headerBorder)",
		borderRadius: "8px",
		backgroundColor: "var(--vscode-sideBar-background)",
		fontSize: "0.85rem",
	}

	return (
		<div className={`caret-welcome-section ${className}`} style={sectionStyle}>
			{headerKey && <h3 style={{ fontSize: "1rem", marginBottom: "8px" }}>{t(headerKey, "welcome")}</h3>}
			{bodyKey &&
				(allowHtml ? <p dangerouslySetInnerHTML={{ __html: t(bodyKey, "welcome") }} /> : <p>{t(bodyKey, "welcome")}</p>)}
			{children}
			{buttonConfig && (
				<VSCodeButton
					appearance={buttonConfig.appearance || "secondary"}
					disabled={buttonConfig.disabled || false}
					onClick={buttonConfig.handler}
					style={{ width: "100%", marginTop: "10px" }}>
					{t(buttonConfig.textKey, "welcome")}
				</VSCodeButton>
			)}
		</div>
	)
}

export default CaretWelcomeSection
