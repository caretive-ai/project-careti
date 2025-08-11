import { ChatContent } from "../../ChatContent"
import { ChatSettings } from "../../ChatSettings"
// CARET MODIFICATION: Chatbot/Agent mode terminology alignment
import { ChatContent as ProtoChatContent } from "../../proto/cline/state"
import { ChatSettings as ProtoChatSettings, ChatbotAgentMode } from "../../proto/caret/chat"

/**
 * Converts domain ChatSettings objects to proto ChatSettings objects
 */
export function convertChatSettingsToProtoChatSettings(chatSettings: ChatSettings): ProtoChatSettings {
	// CARET MODIFICATION: Mission 2 - Cline/Caret 모드 ?�어�?enum?�로 변??
	let protoMode: ChatbotAgentMode

	if (chatSettings.mode === "chatbot" || chatSettings.mode === "plan") {
		protoMode = ChatbotAgentMode.CHATBOT_MODE
	} else if (chatSettings.mode === "agent" || chatSettings.mode === "act") {
		protoMode = ChatbotAgentMode.AGENT_MODE
	} else {
		// 기본�?
		protoMode = ChatbotAgentMode.AGENT_MODE
	}

	return ProtoChatSettings.create({
		mode: protoMode, // CARET MODIFICATION: Mission 2 - ?�합 모드 매핑
		preferredLanguage: chatSettings.preferredLanguage,
		openAiReasoningEffort: chatSettings.openAIReasoningEffort,
		uiLanguage: chatSettings.uiLanguage, // CARET MODIFICATION: UI ?�어 ?�드 추�?
		modeSystem: chatSettings.modeSystem, // CARET MODIFICATION: Mode system ?�드 추�?
	})
}

/**
 * Converts proto ChatSettings objects to domain ChatSettings objects
 */
export function convertProtoChatSettingsToChatSettings(protoChatSettings: ProtoChatSettings): ChatSettings {
	// CARET MODIFICATION: Mission 2 - modeSystem???�른 모드 ?�어 변??
	const modeSystem = protoChatSettings.modeSystem || "caret" // 기본값�? caret
	let modeString: "chatbot" | "agent" | "plan" | "act"

	if (modeSystem === "cline") {
		// Cline 모드: CHATBOT_MODE=plan, AGENT_MODE=act
		modeString = protoChatSettings.mode === ChatbotAgentMode.CHATBOT_MODE ? "plan" : "act"
	} else {
		// Caret 모드: CHATBOT_MODE=chatbot, AGENT_MODE=agent
		modeString = protoChatSettings.mode === ChatbotAgentMode.CHATBOT_MODE ? "chatbot" : "agent"
	}

	return {
		mode: modeString, // CARET MODIFICATION: Mission 2 - Cline/Caret 모드 ?�어 지??
		preferredLanguage: protoChatSettings.preferredLanguage,
		openAIReasoningEffort: protoChatSettings.openAiReasoningEffort as "low" | "medium" | "high" | undefined,
		uiLanguage: protoChatSettings.uiLanguage, // CARET MODIFICATION: UI ?�어 ?�드 추�?
		modeSystem: protoChatSettings.modeSystem, // CARET MODIFICATION: Mode system ?�드 추�?
	}
}

/**
 * Converts domain ChatContent objects to proto ChatContent objects
 */
export function convertChatContentToProtoChatContent(chatContent?: ChatContent): ProtoChatContent | undefined {
	if (!chatContent) {
		return undefined
	}

	return ProtoChatContent.create({
		message: chatContent.message,
		images: chatContent.images || [],
		files: chatContent.files || [],
	})
}

/**
 * Converts proto ChatContent objects to domain ChatContent objects
 */
export function convertProtoChatContentToChatContent(protoChatContent?: ProtoChatContent): ChatContent | undefined {
	if (!protoChatContent) {
		return undefined
	}

	return {
		message: protoChatContent.message,
		images: protoChatContent.images || [],
		files: protoChatContent.files || [],
	}
}
