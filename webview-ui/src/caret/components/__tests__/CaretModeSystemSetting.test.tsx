// CARET MODIFICATION: Tests for CaretModeSystemSetting component
import { render, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import CaretModeSystemSetting from "../CaretModeSystemSetting"
import { CaretI18nProvider } from "../../context/CaretI18nContext"
import { MODE_SYSTEMS, STORAGE_KEYS } from "@caret-src/shared/constants/ModeSystemConstants"

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
	writable: true,
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<CaretI18nProvider defaultLanguage="en">{children}</CaretI18nProvider>
)

describe("CaretModeSystemSetting Component", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		localStorageMock.getItem.mockReturnValue(null)
	})

	it("should render with default Cline mode", () => {
		const { getByText } = render(<CaretModeSystemSetting />, { wrapper })

		expect(getByText("Mode System")).toBeInTheDocument()
		expect(getByText("Caret")).toBeInTheDocument()
		expect(getByText("Cline")).toBeInTheDocument()
	})

	it("should hide label when hideLabel prop is true", () => {
		const { queryByText } = render(<CaretModeSystemSetting hideLabel={true} />, { wrapper })

		expect(queryByText("Mode System")).not.toBeInTheDocument()
	})

	it("should display description text", () => {
		const { getByText } = render(<CaretModeSystemSetting />, { wrapper })

		expect(getByText("Choose between Caret or Cline mode.")).toBeInTheDocument()
	})

	it("should load saved mode from localStorage", () => {
		localStorageMock.getItem.mockReturnValue(MODE_SYSTEMS.CARET)

		render(<CaretModeSystemSetting />, { wrapper })

		expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.MODE_SYSTEM)
	})

	it("should toggle between Caret and Cline modes", async () => {
		const { container } = render(<CaretModeSystemSetting />, { wrapper })

		// Find the mode switch container
		const switchContainer = container.querySelector('[style*="position: relative"]')
		expect(switchContainer).toBeInTheDocument()

		// Click to toggle mode
		fireEvent.click(switchContainer!)

		// Should save to localStorage
		await waitFor(() => {
			expect(localStorageMock.setItem).toHaveBeenCalled()
		})
	})

	it("should handle localStorage errors gracefully", () => {
		localStorageMock.getItem.mockImplementation(() => {
			throw new Error("localStorage error")
		})

		// Should not throw and render normally
		expect(() => {
			render(<CaretModeSystemSetting />, { wrapper })
		}).not.toThrow()
	})
})
