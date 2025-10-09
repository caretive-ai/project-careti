import {
	combineRuleToggles,
	getRuleFilesTotalContent,
	readDirectoryRecursive,
	synchronizeRuleToggles,
} from "@core/context/instructions/user-instructions/rule-helpers"
import { formatResponse } from "@core/prompts/responses"
import { GlobalFileNames } from "@core/storage/disk"
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
 * Refreshes the toggles for caret, windsurf and cursor rules
 * CARET MODIFICATION: Added caretrules support with priority system
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
	activeSource: RulePrioritySource
}> {
	// CARET MODIFICATION: Implement rule priority system (.caretrules > .clinerules > .cursorrules > .windsurfrules)

	// Step 1: Get current toggles for all rule types
	const localCaretRulesToggles = cloneToggles(controller.stateManager.getWorkspaceStateKey("localCaretRulesToggles"))
	const localWindsurfRulesToggles = cloneToggles(controller.stateManager.getWorkspaceStateKey("localWindsurfRulesToggles"))
	const localCursorRulesToggles = cloneToggles(controller.stateManager.getWorkspaceStateKey("localCursorRulesToggles"))
	const localClineRulesToggles = cloneToggles(options?.clineLocalToggles)

	// Step 2: Synchronize toggles normally (this handles file discovery and cleanup)
	// CARET MODIFICATION: .caretrules is a directory, not a file (like .clinerules)
	const localCaretRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.caretRules)
	Logger.debug(`[CARET] Rules path: ${localCaretRulesFilePath}`)
	Logger.debug(`[CARET] Current toggles: ${JSON.stringify(localCaretRulesToggles)}`)
	const caretDirectorySegment = path.basename(GlobalFileNames.caretRules)
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

	// Step 3: Apply priority logic so only a single rule source stays active per priority order
	const caretHasFiles = Object.keys(updatedLocalCaretToggles).length > 0
	const clineHasFiles = Object.keys(localClineRulesToggles).length > 0
	const cursorHasFiles = Object.keys(updatedLocalCursorToggles).length > 0
	const windsurfHasFiles = Object.keys(updatedLocalWindsurfToggles).length > 0

	let effectiveCaretToggles = updatedLocalCaretToggles
	let effectiveClineToggles = localClineRulesToggles
	let effectiveCursorToggles = updatedLocalCursorToggles
	let effectiveWindsurfToggles = updatedLocalWindsurfToggles
	let activeSource: RulePrioritySource = null

	if (caretHasFiles) {
		activeSource = "caret"
		effectiveClineToggles = {}
		effectiveCursorToggles = {}
		effectiveWindsurfToggles = {}
	} else if (clineHasFiles) {
		activeSource = "cline"
		effectiveCaretToggles = cloneToggles(localClineRulesToggles)
		effectiveClineToggles = {}
		effectiveCursorToggles = {}
		effectiveWindsurfToggles = {}
	} else if (cursorHasFiles) {
		activeSource = "cursor"
		effectiveCaretToggles = {}
		effectiveClineToggles = {}
		effectiveWindsurfToggles = {}
	} else if (windsurfHasFiles) {
		activeSource = "windsurf"
		effectiveCaretToggles = {}
		effectiveClineToggles = {}
		effectiveCursorToggles = {}
	} else {
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

	return {
		caretLocalToggles: effectiveCaretToggles,
		clineLocalToggles: effectiveClineToggles,
		windsurfLocalToggles: effectiveWindsurfToggles,
		cursorLocalToggles: effectiveCursorToggles,
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

	if (await fileExistsAtPath(caretRulesFilePath)) {
		if (await isDirectory(caretRulesFilePath)) {
			// CARET MODIFICATION: Handle .caretrules as directory (like .clinerules)
			try {
				const rulesFilePaths = await readDirectory(caretRulesFilePath, [
					[path.basename(GlobalFileNames.caretRules), "workflows"],
				])

				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					caretRulesFileInstructions = formatResponse.caretRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .caretrules directory at ${caretRulesFilePath}`)
			}
		} else {
			// Handle .caretrules as a file (fallback)
			try {
				if (caretRulesFilePath in toggles && toggles[caretRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(caretRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						caretRulesFileInstructions = formatResponse.caretRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .caretrules file at ${caretRulesFilePath}`)
			}
		}
	}

	return caretRulesFileInstructions
}
