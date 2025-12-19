import { runCaretImageGenerationTask } from "./runCaretImageGenerationTask"

const IMAGE_GENERATION_MODEL_ID = "gemini/gemini-3-pro-image-preview"

export async function maybeRunCaretImageGenerationTask(taskInstance: unknown, initialPrompt?: string): Promise<boolean> {
	const task = taskInstance as any
	if (!task?.getCurrentProviderInfo) return false

	const providerInfo = task.getCurrentProviderInfo()
	if (providerInfo?.providerId !== "caret" || providerInfo?.model?.id !== IMAGE_GENERATION_MODEL_ID) {
		return false
	}

	await runCaretImageGenerationTask(
		{
			controller: task.controller,
			ulid: task.ulid,
			isAborted: () => Boolean(task.taskState?.abort),
			say: task.say.bind(task),
			ask: task.ask.bind(task),
		},
		initialPrompt,
	)
	return true
}
