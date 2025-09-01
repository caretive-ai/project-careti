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

/**
 * Singleton class for global Caret functionality access
 * Following Cline's HostProvider pattern for consistent architecture
 */
export class CaretProvider {
	private static instance: CaretProvider | null = null
	private _currentMode: CaretModeSystem = "caret"

	private constructor() {}

	/**
	 * Initialize the singleton instance
	 */
	public static initialize(initialMode: CaretModeSystem = "caret"): CaretProvider {
		if (CaretProvider.instance) {
			// Allow re-initialization to update mode
			CaretProvider.instance._currentMode = initialMode
			return CaretProvider.instance
		}
		
		CaretProvider.instance = new CaretProvider()
		CaretProvider.instance._currentMode = initialMode
		return CaretProvider.instance
	}

	/**
	 * Gets the singleton instance
	 */
	public static get(): CaretProvider {
		if (!CaretProvider.instance) {
			// Auto-initialize with default if not setup
			return CaretProvider.initialize()
		}
		return CaretProvider.instance
	}

	public static isInitialized(): boolean {
		return !!CaretProvider.instance
	}

	/**
	 * Reset instance (for testing)
	 */
	public static reset(): void {
		CaretProvider.instance = null
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
		return CaretProvider.get().getCurrentMode()
	}

	public static get brandName(): string {
		return CaretProvider.get().getCurrentBrandName()
	}

	public static get isI18nEnabled(): boolean {
		return CaretProvider.get().isI18nEnabled()
	}

	public static get isBrandingEnabled(): boolean {
		return CaretProvider.get().isBrandingEnabled()
	}

	public static get defaultLanguage(): "ko" | "en" {
		return CaretProvider.get().getDefaultLanguage()
	}
}