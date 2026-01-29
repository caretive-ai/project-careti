// CARETI MODIFICATION: Handler for explaining task changes
import { Empty } from "@shared/proto/cline/common"
import { ExplainChangesRequest } from "@shared/proto/cline/task"
import { Controller } from ".."

/**
 * Explains changes from a task completion by starting a new task
 * @param controller The controller instance
 * @param request The request containing the timestamp of the message
 * @returns Empty response
 */
export async function explainChanges(controller: Controller, request: ExplainChangesRequest): Promise<Empty> {
	try {
		if (request.messageTs && controller.task) {
			// First, show the diff view so user can see the changes
			await controller.task.checkpointManager?.presentMultifileDiff?.(request.messageTs, true)

			// Start a new task to explain the changes
			const explainPrompt =
				"Please explain the changes that were made in the previous task. Describe what was modified, why the changes were made, and any important implementation details."

			await controller.initTask(explainPrompt)
		}
		return Empty.create()
	} catch (error) {
		console.error("Error in explainChanges handler:", error)
		throw error
	}
}
