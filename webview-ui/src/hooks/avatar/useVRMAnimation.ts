// CARETI MODIFICATION: VRM 애니메이션 훅
// AIRI stage-ui-three/src/composables/vrm/animation.ts 참조
import { useState, useCallback, useRef, useEffect } from "react"
import { AnimationMixer, AnimationAction, AnimationClip, LoopRepeat, LoopOnce } from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { createVRMAnimationClip, VRMAnimationLoaderPlugin } from "@pixiv/three-vrm-animation"
import type { VRM } from "@pixiv/three-vrm"
import type { VRMAnimation } from "@pixiv/three-vrm-animation"

export interface UseVRMAnimationResult {
	/** 현재 재생 중인 애니메이션 이름 */
	currentAnimation: string | null
	/** 재생 중 여부 */
	isPlaying: boolean
	/** 로드된 애니메이션 목록 */
	animations: Map<string, AnimationClip>
	/** 애니메이션 로드 */
	loadAnimation: (url: string) => Promise<void>
	/** 애니메이션 재생 */
	play: (name: string, loop?: boolean) => void
	/** 애니메이션 정지 */
	stop: () => void
	/** 크로스페이드 전환 */
	crossFade: (toName: string, duration?: number) => void
	/** 매 프레임 업데이트 (useFrame에서 호출) */
	update: (delta: number) => void
}

/**
 * VRM 애니메이션을 관리하는 React 훅
 *
 * @example
 * ```tsx
 * const { loadAnimation, play, update } = useVRMAnimation(vrm)
 *
 * useEffect(() => {
 *   loadAnimation('/animations/idle.vrma')
 * }, [])
 *
 * useFrame((_, delta) => {
 *   update(delta)
 * })
 *
 * // 재생
 * play('idle', true)
 * ```
 */
export function useVRMAnimation(vrm: VRM | null): UseVRMAnimationResult {
	const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [animations] = useState<Map<string, AnimationClip>>(() => new Map())

	const mixerRef = useRef<AnimationMixer | null>(null)
	const actionsRef = useRef<Map<string, AnimationAction>>(new Map())
	const loaderRef = useRef<GLTFLoader | null>(null)

	// Mixer 초기화
	useEffect(() => {
		if (!vrm) {
			mixerRef.current = null
			return
		}

		mixerRef.current = new AnimationMixer(vrm.scene)

		return () => {
			mixerRef.current?.stopAllAction()
			mixerRef.current = null
		}
	}, [vrm])

	// GLTFLoader 초기화 (싱글톤)
	const getLoader = useCallback(() => {
		if (!loaderRef.current) {
			loaderRef.current = new GLTFLoader()
			loaderRef.current.register((parser) => new VRMAnimationLoaderPlugin(parser))
		}
		return loaderRef.current
	}, [])

	// 애니메이션 로드
	const loadAnimation = useCallback(
		async (url: string): Promise<void> => {
			if (!vrm) return

			const loader = getLoader()

			return new Promise((resolve, reject) => {
				loader.load(
					url,
					(gltf) => {
						const vrmAnimations = gltf.userData.vrmAnimations as VRMAnimation[] | undefined

						if (!vrmAnimations || vrmAnimations.length === 0) {
							reject(new Error("VRM 애니메이션을 찾을 수 없습니다"))
							return
						}

						// 모든 애니메이션을 클립으로 변환
						for (const vrmAnim of vrmAnimations) {
							const clip = createVRMAnimationClip(vrmAnim, vrm)
							animations.set(clip.name, clip)
						}

						resolve()
					},
					undefined,
					(error) => {
						reject(error)
					},
				)
			})
		},
		[vrm, animations, getLoader],
	)

	// 애니메이션 재생
	const play = useCallback(
		(name: string, loop = true) => {
			if (!mixerRef.current || !vrm) return

			const clip = animations.get(name)
			if (!clip) {
				console.warn(`애니메이션 '${name}'을 찾을 수 없습니다`)
				return
			}

			// 기존 액션 가져오기 또는 생성
			let action = actionsRef.current.get(name)
			if (!action) {
				action = mixerRef.current.clipAction(clip)
				actionsRef.current.set(name, action)
			}

			// 루프 설정
			action.setLoop(loop ? LoopRepeat : LoopOnce, Infinity)
			action.reset().play()

			setCurrentAnimation(name)
			setIsPlaying(true)
		},
		[vrm, animations],
	)

	// 애니메이션 정지
	const stop = useCallback(() => {
		mixerRef.current?.stopAllAction()
		setCurrentAnimation(null)
		setIsPlaying(false)
	}, [])

	// 크로스페이드 전환
	const crossFade = useCallback(
		(toName: string, duration = 0.5) => {
			if (!mixerRef.current || !vrm) return

			const toClip = animations.get(toName)
			if (!toClip) {
				console.warn(`애니메이션 '${toName}'을 찾을 수 없습니다`)
				return
			}

			// 현재 액션
			const fromAction = currentAnimation ? actionsRef.current.get(currentAnimation) : null

			// 대상 액션 가져오기 또는 생성
			let toAction = actionsRef.current.get(toName)
			if (!toAction) {
				toAction = mixerRef.current.clipAction(toClip)
				actionsRef.current.set(toName, toAction)
			}

			// 크로스페이드 실행
			if (fromAction) {
				fromAction.fadeOut(duration)
			}

			toAction.reset().setEffectiveWeight(1).fadeIn(duration).play()

			setCurrentAnimation(toName)
			setIsPlaying(true)
		},
		[vrm, animations, currentAnimation],
	)

	// 프레임 업데이트
	const update = useCallback((delta: number) => {
		mixerRef.current?.update(delta)
	}, [])

	return {
		currentAnimation,
		isPlaying,
		animations,
		loadAnimation,
		play,
		stop,
		crossFade,
		update,
	}
}
