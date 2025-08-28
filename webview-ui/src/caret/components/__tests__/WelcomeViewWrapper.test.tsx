// CARET MODIFICATION: Test for WelcomeViewWrapper
import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import WelcomeViewWrapper from "../WelcomeViewWrapper"
import { setGlobalUILanguage } from "../../utils/i18n"
import { CARET_MODES } from "@caret-src/shared/constants/ModeSystemConstants"

// Mock the external dependencies
vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		apiConfiguration: {},
		mode: CARET_MODES.AGENT,
	}),
}))

vi.mock("@/utils/validate", () => ({
	validateApiConfiguration: () => undefined,
}))

vi.mock("@/services/grpc-client", () => ({
	AccountServiceClient: {
		accountLoginClicked: vi.fn().mockResolvedValue({}),
	},
	StateServiceClient: {
		setWelcomeViewCompleted: vi.fn().mockResolvedValue({}),
	},
}))

vi.mock("@shared/proto/cline/common", () => ({
	EmptyRequest: { create: vi.fn(() => ({})) },
	BooleanRequest: { create: vi.fn(() => ({})) },
}))

vi.mock("@/components/settings/ApiOptions", () => ({
	default: () => <div data-testid="api-options">API Options Component</div>,
}))

vi.mock("@/assets/ClineLogoWhite", () => ({
	default: (props: any) => (
		<div data-testid="cline-logo" {...props}>
			Cline Logo
		</div>
	),
}))

// Mock VSCode UI components
vi.mock("@vscode/webview-ui-toolkit/react", () => ({
	VSCodeButton: ({ children, ...props }: any) => (
		<button data-testid="vscode-button" {...props}>
			{children}
		</button>
	),
	VSCodeLink: ({ children, ...props }: any) => (
		<a data-testid="vscode-link" {...props}>
			{children}
		</a>
	),
}))

describe("WelcomeViewWrapper", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Ensure English is set for consistent tests
		setGlobalUILanguage("en")
	})

	it("renders with English UI by default", () => {
		render(<WelcomeViewWrapper />)

		// Check if English content is displayed (using actual translation keys)
		expect(screen.getByText(/Hello! AI Development Partner/)).toBeInTheDocument()
		expect(screen.getByText(/Start for Free/i)).toBeInTheDocument()
		expect(screen.getByText(/Use Your Own API Key/i)).toBeInTheDocument()
	})

	it("renders with Korean UI when language is set to ko", () => {
		render(<WelcomeViewWrapper uiLanguage="ko" />)

		// Check if Korean content is displayed (even with unprocessed templates, Korean text should appear)
		// We'll look for the Korean buttons which should work
		expect(screen.getByText(/무료로 시작하기/)).toBeInTheDocument()
	})

	it("renders the Cline logo", () => {
		render(<WelcomeViewWrapper />)
		expect(screen.getByTestId("cline-logo")).toBeInTheDocument()
	})

	it("includes community section", () => {
		render(<WelcomeViewWrapper />)
		expect(screen.getByText(/Join Our Community/i)).toBeInTheDocument()
		expect(screen.getByText(/GitHub Repository/i)).toBeInTheDocument()
	})

	it("includes education offer section", () => {
		render(<WelcomeViewWrapper />)
		expect(screen.getByText(/Start Now/i)).toBeInTheDocument()
	})

	it("handles different languages correctly", () => {
		const { rerender } = render(<WelcomeViewWrapper uiLanguage="en" />)
		expect(screen.getByText(/Start for Free/i)).toBeInTheDocument()

		rerender(<WelcomeViewWrapper uiLanguage="ko" />)
		expect(screen.getByText(/무료로 시작하기/)).toBeInTheDocument()
	})
})
