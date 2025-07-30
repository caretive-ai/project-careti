import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"
import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import simpleGit from "simple-git"
import CheckpointTracker from "../../../../src/integrations/checkpoints/CheckpointTracker"
import { getWorkingDirectory } from "../../../../src/integrations/checkpoints/CheckpointUtils"

// Mock getWorkingDirectory to point to our temporary directory
vi.mock("../../../../src/integrations/checkpoints/CheckpointUtils", () => ({
	getWorkingDirectory: vi.fn(),
	hashWorkingDir: vi.fn((dir) => "testhash"),
	getShadowGitPath: vi.fn((globalStorage, taskId, cwdHash) => path.join(globalStorage, "checkpoints", cwdHash, ".git")),
}))

// This test suite is for the specific "meta-repository" case where Caret
// is operating on its own source code, which caused hangs and errors.
describe("Checkpoint Integration Tests - Meta Repo", () => {
	let tempDir: string

	// Create a complex temporary git repository that mimics the Caret project structure
	beforeAll(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "caret-meta-repo-test-"))
		vi.mocked(getWorkingDirectory).mockResolvedValue(tempDir)

		const git = simpleGit(tempDir)
		await git.init()
		await git.addConfig("user.name", "Test User")
		await git.addConfig("user.email", "test@example.com")

		// Create a structure similar to the Caret project
		await fs.mkdir(path.join(tempDir, "src", "integrations"), { recursive: true })
		await fs.writeFile(path.join(tempDir, "src", "extension.ts"), "console.log('hello')")
		await fs.writeFile(path.join(tempDir, ".caretrules"), "{}")
		await fs.writeFile(path.join(tempDir, "package.json"), '{ "name": "caret" }')
		await fs.mkdir(path.join(tempDir, "node_modules", "some-lib"), { recursive: true })
		await fs.writeFile(path.join(tempDir, "node_modules", "some-lib", "index.js"), "module.exports = {};")

		// Create a nested .git directory to simulate submodules or similar structures
		const nestedGitDir = path.join(tempDir, "src", "integrations", ".git")
		await fs.mkdir(nestedGitDir, { recursive: true })

		// Add a .gitignore to exclude node_modules and the test storage directory
		await fs.writeFile(path.join(tempDir, ".gitignore"), "node_modules\n.vscode-test")

		await git.add(".")
		await git.commit("Initial commit")
	})

	// Cleanup the temporary directory
	afterAll(async () => {
		await fs.rm(tempDir, { recursive: true, force: true })
	})

	it("should successfully create a checkpoint in a meta-repository scenario", async () => {
		const taskId = "meta-repo-task-1"
		const globalStoragePath = path.join(tempDir, ".vscode-test", "globalStorage")
		await fs.mkdir(globalStoragePath, { recursive: true })

		const tracker = await CheckpointTracker.create(taskId, globalStoragePath, true)
		expect(tracker).toBeDefined()

		const commitHash = await tracker?.commit()

		// This assertion should now pass, as the corrected code should produce a valid commit hash.
		expect(commitHash).toBeDefined()
		expect(typeof commitHash).toBe("string")
		expect(commitHash?.length).toBeGreaterThan(0)
	})
})
