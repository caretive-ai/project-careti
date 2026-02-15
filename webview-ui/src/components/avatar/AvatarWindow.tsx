// CARETI MODIFICATION: 아바타 전용 윈도우 컴포넌트
import { useEffect, useState, useCallback } from "react"
import { AvatarScene } from "./AvatarScene"
import { useWorklogEvents, type WorklogEvent } from "../../hooks/avatar"

// __TAURI__ 타입은 useTauriEvents.ts에서 전역 선언됨

export interface AvatarWindowProps {
	/** VRM 모델 URL */
	modelUrl?: string
}

/**
 * Tauri 투명 윈도우용 아바타 컴포넌트
 * - 투명 배경
 * - 드래그 가능
 * - 메인 윈도우와 이벤트 통신
 */
export function AvatarWindow({ modelUrl = "/models/avatar.vrm" }: AvatarWindowProps) {
	const [isDragging, setIsDragging] = useState(false)
	const { emotion, message, handleEvent } = useWorklogEvents()

	// Tauri 이벤트 리스너
	useEffect(() => {
		const setupListeners = async () => {
			const tauri = window.__TAURI__
			if (!tauri) return

			// 메인 윈도우에서 오는 worklog 이벤트 수신
			const unlisten = await tauri.event.listen("worklog-event", (event) => {
				const payload = event as { payload: WorklogEvent }
				handleEvent(payload.payload)
			})

			return unlisten
		}

		const cleanup = setupListeners()
		return () => {
			cleanup.then((unlisten) => unlisten?.())
		}
	}, [handleEvent])

	// 윈도우 드래그
	const handleMouseDown = useCallback(async () => {
		// Tauri window API 접근 (타입 정의 외부의 appWindow 사용)
		const tauriWindow = (window as { __TAURI__?: { window?: { appWindow?: { startDragging?: () => Promise<void> } } } }).__TAURI__?.window
		if (!tauriWindow?.appWindow?.startDragging) return

		setIsDragging(true)
		try {
			await tauriWindow.appWindow.startDragging()
		} catch {
			// Tauri API가 없는 환경에서는 무시
		} finally {
			setIsDragging(false)
		}
	}, [])

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				backgroundColor: "transparent",
				cursor: isDragging ? "grabbing" : "grab",
				position: "relative",
			}}
			onMouseDown={handleMouseDown}
		>
			{/* 3D 아바타 */}
			<AvatarScene
				modelUrl={modelUrl}
				width={300}
				height={400}
				enableControls={false}
			/>

			{/* 감정 표시 (디버그용) */}
			{emotion !== "neutral" && (
				<div
					style={{
						position: "absolute",
						bottom: "10px",
						left: "50%",
						transform: "translateX(-50%)",
						padding: "4px 12px",
						borderRadius: "12px",
						backgroundColor: "rgba(0,0,0,0.7)",
						color: "#fff",
						fontSize: "12px",
						pointerEvents: "none",
					}}
				>
					{emotion}
				</div>
			)}

			{/* 메시지 말풍선 */}
			{message && (
				<div
					style={{
						position: "absolute",
						top: "10px",
						left: "50%",
						transform: "translateX(-50%)",
						maxWidth: "280px",
						padding: "8px 12px",
						borderRadius: "12px",
						backgroundColor: "rgba(255,255,255,0.95)",
						color: "#333",
						fontSize: "12px",
						boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
						pointerEvents: "none",
					}}
				>
					{message}
				</div>
			)}
		</div>
	)
}
