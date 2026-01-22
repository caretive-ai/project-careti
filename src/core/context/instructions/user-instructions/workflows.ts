// CARETI MODIFICATION: 워크플로우 관리 - 새 경로 우선, 레거시 경로 폴백
// 새 경로: .agents/workflows/
// 레거시 경로: .agents/context/workflows/
import { synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"
import { ensureWorkflowsDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { ClineRulesToggles } from "@shared/cline-rules"
import { fileExistsAtPath, isDirectory } from "@utils/fs"
import path from "path"
import { Controller } from "@/core/controller"

/**
 * 워크스페이스의 워크플로우 디렉토리 경로 찾기
 * 새 경로 (.agents/workflows/) 우선, 레거시 경로 (.agents/context/workflows/) 폴백
 */
async function resolveWorkflowsPath(workingDirectory: string): Promise<string> {
	// 새 경로 확인
	const newPath = path.resolve(workingDirectory, GlobalFileNames.workflows)
	const newPathExists = (await fileExistsAtPath(newPath)) && (await isDirectory(newPath))
	if (newPathExists) {
		return newPath
	}

	// 레거시 경로 폴백
	const legacyPath = path.resolve(workingDirectory, GlobalFileNames.workflowsLegacy)
	const legacyPathExists = (await fileExistsAtPath(legacyPath)) && (await isDirectory(legacyPath))
	if (legacyPathExists) {
		console.debug(
			`[Workflows] Using legacy workflows path: ${legacyPath}. Consider migrating to ${newPath}`,
		)
		return legacyPath
	}

	// 둘 다 없으면 새 경로 반환 (생성 시 사용)
	return newPath
}

/**
 * Refresh the workflow toggles
 */
export async function refreshWorkflowToggles(
	controller: Controller,
	workingDirectory: string,
): Promise<{
	globalWorkflowToggles: ClineRulesToggles
	localWorkflowToggles: ClineRulesToggles
}> {
	// Global workflows
	const globalWorkflowToggles = controller.stateManager.getGlobalSettingsKey("globalWorkflowToggles")
	const globalClineWorkflowsFilePath = await ensureWorkflowsDirectoryExists()
	const updatedGlobalWorkflowToggles = await synchronizeRuleToggles(globalClineWorkflowsFilePath, globalWorkflowToggles)
	controller.stateManager.setGlobalState("globalWorkflowToggles", updatedGlobalWorkflowToggles)

	const workflowRulesToggles = controller.stateManager.getWorkspaceStateKey("workflowToggles")
	// CARETI MODIFICATION: 새 경로 우선, 레거시 경로 폴백
	const workflowsDirPath = await resolveWorkflowsPath(workingDirectory)
	const updatedWorkflowToggles = await synchronizeRuleToggles(workflowsDirPath, workflowRulesToggles)
	controller.stateManager.setWorkspaceState("workflowToggles", updatedWorkflowToggles)

	return {
		globalWorkflowToggles: updatedGlobalWorkflowToggles,
		localWorkflowToggles: updatedWorkflowToggles,
	}
}
