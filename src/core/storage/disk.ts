import { Anthropic } from "@anthropic-ai/sdk"
import {
	detectCurrentBrandName,
	getBrandRulesFileName,
	getBrandWorkflowsDirName,
	getBrandWorkflowsLegacyDirName,
	getBrandUsersDirName,
	getBrandUsersContextDirName,
	getBrandUsersContextLegacyDirName,
} from "@careti/utils/brand-utils"
import { TaskMetadata } from "@core/context/context-tracking/ContextTrackerTypes"
import { execa } from "@packages/execa"
import { ClineMessage } from "@shared/ExtensionMessage"
import { HistoryItem } from "@shared/HistoryItem"
import { RemoteConfig } from "@shared/remote-config/schema"
import { GlobalState, Settings } from "@shared/storage/state-keys"
import { fileExistsAtPath, isDirectory } from "@utils/fs"
import fs from "fs/promises"
import os from "os"
import * as path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { McpMarketplaceCatalog } from "@/shared/mcp"
import { StateManager } from "./StateManager"

// CARETI MODIFICATION: Brand-aware configuration (used for Careti/Cline/other branded builds)
// Prefer extension package.json (via brand utils) over workspace package.json to avoid picking up user project names.
const resolveBrandSlug = () => {
	try {
		const brandName = detectCurrentBrandName()
		const normalized = String(brandName)
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "")
		return normalized || "careti"
	} catch {
		return "careti"
	}
}

const BRAND_SLUG = resolveBrandSlug()
// CARETI MODIFICATION: Standard agents context paths for rules/workflows.
const BRAND_RULES_DIR = getBrandRulesFileName()
const BRAND_WORKFLOWS_DIR = getBrandWorkflowsDirName()
const BRAND_WORKFLOWS_LEGACY_DIR = getBrandWorkflowsLegacyDirName()
const BRAND_USERS_DIR = getBrandUsersDirName()
const BRAND_USERS_CONTEXT_DIR = getBrandUsersContextDirName()
const BRAND_USERS_CONTEXT_LEGACY_DIR = getBrandUsersContextLegacyDirName()
const BRAND_MCP_SETTINGS_FILE = `${BRAND_SLUG}_mcp_settings.json`
// CARETI MODIFICATION: Use .agents folder for global agent configuration
// This provides consistency with project-level .agents/ directory structure
const BRAND_DOCS_FOLDER = ".agents"

export const GlobalFileNames = {
	apiConversationHistory: "api_conversation_history.json",
	contextHistory: "context_history.json",
	uiMessages: "ui_messages.json",
	openRouterModels: "openrouter_models.json",
	vercelAiGatewayModels: "vercel_ai_gateway_models.json",
	groqModels: "groq_models.json",
	basetenModels: "baseten_models.json",
	hicapModels: "hicap_models.json",
	mcpSettings: BRAND_MCP_SETTINGS_FILE, // CARETI MODIFICATION: brand-aware MCP settings file
	caretRules: BRAND_RULES_DIR, // CARETI MODIFICATION: Careti rule directory support
	clineRules: BRAND_RULES_DIR, // CARETI MODIFICATION: legacy alias -> standard agents context
	workflows: BRAND_WORKFLOWS_DIR, // CARETI MODIFICATION: brand-aware workflows path (.agents/workflows)
	workflowsLegacy: BRAND_WORKFLOWS_LEGACY_DIR, // CARETI MODIFICATION: legacy workflows path (.agents/context/workflows)
	usersDir: BRAND_USERS_DIR, // CARETI MODIFICATION: users documentation directory (.users)
	usersContextDir: BRAND_USERS_CONTEXT_DIR, // CARETI MODIFICATION: users context directory (.users/context)
	usersContextLegacyDir: BRAND_USERS_CONTEXT_LEGACY_DIR, // CARETI MODIFICATION: legacy user context (.agents/context-for-user)
	persona: "persona.md",
	hooksDir: ".agents/hooks",
	commandsDir: ".agents/commands", // CARETI MODIFICATION: commands directory (Claude Code/OpenCode style)
	skillsDir: ".agents/skills", // CARETI MODIFICATION: legacy skills directory (deprecated)
	cursorRulesDir: BRAND_RULES_DIR, // CARETI MODIFICATION: legacy alias -> standard agents context
	cursorRulesFile: BRAND_RULES_DIR, // CARETI MODIFICATION: legacy alias -> standard agents context
	windsurfRules: BRAND_RULES_DIR, // CARETI MODIFICATION: legacy alias -> standard agents context
	agentsRulesFile: "AGENTS.md",
	taskMetadata: "task_metadata.json",
	imageRegistry: "image_registry.json",
	mcpMarketplaceCatalog: "mcp_marketplace_catalog.json",
	remoteConfig: (orgId: string) => `remote_config_${orgId}.json`,
}

