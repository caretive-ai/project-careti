// CARETI MODIFICATION: Commands system - on-demand agent instructions (Claude Code/OpenCode style)
// Replaces legacy skills system with unified command format

import { ensureCommandsDirectoryExists, ensureSkillsDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import type { CommandContent, CommandMetadata } from "@shared/commands"
import { fileExistsAtPath, isDirectory } from "@utils/fs"
import * as fs from "fs/promises"
import * as path from "path"
import { parseYamlFrontmatter } from "./frontmatter"

/** Parse YAML frontmatter from markdown content (shared helper). */
function parseFrontmatter(fileContent: string): { data: Record<string, unknown>; content: string } {
	const result = parseYamlFrontmatter(fileContent)
	if (result.parseError) {
		console.warn("Failed to parse YAML frontmatter:", result.parseError)
	}
	return { data: result.data, content: result.body }
}

/**
 * Scan a directory for command files.
 * Supports two formats:
 * 1. New format: *.md files directly in directory (Claude Code/OpenCode style)
 * 2. Legacy format: subdirectories with SKILL.md files (Cline style)
 */
async function scanCommandsDirectory(dirPath: string, source: "global" | "project"): Promise<CommandMetadata[]> {
	const commands: CommandMetadata[] = []

	if (!(await fileExistsAtPath(dirPath)) || !(await isDirectory(dirPath))) {
		return commands
	}

	try {
		const entries = await fs.readdir(dirPath)

		for (const entryName of entries) {
			const entryPath = path.join(dirPath, entryName)
			const stats = await fs.stat(entryPath).catch(() => null)
			if (!stats) continue

			if (stats.isDirectory()) {
				// Legacy format: subdirectory with SKILL.md
				const command = await loadLegacyCommandMetadata(entryPath, source, entryName)
				if (command) {
					commands.push(command)
				}
			} else if (stats.isFile() && entryName.endsWith(".md")) {
				// New format: direct *.md file (Claude Code/OpenCode style)
				const command = await loadCommandMetadata(entryPath, source)
				if (command) {
					commands.push(command)
				}
			}
		}
	} catch (error: unknown) {
		if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "EACCES") {
			console.warn(`Permission denied reading commands directory: ${dirPath}`)
		}
	}

	return commands
}

/**
 * Load command metadata from a markdown file (Claude Code/OpenCode style).
 * Filename becomes command name (without .md extension).
 */
async function loadCommandMetadata(filePath: string, source: "global" | "project"): Promise<CommandMetadata | null> {
	try {
		const fileContent = await fs.readFile(filePath, "utf-8")
		const { data: frontmatter } = parseFrontmatter(fileContent)

		// Derive command name from filename
		const commandName = path.basename(filePath, ".md")

		// description is required
		if (!frontmatter.description || typeof frontmatter.description !== "string") {
			console.warn(`Command at ${filePath} missing required 'description' field`)
			return null
		}

		return {
			name: commandName,
			description: frontmatter.description,
			path: filePath,
			source,
			// Optional fields (Claude Code/OpenCode style)
			argumentHint: typeof frontmatter["argument-hint"] === "string" ? frontmatter["argument-hint"] : undefined,
			model: typeof frontmatter.model === "string" ? frontmatter.model : undefined,
			subtask: typeof frontmatter.subtask === "boolean" ? frontmatter.subtask : undefined,
		}
	} catch (error) {
		console.warn(`Failed to load command at ${filePath}:`, error)
		return null
	}
}

/**
 * Load command metadata from a legacy skill directory (Cline style).
 * Directory name becomes command name.
 */
