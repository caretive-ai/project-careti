// CARETI MODIFICATION: 아바타 컨테이너 (feature flag 기반)
import { useState, useCallback, useEffect } from "react"
import { getCurrentFeatureConfig } from "../../careti/shared/FeatureConfig"
import { AvatarScene } from "./AvatarScene"
import { AvatarStatus, type AvatarState } from "./AvatarStatus"

// Debug log
console.log("[AvatarContainer] Module loaded")

export interface AvatarContainerProps {
	/** 현재 아바타 상태 */
	state?: AvatarState
	/** VRM 모델 URL */
	modelUrl?: string
	/** 최소화 상태 변경 콜백 */
	onMinimizeChange?: (minimized: boolean) => void
	/** 설정 버튼 클릭 콜백 */
	onSettingsClick?: () => void
}

/**
 * 아바타 컨테이너 컴포넌트
 * - feature flag 기반 렌더링 (showAvatarSettings)
 * - 접기/펼치기 기능
 * - 4가지 상태 표시 (세션시작, Thinking, Say, Complete)
 */
export function AvatarContainer({
	state = "idle",
	modelUrl = "/models/avatar.vrm",
	onMinimizeChange,
	onSettingsClick,
}: AvatarContainerProps) {
	const config = getCurrentFeatureConfig()
	const [isMinimized, setIsMinimized] = useState(false)

	// Debug
	useEffect(() => {
		console.log("[AvatarContainer] Rendered", { state, modelUrl, showAvatarSettings: config.showAvatarSettings })
	}, [state, modelUrl, config.showAvatarSettings])

	// feature flag 체크
	if (!config.showAvatarSettings) {
		console.log("[AvatarContainer] Skipped - showAvatarSettings is false")
		return null
	}

	const handleToggleMinimize = useCallback(() => {
		const newState = !isMinimized
		setIsMinimized(newState)
		onMinimizeChange?.(newState)
	}, [isMinimized, onMinimizeChange])

	// 최소화 상태
	if (isMinimized) {
		return (
			<div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b border-[#2a2a4e]">
				<div className="flex items-center gap-2">
					<span className="text-sm text-white/80">🎭 Avatar</span>
					<AvatarStatus state={state} compact />
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleToggleMinimize}
						className="p-1 text-white/60 hover:text-white/90 transition-colors"
						title="펼치기"
					>
						+
					</button>
					<button
						type="button"
						onClick={onSettingsClick}
						className="p-1 text-white/60 hover:text-white/90 transition-colors"
						title="설정"
					>
						⚙️
					</button>
				</div>
			</div>
		)
	}

	// 전체 표시 상태
	return (
		<div className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-b border-[#2a2a4e]">
			{/* 헤더 바 - 고정 높이 */}
			<div className="flex items-center justify-between px-3 py-1">
				<span className="text-xs text-white/60">🎭 Avatar</span>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleToggleMinimize}
						className="p-1 text-white/60 hover:text-white/90 transition-colors text-sm"
						title="최소화"
					>
						−
					</button>
					<button
						type="button"
						onClick={onSettingsClick}
						className="p-1 text-white/60 hover:text-white/90 transition-colors text-sm"
						title="설정"
					>
						⚙️
					</button>
				</div>
			</div>

			{/* 아바타 씬 */}
			<div className="relative" style={{ height: "180px" }}>
				<AvatarScene
					modelUrl={modelUrl}
					width={368}
					height={180}
					state={state}
					enableControls={true}
				/>
				{/* 상태 배지 - 우하단 */}
				<div className="absolute bottom-2 right-2">
					<AvatarStatus state={state} compact />
				</div>
			</div>
		</div>
	)
}