export async function getDocumentsPath(): Promise<string> {
	if (process.platform === "win32") {
		try {
			const { stdout: docsPath } = await execa("powershell", [
				"-NoProfile", // Ignore user's PowerShell profile(s)
				"-Command",
				"[System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)",
			])
			const trimmedPath = docsPath.trim()
			if (trimmedPath) {
				return trimmedPath
			}
		} catch (_err) {
			console.error("Failed to retrieve Windows Documents path. Falling back to homedir/Documents.")
		}
	} else if (process.platform === "linux") {
		try {
			// First check if xdg-user-dir exists
			await execa("which", ["xdg-user-dir"])

			// If it exists, try to get XDG documents path
			const { stdout } = await execa("xdg-user-dir", ["DOCUMENTS"])
			const trimmedPath = stdout.trim()
			if (trimmedPath) {
				return trimmedPath
			}
		} catch {
			// Log error but continue to fallback
			console.error("Failed to retrieve XDG Documents path. Falling back to homedir/Documents.")
		}
	}

	// Default fallback for all platforms
	return path.join(os.homedir(), "Documents")
}

export async function ensureTaskDirectoryExists(taskId: string): Promise<string> {
	return getGlobalStorageDir("tasks", taskId)
}

// CARETI MODIFICATION: Global rules in ~/Documents/.agents/context/ (consistent with project .agents/context/)
export async function ensureRulesDirectoryExists(): Promise<string> {
	const userDocumentsPath = await getDocumentsPath()
	const globalContextDir = path.join(userDocumentsPath, BRAND_DOCS_FOLDER, "context")
	try {
		await fs.mkdir(globalContextDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), "Documents", BRAND_DOCS_FOLDER, "context")
	}
	return globalContextDir
}

// CARETI MODIFICATION: Global workflows in ~/Documents/.agents/workflows/
export async function ensureWorkflowsDirectoryExists(): Promise<string> {
	const userDocumentsPath = await getDocumentsPath()
	const globalWorkflowsDir = path.join(userDocumentsPath, BRAND_DOCS_FOLDER, "workflows")
	try {
		await fs.mkdir(globalWorkflowsDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), "Documents", BRAND_DOCS_FOLDER, "workflows")
	}
	return globalWorkflowsDir
}

// CARETI MODIFICATION: Global MCP servers in ~/Documents/.agents/mcp/
export async function ensureMcpServersDirectoryExists(): Promise<string> {
	const userDocumentsPath = await getDocumentsPath()
	const globalMcpDir = path.join(userDocumentsPath, BRAND_DOCS_FOLDER, "mcp")
	try {
		await fs.mkdir(globalMcpDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), "Documents", BRAND_DOCS_FOLDER, "mcp")
	}
	return globalMcpDir
}

// CARETI MODIFICATION: Global hooks in ~/Documents/.agents/hooks/
export async function ensureHooksDirectoryExists(): Promise<string> {
	const userDocumentsPath = await getDocumentsPath()
	const globalHooksDir = path.join(userDocumentsPath, BRAND_DOCS_FOLDER, "hooks")
	try {
		await fs.mkdir(globalHooksDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), "Documents", BRAND_DOCS_FOLDER, "hooks")
	}
	return globalHooksDir
}

