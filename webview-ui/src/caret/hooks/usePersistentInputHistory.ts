// CARET MODIFICATION: Persistent input history hook using gRPC
import { useCallback, useEffect, useState } from "react"
import { caretWebviewLogger } from "@/caret/utils/webview-logger"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"

const MAX_HISTORY_SIZE = 1000

export function usePersistentInputHistory() {
	const { inputHistory: stateInputHistory } = useExtensionState()
	const [localHistory, setLocalHistory] = useState<string[]>([])

	// Load from backend state when available
	useEffect(() => {
		if (stateInputHistory !== undefined) {
			setLocalHistory(stateInputHistory)
			caretWebviewLogger.info(`[INPUT-HISTORY] Hook loaded ${stateInputHistory.length} items from backend state`)
		}
	}, [stateInputHistory])

	// Add new item to history
	const addToHistory = useCallback(
		async (text: string) => {
			if (!text.trim()) return

			// Remove duplicates (don't add if same as last item)
			if (localHistory[localHistory.length - 1] === text.trim()) return

			const newHistory = [...localHistory, text.trim()].slice(-MAX_HISTORY_SIZE)

			// Update local state immediately for UI responsiveness
			setLocalHistory(newHistory)

			// Save to backend via gRPC
			try {
				await StateServiceClient.updateSettings({
					inputHistory: newHistory,
				})
				caretWebviewLogger.info(`[INPUT-HISTORY] Saved history item: "${text.trim().substring(0, 50)}..."`)
			} catch (error) {
				caretWebviewLogger.error("[INPUT-HISTORY] Failed to save input history:", error)
				// Rollback local state on failure
				setLocalHistory(localHistory)
			}
		},
		[localHistory],
	)

	return {
		inputHistory: localHistory,
		addToHistory,
	}
}
