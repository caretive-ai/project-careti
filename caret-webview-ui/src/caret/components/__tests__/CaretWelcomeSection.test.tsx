import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import CaretWelcomeSection from "../CaretWelcomeSection"

// Mock i18n
vi.mock("../../utils/i18n", () => ({
	t: (key: string, namespace: string) => `${namespace}.${key}`,
}))

describe("CaretWelcomeSection", () => {
	const defaultProps = {
		headerKey: "testHeader",
		bodyKey: "testBody",
	}

	describe("should render correctly", () => {
		it("should render with required props", () => {
			render(React.createElement(CaretWelcomeSection, defaultProps))

			expect(screen.getByText("welcome.testHeader")).toBeInTheDocument()
			expect(screen.getByText("welcome.testBody")).toBeInTheDocument()
		})

		it("should have correct CSS class names", () => {
			const { container } = render(React.createElement(CaretWelcomeSection, defaultProps))

			const section = container.querySelector(".caret-welcome-section")
			expect(section).toBeInTheDocument()
		})

		it("should apply custom className", () => {
			const customClass = "custom-test-class"
			const { container } = render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					className: customClass,
				}),
			)

			const section = container.querySelector(".caret-welcome-section")
			expect(section).toHaveClass("caret-welcome-section", customClass)
		})

		it("should apply default className when not provided", () => {
			const { container } = render(React.createElement(CaretWelcomeSection, defaultProps))

			const section = container.querySelector(".caret-welcome-section")
			expect(section).toHaveClass("caret-welcome-section")
		})
	})

	describe("should handle header and body content", () => {
		it("should render header with correct styling", () => {
			render(React.createElement(CaretWelcomeSection, defaultProps))

			const header = screen.getByRole("heading", { level: 3 })
			expect(header).toBeInTheDocument()
			expect(header).toHaveTextContent("welcome.testHeader")
			expect(header).toHaveStyle({
				fontSize: "1rem",
				marginBottom: "8px",
			})
		})

		it("should render body as regular paragraph by default", () => {
			render(React.createElement(CaretWelcomeSection, defaultProps))

			const bodyParagraph = screen.getByText("welcome.testBody")
			expect(bodyParagraph.tagName).toBe("P")
		})

		it("should render body with HTML when allowHtml is true", () => {
			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					allowHtml: true,
				}),
			)

			// When allowHtml is true, body should still be rendered (just with innerHTML)
			expect(screen.getByText("welcome.testBody")).toBeInTheDocument()
		})

		it("should render body as regular text when allowHtml is false", () => {
			const { container } = render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					allowHtml: false,
				}),
			)

			const bodyParagraph = container.querySelector("p:not([dangerouslySetInnerHTML])")
			expect(bodyParagraph).toBeInTheDocument()
			expect(bodyParagraph).toHaveTextContent("welcome.testBody")
		})
	})

	describe("should handle button configuration", () => {
		const mockHandler = vi.fn()
		const buttonConfig = {
			textKey: "buttonText",
			handler: mockHandler,
		}

		beforeEach(() => {
			vi.clearAllMocks()
		})

		it("should not render button when buttonConfig is not provided", () => {
			render(React.createElement(CaretWelcomeSection, defaultProps))

			const button = screen.queryByRole("button")
			expect(button).not.toBeInTheDocument()
		})

		it("should render button when buttonConfig is provided", () => {
			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			expect(button).toBeInTheDocument()
		})

		it("should call handler when button is clicked", () => {
			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			fireEvent.click(button)

			expect(mockHandler).toHaveBeenCalledTimes(1)
		})

		it("should apply default appearance when not specified", () => {
			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			expect(button).toBeInTheDocument()
			expect(button.tagName).toBe("VSCODE-BUTTON")
		})

		it("should apply primary appearance when specified", () => {
			const primaryButtonConfig = {
				...buttonConfig,
				appearance: "primary" as const,
			}

			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig: primaryButtonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			expect(button).toBeInTheDocument()
			expect(button.tagName).toBe("VSCODE-BUTTON")
		})

		it("should apply secondary appearance when specified", () => {
			const secondaryButtonConfig = {
				...buttonConfig,
				appearance: "secondary" as const,
			}

			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig: secondaryButtonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			expect(button).toBeInTheDocument()
			expect(button.tagName).toBe("VSCODE-BUTTON")
		})

		it("should disable button when disabled is true", () => {
			const disabledButtonConfig = {
				...buttonConfig,
				disabled: true,
			}

			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig: disabledButtonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			expect(button).toBeInTheDocument()
			expect(button.tagName).toBe("VSCODE-BUTTON")
		})

		it("should enable button when disabled is false", () => {
			const enabledButtonConfig = {
				...buttonConfig,
				disabled: false,
			}

			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig: enabledButtonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			expect(button).not.toBeDisabled()
		})

		it("should enable button by default when disabled is not specified", () => {
			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			expect(button).not.toBeDisabled()
		})

		it("should apply correct button styling", () => {
			render(
				React.createElement(CaretWelcomeSection, {
					...defaultProps,
					buttonConfig,
				}),
			)

			const button = screen.getByText("welcome.buttonText")
			expect(button).toHaveStyle({
				width: "100%",
				marginTop: "10px",
			})
		})
	})

	describe("should handle children content", () => {
		it("should not render children when not provided", () => {
			render(React.createElement(CaretWelcomeSection, defaultProps))

			const childElement = screen.queryByTestId("child-element")
			expect(childElement).not.toBeInTheDocument()
		})

		it("should render children when provided", () => {
			const childContent = "Test child content"
			render(React.createElement(CaretWelcomeSection, defaultProps, childContent))

			expect(screen.getByText(childContent)).toBeInTheDocument()
		})

		it("should render multiple children", () => {
			render(
				React.createElement(CaretWelcomeSection, defaultProps, [
					React.createElement("div", { key: "child-1", "data-testid": "child-1" }, "Child 1"),
					React.createElement("div", { key: "child-2", "data-testid": "child-2" }, "Child 2"),
				]),
			)

			expect(screen.getByTestId("child-1")).toBeInTheDocument()
			expect(screen.getByTestId("child-2")).toBeInTheDocument()
		})
	})

	describe("should apply correct styling", () => {
		it("should apply section styles", () => {
			const { container } = render(React.createElement(CaretWelcomeSection, defaultProps))

			const section = container.querySelector(".caret-welcome-section")
			expect(section).toHaveStyle({
				marginBottom: "10px",
				padding: "12px",
				border: "1px solid var(--vscode-settings-headerBorder)",
				borderRadius: "8px",
				backgroundColor: "var(--vscode-sideBar-background)",
				fontSize: "0.85rem",
			})
		})
	})

	describe("should handle complex scenarios", () => {
		const mockHandler = vi.fn()
		const complexButtonConfig = {
			textKey: "complexButton",
			handler: mockHandler,
			appearance: "primary" as const,
			disabled: false,
		}

		beforeEach(() => {
			vi.clearAllMocks()
		})

		it("should render all elements together", () => {
			render(
				React.createElement(
					CaretWelcomeSection,
					{
						...defaultProps,
						className: "complex-section",
						buttonConfig: complexButtonConfig,
						allowHtml: true,
					},
					React.createElement("div", { "data-testid": "complex-child" }, "Complex Child"),
				),
			)

			// Check all elements are present
			expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument()
			expect(screen.getByText("welcome.testBody")).toBeInTheDocument()
			expect(screen.getByTestId("complex-child")).toBeInTheDocument()
			expect(screen.getByText("welcome.complexButton")).toBeInTheDocument()

			// Check styling and classes
			const section = document.querySelector(".caret-welcome-section")
			expect(section).toHaveClass("complex-section")

			const button = screen.getByText("welcome.complexButton")
			expect(button).toBeInTheDocument()
			expect(button.tagName).toBe("VSCODE-BUTTON")
		})

		it("should maintain proper element order", () => {
			const { container } = render(
				React.createElement(
					CaretWelcomeSection,
					{
						...defaultProps,
						buttonConfig: complexButtonConfig,
					},
					React.createElement("div", { "data-testid": "child-content" }, "Child Content"),
				),
			)

			const section = container.querySelector(".caret-welcome-section")
			const children = Array.from(section?.children || [])

			// Check order: h3, p, children, button
			expect(children[0].tagName).toBe("H3")
			expect(children[1].tagName).toBe("P")
			expect(children[2]).toHaveAttribute("data-testid", "child-content")
			expect(children[3].tagName).toBe("VSCODE-BUTTON")
		})
	})
})
