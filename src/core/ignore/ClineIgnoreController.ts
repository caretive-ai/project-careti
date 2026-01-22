import { getBrandIgnoreFileName, getLegacyClineIgnoreFileName } from "@careti/utils/brand-utils"
import { fileExistsAtPath } from "@utils/fs"
import chokidar, { FSWatcher } from "chokidar"
import fs from "fs/promises"
import ignore, { Ignore } from "ignore"
import path from "path"

export const LOCK_TEXT_SYMBOL = "\u{1F512}"
// CARETI MODIFICATION: default ignore file uses brand util (.caretignore by default), legacy .clineignore still supported
const PRIMARY_IGNORE_FILENAME = getBrandIgnoreFileName?.() ?? ".caretignore"
const LEGACY_IGNORE_FILENAME = getLegacyClineIgnoreFileName?.() ?? ".clineignore"
const IGNORE_FILENAMES = [PRIMARY_IGNORE_FILENAME, LEGACY_IGNORE_FILENAME]

/**
 * Controls LLM access to files by enforcing ignore patterns.
 * Designed to be instantiated once in Cline.ts and passed to file manipulation services.
 * Uses the 'ignore' library to support standard .gitignore syntax in .caretignore files (legacy .clineignore supported).
 */
export class ClineIgnoreController {
	private cwd: string
	private ignoreInstance: Ignore
	private fileWatcher?: FSWatcher
	clineIgnoreContent: string | undefined

	constructor(cwd: string) {
		this.cwd = cwd
		this.ignoreInstance = ignore()
		this.clineIgnoreContent = undefined
	}

	/**
	 * Initialize the controller by loading custom patterns and setting up file watcher
	 * Must be called after construction and before using the controller
	 */
	async initialize(): Promise<void> {
		// CARETI MODIFICATION: Watch both .caretignore and legacy .clineignore files
		this.setupFileWatcher()
		await this.loadClineIgnore()
	}

	/**
	 * Set up the file watcher for ignore file changes
	 */
	private setupFileWatcher(): void {
		const ignorePaths = IGNORE_FILENAMES.map((name) => path.join(this.cwd, name))

		this.fileWatcher = chokidar.watch(ignorePaths, {
			persistent: true, // Keep the process running as long as files are being watched
			ignoreInitial: true, // Don't fire 'add' events when discovering the file initially
			awaitWriteFinish: {
				// Wait for writes to finish before emitting events (handles chunked writes)
				stabilityThreshold: 100, // Wait 100ms for file size to remain constant
				pollInterval: 100, // Check file size every 100ms while waiting for stability
			},
			atomic: true, // Handle atomic writes where editors write to a temp file then rename
		})

		// Watch for file changes, creation, and deletion
		this.fileWatcher.on("change", () => {
			this.loadClineIgnore()
		})

		this.fileWatcher.on("add", () => {
			this.loadClineIgnore()
		})

		this.fileWatcher.on("unlink", () => {
			this.loadClineIgnore()
		})

		this.fileWatcher.on("error", (error) => {
			console.error("Error watching ignore file:", error)
		})
	}

	/**
	 * Load custom patterns from .caretignore/.clineignore if it exists.
	 * Supports "!include <filename>" to load additional ignore patterns from other files.
	 */
	private async loadClineIgnore(): Promise<void> {
		try {
			// Reset ignore instance to prevent duplicate patterns
			this.ignoreInstance = ignore()
			const resolvedPath = await this.resolveIgnorePath()
			if (resolvedPath) {
				const content = await fs.readFile(resolvedPath.fullPath, "utf8")
				this.clineIgnoreContent = content
				await this.processIgnoreContent(content)
				this.ignoreInstance.add(resolvedPath.filename)
			} else {
				this.clineIgnoreContent = undefined
			}
		} catch (error) {
			// Should never happen: reading file failed even though it exists
			console.error("Unexpected error loading ignore file:", error)
		}
	}

	/**
	 * Process ignore content and apply all ignore patterns
	 */
	private async processIgnoreContent(content: string): Promise<void> {
		// Optimization: first check if there are any !include directives
		if (!content.includes("!include ")) {
			this.ignoreInstance.add(content)
			return
		}

		// Process !include directives
		const combinedContent = await this.processClineIgnoreIncludes(content)
		this.ignoreInstance.add(combinedContent)
	}

