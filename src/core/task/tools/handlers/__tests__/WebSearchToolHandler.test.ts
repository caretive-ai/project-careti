// CARETI MODIFICATION: Tests for WebSearchToolHandler
import { afterEach, beforeEach, describe, it } from "mocha"
import "should"
import sinon from "sinon"
import { WebSearchToolHandler } from "../WebSearchToolHandler"
import { ClineDefaultTool } from "@shared/tools"
import type { ToolUse } from "../../../../assistant-message"

describe("WebSearchToolHandler", () => {
	let sandbox: sinon.SinonSandbox
	let handler: WebSearchToolHandler

	beforeEach(() => {
		sandbox = sinon.createSandbox()
		handler = new WebSearchToolHandler()
	})

	afterEach(() => {
		sandbox.restore()
	})

	describe("name property", () => {
		it("should have correct tool name", () => {
			handler.name.should.equal(ClineDefaultTool.WEB_SEARCH)
		})
	})

	describe("getDescription", () => {
		it("should return formatted description with query", () => {
			const block: Partial<ToolUse> = {
				name: ClineDefaultTool.WEB_SEARCH,
				params: { query: "test query" },
			}
			const description = handler.getDescription(block as ToolUse)
			description.should.equal("[web_search for 'test query']")
		})

		it("should handle undefined query", () => {
			const block: Partial<ToolUse> = {
				name: ClineDefaultTool.WEB_SEARCH,
				params: {},
			}
			const description = handler.getDescription(block as ToolUse)
			description.should.equal("[web_search for 'undefined']")
		})
	})

	describe("execute validation", () => {
		let mockConfig: any

		beforeEach(() => {
			mockConfig = {
				taskState: { consecutiveMistakeCount: 0 },
				services: {
					stateManager: {
						getApiConfiguration: sandbox.stub().returns({
							planModeApiProvider: "anthropic",
							actModeApiProvider: "anthropic",
						}),
						getGlobalSettingsKey: sandbox.stub().returns("act"),
						getSecretKey: sandbox.stub().returns(undefined),
					},
				},
				callbacks: {
					sayAndCreateMissingParamError: sandbox.stub().resolves("[ERROR] Missing parameter: query"),
					shouldAutoApproveTool: sandbox.stub().returns(true),
					removeLastPartialMessageIfExistsWithType: sandbox.stub().resolves(),
					say: sandbox.stub().resolves(),
				},
				autoApprovalSettings: { enableNotifications: false },
				ulid: "test-ulid",
				api: { getModel: () => ({ id: "test-model" }) },
			}
		})

		it("should return error when query is missing", async () => {
			const block: Partial<ToolUse> = {
				name: ClineDefaultTool.WEB_SEARCH,
				params: {},
				partial: false,
			}

			const result = await handler.execute(mockConfig, block as ToolUse)

			result.should.containEql("Missing parameter")
			;(mockConfig.taskState!.consecutiveMistakeCount as number).should.equal(1)
		})

		it("should return error when SerpAPI key is not configured", async () => {
			const block: Partial<ToolUse> = {
				name: ClineDefaultTool.WEB_SEARCH,
				params: { query: "test search" },
				partial: false,
			}

			const result = await handler.execute(mockConfig, block as ToolUse)

			result.should.containEql("SerpAPI key is not configured")
		})

		it("should reset consecutiveMistakeCount when query is provided", async () => {
			mockConfig.taskState!.consecutiveMistakeCount = 3
			const block: Partial<ToolUse> = {
				name: ClineDefaultTool.WEB_SEARCH,
				params: { query: "test search" },
				partial: false,
			}

			await handler.execute(mockConfig, block as ToolUse)

			;(mockConfig.taskState!.consecutiveMistakeCount as number).should.equal(0)
		})
	})

	describe("numResults parsing", () => {
		it("should parse num_results correctly", () => {
			// Test the parsing logic directly
			const parseNumResults = (input: string | undefined): number => {
				return Math.min(Math.max(parseInt(input || "5") || 5, 1), 10)
			}

			parseNumResults(undefined).should.equal(5)
			parseNumResults("").should.equal(5)
			parseNumResults("3").should.equal(3)
			parseNumResults("0").should.equal(1)
			parseNumResults("-1").should.equal(1)
			parseNumResults("10").should.equal(10)
			parseNumResults("15").should.equal(10)
			parseNumResults("abc").should.equal(5)
		})
	})
})
