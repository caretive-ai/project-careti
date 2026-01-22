/**
 * Finish Reason Handler
 *
 * Provides utilities for handling API finish/stop reasons across different providers.
 * This enables proper conversation loop termination for models that may not always
 * call attempt_completion (e.g., GLM4.7).
 *
 * @see work-logs/luke/careti/todo/doing/2026-01-14-glm47-loop-issue.md
 */

/**
 * Natural end reasons that indicate the model has completed its response
 * without requesting tool use
 */
const NATURAL_END_REASONS = new Set([
	// OpenAI / OpenAI-compatible (GLM, etc.)
	"stop",
	// Anthropic
	"end_turn",
	"stop_sequence",
	// Gemini
	"STOP",
])

/**
 * Tool use reasons that indicate the model wants to execute tools
 */
const TOOL_USE_REASONS = new Set([
	// Anthropic
	"tool_use",
	// OpenAI / OpenAI-compatible
	"tool_calls",
])

/**
 * Max tokens reasons that indicate the response was truncated
 */
const MAX_TOKENS_REASONS = new Set([
	// Anthropic
	"max_tokens",
	// OpenAI
	"length",
	// Gemini
	"MAX_TOKENS",
])

/**
 * Check if the finish reason indicates natural completion
 * @param reason - The raw finish reason from the API
 * @returns true if this is a natural end (not tool use or truncation)
 */
export function isNaturalEndReason(reason: string | undefined | null): boolean {
	if (!reason) return false
	return NATURAL_END_REASONS.has(reason)
}

/**
 * Check if the finish reason indicates tool use request
 * @param reason - The raw finish reason from the API
 * @returns true if the model wants to execute tools
 */
export function isToolUseReason(reason: string | undefined | null): boolean {
	if (!reason) return false
	return TOOL_USE_REASONS.has(reason)
}

/**
 * Check if the finish reason indicates token limit reached
 * @param reason - The raw finish reason from the API
 * @returns true if the response was truncated due to token limits
 */
export function isMaxTokensReason(reason: string | undefined | null): boolean {
	if (!reason) return false
	return MAX_TOKENS_REASONS.has(reason)
}

/**
 * Normalized finish reason type
 */
export type NormalizedFinishReason = "end_turn" | "tool_use" | "max_tokens" | "unknown"

/**
 * Normalize provider-specific finish reasons to a common format
 * @param reason - The raw finish reason from the API
 * @returns Normalized reason: "end_turn", "tool_use", "max_tokens", or "unknown"
 */
export function normalizeFinishReason(reason: string | undefined | null): NormalizedFinishReason {
	if (!reason) return "unknown"

	if (isNaturalEndReason(reason)) {
		return "end_turn"
	}
	if (isToolUseReason(reason)) {
		return "tool_use"
	}
	if (isMaxTokensReason(reason)) {
		return "max_tokens"
	}

	return "unknown"
}

/**
 * Determine if the conversation loop should end based on finish reason
 * Used in Careti mode for proper loop termination
 *
 * @param finishReason - The finish reason from the API
 * @param didToolUse - Whether the assistant used any tools in this turn
 * @param consecutiveMistakeCount - Number of consecutive non-tool responses (unused in Careti mode)
 * @returns true if the loop should terminate
 */
export function shouldEndLoopByFinishReason(
	finishReason: string | undefined | null,
	didToolUse: boolean,
	_consecutiveMistakeCount: number,
): boolean {
	// If max tokens reached, should end (context needs management)
	if (isMaxTokensReason(finishReason)) {
		return true
	}

	// CARETI MODIFICATION: If natural end (stop) and no tool use, end immediately
	// This prevents infinite loops when model responds with text only
	// (e.g., GLM-4.7 responding to "대화하자" without using ask_followup_question)
	// Note: This is only called in Careti mode (checked in task/index.ts)
	if (isNaturalEndReason(finishReason) && !didToolUse) {
		return true
	}

	return false
}
