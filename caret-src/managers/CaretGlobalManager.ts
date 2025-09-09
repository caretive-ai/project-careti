// CARET MODIFICATION: Caret global provider singleton - following HostProvider pattern
// Provides global access to Caret-specific functionality without imports

import type { CaretModeSystem } from "../shared/ModeSystem"

// CARET MODIFICATION: Auth0 integration for Caret API Provider
interface Auth0Client {
	loginWithPopup(): Promise<void>
	logout(): Promise<void>
	getTokenSilently(options?: { ignoreCache?: boolean }): Promise<string>
	isAuthenticated(): Promise<boolean>
	getUser(): Promise<any>
}

/**
 * Singleton class for global Caret functionality access
 * Following Cline's HostProvider pattern for consistent architecture
 */
export class CaretGlobalManager {
	private static instance: CaretGlobalManager | null = null
	private _currentMode: CaretModeSystem = "caret"
	// CARET MODIFICATION: Auth0 management fields
	private _auth0Client?: Auth0Client
	private _jwtToken?: string
	private _userInfo?: any

	private constructor() {}

	/**
	 * Initialize the singleton instance
	 */
	public static initialize(initialMode: CaretModeSystem = "caret"): CaretGlobalManager {
		console.log(`[CaretGlobalManager] 🚀 Initializing with mode: ${initialMode}`)
		if (CaretGlobalManager.instance) {
			// Allow re-initialization to update mode
			console.log(`[CaretGlobalManager] 📝 Re-initializing existing instance: ${CaretGlobalManager.instance._currentMode} → ${initialMode}`)
			CaretGlobalManager.instance._currentMode = initialMode
			return CaretGlobalManager.instance
		}
		
		CaretGlobalManager.instance = new CaretGlobalManager()
		CaretGlobalManager.instance._currentMode = initialMode
		console.log(`[CaretGlobalManager] ✅ New instance created with mode: ${initialMode}`)
		return CaretGlobalManager.instance
	}

	/**
	 * Gets the singleton instance
	 */
	public static get(): CaretGlobalManager {
		if (!CaretGlobalManager.instance) {
			// Auto-initialize with default if not setup
			return CaretGlobalManager.initialize()
		}
		return CaretGlobalManager.instance
	}

	public static isInitialized(): boolean {
		return !!CaretGlobalManager.instance
	}

	/**
	 * Reset instance (for testing)
	 */
	public static reset(): void {
		CaretGlobalManager.instance = null
	}

	// Instance methods
	public getCurrentMode(): CaretModeSystem {
		return this._currentMode
	}

	public setCurrentMode(mode: CaretModeSystem): void {
		console.log(`[CaretGlobalManager] 🔄 Mode switching: ${this._currentMode} → ${mode}`)
		this._currentMode = mode
		console.log(`[CaretGlobalManager] ✅ Mode switched successfully to: ${mode}`)
	}

	public getCurrentBrandName(): string {
		return this._currentMode === "caret" ? "Caret" : "Cline"
	}

	public isI18nEnabled(): boolean {
		return this._currentMode === "caret"
	}

	public isBrandingEnabled(): boolean {
		return this._currentMode === "caret"
	}

	public getDefaultLanguage(): "ko" | "en" {
		return this._currentMode === "caret" ? "ko" : "en"
	}

	// Static accessors for concise access (following HostProvider pattern)
	public static get currentMode(): CaretModeSystem {
		return CaretGlobalManager.get().getCurrentMode()
	}

	public static get brandName(): string {
		return CaretGlobalManager.get().getCurrentBrandName()
	}

	public static get isI18nEnabled(): boolean {
		return CaretGlobalManager.get().isI18nEnabled()
	}

	public static get isBrandingEnabled(): boolean {
		return CaretGlobalManager.get().isBrandingEnabled()
	}

	public static get defaultLanguage(): "ko" | "en" {
		return CaretGlobalManager.get().getDefaultLanguage()
	}

	// CARET MODIFICATION: Auth0 management methods
	/**
	 * Initialize Auth0 client for Caret API authentication
	 */
	public async initializeAuth0(auth0Client: Auth0Client): Promise<void> {
		this._auth0Client = auth0Client
		try {
			// 기존 로그인 상태 확인
			if (await auth0Client.isAuthenticated()) {
				this._jwtToken = await auth0Client.getTokenSilently()
				this._userInfo = await auth0Client.getUser()
			}
		} catch (error) {
			console.warn("Auth0 initialization failed:", error)
		}
	}

