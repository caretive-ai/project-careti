// CARETI MODIFICATION: 아바타 통합 데모 컴포넌트
import { useState, useEffect, useCallback } from "react"
import { AvatarScene } from "./AvatarScene"
import { useAvatarAI, useWorklogEvents, type AvatarEmotion, type WorklogEventType } from "../../hooks/avatar"

// 감정 → VRM 표정 매핑
const EMOTION_TO_EXPRESSION: Record<AvatarEmotion, string> = {
	neutral: "neutral",
	happy: "happy",
	sad: "sad",
	angry: "angry",
	surprised: "surprised",
	thinking: "neutral", // thinking은 눈 애니메이션으로 대체
}

// 시뮬레이션용 이벤트 버튼
const DEMO_EVENTS: Array<{ type: WorklogEventType; label: string; data?: Record<string, unknown> }> = [
	{ type: "commit", label: "✅ Commit", data: { message: "feat: add feature" } },
	{ type: "test_pass", label: "🧪 Test Pass", data: { count: 10 } },
	{ type: "test_fail", label: "❌ Test Fail", data: { count: 2 } },
	{ type: "error", label: "💥 Error", data: { message: "Build failed" } },
	{ type: "thinking", label: "🤔 Thinking" },
]

export interface AvatarDemoProps {
	/** VRM 모델 URL */
	modelUrl?: string
	/** Gemini API 키 (없으면 환경변수 사용) */
	apiKey?: string
	/** 아바타 성격 프롬프트 */
	personality?: string
}

/**
 * AI 버튜버 통합 데모 컴포넌트
 * - 3D 아바타 렌더링
 * - Gemini AI 대화
 * - 감정 기반 표정 변화
 */
