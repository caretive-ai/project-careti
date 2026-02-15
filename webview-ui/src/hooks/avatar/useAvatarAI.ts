// CARETI MODIFICATION: 아바타 AI 연동 훅 (Gemini API)
import { useState, useCallback, useRef } from "react"

export type AvatarEmotion = "neutral" | "happy" | "sad" | "angry" | "surprised" | "thinking"

export interface UseAvatarAIOptions {
	/** Gemini API 키 */
	apiKey: string
	/** 시스템 프롬프트 (아바타 성격 설정) */
	systemPrompt?: string
	/** 모델 ID */
	model?: string
}

export interface UseAvatarAIResult {
	/** API 준비 여부 */
	isReady: boolean
	/** 로딩 중 여부 */
	isLoading: boolean
	/** 마지막 응답 */
	response: string | null
	/** 감지된 감정 */
	emotion: AvatarEmotion
	/** 에러 */
	error: Error | null
	/** 메시지 전송 */
	sendMessage: (message: string) => Promise<void>
	/** 대화 초기화 */
	clearHistory: () => void
}

// 감정 키워드 매핑
const EMOTION_KEYWORDS: Record<AvatarEmotion, string[]> = {
	happy: ["기뻐", "좋아", "행복", "신나", "잘됐", "축하", "멋져", "대단", "😊", "😄", "🎉"],
	sad: ["슬퍼", "아쉬", "안타깝", "힘들", "어려", "실패", "😢", "😭", "💔"],
	angry: ["화나", "짜증", "분노", "싫어", "최악", "😠", "😤", "💢"],
	surprised: ["놀라", "대박", "헐", "와", "오", "신기", "😮", "😲", "🤯"],
	thinking: ["음", "글쎄", "생각", "고민", "아마", "🤔", "💭"],
	neutral: [],
}

/**
 * Gemini API를 사용하여 아바타 AI 응답을 생성하는 훅
 *
 * @example
 * ```tsx
 * const { sendMessage, response, emotion } = useAvatarAI({
 *   apiKey: process.env.GEMINI_TOKEN,
 *   systemPrompt: "너는 귀여운 AI 버튜버야. 친근하게 대화해줘."
 * })
 *
 * // 메시지 전송
 * await sendMessage("안녕!")
 *
 * // 응답과 감정 사용
 * console.log(response) // "안녕하세요! 반가워요~"
 * console.log(emotion)  // "happy"
 * ```
 */
export function useAvatarAI({
	apiKey,
	systemPrompt = "너는 친근한 AI 어시스턴트야. 짧고 명확하게 답변해줘.",
	model = "gemini-2.0-flash-exp",
}: UseAvatarAIOptions): UseAvatarAIResult {
	const [isLoading, setIsLoading] = useState(false)
	const [response, setResponse] = useState<string | null>(null)
	const [emotion, setEmotion] = useState<AvatarEmotion>("neutral")
	const [error, setError] = useState<Error | null>(null)

	const historyRef = useRef<Array<{ role: string; parts: Array<{ text: string }> }>>([])

	const isReady = Boolean(apiKey)

	// 감정 분석
	const analyzeEmotion = useCallback((text: string): AvatarEmotion => {
		const lowerText = text.toLowerCase()

		for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
			if (emotion === "neutral") continue

			for (const keyword of keywords) {
				if (lowerText.includes(keyword)) {
					return emotion as AvatarEmotion
				}
			}
		}

		return "neutral"
	}, [])

	// 메시지 전송
	const sendMessage = useCallback(
		async (message: string): Promise<void> => {
			if (!apiKey) {
				setError(new Error("API 키가 설정되지 않았습니다"))
				return
			}

			setIsLoading(true)
			setError(null)

			try {
				// 대화 히스토리에 사용자 메시지 추가
				historyRef.current.push({
					role: "user",
					parts: [{ text: message }],
				})

				const requestBody = {
					contents: historyRef.current,
					systemInstruction: {
						parts: [{ text: systemPrompt }],
					},
					generationConfig: {
						temperature: 0.8,
						topK: 40,
						topP: 0.95,
						maxOutputTokens: 256,
					},
				}

				const res = await fetch(
					`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(requestBody),
					},
				)

				if (!res.ok) {
					throw new Error(`API 오류: ${res.status}`)
				}

				const data = await res.json()
				const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

				// 대화 히스토리에 AI 응답 추가
				historyRef.current.push({
					role: "model",
					parts: [{ text: responseText }],
				})

				// 감정 분석
				const detectedEmotion = analyzeEmotion(responseText)

				setResponse(responseText)
				setEmotion(detectedEmotion)
			} catch (err) {
				setError(err instanceof Error ? err : new Error(String(err)))
			} finally {
				setIsLoading(false)
			}
		},
		[apiKey, systemPrompt, model, analyzeEmotion],
	)

	// 대화 히스토리 초기화
	const clearHistory = useCallback(() => {
		historyRef.current = []
		setResponse(null)
		setEmotion("neutral")
		setError(null)
	}, [])

	return {
		isReady,
		isLoading,
		response,
		emotion,
		error,
		sendMessage,
		clearHistory,
	}
}
