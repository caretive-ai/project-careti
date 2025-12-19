import { runCaretImageGenerationTask } from "./runCaretImageGenerationTask"

const IMAGE_GENERATION_MODEL_ID = "gemini/gemini-3-pro-image-preview"

type ImageGenerationHandoff = {
	prompt: string
	images?: string[]
	files?: string[]
}

export type ImageTaskResult = {
	handled: boolean
	handoff?: ImageGenerationHandoff
}

export async function maybeRunCaretImageGenerationTask(
	taskInstance: unknown,
	initialPrompt?: string,
): Promise<ImageTaskResult> {
	const task = taskInstance as any
	if (!task?.getCurrentProviderInfo) return { handled: false }

	const isImageModel = () => {
		const providerInfo = task.getCurrentProviderInfo()
		return providerInfo?.providerId === "caret" && providerInfo?.model?.id === IMAGE_GENERATION_MODEL_ID
	}

	if (!isImageModel()) {
		return { handled: false }
	}

	const handoff = await runCaretImageGenerationTask(
		{
			controller: task.controller,
			ulid: task.ulid,
			isAborted: () => Boolean(task.taskState?.abort),
			say: task.say.bind(task),
			ask: task.ask.bind(task),
			isImageModel,
		},
		initialPrompt,
	)
	if (handoff) {
		return { handled: true, handoff }
	}
	return { handled: true }
}
