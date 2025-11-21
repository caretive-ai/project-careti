import {
	combineRuleToggles,
	getRuleFilesTotalContent,
	readDirectoryRecursive,
	synchronizeRuleToggles,
} from "@core/context/instructions/user-instructions/rule-helpers"
import { formatResponse } from "@core/prompts/responses"
import { GlobalFileNames } from "@core/storage/disk"
import { listFiles } from "@services/glob/list-files"
import { ClineRulesToggles } from "@shared/cline-rules"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import fs from "fs/promises"
import path from "path"
import { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger" // CARET MODIFICATION: Use Logger for debugging

export type RulePrioritySource = "caret" | "cline" | "cursor" | "windsurf" | null

const cloneToggles = (toggles?: ClineRulesToggles | undefined): ClineRulesToggles => ({
	...(toggles || {}),
})

/**
 * Refreshes the toggles for caret, cline, windsurf, cursor, and agents rules.
 * CARET MODIFICATION: Added caretrules support with priority system, preserved agents from Cline.
 */
export async function refreshExternalRulesToggles(
	controller: Controller,
	workingDirectory: string,
	options?: {
		clineLocalToggles?: ClineRulesToggles
	},
): Promise<{
	caretLocalToggles: ClineRulesToggles
	clineLocalToggles: ClineRulesToggles
	windsurfLocalToggles: ClineRulesToggles
	cursorLocalToggles: ClineRulesToggles
	agentsLocalToggles: ClineRulesToggles
	activeSource: RulePrioritySource
}> {
	// CARET MODIFICATION: Implement rule priority system (.caretrules > .clinerules > .cursorrules > .windsurfrules)

	// Step 1: Get current toggles for all rule types
	const localCaretRulesToggles = cloneToggles(controller.stateManager.getWorkspaceStateKey("localCaretRulesToggles"))
	const localWindsurfRulesToggles = cloneToggles(controller.stateManager.getWorkspaceStateKey("localWindsurfRulesToggles"))
	const localCursorRulesToggles = cloneToggles(controller.stateManager.getWorkspaceStateKey("localCursorRulesToggles"))
	const localAgentsRulesToggles = cloneToggles(controller.stateManager.getWorkspaceStateKey("localAgentsRulesToggles"))
	const localClineRulesToggles = cloneToggles(options?.clineLocalToggles)

	// Step 2: Synchronize toggles normally (this handles file discovery and cleanup)
	// CARET MODIFICATION: .caretrules is a directory, not a file (like .clinerules)
	const localCaretRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.caretRules)
	Logger.debug(`[CARET] Rules path: ${localCaretRulesFilePath}`)
	Logger.debug(`[CARET] Current toggles: ${JSON.stringify(localCaretRulesToggles)}`)
	const caretDirectorySegment = path.basename(GlobalFileNames.caretRules)
	// CARET MODIFICATION: Use default empty string to allow all file extensions (not "*.*" which filters everything)
	const updatedLocalCaretToggles = await synchronizeRuleToggles(localCaretRulesFilePath, localCaretRulesToggles, "", [
		[caretDirectorySegment, "workflows"],
	])
	Logger.debug(`[CARET] Updated toggles: ${JSON.stringify(updatedLocalCaretToggles)}`)

	const localWindsurfRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.windsurfRules)
	Logger.debug(`[WINDSURF] Rules path: ${localWindsurfRulesFilePath}`)
	Logger.debug(`[WINDSURF] Current toggles: ${JSON.stringify(localWindsurfRulesToggles)}`)
	const updatedLocalWindsurfToggles = await synchronizeRuleToggles(localWindsurfRulesFilePath, localWindsurfRulesToggles)
	Logger.debug(`[WINDSURF] Updated toggles: ${JSON.stringify(updatedLocalWindsurfToggles)}`)

	// cursor has two valid locations for rules files, so we need to check both and combine
	let localCursorRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.cursorRulesDir)
	Logger.debug(`[CURSOR] Rules path (dir): ${localCursorRulesFilePath}`)
	Logger.debug(`[CURSOR] Current toggles: ${JSON.stringify(localCursorRulesToggles)}`)
	const updatedLocalCursorToggles1 = await synchronizeRuleToggles(localCursorRulesFilePath, localCursorRulesToggles, ".mdc")

	localCursorRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.cursorRulesFile)
	Logger.debug(`[CURSOR] Rules path (file): ${localCursorRulesFilePath}`)
	const updatedLocalCursorToggles2 = await synchronizeRuleToggles(localCursorRulesFilePath, localCursorRulesToggles)

	const updatedLocalCursorToggles = combineRuleToggles(updatedLocalCursorToggles1, updatedLocalCursorToggles2)
	Logger.debug(`[CURSOR] Combined toggles: ${JSON.stringify(updatedLocalCursorToggles)}`)

	// Agents rules (Cline addition)
	const localAgentsRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.agentsRulesFile)
	const updatedLocalAgentsToggles = await synchronizeRuleToggles(localAgentsRulesFilePath, localAgentsRulesToggles)
	controller.stateManager.setWorkspaceState("localAgentsRulesToggles", updatedLocalAgentsToggles)

	// Step 3: Apply priority logic so only a single rule source stays active per priority order
	const caretHasFiles = Object.keys(updatedLocalCaretToggles).length > 0
	const clineHasFiles = Object.keys(localClineRulesToggles).length > 0
	const cursorHasFiles = Object.keys(updatedLocalCursorToggles).length > 0
	const windsurfHasFiles = Object.keys(updatedLocalWindsurfToggles).length > 0

	Logger.info(`[refreshExternalRulesToggles] Rule priority check:`)
	Logger.info(
		`[refreshExternalRulesToggles] - .caretrules: ${caretHasFiles ? `YES (${Object.keys(updatedLocalCaretToggles).length} files)` : "NO"}`,
	)
	Logger.info(
		`[refreshExternalRulesToggles] - .clinerules: ${clineHasFiles ? `YES (${Object.keys(localClineRulesToggles).length} files)` : "NO"}`,
	)
	Logger.info(
		`[refreshExternalRulesToggles] - .cursorrules: ${cursorHasFiles ? `YES (${Object.keys(updatedLocalCursorToggles).length} files)` : "NO"}`,
	)
	Logger.info(
		`[refreshExternalRulesToggles] - .windsurfrules: ${windsurfHasFiles ? `YES (${Object.keys(updatedLocalWindsurfToggles).length} files)` : "NO"}`,
	)

	let effectiveCaretToggles = updatedLocalCaretToggles
	let effectiveClineToggles = localClineRulesToggles
	let effectiveCursorToggles = updatedLocalCursorToggles
	let effectiveWindsurfToggles = updatedLocalWindsurfToggles
	let activeSource: RulePrioritySource = null

	// CARET MODIFICATION: Priority system - only one rule source is active
	if (caretHasFiles) {
		activeSource = "caret"
		Logger.info(`[refreshExternalRulesToggles] ✅ ACTIVE: .caretrules (highest priority)`)
		// Keep caretToggles, disable others
		effectiveClineToggles = {}
		effectiveCursorToggles = {}
		effectiveWindsurfToggles = {}
	} else if (clineHasFiles) {
		activeSource = "cline"
		Logger.info(`[refreshExternalRulesToggles] ✅ ACTIVE: .clinerules (no .caretrules found)`)
		// Keep clineToggles, disable others
		effectiveCaretToggles = {}
		effectiveCursorToggles = {}
		effectiveWindsurfToggles = {}
	} else if (cursorHasFiles) {
		activeSource = "cursor"
		Logger.info(`[refreshExternalRulesToggles] ✅ ACTIVE: .cursorrules (no .caretrules/.clinerules found)`)
		// Keep cursorToggles, disable others
		effectiveCaretToggles = {}
		effectiveClineToggles = {}
		effectiveWindsurfToggles = {}
	} else if (windsurfHasFiles) {
		activeSource = "windsurf"
		Logger.info(`[refreshExternalRulesToggles] ✅ ACTIVE: .windsurfrules (no other rules found)`)
		// Keep windsurfToggles, disable others
		effectiveCaretToggles = {}
		effectiveClineToggles = {}
		effectiveCursorToggles = {}
	} else {
		Logger.warn(`[refreshExternalRulesToggles] ⚠️ No rules found in any directory`)
		// No rules found, disable all
		effectiveCaretToggles = {}
		effectiveClineToggles = {}
		effectiveCursorToggles = {}
		effectiveWindsurfToggles = {}
	}

	controller.stateManager.setWorkspaceState("localCaretRulesToggles", effectiveCaretToggles)
	controller.stateManager.setWorkspaceState("localWindsurfRulesToggles", effectiveWindsurfToggles)
	controller.stateManager.setWorkspaceState("localCursorRulesToggles", effectiveCursorToggles)
	controller.stateManager.setWorkspaceState("localClineRulesToggles", effectiveClineToggles)

	Logger.debug(`[CARET] FINAL - returning toggles: ${JSON.stringify(effectiveCaretToggles)}`)
	Logger.debug(`[CLINE] FINAL - returning toggles: ${JSON.stringify(effectiveClineToggles)}`)
	Logger.debug(`[CURSOR] FINAL - returning toggles: ${JSON.stringify(effectiveCursorToggles)}`)
	Logger.debug(`[WINDSURF] FINAL - returning toggles: ${JSON.stringify(effectiveWindsurfToggles)}`)
	Logger.debug(`[AGENTS] FINAL - returning toggles: ${JSON.stringify(updatedLocalAgentsToggles)}`)

	return {
		caretLocalToggles: effectiveCaretToggles,
		clineLocalToggles: effectiveClineToggles,
		windsurfLocalToggles: effectiveWindsurfToggles,
		cursorLocalToggles: effectiveCursorToggles,
		agentsLocalToggles: updatedLocalAgentsToggles,
		activeSource,
	}
}

