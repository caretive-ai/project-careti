// CARETI MODIFICATION: Clear pending input without processing
import { SessionManager } from "@careti/utils/session-manager"
import { Empty, EmptyRequest } from "@shared/proto/cline/common"
import { Controller } from ".."

/**
 * Clear pending input from the queue without processing it
 * Used by the X (delete) button on the PendingInputPreview
 * @param controller The controller instance
 * @param _request The empty request
 * @returns Empty
 */
export async function clearPendingInput(controller: Controller, _request: EmptyRequest): Promise<Empty> {
	const task = controller.task
	if (task) {
		const sessionManager = SessionManager.getInstance()
		sessionManager.clearPendingInput(task.taskId)
	}

	return Empty.create()
}
