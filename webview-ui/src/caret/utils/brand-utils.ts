// CARET MODIFICATION: Brand utility functions for webview components
/**
 * Frontend brand utilities for webview components
 */

type ModeSystem = "caret" | "cline"

function readEnvString(key: string): string | undefined {
	if (typeof process !== "undefined" && process.env) {
		const value = process.env[key]
		if (typeof value === "string" && value.trim() !== "") return value
	}
	return undefined
}

function toBrandSlug(displayName: string): string {
	const s0 = displayName.trim().toLowerCase()
	if (!s0) return "caret"
	const s1 = s0.split(/\s+/).join("-")
	let out = ""
	let lastDash = false
	for (const ch of s1) {
		const isAZ = ch >= "a" && ch <= "z"
		const is09 = ch >= "0" && ch <= "9"
		if (isAZ || is09) {
			out += ch
			lastDash = false
			continue
		}
		if (ch === "-" && !lastDash) {
			out += "-"
			lastDash = true
		}
	}
	out = out.replace(/^-+|-+$/g, "")
	return out || "caret"
}

function titleCaseFromSlug(slug: string): string {
	if (!slug) return "Caret"
	return slug
		.split("-")
		.filter(Boolean)
		.map((p) => p[0]?.toUpperCase() + p.slice(1))
		.join(" ")
}

/**
 * Get current brand provider name (frontend version)
 * Uses environment variables to determine current brand
 * @returns Provider name for current brand
 */
export function getCurrentBrandProvider(): string {
	const brandMode = readEnvString("CARET_BRAND_MODE") === "true"
	const currentBrand = readEnvString("CARET_CURRENT_BRAND") || "caret"
	return brandMode ? currentBrand : "caret"
}

/**
 * Check if app is running in brand mode
 * @returns True if brand mode is active
 */
export function isBrandModeActive(): boolean {
	return readEnvString("CARET_BRAND_MODE") === "true"
}

export function getCurrentBrandDisplayName(): string {
	return readEnvString("CARET_BRAND_DISPLAY_NAME") || titleCaseFromSlug(getCurrentBrandProvider())
}

export function getCurrentBrandSlug(): string {
	return readEnvString("CARET_BRAND_SLUG") || toBrandSlug(getCurrentBrandDisplayName())
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
	const brand = getCurrentBrandProvider()
	const isBrandMode = isBrandModeActive()
	const displayName = getCurrentBrandDisplayName()
	const slug = getCurrentBrandSlug()
	const mcpMarketplaceTab = readEnvString("CARET_MCP_MARKETPLACE_TAB")

	return {
		brand,
		isBrandMode,
		displayName,
		mcpMarketplaceTab,
		ignoreFileName: `.${slug}ignore`,
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
 * CARET MODIFICATION: Get primary ignore filename for current brand (frontend)
 */
export function getBrandIgnoreFileName(): string {
	return getBrandInfo().ignoreFileName
}

export function getModeSystemCliCommandName(modeSystem: ModeSystem): string {
	return modeSystem === "caret" ? getCurrentBrandSlug() : "cline"
}

export function getModeSystemCliNpmPackageName(modeSystem: ModeSystem): string {
	return modeSystem === "caret" ? `@caretive/${getCurrentBrandSlug()}-cli` : "cline"
}

export function getModeSystemCliInstallCommand(modeSystem: ModeSystem): string {
	return `npm install -g ${getModeSystemCliNpmPackageName(modeSystem)}`
}
