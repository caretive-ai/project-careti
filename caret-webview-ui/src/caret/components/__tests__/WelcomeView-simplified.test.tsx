import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import WelcomeView from "../../../components/welcome/WelcomeView"

// Mock all dependencies with minimal setup
vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		apiConfiguration: null,
		caretBanner: "data:image/png;base64,test",
		chatSettings: { preferredLanguage: "English", uiLanguage: "ko" },
		setChatSettings: vi.fn(),
		setUILanguage: vi.fn(),
	}),
}))

vi.mock("@/utils/vscode", () => ({ vscode: { postMessage: vi.fn() } }))
vi.mock("@/caret/utils/i18n", () => ({ t: (key: string) => key }))
vi.mock("@/caret/hooks/useCurrentLanguage", () => ({ useCurrentLanguage: () => "ko" }))
vi.mock("@/caret/constants/urls", () => ({ CARET_URLS: {}, getLocalizedUrl: vi.fn() }))

// Mock complex components
vi.mock("@/caret/components/CaretWelcomeSection", () => ({ default: ({ children }: any) => <div>{children}</div> }))
vi.mock("@/caret/components/CaretApiSetup", () => ({ default: () => <div data-testid="api-setup" /> }))
vi.mock("@/caret/components/CaretFooter", () => ({ default: () => <div data-testid="footer" /> }))
vi.mock("@/components/settings/PreferredLanguageSetting", () => ({ default: () => <div data-testid="preferred-lang" /> }))
vi.mock("@/caret/components/CaretUILanguageSetting", () => ({ default: () => <div data-testid="ui-lang" /> }))
vi.mock("@/services/grpc-client", () => ({ ModelsServiceClient: { updateApiConfigurationProto: vi.fn() } }))
vi.mock("@shared/proto-conversions/models/api-configuration-conversion", () => ({ convertApiConfigurationToProto: vi.fn() }))

describe("WelcomeView - Language Selector Updates", () => {
	it("should render welcome view without old Hello greeting", () => {
		render(<WelcomeView />)

		// Should NOT have old greeting
		expect(screen.queryByText(/Hello! AI Development Partner/)).not.toBeInTheDocument()
	})

	it("should render basic welcome components", () => {
		render(<WelcomeView />)

		// Should have main welcome view
		expect(screen.getByTestId("caret-welcome-view")).toBeInTheDocument()
	})
})
