import { EmptyRequest } from "@shared/proto/cline/common"
import { OpenRouterCompatibleModelInfo } from "@shared/proto/cline/models"
import { Controller } from ".."
import { refreshVercelAiGatewayModels } from "./refreshVercelAiGatewayModels"

/**
 * Handles protobuf conversion for gRPC service
 * @param controller The controller instance
 * @param request Empty request object
 * @returns Response containing Vercel AI Gateway models (protobuf types)
 */
export async function refreshVercelAiGatewayModelsRpc(
	controller: Controller,
	_request: EmptyRequest,
): Promise<OpenRouterCompatibleModelInfo> {
	const result = await refreshVercelAiGatewayModels(controller, _request)
	return OpenRouterCompatibleModelInfo.create(result as any)
}