// CARETI MODIFICATION: Global commands in ~/Documents/.agents/commands/ (Claude Code/OpenCode style)
export async function ensureCommandsDirectoryExists(): Promise<string> {
	const userDocumentsPath = await getDocumentsPath()
	const globalCommandsDir = path.join(userDocumentsPath, BRAND_DOCS_FOLDER, "commands")
	try {
		await fs.mkdir(globalCommandsDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), "Documents", BRAND_DOCS_FOLDER, "commands")
	}
	return globalCommandsDir
}

// CARETI MODIFICATION: Legacy skills directory (deprecated, for migration)
export async function ensureSkillsDirectoryExists(): Promise<string> {
	const userDocumentsPath = await getDocumentsPath()
	const globalSkillsDir = path.join(userDocumentsPath, BRAND_DOCS_FOLDER, "skills")
	try {
		await fs.mkdir(globalSkillsDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), "Documents", BRAND_DOCS_FOLDER, "skills")
	}
	return globalSkillsDir
}

export async function ensureSettingsDirectoryExists(): Promise<string> {
	return getGlobalStorageDir("settings")
}

export async function getSavedApiConversationHistory(taskId: string): Promise<Anthropic.MessageParam[]> {
	const filePath = path.join(await ensureTaskDirectoryExists(taskId), GlobalFileNames.apiConversationHistory)
	const fileExists = await fileExistsAtPath(filePath)
	if (fileExists) {
		return JSON.parse(await fs.readFile(filePath, "utf8"))
	}
	return []
}

export async function saveApiConversationHistory(taskId: string, apiConversationHistory: Anthropic.MessageParam[]) {
	try {
		const filePath = path.join(await ensureTaskDirectoryExists(taskId), GlobalFileNames.apiConversationHistory)
		await fs.writeFile(filePath, JSON.stringify(apiConversationHistory))
	} catch (error) {
		// in the off chance this fails, we don't want to stop the task
		console.error("Failed to save API conversation history:", error)
	}
}

export async function getSavedClineMessages(taskId: string): Promise<ClineMessage[]> {
	const filePath = path.join(await ensureTaskDirectoryExists(taskId), GlobalFileNames.uiMessages)
	if (await fileExistsAtPath(filePath)) {
		return JSON.parse(await fs.readFile(filePath, "utf8"))
	} else {
		// check old location
		const oldPath = path.join(await ensureTaskDirectoryExists(taskId), "claude_messages.json")
		if (await fileExistsAtPath(oldPath)) {
			const data = JSON.parse(await fs.readFile(oldPath, "utf8"))
			await fs.unlink(oldPath) // remove old file
			return data
		}
	}
	return []
}

export async function saveClineMessages(taskId: string, uiMessages: ClineMessage[]) {
	try {
		const taskDir = await ensureTaskDirectoryExists(taskId)
		const filePath = path.join(taskDir, GlobalFileNames.uiMessages)
		await fs.writeFile(filePath, JSON.stringify(uiMessages))
	} catch (error) {
		console.error("Failed to save ui messages:", error)
	}
}

export async function getTaskMetadata(taskId: string): Promise<TaskMetadata> {
	const filePath = path.join(await ensureTaskDirectoryExists(taskId), GlobalFileNames.taskMetadata)
	try {
		if (await fileExistsAtPath(filePath)) {
			return JSON.parse(await fs.readFile(filePath, "utf8"))
		}
	} catch (error) {
		console.error("Failed to read task metadata:", error)
	}
	return { files_in_context: [], model_usage: [] }
}

export async function saveTaskMetadata(taskId: string, metadata: TaskMetadata) {
	try {
		const taskDir = await ensureTaskDirectoryExists(taskId)
		const filePath = path.join(taskDir, GlobalFileNames.taskMetadata)
		await fs.writeFile(filePath, JSON.stringify(metadata, null, 2))
	} catch (error) {
		console.error("Failed to save task metadata:", error)
	}
}

export async function ensureStateDirectoryExists(): Promise<string> {
	return getGlobalStorageDir("state")
}

export async function ensureCacheDirectoryExists(): Promise<string> {
	return getGlobalStorageDir("cache")
}

