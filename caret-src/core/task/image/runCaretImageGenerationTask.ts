import { CaretEnv } from "@caret/config"
import { CaretAuthService } from "@caret/services/auth/CaretAuthService"
import type { ClineAsk, ClineSay } from "@shared/ExtensionMessage"
import type { ClineAskResponse } from "@shared/WebviewMessage"
import { fetch } from "@/shared/net"

type AskResult = {
	response: ClineAskResponse
	text?: string
	images?: string[]
	files?: string[]
}

type ImageUsage = {
	inputTokens: number
	outputTokens: number
	totalTokens?: number
	totalCost?: number
	cacheWriteTokens?: number
	cacheReadTokens?: number
}

type TaskIO = {
	controller: unknown
	ulid: string
	isAborted: () => boolean
	say: (type: ClineSay, text?: string, images?: string[], files?: string[], partial?: boolean) => Promise<number | undefined>
	ask: (type: ClineAsk, text?: string, partial?: boolean) => Promise<AskResult>
	isImageModel?: () => boolean
	startApiRequest?: (request: string) => Promise<number | undefined>
	updateApiRequestUsage?: (apiReqIndex: number | undefined, usage: ImageUsage) => Promise<void>
}

type GenerateImageResponse = {
	mimeType: string
	base64: string
	texts?: string[]
	thoughts?: string[]
	usage?: ImageUsage
}

type ImageGenerationHandoff = {
	prompt: string
	images?: string[]
	files?: string[]
}

type ImageStreamEvent =
	| { type: "thought"; content: string }
	| { type: "text"; content: string }
	| { type: "image"; mimeType: string; base64: string }
	| ({ type: "usage" } & ImageUsage)
	| { type: "done" }
	| { type: "error"; message: string }

function getPngDimensionsFromBase64(base64: string): { width: number; height: number } | undefined {
	try {
		const buf = Buffer.from(base64, "base64")
		if (buf.length < 24) return undefined
		// PNG signature: 89 50 4E 47 0D 0A 1A 0A
		if (
			buf[0] !== 0x89 ||
			buf[1] !== 0x50 ||
			buf[2] !== 0x4e ||
			buf[3] !== 0x47 ||
			buf[4] !== 0x0d ||
			buf[5] !== 0x0a ||
			buf[6] !== 0x1a ||
			buf[7] !== 0x0a
		)
			return undefined
		const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
		const width = view.getUint32(16, false)
		const height = view.getUint32(20, false)
		if (!width || !height) return undefined
		return { width, height }
	} catch {
		return undefined
	}
}

async function requestImageResponse(io: TaskIO, prompt: string, stream: boolean): Promise<Response> {
	const authService = CaretAuthService.getInstance(io.controller as any)
	const token = await authService.getAuthToken()
	if (!token) {
		throw new Error("로그인이 필요합니다. 설정에서 로그인 후 다시 시도해 주세요.")
	}

	const url = new URL("/v1/generate/image", CaretEnv.config().apiBaseUrl)
	const resp = await fetch(url.toString(), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-AnyLLM-Key": `Bearer ${token}`,
			"X-Task-ID": io.ulid,
		},
		body: JSON.stringify({ prompt, stream }),
	})

	if (!resp.ok) {
		const contentType = resp.headers.get("content-type") || ""
		const errorBody = contentType.includes("application/json")
			? JSON.stringify(await resp.json().catch(() => ({})))
			: await resp.text().catch(() => "")
		throw new Error(`이미지 생성 API 오류 (${resp.status}): ${errorBody || resp.statusText}`)
	}

	return resp
}

async function parseGeneratedImageResponse(resp: Response): Promise<GenerateImageResponse> {
	const data = (await resp.json()) as Partial<GenerateImageResponse>
	if (!data?.base64 || !data?.mimeType) {
		throw new Error("이미지 생성 API 응답 형식이 올바르지 않습니다.")
	}
	const texts = Array.isArray(data.texts) ? data.texts : []
	const thoughts = Array.isArray(data.thoughts) ? data.thoughts : []
	const usage = data.usage && typeof data.usage === "object" ? (data.usage as ImageUsage) : undefined
	return { mimeType: data.mimeType, base64: data.base64, texts, thoughts, usage }
}

