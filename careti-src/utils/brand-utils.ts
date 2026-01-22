// CARETI MODIFICATION: Careti brand utilities - centralized brand detection and configuration
// Provides brand-specific functionality without cluttering Cline's env.ts

import fs from "fs"
import path from "path"
import { CARET_MODE_SYSTEM_CONFIG, type CaretModeSystem } from "../shared/ModeSystem"

// Cached brand name for performance
let _cachedBrandName: string | null = null

/**
 * Detect current brand name from package.json (cached for performance)
 * @returns The current brand name (e.g., "Cline", "Careti", "CodeCenter")
 */
export function detectCurrentBrandName(): string {
	if (_cachedBrandName) {
		return _cachedBrandName!
	}

	const candidates = [
		path.join(__dirname, "..", "..", "package.json"),
		path.join(__dirname, "..", "package.json"),
		path.join(__dirname, "package.json"),
		path.join(process.cwd(), "package.json"),
	]

	try {
		const packageJsonPath = candidates.find((candidate) => fs.existsSync(candidate))
		if (!packageJsonPath) {
			console.warn("Failed to detect brand from package.json: no candidate file found")
			_cachedBrandName = "Careti"
			return _cachedBrandName!
		}

		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
		// CARETI MODIFICATION: default brand fallback uses Careti when displayName is missing
		const displayName = packageJson.displayName || "Careti"

		// displayName을 그대로 브랜드명으로 사용
		_cachedBrandName = displayName

		return _cachedBrandName!
	} catch (error) {
		console.error("Failed to detect brand from package.json:", error)
		_cachedBrandName = "Careti" // CARETI MODIFICATION: safe default brand fallback
		return _cachedBrandName!
	}
}

/**
 * Get current user mode (separate from brand detection)
 * @returns The current user mode setting
 */
export function getCurrentUserMode(): CaretModeSystem {
	// TODO: Get from user settings/preferences
	// For now, return default based on brand
	const brandName = detectCurrentBrandName().toLowerCase()
	return brandName === "cline" ? "cline" : "careti"
}

/**
 * Get current brand display name (for UI, output channels, etc.)
 * @returns Brand display name ("Careti" or "Cline")
 */
export function getCurrentBrandDisplayName(): string {
	return detectCurrentBrandName()
}

/**
 * Get current brand name (alias for getCurrentBrandDisplayName for compatibility)
 * @returns Brand name from package.json displayName
 */
export function getCurrentBrandName(): string {
	return detectCurrentBrandName()
}

/**
 * Check if current mode supports i18n features
 * @returns true if i18n is enabled for current mode
 */
export function isModeI18nEnabled(): boolean {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode].features.i18nEnabled
}

/**
 * Check if current mode supports backend message translation
 * @returns true if backend translation is enabled for current mode
 */
export function isBackendTranslationEnabled(): boolean {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode].features.backendMessageTranslation
}

/**
 * Check if current mode supports branding features
 * @returns true if branding is enabled for current mode
 */
export function isBrandingEnabled(): boolean {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode].features.brandingEnabled
}

/**
 * Get current mode's default language
 * @returns Default language for current mode ("ko" | "en")
 */
export function getModeDefaultLanguage(): "ko" | "en" {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode].features.defaultLanguage
}

/**
 * Get current mode configuration
 * @returns Complete mode configuration object
 */
export function getCurrentModeConfig() {
	const mode = getCurrentUserMode()
	return CARET_MODE_SYSTEM_CONFIG[mode]
}

/**
 * Get brand display name for specific mode
 * @param mode - The mode to get display name for
 * @returns Brand display name
 */
export function getBrandDisplayName(mode: CaretModeSystem): string {
	return CARET_MODE_SYSTEM_CONFIG[mode].displayName
}

/**
 * Get brand description for specific mode
 * @param mode - The mode to get description for
 * @returns Brand description
 */
export function getBrandDescription(mode: CaretModeSystem): string {
	return CARET_MODE_SYSTEM_CONFIG[mode].description
}

/**
 * Get standard agents context directory name.
 * @returns Agents context directory name (".agents/context")
 */
export function getBrandRulesFileName(): string {
	return ".agents/context"
}

/**
 * Get standard agents workflows directory name.
 * @returns Workflows directory name (".agents/workflows")
 */
export function getBrandWorkflowsDirName(): string {
	return ".agents/workflows"
}

/**
 * Get legacy workflows directory name (for backward compatibility).
 * @returns Legacy workflows directory name (".agents/context/workflows")
 */
export function getBrandWorkflowsLegacyDirName(): string {
	return ".agents/context/workflows"
}

/**
 * Get standard users documentation directory name.
 * @returns Users directory name (".users")
 */
export function getBrandUsersDirName(): string {
	return ".users"
}

/**
 * Get standard users context directory name.
 * @returns Users context directory name (".users/context")
 */
export function getBrandUsersContextDirName(): string {
	return ".users/context"
}

/**
 * Get legacy user context directory name (for backward compatibility).
 * @returns Legacy user context directory name (".agents/context-for-user")
 */
export function getBrandUsersContextLegacyDirName(): string {
	return ".agents/context-for-user"
}

/**
 * Get brand MCP settings file name based on current brand
 * @returns MCP settings file name (e.g., "caret_mcp_settings.json", "codecenter_mcp_settings.json")
 */
export function getBrandMcpSettingsFileName(): string {
	const brandName = getCurrentBrandName().toLowerCase()
	return `${brandName}_mcp_settings.json`
}

/**
 * CARETI MODIFICATION: Get brand-specific assets directory name (e.g., ".caretassets").
 */
