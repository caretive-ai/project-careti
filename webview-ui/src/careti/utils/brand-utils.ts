// CARETI MODIFICATION: Brand utility functions for webview components
/**
 * Frontend brand utilities for webview components
 */

/**
 * Get current brand provider name (frontend version)
 * Uses environment variables to determine current brand
 * @returns Provider name for current brand
 */
export function getCurrentBrandProvider(): string {
	// Check for environment variables (available in webview context through vscode API)
	if (typeof process !== "undefined" && process.env) {
		const brandMode = process.env.CARET_BRAND_MODE === "true"
		const currentBrand = process.env.CARET_CURRENT_BRAND || "careti"

		if (brandMode && currentBrand !== "careti") {
			return currentBrand
		}
	}

	return "careti"
}

/**
 * Check if app is running in brand mode
 * @returns True if brand mode is active
 */
export function isBrandModeActive(): boolean {
	if (typeof process !== "undefined" && process.env) {
		return process.env.CARET_BRAND_MODE === "true"
	}
	return false
}

/**
 * Get brand-specific configuration (frontend safe)
 * @returns Basic brand information
 */
export function getBrandInfo(): {
	brand: string
	isBrandMode: boolean
	displayName: string
	mcpMarketplaceTab?: string
	ignoreFileName: string
} {
	const currentBrand = getCurrentBrandProvider()
	const brandMode = isBrandModeActive()

	// Basic brand information without file system access
	const brandConfig: Record<string, any> = {
		careti: {
			displayName: "Careti",
			mcpMarketplaceTab: undefined,
			ignoreFileName: ".caretignore",
		},
		codecenter: {
			displayName: "CodeCenter",
			mcpMarketplaceTab: "CodeCenter 마켓",
			ignoreFileName: ".codecenterignore",
		},
	}

	const config = brandConfig[currentBrand] || brandConfig.careti

	return {
		brand: currentBrand,
		isBrandMode: brandMode,
		displayName: config.displayName,
		mcpMarketplaceTab: config.mcpMarketplaceTab,
		ignoreFileName: config.ignoreFileName,
	}
}

/**
 * Get brand-specific MCP marketplace tab name
 * @returns Tab name for brand marketplace or undefined for default
 */
export function getBrandMcpMarketplaceTab(): string | undefined {
	const brandInfo = getBrandInfo()
	return brandInfo.mcpMarketplaceTab
}

/**
 * CARETI MODIFICATION: Get primary ignore filename for current brand (frontend)
 */
export function getBrandIgnoreFileName(): string {
	return getBrandInfo().ignoreFileName
}

/**
 * CARETI MODIFICATION: Generated assets directory name used by image tools.
 */
export function getBrandGeneratedAssetsDirName(): string {
	return ".agents/generated-assets"
}
