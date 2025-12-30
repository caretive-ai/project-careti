// CARET MODIFICATION: Stream tool image events with Logger-based error reporting.
import { EmptyRequest } from "@shared/proto/cline/common"
import { ToolImageEvent } from "@shared/proto/cline/ui"
import { Logger } from "@/services/logging/Logger"
import { getRequestRegistry, StreamingResponseHandler } from "../grpc-handler"
import { Controller } from "../index"

// Keep track of active tool image subscriptions
const activeToolImageSubscriptions = new Set<StreamingResponseHandler<ToolImageEvent>>()

/**
 * Subscribe to tool image events (ephemeral UI-only payloads)
 */
export async function subscribeToToolImageEvents(
	_controller: Controller,
	_request: EmptyRequest,
	responseStream: StreamingResponseHandler<ToolImageEvent>,
	requestId?: string,
): Promise<void> {
	activeToolImageSubscriptions.add(responseStream)

	const cleanup = () => {
		activeToolImageSubscriptions.delete(responseStream)
	}

	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "tool_image_subscription" }, responseStream)
	}
}

/**
 * Send a tool image event to all active subscribers
 */
export async function sendToolImageEvent(event: ToolImageEvent): Promise<void> {
	const promises = Array.from(activeToolImageSubscriptions).map(async (responseStream) => {
		try {
			await responseStream(event, false)
		} catch (error) {
			Logger.error("Error sending tool image event", error as Error)
			activeToolImageSubscriptions.delete(responseStream)
		}
	})

	await Promise.all(promises)
}
