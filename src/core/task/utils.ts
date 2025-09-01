import { ApiHandler } from "@core/api"
import { HostProvider } from "@/hosts/host-provider"
import { showSystemNotification } from "@/integrations/notifications"
import { ClineApiReqCancelReason, ClineApiReqInfo } from "@/shared/ExtensionMessage"
import { calculateApiCostAnthropic } from "@/utils/cost"
import { MessageStateHandler } from "./message-state"

export const showNotificationForApprovalIfAutoApprovalEnabled = async (
	message: string,
	autoApprovalSettingsEnabled: boolean,
	notificationsEnabled: boolean,
) => {
	if (autoApprovalSettingsEnabled && notificationsEnabled) {
		// CARET MODIFICATION: Universal backend message processing using package.json displayName
		const { processUniversalBackendMessage } = await import("../../../caret-src/i18n/backend-message-filter")

		let processedMessage = message
		try {
			// Process as OS notification (enables full i18n if in Caret mode)
			processedMessage = processUniversalBackendMessage(message, true)
		} catch (error) {
			console.warn("Failed to process universal backend message:", error)
			// Fallback to original message
		}

		showSystemNotification({
			subtitle: "Approval Required",
			message: processedMessage,
		})
	}
}

type UpdateApiReqMsgParams = {
	messageStateHandler: MessageStateHandler
	lastApiReqIndex: number
	inputTokens: number
	outputTokens: number
	cacheWriteTokens: number
	cacheReadTokens: number
	totalCost?: number
	api: ApiHandler
	cancelReason?: ClineApiReqCancelReason
	streamingFailedMessage?: string
}

// update api_req_started. we can't use api_req_finished anymore since it's a unique case where it could come after a streaming message (ie in the middle of being updated or executed)
// fortunately api_req_finished was always parsed out for the gui anyways, so it remains solely for legacy purposes to keep track of prices in tasks from history
// (it's worth removing a few months from now)
export const updateApiReqMsg = async (params: UpdateApiReqMsgParams) => {
	const clineMessages = params.messageStateHandler.getClineMessages()
	const currentApiReqInfo: ClineApiReqInfo = JSON.parse(clineMessages[params.lastApiReqIndex].text || "{}")
	delete currentApiReqInfo.retryStatus // Clear retry status when request is finalized

	await params.messageStateHandler.updateClineMessage(params.lastApiReqIndex, {
		text: JSON.stringify({
			...currentApiReqInfo, // Spread the modified info (with retryStatus removed)
			tokensIn: params.inputTokens,
			tokensOut: params.outputTokens,
			cacheWrites: params.cacheWriteTokens,
			cacheReads: params.cacheReadTokens,
			cost:
				params.totalCost ??
				calculateApiCostAnthropic(
					params.api.getModel().info,
					params.inputTokens,
					params.outputTokens,
					params.cacheWriteTokens,
					params.cacheReadTokens,
				),
			cancelReason: params.cancelReason,
			streamingFailedMessage: params.streamingFailedMessage,
		} satisfies ClineApiReqInfo),
	})
}
