import { updateApiReqMsg } from "@core/task/utils"
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

	const startApiRequest = async (request: string): Promise<number | undefined> => {
		if (!task?.say || !task?.messageStateHandler) return undefined
		await task.say("api_req_started", JSON.stringify({ request }))
		const messages = task.messageStateHandler.getClineMessages?.()
		if (!Array.isArray(messages) || messages.length === 0) return undefined
		return messages.length - 1
	}

	const updateApiRequestUsage = async (
		apiReqIndex: number | undefined,
		usage: {
			inputTokens: number
			outputTokens: number
			cacheWriteTokens?: number
			cacheReadTokens?: number
			totalCost?: number
		},
	): Promise<void> => {
		if (apiReqIndex === undefined || !task?.messageStateHandler || !task?.api) return
		const cacheWriteTokens = typeof usage.cacheWriteTokens === "number" ? usage.cacheWriteTokens : 0
		const cacheReadTokens = typeof usage.cacheReadTokens === "number" ? usage.cacheReadTokens : 0
		const totalCost = typeof usage.totalCost === "number" ? usage.totalCost : 0

		await updateApiReqMsg({
			messageStateHandler: task.messageStateHandler,
			lastApiReqIndex: apiReqIndex,
			inputTokens: usage.inputTokens,
			outputTokens: usage.outputTokens,
			cacheWriteTokens,
			cacheReadTokens,
			totalCost,
			api: task.api,
		})

		if (typeof task.postStateToWebview === "function") {
			await task.postStateToWebview()
		}
	}

	const handoff = await runCaretImageGenerationTask(
		{
			controller: task.controller,
			ulid: task.ulid,
			isAborted: () => Boolean(task.taskState?.abort),
			say: task.say.bind(task),
			ask: task.ask.bind(task),
			isImageModel,
			startApiRequest,
			updateApiRequestUsage,
		},
		initialPrompt,
	)
	if (handoff) {
		return { handled: true, handoff }
	}
	return { handled: true }
}