export async function readMcpMarketplaceCatalogFromCache(): Promise<McpMarketplaceCatalog | undefined> {
	try {
		const mcpMarketplaceCatalogFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.mcpMarketplaceCatalog)
		const fileExists = await fileExistsAtPath(mcpMarketplaceCatalogFilePath)
		if (fileExists) {
			const fileContents = await fs.readFile(mcpMarketplaceCatalogFilePath, "utf8")
			return JSON.parse(fileContents)
		}
		return undefined
	} catch (error) {
		console.error("Failed to read MCP marketplace catalog from cache:", error)
		return undefined
	}
}

export async function writeMcpMarketplaceCatalogToCache(catalog: McpMarketplaceCatalog): Promise<void> {
	try {
		const mcpMarketplaceCatalogFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.mcpMarketplaceCatalog)
		await fs.writeFile(mcpMarketplaceCatalogFilePath, JSON.stringify(catalog))
	} catch (error) {
		console.error("Failed to write MCP marketplace catalog to cache:", error)
	}
}

async function getGlobalStorageDir(...subdirs: string[]) {
	const fullPath = path.resolve(HostProvider.get().globalStorageFsPath, ...subdirs)
	await fs.mkdir(fullPath, { recursive: true })
	return fullPath
}

export async function getTaskHistoryStateFilePath(): Promise<string> {
	return path.join(await ensureStateDirectoryExists(), "taskHistory.json")
}

export async function taskHistoryStateFileExists(): Promise<boolean> {
	const filePath = await getTaskHistoryStateFilePath()
	return fileExistsAtPath(filePath)
}

export async function readTaskHistoryFromState(): Promise<HistoryItem[]> {
	try {
		const filePath = await getTaskHistoryStateFilePath()
		if (await fileExistsAtPath(filePath)) {
			const contents = await fs.readFile(filePath, "utf8")
			try {
				return JSON.parse(contents)
			} catch (error) {
				console.error("[Disk] Failed to parse task history:", error)
				return []
			}
		}
		return []
	} catch (error) {
		console.error("[Disk] Failed to read task history:", error)
		throw error
	}
}

export async function writeTaskHistoryToState(items: HistoryItem[]): Promise<void> {
	try {
		const filePath = await getTaskHistoryStateFilePath()
		// Always create the file; if items is empty, write [] to ensure presence on first startup
		await fs.writeFile(filePath, JSON.stringify(items))
	} catch (error) {
		console.error("[Disk] Failed to write task history:", error)
		throw error
	}
}

export async function readTaskSettingsFromStorage(taskId: string): Promise<Partial<GlobalState>> {
	try {
		const taskDirectoryFilePath = await ensureTaskDirectoryExists(taskId)
		const settingsFilePath = path.join(taskDirectoryFilePath, "settings.json")

		if (await fileExistsAtPath(settingsFilePath)) {
			const settingsContent = await fs.readFile(settingsFilePath, "utf8")
			return JSON.parse(settingsContent)
		}

		// Return empty object if settings file doesn't exist (new task)
		return {}
	} catch (error) {
		console.error("[Disk] Failed to read task settings:", error)
		throw error
	}
}

export async function writeTaskSettingsToStorage(taskId: string, settings: Partial<Settings>) {
	try {
		const taskDirectoryFilePath = await ensureTaskDirectoryExists(taskId)
		const settingsFilePath = path.join(taskDirectoryFilePath, "settings.json")

		let existingSettings = {}
		if (await fileExistsAtPath(settingsFilePath)) {
			const existingSettingsContent = await fs.readFile(settingsFilePath, "utf8")
			existingSettings = JSON.parse(existingSettingsContent)
		}

		const updatedSettings = { ...existingSettings, ...settings }
		await fs.writeFile(settingsFilePath, JSON.stringify(updatedSettings, null, 2))
	} catch (error) {
		console.error("[Disk] Failed to write task settings:", error)
		throw error
	}
}

export async function readRemoteConfigFromCache(organizationId: string): Promise<RemoteConfig | undefined> {
	try {
		const remoteConfigFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.remoteConfig(organizationId))
		const fileExists = await fileExistsAtPath(remoteConfigFilePath)
		if (fileExists) {
			const fileContents = await fs.readFile(remoteConfigFilePath, "utf8")
			return JSON.parse(fileContents)
		}
		return undefined
	} catch (error) {
		console.error("Failed to read remote config from cache:", error)
		return undefined
	}
}

