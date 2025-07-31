// CARET MODIFICATION: Removed debugging logs for Gemini API validation (백업: validate-ts.cline)
import { ApiConfiguration, openRouterDefaultModelId, ModelInfo } from "@shared/api"
import { t } from "@/caret/utils/i18n"
import { SupportedLanguage } from "@/caret/constants/urls"

export function validateApiConfiguration(
	apiConfiguration?: ApiConfiguration,
	language: SupportedLanguage = "en",
): string | undefined {
	if (apiConfiguration) {
		switch (apiConfiguration.apiProvider) {
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
	apiConfiguration?: ApiConfiguration,
	openRouterModels?: Record<string, ModelInfo>,
	language: SupportedLanguage = "en",
): string | undefined {
	if (apiConfiguration) {
		switch (apiConfiguration.apiProvider) {
			case "openrouter":
			case "cline":
				const modelId = apiConfiguration.openRouterModelId || openRouterDefaultModelId // in case the user hasn't changed the model id, it will be undefined by default
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
