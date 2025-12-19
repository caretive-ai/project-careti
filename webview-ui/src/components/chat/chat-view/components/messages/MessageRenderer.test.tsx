// CARET MODIFICATION: verify reasoning messages default to expanded in chat rendering.
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import type { ClineMessage } from "@shared/ExtensionMessage"
import { describe, expect, it, vi } from "vitest"
import { MessageRenderer } from "./MessageRenderer"
import type { MessageHandlers } from "../../types/chatTypes"

vi.mock("@/components/chat/ChatRow", () => ({
	default: ({ isExpanded }: { isExpanded: boolean }) => (
		<div data-testid="chat-row" data-expanded={String(isExpanded)} />
	),
}))

vi.mock("@/components/chat/BrowserSessionRow", () => ({
	default: () => <div data-testid="browser-session-row" />,
}))

describe("MessageRenderer", () => {
	it("should expand reasoning messages by default", () => {
		const message: ClineMessage = {
			type: "say",
			say: "reasoning",
			text: "thinking...",
			ts: 123,
		}

		const messageHandlers: MessageHandlers = {
			handleSendMessage: vi.fn().mockResolvedValue(undefined),
			handleButtonClick: vi.fn().mockResolvedValue(undefined),
			executeButtonAction: vi.fn().mockResolvedValue(undefined),
			handleTaskCloseButtonClick: vi.fn().mockResolvedValue(undefined),
			startNewTask: vi.fn().mockResolvedValue(undefined),
		}

		const markup = renderToStaticMarkup(
			<MessageRenderer
				expandedRows={{}}
				groupedMessages={[message]}
				index={0}
				inputValue=""
				messageHandlers={messageHandlers}
				messageOrGroup={message}
				modifiedMessages={[message]}
				onHeightChange={vi.fn()}
				onSetQuote={vi.fn()}
				onToggleExpand={vi.fn()}
			/>
		)

		expect(markup).toContain('data-expanded="true"')
	})

	it("should collapse final reasoning messages by default", () => {
		const message: ClineMessage = {
			type: "say",
			say: "reasoning",
			text: "done",
			partial: false,
			ts: 456,
		}

		const messageHandlers: MessageHandlers = {
			handleSendMessage: vi.fn().mockResolvedValue(undefined),
			handleButtonClick: vi.fn().mockResolvedValue(undefined),
			executeButtonAction: vi.fn().mockResolvedValue(undefined),
			handleTaskCloseButtonClick: vi.fn().mockResolvedValue(undefined),
			startNewTask: vi.fn().mockResolvedValue(undefined),
		}

		const markup = renderToStaticMarkup(
			<MessageRenderer
				expandedRows={{}}
				groupedMessages={[message]}
				index={0}
				inputValue=""
				messageHandlers={messageHandlers}
				messageOrGroup={message}
				modifiedMessages={[message]}
				onHeightChange={vi.fn()}
				onSetQuote={vi.fn()}
				onToggleExpand={vi.fn()}
			/>
		)

		expect(markup).toContain('data-expanded="false"')
	})
})
