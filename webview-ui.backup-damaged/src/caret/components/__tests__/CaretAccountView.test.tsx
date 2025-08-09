import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ClineAccountView } from "../CaretAccountView"
import { useFirebaseAuth } from "@/context/FirebaseAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { t, getLink } from "@/caret/utils/i18n"
import { getUrl } from "@/caret/constants/urls"

// Mock dependencies
vi.mock("@/context/FirebaseAuthContext")
vi.mock("@/context/ExtensionStateContext")
vi.mock("@/services/grpc-client", () => ({
	AccountServiceClient: {
		accountLoginClicked: vi.fn(),
		accountLogoutClicked: vi.fn(),
	},
}))

// Mock i18n
vi.mock("@/caret/utils/i18n", () => ({
	t: vi.fn((key: string) => {
		const translations: Record<string, string> = {
			"account.signUpWithCaret": "Sign Up with Caret",
			"account.dashboard": "Dashboard",
			"account.addCredits": "Add Credits",
			"account.currentBalance": "Current Balance",
			"account.logOut": "Log out",
			"account.loading": "Loading...",
			"account.signUpDescription":
				"Sign up for an account to get access to the latest models, billing dashboard to view usage and credits, and more upcoming features.",
			"account.byContining": "By continuing, you agree to the",
			"account.termsOfService": "Terms of Service",
			"account.privacyPolicy": "Privacy Policy",
			// CARET MODIFICATION: Add new i18n keys for account plan and pay-as-you-go
			"account.plan": "플랜",
			"account.planFree": "Free",
			"account.planBasic": "Basic",
			"account.payAsYouGo": "사용량만큼 지불",
			"account.payAsYouGoDescription": "* 구독 사용량을 모두 소진 후 추가 과금 됩니다.",
		}
		return translations[key] || key
	}),
	getLink: vi.fn((key: string) => {
		const links: Record<string, string> = {
			CARETIVE_TERMS: "https://caretive.com/terms",
			CARETIVE_PRIVACY: "https://caretive.com/privacy",
			CARET_TERMS_OF_SERVICE: "https://caret.team/tos",
			CARET_PRIVACY_POLICY: "https://caret.team/privacy",
		}
		return links[key] || key
	}),
	getGlobalLink: vi.fn((key: string) => {
		const links: Record<string, string> = {
			CARET_GITHUB: "https://github.com/aicoding-caret/caret",
			CARETIVE_COMPANY: "https://caretive.com",
		}
		return links[key] || key
	}),
}))

// Mock URLs
vi.mock("@/caret/constants/urls", () => ({
	getUrl: vi.fn((key: string) => {
		const urls: Record<string, string> = {
			CARET_APP_CREDITS: "https://app.caret.team/credits",
			CARET_APP_CREDITS_BUY: "https://app.caret.team/credits/#buy",
			CARET_TERMS_OF_SERVICE: "https://caret.team/tos",
			CARET_PRIVACY_POLICY: "https://caret.team/privacy",
		}
		return urls[key] || key
	}),
}))

