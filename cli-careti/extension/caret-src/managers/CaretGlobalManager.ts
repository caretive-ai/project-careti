import type { CaretModeSystem } from "@careti/shared/ModeSystem"
import { randomBytes } from "crypto"
import * as vscode from "vscode"
import { CaretUser } from "@/shared/CaretAccount"

/**
 * Singleton class for global Caret functionality access
 * Following Cline's HostProvider pattern for consistent architecture
 */
export class CaretGlobalManager {
	private static instance: CaretGlobalManager | null = null
	private _currentMode: CaretModeSystem = "caret"
	// CARETI MODIFICATION: Auth0 management fields
	private _jwtToken?: string
	private _userInfo?: CaretUser
	private _caretMode: "chatbot" | "agent" = "chatbot"
	// CARETI MODIFICATION: Input history management fields
	private _inputHistory: string[] = []
	private _inputHistoryResolver?: (history: string[]) => Promise<void>

	private constructor() {}

	/**
	 * Initialize the singleton instance
	 */
	public static initialize(initialMode: CaretModeSystem = "caret"): CaretGlobalManager {
		console.log(`[CaretGlobalManager] 🚀 Initializing with mode: ${initialMode}`)
		if (CaretGlobalManager.instance) {
			// Allow re-initialization to update mode
			console.log(
				`[CaretGlobalManager] 📝 Re-initializing existing instance: ${CaretGlobalManager.instance._currentMode} → ${initialMode}`,
			)
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

	public getCaretMode(): "chatbot" | "agent" {
		return this._caretMode
	}

	public setCaretMode(mode: "chatbot" | "agent"): void {
		this._caretMode = mode
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

	public static get currentCaretMode(): "chatbot" | "agent" {
		return CaretGlobalManager.get().getCaretMode()
	}

	public static setCurrentCaretMode(mode: "chatbot" | "agent"): void {
		CaretGlobalManager.get().setCaretMode(mode)
	}

	/**
	 * Login with Auth0 and get JWT token
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
			const authEndpoint = process.env.CARET_AUTH_ENDPOINT || "https://caret.team"
			const authUrl = vscode.Uri.parse(
				`${authEndpoint}/login?state=${encodeURIComponent(nonce)}&callback_url=${encodeURIComponent(vsCodeCallbackUrl)}`,
			)

			console.log("[CARET-GLOBAL-MANAGER] 🌐 Opening external auth URL:", authUrl.toString())
			const success = await vscode.env.openExternal(authUrl)
			if (!success) {
				throw new Error("Failed to open external URL")
			}
		} catch (error) {
			console.error("[CARET-GLOBAL-MANAGER] ❌ External authentication failed:", error)
			throw error
		}
	}

	// public async setTokenFromCallback(token: string): Promise<void> {
	// 	console.log("[CARET-GLOBAL-MANAGER] 🔑 Setting token from callback")

	// 	this._jwtToken = token

	// 	// Fetch user profile using Apollo Client
	// 	try {
	// 		// this._userInfo = await this.apolloManager.getUserProfile()
	// 		const caretAccountService = CaretAccountService.getInstance()
	// 		const userInfo = await caretAccountService.fetchMe()
	// 		console.log("Caret Global Manager userInfo=====>", userInfo)
	// 		console.log("Caret router Model", userInfo?.models)
	// 		this._userInfo = userInfo
	// 		console.log("[CARET-GLOBAL-MANAGER] ✅ User profile loaded:", this._userInfo?.email)
	// 	} catch (error) {
	// 		console.error("[CARET-GLOBAL-MANAGER] ❌ Failed to fetch user profile:", error)
	// 	}
	// }

	/**
	 * Logout from Auth0
	 */
	public async logout(): Promise<void> {
		// TODO: implement logout - logout api call
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

	public static async login(): Promise<void> {
		return CaretGlobalManager.get().login()
	}

	public static async logout(): Promise<void> {
		return CaretGlobalManager.get().logout()
	}

	// public static async setTokenFromCallback(token: string): Promise<void> {
	// 	return CaretGlobalManager.get().setTokenFromCallback(token)
	// }

	public static get authToken(): string | undefined {
		return CaretGlobalManager.get().getAuthToken()
	}

	public static get isAuthenticated(): boolean {
		return CaretGlobalManager.get().isAuthenticated()
	}

	public static get userInfo(): any {
		return CaretGlobalManager.get().getUserInfo()
	}

	// CARETI MODIFICATION: Input history management methods
	/**
	 * Initialize input history resolver (called from webview context)
	 */
	public initializeInputHistoryResolver(resolver: (history: string[]) => Promise<void>): void {
		this._inputHistoryResolver = resolver
	}

	/**
	 * Get input history
	 */
	public async getInputHistory(): Promise<string[]> {
		// Return cached history if available
		return this._inputHistory
	}

	/**
	 * Set input history and save to backend
	 */
	public async setInputHistory(history: string[]): Promise<void> {
		this._inputHistory = history // Update local cache

		// Save to backend via resolver if available
		if (this._inputHistoryResolver) {
			try {
				await this._inputHistoryResolver(history)
				console.log("[CARET-GLOBAL-MANAGER] ✅ Input history saved to backend")
			} catch (error) {
				console.error("[CARET-GLOBAL-MANAGER] ❌ Failed to save input history:", error)
				throw error
			}
		} else {
			console.warn("[CARET-GLOBAL-MANAGER] Input history resolver not initialized")
		}
	}

	/**
	 * Load input history from backend (called during initialization)
	 */
	public setInputHistoryCache(history: string[]): void {
		this._inputHistory = history
		console.log(`[CARET-GLOBAL-MANAGER] ✅ Input history cache updated with ${history.length} items`)
	}

	// Static accessors for input history
	public static async getInputHistory(): Promise<string[]> {
		return CaretGlobalManager.get().getInputHistory()
	}

	public static async setInputHistory(history: string[]): Promise<void> {
		return CaretGlobalManager.get().setInputHistory(history)
	}

	public static initInputHistoryResolver(resolver: (history: string[]) => Promise<void>): void {
		CaretGlobalManager.get().initializeInputHistoryResolver(resolver)
	}

	public static setInputHistoryCache(history: string[]): void {
		CaretGlobalManager.get().setInputHistoryCache(history)
	}
}
