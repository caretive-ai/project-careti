import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import "@testing-library/jest-dom"
import CaretFooter from "../CaretFooter"

// Mock i18n functions
vi.mock("../../utils/i18n", () => ({
	t: (key: string, namespace: string) => `${namespace}.${key}`,
	getGlobalLink: (linkKey: string) => {
		const links = {
			CARET_GITHUB: "https://github.com/aicoding-caret/caret",
			CARET_SERVICE: "https://caret.team",
			CARETIVE_COMPANY: "https://caretive.ai",
			CARETIVE_TERMS: "https://caretive.ai/terms",
			CARETIVE_PRIVACY: "https://caretive.ai/privacy",
			CARETIVE_SUPPORT: "https://caretive.ai/support",
			CARETIVE_YOUTH_PROTECTION: "https://caretive.ai/youth-protection",
		}
		return links[linkKey as keyof typeof links] || "#"
	},
}))

describe.skip("CaretFooter", () => {
	describe("should render correctly", () => {
		it("should render without crashing", () => {
			render(React.createElement(CaretFooter))
			expect(screen.getByRole("contentinfo")).toBeInTheDocument()
		})

		it("should have correct CSS class names", () => {
			const { container } = render(React.createElement(CaretFooter))

			expect(container.querySelector(".caret-footer")).toBeInTheDocument()
			expect(container.querySelector(".caret-footer-container")).toBeInTheDocument()
		})
	})

	describe("should render company information", () => {
		it("should render company name", () => {
			render(React.createElement(CaretFooter))
			expect(screen.getByText("welcome.footer.company.name")).toBeInTheDocument()
		})

		it("should render business number", () => {
			render(React.createElement(CaretFooter))
			expect(screen.getByText("welcome.footer.company.businessNumber")).toBeInTheDocument()
		})

		it("should render company address", () => {
			render(React.createElement(CaretFooter))
			expect(screen.getByText("welcome.footer.company.address")).toBeInTheDocument()
		})
	})

	describe("should render links correctly", () => {
		it("should render GitHub link", () => {
			render(React.createElement(CaretFooter))
			const githubLink = screen.getByRole("link", { name: "welcome.footer.links.caretGithub" })
			expect(githubLink).toBeInTheDocument()
			expect(githubLink).toHaveAttribute("href", "https://github.com/aicoding-caret/caret")
			expect(githubLink).toHaveAttribute("target", "_blank")
			expect(githubLink).toHaveAttribute("rel", "noopener noreferrer")
		})

		it("should render Caret Service link", () => {
			render(React.createElement(CaretFooter))
			const caretServiceLink = screen.getByRole("link", { name: "welcome.footer.links.caretService" })
			expect(caretServiceLink).toBeInTheDocument()
			expect(caretServiceLink).toHaveAttribute("href", "https://caret.team")
			expect(caretServiceLink).toHaveAttribute("target", "_blank")
			expect(caretServiceLink).toHaveAttribute("rel", "noopener noreferrer")
		})

		it("should render all footer links", () => {
			render(React.createElement(CaretFooter))
			const links = screen.getAllByRole("link")
			expect(links).toHaveLength(7) // Total number of footer links
		})
	})

	describe("should render copyright information", () => {
		it("should render built with message", () => {
			render(React.createElement(CaretFooter))
			expect(screen.getByText("welcome.footer.copyright.builtWith")).toBeInTheDocument()
		})

		it("should render version information", () => {
			render(React.createElement(CaretFooter))
			expect(screen.getByText("welcome.footer.copyright.version")).toBeInTheDocument()
		})
	})

	describe("should have correct structure", () => {
		it("should have proper semantic HTML structure", () => {
			render(React.createElement(CaretFooter))
			const footer = screen.getByRole("contentinfo")
			expect(footer.tagName).toBe("FOOTER")
		})
	})
})
