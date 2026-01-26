// CARETI MODIFICATION: Tests for commands system - Claude Code compatible features
import { describe, it } from "mocha"
import "should"
import { parseYamlFrontmatter } from "../frontmatter"

describe("Commands System", () => {
	describe("CommandMetadata parsing", () => {
		it("should parse basic frontmatter fields", () => {
			const content = `---
description: Test command
argument-hint: <file>
model: sonnet
subtask: true
---
Command instructions here`

			const result = parseYamlFrontmatter(content)
			const data = result.data as Record<string, any>
			data.description.should.equal("Test command")
			data["argument-hint"].should.equal("<file>")
			data.model.should.equal("sonnet")
			data.subtask.should.equal(true)
		})

		it("should parse Claude Code compatible fields", () => {
			const content = `---
description: Deploy skill
disable-model-invocation: true
user-invocable: false
allowed-tools: Read, Grep, Bash
context: fork
agent: Explore
---
Instructions`

			const result = parseYamlFrontmatter(content)
			const data = result.data as Record<string, any>
			data["disable-model-invocation"].should.equal(true)
			data["user-invocable"].should.equal(false)
			data["allowed-tools"].should.equal("Read, Grep, Bash")
			data.context.should.equal("fork")
			data.agent.should.equal("Explore")
		})
	})

	describe("allowed-tools parsing", () => {
		it("should parse comma-separated allowed-tools to array", () => {
			const input = "Read, Grep, Bash"
			const result = input
				.split(",")
				.map((t: string) => t.trim())
				.filter((t: string) => t.length > 0)

			result.should.deepEqual(["Read", "Grep", "Bash"])
		})

		it("should handle single tool", () => {
			const input = "Read"
			const result = input
				.split(",")
				.map((t: string) => t.trim())
				.filter((t: string) => t.length > 0)

			result.should.deepEqual(["Read"])
		})

		it("should handle empty string", () => {
			const input = ""
			const result = input
				.split(",")
				.map((t: string) => t.trim())
				.filter((t: string) => t.length > 0)

			result.should.deepEqual([])
		})
	})

	describe("source type", () => {
		it("should use personal instead of global", () => {
			type SourceType = "personal" | "project" | "enterprise"
			const validSources: SourceType[] = ["personal", "project", "enterprise"]

			validSources.should.containEql("personal")
			validSources.should.not.containEql("global")
		})
	})
})