export async function writeRemoteConfigToCache(organizationId: string, config: RemoteConfig): Promise<void> {
	try {
		const remoteConfigFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.remoteConfig(organizationId))
		await fs.writeFile(remoteConfigFilePath, JSON.stringify(config))
	} catch (error) {
		console.error("Failed to write remote config to cache:", error)
	}
}

export async function deleteRemoteConfigFromCache(organizationId: string): Promise<void> {
	try {
		const remoteConfigFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.remoteConfig(organizationId))
		const fileExists = await fileExistsAtPath(remoteConfigFilePath)
		if (fileExists) {
			await fs.unlink(remoteConfigFilePath)
		}
	} catch (error) {
		console.error("Failed to delete remote config from cache:", error)
	}
}

/**
 * Gets the path to the global hooks directory if it exists.
 * Returns undefined if the directory doesn't exist.
 */
export async function getGlobalHooksDir(): Promise<string | undefined> {
	const globalHooksDir = await ensureHooksDirectoryExists()
	return (await isDirectory(globalHooksDir)) ? globalHooksDir : undefined
}

/**
 * Gets the paths to all hooks directories to search for hooks, including:
 * 1. The global hooks directory (if it exists)
 * 2. Each workspace root's .agents/hooks directory (if they exist)
 *
 * Note: Hooks from different directories may be executed concurrently.
 * No execution order is guaranteed between hooks from different directories.
 * A workspace may not use hooks, and the resulting array will be empty. A
 * multi-root workspace may have multiple hooks directories.
 */
export async function getAllHooksDirs(): Promise<string[]> {
	const hooksDirs: string[] = []

	// Add global hooks directory (if it exists)
	const globalHooksDir = await getGlobalHooksDir()
	if (globalHooksDir) {
		hooksDirs.push(globalHooksDir)
	}

	// Add workspace hooks directories
	const workspaceHooksDirs = await getWorkspaceHooksDirs()
	hooksDirs.push(...workspaceHooksDirs)

	return hooksDirs
}

/**
 * Gets the paths to the workspace's .agents/hooks directories to search for
 * hooks. A workspace may not use hooks, and the resulting array will be empty. A
 * multi-root workspace may have multiple hooks directories.
 */
export async function getWorkspaceHooksDirs(): Promise<string[]> {
	const workspaceRootPaths =
		(StateManager.get().getGlobalStateKey("workspaceRoots") as { path: string }[] | undefined)?.map((root) => root.path) || []

	return (
		await Promise.all(
			workspaceRootPaths.map(async (workspaceRootPath: string) => {
				// Look for a .agents/hooks folder in this workspace root.
				const candidate = path.join(workspaceRootPath, GlobalFileNames.hooksDir)
				return (await isDirectory(candidate)) ? candidate : undefined
			}),
		)
	).filter((path): path is string => Boolean(path))
}

// CARETI MODIFICATION: Hook-related helper functions from cline-latest

/**
 * Atomically write data to a file using temp file + rename pattern.
 * This prevents readers from seeing partial/incomplete data by writing to a temporary
 * file first, then renaming it to the target location. The rename operation is atomic
 * in most cases on modern systems, though behavior may vary across platforms and filesystems.
 *
 * @param filePath - The target file path
 * @param data - The data to write
 */