export function getBrandAssetsDirName(): string {
	const brandName = getCurrentBrandName().toLowerCase()
	return `.${brandName}assets`
}

/**
 * Get standard generated assets directory name (".agents/generated-assets").
 */
export function getBrandGeneratedAssetsDirName(): string {
	return ".agents/generated-assets"
}

/**
 * CARETI MODIFICATION: Get brand-specific ignore filename (e.g., ".caretignore")
 */
export function getBrandIgnoreFileName(): string {
	const brandName = getCurrentBrandName().toLowerCase()
	return `.${brandName}ignore`
}

/**
 * CARETI MODIFICATION: Legacy Cline ignore filename for compatibility checks
 */
export function getLegacyClineIgnoreFileName(): string {
	return ".clineignore"
}

/**
 * Clear cached values (for testing)
 */
export function clearCache(): void {
	_cachedBrandName = null
}

// ============================================================================
// Global Directory Paths (~/Documents/.agents/)
// ============================================================================

/**
 * Get global agents directory name.
 * Consistent with project-level .agents/ structure.
 * @returns Global agents directory name (".agents")
 */
export function getGlobalAgentsDirName(): string {
	return ".agents"
}

/**
 * Get legacy global directory name based on brand.
 * Used for migration from old paths.
 * @returns Legacy global directory name (e.g., "Careti", "Cline")
 */
export function getLegacyGlobalDirName(): string {
	const brandName = detectCurrentBrandName()
	// Cline uses "Cline", Careti uses "Careti"
	return brandName === "Cline" ? "Cline" : "Careti"
}

/**
 * Get global context subdirectory name.
 * @returns "context"
 */
export function getGlobalContextSubdir(): string {
	return "context"
}

/**
 * Get global workflows subdirectory name.
 * @returns "workflows"
 */
export function getGlobalWorkflowsSubdir(): string {
	return "workflows"
}

/**
 * Get global skills subdirectory name.
 * @returns "skills"
 */
export function getGlobalSkillsSubdir(): string {
	return "skills"
}

/**
 * Get global hooks subdirectory name.
 * @returns "hooks"
 */
export function getGlobalHooksSubdir(): string {
	return "hooks"
}

/**
 * Get global MCP subdirectory name.
 * @returns "mcp"
 */
export function getGlobalMcpSubdir(): string {
	return "mcp"
}

/**
 * Get legacy subdirectory mapping for migration.
 * Maps new subdirectory names to legacy names.
 */
export function getLegacySubdirMapping(): Record<string, string> {
	return {
		context: "Rules",
		workflows: "Workflows",
		skills: "Skills",
		hooks: "Hooks",
		mcp: "MCP",
	}
}

// ============================================================================
// Korean Brand Name Utilities (한글 브랜드명 유틸리티)
// ============================================================================

/**
 * Korean brand name mapping
 */
const KOREAN_BRAND_NAMES: Record<string, string> = {
	Caret: "캐러티",
	Careti: "캐러티",
	Cline: "클라인",
	CodeCenter: "코드센터",
}

/**
 * Get Korean brand display name
 * @returns Korean brand name (e.g., "캐러티", "캐러티", "클라인")
 */
export function getBrandDisplayNameKo(): string {
	const brand = detectCurrentBrandName()
	return KOREAN_BRAND_NAMES[brand] || brand
}

/**
 * Check if Korean character has final consonant (받침)
 * @param char - Single Korean character
 * @returns true if the character has a final consonant
 */
function hasFinalConsonant(char: string): boolean {
	const charCode = char.charCodeAt(0)
	// Korean syllable range: 0xAC00 - 0xD7A3
	if (charCode < 0xac00 || charCode > 0xd7a3) {
		return false
	}
	// Final consonant index = (charCode - 0xAC00) % 28
	// If 0, no final consonant
	return (charCode - 0xac00) % 28 !== 0
}

/**
 * Korean particle types
 */
export type KoreanParticle = "은/는" | "이/가" | "을/를" | "과/와" | "으로/로"

/**
 * Get Korean brand name with appropriate particle (조사)
 * Automatically selects the correct particle based on whether
 * the brand name ends with a consonant or vowel.
 *
 * @param particle - The particle type to append
 * @returns Korean brand name with the correct particle
 *
 * @example
 * // For "캐러티" (ends with consonant ㅅ):
 * getBrandWithParticle("이/가") // "캐러티가"
 * getBrandWithParticle("을/를") // "캐러티을"
 * getBrandWithParticle("은/는") // "캐러티는"
 *
 * // For "캐러티" (ends with vowel ㅣ):
 * getBrandWithParticle("이/가") // "캐러티가"
 * getBrandWithParticle("을/를") // "캐러티를"
 * getBrandWithParticle("은/는") // "캐러티는"
 */
export function getBrandWithParticle(particle: KoreanParticle): string {
	const koName = getBrandDisplayNameKo()
	const lastChar = koName[koName.length - 1]
	const hasConsonant = hasFinalConsonant(lastChar)

	// Particle mapping: [with consonant, without consonant]
	const particles: Record<KoreanParticle, [string, string]> = {
		"은/는": ["은", "는"],
		"이/가": ["이", "가"],
		"을/를": ["을", "를"],
		"과/와": ["과", "와"],
		"으로/로": ["으로", "로"],
	}

	const [withConsonant, withoutConsonant] = particles[particle]
	return koName + (hasConsonant ? withConsonant : withoutConsonant)
}

/**
 * Get brand display name with both Korean and English
 * @returns Mixed brand name (e.g., "캐러티(Careti)")
 */
export function getBrandDisplayNameMixed(): string {
	const en = getCurrentBrandDisplayName()
	const ko = getBrandDisplayNameKo()
	return `${ko}(${en})`
}
