import { Controller } from ".."
import { Empty } from "@shared/proto/cline/common"
import { PlanActMode, TogglePlanActModeRequest } from "@shared/proto/cline/state"
import { convertProtoChatContentToChatContent } from "@shared/proto-conversions/state/chat-settings-conversion"
import { ChatSettings } from "@shared/ChatSettings"

/**
 * Toggles between Chatbot and Agent modes
 * @param controller The controller instance
 * @param request The request containing the chat settings and optional chat content
 * @returns An empty response
 */
export async function toggleChatbotAgentMode(controller: Controller, request: TogglePlanActModeRequest): Promise<Empty> {
	try {
		const currentChatSettings = controller.cacheService.getWorkspaceStateKey<ChatSettings>("chatSettings")
		const newMode = request.mode === PlanActMode.PLAN ? "chatbot" : "agent"

		const newChatSettings: ChatSettings = {
			...(currentChatSettings ?? {}),
			mode: newMode,
		}

		const chatContent = request.chatContent ? convertProtoChatContentToChatContent(request.chatContent) : undefined

		// CARET MODIFICATION: Mission 2 - 모드 토글 로깅 추가 (상세)
		const { caretLogger } = await import("../../../../caret-src/utils/caret-logger")
		caretLogger.info(
			`🔄 [TOGGLE] toggleChatbotAgentMode called: rawMode=${request.mode}, convertedMode=${newChatSettings.mode}`,
			"STATE",
		)

		// Call the existing controller implementation
		await controller.toggleChatbotAgentModeWithChatSettings(newChatSettings, chatContent)

		caretLogger.info(`✅ [TOGGLE] toggleChatbotAgentMode completed: mode=${newChatSettings.mode}`, "STATE")
		return Empty.create()
	} catch (error) {
		console.error("Failed to toggle Chatbot/Agent mode:", error)
		throw error
	}
}
