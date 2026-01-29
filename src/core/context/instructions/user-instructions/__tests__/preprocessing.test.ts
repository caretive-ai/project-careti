// CARETI MODIFICATION: Tests for preprocessing - !`command` syntax
import { describe, it, beforeEach, afterEach } from "mocha"
import "should"
import * as path from "path"
import * as fs from "fs/promises"
import * as os from "os"
import { hasPreprocessingDirectives, preprocessShellCommands } from "../preprocessing"

describe("Preprocessing", () => {
	describe("hasPreprocessingDirectives", () => {
		it("should detect !`command` pattern", () => {
			hasPreprocessingDirectives("Hello !`echo test`").should.be.true()
			hasPreprocessingDirectives("No commands here").should.be.false()
			hasPreprocessingDirectives("!`git status`").should.be.true()
			hasPreprocessingDirectives("Multiple !`cmd1` and !`cmd2`").should.be.true()
		})

		it("should not match regular backticks", () => {
			hasPreprocessingDirectives("`code block`").should.be.false()
			hasPreprocessingDirectives("```\ncode\n```").should.be.false()
		})
	})

	describe("preprocessShellCommands", () => {
		let tempDir: string

		beforeEach(async () => {
			tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "preprocess-test-"))
		})

		afterEach(async () => {
			await fs.rm(tempDir, { recursive: true, force: true })
		})

		it("should replace !`echo` with output", async () => {
			const content = "Result: !`echo hello`"
			const result = await preprocessShellCommands(content, tempDir)

			result.should.equal("Result: hello")
		})

		it("should handle multiple commands", async () => {
			const content = "A: !`echo a` B: !`echo b`"
			const result = await preprocessShellCommands(content, tempDir)

			result.should.equal("A: a B: b")
		})

		it("should preserve content without directives", async () => {
			const content = "No commands here"
			const result = await preprocessShellCommands(content, tempDir)

			result.should.equal("No commands here")
		})

		it("should handle command errors gracefully", async () => {
			const content = "!`nonexistent_command_12345`"
			const result = await preprocessShellCommands(content, tempDir)

			result.should.containEql("[Error executing")
		})

		it("should use provided cwd", async () => {
			const content = "!`pwd`"
			const result = await preprocessShellCommands(content, tempDir)

			result.should.containEql(tempDir)
		})
	})
})
