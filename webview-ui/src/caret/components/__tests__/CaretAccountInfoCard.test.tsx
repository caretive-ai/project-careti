import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CaretAccountInfoCard } from "../CaretAccountInfoCard"
import { useFirebaseAuth } from "@/context/FirebaseAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { t } from "@/caret/utils/i18n"

// Mock dependencies
vi.mock("@/context/FirebaseAuthContext")
vi.mock("@/context/ExtensionStateContext")
vi.mock("@/services/grpc-client", () => ({
	AccountServiceClient: {
		accountLoginClicked: vi.fn(),
	},
}))

// Mock i18n
vi.mock("@/caret/utils/i18n", () => ({
	t: vi.fn((key: string) => {
		const translations: Record<string, string> = {
			"account.signUpWithCaret": "Sign Up with Caret",
			"account.viewBillingUsage": "View Billing & Usage",
		}
		return translations[key] || key
	}),
}))

const mockUseFirebaseAuth = vi.mocked(useFirebaseAuth)
const mockUseExtensionState = vi.mocked(useExtensionState)
const mockAccountServiceClient = vi.mocked(AccountServiceClient)
const mockT = vi.mocked(t)

describe("CaretAccountInfoCard - TDD Implementation", () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Default mock implementations
		mockUseFirebaseAuth.mockReturnValue({
			user: null,
			handleSignOut: vi.fn(),
		} as any)

		mockUseExtensionState.mockReturnValue({
			userInfo: null,
			apiConfiguration: { caretApiKey: null },
			navigateToAccount: vi.fn(),
		} as any)

		// Reset AccountServiceClient mock
		mockAccountServiceClient.accountLoginClicked.mockResolvedValue({})
	})

	describe("🔴 RED Phase - Failing Tests", () => {
		it('should display "Sign Up with Caret" button when user is not logged in', () => {
			render(<CaretAccountInfoCard />)

			// CARET MODIFICATION: Changed from "Sign Up with Cline" to "Sign Up with Caret"
			expect(screen.getByText("Sign Up with Caret")).toBeInTheDocument()
		})

		it('should display "View Billing & Usage" when user is logged in', () => {
			mockUseFirebaseAuth.mockReturnValue({
				user: { uid: "test-user" },
				handleSignOut: vi.fn(),
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				apiConfiguration: { caretApiKey: "test-key" },
				navigateToAccount: vi.fn(),
			} as any)

			render(<CaretAccountInfoCard />)

			expect(screen.getByText("View Billing & Usage")).toBeInTheDocument()
		})

		it("should call AccountServiceClient.accountLoginClicked when login button is clicked", async () => {
			render(<CaretAccountInfoCard />)

			const loginButton = screen.getByText("Sign Up with Caret")
			fireEvent.click(loginButton)

			expect(mockAccountServiceClient.accountLoginClicked).toHaveBeenCalledWith({})
		})

		it("should call navigateToAccount when billing button is clicked", () => {
			const mockNavigateToAccount = vi.fn()

			mockUseFirebaseAuth.mockReturnValue({
				user: { uid: "test-user" },
				handleSignOut: vi.fn(),
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				apiConfiguration: { caretApiKey: "test-key" },
				navigateToAccount: mockNavigateToAccount,
			} as any)

			render(<CaretAccountInfoCard />)

			const billingButton = screen.getByText("View Billing & Usage")
			fireEvent.click(billingButton)

			expect(mockNavigateToAccount).toHaveBeenCalled()
		})

		it("should use Caret branding and styling", () => {
			render(<CaretAccountInfoCard />)

			// Should contain Caret-specific branding
			expect(screen.getByText("Sign Up with Caret")).toBeInTheDocument()

			// Should have proper CSS classes for Caret theming
			const container = screen.getByText("Sign Up with Caret").closest("div")?.parentElement
			expect(container).toHaveClass("max-w-[600px]")
		})

		it("should use i18n translations for all text", () => {
			render(<CaretAccountInfoCard />)

			// Verify i18n functions are called with correct keys
			expect(mockT).toHaveBeenCalledWith("account.signUpWithCaret", "common")
		})
	})

	describe("🟢 GREEN Phase - Implementation Verification", () => {
		it("should render without errors", () => {
			expect(() => render(<CaretAccountInfoCard />)).not.toThrow()
		})

		it("should handle API errors gracefully", async () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

			mockAccountServiceClient.accountLoginClicked.mockRejectedValue(new Error("API Error"))

			render(<CaretAccountInfoCard />)

			const loginButton = screen.getByText("Sign Up with Caret")
			fireEvent.click(loginButton)

			// Should not throw error and should log the error
			await new Promise((resolve) => setTimeout(resolve, 0))
			expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to get login URL:", expect.any(Error))

			consoleErrorSpy.mockRestore()
		})
	})

	describe("🔄 REFACTOR Phase - Quality Verification", () => {
		it("should have correct component structure for maintainability", () => {
			render(<CaretAccountInfoCard />)

			// Should have proper container structure
			const container = screen.getByText("Sign Up with Caret").closest("div")?.parentElement
			expect(container).toHaveClass("max-w-[600px]")
		})

		it("should follow Caret naming conventions", () => {
			// Component should be named CaretAccountInfoCard (not ClineAccountInfoCard)
			expect(CaretAccountInfoCard.name).toBe("CaretAccountInfoCard")
		})

		it("should use Caret i18n system properly", () => {
			// Test with logged in user
			mockUseFirebaseAuth.mockReturnValue({
				user: { uid: "test-user" },
				handleSignOut: vi.fn(),
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				apiConfiguration: { caretApiKey: "test-key" },
				navigateToAccount: vi.fn(),
			} as any)

			render(<CaretAccountInfoCard />)

			// Verify both translations are used
			expect(mockT).toHaveBeenCalledWith("account.viewBillingUsage", "common")
		})
	})
})
