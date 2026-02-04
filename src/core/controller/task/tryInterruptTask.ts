// CARETI MODIFICATION: Double-press interrupt handler
// Claude Code style: cancel → immediately process pending input
import { SessionManager } from "@careti/utils/session-manager"
import { Logger } from "@services/logging/Logger"
import { Boolean as BooleanProto, EmptyRequest } from "@shared/proto/cline/common"
import { Controller } from ".."

/** Delay before processing pending input after cancel (ms) */
const CANCEL_PROCESS_DELAY_MS = 100

/**
 * Try to interrupt the currently running task using double-press pattern
 * First call sets warning state, second call actually interrupts
 * If there's pending input, it will be processed immediately after cancellation
 * @param controller The controller instance
 * @param _request The empty request
 * @returns Boolean - true if task was interrupted, false if in warning state
 */
export async function tryInterruptTask(controller: Controller, _request: EmptyRequest): Promise<BooleanProto> {
	const task = controller.task
	if (!task) {
		return BooleanProto.create({ value: false })
	}

	const sessionManager = SessionManager.getInstance()
	const wasInterrupted = sessionManager.tryInterrupt(task.taskId)

	if (wasInterrupted) {
		// Actually cancel the task
		await controller.cancelTask()

		// CARETI MODIFICATION: Claude Code style - immediately process pending input after cancel
		const pendingInput = sessionManager.consumePendingInput(task.taskId)
		if (pendingInput) {
			Logger.info(`[tryInterruptTask] Processing pending input (${pendingInput.length} chars) after cancel`)
			// Start new request with pending input
			// Use setTimeout to ensure cancel completes first
			setTimeout(() => {
				controller.initTask(pendingInput).catch((error) => {
					Logger.error("[tryInterruptTask] Failed to process pending input:", error)
				})
			}, CANCEL_PROCESS_DELAY_MS)
		}
	}

	// State update is triggered by SessionManager events (subscribed in Controller constructor)
	return BooleanProto.create({ value: wasInterrupted })
}
