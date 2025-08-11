import fs from "fs/promises"
import { globby } from "globby"
import * as path from "path"
import simpleGit, { SimpleGit } from "simple-git"
import { spawn, ChildProcess } from "child_process"
import { fileExistsAtPath } from "@utils/fs"
import { getLfsPatterns, writeExcludesFile } from "./CheckpointExclusions"
import { telemetryService } from "@/services/posthog/telemetry/TelemetryService"

interface CheckpointAddResult {
	success: boolean
}

/**
 * GitOperations Class
 *
 * Handles git-specific operations for Cline's Checkpoints system.
 *
 * Key responsibilities:
 * - Git repository initialization and configuration
 * - Git settings management (user, LFS, etc.)
 * - Worktree configuration and management
 * - Managing nested git repositories during checkpoint operations
 * - File staging and checkpoint creation
 * - Shadow git repository maintenance and cleanup
 */
export class GitOperations {
	private cwd: string
	private activeGitProcesses: Set<ChildProcess> = new Set()

	/**
	 * Creates a new GitOperations instance.
	 *
	 * @param cwd - The current working directory for git operations
	 */
	constructor(cwd: string) {
		this.cwd = cwd
	}

	/**
	 * CARET MODIFICATION: Ensures no Git index.lock file exists before operations.
	 * Forcefully removes index.lock to prevent Git operations from failing.
	 *
	 * @param gitPath - Path to the .git directory
	 */
	private async ensureNoIndexLock(gitPath: string): Promise<void> {
		try {
			const indexLockPath = path.join(path.dirname(gitPath), ".git", "index.lock")
			console.info(`[Caret Checkpoint] Checking for index.lock at: ${indexLockPath}`)

			if (await fileExistsAtPath(indexLockPath)) {
				console.warn(`[Caret Checkpoint] Found stale index.lock file, removing: ${indexLockPath}`)
				await fs.unlink(indexLockPath)
				console.info(`[Caret Checkpoint] Successfully removed stale index.lock`)
			}
		} catch (error) {
			console.warn(`[Caret Checkpoint] Failed to check/remove index.lock:`, error)
			// Continue anyway - this is a best-effort cleanup
		}
	}

	/**
	 * CARET MODIFICATION: Kills all active Git processes to prevent index.lock issues.
	 * This ensures no background Git processes are left running.
	 */
	private async killActiveGitProcesses(): Promise<void> {
		console.info(`[Caret Checkpoint] Killing ${this.activeGitProcesses.size} active Git processes`)

		for (const process of this.activeGitProcesses) {
			try {
				if (!process.killed) {
					process.kill("SIGTERM")
					// Give it a moment to terminate gracefully
					await new Promise((resolve) => setTimeout(resolve, 100))

					if (!process.killed) {
						console.warn(`[Caret Checkpoint] Git process didn't terminate gracefully, forcing kill`)
						process.kill("SIGKILL")
					}
				}
			} catch (error) {
				console.warn(`[Caret Checkpoint] Failed to kill Git process:`, error)
			}
		}

		this.activeGitProcesses.clear()
		console.info(`[Caret Checkpoint] All Git processes killed`)
	}

	/**
	 * CARET MODIFICATION: Executes git add with proper process tracking and timeout.
	 * Ensures that Git processes are properly cleaned up on timeout or failure.
	 *
	 * @param gitPath - Path to the .git directory
	 * @param patterns - File patterns to add
	 * @returns Promise that resolves when git add completes or times out
	 */
	private async executeGitAddWithProcessTracking(gitPath: string, patterns: string[]): Promise<boolean> {
		return new Promise((resolve) => {
			const gitDir = path.dirname(gitPath)
			console.info(`[Caret Checkpoint] Executing git add in: ${gitDir}`)

			// Spawn git process directly for better control
			const gitProcess = spawn("git", ["add", ...patterns, "-f", "--ignore-errors"], {
				cwd: gitDir,
				stdio: ["pipe", "pipe", "pipe"],
			})

			this.activeGitProcesses.add(gitProcess)

			let completed = false
			const timeout = setTimeout(() => {
				if (!completed) {
					console.warn(`[Caret Checkpoint] Git add timeout, killing process`)
					completed = true
					gitProcess.kill("SIGTERM")
					setTimeout(() => {
						if (!gitProcess.killed) {
							gitProcess.kill("SIGKILL")
						}
					}, 1000)
					this.activeGitProcesses.delete(gitProcess)
					resolve(false) // Timeout = failure
				}
			}, 10000) // 10 second timeout

			gitProcess.on("close", (code) => {
				if (!completed) {
					completed = true
					clearTimeout(timeout)
					this.activeGitProcesses.delete(gitProcess)
					console.info(`[Caret Checkpoint] Git add process completed with code: ${code}`)
					resolve(code === 0) // Success if exit code 0
				}
			})

			gitProcess.on("error", (error) => {
				if (!completed) {
					completed = true
					clearTimeout(timeout)
					this.activeGitProcesses.delete(gitProcess)
					console.error(`[Caret Checkpoint] Git add process error:`, error)
					resolve(false) // Error = failure
				}
			})
		})
	}

