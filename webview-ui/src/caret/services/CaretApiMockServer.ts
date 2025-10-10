// CARET MODIFICATION: Mock CaretAPI Server for testing and development
// Simulates real Caret API responses with realistic data

export interface CaretApiBalance {
	currentBalance: number
	currency: string
	lastUpdated: string
}

export interface CaretApiUsage {
	id: string
	timestamp: string
	model: string
	promptTokens: number
	completionTokens: number
	cachedTokens: number
	totalCost: number
	taskId?: string
}

export interface CaretApiUser {
	id: string
	email: string
	displayName: string
	photoUrl?: string
	plan: "free" | "pro" | "enterprise"
	createdAt: string
}

export interface CaretApiGeneration {
	id: string
	native_tokens_prompt: number
	native_tokens_completion: number
	native_tokens_cached: number
	total_cost: number
	model: string
	timestamp: string
	status: "completed" | "failed" | "processing"
}

/**
 * Mock Caret API Server - simulates real API behavior
 * Provides realistic responses with proper delays and logging
 */
export class CaretApiMockServer {
	private static instance: CaretApiMockServer | null = null
	private baseDelay = 200 // Base API delay in ms
	private mockUser: CaretApiUser
	private mockBalance: CaretApiBalance
	private mockUsageHistory: CaretApiUsage[]
	private mockGenerations: Map<string, CaretApiGeneration>

	private constructor() {
		// Initialize mock data
		this.mockUser = {
			id: "caret-user-mock-123",
			email: "test@caret.team",
			displayName: "Caret Test User",
			photoUrl: "https://avatars.githubusercontent.com/u/mock?v=4",
			plan: "pro",
			createdAt: "2024-01-01T00:00:00Z",
		}

		this.mockBalance = {
			currentBalance: 125.5,
			currency: "USD",
			lastUpdated: new Date().toISOString(),
		}

		this.mockUsageHistory = [
			{
				id: "usage-1",
				timestamp: new Date(Date.now() - 3600000).toISOString(),
				model: "google/gemini-2.5-flash",
				promptTokens: 150,
				completionTokens: 75,
				cachedTokens: 20,
				totalCost: 0.00123,
				taskId: "task-abc-123",
			},
			{
				id: "usage-2",
				timestamp: new Date(Date.now() - 7200000).toISOString(),
				model: "anthropic/claude-3.5-sonnet",
				promptTokens: 300,
				completionTokens: 150,
				cachedTokens: 50,
				totalCost: 0.00456,
				taskId: "task-def-456",
			},
			{
				id: "usage-3",
				timestamp: new Date(Date.now() - 10800000).toISOString(),
				model: "google/gemini-2.5-pro",
				promptTokens: 500,
				completionTokens: 250,
				cachedTokens: 0,
				totalCost: 0.00789,
			},
		]

		this.mockGenerations = new Map()
		this.mockGenerations.set("gen-123", {
			id: "gen-123",
			native_tokens_prompt: 200,
			native_tokens_completion: 100,
			native_tokens_cached: 30,
			total_cost: 0.00234,
			model: "google/gemini-2.5-flash",
			timestamp: new Date().toISOString(),
			status: "completed",
		})

		console.log("[CARET-API-MOCK] Server initialized with mock data")
		console.log("[CARET-API-MOCK] User:", this.mockUser.email)
		console.log("[CARET-API-MOCK] Balance: $" + this.mockBalance.currentBalance)
		console.log("[CARET-API-MOCK] Usage history entries:", this.mockUsageHistory.length)
	}

	public static getInstance(): CaretApiMockServer {
		if (!CaretApiMockServer.instance) {
			CaretApiMockServer.instance = new CaretApiMockServer()
		}
		return CaretApiMockServer.instance
	}

	/**
	 * Mock: GET /api/v1/account/balance
	 */
	public async getBalance(): Promise<CaretApiBalance> {
		console.log("[CARET-API-MOCK] GET /api/v1/account/balance")
		await this.delay()

		// Update lastUpdated to current time
		this.mockBalance.lastUpdated = new Date().toISOString()

		console.log("[CARET-API-MOCK] Balance response:", this.mockBalance)
		return { ...this.mockBalance }
	}

	/**
	 * Mock: GET /api/v1/account/usage
	 */
	public async getUsageHistory(limit = 10): Promise<CaretApiUsage[]> {
		console.log(`[CARET-API-MOCK] GET /api/v1/account/usage?limit=${limit}`)
		await this.delay()

		const response = this.mockUsageHistory.slice(0, limit)
		console.log("[CARET-API-MOCK] Usage history response:", response.length, "entries")
		return response
	}

