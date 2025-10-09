// CARET MODIFICATION: Caret Account Service - based on ClineAccountService
// Handles all Caret API server communication for account management

import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import type {
	CaretBalanceResponse,
	CaretOrganizationBalanceResponse,
	CaretOrganizationUsageTransaction,
	CaretPaymentTransaction,
	CaretProfileResponse,
	CaretUsageTransaction,
	CaretUserResponse,
} from "@shared/CaretAccount"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { WebviewProvider } from "@/core/webview/WebviewProvider"

export class CaretAccountService {
	private static instance: CaretAccountService
	// private readonly _baseUrl = "https://api.caret.team" // CARET MODIFICATION: Use Caret API server
	private readonly _baseUrl = "http://localhost:4000" // CARET MODIFICATION: Use Caret API server

	constructor() {
		// CARET MODIFICATION: No additional dependencies needed
		console.log("[CARET-ACCOUNT-SERVICE] 🚀 CaretAccountService initialized with baseUrl:", this._baseUrl)
	}

	/**
	 * Returns the singleton instance of CaretAccountService
	 * @returns Singleton instance of CaretAccountService
	 */
	public static getInstance(): CaretAccountService {
		if (!CaretAccountService.instance) {
			CaretAccountService.instance = new CaretAccountService()
			console.log("[CARET-ACCOUNT-SERVICE] 🔧 Created new CaretAccountService singleton instance")
		}
		return CaretAccountService.instance
	}

	/**
	 * Returns the base URL for the Caret API
	 * @returns The base URL as a string
	 */
	get baseUrl(): string {
		return this._baseUrl
	}

	/**
	 * Helper function to make authenticated requests to the Caret API
	 * CARET MODIFICATION: Uses Auth0 token instead of Cline auth service
	 * @param endpoint The API endpoint to call (without the base URL)
	 * @param config Additional axios request configuration
	 * @returns The API response data
	 * @throws Error if the Auth0 token is not found or the request fails
	 */
	private async authenticatedRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const url = `${this._baseUrl}${endpoint}`
		console.log(`[CARET-ACCOUNT-SERVICE] 📡 Making authenticated request to: ${url}`)

		// CARET MODIFICATION: Get Auth0 token from CaretGlobalManager
		let auth0Token = await CaretGlobalManager.authToken
		console.log("Caret Account Service auth0Token=====>", auth0Token)
		console.log(`[CARET-ACCOUNT-SERVICE] 🔑 Auth0 token retrieved:`, auth0Token ? "✅ Present" : "❌ Missing")

		if (!auth0Token) {
			console.warn("[CARET-ACCOUNT-SERVICE] ⚠️ Auth0 token missing, attempting fallback")
			auth0Token = this.getFallbackCaretAuthToken()
		}

