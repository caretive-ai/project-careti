// CARETI MODIFICATION: Single-press interrupt handler
// ESC 1회로 즉시 중지 + 큐 내용을 입력창으로 복원
import { SessionManager } from "@careti/utils/session-manager"
import { Logger } from "@services/logging/Logger"
import { EmptyRequest, String as StringProto } from "@shared/proto/cline/common"
import { Controller } from ".."

/**
 * Interrupt the currently running task immediately (single press)
 * Cancels the task and returns any pending input for the webview to restore
 * @param controller The controller instance
 * @param _request The empty request
 * @returns String - pending input text to restore in input field (empty if none)
 */
export async function tryInterruptTask(controller: Controller, _request: EmptyRequest): Promise<StringProto> {
	const task = controller.task
	if (!task) {
		return StringProto.create({ value: "" })
	}

	const sessionManager = SessionManager.getInstance()

	// IMPORTANT: Consume pending input BEFORE cancelTask, because abortTask()
	// calls sessionManager.delete(taskId) which destroys the session and its buffer
	const pendingInput = sessionManager.consumePendingInput(task.taskId)
	if (pendingInput) {
		Logger.info(`[tryInterruptTask] Captured pending input (${pendingInput.length} chars) for restoration`)
	}

	// CARETI MODIFICATION: Single-press instant cancel (no double-press)
	sessionManager.forceInterrupt(task.taskId)
	await controller.cancelTask()

	// State update is triggered by SessionManager events (subscribed in Controller constructor)
	return StringProto.create({ value: pendingInput })
}
