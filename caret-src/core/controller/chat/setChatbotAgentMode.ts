import { SetChatbotAgentModeRequest } from "@shared/proto/caret/chat"
import { Empty } from "@shared/proto/caret/common"

export async function setChatbotAgentMode(request: SetChatbotAgentModeRequest): Promise<Empty> {
	// TODO: Implement Caret chatbot/agent mode setting logic
	console.log("setChatbotAgentMode called with mode:", request.mode)

	return Empty.create({})
}
