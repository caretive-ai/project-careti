import { Controller } from ".."
import { Boolean } from "@shared/proto/cline/common"
import { TogglePlanActModeRequest, PlanActMode } from "@shared/proto/cline/state"
import { ChatSettings } from "@shared/ChatSettings"
import { convertProtoChatContentToChatContent } from "@shared/proto-conversions/state/chat-settings-conversion"

/**
 * Toggles between Plan and Act modes
 * @param controller The controller instance
 * @param request The request containing the chat settings and optional chat content
 * @returns An empty response
 */
export async function togglePlanActModeProto(controller: Controller, request: TogglePlanActModeRequest): Promise<Boolean> {
	try {
		const currentChatSettings = controller.cacheService.getWorkspaceStateKey<ChatSettings>("chatSettings")
		let newMode: "plan" | "act"
		if (request.mode === PlanActMode.PLAN) {
			newMode = "plan"
		} else if (request.mode === PlanActMode.ACT) {
			newMode = "act"
		} else {
			throw new Error(`Invalid mode value: ${request.mode}`)
		}

		const newChatSettings: ChatSettings = {
			...(currentChatSettings ?? {}),
			mode: newMode,
		}

		const chatContent = request.chatContent ? convertProtoChatContentToChatContent(request.chatContent) : undefined

		// Call the existing controller implementation
		const sentMessage = await controller.toggleChatbotAgentModeWithChatSettings(newChatSettings, chatContent)

		return Boolean.create({
			value: sentMessage,
		})
	} catch (error) {
		console.error("Failed to toggle Plan/Act mode:", error)
		throw error
	}
}