	/**
	 * Login with Auth0 and get JWT token
	 */
	public async login(): Promise<string> {
		if (!this._auth0Client) {
			throw new Error("Auth0 client not initialized")
		}

		try {
			await this._auth0Client.loginWithPopup()
			this._jwtToken = await this._auth0Client.getTokenSilently()
			this._userInfo = await this._auth0Client.getUser()
			return this._jwtToken
		} catch (error) {
			console.error("Caret Auth0 login failed:", error)
			throw error
		}
	}

	/**
	 * Logout from Auth0
	 */
	public async logout(): Promise<void> {
		if (this._auth0Client) {
			try {
				await this._auth0Client.logout()
			} catch (error) {
				console.warn("Auth0 logout failed:", error)
			}
		}
		this._jwtToken = undefined
		this._userInfo = undefined
	}

	/**
	 * Get current Auth0 JWT token
	 */
	public getAuthToken(): string | undefined {
		return this._jwtToken
	}

	/**
	 * Check if user is authenticated
	 */
	public isAuthenticated(): boolean {
		return !!this._jwtToken && !!this._userInfo
	}

	/**
	 * Get current user information
	 */
	public getUserInfo(): any {
		return this._userInfo
	}

	// Static accessors for Auth0 functionality
	public static async initAuth0(auth0Client: Auth0Client): Promise<void> {
		return CaretGlobalManager.get().initializeAuth0(auth0Client)
	}

	public static async login(): Promise<string> {
		return CaretGlobalManager.get().login()
	}

	public static async logout(): Promise<void> {
		return CaretGlobalManager.get().logout()
	}

	public static get authToken(): string | undefined {
		return CaretGlobalManager.get().getAuthToken()
	}

	public static get isAuthenticated(): boolean {
		return CaretGlobalManager.get().isAuthenticated()
	}

	public static get userInfo(): any {
		return CaretGlobalManager.get().getUserInfo()
	}

	// CARET MODIFICATION: Additional Auth0 methods for CaretAccountService integration
	/**
	 * Get Auth0 token for API requests (used by CaretAccountService)
	 */
	public static async getAuth0Token(): Promise<string | undefined> {
		const manager = CaretGlobalManager.get()
		if (!manager._auth0Client) {
			console.warn("[CARET-GLOBAL-MANAGER] Auth0 client not initialized")
			return undefined
		}

		try {
			// Try to get token silently first
			if (manager._jwtToken) {
				console.log("[CARET-GLOBAL-MANAGER] ✅ Using cached Auth0 token")
				return manager._jwtToken
			}

			// Check if user is authenticated and get token
			if (await manager._auth0Client.isAuthenticated()) {
				manager._jwtToken = await manager._auth0Client.getTokenSilently()
				console.log("[CARET-GLOBAL-MANAGER] ✅ Auth0 token retrieved silently")
				return manager._jwtToken
			}

			console.warn("[CARET-GLOBAL-MANAGER] User not authenticated")
			return undefined
		} catch (error) {
			console.error("[CARET-GLOBAL-MANAGER] ❌ Failed to get Auth0 token:", error)
			return undefined
		}
	}

	/**
	 * Refresh Auth0 token after account operations
	 */
	public static async refreshAuth0Token(): Promise<void> {
		const manager = CaretGlobalManager.get()
		if (!manager._auth0Client) {
			console.warn("[CARET-GLOBAL-MANAGER] Auth0 client not initialized for refresh")
			return
		}

		try {
			// Force refresh token
			manager._jwtToken = await manager._auth0Client.getTokenSilently({ 
				// Force refresh by ignoring cache (Auth0 SDK specific)
				ignoreCache: true 
			})
			manager._userInfo = await manager._auth0Client.getUser()
			console.log("[CARET-GLOBAL-MANAGER] ✅ Auth0 token refreshed successfully")
		} catch (error) {
			console.error("[CARET-GLOBAL-MANAGER] ❌ Failed to refresh Auth0 token:", error)
			// Clear tokens on refresh failure
			manager._jwtToken = undefined
			manager._userInfo = undefined
		}
	}
}