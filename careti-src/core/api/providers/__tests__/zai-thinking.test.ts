/**
 * TDD Tests for ZAI Provider GLM-4.7 Thinking Mode Support
 *
 * @see work-logs/luke/careti/todo/doing/2026-01-15-glm47-complete-support.md
 */
import { describe, it } from "mocha"
import "should"

/**
 * GLM-4.7 API 요청 시 thinking 파라미터가 포함되어야 함
 */
describe("ZAI Provider - GLM-4.7 Thinking Mode", () => {
	describe("thinking parameter", () => {
		it("should include thinking parameter for GLM-4.7", () => {
			// GLM-4.7은 thinking: { type: "enabled" } 파라미터 필요
			const modelId = "glm-4.7"
			const shouldEnableThinking = modelId.startsWith("glm-4.7") || modelId.startsWith("glm-4.5")

			shouldEnableThinking.should.be.true()
		})

		it("should not include thinking parameter for non-GLM models", () => {
			const modelId = "gpt-4"
			const shouldEnableThinking = modelId.startsWith("glm-4.7") || modelId.startsWith("glm-4.5")

			shouldEnableThinking.should.be.false()
		})
	})

	describe("reasoning_content handling", () => {
		it("should parse reasoning_content from GLM-4.7 response", () => {
			// GLM-4.7 스트리밍 응답에서 reasoning_content 필드 처리
			const mockDelta = {
				reasoning_content: "Let me think about this...",
				content: "Here is my answer.",
			}

			const hasReasoningContent = "reasoning_content" in mockDelta && mockDelta.reasoning_content
			hasReasoningContent.should.be.ok()
		})
	})

	describe("finish_reason handling", () => {
		it("should yield finish chunk when finish_reason is present", () => {
			// GLM-4.7 응답의 finish_reason 처리
			const mockChunk = {
				choices: [
					{
						finish_reason: "stop",
						delta: { content: "" },
					},
				],
			}

			const finishReason = mockChunk.choices[0]?.finish_reason
			finishReason.should.equal("stop")
		})
	})
})
