import { Controller } from ".."
import { Empty } from "@shared/proto/cline/common"
import { ToggleChatbotAgentModeRequest } from "@shared/proto/cline/state"
import {
	convertProtoChatContentToChatContent,
	convertProtoChatSettingsToChatSettings,
} from "@shared/proto-conversions/state/chat-settings-conversion"

/**
 * Toggles between Chatbot and Agent modes
 * @param controller The controller instance
 * @param request The request containing the chat settings and optional chat content
 * @returns An empty response
 */
export async function toggleChatbotAgentMode(controller: Controller, request: ToggleChatbotAgentModeRequest): Promise<Empty> {
	try {
		if (!request.chatSettings) {
			throw new Error("Chat settings are required")
		}

		const chatSettings = convertProtoChatSettingsToChatSettings(request.chatSettings)
		const chatContent = request.chatContent ? convertProtoChatContentToChatContent(request.chatContent) : undefined

		// CARET MODIFICATION: Mission 2 - 모드 토글 로깅 추가 (상세)
		const { caretLogger } = await import("../../../../caret-src/utils/caret-logger")
		caretLogger.info(
			`🔄 [TOGGLE] toggleChatbotAgentMode called: rawMode=${request.chatSettings.mode}, convertedMode=${chatSettings.mode}`,
			"STATE",
		)

		// Call the existing controller implementation
		await controller.toggleChatbotAgentModeWithChatSettings(chatSettings, chatContent)

		caretLogger.info(`✅ [TOGGLE] toggleChatbotAgentMode completed: mode=${chatSettings.mode}`, "STATE")
		return Empty.create()
	} catch (error) {
		console.error("Failed to toggle Chatbot/Agent mode:", error)
		throw error
	}
}
