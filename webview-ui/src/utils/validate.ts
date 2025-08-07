// CARET MODIFICATION: Removed debugging logs for Gemini API validation (백업: validate-ts.cline)
import { ApiConfiguration, openRouterDefaultModelId, ModelInfo } from "@shared/api"
<<<<<<< HEAD
import { t } from "@/caret/utils/i18n"
import { SupportedLanguage } from "@/caret/constants/urls"

export function validateApiConfiguration(
	apiConfiguration?: ApiConfiguration,
	language: SupportedLanguage = "en",
): string | undefined {
=======
import { getModeSpecificFields } from "@/components/settings/utils/providerUtils"
import { Mode } from "@shared/storage/types"

export function validateApiConfiguration(currentMode: Mode, apiConfiguration?: ApiConfiguration): string | undefined {
>>>>>>> upstream/main
	if (apiConfiguration) {
		const {
			apiProvider,
			openAiModelId,
			requestyModelId,
			fireworksModelId,
			togetherModelId,
			ollamaModelId,
			lmStudioModelId,
			vsCodeLmModelSelector,
		} = getModeSpecificFields(apiConfiguration, currentMode)

		switch (apiProvider) {
			case "anthropic":
				if (!apiConfiguration.apiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "bedrock":
				if (!apiConfiguration.awsRegion) {
					return t("invalidAwsRegion", "validate-api-conf", language)
				}
				break
			case "openrouter":
				if (!apiConfiguration.openRouterApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "vertex":
				if (!apiConfiguration.vertexProjectId || !apiConfiguration.vertexRegion) {
					return t("invalidVertexConfig", "validate-api-conf", language)
				}
				break
			case "gemini":
				if (!apiConfiguration.geminiApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "openai-native":
				if (!apiConfiguration.openAiNativeApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "deepseek":
				if (!apiConfiguration.deepSeekApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "xai":
				if (!apiConfiguration.xaiApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "qwen":
				if (!apiConfiguration.qwenApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "doubao":
				if (!apiConfiguration.doubaoApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "mistral":
				if (!apiConfiguration.mistralApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "cline":
<<<<<<< HEAD
				if (!apiConfiguration.clineApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "caret": // CARET MODIFICATION: Add Caret
				if (!apiConfiguration.caretApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "openai":
				if (!apiConfiguration.openAiBaseUrl || !apiConfiguration.openAiApiKey || !apiConfiguration.openAiModelId) {
					return t("invalidOpenAiConfig", "validate-api-conf", language)
				}
				break
			case "requesty":
				if (!apiConfiguration.requestyApiKey || !apiConfiguration.requestyModelId) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "fireworks":
				if (!apiConfiguration.fireworksApiKey || !apiConfiguration.fireworksModelId) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "together":
				if (!apiConfiguration.togetherApiKey || !apiConfiguration.togetherModelId) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "ollama":
				if (!apiConfiguration.ollamaModelId) {
					return t("invalidModelId", "validate-api-conf", language)
				}
				break
			case "lmstudio":
				if (!apiConfiguration.lmStudioModelId) {
					return t("invalidModelId", "validate-api-conf", language)
				}
				break
			case "vscode-lm":
				if (!apiConfiguration.vsCodeLmModelSelector) {
					return t("invalidModelSelector", "validate-api-conf", language)
=======
				if (!apiConfiguration.clineAccountId) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "openai":
				if (!apiConfiguration.openAiBaseUrl || !apiConfiguration.openAiApiKey || !openAiModelId) {
					return "You must provide a valid base URL, API key, and model ID."
				}
				break
			case "requesty":
				if (!apiConfiguration.requestyApiKey || !requestyModelId) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "fireworks":
				if (!apiConfiguration.fireworksApiKey || !fireworksModelId) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "together":
				if (!apiConfiguration.togetherApiKey || !togetherModelId) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "ollama":
				if (!ollamaModelId) {
					return "You must provide a valid model ID."
				}
				break
			case "lmstudio":
				if (!lmStudioModelId) {
					return "You must provide a valid model ID."
				}
				break
			case "vscode-lm":
				if (!vsCodeLmModelSelector) {
					return "You must provide a valid model selector."
>>>>>>> upstream/main
				}
				break
			case "moonshot":
				if (!apiConfiguration.moonshotApiKey) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "nebius":
				if (!apiConfiguration.nebiusApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "asksage":
				if (!apiConfiguration.asksageApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "sambanova":
				if (!apiConfiguration.sambanovaApiKey) {
					return t("invalidApiKey", "validate-api-conf", language)
				}
				break
			case "sapaicore":
				if (!apiConfiguration.sapAiCoreBaseUrl) {
					return t("invalidBaseUrl", "validate-api-conf", language)
				}
				if (!apiConfiguration.sapAiCoreClientId) {
					return t("invalidClientId", "validate-api-conf", language)
				}
				if (!apiConfiguration.sapAiCoreClientSecret) {
					return t("invalidClientSecret", "validate-api-conf", language)
				}
				if (!apiConfiguration.sapAiCoreTokenUrl) {
					return t("invalidAuthUrl", "validate-api-conf", language)
				}
				break
		}
	}
	return undefined
}

export function validateModelId(
	currentMode: Mode,
	apiConfiguration?: ApiConfiguration,
	openRouterModels?: Record<string, ModelInfo>,
	language: SupportedLanguage = "en",
): string | undefined {
	if (apiConfiguration) {
		const { apiProvider, openRouterModelId } = getModeSpecificFields(apiConfiguration, currentMode)
		switch (apiProvider) {
			case "openrouter":
			case "cline":
				const modelId = openRouterModelId || openRouterDefaultModelId // in case the user hasn't changed the model id, it will be undefined by default
				if (!modelId) {
					return t("invalidModelId", "validate-api-conf", language)
				}
				if (openRouterModels && !Object.keys(openRouterModels).includes(modelId)) {
					// even if the model list endpoint failed, extensionstatecontext will always have the default model info
					return t("modelNotAvailable", "validate-api-conf", language)
				}
				break
		}
	}
	return undefined
}
