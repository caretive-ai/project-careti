// CARETI MODIFICATION: VRM 모델 로더 훅
// AIRI stage-ui-three/src/composables/vrm/core.ts 참조
import { useState, useCallback, useRef, useEffect } from "react"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm"
import type { VRM } from "@pixiv/three-vrm"

export interface UseVRMLoaderResult {
	vrm: VRM | null
	isLoading: boolean
	error: Error | null
	progress: number
	loadVRM: (url: string) => void
	dispose: () => void
	setExpression: (name: string, intensity: number) => void
}

/**
 * VRM 모델을 로드하고 관리하는 React 훅
 *
 * @example
 * ```tsx
 * const { vrm, isLoading, loadVRM, setExpression } = useVRMLoader()
 *
 * useEffect(() => {
 *   loadVRM('/models/avatar.vrm')
 * }, [])
 *
 * // 표정 설정
 * setExpression('happy', 0.8)
 * ```
 */
export function useVRMLoader(): UseVRMLoaderResult {
	const [vrm, setVrm] = useState<VRM | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)
	const [progress, setProgress] = useState(0)

	const loaderRef = useRef<GLTFLoader | null>(null)
	const currentUrlRef = useRef<string | null>(null)

	// GLTFLoader 초기화 (싱글톤)
	const getLoader = useCallback(() => {
		if (!loaderRef.current) {
			loaderRef.current = new GLTFLoader()
			loaderRef.current.register((parser) => new VRMLoaderPlugin(parser))
		}
		return loaderRef.current
	}, [])

	// VRM 로드
	const loadVRM = useCallback(
		(url: string) => {
			// 이미 같은 URL 로딩 중이면 무시
			if (currentUrlRef.current === url && isLoading) {
				return
			}

			// 기존 VRM 해제
			if (vrm) {
				VRMUtils.deepDispose(vrm.scene)
				setVrm(null)
			}

			currentUrlRef.current = url
			setIsLoading(true)
			setError(null)
			setProgress(0)

			const loader = getLoader()

			loader.load(
				url,
				// onLoad
				(gltf) => {
					const loadedVrm = gltf.userData.vrm as VRM | undefined

					if (!loadedVrm) {
						setError(new Error("VRM 데이터를 찾을 수 없습니다"))
						setIsLoading(false)
						return
					}

					// VRM 최적화 (AIRI 방식)
					VRMUtils.removeUnnecessaryVertices(loadedVrm.scene)
					VRMUtils.removeUnnecessaryJoints(loadedVrm.scene)
					VRMUtils.combineSkeletons(loadedVrm.scene)

					setVrm(loadedVrm)
					setIsLoading(false)
					setProgress(100)
				},
				// onProgress
				(event) => {
					if (event.lengthComputable) {
						const percent = (event.loaded / event.total) * 100
						setProgress(Math.round(percent))
					}
				},
				// onError
				(err) => {
					setError(err instanceof Error ? err : new Error(String(err)))
					setIsLoading(false)
					currentUrlRef.current = null
				},
			)
		},
		[vrm, isLoading, getLoader],
	)

	// VRM 해제
	const dispose = useCallback(() => {
		if (vrm) {
			VRMUtils.deepDispose(vrm.scene)
			setVrm(null)
		}
		currentUrlRef.current = null
		setProgress(0)
		setError(null)
	}, [vrm])

	// 표정 설정
	const setExpression = useCallback(
		(name: string, intensity: number) => {
			if (!vrm?.expressionManager) {
				return
			}

			// 강도 범위 제한 (0-1)
			const clampedIntensity = Math.max(0, Math.min(1, intensity))
			vrm.expressionManager.setValue(name, clampedIntensity)
		},
		[vrm],
	)

	// 컴포넌트 언마운트 시 정리
	useEffect(() => {
		return () => {
			if (vrm) {
				VRMUtils.deepDispose(vrm.scene)
			}
		}
	}, [vrm])

	return {
		vrm,
		isLoading,
		error,
		progress,
		loadVRM,
		dispose,
		setExpression,
	}
}
