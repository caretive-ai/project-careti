// CARET MODIFICATION: ChatTextArea wrapper with i18n support
// This component wraps the original ChatTextArea and adds internationalization
import React, { forwardRef, useCallback } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"

// Import the original ChatTextArea
import OriginalChatTextArea from "@/components/chat/ChatTextArea"

interface ChatTextAreaWrapperProps {
	inputValue: string
	activeQuote: string | null
	setInputValue: (value: string) => void
	sendingDisabled: boolean
	selectedFiles: string[]
	selectedImages: string[]
	setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>
	setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>
	onSend: () => void
	onSelectFilesAndImages: () => void
	shouldDisableFilesAndImages: boolean
	onHeightChange?: (height: number) => void
	onFocusChange?: (isFocused: boolean) => void
}

const ChatTextAreaWrapper = forwardRef<HTMLTextAreaElement, ChatTextAreaWrapperProps>((props, ref) => {
	const { currentLanguage } = useCaretI18n()

	// Generate i18n placeholder text based on current language
	const placeholderText = useCallback(() => {
		return t("chat.placeholderHint", "common")
	}, [currentLanguage])

	// Pass all original props with i18n placeholder
	return <OriginalChatTextArea {...props} ref={ref} placeholderText={placeholderText()} />
})

ChatTextAreaWrapper.displayName = "ChatTextAreaWrapper"

export default ChatTextAreaWrapper
