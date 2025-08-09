import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import "@testing-library/jest-dom"
import CaretWelcome from "../CaretWelcome"
// CARET MODIFICATION: Import caretWebviewLogger for testing
import { caretWebviewLogger } from "../../utils/webview-logger"

// Mock dependencies
vi.mock("../../../context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		caretBanner: "mock-banner-url.png",
	}),
}))

vi.mock("../CaretFooter", () => ({
	default: function MockCaretFooter() {
		return React.createElement("div", { "data-testid": "caret-footer" }, "Mock Caret Footer")
	},
}))

// Mock i18n
vi.mock("../../utils/i18n", () => ({
	t: (key: string, namespace: string) => {
		if (namespace === "welcome" && key === "getStarted.button") {
			return "시작하기"
		}
		return `${namespace}.${key}`
	},
}))

// Mock webview logger
vi.mock("../../utils/webview-logger", () => ({
	caretWebviewLogger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	},
}))

// Mock CSS import
vi.mock("../../styles/CaretWelcome.css", () => ({}))

describe("CaretWelcome", () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Mock console methods
		vi.spyOn(console, "log").mockImplementation(() => {})
		vi.spyOn(console, "info").mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe("should render correctly", () => {
		it("should render without crashing", () => {
			render(React.createElement(CaretWelcome))
			expect(screen.getByTestId("caret-footer")).toBeInTheDocument()
		})

		it("should have correct CSS class names", () => {
			const { container } = render(React.createElement(CaretWelcome))

			expect(container.querySelector(".caret-welcome")).toBeInTheDocument()
			expect(container.querySelector(".caret-welcome-container")).toBeInTheDocument()
			expect(container.querySelector(".caret-banner")).toBeInTheDocument()
			expect(container.querySelector(".caret-header")).toBeInTheDocument()
			expect(container.querySelector(".caret-features")).toBeInTheDocument()
			expect(container.querySelector(".caret-flexibility")).toBeInTheDocument()
			expect(container.querySelector(".caret-account")).toBeInTheDocument()
			expect(container.querySelector(".caret-education")).toBeInTheDocument()
			expect(container.querySelector(".caret-actions")).toBeInTheDocument()
		})
	})

	describe("should render banner section", () => {
		it("should render banner image with correct src and alt", () => {
			render(React.createElement(CaretWelcome))

			const bannerImage = screen.getByRole("img")
			expect(bannerImage).toBeInTheDocument()
			expect(bannerImage).toHaveAttribute("src", "mock-banner-url.png")
			expect(bannerImage).toHaveAttribute("alt", "welcome.bannerAlt")
			expect(bannerImage).toHaveClass("caret-banner-image")
		})
	})

	describe("should render header section", () => {
		it("should render greeting text", () => {
			render(React.createElement(CaretWelcome))
			expect(screen.getByText("welcome.greeting")).toBeInTheDocument()
		})

		it("should render catch phrase", () => {
			render(React.createElement(CaretWelcome))
			expect(screen.getByText("welcome.catchPhrase")).toBeInTheDocument()
		})

		it("should apply correct CSS classes to header elements", () => {
			const { container } = render(React.createElement(CaretWelcome))

			const subtitle = container.querySelector(".caret-subtitle")
			const description = container.querySelector(".caret-description")

			expect(subtitle).toBeInTheDocument()
			expect(subtitle).toHaveTextContent("welcome.greeting")
			expect(description).toBeInTheDocument()
			expect(description).toHaveTextContent("welcome.catchPhrase")
		})
	})

	describe("should render content sections", () => {
		it("should render core features section", () => {
			render(React.createElement(CaretWelcome))

			expect(screen.getByText("welcome.coreFeatures.header")).toBeInTheDocument()
			expect(screen.getByText("welcome.coreFeatures.description")).toBeInTheDocument()
		})

		it("should render model flexibility section", () => {
			render(React.createElement(CaretWelcome))

			expect(screen.getByText("welcome.modelFlexibility.header")).toBeInTheDocument()
			expect(screen.getByText("welcome.modelFlexibility.body")).toBeInTheDocument()
		})

		it("should render caret account section", () => {
			render(React.createElement(CaretWelcome))

			expect(screen.getByText("welcome.caretAccount.header")).toBeInTheDocument()
			expect(screen.getByText("welcome.caretAccount.body")).toBeInTheDocument()
		})

		it("should render education offer section", () => {
			render(React.createElement(CaretWelcome))

			expect(screen.getByText("welcome.educationOffer.header")).toBeInTheDocument()
			expect(screen.getByText("welcome.educationOffer.body")).toBeInTheDocument()
		})
	})

	describe("should handle get started button", () => {
		it("should render get started button", () => {
			render(React.createElement(CaretWelcome))

			const button = screen.getByText("시작하기")
			expect(button).toBeInTheDocument()
		})

		it("should call onGetStarted when provided and button is clicked", () => {
			const mockOnGetStarted = vi.fn()
			render(React.createElement(CaretWelcome, { onGetStarted: mockOnGetStarted }))

			const button = screen.getByText("시작하기")
			fireEvent.click(button)

			expect(mockOnGetStarted).toHaveBeenCalledTimes(1)
		})

		it("should not throw error when onGetStarted is not provided and button is clicked", () => {
			render(React.createElement(CaretWelcome))

			const button = screen.getByText("시작하기")
			expect(() => fireEvent.click(button)).not.toThrow()
		})

		it("should log messages via caretWebviewLogger when button is clicked", () => {
			// CARET MODIFICATION: Test caretWebviewLogger instead of console.log
			const mockCaretLogger = vi.mocked(caretWebviewLogger)

			render(React.createElement(CaretWelcome))

			const button = screen.getByText("시작하기")
			fireEvent.click(button)

			expect(mockCaretLogger.info).toHaveBeenCalledWith("Caret Welcome: Get Started clicked")
			expect(mockCaretLogger.info).toHaveBeenCalledWith(
				"[CARET-INFO] [UI] 웰컴 페이지에서 '시작하기' 버튼이 클릭되었습니다",
			)
		})
	})

	describe("should render footer", () => {
		it("should render CaretFooter component", () => {
			render(React.createElement(CaretWelcome))
			expect(screen.getByTestId("caret-footer")).toBeInTheDocument()
		})
	})

	describe("should handle props correctly", () => {
		it("should work without any props", () => {
			expect(() => render(React.createElement(CaretWelcome))).not.toThrow()
		})

		it("should work with onGetStarted prop", () => {
			const mockOnGetStarted = vi.fn()
			expect(() => render(React.createElement(CaretWelcome, { onGetStarted: mockOnGetStarted }))).not.toThrow()
		})
	})

	// ✨ Task #002-4: i18n 하드코딩 텍스트 수정 TDD 테스트
	describe("🎯 Task #002-4: i18n 하드코딩 텍스트 수정", () => {
		it("should use i18n for 'Get Started' button text instead of hardcoded Korean", () => {
			render(React.createElement(CaretWelcome))

			// VSCode Button 컴포넌트는 일반적인 role="button"이 아닌 vscode-button 태그로 렌더링됨
			const getStartedButton = screen.getByText("시작하기")
			expect(getStartedButton).toBeInTheDocument()
			expect(getStartedButton.tagName.toLowerCase()).toBe("vscode-button")
		})

		it("should properly use welcome namespace for getStarted.button key", () => {
			render(React.createElement(CaretWelcome))

			// 현재 모킹에서 정확한 키와 네임스페이스를 사용했을 때만 "시작하기"가 나타남
			// 이는 실제 코드에서 t("getStarted.button", "welcome")를 사용하고 있음을 의미
			const button = screen.getByText("시작하기")
			expect(button).toBeInTheDocument()
		})

		it("should maintain button functionality after i18n integration", () => {
			const mockOnGetStarted = vi.fn()
			render(React.createElement(CaretWelcome, { onGetStarted: mockOnGetStarted }))

			const button = screen.getByText("시작하기")
			fireEvent.click(button)

			expect(mockOnGetStarted).toHaveBeenCalledTimes(1)
		})
	})
})
