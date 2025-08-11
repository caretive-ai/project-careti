import { UpdateChatSettingsRequest } from "@shared/proto/caret/chat"
import { Empty } from "@shared/proto/caret/common"

export async function updateChatSettings(request: UpdateChatSettingsRequest): Promise<Empty> {
	// TODO: Implement Caret chat settings update logic
	console.log("updateChatSettings called with:", request.chatSettings)

	return Empty.create({})
}
