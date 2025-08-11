import { ChatbotModeResponseRequest } from "@shared/proto/caret/ui"
import { Empty } from "@shared/proto/caret/common"

export async function handleChatbotModeResponse(request: ChatbotModeResponseRequest): Promise<Empty> {
	// TODO: Implement Caret chatbot mode response handling logic
	console.log("handleChatbotModeResponse called with:", request.response)

	return Empty.create({})
}
