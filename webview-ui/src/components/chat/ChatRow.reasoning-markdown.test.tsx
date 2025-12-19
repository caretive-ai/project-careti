// CARET MODIFICATION: verify reasoning messages render markdown content.
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ChatRowContent } from "./ChatRow"
import type { ClineMessage } from "@shared/ExtensionMessage"

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		mcpServers: [],
		mcpMarketplaceCatalog: [],
		onRelinquishControl: () => () => {},
		enablePersonaSystem: false,
		featureConfig: {
			showPersonaSettings: false,
			showCostInformation: false,
		},
	}),
}))

vi.mock("@/caret/context/CaretStateContext", () => ({
	useCaretState: () => ({
		personaProfile: undefined,
	}),
}))

vi.mock("@/components/common/MarkdownBlock", () => ({
	default: ({ markdown }: { markdown?: string }) => <div data-testid="markdown">{markdown}</div>,
}))

vi.mock("@/services/grpc-client", () => ({
	FileServiceClient: {},
	TaskServiceClient: {},
	UiServiceClient: {},
	StateServiceClient: {},
}))

describe("ChatRowContent", () => {
	it("renders reasoning text as markdown when expanded", () => {
		const message: ClineMessage = {
			type: "say",
			say: "reasoning",
			text: "**bold**",
			ts: 123,
		}

		const markup = renderToStaticMarkup(
			<ChatRowContent
				isExpanded={true}
				isLast={false}
				message={message}
				onSetQuote={vi.fn()}
				onToggleExpand={vi.fn()}
			/>
		)

		expect(markup).toContain('data-testid="markdown"')
		expect(markup).toContain("**bold**")
	})
})