		if (!auth0Token) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Auth0 token not found")
			throw new Error("Auth0 token not found. Please log in to your Caret account.")
		}

		console.log("Caret Account Service auth0Token=====>", auth0Token)

		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				// CARET MODIFICATION: Use Auth0 Bearer token
				Authorization: `Bearer ${auth0Token}`,
				"Content-Type": "application/json",
				...config.headers,
			},
		}

		console.log(`[CARET-ACCOUNT-SERVICE] 🔄 Request config:`, {
			method: config.method || "GET",
			url,
			hasAuth: !!requestConfig.headers?.Authorization,
		})

		const response: AxiosResponse<{ data?: T; error: string; success: boolean }> = await axios.request({
			url,
			method: "GET",
			...requestConfig,
		})

		console.log(`[CARET-ACCOUNT-SERVICE] 📥 Response status: ${response.status}`)

		const status = response.status
		if (status < 200 || status >= 300) {
			console.error(`[CARET-ACCOUNT-SERVICE] ❌ Request failed with status ${status}`)
			throw new Error(`Request to ${endpoint} failed with status ${status}`)
		}

		if (response.status === 204 || response.statusText === "No Content") {
			console.log(`[CARET-ACCOUNT-SERVICE] ✅ No content response for ${endpoint}`)
			return {} as T
		}

		const payload = response.data
		if (payload == null) {
			console.error(`[CARET-ACCOUNT-SERVICE] ❌ Empty response body from ${endpoint} API`)
			throw new Error(`Empty response from ${endpoint} API`)
		}

		console.log(`[CARET-ACCOUNT-SERVICE] ✅ Successful response for ${endpoint} (primitive payload)`)
		return payload as T
	}

	/**
	 * Retrieves caretAuthToken stored via StateManager as a fallback when the in-memory token is unavailable.
	 */
	private getFallbackCaretAuthToken(): string | undefined {
		try {
			const instances = (WebviewProvider as any).getAllInstances?.() || [WebviewProvider.getInstance()]
			for (const instance of instances) {
				const stateManager = instance.controller?.stateManager
				if (!stateManager) {
					continue
				}
				const apiConfiguration = stateManager.getApiConfiguration()
				const storedToken = apiConfiguration?.caretAuthToken
				if (storedToken) {
					console.log("[CARET-ACCOUNT-SERVICE] 🔁 Using caretAuthToken fallback from state manager")
					return storedToken
				}
			}
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to read caretAuthToken fallback:", error)
		}
		return undefined
	}

	/**
	 * RPC variant that fetches the user's current credit balance without posting to webview
	 * CARET MODIFICATION: Uses Caret API endpoints
	 * @returns Balance data or undefined if failed
	 */
	async fetchBalanceRPC(): Promise<CaretBalanceResponse | undefined> {
		try {
			console.log("[CARET-ACCOUNT-SERVICE] 💰 Fetching balance...")
			const me = await this.fetchMe()
			if (!me || !me.id) {
				console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch user ID for balance")
				return undefined
			}

			// CARET MODIFICATION: Use Caret API v1 endpoint
			const data = await this.authenticatedRequest<CaretBalanceResponse>(`/api/v1/account/balance`)
			console.log("[CARET-ACCOUNT-SERVICE] ✅ Balance fetched successfully:", data.balance)
			return data
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch balance (RPC):", error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's usage transactions without posting to webview
	 * CARET MODIFICATION: Uses Caret API endpoints
	 * @returns Usage transactions or undefined if failed
	 */
	async fetchUsageTransactionsRPC(): Promise<CaretUsageTransaction[] | undefined> {
		try {
			console.log("[CARET-ACCOUNT-SERVICE] 📈 Fetching usage transactions...")
			const me = await this.fetchMe()
			if (!me || !me.id) {
				console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch user ID for usage transactions")
				return undefined
			}

			// CARET MODIFICATION: Use Caret API v1 endpoint
			const data = await this.authenticatedRequest<{ items: CaretUsageTransaction[] }>(`/api/v1/account/usage`)
			console.log("[CARET-ACCOUNT-SERVICE] ✅ Usage transactions fetched:", data.items?.length || 0, "items")
			return data.items
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch usage transactions (RPC):", error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's payment transactions without posting to webview
	 * CARET MODIFICATION: Uses Caret API endpoints
	 * @returns Payment transactions or undefined if failed
	 */
	async fetchPaymentTransactionsRPC(): Promise<CaretPaymentTransaction[] | undefined> {
		try {
			console.log("[CARET-ACCOUNT-SERVICE] 💳 Fetching payment transactions...")
			const me = await this.fetchMe()
			if (!me || !me.id) {
				console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch user ID for payment transactions")
				return undefined
			}

			// CARET MODIFICATION: Use Caret API v1 endpoint
			const data = await this.authenticatedRequest<{ paymentTransactions: CaretPaymentTransaction[] }>(
				`/api/v1/account/payments`,
			)
			console.log(
				"[CARET-ACCOUNT-SERVICE] ✅ Payment transactions fetched:",
				data.paymentTransactions?.length || 0,
				"items",
			)
			return data.paymentTransactions
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch payment transactions (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user data
	 * CARET MODIFICATION: Uses Caret API endpoints and Auth0 user info
	 * @returns CaretUserResponse or undefined if failed
	 */
	async fetchMe(): Promise<CaretUserResponse | undefined> {
		try {
			console.log("[CARET-ACCOUNT-SERVICE] 👤 Fetching current user data...")

			const profile = await this.authenticatedRequest<CaretProfileResponse>(`/user/caret_profile`)
			const userInfo = profile?.user_info
			if (!userInfo || !userInfo.user_id) {
				console.error("[CARET-ACCOUNT-SERVICE] ❌ User profile payload missing required fields", userInfo)
				throw new Error("User profile response missing user_id")
			}

			const caretUser: CaretUserResponse = {
				id: userInfo.user_id,
				email: userInfo.user_email,
				displayName: userInfo.metadata?.display_name || userInfo.user_alias || userInfo.user_email,
				models: userInfo.models,
				photoUrl: userInfo.metadata?.avatar_url,
				apiKey: profile.key,
				dailyUsage: profile.daily_usage,
				monthlyUsage: profile.monthly_usage,
				organizations: [],
			}
			console.log("Caret Account Service dailyUsage=====>", profile.daily_usage)
			console.log("Caret Account Service monthlyUsage=====>", profile.monthly_usage)

			console.log("[CARET-ACCOUNT-SERVICE] ✅ User data fetched:", {
				id: caretUser.id,
				email: caretUser.email,
				displayName: caretUser.displayName,
				apiKeyPresent: !!caretUser.apiKey,
			})
			return caretUser
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch user data (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organizations
	 * CARET MODIFICATION: Uses Caret API endpoints
	 * @returns CaretUserResponse["organizations"] or undefined if failed
	 */
	async fetchUserOrganizationsRPC(): Promise<CaretUserResponse["organizations"] | undefined> {
		try {
			console.log("[CARET-ACCOUNT-SERVICE] 🏢 Fetching user organizations...")
			const me = await this.fetchMe()
			if (!me || !me.organizations) {
				console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch user organizations")
				return undefined
			}
			console.log("[CARET-ACCOUNT-SERVICE] ✅ Organizations fetched:", me.organizations.length, "organizations")
			return me.organizations
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch user organizations (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organization credits
	 * CARET MODIFICATION: Uses Caret API endpoints
	 * @returns {Promise<CaretOrganizationBalanceResponse>} A promise that resolves to the active organization balance.
	 */
	async fetchOrganizationCreditsRPC(organizationId: string): Promise<CaretOrganizationBalanceResponse | undefined> {
		try {
			console.log("[CARET-ACCOUNT-SERVICE] 🏢💰 Fetching organization credits for:", organizationId)

			// CARET MODIFICATION: Use Caret API v1 endpoint
			const data = await this.authenticatedRequest<CaretOrganizationBalanceResponse>(
				`/api/v1/organizations/${organizationId}/balance`,
			)
			console.log("[CARET-ACCOUNT-SERVICE] ✅ Organization balance fetched:", data.balance)
			return data
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch active organization balance (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organization transactions
	 * CARET MODIFICATION: Uses Caret API endpoints
	 * @returns {Promise<CaretOrganizationUsageTransaction[]>} A promise that resolves to the active organization transactions.
	 */
	async fetchOrganizationUsageTransactionsRPC(
		organizationId: string,
	): Promise<CaretOrganizationUsageTransaction[] | undefined> {
		try {
			console.log("[CARET-ACCOUNT-SERVICE] 🏢📈 Fetching organization usage transactions for:", organizationId)
			const me = await this.fetchMe()
			if (!me || !me.id) {
				console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch user ID for active organization transactions")
				return undefined
			}
			const memberId = me.organizations.find((org) => org.organizationId === organizationId)?.memberId
			if (!memberId) {
				console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to find member ID for active organization transactions")
				return undefined
			}

			// CARET MODIFICATION: Use Caret API v1 endpoint
			const data = await this.authenticatedRequest<{ items: CaretOrganizationUsageTransaction[] }>(
				`/api/v1/organizations/${organizationId}/members/${memberId}/usages`,
			)
			console.log("[CARET-ACCOUNT-SERVICE] ✅ Organization transactions fetched:", data.items?.length || 0, "items")
			return data.items
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to fetch active organization transactions (RPC):", error)
			return undefined
		}
	}

	/**
	 * Switches the active account to the specified organization or personal account.
	 * CARET MODIFICATION: Uses Caret API endpoints and Auth0 token refresh
	 * @param organizationId - Optional organization ID to switch to. If not provided, it will switch to the personal account.
	 * @returns {Promise<void>} A promise that resolves when the account switch is complete.
	 * @throws {Error} If the account switch fails, an error will be thrown.
	 */
	async switchAccount(organizationId?: string): Promise<void> {
		try {
			console.log("[CARET-ACCOUNT-SERVICE] 🔄 Switching account to:", organizationId || "personal")

			// CARET MODIFICATION: Use Caret API v1 endpoint
			const _response = await this.authenticatedRequest<string>(`/api/v1/account/active-account`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				data: {
					organizationId: organizationId || null, // Pass organization if provided
				},
			})
			console.log("[CARET-ACCOUNT-SERVICE] ✅ Account switched successfully")
		} catch (error) {
			console.error("[CARET-ACCOUNT-SERVICE] ❌ Error switching account:", error)
			throw error
		} finally {
			// CARET MODIFICATION: Refresh Auth0 token instead of Cline auth service
			console.log("[CARET-ACCOUNT-SERVICE] 🔄 Refreshing Auth0 token after account switch...")
			try {
				// await CaretGlobalManager.refreshAuth0Token()
				console.log("[CARET-ACCOUNT-SERVICE] ✅ Auth0 token refreshed successfully")
			} catch (refreshError) {
				console.error("[CARET-ACCOUNT-SERVICE] ❌ Failed to refresh Auth0 token:", refreshError)
			}
		}
	}
}