function extractSsePayloads(rawEvent: string): string[] {
	const lines = rawEvent.split(/\r?\n/)
	const dataLines = lines
		.map((line) => line.trim())
		.filter((line) => line.startsWith("data:"))
		.map((line) => line.slice(5).trimStart())
	if (!dataLines.length) return []
	return [dataLines.join("\n")]
}

async function* parseImageStreamEvents(resp: Response): AsyncGenerator<ImageStreamEvent> {
	const reader = resp.body?.getReader()
	if (!reader) {
		throw new Error("이미지 생성 스트리밍 응답을 읽을 수 없습니다.")
	}
	const decoder = new TextDecoder()
	let buffer = ""

	while (true) {
		const { value, done } = await reader.read()
		if (done) break
		buffer += decoder.decode(value, { stream: true })
		const events = buffer.split("\n\n")
		buffer = events.pop() ?? ""
		for (const rawEvent of events) {
			for (const payload of extractSsePayloads(rawEvent)) {
				if (!payload) continue
				if (payload === "[DONE]") {
					yield { type: "done" }
					continue
				}
				let parsed: unknown
				try {
					parsed = JSON.parse(payload)
				} catch {
					continue
				}
				if (!parsed || typeof parsed !== "object") continue
				const event = parsed as ImageStreamEvent
				if (!event.type) continue
				yield event
			}
		}
	}

	buffer += decoder.decode()
	for (const payload of extractSsePayloads(buffer)) {
		if (!payload) continue
		if (payload === "[DONE]") {
			yield { type: "done" }
			continue
		}
		let parsed: unknown
		try {
			parsed = JSON.parse(payload)
		} catch {
			continue
		}
		if (!parsed || typeof parsed !== "object") continue
		const event = parsed as ImageStreamEvent
		if (!event.type) continue
		yield event
	}
}

function mergeStreamContent(current: string, incoming: string): string {
	if (!incoming) return current
	if (!current) return incoming
	if (incoming.startsWith(current)) return incoming

	const maxOverlap = Math.min(current.length, incoming.length)
	for (let i = maxOverlap; i > 0; i -= 1) {
		if (current.endsWith(incoming.slice(0, i))) {
			return current + incoming.slice(i)
		}
	}
	return current + incoming
}

