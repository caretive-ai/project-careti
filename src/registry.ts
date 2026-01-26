import { name, publisher, version } from "../package.json"

// CARETI MODIFICATION: package name is "caret" for marketplace, but internal branding uses "careti"
// Use hardcoded "careti" for user-facing IDs (views, commands) to maintain consistent branding
const INTERNAL_BRAND_NAME = "careti"
const prefix = `${publisher}.${INTERNAL_BRAND_NAME}`

/**
 * List of commands with the name of the extension they are registered under.
 * These should match the command IDs defined in package.json.
 * CARETI MODIFICATION: Use INTERNAL_BRAND_NAME ("careti") instead of package name ("caret")
 * to keep user-visible branding consistent while allowing package name to be "caret" for marketplace.
 */
const ClineCommands = {
	PlusButton: prefix + ".plusButtonClicked",
	McpButton: prefix + ".mcpButtonClicked",
	SettingsButton: prefix + ".settingsButtonClicked",
	HistoryButton: prefix + ".historyButtonClicked",
	AccountButton: prefix + ".accountButtonClicked",
	TerminalOutput: prefix + ".addTerminalOutputToChat",
	AddToChat: prefix + ".addToChat",
	FixWithCline: prefix + ".fixWithCline",
	ExplainCode: prefix + ".explainCode",
	ImproveCode: prefix + ".improveCode",
	FocusChatInput: prefix + ".focusChatInput",
	Walkthrough: prefix + ".openWalkthrough",
	GenerateCommit: prefix + ".generateGitCommitMessage",
	AbortCommit: prefix + ".abortGitCommitMessage",
	ReconstructTaskHistory: prefix + ".reconstructTaskHistory",
}

/**
 * IDs for the views registered by the extension.
 * CARETI MODIFICATION: Use INTERNAL_BRAND_NAME ("careti") for view IDs to match package.json.
 */
const ClineViewIds = {
	Sidebar: INTERNAL_BRAND_NAME + ".SidebarProvider",
}

/**
 * The registry info for the extension, including its ID, name, version, commands, and views
 * registered for the current host.
 */
export const ExtensionRegistryInfo = {
	id: publisher + "." + name,
	name,
	// CARETI MODIFICATION: internalName is used for view containers, activity bar, etc.
	// where the ID in package.json is hardcoded as "careti"
	internalName: INTERNAL_BRAND_NAME,
	version,
	publisher,
	commands: ClineCommands,
	views: ClineViewIds,
}
