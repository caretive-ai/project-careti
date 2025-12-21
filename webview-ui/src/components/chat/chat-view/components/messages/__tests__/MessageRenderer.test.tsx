// CARET MODIFICATION: TDD 회귀 테스트 - 마지막 메시지가 자동승인 바에 가려지지 않도록 마지막 아이템에 bottom padding이 적용되어야 함 (R-3400-04)

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MessageRenderer } from "../MessageRenderer"

vi.mock("@/components/chat/ChatRow", () => ({
	default: () => <div data-testid="chat-row" />,
}))

vi.mock("@/components/chat/BrowserSessionRow", () => ({
	default: () => <div data-testid="browser-row" />,
}))

describe("MessageRenderer bottom padding", () => {
	const noop = () => {}

	it("마지막 메시지일 때 wrapper에 pb-2.5가 포함된다", () => {
		const msg: any = { ts: 1, say: "text", text: "hi" }
		const groupedMessages: any[] = [msg]

		render(
			<MessageRenderer
				expandedRows={{}}
				groupedMessages={groupedMessages}
				index={0}
				inputValue=""
				messageHandlers={{ handleSendMessage: noop } as any}
				messageOrGroup={msg}
				modifiedMessages={[]}
				onHeightChange={noop}
				onSetQuote={noop}
				onToggleExpand={noop}
			/>,
		)

		const row = screen.getByTestId("chat-row")
		expect(row.parentElement?.className).toContain("pb-2.5")
	})

	it("마지막 메시지가 아니면 wrapper에 pb-2.5가 포함되지 않는다", () => {
		const msg1: any = { ts: 1, say: "text", text: "hi" }
		const msg2: any = { ts: 2, say: "text", text: "hi2" }
		const groupedMessages: any[] = [msg1, msg2]

		render(
			<MessageRenderer
				expandedRows={{}}
				groupedMessages={groupedMessages}
				index={0}
				inputValue=""
				messageHandlers={{ handleSendMessage: noop } as any}
				messageOrGroup={msg1}
				modifiedMessages={[]}
				onHeightChange={noop}
				onSetQuote={noop}
				onToggleExpand={noop}
			/>,
		)

		const row = screen.getByTestId("chat-row")
		expect(row.parentElement?.className || "").to.not.contain("pb-2.5")
	})
})
