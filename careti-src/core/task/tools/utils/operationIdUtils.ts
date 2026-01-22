// CARETI MODIFICATION: Utility for generating deterministic operationIds for tool UI updates
import type { ToolUse } from "@core/assistant-message"

/**
 * Simple hash function for generating deterministic IDs from strings.
 * Uses djb2 algorithm for fast, reasonable distribution.
 */
function simpleHash(str: string): string {
	let hash = 5381
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i)
	}
	// Convert to base36 and take last 8 chars for compactness
	return (hash >>> 0).toString(36).padStart(8, "0").slice(-8)
}

/**
 * Generates a deterministic operationId for a tool block.
 *
 * This ensures that the same tool call (same name + key params) always generates
 * the same operationId, preventing duplicate UI messages when handlePartialBlock
 * and execute receive different block object instances.
 *
 * @param block The tool use block
 * @param keyParams Array of param names to include in the hash (order matters)
 * @returns A deterministic operationId string
 */
export function generateBlockOperationId(block: ToolUse, keyParams: string[] = []): string {
	// Build a stable key from block name and key parameters
	const parts: string[] = [block.name]

	for (const paramName of keyParams) {
		const value = block.params[paramName as keyof typeof block.params]
		if (value) {
			// Use first 100 chars of param value to keep hash input reasonable
			parts.push(`${paramName}:${String(value).slice(0, 100)}`)
		}
	}

	const key = parts.join("|")
	const hash = simpleHash(key)

	return `${block.name}_${hash}`
}

/**
 * Ensures a block has an operationId, generating one if needed.
 * Uses the block's existing operationId if present, otherwise generates a new one.
 *
 * @param block The tool use block
 * @param keyParams Array of param names to include in the hash
 * @returns The operationId (either existing or newly generated)
 */
export function ensureBlockOperationId(block: ToolUse, keyParams: string[] = []): string {
	if (!block.operationId) {
		block.operationId = generateBlockOperationId(block, keyParams)
	}
	return block.operationId
}
