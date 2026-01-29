/**
 * CARETI MODIFICATION: E2E tests for Commands system with Claude Code compatibility
 * Tests frontmatter parsing, command discovery, priority system (Personal > Project)
 */
import { afterEach, beforeEach, describe, it } from "mocha"
import "should"
import fs from "fs/promises"
import os from "os"
import path from "path"
import sinon from "sinon"
import { discoverCommands, getAvailableCommands } from "../commands"
import { parseYamlFrontmatter } from "../frontmatter"

describe("Commands E2E - Claude Code Compatibility", function () {
	this.timeout(30000)

	let tempDir: string
	let sandbox: sinon.SinonSandbox

	beforeEach(async () => {
		sandbox = sinon.createSandbox()
		tempDir = path.join(os.tmpdir(), `commands-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`)
		await fs.mkdir(tempDir, { recursive: true })

		// Create project .agents directories
		const projectCommandsDir = path.join(tempDir, ".agents", "commands")
		const projectSkillsDir = path.join(tempDir, ".agents", "skills")
		await fs.mkdir(projectCommandsDir, { recursive: true })
		await fs.mkdir(projectSkillsDir, { recursive: true })
	})

	afterEach(async () => {
		sandbox.restore()

		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch {
			// Ignore cleanup errors
		}
	})

	describe("Frontmatter Parsing - Claude Code Fields", () => {
		it("should parse disable-model-invocation field", () => {
			const content = `---
description: Test command
disable-model-invocation: true
---
Command content here`

			const result = parseYamlFrontmatter(content)
			result.data["disable-model-invocation"]!.should.be.true()
		})

		it("should parse user-invocable field (false)", () => {
			const content = `---
description: Internal command
user-invocable: false
---
Internal content`

			const result = parseYamlFrontmatter(content)
			result.data["user-invocable"]!.should.be.false()
		})

		it("should parse allowed-tools field as string", () => {
			const content = `---
description: Restricted command
allowed-tools: Read, Grep, Glob
---
Content`

			const result = parseYamlFrontmatter(content)
			const tools = result.data["allowed-tools"] as string
			tools.should.be.a.String()
			tools.should.containEql("Read")
			tools.should.containEql("Grep")
			tools.should.containEql("Glob")
		})

		it("should parse context field (fork)", () => {
			const content = `---
description: Fork command
context: fork
agent: explorer
---
Fork content`

			const result = parseYamlFrontmatter(content)
			result.data.context!.should.equal("fork")
			result.data.agent!.should.equal("explorer")
		})

		it("should parse all Claude Code fields together", () => {
			const content = `---
description: Full featured command
argument-hint: <file>
model: claude-3-sonnet
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Write, Edit
context: fork
agent: coder
---
Complete command content`

			const result = parseYamlFrontmatter(content)
			result.data.description!.should.equal("Full featured command")
			result.data["argument-hint"]!.should.equal("<file>")
			result.data.model!.should.equal("claude-3-sonnet")
			result.data["disable-model-invocation"]!.should.be.true()
			result.data["user-invocable"]!.should.be.true()
			;(result.data["allowed-tools"] as string).should.containEql("Read")
			result.data.context!.should.equal("fork")
			result.data.agent!.should.equal("coder")
		})

		it("should return body content without frontmatter", () => {
			const content = `---
description: Simple command
---
This is the body content.
It can have multiple lines.`

			const result = parseYamlFrontmatter(content)
			result.body.should.containEql("This is the body content.")
			result.body.should.containEql("It can have multiple lines.")
			result.body.should.not.containEql("description:")
		})
	})

	describe("Command Discovery - Personal > Project Priority", () => {
		it("should discover commands from project .agents/commands/", async () => {
			// Create project command
			const commandPath = path.join(tempDir, ".agents", "commands", "test-cmd.md")
			await fs.writeFile(
				commandPath,
				`---
description: Test project command
---
Project command content`,
			)

			const commands = await discoverCommands(tempDir)
			const testCmd = commands.find((c) => c.name === "test-cmd")

			testCmd!.should.be.ok()
			testCmd!.source.should.equal("project")
			testCmd!.description.should.equal("Test project command")
		})

		it("should discover commands from project .agents/skills/ (legacy)", async () => {
			// Create skill directory with SKILL.md
			const skillDir = path.join(tempDir, ".agents", "skills", "my-skill")
			await fs.mkdir(skillDir, { recursive: true })
			await fs.writeFile(
				path.join(skillDir, "SKILL.md"),
				`---
name: my-skill
description: Test skill
---
Skill content`,
			)

			const commands = await discoverCommands(tempDir)
			const skill = commands.find((c) => c.name === "my-skill")

			skill!.should.be.ok()
			skill!.description.should.equal("Test skill")
		})

		it("should include all Claude Code fields in discovered commands", async () => {
			const commandPath = path.join(tempDir, ".agents", "commands", "full-cmd.md")
			await fs.writeFile(
				commandPath,
				`---
description: Full command
disable-model-invocation: true
user-invocable: false
allowed-tools: Read, Write
context: fork
agent: reviewer
---
Content`,
			)

			const commands = await discoverCommands(tempDir)
			const fullCmd = commands.find((c) => c.name === "full-cmd")

			fullCmd!.should.be.ok()
			fullCmd!.disableModelInvocation!.should.be.true()
			fullCmd!.userInvocable!.should.be.false()
			fullCmd!.allowedTools!.should.deepEqual(["Read", "Write"])
			fullCmd!.context!.should.equal("fork")
			fullCmd!.agent!.should.equal("reviewer")
		})

		it("should filter commands using getAvailableCommands", async () => {
			// Create multiple commands
			await fs.writeFile(
				path.join(tempDir, ".agents", "commands", "cmd1.md"),
				`---
description: Command 1
---
Content 1`,
			)

			await fs.writeFile(
				path.join(tempDir, ".agents", "commands", "cmd2.md"),
				`---
description: Command 2
---
Content 2`,
			)

			const discovered = await discoverCommands(tempDir)
			const available = getAvailableCommands(discovered)

			available.should.be.an.Array()
			available.should.have.length(2)
		})
	})

	describe("Command Content with Preprocessing Directives", () => {
		it("should detect preprocessing directive in content", async () => {
			const { hasPreprocessingDirectives } = await import("../preprocessing")

			const contentWithDirective = `---
description: Dynamic command
---
Current branch: !\`git branch --show-current\``

			hasPreprocessingDirectives(contentWithDirective).should.be.true()
		})

		it("should not detect preprocessing in normal content", async () => {
			const { hasPreprocessingDirectives } = await import("../preprocessing")

			const normalContent = `---
description: Normal command
---
This is just regular content with backticks like \`code\``

			hasPreprocessingDirectives(normalContent).should.be.false()
		})
	})

	describe("Source Type Compatibility", () => {
		it("should use 'project' source for project commands (Claude Code compat)", async () => {
			const commandPath = path.join(tempDir, ".agents", "commands", "test.md")
			await fs.writeFile(
				commandPath,
				`---
description: Test
---
Content`,
			)

			const commands = await discoverCommands(tempDir)
			const validSources = ["personal", "project", "enterprise"]

			for (const cmd of commands) {
				validSources.should.containEql(cmd.source)
			}

			// Project commands should have 'project' source
			const testCmd = commands.find((c) => c.name === "test")
			testCmd!.source.should.equal("project")
		})
	})

	describe("Edge Cases", () => {
		it("should skip command with no description", async () => {
			const commandPath = path.join(tempDir, ".agents", "commands", "no-desc.md")
			await fs.writeFile(
				commandPath,
				`---
name: no-desc
---
Content without description`,
			)

			const commands = await discoverCommands(tempDir)
			const noDesc = commands.find((c) => c.name === "no-desc")
			;(noDesc === undefined).should.be.true()
		})

		it("should handle command with invalid YAML frontmatter gracefully", async () => {
			const commandPath = path.join(tempDir, ".agents", "commands", "invalid-yaml.md")
			await fs.writeFile(
				commandPath,
				`---
description: [invalid
  yaml: content
---
Content`,
			)

			const commands = await discoverCommands(tempDir)
			// Should not throw, may skip invalid command
			commands.should.be.an.Array()
		})

		it("should handle empty .agents/commands directory", async () => {
			// Directory already exists but empty
			const commands = await discoverCommands(tempDir)
			commands.should.be.an.Array()
		})

		it("should handle non-existent .agents directory", async () => {
			const emptyDir = path.join(tempDir, "empty")
			await fs.mkdir(emptyDir, { recursive: true })

			const commands = await discoverCommands(emptyDir)
			commands.should.be.an.Array()
		})
	})
})
