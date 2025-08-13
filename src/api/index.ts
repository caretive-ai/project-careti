// CARET MODIFICATION: Added debug logging for API provider selection and configuration tracking. Original backed up as index-ts.cline
import { Anthropic } from "@anthropic-ai/sdk"
import { ApiConfiguration, ModelInfo } from "../shared/api"
import { AnthropicHandler } from "./providers/anthropic"
import { AwsBedrockHandler } from "./providers/bedrock"
import { OpenRouterHandler } from "./providers/openrouter"
import { VertexHandler } from "./providers/vertex"
import { OpenAiHandler } from "./providers/openai"
import { OllamaHandler } from "./providers/ollama"
import { LmStudioHandler } from "./providers/lmstudio"
import { GeminiHandler } from "./providers/gemini"
import { OpenAiNativeHandler } from "./providers/openai-native"
import { ApiStream, ApiStreamUsageChunk } from "./transform/stream"
import { DeepSeekHandler } from "./providers/deepseek"
import { RequestyHandler } from "./providers/requesty"
import { TogetherHandler } from "./providers/together"
import { NebiusHandler } from "./providers/nebius"
import { QwenHandler } from "./providers/qwen"
import { MistralHandler } from "./providers/mistral"
import { DoubaoHandler } from "./providers/doubao"
import { VsCodeLmHandler } from "./providers/vscode-lm"
// CARET MODIFICATION: Updated to use Caret provider instead of Cline
import { CaretHandler as ClineHandler } from "./providers/caret"
import { LiteLlmHandler } from "./providers/litellm"
import { FireworksHandler } from "./providers/fireworks"
import { AskSageHandler } from "./providers/asksage"
import { XAIHandler } from "./providers/xai"
import { SambanovaHandler } from "./providers/sambanova"
import { CerebrasHandler } from "./providers/cerebras"
import { SapAiCoreHandler } from "./providers/sapaicore"
import { Logger } from "@services/logging/Logger"

export interface ApiHandler {
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
	getModel(): { id: string; info: ModelInfo }
	getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>
}

export interface SingleCompletionHandler {
	completePrompt(prompt: string): Promise<string>
}

export function buildApiHandler(configuration: ApiConfiguration): ApiHandler {
	const { apiProvider, ...options } = configuration

	// CARET MODIFICATION: Debug logging to track API provider selection and parameters
	Logger.debug("[API] ==================== API HANDLER BUILD ====================")
	Logger.debug(`[API] Selected API Provider: "${apiProvider}"`)
	Logger.debug(`[API] Full Configuration: ${JSON.stringify(configuration, null, 2)}`)
	Logger.debug(`[API] Provider-specific options: ${JSON.stringify(options, null, 2)}`)

	// Log specific API keys to see what's available
	Logger.debug("[API] API Keys Status:")
	Logger.debug(`[API]   - anthropic apiKey: ${options.apiKey ? "SET" : "NOT SET"}`)
	Logger.debug(`[API]   - openRouter apiKey: ${options.openRouterApiKey ? "SET" : "NOT SET"}`)
	Logger.debug(`[API]   - openAI apiKey: ${options.openAiApiKey ? "SET" : "NOT SET"}`)
	Logger.debug(`[API]   - gemini apiKey: ${options.geminiApiKey ? "SET" : "NOT SET"}`)
	Logger.debug(`[API]   - caret apiKey: ${options.caretApiKey ? "SET" : "NOT SET"}`)
	Logger.debug("[API] ===========================================================")

	switch (apiProvider) {
		case "anthropic":
			Logger.debug("[API] Creating AnthropicHandler")
			return new AnthropicHandler(options)
		case "openrouter":
			Logger.debug(`[API] Creating OpenRouterHandler with key: ${options.openRouterApiKey ? "SET" : "NOT SET"}`)
			return new OpenRouterHandler(options)
		case "bedrock":
			Logger.debug("[API] Creating AwsBedrockHandler")
			return new AwsBedrockHandler(options)
		case "vertex":
			Logger.debug("[API] Creating VertexHandler")
			return new VertexHandler(options)
		case "openai":
			Logger.debug("[API] Creating OpenAiHandler")
			return new OpenAiHandler(options)
		case "ollama":
			Logger.debug("[API] Creating OllamaHandler")
			return new OllamaHandler(options)
		case "lmstudio":
			Logger.debug("[API] Creating LmStudioHandler")
			return new LmStudioHandler(options)
		case "gemini":
			Logger.debug("[API] Creating GeminiHandler")
			return new GeminiHandler(options)
		case "openai-native":
			Logger.debug("[API] Creating OpenAiNativeHandler")
			return new OpenAiNativeHandler(options)
		case "deepseek":
			Logger.debug("[API] Creating DeepSeekHandler")
			return new DeepSeekHandler(options)
		case "requesty":
			Logger.debug("[API] Creating RequestyHandler")
			return new RequestyHandler(options)
		case "fireworks":
			Logger.debug("[API] Creating FireworksHandler")
			return new FireworksHandler(options)
		case "together":
			Logger.debug("[API] Creating TogetherHandler")
			return new TogetherHandler(options)
		case "qwen":
			Logger.debug("[API] Creating QwenHandler")
			return new QwenHandler({
				...options,
				qwenApiLine: options.qwenApiLine as any, // Type cast for compatibility
			})
		case "doubao":
			Logger.debug("[API] Creating DoubaoHandler")
			return new DoubaoHandler(options)
		case "mistral":
			Logger.debug("[API] Creating MistralHandler")
			return new MistralHandler(options)
		case "vscode-lm":
			Logger.debug("[API] Creating VsCodeLmHandler")
			return new VsCodeLmHandler(options)
		case "caret":
			Logger.debug("[API] Creating CaretHandler")
			return new ClineHandler(options)
		case "litellm":
			Logger.debug("[API] Creating LiteLlmHandler")
			return new LiteLlmHandler(options)
		case "nebius":
			Logger.debug("[API] Creating NebiusHandler")
			return new NebiusHandler(options)
		case "asksage":
			Logger.debug("[API] Creating AskSageHandler")
			return new AskSageHandler(options)
		case "xai":
			Logger.debug("[API] Creating XAIHandler")
			return new XAIHandler(options)
		case "sambanova":
			Logger.debug("[API] Creating SambanovaHandler")
			return new SambanovaHandler(options)
		case "cerebras":
			Logger.debug("[API] Creating CerebrasHandler")
			return new CerebrasHandler(options)
		case "sapaicore":
			Logger.debug("[API] Creating SapAiCoreHandler")
			return new SapAiCoreHandler(options)
		default:
			Logger.warn(`[API] ⚠️  Unknown provider "${apiProvider}", falling back to AnthropicHandler`)
			return new AnthropicHandler(options)
	}
}
