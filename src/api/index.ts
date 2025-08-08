// CARET MODIFICATION: Merged with upstream/main. Adopted new mode-based API handler structure.
// Integrated Caret's extensive logging and ensured 'caret' provider is used instead of 'cline'.
import { Anthropic } from "@anthropic-ai/sdk"
import { ApiConfiguration, ModelInfo, QwenApiRegions } from "../shared/api"
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
import { CaretHandler } from "./providers/caret"
import { LiteLlmHandler } from "./providers/litellm"
import { FireworksHandler } from "./providers/fireworks"
import { AskSageHandler } from "./providers/asksage"
import { XAIHandler } from "./providers/xai"
import { SambanovaHandler } from "./providers/sambanova"
import { CerebrasHandler } from "./providers/cerebras"
import { SapAiCoreHandler } from "./providers/sapaicore"
import { Logger } from "@services/logging/Logger"
import { ClaudeCodeHandler } from "./providers/claude-code"
import { MoonshotHandler } from "./providers/moonshot"
import { GroqHandler } from "./providers/groq"
import { Mode } from "@shared/storage/types"
import { HuggingFaceHandler } from "./providers/huggingface"
import { HuaweiCloudMaaSHandler } from "./providers/huawei-cloud-maas"
import { BasetenHandler } from "./providers/baseten"

export interface ApiHandler {
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
	getModel(): { id: string; info: ModelInfo }
	getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>
}

export interface SingleCompletionHandler {
	completePrompt(prompt: string): Promise<string>
}

