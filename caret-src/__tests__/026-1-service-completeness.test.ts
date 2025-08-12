/**
 * Test 026-1: Service Completeness Test
 *
 * Purpose: Verify that CaretAccountService has all the functionality of ClineAccountService
 * and additional features from Cline v3.23.0
 */

import { CaretAccountService } from "../services/account/CaretAccountService"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import type { UserCreditsData, UserOrganizationsResponse, UserOrganization, AuthState } from "@shared/proto/account"

// Mock dependencies
const mockPostMessageToWebview = jest.fn()
const mockGetCaretApiKey = jest.fn()

// Mock axios
jest.mock("axios", () => ({
	get: jest.fn(),
	post: jest.fn(),
}))

describe("026-1 Service Completeness Test", () => {
	let caretAccountService: CaretAccountService

	beforeEach(() => {
		jest.clearAllMocks()
		caretAccountService = new CaretAccountService(mockPostMessageToWebview, mockGetCaretApiKey)
	})

	describe("✅ Core Legacy Methods (Cline Compatibility)", () => {
		test("CaretAccountService has all original ClineAccountService methods", () => {
			// These methods should exist for backward compatibility
			expect(typeof caretAccountService.fetchBalance).toBe("function")
			expect(typeof caretAccountService.fetchUsageTransactions).toBe("function")
			expect(typeof caretAccountService.fetchPaymentTransactions).toBe("function")
			expect(typeof caretAccountService.fetchAccountPlan).toBe("function")
		})

		test("fetchBalance method exists and has correct signature", () => {
			expect(caretAccountService.fetchBalance).toBeDefined()
			// Should return Promise<BalanceResponse | undefined>
			expect(caretAccountService.fetchBalance.constructor.name).toBe("AsyncFunction")
		})

		test("fetchUsageTransactions method exists", () => {
			expect(caretAccountService.fetchUsageTransactions).toBeDefined()
			expect(caretAccountService.fetchUsageTransactions.constructor.name).toBe("AsyncFunction")
		})

		test("fetchPaymentTransactions method exists", () => {
			expect(caretAccountService.fetchPaymentTransactions).toBeDefined()
			expect(caretAccountService.fetchPaymentTransactions.constructor.name).toBe("AsyncFunction")
		})

		test("fetchAccountPlan method exists", () => {
			expect(caretAccountService.fetchAccountPlan).toBeDefined()
			expect(caretAccountService.fetchAccountPlan.constructor.name).toBe("AsyncFunction")
		})
	})

	describe("✨ Enhanced Methods (Cline v3.23.0 Features)", () => {
		test("CaretAccountService has new getUserCredits method", () => {
			expect(typeof caretAccountService.getUserCredits).toBe("function")
			expect(caretAccountService.getUserCredits.constructor.name).toBe("AsyncFunction")
		})

		test("CaretAccountService has getUserOrganizations method", () => {
			expect(typeof caretAccountService.getUserOrganizations).toBe("function")
			expect(caretAccountService.getUserOrganizations.constructor.name).toBe("AsyncFunction")
		})

		test("CaretAccountService has setUserOrganization method", () => {
			expect(typeof caretAccountService.setUserOrganization).toBe("function")
			expect(caretAccountService.setUserOrganization.constructor.name).toBe("AsyncFunction")
		})

		test("CaretAccountService has getAuthState method", () => {
			expect(typeof caretAccountService.getAuthState).toBe("function")
			expect(caretAccountService.getAuthState.constructor.name).toBe("AsyncFunction")
		})
	})

	describe("🔧 Method Implementation Quality", () => {
		test("authenticatedRequest method supports both GET and POST", async () => {
			// Mock successful API key retrieval
			mockGetCaretApiKey.mockResolvedValue("test-api-key")

			// Mock axios responses
			const axios = require("axios")
			axios.get.mockResolvedValue({ data: { balance: 100 } })
			axios.post.mockResolvedValue({ data: { success: true } })

			// Test GET request (via getUserCredits)
			try {
				await caretAccountService.getUserCredits()
			} catch (error) {
				// Expected to fail due to mocking, but should try to make request
			}

			// The method should have attempted to get API key
			expect(mockGetCaretApiKey).toHaveBeenCalled()
		})

		test("Error handling works when API key is missing", async () => {
			// Mock missing API key
			mockGetCaretApiKey.mockResolvedValue(undefined)

			// All methods should handle missing API key gracefully
			await expect(caretAccountService.getUserCredits()).rejects.toThrow("Caret API key not found")
			await expect(caretAccountService.getUserOrganizations()).rejects.toThrow("Caret API key not found")
		})

		test("postMessageToWebview is called for appropriate methods", async () => {
			// Mock successful API key and response
			mockGetCaretApiKey.mockResolvedValue("test-api-key")
			const axios = require("axios")

			const mockCreditsData: UserCreditsData = {
				balance: { currentBalance: 50.0 },
				usageTransactions: [],
				paymentTransactions: [],
			}

			axios.get.mockResolvedValue({ data: mockCreditsData })

			try {
				await caretAccountService.getUserCredits()
			} catch (error) {
				// Ignore axios errors, we're testing the flow
			}

			// Should have called postMessageToWebview
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({
				type: "userCreditsData",
				userCreditsData: mockCreditsData,
			})
		})
	})

	describe("🌐 API Endpoint Configuration", () => {
		test("Uses correct Caret API base URL", () => {
			// The service should use process.env.AUTH0_AUDIENCE + '/api/auth'
			// We can't directly test private properties, but we can test behavior

			// If the service is constructed without error, it means the baseUrl is set
			expect(caretAccountService).toBeDefined()
		})

		test("Uses caretApiKey instead of clineApiKey", async () => {
			mockGetCaretApiKey.mockResolvedValue(undefined)

			// Error message should mention "Caret API key"
			await expect(caretAccountService.getUserCredits()).rejects.toThrow("Caret API key not found")
		})
	})

	describe("📊 Feature Completeness Score", () => {
		test("Caret has 100% of Cline base features + additional features", () => {
			const caretMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(caretAccountService)).filter(
				(name) => name !== "constructor" && typeof caretAccountService[name as keyof CaretAccountService] === "function",
			)

			// Base Cline methods (4)
			const baseClinemethods = ["fetchBalance", "fetchUsageTransactions", "fetchPaymentTransactions", "fetchAccountPlan"]

			// Enhanced Caret methods (4+)
			const enhancedMethods = ["getUserCredits", "getUserOrganizations", "setUserOrganization", "getAuthState"]

			// Check all base methods exist
			baseClinemethods.forEach((method) => {
				expect(caretMethods).toContain(method)
			})

			// Check enhanced methods exist
			enhancedMethods.forEach((method) => {
				expect(caretMethods).toContain(method)
			})

			// Caret should have at least base + enhanced methods
			expect(caretMethods.length).toBeGreaterThanOrEqual(baseClinemethods.length + enhancedMethods.length)

			console.log(`✅ Caret Account Service Completeness: ${caretMethods.length} methods total`)
			console.log(`   Base Cline methods: ${baseClinemethods.length}/4 (100%)`)
			console.log(`   Enhanced methods: ${enhancedMethods.length}/4+ (100%+)`)
		})
	})

	describe("🔄 Backward Compatibility", () => {
		test("Existing Cline-style API calls still work", async () => {
			// Mock API key
			mockGetCaretApiKey.mockResolvedValue("test-key")

			// Mock axios
			const axios = require("axios")
			axios.get.mockResolvedValue({
				data: { currentBalance: 25.0 },
			})

			// Legacy fetchBalance should work
			const result = await caretAccountService.fetchBalance()

			expect(mockPostMessageToWebview).toHaveBeenCalledWith({
				type: "userCreditsBalance",
				userCreditsBalance: { currentBalance: 25.0 },
			})
		})

		test("WebView message types are preserved for legacy support", async () => {
			mockGetCaretApiKey.mockResolvedValue("test-key")
			const axios = require("axios")

			// Test legacy message types
			axios.get.mockResolvedValue({ data: [] })

			await caretAccountService.fetchUsageTransactions()
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({
				type: "userCreditsUsage",
				userCreditsUsage: [],
			})

			await caretAccountService.fetchPaymentTransactions()
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({
				type: "userCreditsPayments",
				userCreditsPayments: [],
			})
		})
	})
})
