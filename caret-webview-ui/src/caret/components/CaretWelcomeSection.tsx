import React from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { t } from "../utils/i18n"
import { useCurrentLanguage } from "../hooks/useCurrentLanguage"

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
	const currentLanguage = useCurrentLanguage()

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
			<h3 style={{ fontSize: "1rem", marginBottom: "8px" }}>{t(headerKey, "welcome", currentLanguage)}</h3>
			{allowHtml ? (
				<p dangerouslySetInnerHTML={{ __html: t(bodyKey, "welcome", currentLanguage) }} />
			) : (
				<p>{t(bodyKey, "welcome", currentLanguage)}</p>
			)}
			{children}
			{buttonConfig && (
				<VSCodeButton
					appearance={buttonConfig.appearance || "secondary"}
					onClick={buttonConfig.handler}
					disabled={buttonConfig.disabled || false}
					style={{ width: "100%", marginTop: "10px" }}>
					{t(buttonConfig.textKey, "welcome", currentLanguage)}
				</VSCodeButton>
			)}
		</div>
	)
}

export default CaretWelcomeSection
