// CARETI MODIFICATION: tool operationId 안정화 회귀 테스트 (스트리밍 중 중복 도구 카드 방지)
import { describe, it } from "mocha"
import "should"
import { parseAssistantMessageV2 } from "../index"

describe("parseAssistantMessageV2 operationId", () => {
	it("should keep the same operationId for a tool block as message grows (partial -> complete)", () => {
		const partial = [
			"hello",
			"<generate_image>",
			"<prompt>cat",
		].join("\n")

		const blocks1 = parseAssistantMessageV2(partial)
		const tool1 = blocks1.find((b) => b.type === "tool_use") as any
		tool1.should.have.property("operationId")
		tool1.operationId.should.be.a.String()
		tool1.partial.should.equal(true)

		const complete = [
			"hello",
			"<generate_image>",
			"<prompt>cat in a hat</prompt>",
			"</generate_image>",
		].join("\n")

		const blocks2 = parseAssistantMessageV2(complete)
		const tool2 = blocks2.find((b) => b.type === "tool_use") as any
		tool2.partial.should.equal(false)
		tool2.operationId.should.equal(tool1.operationId)
	})

	it("should generate distinct operationId values for multiple tool blocks in the same message", () => {
		const msg = [
			"<generate_image>",
			"<prompt>first</prompt>",
			"</generate_image>",
			"<generate_image>",
			"<prompt>second</prompt>",
			"</generate_image>",
		].join("\n")

		const blocks = parseAssistantMessageV2(msg)
		const tools = blocks.filter((b) => b.type === "tool_use") as any[]
		tools.length.should.equal(2)
		tools[0].operationId.should.not.equal(tools[1].operationId)
	})
})

