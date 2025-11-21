import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useRef } from "react"
import { UiServiceClient } from "@/services/grpc-client"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"
import { CaretWebviewLogger } from "../utils/webview-logger"

const logger = new CaretWebviewLogger("CaretWelcomeSection")

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
	const sectionRef = useRef<HTMLDivElement>(null)

	const sectionStyle = {
		marginBottom: "10px",
		padding: "12px",
		border: "1px solid var(--vscode-settings-headerBorder)",
		borderRadius: "8px",
		backgroundColor: "var(--vscode-sideBar-background)",
		fontSize: "0.85rem",
	}

	// Handle external links with data-external-url attribute
	useEffect(() => {
		if (!allowHtml || !sectionRef.current) return

		const handleLinkClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement
			if (target.tagName === "A" && target.hasAttribute("data-external-url")) {
				event.preventDefault()
				const url = target.getAttribute("data-external-url")
				if (url) {
					UiServiceClient.openUrl({ value: url }).catch((error) => {
						logger.error(`Failed to open external link ${url}:`, error)
					})
				}
			}
		}

		const section = sectionRef.current
		section.addEventListener("click", handleLinkClick)

		return () => {
			section.removeEventListener("click", handleLinkClick)
		}
	}, [allowHtml, bodyKey, currentLanguage])

	return (
		<div className={`caret-welcome-section ${className}`} ref={sectionRef} style={sectionStyle}>
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
