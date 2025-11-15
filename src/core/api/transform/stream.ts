export type ApiStream = AsyncGenerator<ApiStreamChunk>
export type ApiStreamChunk =
	| ApiStreamTextChunk
	| ApiStreamReasoningChunk
	| ApiStreamReasoningDetailsChunk
	| ApiStreamAnthropicThinkingChunk
	| ApiStreamAnthropicRedactedThinkingChunk
	| ApiStreamUsageChunk
	| ApiStreamToolUseChunk // CARET MODIFICATION: Support Task tool for subagent feature (F12)
	| ApiStreamToolCallsChunk // Cline v3.35.0: OpenAI-compatible tool calls format

export interface ApiStreamTextChunk {
	type: "text"
	text: string
}

export interface ApiStreamReasoningChunk {
	type: "reasoning"
	reasoning: string
}

export interface ApiStreamReasoningDetailsChunk {
	type: "reasoning_details"
	reasoning_details: any // openrouter has various properties that we can pass back unmodified in api requests to preserve reasoning traces
}

export interface ApiStreamAnthropicThinkingChunk {
	type: "ant_thinking"
	thinking: string
	signature: string
}

export interface ApiStreamAnthropicRedactedThinkingChunk {
	type: "ant_redacted_thinking"
	data: string
}

export interface ApiStreamUsageChunk {
	type: "usage"
	inputTokens: number
	outputTokens: number
	cacheWriteTokens?: number
	cacheReadTokens?: number
	thoughtsTokenCount?: number // openrouter
	totalCost?: number // openrouter
}

// CARET MODIFICATION: Support Task tool for subagent feature (F12)
export interface ApiStreamToolUseChunk {
	type: "tool_use"
	id: string
	name: string
	input: any
}

// Cline v3.35.0: OpenAI-compatible tool calls format
export interface ApiStreamToolCallsChunk {
	type: "tool_calls"
	tool_call: ApiStreamToolCall
}

export interface ApiStreamToolCall {
	call_id?: string // The call / request ID associated with this tool call
	// Information about the tool being called
	function: {
		id?: string // The tool call ID
		name?: string
		arguments?: any
	}
}
