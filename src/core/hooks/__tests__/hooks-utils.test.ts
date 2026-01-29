import { afterEach, beforeEach, describe, it } from "mocha"
import "should"
import sinon from "sinon"
import { getHooksEnabledSafe, matchesToolPattern, extractMatcherFromFileName } from "../hooks-utils"

describe("hooks-utils", () => {
	let sandbox: sinon.SinonSandbox
	let originalPlatform: string

	beforeEach(() => {
		sandbox = sinon.createSandbox()
		originalPlatform = process.platform
	})

	afterEach(() => {
		sandbox.restore()
		// Restore original platform
		Object.defineProperty(process, "platform", {
			value: originalPlatform,
			writable: true,
			configurable: true,
		})
	})

	describe("getHooksEnabledSafe", () => {
		describe("on Windows platform", () => {
			beforeEach(() => {
				// Mock Windows platform
				Object.defineProperty(process, "platform", {
					value: "win32",
					writable: true,
					configurable: true,
				})
			})

			it("should return false when user setting is true", () => {
				const result = getHooksEnabledSafe(true)
				result.should.be.false()
			})

			it("should return false when user setting is false", () => {
				const result = getHooksEnabledSafe(false)
				result.should.be.false()
			})

			it("should return false when user setting is undefined", () => {
				const result = getHooksEnabledSafe(undefined)
				result.should.be.false()
			})
		})

		describe("on non-Windows platforms", () => {
			const platforms = ["darwin", "linux", "freebsd", "openbsd", "sunos", "aix"]

			platforms.forEach((platform) => {
				describe(`on ${platform}`, () => {
					beforeEach(() => {
						Object.defineProperty(process, "platform", {
							value: platform,
							writable: true,
							configurable: true,
						})
					})

					it("should return true when user setting is true", () => {
						const result = getHooksEnabledSafe(true)
						result.should.be.true()
					})

					it("should return false when user setting is false", () => {
						const result = getHooksEnabledSafe(false)
						result.should.be.false()
					})

					it("should return false when user setting is undefined (default)", () => {
						const result = getHooksEnabledSafe(undefined)
						result.should.be.false()
					})
				})
			})
		})

		describe("edge cases", () => {
			it("should handle macOS platform correctly", () => {
				Object.defineProperty(process, "platform", {
					value: "darwin",
					writable: true,
					configurable: true,
				})

				// macOS should respect user setting
				getHooksEnabledSafe(true).should.be.true()
				getHooksEnabledSafe(false).should.be.false()
				getHooksEnabledSafe(undefined).should.be.false()
			})

			it("should handle Linux platform correctly", () => {
				Object.defineProperty(process, "platform", {
					value: "linux",
					writable: true,
					configurable: true,
				})

				// Linux should respect user setting
				getHooksEnabledSafe(true).should.be.true()
				getHooksEnabledSafe(false).should.be.false()
				getHooksEnabledSafe(undefined).should.be.false()
			})
		})
	})

	// CARETI MODIFICATION: Tests for Claude Code compatible matcher pattern support
	describe("matchesToolPattern", () => {
		it("should match all tools with empty string", () => {
			matchesToolPattern("Edit", "").should.be.true()
			matchesToolPattern("Write", "").should.be.true()
			matchesToolPattern("Read", "").should.be.true()
		})

		it("should match all tools with asterisk", () => {
			matchesToolPattern("Edit", "*").should.be.true()
			matchesToolPattern("Write", "*").should.be.true()
			matchesToolPattern("Bash", "*").should.be.true()
		})

		it("should match exact tool name", () => {
			matchesToolPattern("Edit", "Edit").should.be.true()
			matchesToolPattern("Write", "Edit").should.be.false()
		})

		it("should match pipe-separated tools", () => {
			matchesToolPattern("Edit", "Edit|Write").should.be.true()
			matchesToolPattern("Write", "Edit|Write").should.be.true()
			matchesToolPattern("Read", "Edit|Write").should.be.false()
		})

		it("should match underscore-separated tools (file-safe syntax)", () => {
			matchesToolPattern("Edit", "Edit_Write").should.be.true()
			matchesToolPattern("Write", "Edit_Write").should.be.true()
			matchesToolPattern("Read", "Edit_Write").should.be.false()
		})

		it("should match regex patterns", () => {
			matchesToolPattern("EditFile", "Edit.*").should.be.true()
			matchesToolPattern("Edit", "Edit.*").should.be.true()
			matchesToolPattern("WriteFile", "Edit.*").should.be.false()
		})
	})

	describe("extractMatcherFromFileName", () => {
		it("should return empty string for exact hook name", () => {
			extractMatcherFromFileName("PreToolUse", "PreToolUse").should.equal("")
		})

		it("should extract single tool matcher", () => {
			extractMatcherFromFileName("PreToolUse", "PreToolUse.Edit").should.equal("Edit")
		})

		it("should extract multiple tools and convert underscore to pipe", () => {
			extractMatcherFromFileName("PreToolUse", "PreToolUse.Edit_Write").should.equal("Edit|Write")
		})

		it("should handle PostToolUse hook", () => {
			extractMatcherFromFileName("PostToolUse", "PostToolUse.Bash").should.equal("Bash")
		})

		it("should return empty for unrelated file names", () => {
			extractMatcherFromFileName("PreToolUse", "SomeOtherFile").should.equal("")
		})
	})
})
