// CARETI MODIFICATION: Global path migration from ~/Documents/Careti/ to ~/Documents/.agents/
// This ensures consistency with project-level .agents/ directory structure

import fs from "fs/promises"
import path from "path"
import { fileExistsAtPath, isDirectory } from "@utils/fs"
import { getLegacyGlobalDirName, getGlobalAgentsDirName } from "@careti/utils/brand-utils"

/**
 * Result of a migration operation
 */
export interface MigrationResult {
	/** Whether migration was performed */
	migrated: boolean
	/** Whether migration was skipped */
	skipped: boolean
	/** Reason for skipping (if skipped) */
	reason?: "no_legacy_paths" | "already_migrated"
	/** List of migrated paths (e.g., "Rules → context") */
	migratedPaths?: string[]
	/** List of files that were skipped due to existing files */
	skippedFiles?: string[]
	/** Error message if migration failed */
	error?: string
}

/**
 * Path mapping from legacy to new structure
 */
const PATH_MAPPING: Record<string, string> = {
	Rules: "context",
	Workflows: "workflows",
	Skills: "skills",
	Hooks: "hooks",
	MCP: "mcp",
}

/**
 * Check if legacy global paths exist and have content
 * @param documentsPath - Path to Documents folder
 * @returns true if legacy paths exist with content
 */
export async function checkLegacyPathsExist(documentsPath: string): Promise<boolean> {
	const legacyDirName = getLegacyGlobalDirName() // "Careti"
	const legacyBase = path.join(documentsPath, legacyDirName)

	// Check if legacy folder exists
	if (!(await isDirectory(legacyBase))) {
		return false
	}

	// Check if any subdirectory has content
	const legacySubdirs = Object.keys(PATH_MAPPING)

	for (const subdir of legacySubdirs) {
		const subdirPath = path.join(legacyBase, subdir)
		if (await isDirectory(subdirPath)) {
			try {
				const files = await fs.readdir(subdirPath)
				if (files.length > 0) {
					return true
				}
			} catch {
				// Ignore errors, continue checking other subdirs
			}
		}
	}

	return false
}

/**
 * Get migration status (whether migration has been completed)
 * @param documentsPath - Path to Documents folder
 * @returns true if migration has been completed
 */
export async function getMigrationStatus(documentsPath: string): Promise<boolean> {
	const statusFile = path.join(documentsPath, getGlobalAgentsDirName(), ".migration-complete")
	return fileExistsAtPath(statusFile)
}

/**
 * Set migration status
 * @param documentsPath - Path to Documents folder
 * @param completed - Whether migration is complete
 */
export async function setMigrationStatus(documentsPath: string, completed: boolean): Promise<void> {
	const agentsDir = path.join(documentsPath, getGlobalAgentsDirName())
	await fs.mkdir(agentsDir, { recursive: true })

	const statusFile = path.join(agentsDir, ".migration-complete")

	if (completed) {
		const timestamp = new Date().toISOString()
		await fs.writeFile(statusFile, `Migration completed at: ${timestamp}\n`)
	} else {
		try {
			await fs.unlink(statusFile)
		} catch {
			// Ignore if file doesn't exist
		}
	}
}

/**
 * Copy a directory recursively, skipping existing files
 * @param src - Source directory
 * @param dest - Destination directory
 * @param skippedFiles - Array to collect skipped file paths
 * @param relativePath - Current relative path for tracking
 */
async function copyDirRecursive(
	src: string,
	dest: string,
	skippedFiles: string[],
	relativePath: string = "",
): Promise<void> {
	await fs.mkdir(dest, { recursive: true })

	const entries = await fs.readdir(src, { withFileTypes: true })

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name)
		const destPath = path.join(dest, entry.name)
		const currentRelativePath = relativePath ? path.join(relativePath, entry.name) : entry.name

		if (entry.isDirectory()) {
			await copyDirRecursive(srcPath, destPath, skippedFiles, currentRelativePath)
		} else {
			// Check if destination file already exists
			if (await fileExistsAtPath(destPath)) {
				skippedFiles.push(currentRelativePath)
			} else {
				await fs.copyFile(srcPath, destPath)
			}
		}
	}
}

/**
 * Migrate global paths from legacy structure to new structure
 * @param documentsPath - Path to Documents folder
 * @returns Migration result
 */
export async function migrateGlobalPaths(documentsPath: string): Promise<MigrationResult> {
	try {
		// Check if already migrated
		if (await getMigrationStatus(documentsPath)) {
			return {
				migrated: false,
				skipped: true,
				reason: "already_migrated",
			}
		}

		// Check if legacy paths exist
		if (!(await checkLegacyPathsExist(documentsPath))) {
			return {
				migrated: false,
				skipped: true,
				reason: "no_legacy_paths",
			}
		}

		const legacyDirName = getLegacyGlobalDirName() // "Careti"
		const newDirName = getGlobalAgentsDirName() // ".agents"
		const legacyBase = path.join(documentsPath, legacyDirName)
		const newBase = path.join(documentsPath, newDirName)

		const migratedPaths: string[] = []
		const skippedFiles: string[] = []

		// Migrate each subdirectory
		for (const [legacySubdir, newSubdir] of Object.entries(PATH_MAPPING)) {
			const legacyPath = path.join(legacyBase, legacySubdir)
			const newPath = path.join(newBase, newSubdir)

			if (await isDirectory(legacyPath)) {
				try {
					const files = await fs.readdir(legacyPath)
					if (files.length > 0) {
						// Copy files, tracking skipped files with new subdir prefix
						const subSkippedFiles: string[] = []
						await copyDirRecursive(legacyPath, newPath, subSkippedFiles)

						// Add subdir prefix to skipped files
						for (const file of subSkippedFiles) {
							skippedFiles.push(path.join(newSubdir, file))
						}

						migratedPaths.push(`${legacySubdir} → ${newSubdir}`)
					}
				} catch (error) {
					console.error(`Failed to migrate ${legacySubdir}:`, error)
				}
			}
		}

		// Set migration status
		if (migratedPaths.length > 0) {
			await setMigrationStatus(documentsPath, true)
		}

		return {
			migrated: migratedPaths.length > 0,
			skipped: migratedPaths.length === 0,
			migratedPaths,
			skippedFiles: skippedFiles.length > 0 ? skippedFiles : undefined,
		}
	} catch (error) {
		return {
			migrated: false,
			skipped: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}
