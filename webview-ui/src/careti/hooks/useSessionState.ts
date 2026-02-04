// CARETI MODIFICATION: Hook for accessing session state from ExtensionState
// This provides a clean interface for components to react to session status changes

import { useExtensionState } from "@/context/ExtensionStateContext"
import { useMemo } from "react"

export type SessionStatus = "idle" | "busy" | "interrupting"

export interface SessionState {
	/** Current session status */
	status: SessionStatus
	/** Whether the user is in warning state (pressed cancel once) */
	isWarning: boolean
	/** Whether a task is currently being processed */
	isBusy: boolean
	/** Whether the session can accept new messages */
	canSendMessage: boolean
	/** Pending input that will be processed when current task completes or is cancelled */
	pendingInput?: string
	/** Whether there is pending input queued */
	hasPendingInput: boolean
}

/**
 * Hook for accessing session state in WebView components
 *
 * This hook provides derived state from the ExtensionState for easy
 * consumption by UI components.
 *
 * @example
 * ```tsx
 * function ChatInput() {
 *   const { isBusy, isWarning, canSendMessage } = useSessionState()
 *
 *   return (
 *     <button disabled={!canSendMessage}>
 *       {isWarning ? "Press again to cancel" : isBusy ? "Processing..." : "Send"}
 *     </button>
 *   )
 * }
 * ```
 */
export function useSessionState(): SessionState {
	const { sessionStatus, interruptWarning, pendingInput } = useExtensionState()

	return useMemo(() => {
		const status: SessionStatus = sessionStatus ?? "idle"
		const isWarning = interruptWarning ?? false
		const isBusy = status === "busy" || status === "interrupting"
		// Can send messages when idle or busy (for queuing), but not during interrupting
		const canSendMessage = status !== "interrupting"
		const hasPendingInput = !!pendingInput

		return {
			status,
			isWarning,
			isBusy,
			canSendMessage,
			pendingInput,
			hasPendingInput,
		}
	}, [sessionStatus, interruptWarning, pendingInput])
}
