import { afterEach, beforeEach, describe, it } from "mocha"
import "should"
import * as fsUtils from "@utils/fs"
import fs from "fs/promises"
import os from "os"
import path from "path"
import sinon from "sinon"
import {
	getWorkspaceHooksDirs,
	ensureRulesDirectoryExists,
	ensureWorkflowsDirectoryExists,
	ensureHooksDirectoryExists,
	ensureSkillsDirectoryExists,
	ensureMcpServersDirectoryExists,
} from "../disk"
import { StateManager } from "../StateManager"

describe("disk - hooks functionality", () => {
	let sandbox: sinon.SinonSandbox
	let tempDir: string

	beforeEach(async () => {
		sandbox = sinon.createSandbox()
		tempDir = path.join(os.tmpdir(), `disk-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
		await fs.mkdir(tempDir, { recursive: true })
	})

	afterEach(async () => {
		sandbox.restore()
		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch (error) {
			// Ignore cleanup errors
		}
	})

	describe("getWorkspaceHooksDirs", () => {
		it("should return empty array when no workspace roots exist", async () => {
			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => undefined,
			} as any)

			const result = await getWorkspaceHooksDirs()
			result.should.be.an.Array()
			result.length.should.equal(0)
		})

		it("should return empty array when workspace roots is empty array", async () => {
			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [],
			} as any)

			const result = await getWorkspaceHooksDirs()
			result.should.be.an.Array()
			result.length.should.equal(0)
		})

		it("should return empty array when no hooks directories exist", async () => {
			// Create workspace root without hooks directory
			const workspaceRoot = path.join(tempDir, "workspace1")
			await fs.mkdir(workspaceRoot, { recursive: true })

			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [{ path: workspaceRoot }],
			} as any)

			const result = await getWorkspaceHooksDirs()
			result.should.be.an.Array()
			result.length.should.equal(0)
		})

		it("should return hooks directory when it exists", async () => {
			// Create workspace root with hooks directory
			const workspaceRoot = path.join(tempDir, "workspace1")
			// CARETI MODIFICATION: Hooks live under .agents/hooks (not .agents/context/hooks).
			const hooksDir = path.join(workspaceRoot, ".agents", "hooks")
			await fs.mkdir(hooksDir, { recursive: true })

			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [{ path: workspaceRoot }],
			} as any)

			const result = await getWorkspaceHooksDirs()
			result.should.be.an.Array()
			result.length.should.equal(1)
			result[0].should.equal(hooksDir)
		})

		it("should not return hooks directory if it's a file instead of directory", async () => {
			// Create workspace root with hooks as a file (not directory)
			const workspaceRoot = path.join(tempDir, "workspace1")
			// CARETI MODIFICATION: Hooks live under .agents/hooks.
			const hooksPath = path.join(workspaceRoot, ".agents", "hooks")
			await fs.mkdir(path.dirname(hooksPath), { recursive: true })
			await fs.writeFile(hooksPath, "not a directory")

			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [{ path: workspaceRoot }],
			} as any)

			const result = await getWorkspaceHooksDirs()
			result.should.be.an.Array()
			result.length.should.equal(0)
		})

		it("should return multiple hooks directories for multi-root workspace", async () => {
			// Create multiple workspace roots with hooks directories
			const workspaceRoot1 = path.join(tempDir, "workspace1")
			const workspaceRoot2 = path.join(tempDir, "workspace2")
			// CARETI MODIFICATION: Hooks live under .agents/hooks.
			const hooksDir1 = path.join(workspaceRoot1, ".agents", "hooks")
			const hooksDir2 = path.join(workspaceRoot2, ".agents", "hooks")

			await fs.mkdir(hooksDir1, { recursive: true })
			await fs.mkdir(hooksDir2, { recursive: true })

			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [{ path: workspaceRoot1 }, { path: workspaceRoot2 }],
			} as any)

			const result = await getWorkspaceHooksDirs()
			result.should.be.an.Array()
			result.length.should.equal(2)
			result.should.containEql(hooksDir1)
			result.should.containEql(hooksDir2)
		})

		it("should return only existing hooks directories in multi-root workspace", async () => {
			// Create multiple workspace roots, but only some have hooks directories
			const workspaceRoot1 = path.join(tempDir, "workspace1")
			const workspaceRoot2 = path.join(tempDir, "workspace2")
			const workspaceRoot3 = path.join(tempDir, "workspace3")
			// CARETI MODIFICATION: Hooks live under .agents/hooks.
			const hooksDir1 = path.join(workspaceRoot1, ".agents", "hooks")
			const hooksDir3 = path.join(workspaceRoot3, ".agents", "hooks")

			await fs.mkdir(hooksDir1, { recursive: true })
			await fs.mkdir(workspaceRoot2, { recursive: true }) // No hooks dir
			await fs.mkdir(hooksDir3, { recursive: true })

			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [{ path: workspaceRoot1 }, { path: workspaceRoot2 }, { path: workspaceRoot3 }],
			} as any)

			const result = await getWorkspaceHooksDirs()
			result.should.be.an.Array()
			result.length.should.equal(2)
			result.should.containEql(hooksDir1)
			result.should.containEql(hooksDir3)
			result.should.not.containEql(path.join(workspaceRoot2, ".agents", "hooks"))
		})

		it("should propagate errors when checking directory fails", async () => {
			const workspaceRoot = path.join(tempDir, "workspace1")
			await fs.mkdir(workspaceRoot, { recursive: true })

			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [{ path: workspaceRoot }],
			} as any)

			// Stub isDirectory to throw an error
			sandbox.stub(fsUtils, "isDirectory").rejects(new Error("Permission denied"))

			// Should propagate the error
			try {
				await getWorkspaceHooksDirs()
				throw new Error("Should have thrown")
			} catch (error: any) {
				error.message.should.equal("Permission denied")
			}
		})

		it("should use correct path joining for hooks directory", async () => {
			const workspaceRoot = path.join(tempDir, "workspace1")
			// CARETI MODIFICATION: Hooks live under .agents/hooks.
			const expectedHooksDir = path.join(workspaceRoot, ".agents", "hooks")
			await fs.mkdir(expectedHooksDir, { recursive: true })

			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [{ path: workspaceRoot }],
			} as any)

			const result = await getWorkspaceHooksDirs()
			result[0].should.equal(expectedHooksDir)
			// Verify it uses the correct path separator for the platform
			// CARETI MODIFICATION: Use RegExp constructor to avoid invalid character parsing issues.
			result[0].should.match(new RegExp("\\.agents[\\\\/]hooks$"))
		})

		it("should handle workspace roots with trailing slashes", async () => {
			const workspaceRoot = path.join(tempDir, "workspace1")
			const workspaceRootWithSlash = workspaceRoot + path.sep
			// CARETI MODIFICATION: Hooks live under .agents/hooks.
			const hooksDir = path.join(workspaceRoot, ".agents", "hooks")
			await fs.mkdir(hooksDir, { recursive: true })

			sandbox.stub(StateManager, "get").returns({
				getGlobalStateKey: () => [{ path: workspaceRootWithSlash }],
			} as any)

			const result = await getWorkspaceHooksDirs()
			result.should.be.an.Array()
			result.length.should.equal(1)
			result[0].should.equal(hooksDir)
		})
	})
})

// CARETI MODIFICATION: Tests for global directory paths (~/Documents/.agents/ structure)
describe("disk - global directory paths", () => {
	let sandbox: sinon.SinonSandbox
	let tempDir: string

	beforeEach(async () => {
		sandbox = sinon.createSandbox()
		tempDir = path.join(os.tmpdir(), `disk-global-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
		await fs.mkdir(tempDir, { recursive: true })
	})

	afterEach(async () => {
		sandbox.restore()
		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch (error) {
			// Ignore cleanup errors
		}
	})

	describe("global path structure consistency", () => {
		it("ensureRulesDirectoryExists should create .agents/context path", async () => {
			// Stub getDocumentsPath to return our temp directory
			const disk = await import("../disk")
			sandbox.stub(disk, "getDocumentsPath").resolves(tempDir)

			const result = await ensureRulesDirectoryExists()
			// Should end with .agents/context
			result.should.match(/\.agents[\\/]context$/)
		})

		it("ensureWorkflowsDirectoryExists should create .agents/workflows path", async () => {
			const disk = await import("../disk")
			sandbox.stub(disk, "getDocumentsPath").resolves(tempDir)

			const result = await ensureWorkflowsDirectoryExists()
			result.should.match(/\.agents[\\/]workflows$/)
		})

		it("ensureHooksDirectoryExists should create .agents/hooks path", async () => {
			const disk = await import("../disk")
			sandbox.stub(disk, "getDocumentsPath").resolves(tempDir)

			const result = await ensureHooksDirectoryExists()
			result.should.match(/\.agents[\\/]hooks$/)
		})

		it("ensureSkillsDirectoryExists should create .agents/skills path", async () => {
			const disk = await import("../disk")
			sandbox.stub(disk, "getDocumentsPath").resolves(tempDir)

			const result = await ensureSkillsDirectoryExists()
			result.should.match(/\.agents[\\/]skills$/)
		})

		it("ensureMcpServersDirectoryExists should create .agents/mcp path", async () => {
			const disk = await import("../disk")
			sandbox.stub(disk, "getDocumentsPath").resolves(tempDir)

			const result = await ensureMcpServersDirectoryExists()
			result.should.match(/\.agents[\\/]mcp$/)
		})

		it("all global directories should be under .agents folder", async function () {
			// CARETI MODIFICATION: 모듈 내부 호출은 stub을 우회해 실제 getDocumentsPath(Windows에서
			// PowerShell 스폰)가 5회 실행되므로 기본 2초 타임아웃으로는 플레이키 — 여유 있게 확장
			this.timeout(15000)
			const disk = await import("../disk")
			sandbox.stub(disk, "getDocumentsPath").resolves(tempDir)

			const rulesDir = await ensureRulesDirectoryExists()
			const workflowsDir = await ensureWorkflowsDirectoryExists()
			const hooksDir = await ensureHooksDirectoryExists()
			const skillsDir = await ensureSkillsDirectoryExists()
			const mcpDir = await ensureMcpServersDirectoryExists()

			// All should contain .agents in path
			rulesDir.should.containEql(".agents")
			workflowsDir.should.containEql(".agents")
			hooksDir.should.containEql(".agents")
			skillsDir.should.containEql(".agents")
			mcpDir.should.containEql(".agents")

			// Verify lowercase subdirectory names (consistent with project structure)
			rulesDir.should.match(/context$/)
			workflowsDir.should.match(/workflows$/)
			hooksDir.should.match(/hooks$/)
			skillsDir.should.match(/skills$/)
			mcpDir.should.match(/mcp$/)
		})
	})
})
