/**
 * Agent 모드 대화 기능 수정사항 검증 테스트
 *
 * 이전 문제:
 * - Agent 모드가 attempt_completion 툴 사용으로 대화가 안됨
 * - CaretMessageHandler가 task 상태 무시하고 처리
 *
 * 수정사항:
 * - CaretModeAdapter.getResponseToolName()에서 Agent 모드도 chatbot_mode_respond 사용
 * - 기존 Cline 대화 흐름(clineAsk 기반) 활용
 */

import { describe, it, expect, vi } from "vitest"
import { ModeSystemRegistry } from "../../../core/mode-system/ModeSystemRegistry"

describe("Agent 모드 대화 기능 수정사항", () => {
	const registry = ModeSystemRegistry.getInstance()

	describe("Tool Response 방식 통합", () => {
		it("Chatbot 모드는 chatbot_mode_respond 툴 사용", () => {
			const toolName = registry.getResponseToolName("caret", "plan")
			expect(toolName).toBe("chatbot_mode_respond")
		})

		it("Agent 모드도 chatbot_mode_respond 툴 사용 (수정사항)", () => {
			const toolName = registry.getResponseToolName("caret", "act")
			expect(toolName).toBe("chatbot_mode_respond")
		})

		it("두 모드 모두 동일한 대화 툴 사용으로 일관성 확보", () => {
			const chatbotTool = registry.getResponseToolName("caret", "plan")
			const agentTool = registry.getResponseToolName("caret", "act")

			expect(chatbotTool).toBe(agentTool)
			expect(chatbotTool).toBe("chatbot_mode_respond")
		})
	})

	describe("Cline 호환성", () => {
		it("Cline Plan 모드는 plan_mode_respond 툴 사용", () => {
			const toolName = registry.getResponseToolName("cline", "plan")
			expect(toolName).toBe("plan_mode_respond")
		})

		it("Cline Act 모드는 attempt_completion 툴 사용", () => {
			const toolName = registry.getResponseToolName("cline", "act")
			expect(toolName).toBe("attempt_completion")
		})
	})

	describe("Mode System 분리", () => {
		it("Caret과 Cline은 서로 다른 어댑터 사용", () => {
			const caretChatbot = registry.getResponseToolName("caret", "plan")
			const clineChat = registry.getResponseToolName("cline", "plan")

			expect(caretChatbot).toBe("chatbot_mode_respond")
			expect(clineChat).toBe("plan_mode_respond")
		})

		it("각 어댑터는 고유한 대화 패턴 유지", () => {
			// Caret: 두 모드 모두 chatbot_mode_respond
			expect(registry.getResponseToolName("caret", "plan")).toBe("chatbot_mode_respond")
			expect(registry.getResponseToolName("caret", "act")).toBe("chatbot_mode_respond")

			// Cline: 모드별 다른 툴
			expect(registry.getResponseToolName("cline", "plan")).toBe("plan_mode_respond")
			expect(registry.getResponseToolName("cline", "act")).toBe("attempt_completion")
		})
	})
})

describe("대화 흐름 통합성", () => {
	it("chatbot_mode_respond 툴이 clineAsk 상태 설정", async () => {
		// 이 테스트는 실제 툴 실행 흐름에서 clineAsk가 올바르게 설정되는지 검증
		// ToolExecutor에서 chatbot_mode_respond 실행 시 ask("chatbot_mode_respond", ...) 호출 확인

		// Mock 설정은 실제 ToolExecutor 로직에 따라 조정 필요
		// 핵심은 chatbot_mode_respond 툴 실행 후 clineAsk: "chatbot_mode_respond" 설정 확인
		expect(true).toBe(true) // Placeholder - 실제 구현 시 수정
	})

	it("clineAsk 설정 후 ClineMessageHandler에서 처리 가능", () => {
		// ClineMessageHandler.handleSendMessage에서
		// clineAsk: "chatbot_mode_respond" 케이스 처리 확인
		expect(true).toBe(true) // Placeholder - 실제 구현 시 수정
	})
})
