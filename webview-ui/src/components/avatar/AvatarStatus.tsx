// CARETI MODIFICATION: 아바타 상태 표시 컴포넌트 (4가지 하드코딩 상태)

export type AvatarState = "idle" | "greeting" | "thinking" | "speaking" | "complete"

export interface AvatarStatusProps {
	/** 현재 상태 */
	state: AvatarState
	/** 컴팩트 모드 (최소화 상태에서 사용) */
	compact?: boolean
}

interface StateConfig {
	emoji: string
	text: string
	color: string
}

const STATE_CONFIG: Record<AvatarState, StateConfig> = {
	idle: {
		emoji: "😐",
		text: "대기 중",
		color: "text-gray-400",
	},
	greeting: {
		emoji: "😊",
		text: "안녕하세요!",
		color: "text-green-400",
	},
	thinking: {
		emoji: "🤔",
		text: "생각 중...",
		color: "text-yellow-400",
	},
	speaking: {
		emoji: "😊",
		text: "말하는 중",
		color: "text-blue-400",
	},
	complete: {
		emoji: "😄",
		text: "완료!",
		color: "text-green-400",
	},
}

/**
 * 아바타 상태 뱃지 컴포넌트
 *
 * 1단계: 하드코딩 4상태
 * - greeting: 세션 시작 시 😊
 * - thinking: AI 응답 대기 🤔
 * - speaking: AI 응답 출력 😊
 * - complete: AI 응답 완료 😄
 */
export function AvatarStatus({ state, compact = false }: AvatarStatusProps) {
	const config = STATE_CONFIG[state] || STATE_CONFIG.idle

	if (compact) {
		return (
			<span className={`text-sm ${config.color}`}>
				{config.emoji} {config.text}
			</span>
		)
	}

	return (
		<div className="flex flex-col items-center gap-1">
			<span className="text-4xl">{config.emoji}</span>
			<span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
		</div>
	)
}
