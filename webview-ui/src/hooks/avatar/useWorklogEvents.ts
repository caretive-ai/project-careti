// CARETI MODIFICATION: 작업 로그 이벤트 → 아바타 반응 훅
import { useState, useCallback } from "react"
import type { AvatarEmotion } from "./useAvatarAI"

export type WorklogEventType =
	| "commit"
	| "push"
	| "pull"
	| "merge"
	| "branch"
	| "test_pass"
	| "test_fail"
	| "build_success"
	| "build_fail"
	| "error"
	| "thinking"
	| "idle"

export interface WorklogEvent {
	type: WorklogEventType
	data?: Record<string, unknown>
	timestamp?: number
}

export interface UseWorklogEventsOptions {
	/** 이벤트 발생 시 콜백 */
	onEvent?: (event: WorklogEvent, emotion: AvatarEmotion, message: string) => void
}

export interface UseWorklogEventsResult {
	/** 마지막 이벤트 */
	lastEvent: WorklogEvent | null
	/** 현재 감정 */
	emotion: AvatarEmotion
	/** 아바타 메시지 */
	message: string
	/** 이벤트 처리 */
	handleEvent: (event: WorklogEvent) => void
	/** 상태 초기화 */
	reset: () => void
}

// 이벤트 → 감정 매핑
const EVENT_TO_EMOTION: Record<WorklogEventType, AvatarEmotion> = {
	commit: "happy",
	push: "happy",
	pull: "neutral",
	merge: "happy",
	branch: "neutral",
	test_pass: "happy",
	test_fail: "sad",
	build_success: "happy",
	build_fail: "sad",
	error: "surprised",
	thinking: "thinking",
	idle: "neutral",
}

// 이벤트 → 메시지 템플릿
const EVENT_MESSAGES: Record<WorklogEventType, (data?: Record<string, unknown>) => string> = {
	commit: (data) => `커밋 완료! ${data?.message ? `"${data.message}"` : ""} 🎉`,
	push: () => "푸시했어요! 원격 저장소에 반영됐어요~",
	pull: () => "풀 완료! 최신 코드를 가져왔어요.",
	merge: () => "머지 성공! 브랜치가 합쳐졌어요~ 🎊",
	branch: (data) => `새 브랜치 '${data?.name || "unknown"}' 생성!`,
	test_pass: (data) => `테스트 ${data?.count || "모두"} 통과! 잘했어요! ✅`,
	test_fail: (data) => `테스트 ${data?.count || "일부"} 실패... 확인해볼까요? 😢`,
	build_success: () => "빌드 성공! 🚀",
	build_fail: () => "빌드 실패했어요... 에러를 확인해봐요!",
	error: (data) => `에러가 발생했어요! ${data?.message || ""} 😱`,
	thinking: () => "음... 생각 중이에요... 🤔",
	idle: () => "",
}

/**
 * git-worklog 이벤트를 아바타 반응으로 변환하는 훅
 *
 * @example
 * ```tsx
 * const { handleEvent, emotion, message } = useWorklogEvents({
 *   onEvent: (event, emotion, message) => {
 *     console.log(`Event: ${event.type}, Emotion: ${emotion}`)
 *   }
 * })
 *
 * // 이벤트 발생 시
 * handleEvent({ type: 'commit', data: { message: 'fix: bug' } })
 * ```
 */
export function useWorklogEvents(options?: UseWorklogEventsOptions): UseWorklogEventsResult {
	const [lastEvent, setLastEvent] = useState<WorklogEvent | null>(null)
	const [emotion, setEmotion] = useState<AvatarEmotion>("neutral")
	const [message, setMessage] = useState("")

	// 이벤트 처리
	const handleEvent = useCallback(
		(event: WorklogEvent) => {
			const eventWithTimestamp: WorklogEvent = {
				...event,
				timestamp: event.timestamp || Date.now(),
			}

			const newEmotion = EVENT_TO_EMOTION[event.type] || "neutral"
			const newMessage = EVENT_MESSAGES[event.type]?.(event.data) || ""

			setLastEvent(eventWithTimestamp)
			setEmotion(newEmotion)
			setMessage(newMessage)

			// 콜백 호출
			options?.onEvent?.(eventWithTimestamp, newEmotion, newMessage)
		},
		[options],
	)

	// 상태 초기화
	const reset = useCallback(() => {
		setLastEvent(null)
		setEmotion("neutral")
		setMessage("")
	}, [])

	return {
		lastEvent,
		emotion,
		message,
		handleEvent,
		reset,
	}
}
