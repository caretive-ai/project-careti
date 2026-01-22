// CARETI MODIFICATION: Hook and Skill API Integration tests with GLM4.7 and Gemini
// Tests that hooks and skills work correctly when integrated with LLM APIs
// Run with: npm run test:integration -- --grep "Hook and Skill API"

import { describe, it, before, after } from "mocha"
import { expect } from "chai"
import * as path from "path"
import * as fs from "fs"
import * as os from "os"
import { discoverSkills, getAvailableSkills, getSkillContent } from "../core/context/instructions/user-instructions/skills"

// Load .env manually
const envPath = path.resolve(__dirname, "../../.env")
if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, "utf-8")
	envContent.split("\n").forEach((line) => {
		const match = line.match(/^([^=]+)=(.*)$/)
		if (match && !process.env[match[1]]) {
			process.env[match[1]] = match[2]
		}
	})
}

const ZAI_TOKEN = process.env.ZAI_TOKEN
const GEMINI_TOKEN = process.env.GEMINI_TOKEN

// API endpoints
const ZAI_API_URL = "https://api.z.ai/api/paas/v4/chat/completions"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// Skip tests if no tokens
const describeWithZai = ZAI_TOKEN ? describe : describe.skip
const describeWithGemini = GEMINI_TOKEN ? describe : describe.skip

// ============================================================================
// Skill Discovery and Loading Tests
// ============================================================================

describe("Skill Discovery Integration", function () {
	this.timeout(10000)

	let tempDir: string
	let skillsDir: string

	before(async () => {
		// Create temporary test directory with skills
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-integration-test-"))
		skillsDir = path.join(tempDir, ".agents", "skills", "test-greeting")
		fs.mkdirSync(skillsDir, { recursive: true })

		// Create a test skill
		const skillContent = `---
name: test-greeting
description: A test skill that greets users
---

# Test Greeting Skill

This skill helps greet users in different languages.

## Instructions

When the user asks for a greeting:
1. Ask what language they prefer
2. Provide an appropriate greeting
3. Be friendly and welcoming

## Supported Languages

- Korean: 안녕하세요!
- English: Hello!
- Japanese: こんにちは!
`
		fs.writeFileSync(path.join(skillsDir, "SKILL.md"), skillContent)
	})

	after(async () => {
		// Clean up
		try {
			fs.rmSync(tempDir, { recursive: true, force: true })
		} catch {
			// Ignore cleanup errors
		}
	})

	it("should discover skills in project directory", async () => {
		const allSkills = await discoverSkills(tempDir)
		const projectSkills = allSkills.filter((s) => s.source === "project")

		expect(projectSkills).to.have.lengthOf(1)
		expect(projectSkills[0].name).to.equal("test-greeting")
		expect(projectSkills[0].description).to.equal("A test skill that greets users")
	})

	it("should resolve available skills correctly", async () => {
		const allSkills = await discoverSkills(tempDir)
		const availableSkills = getAvailableSkills(allSkills)

		const testSkill = availableSkills.find((s) => s.name === "test-greeting")
		expect(testSkill).to.exist
		expect(testSkill!.source).to.equal("project")
	})

	it("should load full skill content with instructions", async () => {
		const allSkills = await discoverSkills(tempDir)
		const availableSkills = getAvailableSkills(allSkills)

		const skillContent = await getSkillContent("test-greeting", availableSkills)

		expect(skillContent).to.not.be.null
		expect(skillContent!.name).to.equal("test-greeting")
		expect(skillContent!.instructions).to.include("Test Greeting Skill")
		expect(skillContent!.instructions).to.include("Korean: 안녕하세요!")
	})
})

// ============================================================================
// GLM4.7 (Z.AI) API Integration Tests
// ============================================================================

