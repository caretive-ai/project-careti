import { ChatContent } from "@shared/ChatContent"
import { ChatSettings } from "@shared/ChatSettings"
// CARET MODIFICATION: Chatbot/Agent 용어 통일
import { ChatContent as ProtoChatContent, ChatSettings as ProtoChatSettings, ChatbotAgentMode } from "@shared/proto/cline/state"

/**
 * Converts domain ChatSettings objects to proto ChatSettings objects
 */
export function convertChatSettingsToProtoChatSettings(chatSettings: ChatSettings): ProtoChatSettings {
	// CARET MODIFICATION: Mission 2 - Cline/Caret 모드 용어를 enum으로 변환
	let protoMode: ChatbotAgentMode
	
	if (chatSettings.mode === "chatbot" || chatSettings.mode === "plan") {
		protoMode = ChatbotAgentMode.CHATBOT_MODE
	} else if (chatSettings.mode === "agent" || chatSettings.mode === "act") {
		protoMode = ChatbotAgentMode.AGENT_MODE
	} else {
		// 기본값
		protoMode = ChatbotAgentMode.AGENT_MODE
	}
	
	return ProtoChatSettings.create({
		mode: protoMode, // CARET MODIFICATION: Mission 2 - 통합 모드 매핑
		preferredLanguage: chatSettings.preferredLanguage,
		openAiReasoningEffort: chatSettings.openAIReasoningEffort,
		uiLanguage: chatSettings.uiLanguage, // CARET MODIFICATION: UI 언어 필드 추가
		modeSystem: chatSettings.modeSystem, // CARET MODIFICATION: Mode system 필드 추가
	})
}

/**
 * Converts proto ChatSettings objects to domain ChatSettings objects
 */
export function convertProtoChatSettingsToChatSettings(protoChatSettings: ProtoChatSettings): ChatSettings {
	// CARET MODIFICATION: Mission 2 - modeSystem에 따른 모드 용어 변환
	const modeSystem = protoChatSettings.modeSystem || "caret" // 기본값은 caret
	let modeString: "chatbot" | "agent" | "plan" | "act"
	
	if (modeSystem === "cline") {
		// Cline 모드: CHATBOT_MODE=plan, AGENT_MODE=act
		modeString = protoChatSettings.mode === ChatbotAgentMode.CHATBOT_MODE ? "plan" : "act"
	} else {
		// Caret 모드: CHATBOT_MODE=chatbot, AGENT_MODE=agent
		modeString = protoChatSettings.mode === ChatbotAgentMode.CHATBOT_MODE ? "chatbot" : "agent"
	}

	return {
		mode: modeString, // CARET MODIFICATION: Mission 2 - Cline/Caret 모드 용어 지원
		preferredLanguage: protoChatSettings.preferredLanguage,
		openAIReasoningEffort: protoChatSettings.openAiReasoningEffort as "low" | "medium" | "high" | undefined,
		uiLanguage: protoChatSettings.uiLanguage, // CARET MODIFICATION: UI 언어 필드 추가
		modeSystem: protoChatSettings.modeSystem, // CARET MODIFICATION: Mode system 필드 추가
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
