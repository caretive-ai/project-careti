// CARETI MODIFICATION: Tests for global path migration (~/Documents/Careti/ → ~/Documents/.agents/)
import { afterEach, beforeEach, describe, it } from "mocha"
import "should"
import fs from "fs/promises"
import os from "os"
import path from "path"
import sinon from "sinon"

// Import will be created after tests
import {
	migrateGlobalPaths,
	checkLegacyPathsExist,
	getMigrationStatus,
	setMigrationStatus,
} from "../global-migration"

describe("global-migration", () => {
	let sandbox: sinon.SinonSandbox
	let tempDir: string
	let mockDocumentsPath: string

	beforeEach(async () => {
		sandbox = sinon.createSandbox()
		tempDir = path.join(os.tmpdir(), `global-migration-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
		mockDocumentsPath = path.join(tempDir, "Documents")
		await fs.mkdir(mockDocumentsPath, { recursive: true })
	})

	afterEach(async () => {
		sandbox.restore()
		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch (error) {
			// Ignore cleanup errors
		}
	})

	describe("checkLegacyPathsExist", () => {
		it("should return false when legacy Careti folder does not exist", async () => {
			const result = await checkLegacyPathsExist(mockDocumentsPath)
			result.should.be.false()
		})

		it("should return true when legacy Careti folder exists with content", async () => {
			// Create legacy structure
			const legacyRulesDir = path.join(mockDocumentsPath, "Careti", "Rules")
			await fs.mkdir(legacyRulesDir, { recursive: true })
			await fs.writeFile(path.join(legacyRulesDir, "test-rule.md"), "# Test Rule")

			const result = await checkLegacyPathsExist(mockDocumentsPath)
			result.should.be.true()
		})

		it("should return false when legacy Careti folder exists but is empty", async () => {
			const legacyDir = path.join(mockDocumentsPath, "Careti")
			await fs.mkdir(legacyDir, { recursive: true })

			const result = await checkLegacyPathsExist(mockDocumentsPath)
			result.should.be.false()
		})
	})

	describe("migrateGlobalPaths", () => {
		it("should skip migration when no legacy paths exist", async () => {
			const result = await migrateGlobalPaths(mockDocumentsPath)

			result.migrated.should.be.false()
			result.skipped.should.be.true()
			result.reason!.should.equal("no_legacy_paths")
		})

		it("should skip migration when already migrated", async () => {
			// Create legacy structure
			const legacyRulesDir = path.join(mockDocumentsPath, "Careti", "Rules")
			await fs.mkdir(legacyRulesDir, { recursive: true })
			await fs.writeFile(path.join(legacyRulesDir, "test-rule.md"), "# Test Rule")

			// Set migration flag
			await setMigrationStatus(mockDocumentsPath, true)

			const result = await migrateGlobalPaths(mockDocumentsPath)

			result.migrated.should.be.false()
			result.skipped.should.be.true()
			result.reason!.should.equal("already_migrated")
		})

		it("should migrate Rules to context", async () => {
			// Create legacy Rules
			const legacyRulesDir = path.join(mockDocumentsPath, "Careti", "Rules")
			await fs.mkdir(legacyRulesDir, { recursive: true })
			await fs.writeFile(path.join(legacyRulesDir, "my-rule.md"), "# My Rule Content")
			await fs.writeFile(path.join(legacyRulesDir, "persona.md"), "# Persona")

			const result = await migrateGlobalPaths(mockDocumentsPath)

			result.migrated.should.be.true()
			result.migratedPaths!.should.containEql("Rules → context")

			// Verify files were copied
			const newContextDir = path.join(mockDocumentsPath, ".agents", "context")
			const myRuleContent = await fs.readFile(path.join(newContextDir, "my-rule.md"), "utf8")
			myRuleContent.should.equal("# My Rule Content")

			const personaContent = await fs.readFile(path.join(newContextDir, "persona.md"), "utf8")
			personaContent.should.equal("# Persona")
		})

		it("should migrate all subdirectories with correct mapping", async () => {
			// Create all legacy subdirectories
			const legacyBase = path.join(mockDocumentsPath, "Careti")
			const subdirs = ["Rules", "Workflows", "Skills", "Hooks", "MCP"]

			for (const subdir of subdirs) {
				const dir = path.join(legacyBase, subdir)
				await fs.mkdir(dir, { recursive: true })
				await fs.writeFile(path.join(dir, `test-${subdir.toLowerCase()}.md`), `# ${subdir} content`)
			}

			const result = await migrateGlobalPaths(mockDocumentsPath)

			result.migrated.should.be.true()
			result.migratedPaths!.length.should.equal(5)

			// Verify new structure
			const newBase = path.join(mockDocumentsPath, ".agents")

			// Check each mapping
			const mappings = [
				{ legacy: "Rules", new: "context" },
				{ legacy: "Workflows", new: "workflows" },
				{ legacy: "Skills", new: "skills" },
				{ legacy: "Hooks", new: "hooks" },
				{ legacy: "MCP", new: "mcp" },
			]

			for (const mapping of mappings) {
				const newDir = path.join(newBase, mapping.new)
				const files = await fs.readdir(newDir)
				files.should.containEql(`test-${mapping.legacy.toLowerCase()}.md`)
			}
		})

		it("should not overwrite existing files in new location", async () => {
			// Create legacy Rules
			const legacyRulesDir = path.join(mockDocumentsPath, "Careti", "Rules")
			await fs.mkdir(legacyRulesDir, { recursive: true })
			await fs.writeFile(path.join(legacyRulesDir, "existing.md"), "# Legacy Content")

			// Create new location with existing file
			const newContextDir = path.join(mockDocumentsPath, ".agents", "context")
			await fs.mkdir(newContextDir, { recursive: true })
			await fs.writeFile(path.join(newContextDir, "existing.md"), "# New Content - Should Not Change")

			const result = await migrateGlobalPaths(mockDocumentsPath)

			result.migrated.should.be.true()
			// CARETI MODIFICATION: Windows 경로 구분자를 posix로 정규화해 비교
			result.skippedFiles!.map((p: string) => p.replace(/\\/g, "/")).should.containEql("context/existing.md")

			// Verify existing file was not overwritten
			const content = await fs.readFile(path.join(newContextDir, "existing.md"), "utf8")
			content.should.equal("# New Content - Should Not Change")
		})

		it("should handle nested directories", async () => {
			// Create nested structure in legacy Skills
			const legacySkillsDir = path.join(mockDocumentsPath, "Careti", "Skills", "my-skill")
			await fs.mkdir(legacySkillsDir, { recursive: true })
			await fs.writeFile(path.join(legacySkillsDir, "SKILL.md"), "# My Skill")
			await fs.writeFile(path.join(legacySkillsDir, "helper.js"), "// helper")

			const result = await migrateGlobalPaths(mockDocumentsPath)

			result.migrated.should.be.true()

			// Verify nested structure was preserved
			const newSkillDir = path.join(mockDocumentsPath, ".agents", "skills", "my-skill")
			const skillContent = await fs.readFile(path.join(newSkillDir, "SKILL.md"), "utf8")
			skillContent.should.equal("# My Skill")

			const helperContent = await fs.readFile(path.join(newSkillDir, "helper.js"), "utf8")
			helperContent.should.equal("// helper")
		})

		it("should set migration status after successful migration", async () => {
			// Create legacy Rules
			const legacyRulesDir = path.join(mockDocumentsPath, "Careti", "Rules")
			await fs.mkdir(legacyRulesDir, { recursive: true })
			await fs.writeFile(path.join(legacyRulesDir, "test.md"), "# Test")

			await migrateGlobalPaths(mockDocumentsPath)

			const status = await getMigrationStatus(mockDocumentsPath)
			status.should.be.true()
		})

		it("should preserve legacy files (not delete them)", async () => {
			// Create legacy Rules
			const legacyRulesDir = path.join(mockDocumentsPath, "Careti", "Rules")
			await fs.mkdir(legacyRulesDir, { recursive: true })
			await fs.writeFile(path.join(legacyRulesDir, "test.md"), "# Test")

			await migrateGlobalPaths(mockDocumentsPath)

			// Legacy files should still exist
			const legacyContent = await fs.readFile(path.join(legacyRulesDir, "test.md"), "utf8")
			legacyContent.should.equal("# Test")
		})
	})

	describe("getMigrationStatus / setMigrationStatus", () => {
		it("should return false when status file does not exist", async () => {
			const status = await getMigrationStatus(mockDocumentsPath)
			status.should.be.false()
		})

		it("should return true after setting status to true", async () => {
			await setMigrationStatus(mockDocumentsPath, true)
			const status = await getMigrationStatus(mockDocumentsPath)
			status.should.be.true()
		})

		it("should store status in .agents/.migration-complete file", async () => {
			await setMigrationStatus(mockDocumentsPath, true)

			const statusFile = path.join(mockDocumentsPath, ".agents", ".migration-complete")
			const exists = await fs
				.access(statusFile)
				.then(() => true)
				.catch(() => false)
			exists.should.be.true()
		})
	})
})
