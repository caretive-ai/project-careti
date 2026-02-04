// CARETI MODIFICATION: Double-press interrupt pattern for safe task cancellation
// Reference: ref-opencode TUI interrupt implementation

import { useCallback, useRef, useState } from "react"

interface UseInterruptHandlerOptions {
	/** Timeout in milliseconds before interrupt count resets (default: 3000) */
	timeout?: number
	/** Number of presses required to trigger interrupt (default: 2) */
	threshold?: number
	/** Callback when interrupt is triggered */
	onInterrupt: () => void | Promise<void>
	/** Callback when first press occurs (for showing warning) */
	onWarning?: () => void
}

interface UseInterruptHandlerReturn {
	/** Call this when user attempts to cancel */
	tryInterrupt: () => boolean
	/** Current interrupt count (for UI display) */
	interruptCount: number
	/** Whether user is in "warning" state (pressed once) */
	isWarning: boolean
	/** Reset the interrupt state */
	reset: () => void
}

/**
 * Hook for implementing double-press interrupt pattern
 *
 * This prevents accidental task cancellation by requiring the user
 * to press the cancel button twice within a short time window.
 *
 * @example
 * ```tsx
 * const { tryInterrupt, isWarning } = useInterruptHandler({
 *   onInterrupt: () => TaskServiceClient.cancelTask(),
 *   onWarning: () => showToast("Press again to cancel"),
 * })
 *
 * <button onClick={tryInterrupt}>
 *   {isWarning ? "Press again to cancel" : "Cancel"}
 * </button>
 * ```
 */
export function useInterruptHandler(options: UseInterruptHandlerOptions): UseInterruptHandlerReturn {
	const { timeout = 3000, threshold = 2, onInterrupt, onWarning } = options

	const [interruptCount, setInterruptCount] = useState(0)
	const [isWarning, setIsWarning] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const reset = useCallback(() => {
		setInterruptCount(0)
		setIsWarning(false)
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const tryInterrupt = useCallback(() => {
		const newCount = interruptCount + 1
		setInterruptCount(newCount)

		// Clear existing timer
		if (timerRef.current) {
			clearTimeout(timerRef.current)
		}

		// Set new timer to reset count
		timerRef.current = setTimeout(() => {
			reset()
		}, timeout)

		// Check if threshold reached
		if (newCount >= threshold) {
			reset()
			onInterrupt()
			return true
		}

		// Show warning for first press
		setIsWarning(true)
		onWarning?.()
		return false
	}, [interruptCount, threshold, timeout, onInterrupt, onWarning, reset])

	return {
		tryInterrupt,
		interruptCount,
		isWarning,
		reset,
	}
}
