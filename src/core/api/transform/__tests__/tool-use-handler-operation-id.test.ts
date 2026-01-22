// CARETI MODIFICATION: native tool call 스트리밍에서 operationId 고정(중복 도구 카드 방지) 회귀 테스트
import { describe, it } from "mocha"
import "should"
import { ToolUseHandler } from "../tool-use-handler"

describe("ToolUseHandler operationId", () => {
	it("should attach a stable operationId derived from the tool call id", () => {
		const handler = new ToolUseHandler()

		handler.processToolUseDelta({
			type: "tool_use",
			id: "call_1",
			name: "generate_image",
			input: '{"prompt":"cat"}',
		})

			const blocks = handler.getPartialToolUsesAsContent()
			blocks.length.should.equal(1)
			blocks[0]!.operationId!.should.equal("native_tool_call_1")
	})

	it("should keep the same operationId across argument deltas for the same tool call", () => {
		const handler = new ToolUseHandler()

		handler.processToolUseDelta({
			type: "tool_use",
			id: "call_2",
			name: "generate_image",
			input: '{"prompt":"ca',
		})
		handler.processToolUseDelta({
			type: "tool_use",
			id: "call_2",
			input: 't"}',
		})

			const blocks = handler.getPartialToolUsesAsContent()
			blocks.length.should.equal(1)
			blocks[0]!.operationId!.should.equal("native_tool_call_2")
		})
	})
