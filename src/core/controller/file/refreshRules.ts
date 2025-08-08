// CARET MODIFICATION: Merged with upstream/main. Proto paths updated to 'caret' package.
// Adopted new getCwd utility and preserved Caret's multi-rule priority logic.
import { EmptyRequest } from "@shared/proto/cline/common"
import { RefreshedRules } from "@shared/proto/cline/file"
import type { Controller } from "../index"
import { refreshClineRulesToggles } from "@core/context/instructions/user-instructions/cline-rules"
import { refreshExternalRulesToggles } from "@core/context/instructions/user-instructions/external-rules"
import { refreshWorkflowToggles } from "@core/context/instructions/user-instructions/workflows"
import { fileExistsAtPath } from "@utils/fs"
import { GlobalFileNames } from "@core/storage/disk"
import { ClineRulesToggles } from "@shared/cline-rules"
import * as path from "path"
import { getCwd, getDesktopDir } from "@/utils/path"

/**
 * Apply priority-based rule guidance while respecting user settings
 * Priority: .caretrules > .clinerules > .cursorrules > .windsurfrules
 * CARET MODIFICATION: 사용자 설정을 존중하며 우선순위는 가이드로만 사용
 */
async function applyGlobalRulePriority(
	workingDirectory: string,
	caretToggles: ClineRulesToggles,
	clineToggles: ClineRulesToggles,
	cursorToggles: ClineRulesToggles,
	windsurfToggles: ClineRulesToggles,
): Promise<{
	caretToggles: ClineRulesToggles
	clineToggles: ClineRulesToggles
	cursorToggles: ClineRulesToggles
	windsurfToggles: ClineRulesToggles
}> {
	const caretRulesPath = path.resolve(workingDirectory, GlobalFileNames.caretRules)
	const clineRulesPath = path.resolve(workingDirectory, GlobalFileNames.clineRules)
	const cursorRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.cursorRulesFile)
	const cursorRulesDirPath = path.resolve(workingDirectory, GlobalFileNames.cursorRulesDir)
	const windsurfRulesPath = path.resolve(workingDirectory, GlobalFileNames.windsurfRules)

	const caretExists = await fileExistsAtPath(caretRulesPath)
	const clineExists = await fileExistsAtPath(clineRulesPath)
	const cursorFileExists = await fileExistsAtPath(cursorRulesFilePath)
	const cursorDirExists = await fileExistsAtPath(cursorRulesDirPath)
	const windsurfExists = await fileExistsAtPath(windsurfRulesPath)

	// CARET MODIFICATION: 사용자 설정을 존중하면서 우선순위 가이드만 제공
	// 파일이 존재하지 않는 경우에만 자동으로 비활성화
	const result = {
		caretToggles: caretExists ? caretToggles : {},
		clineToggles: clineExists ? clineToggles : {},
		cursorToggles: cursorFileExists || cursorDirExists ? cursorToggles : {},
		windsurfToggles: windsurfExists ? windsurfToggles : {},
	}

	// 파일이 존재하는 경우에만 기본값으로 활성화 (사용자가 변경하지 않은 경우)
	if (caretExists && Object.keys(result.caretToggles).length === 0) {
		result.caretToggles[caretRulesPath] = true
	}
	if (clineExists && Object.keys(result.clineToggles).length === 0) {
		result.clineToggles[clineRulesPath] = true
	}
	if ((cursorFileExists || cursorDirExists) && Object.keys(result.cursorToggles).length === 0) {
		if (cursorFileExists) {
			result.cursorToggles[cursorRulesFilePath] = true
		}
		if (cursorDirExists) {
			result.cursorToggles[cursorRulesDirPath] = true
		}
	}
	if (windsurfExists && Object.keys(result.windsurfToggles).length === 0) {
		result.windsurfToggles[windsurfRulesPath] = true
	}

	return result
}

/**
 * Refreshes all rule toggles (Cline, External, and Workflows)
 * @param controller The controller instance
 * @param _request The empty request
 * @returns RefreshedRules containing updated toggles for all rule types
 */
export async function refreshRules(controller: Controller, _request: EmptyRequest): Promise<RefreshedRules> {
	try {
		const cwd = await getCwd(getDesktopDir())
		const { globalToggles, localToggles } = await refreshClineRulesToggles(controller.context, cwd)
		const { caretLocalToggles, cursorLocalToggles, windsurfLocalToggles } = await refreshExternalRulesToggles(
			controller.context,
			cwd,
		)
		const { localWorkflowToggles, globalWorkflowToggles } = await refreshWorkflowToggles(controller.context, cwd)

		// CARET MODIFICATION: Apply global rule priority across all rule types
		const { caretToggles, clineToggles, cursorToggles, windsurfToggles } = await applyGlobalRulePriority(
			cwd,
			caretLocalToggles,
			localToggles,
			cursorLocalToggles,
			windsurfLocalToggles,
		)

		return RefreshedRules.create({
			globalClineRulesToggles: { toggles: globalToggles },
			localClineRulesToggles: { toggles: clineToggles },
			localCaretRulesToggles: { toggles: caretToggles },
			localCursorRulesToggles: { toggles: cursorToggles },
			localWindsurfRulesToggles: { toggles: windsurfToggles },
			localWorkflowToggles: { toggles: localWorkflowToggles },
			globalWorkflowToggles: { toggles: globalWorkflowToggles },
		})
	} catch (error) {
		console.error("Failed to refresh rules:", error)
		throw error
	}
}
