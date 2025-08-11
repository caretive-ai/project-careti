import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import simpleGit from "simple-git"
import { GitOperations } from "../CheckpointGitOperations"
import { listFiles } from "../../../services/glob/list-files"

describe("CheckpointIssueResolution", () => {
	let tempDir: string
	let gitOperations: GitOperations

	beforeEach(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "checkpoint-test-"))
		gitOperations = new GitOperations(tempDir)
	})

	afterEach(async () => {
		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch (error) {
			// Ignore cleanup errors
		}
	})

	describe("�??�일�?문제 ?�결", () => {
		it("?�로??shadow git?�서 core.longpaths=true ?�정???�용?�어???�다", async () => {
			// RED: ???�스?�는 ?�재 ?�패??것입?�다
			const gitPath = path.join(tempDir, ".git")

			await gitOperations.initShadowGit(gitPath, tempDir, "test-task")

			const git = simpleGit(tempDir)
			const longpathsConfig = await git.getConfig("core.longpaths")

			expect(longpathsConfig.value).toBe("true")
		})

		it("기존 shadow git?�서 core.longpaths=true ?�정???�용?�어???�다", async () => {
			// RED: ???�스?�는 ?�재 ?�패??것입?�다
			const gitPath = path.join(tempDir, ".git")

			// 먼�? 기존 git repo ?�성 (longpaths ?�이)
			const git = simpleGit(tempDir)
			await git.init()
			await git.addConfig("core.worktree", tempDir)
			await git.addConfig("user.name", "Test User")
			await git.addConfig("user.email", "test@example.com")

			// 기존 repo???�??initShadowGit ?�출
			await gitOperations.initShadowGit(gitPath, tempDir, "test-task")

			const longpathsConfig = await git.getConfig("core.longpaths")
			expect(longpathsConfig.value).toBe("true")
		})

		it("Windows?�서�?core.longpaths ?�정???�용?�어???�다", async () => {
			const gitPath = path.join(tempDir, ".git")

			await gitOperations.initShadowGit(gitPath, tempDir, "test-task")

			const git = simpleGit(tempDir)
			const longpathsConfig = await git.getConfig("core.longpaths")

			if (process.platform === "win32") {
				expect(longpathsConfig.value).toBe("true")
			} else {
				expect(longpathsConfig.value).toBe("")
			}
		})
	})

	describe("Globbing timeout 문제 ?�결", () => {
		it("?�볼�?링크가 ?�어??followSymbolicLinks=false�?무한 루프�?방�??�야 ?�다", async () => {
			// ?�스???�일 구조 ?�성
			const testFile = path.join(tempDir, "test.txt")
			await fs.writeFile(testFile, "test content")

			// ?�볼�?링크 ?�성 (Windows?�서??권한 문제�?건너?????�음)
			try {
				const symlinkPath = path.join(tempDir, "symlink")
				await fs.symlink(tempDir, symlinkPath)
			} catch (error) {
				// Windows?�서 권한 ?�으�??�스??건너?�기
				if (process.platform === "win32") {
					console.warn("Skipping symlink test on Windows due to permissions")
					return
				}
				throw error
			}

			// RED: ?�재 followSymbolicLinks ?�정???�어???�간???�래 걸리거나 무한 루프가 발생?????�습?�다
			const startTime = Date.now()
			const [files] = await listFiles(tempDir, true, 1000)
			const duration = Date.now() - startTime

			// 5�??�내???�료?�어????(무한 루프 방�?)
			expect(duration).toBeLessThan(5000)
			expect(files.length).toBeGreaterThan(0)
		})

		it("followSymbolicLinks=false ?�션???�용?�어 ?�어???�다", async () => {
			// ???�스?�는 구현???�인?�는 ?�도
			// RED: ?�재 list-files.ts??followSymbolicLinks: false가 ?�어???�패??것입?�다

			const listFilesPath = path.join(__dirname, "../../../services/glob/list-files.ts")
			const content = await fs.readFile(listFilesPath, "utf8")

			expect(content).toContain("followSymbolicLinks: false")
		})
	})
})
