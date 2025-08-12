import { Controller } from "../index"
import { EmptyRequest } from "../../../shared/proto/common"
import { AuthState } from "../../../shared/proto/account"
import { StreamingResponseHandler, getRequestRegistry } from "../grpc-handler"

// Keep track of active auth status subscriptions
const activeAuthStatusSubscriptions = new Set<StreamingResponseHandler>()

/**
 * Subscribe to auth status update events (when authentication state changes)
 *
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToAuthStatusUpdate(
	controller: Controller,
	request: EmptyRequest,
	responseStream: StreamingResponseHandler,
	requestId?: string,
): Promise<void> {
	// Add this subscription to the active subscriptions
	activeAuthStatusSubscriptions.add(responseStream)

	// Register cleanup when the connection is closed
	const cleanup = () => {
		activeAuthStatusSubscriptions.delete(responseStream)
	}

	// Register the cleanup function with the request registry if we have a requestId
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "authStatus_subscription" }, responseStream)
	}

	// Send initial auth state
	try {
		const accountService = controller.getCaretAccountService()
		if (accountService) {
			const authState = await accountService.getAuthState()
			if (authState) {
				await responseStream(authState, false)
			}
		}
	} catch (error) {
		console.error("Error sending initial auth state:", error)
	}
}

/**
 * Send an auth status update event to all active subscribers
 * @param authState The auth state to broadcast
 */
export async function sendAuthStatusUpdateEvent(authState: AuthState): Promise<void> {
	// Send the event to all active subscribers
	const promises = Array.from(activeAuthStatusSubscriptions).map(async (responseStream) => {
		try {
			await responseStream(authState, false)
		} catch (error) {
			console.error("Error sending auth status update event:", error)
			// Remove the subscription if there was an error
			activeAuthStatusSubscriptions.delete(responseStream)
		}
	})

	await Promise.all(promises)
}