	/**
	 * Process !include directives and combine all included file contents
	 */
	private async processClineIgnoreIncludes(content: string): Promise<string> {
		let combinedContent = ""
		const lines = content.split(/\r?\n/)

		for (const line of lines) {
			const trimmedLine = line.trim()

			if (!trimmedLine.startsWith("!include ")) {
				combinedContent += "\n" + line
				continue
			}

			// Process !include directive
			const includedContent = await this.readIncludedFile(trimmedLine)
			if (includedContent) {
				combinedContent += "\n" + includedContent
			}
		}

		return combinedContent
	}

	/**
	 * Read content from an included file specified by !include directive
	 */
	private async readIncludedFile(includeLine: string): Promise<string | null> {
		const includePath = includeLine.substring("!include ".length).trim()
		const resolvedIncludePath = path.join(this.cwd, includePath)

		if (!(await fileExistsAtPath(resolvedIncludePath))) {
			console.debug(`[ClineIgnore] Included file not found: ${resolvedIncludePath}`)
			return null
		}

		return await fs.readFile(resolvedIncludePath, "utf8")
	}

	/**
	 * Check if a file should be accessible to the LLM
	 * @param filePath - Path to check (relative to cwd)
	 * @returns true if file is accessible, false if ignored
	 */
	validateAccess(filePath: string): boolean {
		// Always allow access if .caretignore/.clineignore does not exist
		if (!this.clineIgnoreContent) {
			return true
		}
		try {
			// Normalize path to be relative to cwd and use forward slashes
			const absolutePath = path.resolve(this.cwd, filePath)
			const relativePath = path.relative(this.cwd, absolutePath).toPosix()

			// Ignore expects paths to be path.relative()'d
			return !this.ignoreInstance.ignores(relativePath)
		} catch (_error) {
			// console.error(`Error validating access for ${filePath}:`, error)
			// Ignore is designed to work with relative file paths, so will throw error for paths outside cwd. We are allowing access to all files outside cwd.
			return true
		}
	}

	/**
	 * Check if a terminal command should be allowed to execute based on file access patterns
	 * @param command - Terminal command to validate
	 * @returns path of file that is being accessed if it is being accessed, undefined if command is allowed
	 */
	validateCommand(command: string): string | undefined {
		// Always allow if no .caretignore/.clineignore exists
		if (!this.clineIgnoreContent) {
			return undefined
		}

		// Split command into parts and get the base command
		const parts = command.trim().split(/\s+/)
		const baseCommand = parts[0].toLowerCase()

		// Commands that read file contents
		const fileReadingCommands = [
			// Unix commands
			"cat",
			"less",
			"more",
			"head",
			"tail",
			"grep",
			"awk",
			"sed",
			// PowerShell commands and aliases
			"get-content",
			"gc",
			"type",
			"select-string",
			"sls",
		]

		if (fileReadingCommands.includes(baseCommand)) {
			// Check each argument that could be a file path
			for (let i = 1; i < parts.length; i++) {
				const arg = parts[i]
				// Skip command flags/options (both Unix and PowerShell style)
				if (arg.startsWith("-") || arg.startsWith("/")) {
					continue
				}
				// Ignore PowerShell parameter names
				if (arg.includes(":")) {
					continue
				}
				// Validate file access
				if (!this.validateAccess(arg)) {
					return arg
				}
			}
		}

		return undefined
	}

	/**
	 * Filter an array of paths, removing those that should be ignored
	 * @param paths - Array of paths to filter (relative to cwd)
	 * @returns Array of allowed paths
	 */
	filterPaths(paths: string[]): string[] {
		try {
			return paths
				.map((p) => ({
					path: p,
					allowed: this.validateAccess(p),
				}))
				.filter((x) => x.allowed)
				.map((x) => x.path)
		} catch (error) {
			console.error("Error filtering paths:", error)
			return [] // Fail closed for security
		}
	}

	/**
	 * Clean up resources when the controller is no longer needed
	 */
	async dispose(): Promise<void> {
		if (this.fileWatcher) {
			await this.fileWatcher.close()
			this.fileWatcher = undefined
		}
	}

	// CARETI MODIFICATION: prefer .caretignore while keeping .clineignore compatibility
	private async resolveIgnorePath(): Promise<{ fullPath: string; filename: string } | null> {
		for (const filename of IGNORE_FILENAMES) {
			const fullPath = path.join(this.cwd, filename)
			if (await fileExistsAtPath(fullPath)) {
				return { fullPath, filename }
			}
		}
		return null
	}
}
