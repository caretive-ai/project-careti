// CARET MODIFICATION: Caret global provider singleton - following HostProvider pattern
// Provides global access to Caret-specific functionality without imports

import type { CaretModeSystem } from "@caret/shared/ModeSystem"
import { 
	detectCurrentBrandName,
	getCurrentUserMode,
	isModeI18nEnabled,
	isBrandingEnabled,
	getModeDefaultLanguage 
} from "@caret/utils/brand-utils"

// CARET MODIFICATION: Auth0 integration for Caret API Provider
interface Auth0Client {
	loginWithPopup(): Promise<void>
	logout(): Promise<void>
	getTokenSilently(): Promise<string>
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
		if (CaretGlobalManager.instance) {
			// Allow re-initialization to update mode
			CaretGlobalManager.instance._currentMode = initialMode
			return CaretGlobalManager.instance
		}
		
		CaretGlobalManager.instance = new CaretGlobalManager()
		CaretGlobalManager.instance._currentMode = initialMode
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
		this._currentMode = mode
	}

	public getCurrentBrandName(): string {
		return detectCurrentBrandName()
	}

	public isI18nEnabled(): boolean {
		return isModeI18nEnabled()
	}

	public isBrandingEnabled(): boolean {
		return isBrandingEnabled()
	}

	public getDefaultLanguage(): "ko" | "en" {
		return getModeDefaultLanguage()
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
}