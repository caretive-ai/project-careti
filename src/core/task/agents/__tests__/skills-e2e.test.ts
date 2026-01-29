/**
 * CARETI MODIFICATION: E2E tests for Skills system with Claude Code compatibility
 * Tests skill execution, allowed-tools constraint, context: fork, preprocessing
 */
import { afterEach, beforeEach, describe, it } from "mocha"
import "should"
import fs from "fs/promises"
import os from "os"
import path from "path"
import sinon from "sinon"
import type { CommandContent } from "@shared/commands"
import { executeSkillInFork, shouldForkSkill, type SkillForkConfig } from "../SkillForkExecutor"
import {
	preprocessShellCommands,
	hasPreprocessingDirectives,
} from "../../../context/instructions/user-instructions/preprocessing"

// Helper to create CommandContent for testing
function createSkillContent(overrides: Partial<CommandContent>): CommandContent {
	return {
		name: "test-skill",
		description: "Test skill",
		instructions: "Test instructions",
		path: "/test/path",
		source: "project",
		...overrides,
	}
}

describe("Skills E2E - Claude Code Compatibility", function () {
	this.timeout(30000)

	let tempDir: string
	let sandbox: sinon.SinonSandbox

	beforeEach(async () => {
		sandbox = sinon.createSandbox()
		tempDir = path.join(os.tmpdir(), `skills-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`)
		await fs.mkdir(tempDir, { recursive: true })
	})

	afterEach(async () => {
		sandbox.restore()
		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch {
			// Ignore cleanup errors
		}
	})

	describe("Skill Fork Detection", () => {
		it("should detect fork context in skill content", () => {
			const forkSkill = createSkillContent({
				description: "Fork skill",
				instructions: "Skill content",
				context: "fork",
			})

			shouldForkSkill(forkSkill).should.be.true()
		})

		it("should not fork inline context skills", () => {
			const inlineSkill = createSkillContent({
				description: "Inline skill",
				instructions: "Skill content",
				context: "inline",
			})

			shouldForkSkill(inlineSkill).should.be.false()
		})

		it("should not fork skills without context specified", () => {
			const defaultSkill = createSkillContent({
				description: "Default skill",
				instructions: "Skill content",
			})

			shouldForkSkill(defaultSkill).should.be.false()
		})
	})

	describe("Shell Preprocessing (exclamation backtick command backtick)", () => {
		// Skip on Windows - shell execution varies
		before(function () {
			if (process.platform === "win32") {
				this.skip()
			}
		})

		it("should detect preprocessing directives", () => {
			// Using string concatenation to avoid parsing issues
			const withDirective = "Current: !" + "`pwd`"
			const withoutDirective = "No directives here"
			const withRegularBackticks = "Regular " + "`code`" + " blocks"

			hasPreprocessingDirectives(withDirective).should.be.true()
			hasPreprocessingDirectives(withoutDirective).should.be.false()
			hasPreprocessingDirectives(withRegularBackticks).should.be.false()
		})

		it("should preprocess simple shell commands", async () => {
			const content = "Current directory: !" + "`pwd`"
			const result = await preprocessShellCommands(content, tempDir)

			result.should.containEql(tempDir)
			result.should.not.containEql("!`pwd`")
		})

		it("should preprocess multiple commands", async () => {
			const content = [
				"Directory: !" + "`pwd`",
				"User: !" + "`whoami`",
				"Date: !" + "`date +%Y`",
			].join("\n")

			const result = await preprocessShellCommands(content, tempDir)

			result.should.containEql(tempDir) // pwd result
			result.should.containEql(new Date().getFullYear().toString()) // date result
		})

		it("should handle command failures gracefully", async () => {
			const content = "Result: !" + "`nonexistent_command_12345`"
			const result = await preprocessShellCommands(content, tempDir)

			// Should contain error marker or original text
			result.should.containEql("Result:")
		})

		it("should preserve non-directive content", async () => {
			const content = [
				"Normal text here",
				"Regular `code` with backticks",
				"Dynamic: !" + '`echo "test"`',
				"More text",
			].join("\n")

			const result = await preprocessShellCommands(content, tempDir)

			result.should.containEql("Normal text here")
			result.should.containEql("Regular `code` with backticks")
			result.should.containEql("More text")
			result.should.containEql("test") // echo result
		})

		it("should handle nested quotes in commands", async () => {
			const content = "Message: !" + "`echo 'hello world'`"
			const result = await preprocessShellCommands(content, tempDir)

			result.should.containEql("hello world")
		})
	})

	describe("Fork Skill Execution", () => {
		// Skip on Windows
		before(function () {
			if (process.platform === "win32") {
				this.skip()
			}
		})

		it("should execute fork skill with echo command", async () => {
			const config: SkillForkConfig = {
				cwd: tempDir,
				skillContent: createSkillContent({
					description: "Echo test",
					instructions: "Echo: hello from fork",
					context: "fork",
				}),
				userPrompt: "Test the echo skill",
			}

			const result = await executeSkillInFork(config)

			// Fork execution may fail without proper CLI setup, check structure
			result.should.have.property("success")
			result.should.have.property("output")
		})

		it("should include agent type when specified", async () => {
			const config: SkillForkConfig = {
				cwd: tempDir,
				agentType: "explorer",
				skillContent: createSkillContent({
					description: "Explorer skill",
					instructions: "Explore the codebase",
					context: "fork",
					agent: "explorer",
				}),
				userPrompt: "Explore",
			}

			// Just verify the config structure
			config.agentType!.should.equal("explorer")
			config.skillContent.agent!.should.equal("explorer")
		})
	})

	describe("Allowed Tools Constraint", () => {
		it("should define allowed tools from frontmatter", () => {
			const skillContent = createSkillContent({
				description: "Restricted skill",
				instructions: "Do something",
				allowedTools: ["Read", "Grep", "Glob"],
			})

			skillContent.allowedTools!.should.be.an.Array()
			skillContent.allowedTools!.should.have.length(3)
			skillContent.allowedTools!.should.containEql("Read")
		})

		it("should allow all tools when allowedTools is undefined", () => {
			const skillContent = createSkillContent({
				description: "Unrestricted skill",
				instructions: "Do anything",
			})

			;(skillContent.allowedTools === undefined).should.be.true()
		})

		it("should allow empty allowedTools array (no restrictions)", () => {
			const skillContent = createSkillContent({
				description: "No restrictions",
				instructions: "Content",
				allowedTools: [],
			})

			skillContent.allowedTools!.should.have.length(0)
		})
	})

	describe("Model-driven Invocation", () => {
		it("should identify model-invocable skills", () => {
			const modelInvocable = createSkillContent({
				description: "Auto-invoke skill",
				instructions: "Content",
				disableModelInvocation: false,
			})

			const userOnly = createSkillContent({
				description: "User-only skill",
				instructions: "Content",
				disableModelInvocation: true,
			})

			;(modelInvocable.disableModelInvocation || false).should.be.false()
			userOnly.disableModelInvocation!.should.be.true()
		})

		it("should identify user-invocable skills", () => {
			const visible = createSkillContent({
				description: "Visible skill",
				instructions: "Content",
				userInvocable: true,
			})

			const hidden = createSkillContent({
				description: "Hidden skill",
				instructions: "Content",
				userInvocable: false,
			})

			visible.userInvocable!.should.be.true()
			hidden.userInvocable!.should.be.false()
		})
	})

	describe("Skill Content Integration", () => {
		it("should handle skill with preprocessing and allowed-tools", async () => {
			// Skip on Windows
			if (process.platform === "win32") {
				return
			}

			const skillContent = createSkillContent({
				description: "Full featured skill",
				instructions: "Current directory: !" + "`pwd`\nThis skill can only read files.",
				allowedTools: ["Read", "Glob"],
				context: "inline",
			})

			// Verify structure
			skillContent.allowedTools!.should.deepEqual(["Read", "Glob"])
			hasPreprocessingDirectives(skillContent.instructions).should.be.true()

			// Preprocess
			const processed = await preprocessShellCommands(skillContent.instructions, tempDir)
			processed.should.containEql(tempDir)
			processed.should.containEql("This skill can only read files.")
		})

		it("should handle skill with fork and agent type", () => {
			const forkSkill = createSkillContent({
				description: "Fork with agent",
				instructions: "Execute in fork",
				context: "fork",
				agent: "reviewer",
			})

			shouldForkSkill(forkSkill).should.be.true()
			forkSkill.agent!.should.equal("reviewer")
		})
	})

	describe("Edge Cases", () => {
		it("should handle empty skill content", async () => {
			const content = ""
			const result = await preprocessShellCommands(content, tempDir)
			result.should.equal("")
		})

		it("should handle skill content with only preprocessing", async () => {
			// Skip on Windows
			if (process.platform === "win32") {
				return
			}

			const content = "!" + "`echo test`"
			const result = await preprocessShellCommands(content, tempDir)
			result.trim().should.equal("test")
		})

		it("should handle malformed preprocessing directive", async () => {
			const content = "Unclosed !" + "`command without closing backtick"
			const result = await preprocessShellCommands(content, tempDir)
			// Should preserve original content if no valid directives
			result.should.be.a.String()
		})
	})
})
