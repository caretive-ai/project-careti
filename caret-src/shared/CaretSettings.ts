// CARET MODIFICATION: Centralized Caret settings to minimize Cline code changes
// All Caret-specific features grouped in one place

import type { CaretModeSystem } from "./ModeSystem"

/**
 * Centralized Caret settings interface
 * All Caret-specific features are grouped here to minimize ExtensionState modifications
 */
export interface CaretSettings {
	/** Global Caret brand mode (caret/cline) */
	modeSystem: CaretModeSystem
	/** Future: AI persona configuration */
	persona?: {
		id: string
		name: string
		config: Record<string, any>
	}
	/** Future: Enhanced i18n settings */
	i18n?: {
		uiLanguage: string
		autoDetect: boolean
		fallbackLanguage: string
	}
	/** Future: Custom UI features */
	ui?: {
		theme: string
		layout: string
		customizations: Record<string, any>
	}
	/** Version for migration handling */
	version?: number
}

/**
 * Default Caret settings
 */
export const DEFAULT_CARET_SETTINGS: CaretSettings = {
	modeSystem: "caret",
	version: 1,
}

/**
 * Helper functions for Caret settings
 */
export const CaretSettingsUtils = {
	/**
	 * Merge partial settings with defaults
	 */
	merge(partial?: Partial<CaretSettings>): CaretSettings {
		return {
			...DEFAULT_CARET_SETTINGS,
			...partial,
		}
	},

	/**
	 * Extract specific setting by path
	 */
	get<T>(settings: CaretSettings | undefined, path: keyof CaretSettings): T | undefined {
		return settings?.[path] as T | undefined
	},

	/**
	 * Check if feature is enabled
	 */
	isFeatureEnabled(settings: CaretSettings | undefined, _feature: string): boolean {
		// Future: implement feature flag logic
		return settings?.modeSystem === "caret"
	},
}