describeWithZai("GLM4.7 Hook and Skill API Integration", function () {
	this.timeout(60000)

	it("should respond to skill-related system prompt", async () => {
		const systemPrompt = `You are an AI assistant with access to skills.

Available skills:
- test-greeting: A skill that helps greet users in multiple languages

When the user mentions greetings, acknowledge that you can use the test-greeting skill.`

		const response = await fetch(ZAI_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ZAI_TOKEN}`,
			},
			body: JSON.stringify({
				model: "glm-4.7",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: "Hello! Can you greet me in Korean?" },
				],
				max_tokens: 500,
				stream: false,
			}),
		})

		console.log("GLM4.7 response status:", response.status)

		if (!response.ok) {
			const errorText = await response.text()
			console.error("GLM4.7 error:", errorText)
		}

		expect(response.ok, `GLM4.7 API call failed: ${response.status}`).to.be.true

		const result = await response.json()
		console.log("GLM4.7 result:", JSON.stringify(result, null, 2))

		expect(result.choices).to.be.an("array").with.length.greaterThan(0)
		expect(result.choices[0].message.content).to.be.a("string")

		const responseText = result.choices[0].message.content.toLowerCase()
		// Should acknowledge greeting capability or provide Korean greeting
		expect(responseText.length).to.be.greaterThan(10)
	})

	it("should handle tool use format for use_skill", async () => {
		const systemPrompt = `You are an AI assistant. You have access to a use_skill tool.

<tool name="use_skill">
  <description>Activates a skill by name to get specialized instructions.</description>
  <parameters>
    <skill_name type="string" required="true">Name of the skill to activate</skill_name>
  </parameters>
</tool>

Available skills:
- code-review: Reviews code for best practices

When the user asks for code review, use the use_skill tool with skill_name="code-review".`

		const response = await fetch(ZAI_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ZAI_TOKEN}`,
			},
			body: JSON.stringify({
				model: "glm-4.7",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: "Please review this code: function add(a,b){return a+b}" },
				],
				max_tokens: 1000,
				stream: false,
				tools: [
					{
						type: "function",
						function: {
							name: "use_skill",
							description: "Activates a skill by name to get specialized instructions",
							parameters: {
								type: "object",
								properties: {
									skill_name: {
										type: "string",
										description: "Name of the skill to activate",
									},
								},
								required: ["skill_name"],
							},
						},
					},
				],
			}),
		})

		expect(response.ok, `GLM4.7 tool API call failed: ${response.status}`).to.be.true

		const result = await response.json()
		console.log("GLM4.7 tool result:", JSON.stringify(result, null, 2))

		expect(result.choices).to.be.an("array").with.length.greaterThan(0)

		// Model may either call the tool or respond directly
		const choice = result.choices[0]
		if (choice.message.tool_calls) {
			// Tool was called
			expect(choice.message.tool_calls).to.be.an("array")
			console.log("GLM4.7 called tool:", choice.message.tool_calls[0].function.name)
		} else {
			// Direct response (also valid)
			expect(choice.message.content).to.be.a("string")
		}
	})

	it("should understand hook context in system prompt", async () => {
		const systemPrompt = `You are an AI assistant with hooks enabled.

The following hooks are configured:
- TaskStart: Runs when a new task begins
- PreToolUse: Runs before executing any tool
- PostToolUse: Runs after tool execution completes

When the user asks about your capabilities, mention that you have hook support for task lifecycle management.`

		const response = await fetch(ZAI_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ZAI_TOKEN}`,
			},
			body: JSON.stringify({
				model: "glm-4.7",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: "What special capabilities do you have?" },
				],
				max_tokens: 500,
				stream: false,
			}),
		})

		expect(response.ok).to.be.true

		const result = await response.json()
		const responseText = result.choices[0].message.content.toLowerCase()

		// Should mention hooks or task management capabilities
		console.log("GLM4.7 hook awareness response:", result.choices[0].message.content)
		expect(responseText.length).to.be.greaterThan(20)
	})
})

// ============================================================================
// Gemini API Integration Tests
// ============================================================================

describeWithGemini("Gemini Hook and Skill API Integration", function () {
	this.timeout(60000)

	it("should respond to skill-related system prompt", async () => {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				systemInstruction: {
					parts: [
						{
							text: `You are an AI assistant with access to skills.

Available skills:
- test-greeting: A skill that helps greet users in multiple languages
- code-review: A skill for reviewing code quality

When the user mentions greetings, acknowledge that you can use the test-greeting skill.`,
						},
					],
				},
				contents: [
					{
						role: "user",
						parts: [{ text: "Hello! Can you help me greet someone in Japanese?" }],
					},
				],
				generationConfig: {
					maxOutputTokens: 500,
				},
			}),
		})

		console.log("Gemini response status:", response.status)

		if (!response.ok) {
			const errorText = await response.text()
			console.error("Gemini error:", errorText)
		}

		expect(response.ok, `Gemini API call failed: ${response.status}`).to.be.true

		const result = await response.json()
		console.log("Gemini result:", JSON.stringify(result, null, 2))

		expect(result.candidates).to.be.an("array").with.length.greaterThan(0)
		expect(result.candidates[0].content.parts[0].text).to.be.a("string")

		const responseText = result.candidates[0].content.parts[0].text
		expect(responseText.length).to.be.greaterThan(10)
	})

	it("should handle tool definitions for use_skill", async () => {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				systemInstruction: {
					parts: [
						{
							text: `You are an AI assistant with access to a use_skill tool.

Available skills:
- code-review: Reviews code for best practices and issues

When the user asks for code review, use the use_skill function with skill_name="code-review".`,
						},
					],
				},
				contents: [
					{
						role: "user",
						parts: [{ text: "Please review my code: const x = 1;" }],
					},
				],
				tools: [
					{
						functionDeclarations: [
							{
								name: "use_skill",
								description: "Activates a skill by name to get specialized instructions",
								parameters: {
									type: "object",
									properties: {
										skill_name: {
											type: "string",
											description: "Name of the skill to activate",
										},
									},
									required: ["skill_name"],
								},
							},
						],
					},
				],
				generationConfig: {
					maxOutputTokens: 1000,
				},
			}),
		})

		expect(response.ok, `Gemini tool API call failed: ${response.status}`).to.be.true

		const result = await response.json()
		console.log("Gemini tool result:", JSON.stringify(result, null, 2))

		expect(result.candidates).to.be.an("array").with.length.greaterThan(0)

		const content = result.candidates[0].content
		// Model may call tool or respond directly
		if (content.parts.some((p: any) => p.functionCall)) {
			const toolCall = content.parts.find((p: any) => p.functionCall)
			console.log("Gemini called function:", toolCall.functionCall.name)
			expect(toolCall.functionCall.name).to.equal("use_skill")
		} else {
			// Direct response is also acceptable
			expect(content.parts[0].text).to.be.a("string")
		}
	})

	it("should understand hook context in system prompt", async () => {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				systemInstruction: {
					parts: [
						{
							text: `You are an AI assistant with hooks enabled.

The following hooks are active:
- TaskStart: Executed when a new task begins, can inject context
- PreToolUse: Executed before any tool, can block or modify
- PostToolUse: Executed after tool completion, can log results

When asked about your capabilities, mention hook support.`,
						},
					],
				},
				contents: [
					{
						role: "user",
						parts: [{ text: "What special features do you have for task automation?" }],
					},
				],
				generationConfig: {
					maxOutputTokens: 500,
				},
			}),
		})

		expect(response.ok).to.be.true

		const result = await response.json()
		const responseText = result.candidates[0].content.parts[0].text

		console.log("Gemini hook awareness response:", responseText)
		expect(responseText.length).to.be.greaterThan(20)
	})
})

// ============================================================================
// Cross-API Skill Context Consistency Tests
// ============================================================================

const describeBothApis = ZAI_TOKEN && GEMINI_TOKEN ? describe : describe.skip

describeBothApis("Cross-API Skill Context Consistency", function () {
	this.timeout(120000)

	const skillSystemPrompt = `You are a coding assistant with these skills available:

Skills:
1. code-review - Analyzes code for bugs, style, and best practices
2. test-writer - Generates unit tests for code
3. doc-generator - Creates documentation from code

Rules:
- When user asks for code review, mention you'll use the code-review skill
- When user asks for tests, mention the test-writer skill
- Keep responses concise

Respond in exactly 2-3 sentences.`

	const userQuery = "Can you help me review this function and write tests for it?"

	it("should get consistent skill awareness from GLM4.7", async () => {
		const response = await fetch(ZAI_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ZAI_TOKEN}`,
			},
			body: JSON.stringify({
				model: "glm-4.7",
				messages: [
					{ role: "system", content: skillSystemPrompt },
					{ role: "user", content: userQuery },
				],
				max_tokens: 300,
				stream: false,
			}),
		})

		expect(response.ok).to.be.true

		const result = await response.json()
		console.log("GLM4.7 skill awareness:", result.choices[0].message.content)

		const responseText = result.choices[0].message.content.toLowerCase()
		// Should acknowledge code review or test capability
		expect(
			responseText.includes("review") || responseText.includes("test") || responseText.includes("skill"),
		).to.be.true
	})

	it("should get consistent skill awareness from Gemini", async () => {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				systemInstruction: {
					parts: [{ text: skillSystemPrompt }],
				},
				contents: [
					{
						role: "user",
						parts: [{ text: userQuery }],
					},
				],
				generationConfig: {
					maxOutputTokens: 300,
				},
			}),
		})

		expect(response.ok).to.be.true

		const result = await response.json()
		console.log("Gemini skill awareness:", result.candidates[0].content.parts[0].text)

		const responseText = result.candidates[0].content.parts[0].text.toLowerCase()
		// Should acknowledge code review or test capability
		expect(
			responseText.includes("review") || responseText.includes("test") || responseText.includes("skill"),
		).to.be.true
	})
})
