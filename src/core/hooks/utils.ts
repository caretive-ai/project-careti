// CARETI MODIFICATION: Hook utilities for Careti
// Ported from cline-latest/src/core/hooks/utils.ts with Careti path standards
import os from "os"
import path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { getCwd, getDesktopDir } from "@/utils/path"

/**
 * All valid hook types that can be created and executed by Careti.
 * These hooks correspond to specific lifecycle events in the task execution process.
 */
export const VALID_HOOK_TYPES = [
	"TaskStart",
	"TaskResume",
	"TaskCancel",
	"TaskComplete",
	"PreToolUse",
	"PostToolUse",
	"UserPromptSubmit",
	"PreCompact",
] as const

/**
 * Type representing a valid hook name
 */
export type HookType = (typeof VALID_HOOK_TYPES)[number]

/**
 * Validates if a given hook name is a valid hook type.
 *
 * @param hookName - The hook name to validate
 * @returns True if the hook name is valid, false otherwise
 */
export function isValidHookType(hookName: string): hookName is HookType {
	return VALID_HOOK_TYPES.includes(hookName as HookType)
}

/**
 * Resolves the hooks directory path for either global or workspace hooks.
 * Handles both single and multi-root workspaces.
 *
 * CARETI MODIFICATION: Uses .agents/hooks for project hooks (Careti standard)
 * instead of .clinerules/hooks (Cline standard)
 *
 * @param isGlobal - Whether to resolve the global hooks directory
 * @param workspaceName - For multi-root workspaces, the name of the specific workspace
 * @param globalHooksDirOverride - Optional override for global hooks directory (for testing)
 * @returns The absolute path to the hooks directory
 * @throws Error if the specified workspace cannot be found
 */
export async function resolveHooksDirectory(
	isGlobal: boolean,
	workspaceName?: string,
	globalHooksDirOverride?: string,
): Promise<string> {
	if (isGlobal) {
		// CARETI MODIFICATION: Global hooks in ~/Documents/Careti/Hooks (matches Careti branding)
		return globalHooksDirOverride || path.join(os.homedir(), "Documents", "Careti", "Hooks")
	}

	// For workspace hooks, find the correct workspace
	if (workspaceName) {
		// Multi-root workspace: find the workspace with this name
		const workspacePaths = await HostProvider.workspace.getWorkspacePaths({})
		const targetWorkspace = workspacePaths.paths.find((p) => path.basename(p) === workspaceName)
		if (!targetWorkspace) {
			throw new Error(`Workspace "${workspaceName}" not found`)
		}
		// CARETI MODIFICATION: Use .agents/hooks for Careti standard
		return path.join(targetWorkspace, ".agents", "hooks")
	}

	// Single workspace: use getCwd
	const cwd = await getCwd(getDesktopDir())
	// CARETI MODIFICATION: Use .agents/hooks for Careti standard
	return path.join(cwd, ".agents", "hooks")
}