async function generateAndSayImage(io: TaskIO, prompt: string, generationIndex: number): Promise<boolean> {
	if (io.isAborted()) return false

	let apiReqIndex: number | undefined
	let usageApplied = false
	const normalizeUsage = (raw: Partial<ImageUsage> | undefined): ImageUsage | undefined => {
		if (!raw) return undefined
		let inputTokens = typeof raw.inputTokens === "number" ? raw.inputTokens : 0
		const outputTokens = typeof raw.outputTokens === "number" ? raw.outputTokens : 0
		const totalTokens = typeof raw.totalTokens === "number" ? raw.totalTokens : undefined
		const totalCost = typeof raw.totalCost === "number" ? raw.totalCost : undefined
		const cacheWriteTokens = typeof raw.cacheWriteTokens === "number" ? raw.cacheWriteTokens : 0
		const cacheReadTokens = typeof raw.cacheReadTokens === "number" ? raw.cacheReadTokens : 0
		if (!inputTokens && totalTokens && totalTokens > 0) {
			if (outputTokens > 0 && totalTokens > outputTokens) {
				inputTokens = totalTokens - outputTokens
			} else {
				inputTokens = totalTokens
			}
		}
		return { inputTokens, outputTokens, totalTokens, totalCost, cacheWriteTokens, cacheReadTokens }
	}
	const applyUsageUpdate = async (usage: ImageUsage) => {
		if (usageApplied || apiReqIndex === undefined || !io.updateApiRequestUsage) return
		usageApplied = true
		await io.updateApiRequestUsage(apiReqIndex, usage)
	}

	const requestSummary = `POST /v1/generate/image\n\n${prompt}`
	apiReqIndex = await io.startApiRequest?.(requestSummary)

	const fileName = `Gemini_Generated_Image_${io.ulid}_${generationIndex}.png`
	const loadingTextBase = "이미지 생성 중"
	const loadingFrames = ["[-]", "[\\]", "[|]", "[/]"]
	let frameIndex = 0
	await io.say("text", `${loadingTextBase} ${loadingFrames[frameIndex]}`, undefined, undefined, true)
	frameIndex = (frameIndex + 1) % loadingFrames.length
	let loadingTimer: ReturnType<typeof setInterval> | undefined
	const updateLoadingText = () => {
		if (io.isAborted()) {
			if (loadingTimer) {
				clearInterval(loadingTimer)
				loadingTimer = undefined
			}
			return
		}
		if (loadingCleared) return
		void io.say("text", `${loadingTextBase} ${loadingFrames[frameIndex]}`, undefined, undefined, true).catch(() => {})
		frameIndex = (frameIndex + 1) % loadingFrames.length
	}
	loadingTimer = setInterval(updateLoadingText, 450)
	let loadingCleared = false

	const clearLoadingIfNeeded = async () => {
		if (loadingCleared) return
		loadingCleared = true
		if (loadingTimer) {
			clearInterval(loadingTimer)
			loadingTimer = undefined
		}
		await io.say("text", "", undefined, undefined, false)
	}

	try {
		const resp = await requestImageResponse(io, prompt, true)
		if (io.isAborted()) return false
		const contentType = resp.headers.get("content-type") || ""
		if (contentType.includes("text/event-stream")) {
			let thoughtText = ""
			let responseText = ""
			let reasoningStreaming = false
			let textStreaming = false
			let textStarted = false
			const thinkingFrames = ["[-]", "[\\]", "[|]", "[/]"]
			let thinkingFrameIndex = 0
			let thinkingTimer: ReturnType<typeof setInterval> | undefined
			let pendingImage: { mimeType: string; base64: string } | null = null
			const getThinkingDisplayText = () => {
				const suffix = `생각중 ${thinkingFrames[thinkingFrameIndex]}`
				return thoughtText ? `${thoughtText}\n\n${suffix}` : suffix
			}
			const stopThinkingTimer = () => {
				if (thinkingTimer) {
					clearInterval(thinkingTimer)
					thinkingTimer = undefined
				}
			}
			const startThinkingTimer = () => {
				if (thinkingTimer) return
				thinkingTimer = setInterval(() => {
					if (io.isAborted() || textStarted || !thoughtText) {
						stopThinkingTimer()
						return
					}
					const displayText = getThinkingDisplayText()
					thinkingFrameIndex = (thinkingFrameIndex + 1) % thinkingFrames.length
					void io.say("reasoning", displayText, undefined, undefined, true).catch(() => {})
					reasoningStreaming = true
				}, 450)
			}

			const finalizeReasoningIfNeeded = async () => {
				if (!reasoningStreaming) return
				stopThinkingTimer()
				await io.say("reasoning", thoughtText, undefined, undefined, false)
				reasoningStreaming = false
			}

			const finalizeTextIfNeeded = async () => {
				if (!textStreaming) return
				await io.say("text", responseText, undefined, undefined, false)
				textStreaming = false
			}

			for await (const event of parseImageStreamEvents(resp)) {
				if (io.isAborted()) return false
				await clearLoadingIfNeeded()

				if (event.type === "usage") {
					const usage = normalizeUsage(event)
					if (usage) {
						await applyUsageUpdate(usage)
					}
					continue
				}

				if (event.type === "thought") {
					if (textStarted) continue
					const content = typeof event.content === "string" ? event.content : ""
					if (!content) continue
					thoughtText = mergeStreamContent(thoughtText, content)
					startThinkingTimer()
					const displayText = getThinkingDisplayText()
					thinkingFrameIndex = (thinkingFrameIndex + 1) % thinkingFrames.length
					await io.say("reasoning", displayText, undefined, undefined, true)
					reasoningStreaming = true
					continue
				}

				if (event.type === "text") {
					const content = typeof event.content === "string" ? event.content : ""
					if (!content) continue
					if (!textStarted) {
						stopThinkingTimer()
						await finalizeReasoningIfNeeded()
						textStarted = true
					}
					responseText = mergeStreamContent(responseText, content)
					await io.say("text", responseText, undefined, undefined, true)
					textStreaming = true
					continue
				}

				if (event.type === "image") {
					if (pendingImage) continue
					if (!event.base64 || !event.mimeType) {
						throw new Error("이미지 생성 스트리밍 응답 형식이 올바르지 않습니다.")
					}
					pendingImage = { mimeType: event.mimeType, base64: event.base64 }
					continue
				}

				if (event.type === "error") {
					stopThinkingTimer()
					throw new Error(event.message || "이미지 생성 스트리밍 오류")
				}

				if (event.type === "done") {
					break
				}
			}

			await clearLoadingIfNeeded()
			await finalizeReasoningIfNeeded()
			await finalizeTextIfNeeded()
			if (!pendingImage) {
				throw new Error("이미지 생성 스트리밍 응답에 이미지가 없습니다.")
			}
			const dataUrl = `data:${pendingImage.mimeType};base64,${pendingImage.base64}`
			const dimensions = getPngDimensionsFromBase64(pendingImage.base64)
			const label = dimensions
				? `[${fileName} ${dimensions.width}x${dimensions.height}]`
				: `[${fileName}]`
			await io.say("text", `${label}\n\n![](${dataUrl})\n\n이미지 생성이 완료되었습니다.`, undefined, undefined, false)
			return true
		}
		await clearLoadingIfNeeded()
		const { mimeType, base64, texts = [], thoughts = [], usage: responseUsage } = await parseGeneratedImageResponse(resp)
		const usage = normalizeUsage(responseUsage)
		if (usage) {
			await applyUsageUpdate(usage)
		}
		const thoughtText = thoughts.filter(Boolean).join("\n\n")
		if (thoughtText) {
			await io.say("reasoning", thoughtText)
		}
		const finalText = texts.filter(Boolean).join("\n\n")
		if (finalText) {
			await io.say("text", finalText)
		}
		const dataUrl = `data:${mimeType};base64,${base64}`
		const dimensions = getPngDimensionsFromBase64(base64)
		const label = dimensions ? `[${fileName} ${dimensions.width}x${dimensions.height}]` : `[${fileName}]`
		await io.say("text", `${label}\n\n![](${dataUrl})\n\n이미지 생성이 완료되었습니다.`, undefined, undefined, false)
		return true
	} catch (error) {
		if (io.isAborted()) return false
		const message = error instanceof Error ? error.message : String(error)
		await io.say("text", `이미지 생성 실패: ${message}`, undefined, undefined, false)
		if (message.includes("로그인이 필요합니다") || message.includes("(401)") || message.includes("(403)")) {
			await io.say("error", message)
		}
		return false
	} finally {
		if (loadingTimer) {
			clearInterval(loadingTimer)
		}
	}

	return false
}

