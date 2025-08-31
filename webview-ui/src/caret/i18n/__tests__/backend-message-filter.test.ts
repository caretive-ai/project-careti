/**
 * TDD Phase 1 (RED): 백엔드 메시지 i18n 필터링 테스트
 *
 * 목적: 웹뷰에서 받은 ClineMessage.text 중 하드코딩된 백엔드 메시지를
 *       브랜드 모드에 따라 i18n 필터링
 */

import { describe, expect, test } from "vitest"

// 아직 구현되지 않은 함수들 - RED 단계이므로 에러 발생 예상
import { getMessageType, isBackendMessage, processBackendMessage, translateBackendMessage } from "../backend-message-filter"

describe("Backend Message Pattern Matching", () => {
	test('should match "Cline wants to edit" pattern', () => {
		const message = "Cline wants to edit package.json"
		expect(isBackendMessage(message)).toBe(true)
		expect(getMessageType(message)).toBe("wants_to_edit")
	})

	test('should match "Task Completed" pattern', () => {
		const message = "Task Completed"
		expect(isBackendMessage(message)).toBe(true)
		expect(getMessageType(message)).toBe("task_completed")
	})

	test('should match "API Request..." pattern', () => {
		const message = "API Request..."
		expect(isBackendMessage(message)).toBe(true)
		expect(getMessageType(message)).toBe("api_request_pending")
	})

	test('should match various "wants to" patterns', () => {
		const testCases = [
			{ message: "Cline wants to create a new file", type: "wants_to_create" },
			{ message: "Cline wants to read file.txt", type: "wants_to_read" },
			{ message: "Cline wants to execute a command:", type: "wants_to_execute_command" },
			{ message: "Cline wants to use a browser and launch", type: "wants_to_use_browser" },
		]

		testCases.forEach(({ message, type }) => {
			expect(isBackendMessage(message)).toBe(true)
			expect(getMessageType(message)).toBe(type)
		})
	})

	test("should not match regular user messages", () => {
		const regularMessages = [
			"Hello, how are you?",
			"Please help me with this code",
			"What is the weather today?",
			"This is a regular conversation",
		]

		regularMessages.forEach((message) => {
			expect(isBackendMessage(message)).toBe(false)
		})
	})

	test("should handle edge cases", () => {
		expect(isBackendMessage("")).toBe(false)
		expect(isBackendMessage(null as any)).toBe(false)
		expect(isBackendMessage(undefined as any)).toBe(false)
	})
})

describe("i18n Key Mapping", () => {
	test('should map "wants_to_edit" to Korean', () => {
		const result = translateBackendMessage("wants_to_edit", "ko")
		expect(result).toBe("Caret이 파일을 편집하려고 합니다") // 기본 브랜드명 포함
	})

	test('should map "task_completed" to Korean', () => {
		const result = translateBackendMessage("task_completed", "ko")
		expect(result).toBe("작업이 완료되었습니다") // 작업 완료는 브랜드명 불필요
	})

	test('should map "api_request_pending" to Korean', () => {
		const result = translateBackendMessage("api_request_pending", "ko")
		expect(result).toBe("API 요청 중...") // API 요청도 브랜드명 불필요
	})

	test("should handle brand name replacement", () => {
		const result = translateBackendMessage("wants_to_edit", "ko", { brandName: "Caret" })
		expect(result).toContain("Caret")
		expect(result).toBe("Caret이 파일을 편집하려고 합니다")
	})

	test("should fallback to original key for unknown translations", () => {
		const result = translateBackendMessage("nonexistent_key" as any, "ko")
		expect(result).toBe("nonexistent_key")
	})

	test("should fallback to English for unsupported languages", () => {
		const result = translateBackendMessage("wants_to_edit", "fr" as any)
		expect(result).toBe("wants to edit")
	})
})

describe("Brand Mode Behavior", () => {
	test("should return original message in Cline mode", () => {
		const message = "Cline wants to edit file.js"
		const result = processBackendMessage(message, { mode: "cline" })
		expect(result).toBe(message)
	})

	test("should translate message in Caret mode", () => {
		const message = "Cline wants to edit file.js"
		const result = processBackendMessage(message, { mode: "caret" })
		expect(result).toContain("파일을 편집하려고")
		expect(result).toContain("Caret")
		expect(result).not.toContain("Cline")
	})

	test("should handle non-backend messages in both modes", () => {
		const message = "This is a regular user message"

		const clineResult = processBackendMessage(message, { mode: "cline" })
		const caretResult = processBackendMessage(message, { mode: "caret" })

		expect(clineResult).toBe(message)
		expect(caretResult).toBe(message) // 백엔드 메시지가 아니면 그대로
	})
})

describe("Option Toggle", () => {
	test("should disable i18n when toggle is off", () => {
		const message = "Cline wants to create new file"
		const result = processBackendMessage(message, {
			mode: "caret",
			enableBackendI18n: false,
		})
		expect(result).toBe(message) // 원본 그대로
	})

	test("should enable i18n when toggle is on", () => {
		const message = "Cline wants to create new file"
		const result = processBackendMessage(message, {
			mode: "caret",
			enableBackendI18n: true,
		})
		expect(result).not.toBe(message) // 번역됨
		expect(result).toContain("Caret")
		expect(result).toContain("생성하려고")
	})

	test("should respect mode priority over toggle", () => {
		const message = "Cline wants to edit file.js"

		// Cline 모드에서는 토글이 true여도 번역 안됨
		const result = processBackendMessage(message, {
			mode: "cline",
			enableBackendI18n: true,
		})
		expect(result).toBe(message)
	})
})

describe("Error Cases", () => {
	test("should handle unknown message types gracefully", () => {
		const message = "Unknown backend message format"
		expect(() => processBackendMessage(message)).not.toThrow()
	})

	test("should handle invalid options gracefully", () => {
		const message = "Cline wants to edit file.js"

		expect(() => processBackendMessage(message, null as any)).not.toThrow()
		expect(() => processBackendMessage(message, {} as any)).not.toThrow()
	})

	test("should handle missing i18n keys", () => {
		const result = translateBackendMessage("nonexistent_key" as any, "ko")
		expect(result).toBe("nonexistent_key") // fallback
	})

	test("should handle malformed messages", () => {
		const malformedMessages = [
			"Cline wants to", // 불완전한 메시지
			"wants to edit", // 주체 없음
			"Cline to edit", // wants 누락
		]

		malformedMessages.forEach((message) => {
			expect(() => processBackendMessage(message)).not.toThrow()
		})
	})
})
