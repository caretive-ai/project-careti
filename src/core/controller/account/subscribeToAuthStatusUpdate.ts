import { AuthService } from "../../../services/auth/AuthService"
import { Controller } from "../index"
import { EmptyRequest } from "../../../shared/proto/cline/common"
import { StreamingResponseHandler } from "../grpc-handler"
import { AuthState } from "../../../shared/proto/cline/account"

// CARET MODIFICATION: Use lazy loading to prevent early initialization issues during module loading
// Original: const authService = AuthService.getInstance()
export const subscribeToAuthStatusUpdate = (
	controller: Controller,
	request: EmptyRequest,
	responseStream: StreamingResponseHandler<AuthState>,
	requestId?: string,
) => {
	const authService = AuthService.getInstance()
	return authService.subscribeToAuthStatusUpdate(controller, request, responseStream, requestId)
}

export const sendAuthStatusUpdateEvent = () => {
	const authService = AuthService.getInstance()
	return authService.sendAuthStatusUpdate()
}
