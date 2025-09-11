// CARET MODIFICATION: Apollo Client Manager for GraphQL API communication
// Provides singleton Apollo Client instance with authentication token management

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, gql } from '@apollo/client'

export interface UserProfile {
	id: string
	email: string
	name?: string
	displayName?: string
	avatar?: string
	credits?: number
}

export interface Balance {
	currentBalance: number
	currency: string
}

export interface UsageTransaction {
	id: string
	amount: number
	description: string
	createdAt: string
}

/**
 * Singleton Apollo Client manager for Caret GraphQL API
 * Handles authentication token management and GraphQL operations
 */
export class CaretApolloManager {
	private static instance: CaretApolloManager | null = null
	private apolloClient: any = null
	private authToken: string | null = null
	private readonly apiUrl = "https://api.caret.team/graphql"

	private constructor() {
		console.log("[CARET-APOLLO-MANAGER] 🚀 CaretApolloManager initialized")
	}

	/**
	 * Returns the singleton instance of CaretApolloManager
	 */
	public static getInstance(): CaretApolloManager {
		if (!CaretApolloManager.instance) {
			CaretApolloManager.instance = new CaretApolloManager()
			console.log("[CARET-APOLLO-MANAGER] 🔧 Created new CaretApolloManager singleton instance")
		}
		return CaretApolloManager.instance
	}

	/**
	 * Reset instance (for testing)
	 */
	public static reset(): void {
		CaretApolloManager.instance = null
	}

	/**
	 * Set authentication token and create/update Apollo Client
	 */
	public setAuthToken(token: string): void {
		this.authToken = token
		this.initializeApolloClient()
		console.log("[CARET-APOLLO-MANAGER] ✅ Auth token set and Apollo Client initialized")
	}

	/**
	 * Get current authentication token
	 */
	public getAuthToken(): string | null {
		return this.authToken
	}

	/**
	 * Check if user is authenticated
	 */
	public isAuthenticated(): boolean {
		return !!this.authToken && !!this.apolloClient
	}

	/**
	 * Initialize Apollo Client with authentication
	 */
	private initializeApolloClient(): void {
		// HTTP 링크 생성
		const httpLink = new HttpLink({
			uri: this.apiUrl,
		})

		// 인증 미들웨어
		const authMiddleware = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					Authorization: this.authToken ? `Bearer ${this.authToken}` : "",
				},
			}))

			return forward(operation)
		})

		this.apolloClient = new ApolloClient({
			link: authMiddleware.concat(httpLink),
			cache: new InMemoryCache({
				typePolicies: {
					Query: {
						fields: {
							// 사용자 정보 캐싱 정책
							me: {
								merge: true
							},
							// 잔액 정보 캐싱 정책
							balance: {
								merge: true
							},
							// 사용 내역 캐싱 정책
							usage: {
								merge(existing = [], incoming) {
									return [...existing, ...incoming]
								}
							}
						}
					}
				}
			}),
			defaultOptions: {
				watchQuery: {
					errorPolicy: 'ignore',
				},
				query: {
					errorPolicy: 'all',
				}
			}
		})

		console.log("[CARET-APOLLO-MANAGER] 🔗 Apollo Client created with auth middleware")
	}

	/**
	 * Get Apollo Client instance
	 */
	public getClient(): any {
		return this.apolloClient
	}

	/**
	 * Fetch user profile using GraphQL
	 */
	public async getUserProfile(): Promise<UserProfile | undefined> {
		if (!this.apolloClient) {
			console.error("[CARET-APOLLO-MANAGER] ❌ Apollo Client not initialized")
			return undefined
		}

		try {
			console.log("[CARET-APOLLO-MANAGER] 👤 Fetching user profile...")
			const { data } = await this.apolloClient.query({
				query: GET_USER_PROFILE,
				fetchPolicy: 'network-only'
			})
			
			console.log("[CARET-APOLLO-MANAGER] ✅ User profile fetched:", data.me.email)
			return data.me
		} catch (error) {
			console.error("[CARET-APOLLO-MANAGER] ❌ Failed to fetch user profile:", error)
			return undefined
		}
	}

	/**
	 * Fetch user balance using GraphQL
	 */
	public async getBalance(): Promise<Balance | undefined> {
		if (!this.apolloClient) {
			console.error("[CARET-APOLLO-MANAGER] ❌ Apollo Client not initialized")
			return undefined
		}

		try {
			console.log("[CARET-APOLLO-MANAGER] 💰 Fetching balance...")
			const { data } = await this.apolloClient.query({
				query: GET_BALANCE,
				fetchPolicy: 'network-only'
			})
			
			console.log("[CARET-APOLLO-MANAGER] ✅ Balance fetched:", data.balance.currentBalance)
			return data.balance
		} catch (error) {
			console.error("[CARET-APOLLO-MANAGER] ❌ Failed to fetch balance:", error)
			return undefined
		}
	}

	/**
	 * Fetch usage transactions using GraphQL
	 */
	public async getUsage(): Promise<UsageTransaction[] | undefined> {
		if (!this.apolloClient) {
			console.error("[CARET-APOLLO-MANAGER] ❌ Apollo Client not initialized")
			return undefined
		}

		try {
			console.log("[CARET-APOLLO-MANAGER] 📈 Fetching usage transactions...")
			const { data } = await this.apolloClient.query({
				query: GET_USAGE,
				fetchPolicy: 'network-only'
			})
			
			console.log("[CARET-APOLLO-MANAGER] ✅ Usage transactions fetched:", data.usage.length)
			return data.usage
		} catch (error) {
			console.error("[CARET-APOLLO-MANAGER] ❌ Failed to fetch usage:", error)
			return undefined
		}
	}

	/**
	 * Clear authentication and reset client
	 */
	public logout(): void {
		this.authToken = null
		this.apolloClient = null
		console.log("[CARET-APOLLO-MANAGER] 🚪 Logged out and cleared Apollo Client")
	}
}

// GraphQL Queries
export const GET_USER_PROFILE = gql`
	query GetUserProfile {
		me {
			id
			email
			name
			displayName
			avatar
			credits
		}
	}
`

export const GET_BALANCE = gql`
	query GetBalance {
		balance {
			currentBalance
			currency
		}
	}
`

export const GET_USAGE = gql`
	query GetUsage {
		usage {
			id
			amount
			description
			createdAt
		}
	}
`