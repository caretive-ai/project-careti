import { ApiConfiguration, ModelInfo, openRouterDefaultModelId } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { t } from "@/caret/utils/i18n"
import { getModeSpecificFields } from "@/components/settings/utils/providerUtils"

export function validateApiConfiguration(currentMode: Mode, apiConfiguration?: ApiConfiguration): string | undefined {
	if (apiConfiguration) {
		const {
			apiProvider,
			openAiModelId,
			requestyModelId,
			togetherModelId,
			ollamaModelId,
			lmStudioModelId,
			vsCodeLmModelSelector,
		} = getModeSpecificFields(apiConfiguration, currentMode)

		switch (apiProvider) {
			case "anthropic":
				if (!apiConfiguration.apiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "bedrock":
				if (!apiConfiguration.awsRegion) {
					return t("validation.region.required", "settings")
				}
				break
			case "openrouter":
				if (!apiConfiguration.openRouterApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "vertex":
				if (!apiConfiguration.vertexProjectId || !apiConfiguration.vertexRegion) {
					return t("validation.googleCloud.projectIdAndRegion", "settings")
				}
				break
			case "gemini":
				if (!apiConfiguration.geminiApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "openai-native":
				if (!apiConfiguration.openAiNativeApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "deepseek":
				if (!apiConfiguration.deepSeekApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "xai":
				if (!apiConfiguration.xaiApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "qwen":
				if (!apiConfiguration.qwenApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "doubao":
				if (!apiConfiguration.doubaoApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "mistral":
				if (!apiConfiguration.mistralApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "cline":
				break
			case "openai":
				if (!apiConfiguration.openAiBaseUrl || !apiConfiguration.openAiApiKey || !openAiModelId) {
					return t("validation.openai.baseUrlApiKeyModel", "settings")
				}
				break
			case "requesty":
				if (!apiConfiguration.requestyApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "fireworks":
				if (!apiConfiguration.fireworksApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "together":
				if (!apiConfiguration.togetherApiKey || !togetherModelId) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "ollama":
				if (!ollamaModelId) {
					return t("validation.modelId.required", "settings")
				}
				break
			case "lmstudio":
				if (!lmStudioModelId) {
					return t("validation.modelId.required", "settings")
				}
				break
			case "vscode-lm":
				if (!vsCodeLmModelSelector) {
					return t("validation.modelSelector.required", "settings")
				}
				break
			case "moonshot":
				if (!apiConfiguration.moonshotApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "nebius":
				if (!apiConfiguration.nebiusApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "asksage":
				if (!apiConfiguration.asksageApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "sambanova":
				if (!apiConfiguration.sambanovaApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "sapaicore":
				if (!apiConfiguration.sapAiCoreBaseUrl) {
					return t("validation.baseUrl.required", "settings")
				}
				if (!apiConfiguration.sapAiCoreClientId) {
					return t("validation.clientId.required", "settings")
				}
				if (!apiConfiguration.sapAiCoreClientSecret) {
					return t("validation.clientSecret.required", "settings")
				}
				if (!apiConfiguration.sapAiCoreTokenUrl) {
					return t("validation.authUrl.required", "settings")
				}
				break
			case "zai":
				if (!apiConfiguration.zaiApiKey) {
					return t("validation.apiKey.required", "settings")
				}
				break
			case "dify":
				if (!apiConfiguration.difyBaseUrl) {
					return t("validation.baseUrl.required", "settings")
				}
				if (!apiConfiguration.difyApiKey) {
					return t("validation.apiKey.required", "settings")
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
): string | undefined {
	if (apiConfiguration) {
		const { apiProvider, openRouterModelId } = getModeSpecificFields(apiConfiguration, currentMode)
		switch (apiProvider) {
			case "openrouter":
			case "cline":
				const modelId = openRouterModelId || openRouterDefaultModelId // in case the user hasn't changed the model id, it will be undefined by default
				if (!modelId) {
					return t("validation.modelId.required", "settings")
				}
				if (openRouterModels && !Object.keys(openRouterModels).includes(modelId)) {
					// even if the model list endpoint failed, extensionstatecontext will always have the default model info
					return t("validation.modelId.unavailable", "settings")
				}
				break
		}
	}
	return undefined
}
