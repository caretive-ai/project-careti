// CARETI MODIFICATION: Use Logger for backend error reporting.
import { workspaceResolver } from "@core/workspace"
import { BooleanResponse, StringRequest } from "@shared/proto/cline/common"
import { getWorkspacePath } from "@utils/path"
import * as fs from "fs"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@/services/logging/Logger"
import { HistoryItem } from "@/shared/HistoryItem"
import { Controller } from ".."

/**
 * Check if a file exists in the project using a relative path
 * @param controller The controller instance
 * @param request The request containing the relative file path to check
 * @returns BooleanResponse indicating whether the file exists
 */
export async function ifFileExistsRelativePath(controller: Controller, request: StringRequest): Promise<BooleanResponse> {
	if (!request.value) {
		// If no path provided, return false
		return BooleanResponse.create({ value: false })
	}

	const workspacePaths = (await HostProvider.workspace.getWorkspacePaths({})).paths
	const uniqueRoots = new Set(workspacePaths.filter(Boolean))
	if (uniqueRoots.size === 0) {
		const fallbackRoot = await getWorkspacePath()
		if (fallbackRoot) {
			uniqueRoots.add(fallbackRoot)
		}
	}

	for (const root of controller.getWorkspaceManager()?.getRoots() ?? []) {
		if (root.path) {
			uniqueRoots.add(root.path)
		}
	}

	const taskHistory = controller.stateManager.getGlobalStateKey("taskHistory") as HistoryItem[] | undefined
	for (const item of taskHistory ?? []) {
		if (item?.cwdOnTaskInitialization) {
			uniqueRoots.add(item.cwdOnTaskInitialization)
		}
	}

	const rootList = Array.from(uniqueRoots)

	if (rootList.length === 0) {
		// If no workspace is open, return false
		Logger.error("Error in ifFileExistsRelativePath: No workspace path available")
		return BooleanResponse.create({ value: false })
	}

	for (const workspacePath of rootList) {
		try {
			const resolvedPath = workspaceResolver.resolveWorkspacePath(
				workspacePath,
				request.value,
				"Controller.ifFileExistsRelativePath",
			)
			const absolutePath = typeof resolvedPath === "string" ? resolvedPath : resolvedPath.absolutePath
			if (fs.statSync(absolutePath).isFile()) {
				return BooleanResponse.create({ value: true })
			}
		} catch {}
	}

	return BooleanResponse.create({ value: false })
}
