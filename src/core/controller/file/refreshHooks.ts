// CARETI MODIFICATION: Hook refresh controller
// Ported from cline-latest with Careti path standards (.agents/hooks)
import { HookInfo, HooksToggles, WorkspaceHooks } from "@shared/proto/cline/file"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { VALID_HOOK_TYPES } from "../../hooks/utils"
import { Controller } from ".."

/**
 * Refreshes all hook toggles (discovers hooks and their enabled state)
 * @param _controller The controller instance (unused but kept for consistency)
 * @param _request The request (unused but kept for consistency)
 * @param globalHooksDirOverride Optional override for global hooks directory (for testing)
 * @returns The updated hooks toggles
 */
export async function refreshHooks(
	_controller: Controller,
	_request?: unknown,
	globalHooksDirOverride?: string,
): Promise<HooksToggles> {
	// CARETI MODIFICATION: Global hooks in ~/Documents/Careti/Hooks (matches Careti branding)
	const globalHooksDir = globalHooksDirOverride || path.join(os.homedir(), "Documents", "Careti", "Hooks")
	const isWindows = process.platform === "win32"

	// Collect global hooks
	const globalHooks: HookInfo[] = []
	for (const hookName of VALID_HOOK_TYPES) {
		const hookPath = path.join(globalHooksDir, hookName)
		try {
			const stat = await fs.stat(hookPath)
			if (stat.isFile()) {
				globalHooks.push(
					HookInfo.create({
						name: hookName,
						enabled: await isExecutable(hookPath),
						absolutePath: hookPath,
					}),
				)
			}
		} catch {
			// File doesn't exist, skip
		}
	}

	// Collect workspace hooks from all workspace folders
	const workspacePaths = await HostProvider.workspace.getWorkspacePaths({})
	const workspaceHooksList: WorkspaceHooks[] = []

	for (const workspacePath of workspacePaths.paths) {
		// CARETI MODIFICATION: Use .agents/hooks as primary path (Careti standard)
		// Also check legacy paths for compatibility
		const hooksDirs = [
			path.join(workspacePath, ".agents", "hooks"), // CARETI standard (primary)
			path.join(workspacePath, ".clinerules", "hooks"), // Cline compatibility
			path.join(workspacePath, ".cline", "hooks"), // Cline compatibility
		]

		const hooks: HookInfo[] = []
		const seenHooks = new Set<string>()

		for (const workspaceHooksDir of hooksDirs) {
			for (const hookName of VALID_HOOK_TYPES) {
				// Skip if we already found this hook in a higher-priority directory
				if (seenHooks.has(hookName)) continue

				const hookPath = path.join(workspaceHooksDir, hookName)
				try {
					const stat = await fs.stat(hookPath)
					if (stat.isFile()) {
						hooks.push(
							HookInfo.create({
								name: hookName,
								enabled: await isExecutable(hookPath),
								absolutePath: hookPath,
							}),
						)
						seenHooks.add(hookName)
					}
				} catch {
					// File doesn't exist, skip
				}
			}
		}

		// Add all workspaces, even if they have no hooks yet
		// This allows users to create their first hook via the dropdown
		const workspaceName = path.basename(workspacePath)
		workspaceHooksList.push(
			WorkspaceHooks.create({
				workspaceName,
				hooks,
			}),
		)
	}

	return HooksToggles.create({
		globalHooks,
		workspaceHooks: workspaceHooksList,
		isWindows,
	})
}

/**
 * Checks if a file is executable
 * @param filePath The path to the file
 * @returns True if the file is executable (or if on Windows, always true)
 */
async function isExecutable(filePath: string): Promise<boolean> {
	if (process.platform === "win32") {
		// On Windows, files are "enabled" if they exist
		return true
	}

	try {
		await fs.access(filePath, fs.constants.X_OK)
		return true
	} catch {
		return false
	}
}
