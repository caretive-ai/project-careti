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
	texts?: string[]
	thoughts?: string[]
}

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
	const texts = Array.isArray(data.texts) ? data.texts : []
	const thoughts = Array.isArray(data.thoughts) ? data.thoughts : []
	return { mimeType: data.mimeType, base64: data.base64, texts, thoughts }
}

async function generateAndSayImage(io: TaskIO, prompt: string, generationIndex: number): Promise<void> {
	if (io.isAborted()) return

	const fileName = `Gemini_Generated_Image_${io.ulid}_${generationIndex}.png`
	const loadingMarkdown = `이미지 생성 중...\n\n\`\`\`diff\n+ 생성 중...\n\`\`\``
	await io.say("text", loadingMarkdown, undefined, undefined, true)

	try {
		const { mimeType, base64, texts = [], thoughts = [] } = await requestGeneratedImage(io, prompt)
		if (io.isAborted()) return
		await io.say("text", "", undefined, undefined, false)
		const thoughtText = thoughts.filter(Boolean).join("\n\n")
		if (thoughtText) {
			await io.say("reasoning", thoughtText)
		}
		const responseText = texts.filter(Boolean).join("\n\n")
		if (responseText) {
			await io.say("text", responseText)
		}
		const dataUrl = `data:${mimeType};base64,${base64}`
		const dimensions = getPngDimensionsFromBase64(base64)
		const label = dimensions ? `[${fileName} ${dimensions.width}x${dimensions.height}]` : `[${fileName}]`
		await io.say("text", `${label}\n\n![](${dataUrl})`, undefined, undefined, false)
		await io.say("text", "완료")
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
	let generationIndex = 0
	if (initialPrompt && initialPrompt.trim()) {
		generationIndex += 1
		await generateAndSayImage(io, initialPrompt.trim(), generationIndex)
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
		generationIndex += 1
		await generateAndSayImage(io, prompt, generationIndex)
	}
}
