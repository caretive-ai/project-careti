import { describe, it, beforeEach, afterEach } from "mocha"
import { expect } from "chai"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { refreshExternalRulesToggles } from "../core/context/instructions/user-instructions/external-rules"
import { Controller } from "../core/controller"

// CARET MODIFICATION: Integration tests for rule priority system
// Tests actual file system behavior, not just mocked functions

// Mock controller for testing
const createMockController = (): Controller =>
	({
		cacheService: {
			getWorkspaceStateKey: (key: string) => ({}),
			setWorkspaceState: (key: string, value: any) => {},
		},
	}) as any as Controller

describe("Rule Priority System - File System Integration", () => {
	let tempDir: string
	let mockController: Controller

	beforeEach(() => {
		// Create a temporary directory for each test
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "caret-test-"))
		mockController = createMockController()
	})

	afterEach(() => {
		// Clean up temporary directory
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
	})

	it("should only enable .caretrules when multiple rule files exist", async () => {
		// Create test files
		fs.writeFileSync(path.join(tempDir, ".caretrules"), "Use TypeScript")
		fs.writeFileSync(path.join(tempDir, ".cursorrules"), "Use Python")
		fs.writeFileSync(path.join(tempDir, ".windsurfrules"), "Use Go")

		// Test refreshExternalRulesToggles
		const result = await refreshExternalRulesToggles(mockController, tempDir)

		// .caretrules should be enabled (true)
		const caretRulesPath = path.join(tempDir, ".caretrules")
		expect(result.caretLocalToggles[caretRulesPath]).to.be.true

		// Other rules should be disabled (false) due to priority
		const cursorRulesPath = path.join(tempDir, ".cursorrules")
		const windsurfRulesPath = path.join(tempDir, ".windsurfrules")
		expect(result.cursorLocalToggles[cursorRulesPath]).to.be.false
		expect(result.windsurfLocalToggles[windsurfRulesPath]).to.be.false
	})

	it("should only enable .windsurfrules when .caretrules is not present", async () => {
		// Create test files (no .caretrules)
		fs.writeFileSync(path.join(tempDir, ".cursorrules"), "Use Python")
		fs.writeFileSync(path.join(tempDir, ".windsurfrules"), "Use Go")

		// Test refreshExternalRulesToggles
		const result = await refreshExternalRulesToggles(mockController, tempDir)

		// .windsurfrules should be enabled (true)
		const windsurfRulesPath = path.join(tempDir, ".windsurfrules")
		expect(result.windsurfLocalToggles[windsurfRulesPath]).to.be.true

		// .cursorrules should be disabled (false) due to priority
		const cursorRulesPath = path.join(tempDir, ".cursorrules")
		expect(result.cursorLocalToggles[cursorRulesPath]).to.be.false

		// .caretrules should be empty (no file)
		expect(Object.keys(result.caretLocalToggles)).to.have.length(0)
	})

	it("should only enable .cursorrules when higher priority rules are not present", async () => {
		// Create test files (only .cursorrules)
		fs.writeFileSync(path.join(tempDir, ".cursorrules"), "Use Python")

		// Test refreshExternalRulesToggles
		const result = await refreshExternalRulesToggles(mockController, tempDir)

		// .cursorrules should be enabled (true)
		const cursorRulesPath = path.join(tempDir, ".cursorrules")
		expect(result.cursorLocalToggles[cursorRulesPath]).to.be.true

		// Other rule types should be empty (no files)
		expect(Object.keys(result.caretLocalToggles)).to.have.length(0)
		expect(Object.keys(result.windsurfLocalToggles)).to.have.length(0)
	})

	it("should handle empty directory gracefully", async () => {
		// Empty directory - no rule files

		// Test refreshExternalRulesToggles
		const result = await refreshExternalRulesToggles(mockController, tempDir)

		// All rule types should be empty
		expect(Object.keys(result.caretLocalToggles)).to.have.length(0)
		expect(Object.keys(result.cursorLocalToggles)).to.have.length(0)
		expect(Object.keys(result.windsurfLocalToggles)).to.have.length(0)
	})

	it("should maintain priority when rule files are added dynamically", async () => {
		// Start with only .cursorrules
		fs.writeFileSync(path.join(tempDir, ".cursorrules"), "Use Python")

		let result = await refreshExternalRulesToggles(mockController, tempDir)

		// .cursorrules should be enabled initially
		const cursorRulesPath = path.join(tempDir, ".cursorrules")
		expect(result.cursorLocalToggles[cursorRulesPath]).to.be.true

		// Add .caretrules (higher priority)
		fs.writeFileSync(path.join(tempDir, ".caretrules"), "Use TypeScript")

		result = await refreshExternalRulesToggles(mockController, tempDir)

		// .caretrules should now be enabled
		const caretRulesPath = path.join(tempDir, ".caretrules")
		expect(result.caretLocalToggles[caretRulesPath]).to.be.true

		// .cursorrules should now be disabled due to priority
		expect(result.cursorLocalToggles[cursorRulesPath]).to.be.false
	})

	it("should handle rule file deletion correctly", async () => {
		// Start with .caretrules and .cursorrules
		fs.writeFileSync(path.join(tempDir, ".caretrules"), "Use TypeScript")
		fs.writeFileSync(path.join(tempDir, ".cursorrules"), "Use Python")

		let result = await refreshExternalRulesToggles(mockController, tempDir)

		// .caretrules should be enabled, .cursorrules disabled
		const caretRulesPath = path.join(tempDir, ".caretrules")
		const cursorRulesPath = path.join(tempDir, ".cursorrules")
		expect(result.caretLocalToggles[caretRulesPath]).to.be.true
		expect(result.cursorLocalToggles[cursorRulesPath]).to.be.false

		// Delete .caretrules
		fs.unlinkSync(caretRulesPath)

		result = await refreshExternalRulesToggles(mockController, tempDir)

		// .caretrules should be gone
		expect(Object.keys(result.caretLocalToggles)).to.have.length(0)

		// .cursorrules should now be enabled
		expect(result.cursorLocalToggles[cursorRulesPath]).to.be.true
	})
})