async function loadLegacyCommandMetadata(
	skillDir: string,
	source: "global" | "project",
	skillName: string,
): Promise<CommandMetadata | null> {
	const skillMdPath = path.join(skillDir, "SKILL.md")
	if (!(await fileExistsAtPath(skillMdPath))) return null

	try {
		const fileContent = await fs.readFile(skillMdPath, "utf-8")
		const { data: frontmatter } = parseFrontmatter(fileContent)

		// Validate required fields (legacy format requires name and description)
		if (!frontmatter.name || typeof frontmatter.name !== "string") {
			console.warn(`Skill at ${skillDir} missing required 'name' field`)
			return null
		}
		if (!frontmatter.description || typeof frontmatter.description !== "string") {
			console.warn(`Skill at ${skillDir} missing required 'description' field`)
			return null
		}

		// Name must match directory name per spec
		if (frontmatter.name !== skillName) {
			console.warn(`Skill name "${frontmatter.name}" doesn't match directory "${skillName}"`)
			return null
		}

		return {
			name: skillName,
			description: frontmatter.description,
			path: skillMdPath,
			source,
		}
	} catch (error) {
		console.warn(`Failed to load skill at ${skillDir}:`, error)
		return null
	}
}

/**
 * Discover all commands from global and project directories.
 * Returns commands in order: project commands first, then global commands.
 * Global commands take precedence over project commands with the same name.
 *
 * Search order:
 * 1. Project: .agents/commands/ (new)
 * 2. Project: .agents/skills/ (legacy)
 * 3. Global: ~/Documents/.agents/commands/ (new)
 * 4. Global: ~/Documents/.agents/skills/ (legacy)
 */
export async function discoverCommands(cwd: string): Promise<CommandMetadata[]> {
	const commands: CommandMetadata[] = []

	// Project commands directory (new: .agents/commands/)
	const projectCommandsDir = path.join(cwd, GlobalFileNames.commandsDir)
	const projectCommands = await scanCommandsDirectory(projectCommandsDir, "project")
	commands.push(...projectCommands)

	// Project skills directory (legacy: .agents/skills/)
	const projectSkillsDir = path.join(cwd, GlobalFileNames.skillsDir)
	if (projectSkillsDir !== projectCommandsDir) {
		const projectSkills = await scanCommandsDirectory(projectSkillsDir, "project")
		commands.push(...projectSkills)
	}

	// Global commands directory (new)
	const globalCommandsDir = await ensureCommandsDirectoryExists()
	const globalCommands = await scanCommandsDirectory(globalCommandsDir, "global")
	commands.push(...globalCommands)

	// Global skills directory (legacy)
	const globalSkillsDir = await ensureSkillsDirectoryExists()
	if (globalSkillsDir !== globalCommandsDir) {
		const globalSkills = await scanCommandsDirectory(globalSkillsDir, "global")
		commands.push(...globalSkills)
	}

	return commands
}

/**
 * Get available commands with override resolution (global > project, new > legacy).
 */
export function getAvailableCommands(commands: CommandMetadata[]): CommandMetadata[] {
	const seen = new Set<string>()
	const result: CommandMetadata[] = []

	// Iterate backwards: global commands (added last) are seen first and take precedence
	for (let i = commands.length - 1; i >= 0; i--) {
		const command = commands[i]
		if (!seen.has(command.name)) {
			seen.add(command.name)
			result.unshift(command)
		}
	}

	return result
}

/**
 * Get full command content including instructions.
 */
export async function getCommandContent(
	commandName: string,
	availableCommands: CommandMetadata[],
): Promise<CommandContent | null> {
	const command = availableCommands.find((c) => c.name === commandName)
	if (!command) return null

	try {
		const fileContent = await fs.readFile(command.path, "utf-8")
		const { content: body } = parseFrontmatter(fileContent)

		return {
			...command,
			instructions: body.trim(),
		}
	} catch {
		return null
	}
}

// Legacy aliases for backward compatibility
/** @deprecated Use discoverCommands instead */
export const discoverSkills = discoverCommands
/** @deprecated Use getAvailableCommands instead */
export const getAvailableSkills = getAvailableCommands
/** @deprecated Use getCommandContent instead */
export const getSkillContent = getCommandContent