function createHandlerForProvider(
	apiProvider: string | undefined,
	options: Omit<ApiConfiguration, "apiProvider">,
	mode: Mode,
): ApiHandler {
	switch (apiProvider) {
		case "anthropic":
			return new AnthropicHandler({
				apiKey: options.apiKey,
				anthropicBaseUrl: options.anthropicBaseUrl,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
			})
		case "openrouter":
			return new OpenRouterHandler({
				openRouterApiKey: options.openRouterApiKey,
				openRouterModelId: mode === "plan" ? options.planModeOpenRouterModelId : options.actModeOpenRouterModelId,
				openRouterModelInfo: mode === "plan" ? options.planModeOpenRouterModelInfo : options.actModeOpenRouterModelInfo,
				openRouterProviderSorting: options.openRouterProviderSorting,
				reasoningEffort: mode === "plan" ? options.planModeReasoningEffort : options.actModeReasoningEffort,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
			})
		case "bedrock":
			return new AwsBedrockHandler({
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
				awsAccessKey: options.awsAccessKey,
				awsSecretKey: options.awsSecretKey,
				awsSessionToken: options.awsSessionToken,
				awsRegion: options.awsRegion,
				awsAuthentication: options.awsAuthentication,
				awsBedrockApiKey: options.awsBedrockApiKey,
				awsUseCrossRegionInference: options.awsUseCrossRegionInference,
				awsBedrockUsePromptCache: options.awsBedrockUsePromptCache,
				awsUseProfile: options.awsUseProfile,
				awsProfile: options.awsProfile,
				awsBedrockEndpoint: options.awsBedrockEndpoint,
				awsBedrockCustomSelected:
					mode === "plan" ? options.planModeAwsBedrockCustomSelected : options.actModeAwsBedrockCustomSelected,
				awsBedrockCustomModelBaseId:
					mode === "plan" ? options.planModeAwsBedrockCustomModelBaseId : options.actModeAwsBedrockCustomModelBaseId,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
			})
		case "vertex":
			return new VertexHandler({
				vertexProjectId: options.vertexProjectId,
				vertexRegion: options.vertexRegion,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
				geminiApiKey: options.geminiApiKey,
				geminiBaseUrl: options.geminiBaseUrl,
				taskId: options.taskId,
			})
		case "openai":
			return new OpenAiHandler({
				openAiApiKey: options.openAiApiKey,
				openAiBaseUrl: options.openAiBaseUrl,
				azureApiVersion: options.azureApiVersion,
				openAiHeaders: options.openAiHeaders,
				openAiModelId: mode === "plan" ? options.planModeOpenAiModelId : options.actModeOpenAiModelId,
				openAiModelInfo: mode === "plan" ? options.planModeOpenAiModelInfo : options.actModeOpenAiModelInfo,
				reasoningEffort: mode === "plan" ? options.planModeReasoningEffort : options.actModeReasoningEffort,
			})
		case "ollama":
			return new OllamaHandler({
				ollamaBaseUrl: options.ollamaBaseUrl,
				ollamaModelId: mode === "plan" ? options.planModeOllamaModelId : options.actModeOllamaModelId,
				ollamaApiOptionsCtxNum: options.ollamaApiOptionsCtxNum,
				requestTimeoutMs: options.requestTimeoutMs,
			})
		case "lmstudio":
			return new LmStudioHandler({
				lmStudioBaseUrl: options.lmStudioBaseUrl,
				lmStudioModelId: mode === "plan" ? options.planModeLmStudioModelId : options.actModeLmStudioModelId,
			})
		case "gemini":
			return new GeminiHandler({
				vertexProjectId: options.vertexProjectId,
				vertexRegion: options.vertexRegion,
				geminiApiKey: options.geminiApiKey,
				geminiBaseUrl: options.geminiBaseUrl,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
				taskId: options.taskId,
			})
		case "openai-native":
			return new OpenAiNativeHandler({
				openAiNativeApiKey: options.openAiNativeApiKey,
				reasoningEffort: mode === "plan" ? options.planModeReasoningEffort : options.actModeReasoningEffort,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "deepseek":
			return new DeepSeekHandler({
				deepSeekApiKey: options.deepSeekApiKey,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "requesty":
			return new RequestyHandler({
				requestyApiKey: options.requestyApiKey,
				reasoningEffort: mode === "plan" ? options.planModeReasoningEffort : options.actModeReasoningEffort,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
				requestyModelId: mode === "plan" ? options.planModeRequestyModelId : options.actModeRequestyModelId,
				requestyModelInfo: mode === "plan" ? options.planModeRequestyModelInfo : options.actModeRequestyModelInfo,
			})
		case "fireworks":
			return new FireworksHandler({
				fireworksApiKey: options.fireworksApiKey,
				fireworksModelId: mode === "plan" ? options.planModeFireworksModelId : options.actModeFireworksModelId,
				fireworksModelMaxCompletionTokens: options.fireworksModelMaxCompletionTokens,
				fireworksModelMaxTokens: options.fireworksModelMaxTokens,
			})
		case "together":
			return new TogetherHandler({
				togetherApiKey: options.togetherApiKey,
				togetherModelId: mode === "plan" ? options.planModeTogetherModelId : options.actModeTogetherModelId,
			})
		case "qwen":
			return new QwenHandler({
				qwenApiKey: options.qwenApiKey,
				qwenApiLine:
					options.qwenApiLine === QwenApiRegions.INTERNATIONAL ? QwenApiRegions.INTERNATIONAL : QwenApiRegions.CHINA,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
			})
		case "doubao":
			return new DoubaoHandler({
				doubaoApiKey: options.doubaoApiKey,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "mistral":
			return new MistralHandler({
				mistralApiKey: options.mistralApiKey,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "vscode-lm":
			return new VsCodeLmHandler({
				vsCodeLmModelSelector:
					mode === "plan" ? options.planModeVsCodeLmModelSelector : options.actModeVsCodeLmModelSelector,
			})
		// CARET MODIFICATION: Use 'caret' provider instead of 'cline'
		case "caret":
			return new CaretHandler({
				caretApiKey: options.caretApiKey,
				taskId: options.taskId,
				reasoningEffort: mode === "plan" ? options.planModeReasoningEffort : options.actModeReasoningEffort,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
				openRouterProviderSorting: options.openRouterProviderSorting,
				openRouterModelId: mode === "plan" ? options.planModeOpenRouterModelId : options.actModeOpenRouterModelId,
				openRouterModelInfo: mode === "plan" ? options.planModeOpenRouterModelInfo : options.actModeOpenRouterModelInfo,
			})
		case "litellm":
			return new LiteLlmHandler({
				liteLlmApiKey: options.liteLlmApiKey,
				liteLlmBaseUrl: options.liteLlmBaseUrl,
				liteLlmModelId: mode === "plan" ? options.planModeLiteLlmModelId : options.actModeLiteLlmModelId,
				liteLlmModelInfo: mode === "plan" ? options.planModeLiteLlmModelInfo : options.actModeLiteLlmModelInfo,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
				liteLlmUsePromptCache: options.liteLlmUsePromptCache,
				taskId: options.taskId,
			})
		case "moonshot":
			return new MoonshotHandler({
				moonshotApiKey: options.moonshotApiKey,
				moonshotApiLine: options.moonshotApiLine,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "huggingface":
			return new HuggingFaceHandler({
				huggingFaceApiKey: options.huggingFaceApiKey,
				huggingFaceModelId: mode === "plan" ? options.planModeHuggingFaceModelId : options.actModeHuggingFaceModelId,
				huggingFaceModelInfo:
					mode === "plan" ? options.planModeHuggingFaceModelInfo : options.actModeHuggingFaceModelInfo,
			})
		case "nebius":
			return new NebiusHandler({
				nebiusApiKey: options.nebiusApiKey,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "asksage":
			return new AskSageHandler({
				asksageApiKey: options.asksageApiKey,
				asksageApiUrl: options.asksageApiUrl,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "xai":
			return new XAIHandler({
				xaiApiKey: options.xaiApiKey,
				reasoningEffort: mode === "plan" ? options.planModeReasoningEffort : options.actModeReasoningEffort,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "sambanova":
			return new SambanovaHandler({
				sambanovaApiKey: options.sambanovaApiKey,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "cerebras":
			return new CerebrasHandler({
				cerebrasApiKey: options.cerebrasApiKey,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "groq":
			return new GroqHandler({
				groqApiKey: options.groqApiKey,
				groqModelId: mode === "plan" ? options.planModeGroqModelId : options.actModeGroqModelId,
				groqModelInfo: mode === "plan" ? options.planModeGroqModelInfo : options.actModeGroqModelInfo,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "baseten":
			return new BasetenHandler({
				basetenApiKey: options.basetenApiKey,
				basetenModelId: mode === "plan" ? options.planModeBasetenModelId : options.actModeBasetenModelId,
				basetenModelInfo: mode === "plan" ? options.planModeBasetenModelInfo : options.actModeBasetenModelInfo,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "sapaicore":
			return new SapAiCoreHandler({
				sapAiCoreClientId: options.sapAiCoreClientId,
				sapAiCoreClientSecret: options.sapAiCoreClientSecret,
				sapAiCoreTokenUrl: options.sapAiCoreTokenUrl,
				sapAiResourceGroup: options.sapAiResourceGroup,
				sapAiCoreBaseUrl: options.sapAiCoreBaseUrl,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
			})
		case "claude-code":
			return new ClaudeCodeHandler({
				claudeCodePath: options.claudeCodePath,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
			})
		case "huawei-cloud-maas":
			return new HuaweiCloudMaaSHandler({
				huaweiCloudMaasApiKey: options.huaweiCloudMaasApiKey,
				huaweiCloudMaasModelId:
					mode === "plan" ? options.planModeHuaweiCloudMaasModelId : options.actModeHuaweiCloudMaasModelId,
				huaweiCloudMaasModelInfo:
					mode === "plan" ? options.planModeHuaweiCloudMaasModelInfo : options.actModeHuaweiCloudMaasModelInfo,
			})
		default:
			return new AnthropicHandler({
				apiKey: options.apiKey,
				anthropicBaseUrl: options.anthropicBaseUrl,
				apiModelId: mode === "plan" ? options.planModeApiModelId : options.actModeApiModelId,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
			})
	}
}

export function buildApiHandler(configuration: ApiConfiguration, mode: Mode): ApiHandler {
	// CARET MODIFICATION: Start
	// This block normalizes the configuration for Caret's dual-mode architecture.
	// It maps Caret's 'chatbot' and 'agent' modes to Cline's 'plan' and 'act' modes respectively,
	// ensuring that the rest of the function can operate without modification.
	const tempOptions: any = { ...configuration }
	let effectiveMode: "plan" | "act"
	let apiProvider: string | undefined

	if (mode === "chatbot") {
		effectiveMode = "plan"
		apiProvider = tempOptions.chatbotModeApiProvider
		tempOptions.planModeApiProvider = tempOptions.chatbotModeApiProvider
		tempOptions.planModeApiModelId = tempOptions.chatbotModeApiModelId
		tempOptions.planModeThinkingBudgetTokens = tempOptions.chatbotModeThinkingBudgetTokens
		tempOptions.planModeReasoningEffort = tempOptions.chatbotModeReasoningEffort
		tempOptions.planModeVsCodeLmModelSelector = tempOptions.chatbotModeVsCodeLmModelSelector
		tempOptions.planModeAwsBedrockCustomSelected = tempOptions.chatbotModeAwsBedrockCustomSelected
		tempOptions.planModeAwsBedrockCustomModelBaseId = tempOptions.chatbotModeAwsBedrockCustomModelBaseId
		tempOptions.planModeOpenRouterModelId = tempOptions.chatbotModeOpenRouterModelId
		tempOptions.planModeOpenRouterModelInfo = tempOptions.chatbotModeOpenRouterModelInfo
		tempOptions.planModeOpenAiModelId = tempOptions.chatbotModeOpenAiModelId
		tempOptions.planModeOpenAiModelInfo = tempOptions.chatbotModeOpenAiModelInfo
		tempOptions.planModeOllamaModelId = tempOptions.chatbotModeOllamaModelId
		tempOptions.planModeLmStudioModelId = tempOptions.chatbotModeLmStudioModelId
		tempOptions.planModeLiteLlmModelId = tempOptions.chatbotModeLiteLlmModelId
		tempOptions.planModeLiteLlmModelInfo = tempOptions.chatbotModeLiteLlmModelInfo
		tempOptions.planModeRequestyModelId = tempOptions.chatbotModeRequestyModelId
		tempOptions.planModeRequestyModelInfo = tempOptions.chatbotModeRequestyModelInfo
		tempOptions.planModeTogetherModelId = tempOptions.chatbotModeTogetherModelId
		tempOptions.planModeFireworksModelId = tempOptions.chatbotModeFireworksModelId
		tempOptions.planModeSapAiCoreModelId = tempOptions.chatbotModeSapAiCoreModelId
		tempOptions.planModeGroqModelId = tempOptions.chatbotModeGroqModelId
		tempOptions.planModeGroqModelInfo = tempOptions.chatbotModeGroqModelInfo
		tempOptions.planModeBasetenModelId = tempOptions.chatbotModeBasetenModelId
		tempOptions.planModeBasetenModelInfo = tempOptions.chatbotModeBasetenModelInfo
		tempOptions.planModeHuggingFaceModelId = tempOptions.chatbotModeHuggingFaceModelId
		tempOptions.planModeHuggingFaceModelInfo = tempOptions.chatbotModeHuggingFaceModelInfo
		tempOptions.planModeHuaweiCloudMaasModelId = tempOptions.chatbotModeHuaweiCloudMaasModelId
		tempOptions.planModeHuaweiCloudMaasModelInfo = tempOptions.chatbotModeHuaweiCloudMaasModelInfo
	} else if (mode === "agent") {
		effectiveMode = "act"
		apiProvider = tempOptions.agentModeApiProvider
		tempOptions.actModeApiProvider = tempOptions.agentModeApiProvider
		tempOptions.actModeApiModelId = tempOptions.agentModeApiModelId
		tempOptions.actModeThinkingBudgetTokens = tempOptions.agentModeThinkingBudgetTokens
		tempOptions.actModeReasoningEffort = tempOptions.agentModeReasoningEffort
		tempOptions.actModeVsCodeLmModelSelector = tempOptions.agentModeVsCodeLmModelSelector
		tempOptions.actModeAwsBedrockCustomSelected = tempOptions.agentModeAwsBedrockCustomSelected
		tempOptions.actModeAwsBedrockCustomModelBaseId = tempOptions.agentModeAwsBedrockCustomModelBaseId
		tempOptions.actModeOpenRouterModelId = tempOptions.agentModeOpenRouterModelId
		tempOptions.actModeOpenRouterModelInfo = tempOptions.agentModeOpenRouterModelInfo
		tempOptions.actModeOpenAiModelId = tempOptions.agentModeOpenAiModelId
		tempOptions.actModeOpenAiModelInfo = tempOptions.agentModeOpenAiModelInfo
		tempOptions.actModeOllamaModelId = tempOptions.agentModeOllamaModelId
		tempOptions.actModeLmStudioModelId = tempOptions.agentModeLmStudioModelId
		tempOptions.actModeLiteLlmModelId = tempOptions.agentModeLiteLlmModelId
		tempOptions.actModeLiteLlmModelInfo = tempOptions.agentModeLiteLlmModelInfo
		tempOptions.actModeRequestyModelId = tempOptions.agentModeRequestyModelId
		tempOptions.actModeRequestyModelInfo = tempOptions.agentModeRequestyModelInfo
		tempOptions.actModeTogetherModelId = tempOptions.agentModeTogetherModelId
		tempOptions.actModeFireworksModelId = tempOptions.agentModeFireworksModelId
		tempOptions.actModeSapAiCoreModelId = tempOptions.agentModeSapAiCoreModelId
		tempOptions.actModeGroqModelId = tempOptions.agentModeGroqModelId
		tempOptions.actModeGroqModelInfo = tempOptions.agentModeGroqModelInfo
		tempOptions.actModeBasetenModelId = tempOptions.agentModeBasetenModelId
		tempOptions.actModeBasetenModelInfo = tempOptions.agentModeBasetenModelInfo
		tempOptions.actModeHuggingFaceModelId = tempOptions.agentModeHuggingFaceModelId
		tempOptions.actModeHuggingFaceModelInfo = tempOptions.agentModeHuggingFaceModelInfo
		tempOptions.actModeHuaweiCloudMaasModelId = tempOptions.agentModeHuaweiCloudMaasModelId
		tempOptions.actModeHuaweiCloudMaasModelInfo = tempOptions.agentModeHuaweiCloudMaasModelInfo
	} else {
		effectiveMode = mode
		apiProvider = mode === "plan" ? tempOptions.planModeApiProvider : tempOptions.actModeApiProvider
	}

	const {
		planModeApiProvider,
		actModeApiProvider,
		chatbotModeApiProvider,
		agentModeApiProvider,
		...options
	} = tempOptions
	// CARET MODIFICATION: End

	// CARET MODIFICATION: Debug logging to track API provider selection and parameters
	Logger.debug("[API] ==================== API HANDLER BUILD ====================")
	Logger.debug(`[API] Current Mode: "${mode}", Effective Mode: "${effectiveMode}"`)
	Logger.debug(`[API] Selected API Provider: "${apiProvider}"`)
	Logger.debug(`[API] Full Configuration: ${JSON.stringify(configuration, null, 2)}`)

	// Validate thinking budget tokens against model's maxTokens to prevent API errors
	// wrapped in a try-catch for safety, but this should never throw
	try {
		const thinkingBudgetTokens =
			effectiveMode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens
		if (thinkingBudgetTokens && thinkingBudgetTokens > 0) {
			const handler = createHandlerForProvider(apiProvider, options, effectiveMode)

			const modelInfo = handler.getModel().info
			if (modelInfo.maxTokens && thinkingBudgetTokens > modelInfo.maxTokens) {
				const clippedValue = modelInfo.maxTokens - 1
				if (effectiveMode === "plan") {
					options.planModeThinkingBudgetTokens = clippedValue
				} else {
					options.actModeThinkingBudgetTokens = clippedValue
				}
			} else {
				return handler // don't rebuild unless its necessary
			}
		}
	} catch (error) {
		console.error("buildApiHandler error:", error)
	}

	return createHandlerForProvider(apiProvider, options, effectiveMode)
}
