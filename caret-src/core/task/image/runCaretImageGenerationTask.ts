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

type TaskIO = {
	controller: unknown
	ulid: string
	isAborted: () => boolean
	say: (type: ClineSay, text?: string, images?: string[], files?: string[], partial?: boolean) => Promise<number | undefined>
	ask: (type: ClineAsk, text?: string, partial?: boolean) => Promise<AskResult>
}

type GenerateImageResponse = {
	mimeType: string
	base64: string
}

async function requestGeneratedImage(io: TaskIO, prompt: string): Promise<GenerateImageResponse> {
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
		body: JSON.stringify({ prompt }),
	})

	if (!resp.ok) {
		const contentType = resp.headers.get("content-type") || ""
		const errorBody = contentType.includes("application/json")
			? JSON.stringify(await resp.json().catch(() => ({})))
			: await resp.text().catch(() => "")
		throw new Error(`이미지 생성 API 오류 (${resp.status}): ${errorBody || resp.statusText}`)
	}

	const data = (await resp.json()) as Partial<GenerateImageResponse>
	if (!data?.base64 || !data?.mimeType) {
		throw new Error("이미지 생성 API 응답 형식이 올바르지 않습니다.")
	}
	return { mimeType: data.mimeType, base64: data.base64 }
}

async function generateAndSayImage(io: TaskIO, prompt: string): Promise<void> {
	if (io.isAborted()) return

	await io.say("text", "이미지 생성 중...", undefined, undefined, true)

	try {
		const { mimeType, base64 } = await requestGeneratedImage(io, prompt)
		if (io.isAborted()) return
		const dataUrl = `data:${mimeType};base64,${base64}`
		await io.say("text", `![](${dataUrl})`, undefined, undefined, false)
	} catch (error) {
		if (io.isAborted()) return
		const message = error instanceof Error ? error.message : String(error)
		await io.say("text", `이미지 생성 실패: ${message}`, undefined, undefined, false)
		if (message.includes("로그인이 필요합니다") || message.includes("(401)") || message.includes("(403)")) {
			await io.say("error", message)
		}
	}
}

export async function runCaretImageGenerationTask(io: TaskIO, initialPrompt?: string): Promise<void> {
	if (initialPrompt && initialPrompt.trim()) {
		await generateAndSayImage(io, initialPrompt.trim())
	}

	while (!io.isAborted()) {
		let askResult: AskResult
		try {
			askResult = await io.ask("followup")
		} catch {
			return
		}
		const prompt = askResult.text?.trim()
		if (!prompt) {
			continue
		}

		// Show the user's prompt in the chat history (consistent with existing follow-up UX).
		await io.say("user_feedback", prompt, askResult.images, askResult.files)
		await generateAndSayImage(io, prompt)
	}
}
