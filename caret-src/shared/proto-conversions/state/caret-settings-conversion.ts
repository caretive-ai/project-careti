import { ChatContent } from "@shared/ChatContent"
import { CaretSettings } from "@caret/shared/CaretSettings"
import { ChatContent as ProtoChatContent, PlanActMode } from "@shared/proto/cline/state"

export interface ProtoCaretSettings {
	mode: PlanActMode
	preferredLanguage?: string
	openAiReasoningEffort?: string
	uiLanguage?: string
	modeSystem?: string
}

/**
 * Converts domain CaretSettings objects to proto CaretSettings objects
 */
export function convertCaretSettingsToProtoCaretSettings(caretSettings: CaretSettings): ProtoCaretSettings {
	let protoMode: PlanActMode

	if (caretSettings.mode === "chatbot" || caretSettings.mode === "plan") {
		protoMode = PlanActMode.PLAN
	} else if (caretSettings.mode === "agent" || caretSettings.mode === "act") {
		protoMode = PlanActMode.ACT
	} else {
		protoMode = PlanActMode.ACT
	}

	return {
		mode: protoMode,
		preferredLanguage: caretSettings.preferredLanguage,
		openAiReasoningEffort: caretSettings.openAIReasoningEffort,
		uiLanguage: caretSettings.uiLanguage,
		modeSystem: caretSettings.modeSystem,
	}
}

/**
 * Converts proto CaretSettings objects to domain CaretSettings objects
 */
export function convertProtoCaretSettingsToCaretSettings(protoCaretSettings: ProtoCaretSettings): CaretSettings {
	const modeSystem = protoCaretSettings.modeSystem || "caret"
	let modeString: "chatbot" | "agent" | "plan" | "act"

	if (modeSystem === "cline") {
		modeString = protoCaretSettings.mode === PlanActMode.PLAN ? "plan" : "act"
	} else {
		modeString = protoCaretSettings.mode === PlanActMode.PLAN ? "chatbot" : "agent"
	}

	// eslint-disable-next-line eslint-rules/no-protobuf-object-literals
	return {
		mode: modeString,
		preferredLanguage: protoCaretSettings.preferredLanguage,
		openAIReasoningEffort: protoCaretSettings.openAiReasoningEffort as "low" | "medium" | "high" | undefined,
		uiLanguage: protoCaretSettings.uiLanguage,
		modeSystem: protoCaretSettings.modeSystem,
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

	// eslint-disable-next-line eslint-rules/no-protobuf-object-literals
	return {
		message: protoChatContent.message,
		images: protoChatContent.images || [],
		files: protoChatContent.files || [],
	}
}
