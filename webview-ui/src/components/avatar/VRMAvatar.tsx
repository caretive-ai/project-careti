// CARETI MODIFICATION: VRM 아바타 렌더링 컴포넌트
// AIRI stage-ui-three/src/components/Model/VRMModel.vue 참조
import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import type { VRM } from "@pixiv/three-vrm"
import type { Group } from "three"
import type { AvatarState } from "./AvatarStatus"

// 상태별 표정 설정
const EXPRESSION_CONFIG: Record<AvatarState, { expression: string; intensity: number }> = {
	idle: { expression: "neutral", intensity: 0 },
	greeting: { expression: "happy", intensity: 0.7 },
	thinking: { expression: "neutral", intensity: 0 },
	speaking: { expression: "happy", intensity: 0.5 },
	complete: { expression: "happy", intensity: 0.8 },
}

export interface VRMAvatarProps {
	/** VRM 객체 */
	vrm: VRM
	/** 현재 상태 */
	state?: AvatarState
	/** 위치 오프셋 */
	position?: [number, number, number]
	/** Y축 회전 (라디안) */
	rotationY?: number
	/** 애니메이션 일시정지 */
	paused?: boolean
}

/**
 * VRM 모델을 렌더링하는 컴포넌트
 * R3F의 useFrame을 사용하여 매 프레임 업데이트
 */
export function VRMAvatar({
	vrm,
	state = "idle",
	position = [0, 0, 0],
	rotationY = 0,
	paused = false,
}: VRMAvatarProps) {
	const groupRef = useRef<Group>(null)
	const blinkTimerRef = useRef(0)
	const mouthTimerRef = useRef(0)

	// VRM 초기 설정
	useEffect(() => {
		if (!vrm) return

		// frustumCulled 비활성화 (NPR 스타일 필요)
		vrm.scene.traverse((obj) => {
			obj.frustumCulled = false
		})

		// 팔 내리기 (T-pose → 자연스러운 포즈)
		const humanoid = vrm.humanoid
		if (humanoid) {
			const leftUpperArm = humanoid.getNormalizedBoneNode("leftUpperArm")
			const rightUpperArm = humanoid.getNormalizedBoneNode("rightUpperArm")
			if (leftUpperArm) {
				leftUpperArm.rotation.z = -1.3
			}
			if (rightUpperArm) {
				rightUpperArm.rotation.z = 1.3
			}
			vrm.scene.updateMatrixWorld(true)
		}
	}, [vrm])

	// 상태 변경 시 표정 업데이트
	useEffect(() => {
		if (!vrm?.expressionManager) return

		const config = EXPRESSION_CONFIG[state]

		// 모든 표정 리셋
		vrm.expressionManager.setValue("happy", 0)
		vrm.expressionManager.setValue("angry", 0)
		vrm.expressionManager.setValue("sad", 0)
		vrm.expressionManager.setValue("surprised", 0)
		vrm.expressionManager.setValue("neutral", 0)

		// 현재 상태 표정 적용
		if (config.expression !== "neutral") {
			vrm.expressionManager.setValue(config.expression, config.intensity)
		}
	}, [vrm, state])

	// 매 프레임 업데이트
	useFrame((_, delta) => {
		if (!vrm || paused) return

		const expressionManager = vrm.expressionManager
		if (expressionManager) {
			// 자동 눈 깜빡임
			blinkTimerRef.current += delta
			if (blinkTimerRef.current > 3 + Math.random() * 2) {
				// 3~5초마다 깜빡임
				expressionManager.setValue("blink", 1)
				setTimeout(() => {
					expressionManager?.setValue("blink", 0)
				}, 100)
				blinkTimerRef.current = 0
			}

			// speaking 상태일 때 입 움직임
			if (state === "speaking") {
				mouthTimerRef.current += delta * 8 // 속도 조절
				const mouthValue = (Math.sin(mouthTimerRef.current) + 1) / 2 * 0.5 // 0~0.5
				expressionManager.setValue("aa", mouthValue)
			} else {
				expressionManager.setValue("aa", 0)
				mouthTimerRef.current = 0
			}

			// thinking 상태일 때 눈 반쯤 감기
			if (state === "thinking") {
				expressionManager.setValue("blink", 0.3)
			}
		}

		// VRM 업데이트
		vrm.update(delta)
	})

	if (!vrm) return null

	return (
		<group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
			<primitive object={vrm.scene} />
		</group>
	)
}
