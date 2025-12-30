import { CaretEnv } from "@caret/config"
import { CaretAuthService } from "@caret/services/auth/CaretAuthService"
import { CARET_API_ENDPOINT } from "@caret/shared/caret/api"
import type {
	BalanceResponse,
	OrganizationBalanceResponse,
	OrganizationUsageTransaction,
	PaymentTransaction,
	UsageTransaction,
	UserResponse,
} from "@shared/ClineAccount"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { Logger } from "@/services/logging/Logger"
import { getAxiosSettings } from "@/shared/net"

export class CaretAccountService {
	private static instance: CaretAccountService
	private _authService: CaretAuthService

	constructor() {
		this._authService = CaretAuthService.getInstance()
	}

	/**
	 * Returns the singleton instance of ClineAccountService
	 * @returns Singleton instance of ClineAccountService
	 */
	public static getInstance(): CaretAccountService {
		if (!CaretAccountService.instance) {
			CaretAccountService.instance = new CaretAccountService()
		}
		return CaretAccountService.instance
	}

	/**
	 * Returns the base URL for the Cline API
	 * @returns The base URL as a string
	 */
	get baseUrl(): string {
		return CaretEnv.config().apiBaseUrl
	}

	/**
	 * Helper function to make authenticated requests to the Cline API
	 * @param endpoint The API endpoint to call (without the base URL)
	 * @param config Additional axios request configuration
	 * @returns The API response data
	 * @throws Error if the API key is not found or the request fails
	 */
	private async authenticatedRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const url = new URL(endpoint, this.baseUrl).toString() // Validate URL
		const caretAccountAuthToken = await this._authService.getAuthToken()

		if (!caretAccountAuthToken) {
			throw new Error("No Caret account auth token found")
		}
		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				"X-AnyLLM-Key": `Bearer ${caretAccountAuthToken}`,
				"Content-Type": "application/json",
				...config.headers,
			},
			...getAxiosSettings(),
		}
		const response: AxiosResponse<{ data?: T; error: string; success: boolean }> = await axios.request({
			url,
			method: "GET",
			...requestConfig,
		})
		const status = response.status
		if (status < 200 || status >= 300) {
			throw new Error(`Request to ${endpoint} failed with status ${status}`)
		}
		if (response.statusText !== "No Content" && (!response.data || !response.data.data)) {
			throw new Error(`Invalid response from ${endpoint} API`)
		}
		if (typeof response.data === "object" && !response.data.success) {
			throw new Error(`API error: ${response.data.error}`)
		}
		if (response.statusText === "No Content") {
			return {} as T // Return empty object if no content
		} else {
			return response.data.data as T
		}
	}

	/**
	 * RPC variant that fetches the user's current credit balance without posting to webview
	 * @returns Balance data or undefined if failed
	 */
	async fetchBalanceRPC(): Promise<BalanceResponse | undefined> {
		try {
			const me = await this.fetchMe()
			if (!me || !me.id) {
				Logger.error("Failed to fetch user ID for usage transactions")
				return undefined
			}
			const data = await this.authenticatedRequest<BalanceResponse>(CARET_API_ENDPOINT.BALANCE)
			return data
		} catch (error) {
			Logger.error("Failed to fetch balance (RPC):", error as Error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's usage transactions without posting to webview
	 * @returns Usage transactions or undefined if failed
	 */
	async fetchUsageTransactionsRPC(): Promise<UsageTransaction[] | undefined> {
		try {
			const me = await this.fetchMe()
			if (!me || !me.id) {
				Logger.error("Failed to fetch user ID for usage transactions")
				return undefined
			}
			const data = await this.authenticatedRequest<{ items: UsageTransaction[] }>(CARET_API_ENDPOINT.LOGS)
			return data.items
		} catch (error) {
			Logger.error("Failed to fetch usage transactions (RPC):", error as Error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's payment transactions without posting to webview
	 * @returns Payment transactions or undefined if failed
	 */
	async fetchPaymentTransactionsRPC(): Promise<PaymentTransaction[] | undefined> {
		try {
			const me = await this.fetchMe()
			if (!me || !me.id) {
				Logger.error("Failed to fetch user ID for usage transactions")
				return undefined
			}
			const data = await this.authenticatedRequest<{ paymentTransactions: PaymentTransaction[] }>(
				CARET_API_ENDPOINT.PAYMENTS,
			)
			return data.paymentTransactions
		} catch (error) {
			Logger.error("Failed to fetch payment transactions (RPC):", error as Error)
			return undefined
		}
	}

	/**
	 * Fetches the current user data
	 * @returns UserResponse or undefined if failed
	 */
	async fetchMe(): Promise<UserResponse | undefined> {
		try {
			const data = await this.authenticatedRequest<UserResponse>(CARET_API_ENDPOINT.USER_INFO)
			return data
		} catch (error) {
			Logger.error("Failed to fetch user data (RPC):", error as Error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organizations
	 * @returns UserResponse["organizations"] or undefined if failed
	 */
	async fetchUserOrganizationsRPC(): Promise<UserResponse["organizations"] | undefined> {
		try {
			const me = await this.fetchMe()
			if (!me || !me.organizations) {
				Logger.error("Failed to fetch user organizations")
				return undefined
			}
			return me.organizations
		} catch (error) {
			Logger.error("Failed to fetch user organizations (RPC):", error as Error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organization credits
	 * @returns {Promise<OrganizationBalanceResponse>} A promise that resolves to the active organization balance.
	 */
	async fetchOrganizationCreditsRPC(organizationId: string): Promise<OrganizationBalanceResponse | undefined> {
		try {
			const data = await this.authenticatedRequest<OrganizationBalanceResponse>(
				`/api/v1/organizations/${organizationId}/balance`,
			)
			return data
		} catch (error) {
			Logger.error("Failed to fetch active organization balance (RPC):", error as Error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organization transactions
	 * @returns {Promise<OrganizationUsageTransaction[]>} A promise that resolves to the active organization transactions.
	 */
	async fetchOrganizationUsageTransactionsRPC(organizationId: string): Promise<OrganizationUsageTransaction[] | undefined> {
		try {
			const me = await this.fetchMe()
			if (!me || !me.id) {
				Logger.error("Failed to fetch user ID for active organization transactions")
				return undefined
			}
			const memberId = me.organizations.find((org) => org.organizationId === organizationId)?.memberId
			if (!memberId) {
				Logger.error("Failed to find member ID for active organization transactions")
				return undefined
			}
			const data = await this.authenticatedRequest<{ items: OrganizationUsageTransaction[] }>(
				`/api/v1/organizations/${organizationId}/members/${memberId}/usages`,
			)
			return data.items
		} catch (error) {
			Logger.error("Failed to fetch active organization transactions (RPC):", error as Error)
			return undefined
		}
	}

	/**
	 * Transcribes audio using the Cline transcription service
	 * @param audioBase64 - Base64 encoded audio data
	 * @param language - Optional language hint for transcription
	 * @returns Promise with transcribed text or error
	 */
	async transcribeAudio(audioBase64: string, language = "en"): Promise<{ text: string }> {
		const response = await this.authenticatedRequest<{ text: string }>(`/api/v1/chat/transcriptions`, {
			method: "POST",
			data: {
				audioData: audioBase64,
				language: language,
			},
		})

		return response
	}
}