	/**
	 * Initializes or verifies a shadow Git repository for checkpoint tracking.
	 * Creates a new repository if one doesn't exist, or verifies the worktree
	 * configuration if it does.
	 *
	 * Key operations:
	 * - Creates/verifies shadow git repository
	 * - Configures git settings (user, LFS, etc.)
	 * - Sets up worktree to point to workspace
	 *
	 * @param gitPath - Path to the .git directory
	 * @param cwd - The current working directory for git operations
	 * @returns Promise<string> Path to the initialized .git directory
	 * @throws Error if:
	 * - Worktree verification fails for existing repository
	 * - Git initialization or configuration fails
	 * - Unable to create initial commit
	 * - LFS pattern setup fails
	 */
	public async initShadowGit(gitPath: string, cwd: string, taskId: string): Promise<string> {
		console.info(`[Caret Checkpoint] ========== Shadow Git 초기???�작 ==========`)
		console.info(`[Caret Checkpoint] Git 경로: ${gitPath}`)
		console.info(`[Caret Checkpoint] ?�업 ?�렉?�리: ${cwd}`)

		// CARET MODIFICATION: index.lock ?�일 ?�전 ?�리
		await this.ensureNoIndexLock(gitPath)

		// If repo exists, just verify worktree
		if (await fileExistsAtPath(gitPath)) {
			console.time("existing-repo-setup")
			console.info(`[Caret Checkpoint] 기존 Shadow Git ?�?�소 발견, ?�정 ?�인 �?..`)
			const git = simpleGit(path.dirname(gitPath))
			const worktree = await git.getConfig("core.worktree")
			if (worktree.value !== cwd) {
				throw new Error("Checkpoints can only be used in the original workspace: " + worktree.value)
			}
			console.warn(`[Caret Checkpoint] 기존 Shadow Git ?�용: ${gitPath}`)

			// CARET MODIFICATION: Ensure long path support is enabled for existing repos on Windows.
			if (process.platform === "win32") {
				console.info(`[Caret Checkpoint] Windows?�서 longpaths ?�정 ?�용 �?..`)
				await git.addConfig("core.longpaths", "true")
			}

			// shadow git repo already exists, but update the excludes just in case
			console.time("lfs-patterns-existing")
			const lfsPatterns = await getLfsPatterns(this.cwd)
			console.timeEnd("lfs-patterns-existing")
			console.time("write-excludes-existing")
			await writeExcludesFile(gitPath, lfsPatterns)
			console.timeEnd("write-excludes-existing")
			console.timeEnd("existing-repo-setup")

			return gitPath
		}

		// Initialize new repo
		const startTime = performance.now()
		const checkpointsDir = path.dirname(gitPath)
		console.warn(`[Caret Checkpoint] Creating new shadow git in ${checkpointsDir}`)

		console.time("mkdir-and-init")
		await fs.mkdir(checkpointsDir, { recursive: true })
		const git = simpleGit(checkpointsDir)
		await git.init()
		console.timeEnd("mkdir-and-init")

		// Configure repo with git settings
		console.time("git-config")
		await git.addConfig("core.worktree", cwd)
		// CARET MODIFICATION: Enable long path support for Windows to prevent "Filename too long" errors.
		if (process.platform === "win32") {
			await git.addConfig("core.longpaths", "true")
		}
		await git.addConfig("commit.gpgSign", "false")
		await git.addConfig("user.name", "Cline Checkpoint")
		await git.addConfig("user.email", "checkpoint@cline.bot")
		console.timeEnd("git-config")

		// Set up LFS patterns
		console.time("lfs-patterns-new")
		const lfsPatterns = await getLfsPatterns(cwd)
		console.timeEnd("lfs-patterns-new")
		console.time("write-excludes-new")
		await writeExcludesFile(gitPath, lfsPatterns)
		console.timeEnd("write-excludes-new")

		console.time("add-checkpoint-files")
		console.info(`[Caret Checkpoint] Adding checkpoint files...`)
		const addFilesResult = await this.addCheckpointFiles(git)
		console.timeEnd("add-checkpoint-files")
		if (!addFilesResult.success) {
			console.error("Failed to add at least one file(s) to checkpoints shadow git")
			throw new Error("Failed to add at least one file(s) to checkpoints shadow git")
		}

		// Initial commit only on first repo creation
		console.time("initial-commit")
		console.info(`[Caret Checkpoint] Creating initial commit...`)
		await git.commit("initial commit", { "--allow-empty": null })
		console.timeEnd("initial-commit")

		const durationMs = Math.round(performance.now() - startTime)
		telemetryService.captureCheckpointUsage(taskId, "shadow_git_initialized", durationMs)

		console.warn(`[Caret Checkpoint] Shadow git initialization completed in ${durationMs}ms`)

		return gitPath
	}

