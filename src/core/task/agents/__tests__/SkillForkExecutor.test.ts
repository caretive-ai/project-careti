// CARETI MODIFICATION: Tests for SkillForkExecutor - context: fork support
import { describe, it } from "mocha"
import "should"
import type { CommandContent } from "@shared/commands"
import { shouldForkSkill, executeSkillInFork } from "../SkillForkExecutor"

describe("SkillForkExecutor", () => {
	describe("shouldForkSkill", () => {
		it("should return true for context: fork", () => {
			const skill: CommandContent = {
				name: "test",
				description: "Test skill",
				path: "/test/path",
				source: "project",
				context: "fork",
				instructions: "test instructions",
			}

			shouldForkSkill(skill).should.be.true()
		})

		it("should return false for context: inline", () => {
			const skill: CommandContent = {
				name: "test",
				description: "Test skill",
				path: "/test/path",
				source: "project",
				context: "inline",
				instructions: "test instructions",
			}

			shouldForkSkill(skill).should.be.false()
		})

		it("should return false when context is undefined", () => {
			const skill: CommandContent = {
				name: "test",
				description: "Test skill",
				path: "/test/path",
				source: "project",
				instructions: "test instructions",
			}

			shouldForkSkill(skill).should.be.false()
		})
	})

	describe("executeSkillInFork", () => {
		it("should return error when CLI not found", async () => {
			const skill: CommandContent = {
				name: "test",
				description: "Test skill",
				path: "/test/path",
				source: "project",
				context: "fork",
				instructions: "test instructions",
			}

			const result = await executeSkillInFork({
				cwd: "/tmp",
				skillContent: skill,
				userPrompt: "test prompt",
			})

			// CLI is likely not installed in test environment
			result.success.should.be.false()
			result.error!.should.be.a.String()
		})
	})
})