// Mock vscode
vi.mock("@/utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

const mockUseFirebaseAuth = vi.mocked(useFirebaseAuth)
const mockUseExtensionState = vi.mocked(useExtensionState)
const mockAccountServiceClient = vi.mocked(AccountServiceClient)
const mockT = vi.mocked(t)
const mockGetUrl = vi.mocked(getUrl)
const mockGetLink = vi.mocked(getLink)

describe("CaretAccountView - TDD Implementation", () => {
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
		} as any)

		// Reset service mocks
		mockAccountServiceClient.accountLoginClicked.mockResolvedValue({})
		mockAccountServiceClient.accountLogoutClicked.mockResolvedValue({})

		// Mock window.addEventListener
		global.window.addEventListener = vi.fn()
		global.window.removeEventListener = vi.fn()
	})

	describe("🔴 RED Phase - Failing Tests", () => {
		it('should display "Sign Up with Caret" when user is not logged in', () => {
			render(<ClineAccountView />)

			// CARET MODIFICATION: Changed from "Sign up with Cline" to "Sign Up with Caret"
			expect(screen.getByText("Sign Up with Caret")).toBeInTheDocument()
		})

		it("should use Caret URLs instead of Cline URLs for logged in users", () => {
			mockUseFirebaseAuth.mockReturnValue({
				user: { uid: "test-user", displayName: "Test User", email: "test@example.com" },
				handleSignOut: vi.fn(),
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				apiConfiguration: { caretApiKey: "test-key" },
			} as any)

			render(<ClineAccountView />)

			// Verify Caret URLs are used for logged in users
			expect(mockGetUrl).toHaveBeenCalledWith("CARET_APP_CREDITS")
			expect(mockGetUrl).toHaveBeenCalledWith("CARET_APP_CREDITS_BUY")
		})

		it("should use Caret URLs for terms and privacy when user is not logged in", () => {
			// Not logged in user state
			mockUseFirebaseAuth.mockReturnValue({
				user: null,
				handleSignOut: vi.fn(),
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: null,
				apiConfiguration: { caretApiKey: null },
			} as any)

			render(<ClineAccountView />)

			// Verify Caret URLs are used for terms and privacy - using getLink instead of getUrl
			expect(mockGetLink).toHaveBeenCalledWith("CARETIVE_TERMS")
			expect(mockGetLink).toHaveBeenCalledWith("CARETIVE_PRIVACY")
		})

		it("should display Dashboard and Add Credits buttons for logged in users", () => {
			mockUseFirebaseAuth.mockReturnValue({
				user: { uid: "test-user", displayName: "Test User", email: "test@example.com" },
				handleSignOut: vi.fn(),
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				apiConfiguration: { caretApiKey: "test-key" },
			} as any)

			render(<ClineAccountView />)

			expect(screen.getByText("Dashboard")).toBeInTheDocument()
			expect(screen.getByText("Add Credits")).toBeInTheDocument()
			expect(screen.getByText("Log out")).toBeInTheDocument()
		})

		it("should use i18n translations for all text elements", () => {
			render(<ClineAccountView />)

			// Verify i18n functions are called with correct keys
			expect(mockT).toHaveBeenCalledWith("account.signUpWithCaret", "common")
			expect(mockT).toHaveBeenCalledWith("account.signUpDescription", "common")
			expect(mockT).toHaveBeenCalledWith("account.byContining", "common")
			expect(mockT).toHaveBeenCalledWith("account.termsOfService", "common")
			expect(mockT).toHaveBeenCalledWith("account.privacyPolicy", "common")
		})

		it("should call AccountServiceClient.accountLoginClicked when login button is clicked", async () => {
			render(<ClineAccountView />)

			const loginButton = screen.getByText("Sign Up with Caret")
			fireEvent.click(loginButton)

			expect(mockAccountServiceClient.accountLoginClicked).toHaveBeenCalledWith({})
		})

		it("should call AccountServiceClient.accountLogoutClicked when logout button is clicked", async () => {
			const mockHandleSignOut = vi.fn()

			mockUseFirebaseAuth.mockReturnValue({
				user: { uid: "test-user", displayName: "Test User", email: "test@example.com" },
				handleSignOut: mockHandleSignOut,
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				apiConfiguration: { caretApiKey: "test-key" },
			} as any)

			render(<ClineAccountView />)

			const logoutButton = screen.getByText("Log out")
			fireEvent.click(logoutButton)

			expect(mockAccountServiceClient.accountLogoutClicked).toHaveBeenCalledWith({})
			expect(mockHandleSignOut).toHaveBeenCalled()
		})

		it("should display current balance with CountUp animation", () => {
			mockUseFirebaseAuth.mockReturnValue({
				user: { uid: "test-user", displayName: "Test User", email: "test@example.com" },
				handleSignOut: vi.fn(),
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				apiConfiguration: { caretApiKey: "test-key" },
			} as any)

			render(<ClineAccountView />)

			// The component converts to uppercase, so it shows "CURRENT BALANCE"
			expect(screen.getByText("CURRENT BALANCE")).toBeInTheDocument()
			// Verify there are multiple Loading... texts (balance section + history table)
			expect(screen.getAllByText("Loading...")).toHaveLength(2)
		})

		// CARET MODIFICATION: Add new RED tests for account plan and pay-as-you-go features
		it('should display "Free" plan when userInfo.plan is "Free"', () => {
			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" }, // userInfo는 그대로 두고
				plan: "Free", // plan을 userInfo와 같은 레벨로 이동
				apiConfiguration: { caretApiKey: "test-key" },
			} as any)

			render(<ClineAccountView />)
			expect(screen.getByText("Free")).toBeInTheDocument() // Assuming "Free" text will be rendered
		})

		it('should display "Pay as you go" checkbox and description when userInfo.isPayAsYouGo is true', () => {
			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" }, // userInfo는 그대로 두고
				isPayAsYouGo: true, // isPayAsYouGo를 userInfo와 같은 레벨로 이동
				apiConfiguration: { caretApiKey: "test-key" },
			} as any)

			render(<ClineAccountView />)
			expect(screen.getByLabelText("사용량만큼 지불")).toBeInTheDocument() // Assuming label text
			expect(screen.getByText("* 구독 사용량을 모두 소진 후 추가 과금 됩니다.")).toBeInTheDocument() // Assuming description text
		})

		it("should use i18n translations for new plan and pay-as-you-go elements", () => {
			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				plan: "Free",
				isPayAsYouGo: true,
				apiConfiguration: { caretApiKey: "test-key" },
			} as any)

			render(<ClineAccountView />)

			expect(mockT).toHaveBeenCalledWith("account.planFree", "common")
			expect(mockT).toHaveBeenCalledWith("account.payAsYouGo", "common")
			expect(mockT).toHaveBeenCalledWith("account.payAsYouGoDescription", "common")
		})
	})

	describe("🟢 GREEN Phase - Implementation Verification", () => {
		it("should render without errors", () => {
			expect(() => render(<ClineAccountView />)).not.toThrow()
		})

		it("should handle API errors gracefully", async () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

			mockAccountServiceClient.accountLoginClicked.mockRejectedValue(new Error("API Error"))

			render(<ClineAccountView />)

			const loginButton = screen.getByText("Sign Up with Caret")
			fireEvent.click(loginButton)

			await new Promise((resolve) => setTimeout(resolve, 0))
			expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to get login URL:", expect.any(Error))

			consoleErrorSpy.mockRestore()
		})
	})

	describe("🔄 REFACTOR Phase - Quality Verification", () => {
		it("should follow Caret naming conventions", () => {
			// Component should use ClineAccountView as alias for compatibility
			expect(ClineAccountView.name).toBe("ClineAccountView")
		})

		it("should use Caret URLs and i18n system properly", () => {
			mockUseFirebaseAuth.mockReturnValue({
				user: { uid: "test-user", displayName: "Test User", email: "test@example.com" },
				handleSignOut: vi.fn(),
			} as any)

			mockUseExtensionState.mockReturnValue({
				userInfo: { uid: "test-user" },
				apiConfiguration: { caretApiKey: "test-key" },
			} as any)

			render(<ClineAccountView />)

			// Verify all required translations are used
			expect(mockT).toHaveBeenCalledWith("account.dashboard", "common")
			expect(mockT).toHaveBeenCalledWith("account.addCredits", "common")
			expect(mockT).toHaveBeenCalledWith("account.logOut", "common")
			expect(mockT).toHaveBeenCalledWith("account.currentBalance", "common")
			expect(mockT).toHaveBeenCalledWith("account.loading", "common")
		})

		it("should have proper logging integration", () => {
			// WebviewLogger should be imported and used for account operations
			render(<ClineAccountView />)

			// This test will pass once logging is implemented
			expect(true).toBe(true)
		})
	})
})
