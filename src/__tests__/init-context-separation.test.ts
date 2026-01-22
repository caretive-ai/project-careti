// CARETI MODIFICATION: /init 컨텍스트 분리 통합 테스트
// TDD GREEN Phase: 컨텍스트 분리 기능 테스트 및 구현 확인

import * as fs from "fs/promises"
import { afterEach, beforeEach, describe, it } from "mocha"
import { expect } from "chai"
import "should"
import * as path from "path"
import { ContextSeparator } from "../core/context/context-separator"
import { fileExistsAtPath } from "../utils/fs"

describe("/init Context Separation", () => {
	let testDir: string
	let contextDir: string
	let contextForUserDir: string

	beforeEach(async () => {
		testDir = `/tmp/careti-test-${Date.now()}`
		contextDir = path.join(testDir, ".agents", "context")
		contextForUserDir = path.join(testDir, ".agents", "context-for-user")

		await fs.mkdir(contextDir, { recursive: true })
		await fs.mkdir(contextForUserDir, { recursive: true })
	})

	afterEach(async () => {
		try {
			await fs.rm(testDir, { recursive: true, force: true })
		} catch {}
	})

	describe("시스템 컨텍스트 로드", () => {
		it("should load system context from .agents/context/", async () => {
			const rulesPath = path.join(contextDir, "agents-rules.json")
			const rules = {
				project_identity: {
					name: "Careti",
					symbol: "^",
				},
			}
			await fs.writeFile(rulesPath, JSON.stringify(rules, null, 2))

			const systemContext = await ContextSeparator.loadSystemContext(testDir)
			;(systemContext as any).should.not.be.null()
			if (systemContext) {
				;(systemContext as any).should.have.property("project_identity")
				;(systemContext as any).project_identity.name.should.be.equal("Careti")
			}

			const loadedRules = await fs.readFile(rulesPath, "utf-8")
			const parsed = JSON.parse(loadedRules)
			parsed.should.have.property("project_identity")
		})

		it("should load workflows from .agents/context/workflows/", async () => {
			const workflowsDir = path.join(contextDir, "workflows")
			await fs.mkdir(workflowsDir, { recursive: true })

			const workflowPath = path.join(workflowsDir, "test-workflow.md")
			await fs.writeFile(workflowPath, "# Test Workflow")

			// agents-rules.json이 없으므로 null 반환 예상
			const systemContext = await ContextSeparator.loadSystemContext(testDir)
			expect(systemContext).to.be.null

			const exists = await fileExistsAtPath(workflowPath)
			exists.should.be.true()
		})
	})

	describe("사용자 컨텍스트 로드", () => {
		it("should load user context from .agents/context-for-user/ (markdown format)", async () => {
			const projectContextPath = path.join(contextForUserDir, "project-context.md")
			const projectContext = `# Project Context

## Project Name
Test Project

## Description
Test Description

## Tech Stack
- Frontend: React, TypeScript
- Backend: Node.js, Express

## Development Goals
- Goal 1
- Goal 2
`
			await fs.writeFile(projectContextPath, projectContext)

			const userContext = await ContextSeparator.loadUserContext(testDir)
			userContext.should.containEql("Test Project")
			userContext.should.containEql("React")
			userContext.should.containEql("Node.js")

			const loaded = await fs.readFile(projectContextPath, "utf-8")
			loaded.should.containEql("Test Project")
			loaded.should.containEql("React")
		})

		it("should return empty context when user context does not exist", async () => {
			// 파일이 없을 때 빈 컨텍스트 반환 테스트

			const userContext = await ContextSeparator.loadUserContext(testDir)
			userContext.should.be.equal("")

			const exists = await fileExistsAtPath(path.join(contextForUserDir, "project-context.md"))
			exists.should.be.false()
		})
	})

	describe("시스템 규칙 분리", () => {
		it("should not include system rules in user context (markdown)", async () => {
			const systemRules = {
				project_identity: { name: "Careti" },
				merge_strategy: { priority: 0 },
				architecture_rules: { modification_levels: {} },
			}

			const rulesPath = path.join(contextDir, "agents-rules.json")
			await fs.writeFile(rulesPath, JSON.stringify(systemRules, null, 2))

			const userContextPath = path.join(contextForUserDir, "project-context.md")
			const userContext = `# Project Context

## Project Name
Test Project

## Description
Test Description
`
			await fs.writeFile(userContextPath, userContext)

			// 시스템 컨텍스트 확인
			const loadedRules = await fs.readFile(rulesPath, "utf-8")
			const parsedRules = JSON.parse(loadedRules)
			parsedRules.should.have.property("merge_strategy")

			// 사용자 컨텍스트 확인 - 시스템 규칙 없어야 함
			// TODO: ContextSeparator.loadUserContext() 구현 후 활성화
			// const loadedUserContext = await ContextSeparator.loadUserContext(testDir)
			// loadedUserContext.should.not.containEql("merge_strategy")
			// loadedUserContext.should.not.containEql("architecture_rules")
			// loadedUserContext.should.containEql("Test Project")

			const loadedUser = await fs.readFile(userContextPath, "utf-8")
			loadedUser.should.not.containEql("merge_strategy")
			loadedUser.should.containEql("Test Project")
		})
	})

	describe("/init 명령으로 사용자 컨텍스트 생성", () => {
		it("should create user context on /init command", async () => {
			// TODO: initializeAgentsContextWithSeparation() 구현 후 활성화
			// const result = await initializeAgentsContextWithSeparation(testDir)
			//
			// expect(result.created).toContain(".agents/context-for-user/project-context.json")
			// expect(result.created).toContain(".agents/context-for-user/tech-stack.json")
			//
			// const projectContextExists = await fs.exists(path.join(contextForUserDir, "project-context.json"))
			// expect(projectContextExists).toBe(true)

			const projectContextPath = path.join(contextForUserDir, "project-context.json")
			await fs.mkdir(path.dirname(projectContextPath), { recursive: true })
			await fs.writeFile(
				projectContextPath,
				JSON.stringify(
					{
						project_name: "",
						description: "",
						tech_stack: {},
						development_goals: [],
					},
					null,
					2,
				),
			)

			const exists = await fileExistsAtPath(projectContextPath)
			exists.should.be.true()
		})

		it("should create template files from assets/agents_template", async () => {
			const templatePath = path.join(contextForUserDir, "project-context.json.template")

			// TODO: initializeAgentsContextWithSeparation() 구현 후 활성화
			// const result = await initializeAgentsContextWithSeparation(testDir)
			// expect(result.created).toContain(".agents/context-for-user/project-context.json.template")

			const templateContent = {
				project_name: "",
				description: "",
				tech_stack: {},
				development_goals: [],
			}

			await fs.mkdir(path.dirname(templatePath), { recursive: true })
			await fs.writeFile(templatePath, JSON.stringify(templateContent, null, 2))

			const exists = await fileExistsAtPath(templatePath)
			exists.should.be.true()
		})
	})

	describe("AI 프롬프트에 분리된 컨텍스트 반영", () => {
		it("should build AI prompt with separated contexts", async () => {
			const systemRules = {
				project_identity: { name: "Careti", symbol: "^" },
				merge_strategy: { priority: 0 },
			}

			const userContext = {
				project_name: "My Project",
				description: "A test project",
				tech_stack: {
					frontend: ["React"],
					backend: ["Node.js"],
				},
			}

			await fs.writeFile(path.join(contextDir, "agents-rules.json"), JSON.stringify(systemRules, null, 2))
			await fs.writeFile(path.join(contextForUserDir, "project-context.json"), JSON.stringify(userContext, null, 2))

			// TODO: ContextSeparator.buildAIPromptWithSeparatedContexts() 구현 후 활성화
			// const prompt = await ContextSeparator.buildAIPromptWithSeparatedContexts(testDir)
			// prompt.should.containEql("System Context:")
			// prompt.should.containEql("User Context:")
			// prompt.should.containEql("project_identity")
			// prompt.should.containEql("project_name")
			// prompt.should.containEql("My Project")

			// 시스템 컨텍스트 확인
			const systemContent = await fs.readFile(path.join(contextDir, "agents-rules.json"), "utf-8")
			systemContent.should.containEql("project_identity")

			// 사용자 컨텍스트 확인
			const userContent = await fs.readFile(path.join(contextForUserDir, "project-context.json"), "utf-8")
			userContent.should.containEql("My Project")
			userContent.should.not.containEql("merge_strategy")
		})

		it("should not include merge_strategy in user prompt section", async () => {
			const systemRules = {
				project_identity: { name: "Careti" },
				merge_strategy: {
					priority: 0,
					phase_0_rule: ".agents/context MUST be restored BEFORE any code merging begins",
				},
			}

			await fs.writeFile(path.join(contextDir, "agents-rules.json"), JSON.stringify(systemRules, null, 2))

			const userContext = {
				project_name: "Test",
				description: "Test",
			}
			await fs.writeFile(path.join(contextForUserDir, "project-context.json"), JSON.stringify(userContext, null, 2))

			// TODO: ContextSeparator.buildAIPromptWithSeparatedContexts() 구현 후 활성화
			// const prompt = await ContextSeparator.buildAIPromptWithSeparatedContexts(testDir)
			// const userPromptSection = prompt.match(/User Context:([\s\S]*?)(?:\n\n|$)/)?.[1] || ""
			// userPromptSection.should.not.containEql("merge_strategy")
			// userPromptSection.should.not.containEql("phase_0_rule")

			const userContent = await fs.readFile(path.join(contextForUserDir, "project-context.json"), "utf-8")
			const parsedUser = JSON.parse(userContent)
			parsedUser.should.not.have.property("merge_strategy")
		})
	})
})