export async function runCaretImageGenerationTask(
	io: TaskIO,
	initialPrompt?: string,
): Promise<ImageGenerationHandoff | undefined> {
	let generationIndex = 0
	const followupQuestion = JSON.stringify({
		question: "이미지 프롬프트를 입력해 주세요.",
		options: [],
	})
	let prompt = initialPrompt?.trim() || ""
	let promptImages: string[] | undefined
	let promptFiles: string[] | undefined

	while (!io.isAborted()) {
		if (!prompt) {
			let askResult: AskResult
			try {
				askResult = await io.ask("followup", followupQuestion)
			} catch {
				return
			}
			prompt = askResult.text?.trim() || ""
			promptImages = askResult.images
			promptFiles = askResult.files
			if (!prompt) {
				promptImages = undefined
				promptFiles = undefined
				continue
			}

			// Show the user's prompt in the chat history (consistent with existing follow-up UX).
			await io.say("user_feedback", prompt, promptImages, promptFiles)
		}

		if (io.isImageModel && !io.isImageModel()) {
			return {
				prompt,
				images: promptImages,
				files: promptFiles,
			}
		}

		generationIndex += 1
		const didGenerate = await generateAndSayImage(io, prompt, generationIndex)
		if (!didGenerate || io.isAborted()) {
			return
		}

		let askResult: AskResult
		try {
			askResult = await io.ask("completion_result", "", false)
		} catch {
			return
		}

		if (askResult.response !== "messageResponse") {
			return
		}

		const nextPrompt = askResult.text?.trim() || ""
		if (!nextPrompt) {
			prompt = ""
			promptImages = undefined
			promptFiles = undefined
			continue
		}
		prompt = nextPrompt
		promptImages = askResult.images
		promptFiles = askResult.files
		await io.say("user_feedback", prompt, promptImages, promptFiles)
	}
	return
}
