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
		it("should return error when CLI not found", async function () {
			// CARETI MODIFICATION: careti CLI가 전역 설치된 환경에서는 실제 서브에이전트가
			// spawn되어 타임아웃되므로, PATH를 비워 CLI 미발견 경로를 결정적으로 검증
			this.timeout(10000)
			const skill: CommandContent = {
				name: "test",
				description: "Test skill",
				path: "/test/path",
				source: "project",
				context: "fork",
				instructions: "test instructions",
			}

			const originalPath = process.env.PATH
			process.env.PATH = ""
			try {
				const result = await executeSkillInFork({
					cwd: "/tmp",
					skillContent: skill,
					userPrompt: "test prompt",
				})

				result.success.should.be.false()
				result.error!.should.be.a.String()
			} finally {
				process.env.PATH = originalPath
			}
		})
	})
})
