/**
 * CARET MODIFICATION: Utility to systematically remove simple CARET MODIFICATIONs
 *
 * Strategy: 많은 파일에서 단순히 enum이나 배열에 항목을 추가한 경우,
 * 이런 수정들을 중앙화하여 파일 수를 대폭 줄입니다.
 */

// 도구 목록을 중앙에서 관리
export const CARET_TOOLS = ["chatbot_mode_respond"]

// 도구 이름 목록을 가져오는 함수
export function getToolUseNames(): string[] {
	const baseClineTools = [
		"str_replace_editor",
		"bash",
		"list_files",
		"grep",
		"write_file",
		"use_mcp_tool",
		"access_mcp_resource",
		"ask_followup_question",
		"plan_mode_respond",
		"load_mcp_documentation",
		"attempt_completion",
		"new_task",
		"condense",
		"summarize_task",
	]

	// Caret 도구들을 동적으로 추가
	return [...baseClineTools, ...CARET_TOOLS]
}

// Proto enum 값들을 중앙에서 관리
export const CARET_PROTO_VALUES = {
	CHATBOT_MODE_RESPOND: 100, // Safe number to avoid conflicts
}

export function getAllToolEnumValues() {
	// 기존 Cline enum 값들 + Caret 값들
	return {
		// ... 기존 Cline 값들
		...CARET_PROTO_VALUES,
	}
}