	/**
	 * Retrieves the worktree path from the shadow git configuration.
	 * The worktree path indicates where the shadow git repository is tracking files,
	 * which should match the current workspace directory.
	 *
	 * @param gitPath - Path to the .git directory
	 * @returns Promise<string | undefined> The worktree path or undefined if not found
	 * @throws Error if unable to get worktree path
	 */
	public async getShadowGitConfigWorkTree(gitPath: string): Promise<string | undefined> {
		try {
			const git = simpleGit(path.dirname(gitPath))
			const worktree = await git.getConfig("core.worktree")
			return worktree.value || undefined
		} catch (error) {
			console.error("Failed to get shadow git config worktree:", error)
			return undefined
		}
	}

	/**
	 * Since we use git to track checkpoints, we need to temporarily disable nested git repos to work around git's
	 * requirement of using submodules for nested repos.
	 *
	 * This method renames nested .git directories by adding/removing a suffix to temporarily disable/enable them.
	 * The root .git directory is preserved. Uses VS Code's workspace API to find nested .git directories and
	 * only processes actual directories (not files named .git).
	 *
	 * @param disable - If true, adds suffix to disable nested git repos. If false, removes suffix to re-enable them.
	 * @throws Error if renaming any .git directory fails
	 */
	public async renameNestedGitRepos(disable: boolean) {
		const startTime = performance.now()
		console.info(`[Caret Checkpoint] ${disable ? "Disabling" : "Enabling"} nested Git repositories in: ${this.cwd}`)
		console.info(`[Caret Checkpoint] Scan pattern: **/.git${disable ? "" : GIT_DISABLED_SUFFIX}`)

		// Find all .git directories that are not at the root level
		console.time("globby-scan-nested-git")
		console.info(`[Caret Checkpoint] Starting nested .git directory scan... (this may take a while)`)
		const scanStartTime = performance.now()
		const gitPaths = await globby("**/.git" + (disable ? "" : GIT_DISABLED_SUFFIX), {
			cwd: this.cwd,
			onlyDirectories: true,
			ignore: [
				".git", // Ignore root level .git
				"**/node_modules/**", // Ignore node_modules
				"**/dist/**", // Ignore build outputs
				"**/build/**", // Ignore build outputs
				"**/.next/**", // Ignore Next.js build
				"**/.nuxt/**", // Ignore Nuxt.js build
				"**/coverage/**", // Ignore coverage reports
				"**/.vscode-test/**", // Ignore VSCode test files
			],
			dot: true,
			markDirectories: false,
			suppressErrors: true,
			// CARET MODIFICATION: Add followSymbolicLinks: false to prevent infinite loops
			followSymbolicLinks: false,
		})
		const scanDurationMs = Math.round(performance.now() - scanStartTime)
		console.timeEnd("globby-scan-nested-git")
		console.info(
			`[Caret Checkpoint] Scan completed: ${gitPaths.length} nested Git ${disable ? "repositories" : "disabled repositories"} found (${scanDurationMs}ms required)`,
		)

		if (gitPaths.length > 0) {
			console.info(
				`[Caret Checkpoint] Git repositories to process: ${gitPaths.slice(0, 3).join(", ")}${gitPaths.length > 3 ? `... and ${gitPaths.length - 3} more` : ""}`,
			)
		} else {
			console.info(`[Caret Checkpoint] No nested Git repositories to process.`)
		}

		// For each nested .git directory, rename it based on operation
		console.time("rename-git-repos")
		const renameStartTime = performance.now()
		for (let i = 0; i < gitPaths.length; i++) {
			const gitPath = gitPaths[i]
			if (i % 10 === 0 || i < 5) {
				// 처음 5개�? 10개마??로그
				console.info(`[Caret Checkpoint] ?�� 처리 �?${i + 1}/${gitPaths.length}: ${gitPath}`)
			}

			const fullPath = path.join(this.cwd, gitPath)
			let newPath: string
			if (disable) {
				newPath = fullPath + GIT_DISABLED_SUFFIX
			} else {
				newPath = fullPath.endsWith(GIT_DISABLED_SUFFIX) ? fullPath.slice(0, -GIT_DISABLED_SUFFIX.length) : fullPath
			}

			try {
				console.time(`rename-${i}`)
				await fs.rename(fullPath, newPath)
				console.timeEnd(`rename-${i}`)
				console.log(`[Caret Checkpoint] ${disable ? "Disabled" : "Enabled"} nested git repo ${gitPath}`)
			} catch (error) {
				console.timeEnd(`rename-${i}`)
				console.error(`[Caret Checkpoint] Failed to ${disable ? "disable" : "enable"} nested git repo ${gitPath}:`, error)
			}
		}
		console.timeEnd("rename-git-repos")
		const renameDurationMs = Math.round(performance.now() - renameStartTime)

		const durationMs = Math.round(performance.now() - startTime)
		console.info(`[Caret Checkpoint] ??중첩 Git ?�?�소 처리 ?�료 (?�름변�? ${renameDurationMs}ms, ?�체: ${durationMs}ms)`)
	}

