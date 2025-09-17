// CARET MODIFICATION: Caret global provider singleton - following HostProvider pattern
// Provides global access to Caret-specific functionality without imports

import type { CaretModeSystem } from "../shared/ModeSystem"
import { CaretApolloManager, type UserProfile } from "./CaretApolloManager"
import * as vscode from "vscode"
import { randomBytes } from "crypto"

/**
 * Singleton class for global Caret functionality access
 * Following Cline's HostProvider pattern for consistent architecture
 */
export class CaretGlobalManager {
	private static instance: CaretGlobalManager | null = null
	private _currentMode: CaretModeSystem = "caret"
	// CARET MODIFICATION: External auth token management
	private _authToken?: string
	private _userInfo?: UserProfile
	private apolloManager = CaretApolloManager.getInstance()

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

	// CARET MODIFICATION: External authentication methods without OAuth
	/**
	 * Initiate external authentication flow
	 * Opens external auth page in browser
	 */
	public async login(): Promise<void> {
		console.log("[CARET-GLOBAL-MANAGER] 🚀 Starting external authentication flow")
		
		try {
			// Generate nonce for state validation
			const nonce = randomBytes(32).toString("hex")
			
			// Store nonce for validation (using VS Code secrets API)
			const context = vscode.workspace.workspaceFolders?.[0]?.uri
			if (context) {
				// TODO: Store nonce in VS Code secret storage
				console.log("[CARET-GLOBAL-MANAGER] 🔑 Generated state nonce")
			}

			// Build callback URL
			const uriScheme = vscode.env.uriScheme
			const vsCodeCallbackUrl = `${uriScheme}://caretive.caret/auth`

			// Build external auth URL
      // `https://auth.caret.team/login?state=${encodeURIComponent(nonce)}&callback_url=${encodeURIComponent(vsCodeCallbackUrl)}`

			const authUrl = vscode.Uri.parse(
				`http://localhost:3000/login?state=${encodeURIComponent(nonce)}&callback_url=${encodeURIComponent(vsCodeCallbackUrl)}`
			)

			console.log("[CARET-GLOBAL-MANAGER] 🌐 Opening external auth URL:", authUrl.toString())
			// @ts-ignore: VS Code API deprecation warning
			const success = await vscode.env.openExternal(authUrl)
			if (!success) {
				throw new Error("Failed to open external URL")
			}

		} catch (error) {
			console.error("[CARET-GLOBAL-MANAGER] ❌ External authentication failed:", error)
			throw error
		}
	}

	/**
	 * Set token from external authentication callback
	 */
	public async setTokenFromCallback(token: string): Promise<void> {
		console.log("[CARET-GLOBAL-MANAGER] 🔑 Setting token from callback")
		
		this._authToken = token
		this.apolloManager.setAuthToken(token)

		// Fetch user profile using Apollo Client
		try {
			this._userInfo = await this.apolloManager.getUserProfile()
			console.log("[CARET-GLOBAL-MANAGER] ✅ User profile loaded:", this._userInfo?.email)
		} catch (error) {
			console.error("[CARET-GLOBAL-MANAGER] ❌ Failed to fetch user profile:", error)
		}
	}

	/**
	 * Logout and clear authentication
	 */
	public async logout(): Promise<void> {
		console.log("[CARET-GLOBAL-MANAGER] 🚪 Logging out")
		
		this._authToken = undefined
		this._userInfo = undefined
		this.apolloManager.logout()
		
		console.log("[CARET-GLOBAL-MANAGER] ✅ Logout completed")
	}

	/**
	 * Get current authentication token
	 */
	public getAuthToken(): string | undefined {
		return this._authToken
	}

	/**
	 * Check if user is authenticated
	 */
	public isAuthenticated(): boolean {
		return !!this._authToken && !!this._userInfo
	}

	/**
	 * Get current user information
	 */
	public getUserInfo(): UserProfile | undefined {
		return this._userInfo
	}

	// Static accessors for external authentication
	public static async login(): Promise<void> {
		return CaretGlobalManager.get().login()
	}

	public static async logout(): Promise<void> {
		return CaretGlobalManager.get().logout()
	}

	public static async setTokenFromCallback(token: string): Promise<void> {
		return CaretGlobalManager.get().setTokenFromCallback(token)
	}

	public static get authToken(): string | undefined {
		return CaretGlobalManager.get().getAuthToken()
	}

	public static get isAuthenticated(): boolean {
		return CaretGlobalManager.get().isAuthenticated()
	}

	public static get userInfo(): UserProfile | undefined {
		return CaretGlobalManager.get().getUserInfo()
	}

	// CARET MODIFICATION: Compatible method names for existing code
	/**
	 * Get authentication token (compatible with existing CaretAccountService)
	 */
	public static async getAuth0Token(): Promise<string | undefined> {
		const manager = CaretGlobalManager.get()
		console.log("[CARET-GLOBAL-MANAGER] 🔑 Getting auth token for API requests")
		return manager.getAuthToken()
	}

	/**
	 * Refresh token (placeholder for compatibility)
	 */
	public static async refreshAuth0Token(): Promise<void> {
		console.log("[CARET-GLOBAL-MANAGER] 🔄 Token refresh requested (not needed for external auth)")
		// For external auth, tokens are managed by the auth server
		// No local refresh needed
	}
}