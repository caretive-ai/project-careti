// CARET MODIFICATION: Use Logger for backend error reporting.
import { workspaceResolver } from "@core/workspace"
import { openFile as openFileIntegration } from "@integrations/misc/open-file"
import { Empty, StringRequest } from "@shared/proto/cline/common"
import { getWorkspacePath } from "@utils/path"
import * as fs from "fs"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@/services/logging/Logger"
import { HistoryItem } from "@/shared/HistoryItem"
import { Controller } from ".."

/**
 * Opens a file in the editor by a relative path
 * @param controller The controller instance
 * @param request The request message containing the relative file path in the 'value' field
 * @returns Empty response
 */
export async function openFileRelativePath(controller: Controller, request: StringRequest): Promise<Empty> {
	if (!request.value) {
		return Empty.create()
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
		Logger.error("Error in openFileRelativePath: No workspace path available")
		return Empty.create()
	}

	for (const workspacePath of rootList) {
		try {
			const resolvedPath = workspaceResolver.resolveWorkspacePath(
				workspacePath,
				request.value,
				"Controller.openFileRelativePath",
			)
			const absolutePath = typeof resolvedPath === "string" ? resolvedPath : resolvedPath.absolutePath
			if (fs.existsSync(absolutePath)) {
				openFileIntegration(absolutePath)
				return Empty.create()
			}
		} catch {}
	}

	Logger.error(`Error in openFileRelativePath: Failed to resolve path ${request.value}`)
	return Empty.create()
}
