import { Trans, useTranslation } from "react-i18next"

const McpSubmitCard = () => {
	const { t } = useTranslation()
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "12px",
				padding: "15px",
				margin: "20px",
				backgroundColor: "var(--vscode-textBlockQuote-background)",
				borderRadius: "6px",
			}}>
			{/* Icon */}
			<i className="codicon codicon-add" style={{ fontSize: "18px" }} />

			{/* Content */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "4px",
					textAlign: "center",
					maxWidth: "480px",
				}}>
				<h3
					style={{
						margin: 0,
						fontSize: "14px",
						fontWeight: 600,
						color: "var(--vscode-foreground)",
					}}>
					{t("mcp.submitMcpServer", "Submit MCP Server")}
				</h3>
				<p style={{ fontSize: "13px", margin: 0, color: "var(--vscode-descriptionForeground)" }}>
					<Trans
						components={{
							link: <a href="https://github.com/cline/mcp-marketplace"></a>,
						}}
						i18nKey="mcp.submitDescription">
						Help others discover great MCP servers by submitting an issue to{" "}
						<a href="https://github.com/cline/mcp-marketplace">github.com/cline/mcp-marketplace</a>
					</Trans>
				</p>
			</div>
		</div>
	)
}

export default McpSubmitCard
