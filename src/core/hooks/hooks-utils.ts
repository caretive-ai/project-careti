/**
 * Determines if hooks are safely enabled based on platform support.
 *
 * Hooks are not yet supported on Windows, so this function ensures they
 * remain disabled on that platform regardless of user settings.
 *
 * @param userSetting The user's hooks enabled setting from global state (may be undefined)
 * @returns true if hooks are enabled and supported on this platform, false otherwise
 */
export function getHooksEnabledSafe(userSetting: boolean | undefined): boolean {
	// Force hooks to false on Windows (not yet supported)
	return process.platform === "win32" ? false : (userSetting ?? false)
}

// CARETI MODIFICATION: Claude Code compatible matcher pattern support

/**
 * Matches a tool name against a matcher pattern.
 *
 * Matcher patterns support:
 * - Empty string or "*" matches all tools
 * - Single tool name: "Edit" matches only "Edit"
 * - Multiple tools with pipe: "Edit|Write" matches "Edit" or "Write"
 * - Regex patterns: "Edit.*" matches "Edit", "EditFile", etc.
 *
 * For file-based hooks, use underscore instead of pipe: "Edit_Write"
 *
 * @param toolName The tool name to check
 * @param matcher The matcher pattern (can be empty, "*", single name, or pattern)
 * @returns true if the tool matches the pattern
 *
 * @example
 * matchesToolPattern("Edit", "") // true (empty matches all)
 * matchesToolPattern("Edit", "*") // true (star matches all)
 * matchesToolPattern("Edit", "Edit") // true
 * matchesToolPattern("Write", "Edit") // false
 * matchesToolPattern("Edit", "Edit|Write") // true
 * matchesToolPattern("Read", "Edit|Write") // false
 * matchesToolPattern("EditFile", "Edit.*") // true (regex)
 */
export function matchesToolPattern(toolName: string, matcher: string): boolean {
	// Empty or "*" matches all
	if (!matcher || matcher === "*") {
		return true
	}

	// Convert underscore to pipe for file-based patterns
	const normalizedMatcher = matcher.replace(/_/g, "|")

	// Try exact match first (most common case)
	if (normalizedMatcher === toolName) {
		return true
	}

	// Check if it's a simple pipe-separated list (no regex chars)
	if (/^[a-zA-Z0-9|]+$/.test(normalizedMatcher)) {
		const tools = normalizedMatcher.split("|")
		return tools.includes(toolName)
	}

	// Treat as regex pattern
	try {
		const regex = new RegExp(`^(${normalizedMatcher})$`)
		return regex.test(toolName)
	} catch {
		// Invalid regex, fall back to exact match
		return normalizedMatcher === toolName
	}
}

/**
 * Extracts matcher pattern from a hook file name.
 *
 * File naming convention:
 * - "PreToolUse" - no matcher (matches all)
 * - "PreToolUse.Edit" - matches "Edit" tool only
 * - "PreToolUse.Edit_Write" - matches "Edit" or "Write" tools
 *
 * @param hookName The base hook name (e.g., "PreToolUse")
 * @param fileName The full file name (e.g., "PreToolUse.Edit_Write")
 * @returns The matcher pattern, or empty string if no matcher
 *
 * @example
 * extractMatcherFromFileName("PreToolUse", "PreToolUse") // ""
 * extractMatcherFromFileName("PreToolUse", "PreToolUse.Edit") // "Edit"
 * extractMatcherFromFileName("PreToolUse", "PreToolUse.Edit_Write") // "Edit|Write"
 */
export function extractMatcherFromFileName(hookName: string, fileName: string): string {
	if (fileName === hookName) {
		return ""
	}

	// Check for pattern like "HookName.Matcher"
	const prefix = `${hookName}.`
	if (fileName.startsWith(prefix)) {
		// Extract matcher and convert underscore to pipe
		return fileName.slice(prefix.length).replace(/_/g, "|")
	}

	return ""
}
