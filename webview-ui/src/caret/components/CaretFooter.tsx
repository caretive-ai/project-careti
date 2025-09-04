import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import type { CSSProperties } from "react"
import React from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { t } from "../utils/i18n"

const CaretFooter: React.FC = () => {
	const { version } = useExtensionState()

	const footerStyle: CSSProperties = {
		marginTop: "20px",
		padding: "20px",
		borderTop: "1px solid var(--vscode-panel-border)",
		backgroundColor: "var(--vscode-panel-background)",
		fontSize: "0.8rem",
		color: "var(--vscode-descriptionForeground)",
		textAlign: "center",
	}

	const linkStyle: CSSProperties = {
		margin: "0 5px",
	}

	return (
		<footer style={footerStyle}>
			<div style={{ marginBottom: "15px" }}>
				<p style={{ margin: "2px 0" }}>
					{t("footer.about.description", "welcome")}{" "}
					<VSCodeLink href="https://github.com/aicoding-caret/caret" style={{ ...linkStyle, display: "inline" }}>
						{t("footer.about.link", "welcome")}
					</VSCodeLink>
				</p>
			</div>
			<div>
				{/* 링크들 */}
				<div style={{ marginBottom: "10px" }}>
					<VSCodeLink href="https://github.com/aicoding-caret/caret" style={linkStyle}>
						{t("footer.links.caretGithub", "welcome")}
					</VSCodeLink>
					<span> • </span>
					<VSCodeLink href="https://caret.team" style={linkStyle}>
						{t("footer.links.caretService", "welcome")}
					</VSCodeLink>
					<span> • </span>
					<VSCodeLink href="https://caretive.ai" style={linkStyle}>
						{t("footer.links.caretiveInc", "welcome")}
					</VSCodeLink>
					<span> • </span>
					<VSCodeLink href="mailto:support@caretive.ai" style={linkStyle}>
						{t("footer.links.support", "welcome")}
					</VSCodeLink>
				</div>

				{/* 저작권 및 버전 정보 */}
				<div>
					<p style={{ margin: "2px 0" }}>
						<small>
							{t("footer.copyright.builtWith", "welcome")} | v{version}
						</small>
					</p>
				</div>
			</div>
		</footer>
	)
}

export default CaretFooter