async function atomicWriteFile(filePath: string, data: string): Promise<void> {
	const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(7)}.json`
	try {
		// Write to temporary file first
		await fs.writeFile(tmpPath, data, "utf8")
		// Rename temp file to target (atomic in most cases)
		await fs.rename(tmpPath, filePath)
	} catch (error) {
		// Clean up temp file if it exists
		fs.unlink(tmpPath).catch(() => {})
		throw error
	}
}

/**
 * Writes the conversation history to a temporary JSON file for hook consumption.
 * This is used by the PreCompact hook to allow hooks to analyze/modify the conversation.
 *
 * @param taskId The task ID
 * @param apiConversationHistory The conversation history to write
 * @param timestamp Optional timestamp to use for the filename (defaults to Date.now())
 * @returns The absolute path to the temporary file
 */
export async function writeConversationHistoryJson(
	taskId: string,
	apiConversationHistory: Anthropic.MessageParam[],
	timestamp?: number,
): Promise<string> {
	const taskDir = await ensureTaskDirectoryExists(taskId)
	const fileTimestamp = timestamp ?? Date.now()
	const tempFileName = `conversation_history_${fileTimestamp}.json`
	const tempFilePath = path.join(taskDir, tempFileName)

	try {
		await atomicWriteFile(tempFilePath, JSON.stringify(apiConversationHistory, null, 2))
		return tempFilePath
	} catch (error) {
		console.error("Failed to write conversation history JSON for hook:", error)
		throw error
	}
}

/**
 * Cleans up a temporary conversation history file created for hook execution.
 * Silently handles errors (file already deleted, permissions, etc.)
 *
 * @param filePath The path to the temporary file to delete
 */
export async function cleanupConversationHistoryFile(filePath: string): Promise<void> {
	try {
		if (await fileExistsAtPath(filePath)) {
			await fs.unlink(filePath)
		}
	} catch (error) {
		// Silently handle errors - this is cleanup, not critical
		console.debug("Failed to cleanup conversation history file:", filePath, error)
	}
}

/**
 * Writes the conversation history in human-readable text format to a temporary file for PreCompact hook consumption.
 * This formats the conversation history (user and assistant messages) in a readable text format,
 * making it easy to analyze the conversation flow without parsing JSON.
 *
 * @param taskId The task ID
 * @param conversationHistory The conversation history messages
 * @param timestamp Optional timestamp to use for the filename (defaults to Date.now())
 * @returns The absolute path to the temporary file
 */
export async function writeConversationHistoryText(
	taskId: string,
	conversationHistory: Anthropic.MessageParam[],
	timestamp?: number,
): Promise<string> {
	const taskDir = await ensureTaskDirectoryExists(taskId)
	const fileTimestamp = timestamp ?? Date.now()
	const tempFileName = `conversation_history_${fileTimestamp}.txt`
	const tempFilePath = path.join(taskDir, tempFileName)

	try {
		// Build the formatted conversation history (excluding system prompt)
		let fullContext = "=== CONVERSATION HISTORY ===\n\n"

		// Format each message in the conversation
		for (let i = 0; i < conversationHistory.length; i++) {
			const message = conversationHistory[i]
			fullContext += `--- Message ${i + 1} (${message.role.toUpperCase()}) ---\n`

			// Handle content which can be a string or array
			if (typeof message.content === "string") {
				fullContext += message.content
			} else if (Array.isArray(message.content)) {
				for (const block of message.content) {
					if (block.type === "text") {
						fullContext += block.text
					} else if (block.type === "image") {
						fullContext += `[IMAGE: ${(block as Anthropic.ImageBlockParam).source?.type || "unknown"}]`
					} else if (block.type === "tool_use") {
						const toolBlock = block as Anthropic.ToolUseBlockParam
						fullContext += `[TOOL USE: ${toolBlock.name}]\n`
						fullContext += `Input: ${JSON.stringify(toolBlock.input, null, 2)}`
					} else if (block.type === "tool_result") {
						const resultBlock = block as Anthropic.ToolResultBlockParam
						fullContext += `[TOOL RESULT: ${resultBlock.tool_use_id}]\n`
						if (typeof resultBlock.content === "string") {
							fullContext += resultBlock.content
						} else if (Array.isArray(resultBlock.content)) {
							for (const contentBlock of resultBlock.content) {
								if (contentBlock.type === "text") {
									fullContext += contentBlock.text
								} else if (contentBlock.type === "image") {
									fullContext += `[IMAGE]`
								}
							}
						}
					}
					fullContext += "\n\n"
				}
			}

			fullContext += "\n"
		}

		fullContext += "=== END OF CONTEXT ===\n"

		await atomicWriteFile(tempFilePath, fullContext)
		return tempFilePath
	} catch (error) {
		console.error("Failed to write conversation history text for hook:", error)
		throw error
	}
}
