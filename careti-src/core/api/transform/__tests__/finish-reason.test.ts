/**
 * TDD Tests for Finish Reason Handler
 *
 * Tests the finish_reason handling for GLM4.7 loop issue fix.
 * @see work-logs/luke/careti/todo/doing/2026-01-14-glm47-loop-issue.md
 */
import { describe, it } from "mocha"
import "should"
import {
	isNaturalEndReason,
	isToolUseReason,
	isMaxTokensReason,
	normalizeFinishReason,
	shouldEndLoopByFinishReason,
} from "../finish-reason"

describe("FinishReasonHandler", () => {
	describe("isNaturalEndReason", () => {
		it("should return true for OpenAI 'stop' reason", () => {
			isNaturalEndReason("stop").should.be.true()
		})

		it("should return true for Anthropic 'end_turn' reason", () => {
			isNaturalEndReason("end_turn").should.be.true()
		})

		it("should return true for Anthropic 'stop_sequence' reason", () => {
			isNaturalEndReason("stop_sequence").should.be.true()
		})

		it("should return true for Gemini 'STOP' reason", () => {
			isNaturalEndReason("STOP").should.be.true()
		})

		it("should return false for tool_use reason", () => {
			isNaturalEndReason("tool_use").should.be.false()
		})

		it("should return false for undefined", () => {
			isNaturalEndReason(undefined).should.be.false()
		})

		it("should return false for null", () => {
			isNaturalEndReason(null as any).should.be.false()
		})
	})

	describe("isToolUseReason", () => {
		it("should return true for Anthropic 'tool_use' reason", () => {
			isToolUseReason("tool_use").should.be.true()
		})

		it("should return true for OpenAI 'tool_calls' reason", () => {
			isToolUseReason("tool_calls").should.be.true()
		})

		it("should return false for 'stop' reason", () => {
			isToolUseReason("stop").should.be.false()
		})
	})

	describe("isMaxTokensReason", () => {
		it("should return true for Anthropic 'max_tokens' reason", () => {
			isMaxTokensReason("max_tokens").should.be.true()
		})

		it("should return true for OpenAI 'length' reason", () => {
			isMaxTokensReason("length").should.be.true()
		})

		it("should return true for Gemini 'MAX_TOKENS' reason", () => {
			isMaxTokensReason("MAX_TOKENS").should.be.true()
		})

		it("should return false for 'stop' reason", () => {
			isMaxTokensReason("stop").should.be.false()
		})
	})

	describe("normalizeFinishReason", () => {
		it("should normalize OpenAI 'stop' to 'end_turn'", () => {
			normalizeFinishReason("stop").should.equal("end_turn")
		})

		it("should normalize Gemini 'STOP' to 'end_turn'", () => {
			normalizeFinishReason("STOP").should.equal("end_turn")
		})

		it("should normalize 'tool_calls' to 'tool_use'", () => {
			normalizeFinishReason("tool_calls").should.equal("tool_use")
		})

		it("should normalize 'length' to 'max_tokens'", () => {
			normalizeFinishReason("length").should.equal("max_tokens")
		})

		it("should return 'unknown' for undefined", () => {
			normalizeFinishReason(undefined).should.equal("unknown")
		})

		it("should return 'unknown' for unrecognized reason", () => {
			normalizeFinishReason("some_unknown_reason").should.equal("unknown")
		})
	})

	describe("shouldEndLoopByFinishReason", () => {
		describe("max_tokens handling", () => {
			it("should return true for max_tokens regardless of other conditions", () => {
				shouldEndLoopByFinishReason("max_tokens", false, 0).should.be.true()
				shouldEndLoopByFinishReason("max_tokens", true, 0).should.be.true()
				shouldEndLoopByFinishReason("length", false, 0).should.be.true()
				shouldEndLoopByFinishReason("MAX_TOKENS", false, 0).should.be.true()
			})
		})

		describe("natural end with no tool use", () => {
			// CARETI MODIFICATION: GLM-4.7 무한루프 방지로 '첫 발생 시 기회 부여' 로직이 제거되어
			// 자연 종료 + 도구 미사용이면 즉시 종료(true)하는 현재 구현에 맞게 기대값 갱신
			it("should return true even on first occurrence (immediate end to prevent loops)", () => {
				shouldEndLoopByFinishReason("stop", false, 0).should.be.true()
				shouldEndLoopByFinishReason("end_turn", false, 0).should.be.true()
			})

			it("should return true on second+ occurrence", () => {
				// Second occurrence: consecutiveMistakeCount > 0
				shouldEndLoopByFinishReason("stop", false, 1).should.be.true()
				shouldEndLoopByFinishReason("end_turn", false, 1).should.be.true()
				shouldEndLoopByFinishReason("STOP", false, 2).should.be.true()
			})
		})

		describe("tool use scenarios", () => {
			it("should return false when tools were used", () => {
				shouldEndLoopByFinishReason("stop", true, 0).should.be.false()
				shouldEndLoopByFinishReason("stop", true, 1).should.be.false()
			})

			it("should return false for tool_use finish reason", () => {
				shouldEndLoopByFinishReason("tool_use", false, 1).should.be.false()
				shouldEndLoopByFinishReason("tool_calls", false, 1).should.be.false()
			})
		})

		describe("GLM4.7 specific scenarios", () => {
			it("should end loop when GLM4.7 returns 'stop' without tool use after one noToolsUsed prompt", () => {
				// GLM4.7 completes task, returns finish_reason: "stop"
				// First time: don't end (consecutiveMistakeCount = 0)
				// After noToolsUsed prompt: end (consecutiveMistakeCount = 1)
				shouldEndLoopByFinishReason("stop", false, 1).should.be.true()
			})
		})
	})
})
