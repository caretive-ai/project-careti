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

	describe("긴 파일명 문제 해결", () => {
		it("새로운 shadow git에서 core.longpaths=true 설정이 적용되어야 한다", async () => {
			// RED: 이 테스트는 현재 실패할 것입니다
			const gitPath = path.join(tempDir, ".git")

			await gitOperations.initShadowGit(gitPath, tempDir, "test-task")

			const git = simpleGit(tempDir)
			const longpathsConfig = await git.getConfig("core.longpaths")

			expect(longpathsConfig.value).toBe("true")
		})

		it("기존 shadow git에서 core.longpaths=true 설정이 적용되어야 한다", async () => {
			// RED: 이 테스트는 현재 실패할 것입니다
			const gitPath = path.join(tempDir, ".git")

			// 먼저 기존 git repo 생성 (longpaths 없이)
			const git = simpleGit(tempDir)
			await git.init()
			await git.addConfig("core.worktree", tempDir)
			await git.addConfig("user.name", "Test User")
			await git.addConfig("user.email", "test@example.com")

			// 기존 repo에 대해 initShadowGit 호출
			await gitOperations.initShadowGit(gitPath, tempDir, "test-task")

			const longpathsConfig = await git.getConfig("core.longpaths")
			expect(longpathsConfig.value).toBe("true")
		})

		it("Windows에서만 core.longpaths 설정이 적용되어야 한다", async () => {
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

	describe("Globbing timeout 문제 해결", () => {
		it("심볼릭 링크가 있어도 followSymbolicLinks=false로 무한 루프를 방지해야 한다", async () => {
			// 테스트 파일 구조 생성
			const testFile = path.join(tempDir, "test.txt")
			await fs.writeFile(testFile, "test content")

			// 심볼릭 링크 생성 (Windows에서는 권한 문제로 건너뛸 수 있음)
			try {
				const symlinkPath = path.join(tempDir, "symlink")
				await fs.symlink(tempDir, symlinkPath)
			} catch (error) {
				// Windows에서 권한 없으면 테스트 건너뛰기
				if (process.platform === "win32") {
					console.warn("Skipping symlink test on Windows due to permissions")
					return
				}
				throw error
			}

			// RED: 현재 followSymbolicLinks 설정이 없어서 시간이 오래 걸리거나 무한 루프가 발생할 수 있습니다
			const startTime = Date.now()
			const [files] = await listFiles(tempDir, true, 1000)
			const duration = Date.now() - startTime

			// 5초 이내에 완료되어야 함 (무한 루프 방지)
			expect(duration).toBeLessThan(5000)
			expect(files.length).toBeGreaterThan(0)
		})

		it("followSymbolicLinks=false 옵션이 적용되어 있어야 한다", async () => {
			// 이 테스트는 구현을 확인하는 용도
			// RED: 현재 list-files.ts에 followSymbolicLinks: false가 없어서 실패할 것입니다

			const listFilesPath = path.join(__dirname, "../../../services/glob/list-files.ts")
			const content = await fs.readFile(listFilesPath, "utf8")

			expect(content).toContain("followSymbolicLinks: false")
		})
	})
})
