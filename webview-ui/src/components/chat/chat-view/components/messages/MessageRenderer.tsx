import { ClineMessage } from "@shared/ExtensionMessage"
import React from "react"
import BrowserSessionRow from "@/components/chat/BrowserSessionRow"
import ChatRow from "@/components/chat/ChatRow"
import { MessageHandlers } from "../../types/chatTypes"

interface MessageRendererProps {
	index: number
	messageOrGroup: ClineMessage | ClineMessage[]
	groupedMessages: (ClineMessage | ClineMessage[])[]
	modifiedMessages: ClineMessage[]
	expandedRows: Record<number, boolean>
	onToggleExpand: (ts: number) => void
	onHeightChange: (isTaller: boolean) => void
	onSetQuote: (quote: string | null) => void
	inputValue: string
	messageHandlers: MessageHandlers
}

/**
 * Specialized component for rendering different message types
 * Handles browser sessions, regular messages, and checkpoint logic
 */
export const MessageRenderer: React.FC<MessageRendererProps> = ({
	index,
	messageOrGroup,
	groupedMessages,
	modifiedMessages,
	expandedRows,
	onToggleExpand,
	onHeightChange,
	onSetQuote,
	inputValue,
	messageHandlers,
}) => {
	// Browser session group
	if (Array.isArray(messageOrGroup)) {
		// CARET MODIFICATION: 마지막 메시지가 자동승인 바에 가려지지 않도록 마지막 그룹 아이템에 bottom padding 적용 (R-3400-04)
		const isLast = index === groupedMessages.length - 1
		return (
			<div className={isLast ? "pb-2.5" : undefined}>
				<BrowserSessionRow
					expandedRows={expandedRows}
					isLast={isLast}
					key={messageOrGroup[0]?.ts}
					lastModifiedMessage={modifiedMessages.at(-1)}
					messages={messageOrGroup}
					onHeightChange={onHeightChange}
					onSetQuote={onSetQuote}
					onToggleExpand={onToggleExpand}
				/>
			</div>
		)
	}

	// Determine if this is the last message for status display purposes
	const nextMessage = index < groupedMessages.length - 1 && groupedMessages[index + 1]
	const isNextCheckpoint = !Array.isArray(nextMessage) && nextMessage && nextMessage?.say === "checkpoint_created"
	const isLastMessageGroup = isNextCheckpoint && index === groupedMessages.length - 2
	const isLast = index === groupedMessages.length - 1 || isLastMessageGroup

	// Regular message
	return (
    <div className={isLast ? "pb-2.5" : undefined}>
      <ChatRow
        inputValue={inputValue}
        // CARET MODIFICATION: expand reasoning while streaming, collapse after final unless user toggled.
        isExpanded={expandedRows[messageOrGroup.ts] ?? (messageOrGroup.say === "reasoning" && messageOrGroup.partial !== false)}
        isLast={isLast}
        key={messageOrGroup.ts}
        lastModifiedMessage={modifiedMessages.at(-1)}
        message={messageOrGroup}
        onHeightChange={onHeightChange}
        onSetQuote={onSetQuote}
        onToggleExpand={onToggleExpand}
        sendMessageFromChatRow={messageHandlers.handleSendMessage}
      />
    </div>
	)
}

/**
 * Factory function to create the itemContent callback for Virtuoso
 * This allows us to encapsulate the rendering logic while maintaining performance
 */
export const createMessageRenderer = (
	groupedMessages: (ClineMessage | ClineMessage[])[],
	modifiedMessages: ClineMessage[],
	expandedRows: Record<number, boolean>,
	onToggleExpand: (ts: number) => void,
	onHeightChange: (isTaller: boolean) => void,
	onSetQuote: (quote: string | null) => void,
	inputValue: string,
	messageHandlers: MessageHandlers,
) => {
	return (index: number, messageOrGroup: ClineMessage | ClineMessage[]) => (
		<MessageRenderer
			expandedRows={expandedRows}
			groupedMessages={groupedMessages}
			index={index}
			inputValue={inputValue}
			messageHandlers={messageHandlers}
			messageOrGroup={messageOrGroup}
			modifiedMessages={modifiedMessages}
			onHeightChange={onHeightChange}
			onSetQuote={onSetQuote}
			onToggleExpand={onToggleExpand}
		/>
	)
}
