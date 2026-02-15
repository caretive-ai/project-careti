// CARETI MODIFICATION: Tauri 윈도우 간 이벤트 통신 훅
import { useCallback } from "react"
import type { WorklogEvent } from "./useWorklogEvents"

declare global {
	interface Window {
		__TAURI__?: {
			event: {
				listen: <T>(event: string, handler: (payload: { payload: T }) => void) => Promise<() => void>
				emit: (event: string, payload: unknown) => Promise<void>
			}
			window: {
				WebviewWindow: new (label: string, options?: Record<string, unknown>) => {
					emit: (event: string, payload: unknown) => Promise<void>
					show: () => Promise<void>
					hide: () => Promise<void>
					close: () => Promise<void>
				}
				getByLabel: (label: string) => {
					emit: (event: string, payload: unknown) => Promise<void>
					show: () => Promise<void>
					hide: () => Promise<void>
				} | null
			}
		}
	}
}

export interface UseTauriEventsResult {
	/** Tauri 사용 가능 여부 */
	isAvailable: boolean
	/** 아바타 윈도우에 이벤트 전송 */
	sendToAvatar: (event: WorklogEvent) => Promise<void>
	/** 아바타 윈도우 표시 */
	showAvatarWindow: () => Promise<void>
	/** 아바타 윈도우 숨기기 */
	hideAvatarWindow: () => Promise<void>
	/** 전역 이벤트 발송 */
	emitEvent: (eventName: string, payload: unknown) => Promise<void>
}

/**
 * Tauri 윈도우 간 통신을 위한 훅
 *
 * @example
 * ```tsx
 * const { sendToAvatar, showAvatarWindow } = useTauriEvents()
 *
 * // 아바타 윈도우에 이벤트 전송
 * await sendToAvatar({ type: 'commit', data: { message: 'fix: bug' } })
 *
 * // 아바타 윈도우 표시
 * await showAvatarWindow()
 * ```
 */
export function useTauriEvents(): UseTauriEventsResult {
	const isAvailable = typeof window !== "undefined" && !!window.__TAURI__

	// 아바타 윈도우에 이벤트 전송
	const sendToAvatar = useCallback(async (event: WorklogEvent) => {
		const tauri = window.__TAURI__
		if (!tauri) {
			console.warn("Tauri not available")
			return
		}

		try {
			// 전역 이벤트로 발송 (모든 윈도우가 수신)
			await tauri.event.emit("worklog-event", event)
		} catch (error) {
			console.error("Failed to send event to avatar:", error)
		}
	}, [])

	// 아바타 윈도우 표시
	const showAvatarWindow = useCallback(async () => {
		const tauri = window.__TAURI__
		if (!tauri) return

		try {
			const avatarWindow = tauri.window.getByLabel("avatar")
			if (avatarWindow) {
				await avatarWindow.show()
			}
		} catch (error) {
			console.error("Failed to show avatar window:", error)
		}
	}, [])

	// 아바타 윈도우 숨기기
	const hideAvatarWindow = useCallback(async () => {
		const tauri = window.__TAURI__
		if (!tauri) return

		try {
			const avatarWindow = tauri.window.getByLabel("avatar")
			if (avatarWindow) {
				await avatarWindow.hide()
			}
		} catch (error) {
			console.error("Failed to hide avatar window:", error)
		}
	}, [])

	// 전역 이벤트 발송
	const emitEvent = useCallback(async (eventName: string, payload: unknown) => {
		const tauri = window.__TAURI__
		if (!tauri) return

		try {
			await tauri.event.emit(eventName, payload)
		} catch (error) {
			console.error(`Failed to emit event ${eventName}:`, error)
		}
	}, [])

	return {
		isAvailable,
		sendToAvatar,
		showAvatarWindow,
		hideAvatarWindow,
		emitEvent,
	}
}
