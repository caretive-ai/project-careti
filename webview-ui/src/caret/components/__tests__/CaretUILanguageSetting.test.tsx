// CARET MODIFICATION: Tests for CaretUILanguageSetting component
import { render } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CaretI18nProvider } from "../../context/CaretI18nContext"
import CaretUILanguageSetting from "../CaretUILanguageSetting"

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<CaretI18nProvider defaultLanguage="en">{children}</CaretI18nProvider>
)

describe("CaretUILanguageSetting Component", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should render language dropdown with label", () => {
		const { getByText, getByRole } = render(<CaretUILanguageSetting />, { wrapper })

		expect(getByText("UI Language")).toBeInTheDocument()
		expect(getByRole("combobox")).toBeInTheDocument()
	})

	it("should display all 4 language options", () => {
		const { getByText } = render(<CaretUILanguageSetting />, { wrapper })

		// Check if all language options are present
		expect(getByText("🇰🇷 한국어 (Korean)")).toBeInTheDocument()
		expect(getByText("🇺🇸 English")).toBeInTheDocument()
		expect(getByText("🇯🇵 日本語 (Japanese)")).toBeInTheDocument()
		expect(getByText("🇨🇳 中文 (Chinese)")).toBeInTheDocument()
	})

	it("should hide label when hideLabel prop is true", () => {
		const { queryByText } = render(<CaretUILanguageSetting hideLabel={true} />, { wrapper })

		expect(queryByText("UI Language")).not.toBeInTheDocument()
	})

	it("should show description text", () => {
		const { getByText } = render(<CaretUILanguageSetting />, { wrapper })

		expect(getByText("Choose the interface language for Caret.")).toBeInTheDocument()
	})

	it("should have the correct dropdown id and structure", async () => {
		const { container } = render(<CaretUILanguageSetting />, { wrapper })

		const dropdown = container.querySelector("#ui-language-select")
		expect(dropdown).toBeInTheDocument()
		expect(dropdown).toHaveAttribute("role", "combobox")

		// Check if it has the correct options
		const options = container.querySelectorAll("vscode-option")
		expect(options).toHaveLength(4)
	})
})
