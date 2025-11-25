import { CaretJsonAdapter } from "@caret/core/prompts/system/adapters/CaretJsonAdapter"
import { CaretSystemPromptContext } from "@caret/core/prompts/system/types"
import { API_PROVIDERS, CARET_MODES } from "@caret/shared/constants/PromptSystemConstants"
import type { ApiHandlerModel } from "@core/api"
import { beforeEach, describe, expect, it } from "vitest"

/**
 * TDD Test for F12 Claude Code Task Tool Loading
 *
 * This test verifies that:
 * 1. CLAUDE_CODE_TASK_TOOL is loaded when provider is claude-code
 * 2. CLAUDE_CODE_TASK_TOOL is NOT loaded for other providers
 * 3. The tool description is correctly formatted
 */
describe("CaretJsonAdapter - Claude Code Task Tool Loading", () => {
	let adapter: CaretJsonAdapter

	beforeEach(() => {
		adapter = new CaretJsonAdapter()
	})

	describe("Provider Detection", () => {
		it("should include Task tool when provider is claude-code", async () => {
			// Arrange: Create context with claude-code provider
			const mockModel: ApiHandlerModel = {
				id: "claude-sonnet-4-20250514",
				info: { maxTokens: 200000, contextWindow: 200000, supportsPromptCache: true },
			}

			const context: CaretSystemPromptContext = {
				cwd: "/test",
				mode: CARET_MODES.AGENT,
				modeSystem: "caret",
				ide: "vscode",
				providerInfo: {
					providerId: API_PROVIDERS.CLAUDE_CODE,
					model: mockModel,
				},
			}

			// Act: Generate prompt
			const prompt = await adapter.getPrompt(context)

			// Assert: Task tool should be present in prompt
			expect(prompt).toContain("## task")
			expect(prompt).toContain("Description: Start a new autonomous agent")
			expect(prompt).toContain("Parameters:")
			expect(prompt).toContain("- description: (required)")
			expect(prompt).toContain("- prompt: (required)")
			expect(prompt).toContain("- subagent_type: (required)")
		})

		it("should NOT include Task tool when provider is NOT claude-code", async () => {
			// Arrange: Create context with different provider
			const mockModel: ApiHandlerModel = {
				id: "claude-sonnet-4-20250514",
				info: { maxTokens: 200000, contextWindow: 200000, supportsPromptCache: true },
			}

			const context: CaretSystemPromptContext = {
				cwd: "/test",
				mode: CARET_MODES.AGENT,
				modeSystem: "caret",
				ide: "vscode",
				providerInfo: {
					providerId: "anthropic",
					model: mockModel,
				},
			}

			// Act: Generate prompt
			const prompt = await adapter.getPrompt(context)

			// Assert: Task tool should NOT be present
			expect(prompt).not.toContain("## task")
			expect(prompt).not.toContain("Start a new autonomous agent")
		})

		it("should NOT include Task tool when providerInfo is undefined", async () => {
			// Arrange: Create context without provider info
			const context: Partial<CaretSystemPromptContext> = {
				cwd: "/test",
				mode: CARET_MODES.AGENT,
				modeSystem: "caret",
				ide: "vscode",
				providerInfo: undefined,
			}

			// Act: Generate prompt
			const prompt = await adapter.getPrompt(context as CaretSystemPromptContext)

			// Assert: Task tool should NOT be present
			expect(prompt).not.toContain("## task")
		})
	})

	describe("Tool Description Formatting", () => {
		it("should format Task tool description correctly", async () => {
			// Arrange
			const mockModel: ApiHandlerModel = {
				id: "claude-sonnet-4-20250514",
				info: { maxTokens: 200000, contextWindow: 200000, supportsPromptCache: true },
			}

			const context: CaretSystemPromptContext = {
				cwd: "/test",
				mode: CARET_MODES.AGENT,
				modeSystem: "caret",
				ide: "vscode",
				providerInfo: {
					providerId: API_PROVIDERS.CLAUDE_CODE,
					model: mockModel,
				},
			}

			// Act
			const prompt = await adapter.getPrompt(context)

			// Assert: Check complete tool format
			expect(prompt).toContain("## task")
			expect(prompt).toContain("Description:")
			expect(prompt).toContain("Parameters:")
			expect(prompt).toContain("Usage:")
			expect(prompt).toContain("<task>")
			expect(prompt).toContain("</task>")
			expect(prompt).toContain("<description>")
			expect(prompt).toContain("<prompt>")
			expect(prompt).toContain("<subagent_type>")
		})

		it("should include all required parameters in correct order", async () => {
			// Arrange
			const mockModel: ApiHandlerModel = {
				id: "claude-sonnet-4-20250514",
				info: { maxTokens: 200000, contextWindow: 200000, supportsPromptCache: true },
			}

			const context: CaretSystemPromptContext = {
				cwd: "/test",
				mode: CARET_MODES.AGENT,
				modeSystem: "caret",
				ide: "vscode",
				providerInfo: {
					providerId: API_PROVIDERS.CLAUDE_CODE,
					model: mockModel,
				},
			}

			// Act
			const prompt = await adapter.getPrompt(context)

			// Assert: Check parameter structure
			const taskToolSection = prompt.split("## task")[1]?.split("##")[0] || ""

			expect(taskToolSection).toContain("- description: (required)")
			expect(taskToolSection).toContain("- prompt: (required)")
			expect(taskToolSection).toContain("- subagent_type: (required)")

			// Verify order: description should come before prompt
			const descriptionIndex = taskToolSection.indexOf("- description:")
			const promptIndex = taskToolSection.indexOf("- prompt:")
			const subagentIndex = taskToolSection.indexOf("- subagent_type:")

			expect(descriptionIndex).toBeLessThan(promptIndex)
			expect(promptIndex).toBeLessThan(subagentIndex)
		})
	})

	describe("Mode Independence", () => {
		it("should include Task tool in CHATBOT mode if provider is claude-code", async () => {
			// Arrange
			const mockModel: ApiHandlerModel = {
				id: "claude-sonnet-4-20250514",
				info: { maxTokens: 200000, contextWindow: 200000, supportsPromptCache: true },
			}

			const context: CaretSystemPromptContext = {
				cwd: "/test",
				mode: CARET_MODES.CHATBOT,
				modeSystem: "caret",
				ide: "vscode",
				providerInfo: {
					providerId: API_PROVIDERS.CLAUDE_CODE,
					model: mockModel,
				},
			}

			// Act
			const prompt = await adapter.getPrompt(context)

			// Assert: Task tool should be present even in CHATBOT mode
			// (CLI-level gating will block actual execution, but prompt should include it)
			expect(prompt).toContain("## task")
		})

		it("should include Task tool in AGENT mode if provider is claude-code", async () => {
			// Arrange
			const mockModel: ApiHandlerModel = {
				id: "claude-sonnet-4-20250514",
				info: { maxTokens: 200000, contextWindow: 200000, supportsPromptCache: true },
			}

			const context: CaretSystemPromptContext = {
				cwd: "/test",
				mode: CARET_MODES.AGENT,
				modeSystem: "caret",
				ide: "vscode",
				providerInfo: {
					providerId: API_PROVIDERS.CLAUDE_CODE,
					model: mockModel,
				},
			}

			// Act
			const prompt = await adapter.getPrompt(context)

			// Assert
			expect(prompt).toContain("## task")
		})
	})

	describe("Integration with Cline Tools", () => {
		it("should include Task tool along with other Cline tools", async () => {
			// Arrange
			const mockModel: ApiHandlerModel = {
				id: "claude-sonnet-4-20250514",
				info: { maxTokens: 200000, contextWindow: 200000, supportsPromptCache: true },
			}

			const context: CaretSystemPromptContext = {
				cwd: "/test",
				mode: CARET_MODES.AGENT,
				modeSystem: "caret",
				ide: "vscode",
				providerInfo: {
					providerId: API_PROVIDERS.CLAUDE_CODE,
					model: mockModel,
				},
			}

			// Act
			const prompt = await adapter.getPrompt(context)

			// Assert: Both Task tool and Cline tools should be present
			expect(prompt).toContain("## task") // Task tool
			expect(prompt).toContain("# TOOL USAGE SYSTEM") // Cline tools header

			// Verify Task tool appears separate from TOOL USAGE SYSTEM
			const taskToolIndex = prompt.indexOf("## task")
			const toolSystemIndex = prompt.indexOf("# TOOL USAGE SYSTEM")

			// Task tool should appear before TOOL USAGE SYSTEM
			expect(taskToolIndex).toBeGreaterThan(0)
			expect(toolSystemIndex).toBeGreaterThan(taskToolIndex)
		})
	})
})
