import type { ApiConfiguration } from "@shared/api"
import { Empty } from "@shared/proto/cline/common"
import { UpdateApiConfigurationRequest } from "@shared/proto/cline/models"
import { convertProtoToApiProvider } from "@shared/proto-conversions/models/api-configuration-conversion"
import {
	fromProtobufLiteLLMModelInfo,
	fromProtobufModelInfo,
	fromProtobufOcaModelInfo,
	fromProtobufOpenAiCompatibleModelInfo,
} from "@shared/proto-conversions/models/typeConversion"
import { buildApiHandler } from "@/core/api"
import type { Controller } from "../index"

/**
 * Updates API configuration
 * @param controller The controller instance
 * @param request The update API configuration request
 * @returns Empty response
 */
export async function updateApiConfigurationProto(
	controller: Controller,
	request: UpdateApiConfigurationRequest,
): Promise<Empty> {
	try {
		if (!request.apiConfiguration) {
			console.log("[APICONFIG: updateApiConfigurationProto] API configuration is required")
			throw new Error("API configuration is required")
		}

		const protoApiConfiguration = request.apiConfiguration

		const convertedApiConfigurationFromProto = {
			...protoApiConfiguration,
			// Convert proto ApiProvider enums to native string types
			planModeApiProvider:
				protoApiConfiguration.planModeApiProvider !== undefined
					? convertProtoToApiProvider(protoApiConfiguration.planModeApiProvider!)
					: undefined,
			actModeApiProvider:
				protoApiConfiguration.actModeApiProvider !== undefined
					? convertProtoToApiProvider(protoApiConfiguration.actModeApiProvider!)
					: undefined,

			// Convert ModelInfo objects (empty arrays → undefined)
			// Plan Mode
			planModeOpenRouterModelInfo: protoApiConfiguration.planModeOpenRouterModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.planModeOpenRouterModelInfo)
				: undefined,
			planModeOpenAiModelInfo: protoApiConfiguration.planModeOpenAiModelInfo
				? fromProtobufOpenAiCompatibleModelInfo(protoApiConfiguration.planModeOpenAiModelInfo)
				: undefined,
			planModeHuggingFaceModelInfo: protoApiConfiguration.planModeHuggingFaceModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.planModeHuggingFaceModelInfo)
				: undefined,
			planModeLiteLlmModelInfo: protoApiConfiguration.planModeLiteLlmModelInfo
				? fromProtobufLiteLLMModelInfo(protoApiConfiguration.planModeLiteLlmModelInfo)
				: undefined,
			planModeRequestyModelInfo: protoApiConfiguration.planModeRequestyModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.planModeRequestyModelInfo)
				: undefined,
			planModeGroqModelInfo: protoApiConfiguration.planModeGroqModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.planModeGroqModelInfo)
				: undefined,
			planModeHuaweiCloudMaasModelInfo: protoApiConfiguration.planModeHuaweiCloudMaasModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.planModeHuaweiCloudMaasModelInfo)
				: undefined,
			planModeBasetenModelInfo: protoApiConfiguration.planModeBasetenModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.planModeBasetenModelInfo)
				: undefined,
			planModeVercelAiGatewayModelInfo: protoApiConfiguration.planModeVercelAiGatewayModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.planModeVercelAiGatewayModelInfo)
				: undefined,
			planModeOcaModelInfo: protoApiConfiguration.planModeOcaModelInfo
				? fromProtobufOcaModelInfo(protoApiConfiguration.planModeOcaModelInfo)
				: undefined,
			planModeAihubmixModelInfo: protoApiConfiguration.planModeAihubmixModelInfo
				? fromProtobufOpenAiCompatibleModelInfo(protoApiConfiguration.planModeAihubmixModelInfo)
				: undefined,

			// Act Mode
			actModeOpenRouterModelInfo: protoApiConfiguration.actModeOpenRouterModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.actModeOpenRouterModelInfo)
				: undefined,
			actModeOpenAiModelInfo: protoApiConfiguration.actModeOpenAiModelInfo
				? fromProtobufOpenAiCompatibleModelInfo(protoApiConfiguration.actModeOpenAiModelInfo)
				: undefined,
			actModeLiteLlmModelInfo: protoApiConfiguration.actModeLiteLlmModelInfo
				? fromProtobufLiteLLMModelInfo(protoApiConfiguration.actModeLiteLlmModelInfo)
				: undefined,
			actModeRequestyModelInfo: protoApiConfiguration.actModeRequestyModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.actModeRequestyModelInfo)
				: undefined,
			actModeGroqModelInfo: protoApiConfiguration.actModeGroqModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.actModeGroqModelInfo)
				: undefined,
			actModeHuggingFaceModelInfo: protoApiConfiguration.actModeHuggingFaceModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.actModeHuggingFaceModelInfo)
				: undefined,
			actModeHuaweiCloudMaasModelInfo: protoApiConfiguration.actModeHuaweiCloudMaasModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.actModeHuaweiCloudMaasModelInfo)
				: undefined,
			actModeBasetenModelInfo: protoApiConfiguration.actModeBasetenModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.actModeBasetenModelInfo)
				: undefined,
			actModeVercelAiGatewayModelInfo: protoApiConfiguration.actModeVercelAiGatewayModelInfo
				? fromProtobufModelInfo(protoApiConfiguration.actModeVercelAiGatewayModelInfo)
				: undefined,
			actModeOcaModelInfo: protoApiConfiguration.actModeOcaModelInfo
				? fromProtobufOcaModelInfo(protoApiConfiguration.actModeOcaModelInfo)
				: undefined,
			actModeAihubmixModelInfo: protoApiConfiguration.actModeAihubmixModelInfo
				? fromProtobufOpenAiCompatibleModelInfo(protoApiConfiguration.actModeAihubmixModelInfo)
				: undefined,
		}

		const existingApiConfiguration = controller.stateManager.getApiConfiguration()
		const mergedApiConfiguration: ApiConfiguration = { ...(convertedApiConfigurationFromProto as ApiConfiguration) }

		// CARET MODIFICATION: Preserve Caret auth/session fields when proto payload omits them
		if (mergedApiConfiguration.caretUserProfile === undefined && existingApiConfiguration?.caretUserProfile !== undefined) {
			mergedApiConfiguration.caretUserProfile = existingApiConfiguration.caretUserProfile
		}
		if (mergedApiConfiguration.caretApiKey === undefined && existingApiConfiguration?.caretApiKey !== undefined) {
			mergedApiConfiguration.caretApiKey = existingApiConfiguration.caretApiKey
		}
		if (mergedApiConfiguration.caretAuthToken === undefined && existingApiConfiguration?.caretAuthToken !== undefined) {
			mergedApiConfiguration.caretAuthToken = existingApiConfiguration.caretAuthToken
		}
		if (mergedApiConfiguration.caretBaseUrl === undefined && existingApiConfiguration?.caretBaseUrl !== undefined) {
			mergedApiConfiguration.caretBaseUrl = existingApiConfiguration.caretBaseUrl
		}

		// CARET MODIFICATION: Add logging for API configuration updates
		console.log("🔧 [Backend] API Config Update:", {
			planProvider: mergedApiConfiguration.planModeApiProvider,
			actProvider: mergedApiConfiguration.actModeApiProvider,
			hasApiKey: !!mergedApiConfiguration.apiKey,
			ocaKey: (mergedApiConfiguration as any).ocaApiKey ? "***SET***" : "not set",
		})

		// Update the API configuration in storage
		controller.stateManager.setApiConfiguration(mergedApiConfiguration)

		// Update the task's API handler if there's an active task
		if (controller.task) {
			const currentMode = controller.stateManager.getGlobalSettingsKey("mode")
			controller.task.api = buildApiHandler({ ...mergedApiConfiguration, ulid: controller.task.ulid }, currentMode)
		}

		// Post updated state to webview
		await controller.postStateToWebview()

		// CARET MODIFICATION: Log final state for verification
		const finalState = controller.stateManager.getApiConfiguration()
		console.log("✅ [Backend] Final stored state:", {
			planProvider: finalState?.planModeApiProvider,
			actProvider: finalState?.actModeApiProvider,
			apiKey: finalState?.apiKey ? "***STORED***" : "not stored",
		})

		return Empty.create()
	} catch (error) {
		console.error(`Failed to update API configuration: ${error}`)
		throw error
	}
}
