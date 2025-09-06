// CARET MODIFICATION: CaretAccountView integration test

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CaretUser } from "@/context/ExtensionStateContext"
import CaretAccountView from "../CaretAccountView"

// Mock the CaretGlobalManager - create a simple mock since webview can't access @caret paths
const mockCaretGlobalManager = {
	logout: vi.fn().mockResolvedValue(undefined),
}

// Mock dynamic import
vi.mock("../CaretAccountView", async () => {
	const actual = await vi.importActual("../CaretAccountView")
	return {
		...actual,
		// Override the dynamic import in the component
	}
})

// Mock react-use useInterval
vi.mock("react-use", () => ({
	useInterval: vi.fn(),
}))

describe("CaretAccountView Integration Test", () => {
	const mockCaretUser: CaretUser = {
		uid: "test-caret-user-123",
		email: "test@caret.team",
		displayName: "Test User",
		photoUrl: "https://example.com/avatar.jpg",
		appBaseUrl: "https://caret.team",
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("User Information Display", () => {
		it("should display user information correctly", () => {
			render(<CaretAccountView caretUser={mockCaretUser} />)

			// Check if user info is displayed
			expect(screen.getByText("Test User")).toBeInTheDocument()
			expect(screen.getByText("test@caret.team")).toBeInTheDocument()

			// Check if Caret provider tag is shown
			expect(screen.getByText("Caret")).toBeInTheDocument()
		})

		it("should display fallback initial when no displayName", () => {
			const userWithoutName: CaretUser = {
				...mockCaretUser,
				displayName: undefined,
			}
			render(<CaretAccountView caretUser={userWithoutName} />)

			// Should show email initial
			expect(screen.getByText("T")).toBeInTheDocument() // First letter of email
		})

		it("should display fallback 'C' when no displayName or email", () => {
			const userWithoutInfo: CaretUser = {
				...mockCaretUser,
				displayName: undefined,
				email: undefined,
			}
			render(<CaretAccountView caretUser={userWithoutInfo} />)

			// Should show fallback 'C'
			expect(screen.getByText("C")).toBeInTheDocument()
		})
	})

	describe("Account Actions", () => {
		it("should have dashboard link with correct URL", () => {
			render(<CaretAccountView caretUser={mockCaretUser} />)

			const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
			expect(dashboardLink).toHaveAttribute("href", "https://caret.team/dashboard")
		})

		it("should have logout button and handle logout click", async () => {
			render(<CaretAccountView caretUser={mockCaretUser} />)

			const logoutButton = screen.getByRole("button", { name: /log out/i })
			expect(logoutButton).toBeInTheDocument()

			// Just verify button exists and is clickable
			fireEvent.click(logoutButton)
			// Note: Actual logout functionality requires CaretGlobalManager integration
		})

		it("should use custom appBaseUrl if provided", () => {
			const customUser: CaretUser = {
				...mockCaretUser,
				appBaseUrl: "https://custom.caret.team",
			}
			render(<CaretAccountView caretUser={customUser} />)

			const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
			expect(dashboardLink).toHaveAttribute("href", "https://custom.caret.team/dashboard")
		})

		it("should fallback to default URL when no appBaseUrl", () => {
			const userWithoutUrl: CaretUser = {
				...mockCaretUser,
				appBaseUrl: undefined,
			}
			render(<CaretAccountView caretUser={userWithoutUrl} />)

			const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
			expect(dashboardLink).toHaveAttribute("href", "https://caret.team/dashboard")
		})
	})

	describe("Credit Balance Section", () => {
		it("should display credit balance section", () => {
			render(<CaretAccountView caretUser={mockCaretUser} />)

			// Check for credit balance heading
			expect(screen.getByText(/credit balance/i)).toBeInTheDocument()

			// Check for placeholder balance display
			expect(screen.getByText("$100.00")).toBeInTheDocument()
		})

		it("should have refresh balance button", () => {
			render(<CaretAccountView caretUser={mockCaretUser} />)

			const refreshButton = screen.getByTitle(/refresh balance/i)
			expect(refreshButton).toBeInTheDocument()
		})

		it("should show last updated timestamp", () => {
			render(<CaretAccountView caretUser={mockCaretUser} />)

			expect(screen.getByText(/last updated:/i)).toBeInTheDocument()
		})
	})

	describe("Usage History Section", () => {
		it("should display usage history placeholder", () => {
			render(<CaretAccountView caretUser={mockCaretUser} />)

			expect(screen.getByText(/usage history/i)).toBeInTheDocument()
			expect(screen.getByText(/usage history will be displayed here/i)).toBeInTheDocument()
			expect(screen.getByText(/coming soon with caret api integration/i)).toBeInTheDocument()
		})
	})

	describe("Component Integration", () => {
		it("should render without crashing with minimal props", () => {
			const minimalUser: CaretUser = {
				uid: "minimal-user",
			}

			expect(() => render(<CaretAccountView caretUser={minimalUser} />)).not.toThrow()
		})

		it("should handle loading state properly", async () => {
			render(<CaretAccountView caretUser={mockCaretUser} />)

			const refreshButton = screen.getByTitle(/refresh balance/i)
			fireEvent.click(refreshButton)

			// Should show loading state briefly
			await waitFor(
				() => {
					expect(screen.getByText("Loading...")).toBeInTheDocument()
				},
				{ timeout: 100 },
			)
		})
	})
})