/**
 * Gather formatted windsurf rules
 */
export const getLocalWindsurfRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const windsurfRulesFilePath = path.resolve(cwd, GlobalFileNames.windsurfRules)

	let windsurfRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(windsurfRulesFilePath)) {
		if (!(await isDirectory(windsurfRulesFilePath))) {
			try {
				if (windsurfRulesFilePath in toggles && toggles[windsurfRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(windsurfRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						windsurfRulesFileInstructions = formatResponse.windsurfRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .windsurfrules file at ${windsurfRulesFilePath}`)
			}
		}
	}

	return windsurfRulesFileInstructions
}

/**
 * Gather formatted cursor rules, which can come from two sources
 */
export const getLocalCursorRules = async (cwd: string, toggles: ClineRulesToggles) => {
	// we first check for the .cursorrules file
	const cursorRulesFilePath = path.resolve(cwd, GlobalFileNames.cursorRulesFile)
	let cursorRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(cursorRulesFilePath)) {
		if (!(await isDirectory(cursorRulesFilePath))) {
			try {
				if (cursorRulesFilePath in toggles && toggles[cursorRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(cursorRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						cursorRulesFileInstructions = formatResponse.cursorRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .cursorrules file at ${cursorRulesFilePath}`)
			}
		}
	}

	// we then check for the .cursor/rules dir
	const cursorRulesDirPath = path.resolve(cwd, GlobalFileNames.cursorRulesDir)
	let cursorRulesDirInstructions: string | undefined

	if (await fileExistsAtPath(cursorRulesDirPath)) {
		if (await isDirectory(cursorRulesDirPath)) {
			try {
				const rulesFilePaths = await readDirectoryRecursive(cursorRulesDirPath, ".mdc")
				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					cursorRulesDirInstructions = formatResponse.cursorRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .cursor/rules directory at ${cursorRulesDirPath}`)
			}
		}
	}

	return [cursorRulesFileInstructions, cursorRulesDirInstructions]
}

/**
 * Gather formatted caret rules
 * CARET MODIFICATION: Added .caretrules support
 */
export const getLocalCaretRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const caretRulesFilePath = path.resolve(cwd, GlobalFileNames.caretRules)

	let caretRulesFileInstructions: string | undefined

	Logger.info(`[getLocalCaretRules] Starting to load .caretrules from: ${caretRulesFilePath}`)
	Logger.info(`[getLocalCaretRules] Toggles: ${JSON.stringify(toggles, null, 2)}`)

	if (await fileExistsAtPath(caretRulesFilePath)) {
		if (await isDirectory(caretRulesFilePath)) {
			// CARET MODIFICATION: Handle .caretrules as directory (like .clinerules)
			try {
				const rulesFilePaths = await readDirectory(caretRulesFilePath, [
					[path.basename(GlobalFileNames.caretRules), "workflows"],
				])

				Logger.info(`[getLocalCaretRules] Found ${rulesFilePaths.length} rule files: ${JSON.stringify(rulesFilePaths)}`)

				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					Logger.info(
						`[getLocalCaretRules] Successfully loaded .caretrules content (${rulesFilesTotalContent.length} chars)`,
					)
					caretRulesFileInstructions = formatResponse.caretRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				} else {
					Logger.warn(`[getLocalCaretRules] No content loaded from .caretrules (all files disabled or empty)`)
				}
			} catch (error) {
				Logger.error(`[getLocalCaretRules] Failed to read .caretrules directory at ${caretRulesFilePath}: ${error}`)
			}
		} else {
			// Handle .caretrules as a file (fallback)
			try {
				if (caretRulesFilePath in toggles && toggles[caretRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(caretRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						Logger.info(`[getLocalCaretRules] Loaded .caretrules file (${ruleFileContent.length} chars)`)
						caretRulesFileInstructions = formatResponse.caretRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch (error) {
				Logger.error(`[getLocalCaretRules] Failed to read .caretrules file at ${caretRulesFilePath}: ${error}`)
			}
		}
	} else {
		Logger.info(`[getLocalCaretRules] .caretrules does not exist at ${caretRulesFilePath}`)
	}

	Logger.info(
		`[getLocalCaretRules] Returning instructions: ${caretRulesFileInstructions ? "YES (" + caretRulesFileInstructions.substring(0, 100) + "...)" : "NO"}`,
	)
	return caretRulesFileInstructions
}

/**
 * Helper function to find all agents.md files recursively (case-insensitive)
 * Only searches if a top-level agents.md file exists
 */
async function findAgentsMdFiles(cwd: string): Promise<string[]> {
	try {
		// First check if top-level agents.md exists
		const topLevelAgentsPath = path.resolve(cwd, GlobalFileNames.agentsRulesFile)
		const topLevelExists = await fileExistsAtPath(topLevelAgentsPath)

		// Only search recursively if top-level agents.md exists
		if (!topLevelExists) {
			return []
		}

		// Search recursively for all agents.md files
		const [allFiles] = await listFiles(cwd, true, 500)
		return allFiles.filter((filePath) => {
			const basename = path.basename(filePath).toLowerCase()
			return basename === GlobalFileNames.agentsRulesFile.toLowerCase()
		})
	} catch (error) {
		console.error(`Failed to find agents.md files in ${cwd}:`, error)
		return []
	}
}

/**
 * Gather formatted agents rules - searches recursively and combines all agents.md files
 */
export const getLocalAgentsRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const agentsRulesFilePath = path.resolve(cwd, GlobalFileNames.agentsRulesFile)

	// Check if the top-level agents.md file is enabled
	if (agentsRulesFilePath in toggles && toggles[agentsRulesFilePath] === false) {
		return undefined
	}

	try {
		const agentsMdFiles = await findAgentsMdFiles(cwd)

		if (agentsMdFiles.length === 0) {
			return undefined
		}

		// Read and combine all agents.md files
		const combinedContent = await Promise.all(
			agentsMdFiles.map(async (filePath) => {
				try {
					const fullPath = path.resolve(cwd, filePath)
					const content = (await fs.readFile(fullPath, "utf8")).trim()
					if (content) {
						const relativePath = path.relative(cwd, fullPath)
						return `## ${relativePath}\n\n${content}`
					}
					return null
				} catch (error) {
					console.error(`Failed to read agents.md file at ${filePath}:`, error)
					return null
				}
			}),
		).then((contents) => contents.filter(Boolean).join("\n\n"))

		if (combinedContent) {
			return formatResponse.agentsRulesLocalFileInstructions(cwd, combinedContent)
		}
	} catch (error) {
		console.error("Failed to read agents.md files:", error)
	}

	return undefined
}
