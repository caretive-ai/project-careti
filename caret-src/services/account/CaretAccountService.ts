import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import type { BalanceResponse, PaymentTransaction, UsageTransaction } from "../../shared/CaretAccount"
import { ExtensionMessage } from "@shared/ExtensionMessage"

export class CaretAccountService {
	// CARET MODIFICATION: Change base URL to Caret development API
	private readonly baseUrl = `${process.env.AUTH0_AUDIENCE}/api/auth`
	private postMessageToWebview: (message: ExtensionMessage) => Promise<void>
	private getCaretApiKey: () => Promise<string | undefined>

	constructor(
		postMessageToWebview: (message: ExtensionMessage) => Promise<void>,
		getCaretApiKey: () => Promise<string | undefined>,
	) {
		this.postMessageToWebview = postMessageToWebview
		this.getCaretApiKey = getCaretApiKey
	}

	/**
	 * Helper function to make authenticated requests to the Cline API
	 * @param endpoint The API endpoint to call (without the base URL)
	 * @param config Additional axios request configuration
	 * @returns The API response data
	 * @throws Error if the API key is not found or the request fails
	 */
	private async authenticatedRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const caretApiKey = await this.getCaretApiKey()

		if (!caretApiKey) {
			throw new Error("Cline API key not found")
		}

		const url = `${this.baseUrl}${endpoint}`
		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				Authorization: `Bearer ${caretApiKey}`,
				"Content-Type": "application/json",
				...config.headers,
			},
		}

		const response: AxiosResponse<T> = await axios.get(url, requestConfig)

		if (!response.data) {
			throw new Error(`Invalid response from ${endpoint} API`)
		}

		return response.data
	}

	/**
	 * Fetches the user's current credit balance
	 */
	async fetchBalance(): Promise<BalanceResponse | undefined> {
		try {
			const data = await this.authenticatedRequest<BalanceResponse>("/user/credits/balance")

			// Post to webview
			await this.postMessageToWebview({
				type: "userCreditsBalance",
				userCreditsBalance: data,
			})

			return data
		} catch (error) {
			console.error("Failed to fetch balance:", error)
			return undefined
		}
	}

	/**
	 * Fetches the user's usage transactions
	 */
	async fetchUsageTransactions(): Promise<UsageTransaction[] | undefined> {
		try {
			const data = await this.authenticatedRequest<UsageTransaction[]>("/user/credits/usage")

			// Post to webview
			await this.postMessageToWebview({
				type: "userCreditsUsage",
				userCreditsUsage: data,
			})

			return data
		} catch (error) {
			console.error("Failed to fetch usage transactions:", error)
			return undefined
		}
	}

	/**
	 * Fetches the user's payment transactions
	 */
	async fetchPaymentTransactions(): Promise<PaymentTransaction[] | undefined> {
		try {
			const data = await this.authenticatedRequest<PaymentTransaction[]>("/user/credits/payments")

			// Post to webview
			await this.postMessageToWebview({
				type: "userCreditsPayments",
				userCreditsPayments: data,
			})

			return data
		} catch (error) {
			console.error("Failed to fetch payment transactions:", error)
			return undefined
		}
	}

	/**
	 * Fetches the user's account plan and pay-as-you-go status.
	 * CARET MODIFICATION: This is a mock implementation. Replace with actual API call when available.
	 */
	async fetchAccountPlan(): Promise<{ plan: string; isPayAsYouGo: boolean } | undefined> {
		try {
			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 500))

			const mockPlanData = {
				plan: "Free", // Or "Basic"
				isPayAsYouGo: false,
			}

			return mockPlanData
		} catch (error) {
			console.error("Failed to fetch account plan:", error)
			return undefined
		}
	}
}