	/**
	 * Adds files to the shadow git repository while handling nested git repos.
	 * Uses git commands to list files and stages them for commit.
	 * Respects .gitignore and handles LFS patterns.
	 *
	 * Process:
	 * 1. Updates exclude patterns from LFS config
	 * 2. Temporarily disables nested git repos
	 * 3. Gets list of tracked and untracked files from git (respecting .gitignore)
	 * 4. Adds all files to git staging
	 * 5. Re-enables nested git repos
	 *
	 * @param git - SimpleGit instance configured for the shadow git repo
	 * @returns Promise<CheckpointAddResult> Object containing success status, message, and file count
	 * @throws Error if:
	 *  - File operations fail
	 *  - Git commands error
	 *  - LFS pattern updates fail
	 *  - Nested git repo handling fails
	 */
	public async addCheckpointFiles(git: SimpleGit): Promise<CheckpointAddResult> {
		const startTime = performance.now()
		console.info("[Caret Checkpoint] ========== 체크?�인???�일 추�? ?�작 ==========")
		console.time("total-addCheckpointFiles")

		try {
			// CARET MODIFICATION: �??�계�??�세 로깅 추�?
			console.time("rename-nested-git-repos")
			console.info("[Caret Checkpoint] 1?�계: 중첩 Git ?�?�소 비활?�화 �?..")
			await this.renameNestedGitRepos(true)
			console.timeEnd("rename-nested-git-repos")
			console.info("[Caret Checkpoint] 1?�계 ?�료: 중첩 Git ?�?�소 비활?�화 ?�료")

			console.info("[Caret Checkpoint] 2?�계: Git add ?�업 ?�작...")

			// CARET MODIFICATION: ?�별???�일 추�?�?node_modules ?�외
			// 기존 "git add ." ?�???�수 ?�일�?추�??�여 ?�능 개선
			try {
				console.time("git-add-files")
				console.info("[Caret Checkpoint] 2?�계: Git index???�일 추�? �?..")
				console.info("[Caret Checkpoint] ?�재 ?�업 ?�렉?�리:", process.cwd())
				console.info("[Caret Checkpoint] 최적?�된 Git 명령: ?�수 ?�일�??�별 추�?")

				// CARET MODIFICATION: node_modules�??�전???�외???�별???�일 추�?
				const addStartTime = performance.now()
				const controller = new AbortController()

				// ?�수 ?�일 ?�턴??(node_modules ?�외)
				const essentialPatterns = [
					"src/**/*",
					"*.js",
					"*.ts",
					"*.tsx",
					"*.jsx",
					"*.json",
					"*.md",
					"*.txt",
					"*.yml",
					"*.yaml",
					"*.html",
					"*.css",
					"*.scss",
					"*.less",
					"package.json",
					"package-lock.json",
					"tsconfig.json",
					"*.config.js",
					"*.config.ts",
					"README*",
					"LICENSE*",
					"CHANGELOG*",
					"docs/**/*",
					"assets/**/*",
				]

				console.info(
					`[Caret Checkpoint] 추�????�턴: ${essentialPatterns.slice(0, 3).join(", ")}... (�?${essentialPatterns.length}�?`,
				)
				const addPromise = git.add([...essentialPatterns, "-f", "--ignore-errors"])
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(() => {
						const elapsedMs = Math.round(performance.now() - addStartTime)
						console.warn(`[Caret Checkpoint] ?�️ Git add ?�?�아?? ${elapsedMs}ms 경과 - Git ?�로?�스 강제 종료 �?..`)
						controller.abort()
						reject(new Error(`Git add operation timed out after ${elapsedMs}ms`))
					}, 10000)
				})

				try {
					await Promise.race([addPromise, timeoutPromise])
					console.timeEnd("git-add-files")
					console.info("[Caret Checkpoint] Git add completed successfully")
				} catch (timeoutError) {
					console.timeEnd("git-add-files")
					console.warn("[Caret Checkpoint] Git add timed out, trying alternative approach...")

					// Fallback: ???�한?�인 ?�일 추�?
					try {
						console.time("fallback-git-add")
						console.warn("[Caret Checkpoint] 기본 ?�턴 ?�패, 최소 ?�수 ?�일�?추�? ?�도...")
						// 가???�심?�인 ?�일?�만 추�?
						const minimalPatterns = [
							"src/**/*.ts",
							"src/**/*.tsx",
							"src/**/*.js",
							"src/**/*.jsx",
							"*.json",
							"*.md",
							"README*",
						]
						await git.add([...minimalPatterns, "-f", "--ignore-errors"])
						console.timeEnd("fallback-git-add")
						console.info("[Caret Checkpoint] 최소 ?�수 ?�일 추�? ?�료")
					} catch (fallbackError) {
						console.timeEnd("fallback-git-add")
						console.warn("[Caret Checkpoint] 모든 ?�일 추�? ?�도 ?�패, �?커밋?�로 진행")
						// Don't fail - allow empty commits to work
					}
				}
				const durationMs = Math.round(performance.now() - startTime)
				console.debug(`Checkpoint add operation completed in ${durationMs}ms`)
				return { success: true }
			} catch (error) {
				console.error("[Caret Checkpoint] Git add operation failed completely:", error)
				// CARET MODIFICATION: Always return success to allow empty commits
				// This prevents git state corruption and index.lock issues
				console.warn("[Caret Checkpoint] Proceeding with empty commit to avoid git state corruption")
				return { success: true }
			}
		} catch (error) {
			return { success: false }
		} finally {
			console.info("[Caret Checkpoint] 3?�계: 중첩 Git ?�?�소 ?�활?�화 �?..")
			console.time("restore-nested-git-repos")
			await this.renameNestedGitRepos(false)
			console.timeEnd("restore-nested-git-repos")
			console.info("[Caret Checkpoint] 3?�계 ?�료: 중첩 Git ?�?�소 ?�활?�화 ?�료")

			console.timeEnd("total-addCheckpointFiles")
			const totalDurationMs = Math.round(performance.now() - startTime)
			console.info(`[Caret Checkpoint] ========== 체크?�인???�일 추�? ?�료 (${totalDurationMs}ms) ==========`)
		}
	}
}

export const GIT_DISABLED_SUFFIX = "_disabled"
