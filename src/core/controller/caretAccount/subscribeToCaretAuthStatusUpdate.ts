// CARETI MODIFICATION: gRPC handler for subscribing to Careti auth status updates

import { CaretiAuthService } from "@careti/services/auth/CaretiAuthService"
import { Controller } from "@core/controller"
import * as proto from "@shared/proto/index"
import { StreamingResponseHandler } from "@/core/controller/grpc-handler"

/**
 * Subscribe to Careti Auth0 authentication status updates
 * Streams auth state changes to WebView
 */
export async function subscribeToCaretAuthStatusUpdate(
	controller: Controller,
	request: proto.cline.EmptyRequest,
	responseStream: StreamingResponseHandler<proto.careti.CaretAuthState>,
	_requestId?: string,
): Promise<void> {
	// Delegate to CaretiAuthService so we stream real auth state (user info, logout, refresh)
	return CaretiAuthService.getInstance(controller).subscribeToAuthStatusUpdate(controller, request, responseStream, _requestId)
}
