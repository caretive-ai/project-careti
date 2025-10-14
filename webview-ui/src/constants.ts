// CARET MODIFICATION: Use CARET_LOCALIZED_URLS from caret/constants/urls.ts instead of hardcoded Cline docs
// These constants are kept for backward compatibility but should use getLocalizedUrl() in components
export const LINKS = {
	DOCUMENTATION: {
		// Deprecated: Use getLocalizedUrl("REMOTE_MCP_SERVER_DOCS", language) instead
		REMOTE_MCP_SERVER_DOCS: "https://docs.caret.team/en/mcp/connecting-to-a-remote-server",
		// Deprecated: Use getLocalizedUrl("LOCAL_MCP_SERVER_DOCS", language) instead
		LOCAL_MCP_SERVER_DOCS: "https://docs.caret.team/en/mcp/configuring-mcp-servers#editing-mcp-settings-files",
	},
}