	/**
	 * Mock: GET /generation?id={generationId}
	 */
	public async getGeneration(generationId: string): Promise<CaretApiGeneration | null> {
		console.log(`[CARET-API-MOCK] GET /generation?id=${generationId}`)
		await this.delay()

		const generation = this.mockGenerations.get(generationId)
		if (generation) {
			console.log("[CARET-API-MOCK] Generation found:", generation)
			return { ...generation }
		} else {
			console.log("[CARET-API-MOCK] Generation not found:", generationId)
			return null
		}
	}

	/**
	 * Mock: GET /api/v1/account/profile
	 */
	public async getUserProfile(): Promise<CaretApiUser> {
		console.log("[CARET-API-MOCK] GET /api/v1/account/profile")
		await this.delay()

		console.log("[CARET-API-MOCK] User profile response:", this.mockUser)
		return { ...this.mockUser }
	}

	/**
	 * Mock: POST /api/v1/chat/completions (OpenAI compatible)
	 * This would be called by CaretApiProvider, but we're just logging here
	 */
	public async simulateChatCompletion(messages: any[], model: string): Promise<string> {
		console.log(`[CARET-API-MOCK] POST /api/v1/chat/completions`)
		console.log(`[CARET-API-MOCK] Model: ${model}`)
		console.log(`[CARET-API-MOCK] Messages: ${messages.length}`)
		await this.delay(1000) // Longer delay for chat completion

		// Generate a mock generation ID for tracking
		const generationId = "gen-" + Date.now()
		const mockGeneration: CaretApiGeneration = {
			id: generationId,
			native_tokens_prompt: Math.floor(Math.random() * 300) + 100,
			native_tokens_completion: Math.floor(Math.random() * 200) + 50,
			native_tokens_cached: Math.floor(Math.random() * 50),
			total_cost: Math.random() * 0.01,
			model,
			timestamp: new Date().toISOString(),
			status: "completed",
		}

		// Store for later retrieval
		this.mockGenerations.set(generationId, mockGeneration)

		console.log(`[CARET-API-MOCK] Generated completion with ID: ${generationId}`)
		return generationId
	}

	/**
	 * Simulate network delay
	 */
	private async delay(ms?: number): Promise<void> {
		const delayMs = ms || this.baseDelay + Math.random() * 300
		return new Promise((resolve) => setTimeout(resolve, delayMs))
	}

	/**
	 * Simulate API errors (for testing error handling)
	 */
	public simulateError(errorType: "network" | "auth" | "rate_limit" | "server"): never {
		const errors = {
			network: new Error("Network error: Unable to reach Caret API"),
			auth: new Error("Authentication error: Invalid API key"),
			rate_limit: new Error("Rate limit exceeded: Too many requests"),
			server: new Error("Server error: Internal server error"),
		}

		console.error(`[CARET-API-MOCK] Simulating ${errorType} error`)
		throw errors[errorType]
	}

	/**
	 * Update mock balance (for testing balance changes)
	 */
	public updateBalance(newBalance: number): void {
		console.log(`[CARET-API-MOCK] Updating balance: $${this.mockBalance.currentBalance} -> $${newBalance}`)
		this.mockBalance.currentBalance = newBalance
		this.mockBalance.lastUpdated = new Date().toISOString()
	}

	/**
	 * Add mock usage entry (for testing usage tracking)
	 */
	public addUsageEntry(usage: Partial<CaretApiUsage>): void {
		const newUsage: CaretApiUsage = {
			id: "usage-" + Date.now(),
			timestamp: new Date().toISOString(),
			model: usage.model || "google/gemini-2.5-flash",
			promptTokens: usage.promptTokens || 100,
			completionTokens: usage.completionTokens || 50,
			cachedTokens: usage.cachedTokens || 0,
			totalCost: usage.totalCost || 0.001,
			...usage,
		}

		this.mockUsageHistory.unshift(newUsage) // Add to beginning
		console.log("[CARET-API-MOCK] Added usage entry:", newUsage.id)

		// Update balance (subtract cost)
		this.updateBalance(this.mockBalance.currentBalance - newUsage.totalCost)
	}

	/**
	 * Reset mock data (for testing)
	 */
	public reset(): void {
		console.log("[CARET-API-MOCK] Resetting mock data")
		this.mockBalance.currentBalance = 125.5
		this.mockUsageHistory = []
		this.mockGenerations.clear()
	}
}

export default CaretApiMockServer
