import { EmptyRequest } from "@shared/proto/caret/common"
import { ChatSettings } from "@shared/proto/caret/chat"

export async function getChatSettings(request: EmptyRequest): Promise<ChatSettings> {
	// TODO: Implement Caret chat settings retrieval logic
	console.log("getChatSettings called")

	return ChatSettings.create({
		mode: 0, // CHATBOT_MODE
		preferredLanguage: "en",
		uiLanguage: "en",
	})
}