export function AvatarDemo({
	modelUrl = "/models/avatar.vrm",
	apiKey = import.meta.env.VITE_GEMINI_API_KEY,
	personality = `너는 "캐럿"이라는 이름의 AI 코딩 버튜버야.
개발자들을 도와주는 걸 좋아하고, 코드에 대해 이야기할 때 신나해.
짧고 친근하게 대화해. 이모티콘도 가끔 써.`,
}: AvatarDemoProps) {
	const [input, setInput] = useState("")
	const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([])
	const [currentExpression, setCurrentExpression] = useState<string>("neutral")

	const { isReady, isLoading, response, emotion: aiEmotion, error, sendMessage, clearHistory } = useAvatarAI({
		apiKey,
		systemPrompt: personality,
	})

	const { emotion: worklogEmotion, message: worklogMessage, handleEvent, reset: resetWorklog } = useWorklogEvents()

	// 현재 감정 (worklog 이벤트가 있으면 우선)
	const currentEmotion = worklogEmotion !== "neutral" ? worklogEmotion : aiEmotion

	// 감정 변화 시 표정 업데이트
	useEffect(() => {
		const expression = EMOTION_TO_EXPRESSION[currentEmotion]
		setCurrentExpression(expression)
	}, [currentEmotion])

	// worklog 메시지 표시
	useEffect(() => {
		if (worklogMessage) {
			setMessages((prev) => [...prev, { role: "ai", text: worklogMessage }])
			// 3초 후 리셋
			const timer = setTimeout(() => resetWorklog(), 3000)
			return () => clearTimeout(timer)
		}
	}, [worklogMessage, resetWorklog])

	// AI 응답 시 메시지 추가
	useEffect(() => {
		if (response) {
			setMessages((prev) => [...prev, { role: "ai", text: response }])
		}
	}, [response])

	// 메시지 전송
	const handleSend = useCallback(async () => {
		if (!input.trim() || isLoading) return

		const userMessage = input.trim()
		setMessages((prev) => [...prev, { role: "user", text: userMessage }])
		setInput("")

		await sendMessage(userMessage)
	}, [input, isLoading, sendMessage])

	// 엔터키 처리
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault()
				handleSend()
			}
		},
		[handleSend],
	)

	// 대화 초기화
	const handleClear = useCallback(() => {
		clearHistory()
		setMessages([])
		setCurrentExpression("neutral")
	}, [clearHistory])

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				maxWidth: "800px",
				margin: "0 auto",
				padding: "16px",
				gap: "16px",
			}}
		>
			{/* 헤더 */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h2 style={{ margin: 0, color: "#fff" }}>🥕 Caret AI VTuber</h2>
				<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
					<span
						style={{
							padding: "4px 8px",
							borderRadius: "4px",
							backgroundColor: currentEmotion === "neutral" ? "#666" : "#4CAF50",
							color: "#fff",
							fontSize: "12px",
						}}
					>
						{currentEmotion}
					</span>
					<button
						onClick={handleClear}
						style={{
							padding: "8px 16px",
							borderRadius: "4px",
							border: "none",
							backgroundColor: "#333",
							color: "#fff",
							cursor: "pointer",
						}}
					>
						Clear
					</button>
				</div>
			</div>

			{/* 아바타 + 채팅 영역 */}
			<div
				style={{
					display: "flex",
					gap: "16px",
					flex: 1,
					minHeight: 0,
				}}
			>
				{/* 아바타 + 이벤트 버튼 */}
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					<div
						style={{
							flex: "0 0 300px",
							backgroundColor: "#1a1a2e",
							borderRadius: "8px",
							overflow: "hidden",
						}}
					>
						<AvatarScene
							modelUrl={modelUrl}
							width={300}
							height={400}
							enableControls
						/>
					</div>
					{/* Git 이벤트 시뮬레이션 */}
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: "4px",
							padding: "8px",
							backgroundColor: "#1a1a2e",
							borderRadius: "8px",
						}}
					>
						{DEMO_EVENTS.map((event) => (
							<button
								key={event.type}
								onClick={() => handleEvent({ type: event.type, data: event.data })}
								style={{
									padding: "6px 10px",
									borderRadius: "4px",
									border: "none",
									backgroundColor: "#333",
									color: "#fff",
									fontSize: "11px",
									cursor: "pointer",
								}}
							>
								{event.label}
							</button>
						))}
					</div>
				</div>

				{/* 채팅 */}
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#1a1a2e",
						borderRadius: "8px",
						overflow: "hidden",
					}}
				>
					{/* 메시지 목록 */}
					<div
						style={{
							flex: 1,
							overflowY: "auto",
							padding: "16px",
							display: "flex",
							flexDirection: "column",
							gap: "8px",
						}}
					>
						{messages.length === 0 && (
							<div style={{ color: "#666", textAlign: "center", marginTop: "50%" }}>
								캐럿에게 말을 걸어보세요! 🥕
							</div>
						)}
						{messages.map((msg, i) => (
							<div
								key={i}
								style={{
									alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
									maxWidth: "80%",
									padding: "8px 12px",
									borderRadius: "12px",
									backgroundColor: msg.role === "user" ? "#4CAF50" : "#333",
									color: "#fff",
								}}
							>
								{msg.text}
							</div>
						))}
						{isLoading && (
							<div
								style={{
									alignSelf: "flex-start",
									padding: "8px 12px",
									borderRadius: "12px",
									backgroundColor: "#333",
									color: "#888",
								}}
							>
								생각 중...
							</div>
						)}
					</div>

					{/* 입력 영역 */}
					<div
						style={{
							padding: "16px",
							borderTop: "1px solid #333",
							display: "flex",
							gap: "8px",
						}}
					>
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={isReady ? "메시지를 입력하세요..." : "API 키가 필요합니다"}
							disabled={!isReady || isLoading}
							style={{
								flex: 1,
								padding: "12px",
								borderRadius: "8px",
								border: "none",
								backgroundColor: "#333",
								color: "#fff",
								outline: "none",
							}}
						/>
						<button
							onClick={handleSend}
							disabled={!isReady || isLoading || !input.trim()}
							style={{
								padding: "12px 24px",
								borderRadius: "8px",
								border: "none",
								backgroundColor: isReady && input.trim() ? "#4CAF50" : "#333",
								color: "#fff",
								cursor: isReady && input.trim() ? "pointer" : "not-allowed",
							}}
						>
							전송
						</button>
					</div>
				</div>
			</div>

			{/* 에러 표시 */}
			{error && (
				<div
					style={{
						padding: "12px",
						borderRadius: "8px",
						backgroundColor: "#ff5252",
						color: "#fff",
					}}
				>
					에러: {error.message}
				</div>
			)}
		</div>
	)
}
