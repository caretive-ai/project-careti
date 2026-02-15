// CARETI MODIFICATION: 립싱크 훅
// AIRI model-driver-lipsync 참조
import { useState, useCallback, useRef, useEffect } from "react"

export interface VowelWeights {
	A: number
	E: number
	I: number
	O: number
	U: number
}

export interface VRMExpressionValues {
	aa: number // あ (A)
	ee: number // え (E)
	ih: number // い (I)
	oh: number // お (O)
	ou: number // う (U)
}

export interface UseLipSyncResult {
	/** 립싱크 활성화 여부 */
	isActive: boolean
	/** 입 벌림 정도 (0-1) */
	mouthOpen: number
	/** 모음별 가중치 */
	vowelWeights: VowelWeights
	/** 마이크 연결 */
	connectMicrophone: () => Promise<void>
	/** 오디오 소스 연결 */
	connectAudioSource: (source: AudioBufferSourceNode | MediaElementAudioSourceNode) => void
	/** 정지 */
	stop: () => void
	/** VRM 표정 값 반환 */
	getVRMExpressionValues: () => VRMExpressionValues
	/** 프레임 업데이트 (useFrame에서 호출) */
	update: () => void
}

// 볼륨 기반 간단한 립싱크 (wLipSync 대체)
// 실제 wLipSync는 MFCC 기반이지만, 여기서는 볼륨 기반으로 단순화
const SMOOTHING = 0.3
const THRESHOLD = 0.01

/**
 * 음성 기반 립싱크를 처리하는 React 훅
 *
 * @example
 * ```tsx
 * const { connectMicrophone, mouthOpen, getVRMExpressionValues } = useLipSync()
 *
 * // 마이크 연결
 * await connectMicrophone()
 *
 * // VRM 표정에 적용
 * useFrame(() => {
 *   const values = getVRMExpressionValues()
 *   vrm.expressionManager.setValue('aa', values.aa)
 * })
 * ```
 */
export function useLipSync(): UseLipSyncResult {
	const [isActive, setIsActive] = useState(false)
	const [mouthOpen, setMouthOpen] = useState(0)
	const [vowelWeights, setVowelWeights] = useState<VowelWeights>({
		A: 0,
		E: 0,
		I: 0,
		O: 0,
		U: 0,
	})

	const audioContextRef = useRef<AudioContext | null>(null)
	const analyserRef = useRef<AnalyserNode | null>(null)
	const dataArrayRef = useRef<Uint8Array | null>(null)
	const sourceRef = useRef<AudioNode | null>(null)
	const animationFrameRef = useRef<number | null>(null)

	// 오디오 분석 초기화
	const initAudioContext = useCallback(() => {
		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContext()
		}

		if (!analyserRef.current) {
			analyserRef.current = audioContextRef.current.createAnalyser()
			analyserRef.current.fftSize = 256
			analyserRef.current.smoothingTimeConstant = SMOOTHING
			dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
		}

		return { audioContext: audioContextRef.current, analyser: analyserRef.current }
	}, [])

	// 볼륨 및 모음 분석
	const analyzeAudio = useCallback(() => {
		if (!analyserRef.current || !dataArrayRef.current) return

		analyserRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>)

		// 평균 볼륨 계산
		const sum = dataArrayRef.current.reduce((acc, val) => acc + val, 0)
		const average = sum / dataArrayRef.current.length / 255

		// 임계값 이하면 입 다물기
		if (average < THRESHOLD) {
			setMouthOpen(0)
			setVowelWeights({ A: 0, E: 0, I: 0, O: 0, U: 0 })
			return
		}

		// 입 벌림 정도
		const newMouthOpen = Math.min(1, average * 2)
		setMouthOpen(newMouthOpen)

		// 주파수 대역별 모음 추정 (단순화)
		const low = dataArrayRef.current.slice(0, 4).reduce((a, b) => a + b, 0) / 4 / 255
		const mid = dataArrayRef.current.slice(4, 8).reduce((a, b) => a + b, 0) / 4 / 255
		const high = dataArrayRef.current.slice(8, 16).reduce((a, b) => a + b, 0) / 8 / 255

		// 모음 가중치 (휴리스틱)
		const weights: VowelWeights = {
			A: Math.min(1, low * 1.5) * newMouthOpen, // 낮은 주파수 → あ
			E: Math.min(1, mid * 1.2) * newMouthOpen, // 중간 주파수 → え
			I: Math.min(1, high * 1.0) * newMouthOpen, // 높은 주파수 → い
			O: Math.min(1, (low + mid) * 0.7) * newMouthOpen, // 낮은+중간 → お
			U: Math.min(1, low * 0.8) * newMouthOpen, // 낮은 주파수 → う
		}

		setVowelWeights(weights)
	}, [])

	// 마이크 연결
	const connectMicrophone = useCallback(async () => {
		try {
			const { audioContext, analyser } = initAudioContext()

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			const source = audioContext.createMediaStreamSource(stream)
			source.connect(analyser)

			sourceRef.current = source
			setIsActive(true)
		} catch (error) {
			console.error("마이크 연결 실패:", error)
			throw error
		}
	}, [initAudioContext])

	// 오디오 소스 연결
	const connectAudioSource = useCallback(
		(source: AudioBufferSourceNode | MediaElementAudioSourceNode) => {
			const { analyser } = initAudioContext()

			source.connect(analyser)
			analyser.connect(audioContextRef.current!.destination)

			sourceRef.current = source
			setIsActive(true)
		},
		[initAudioContext],
	)

	// 정지
	const stop = useCallback(() => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current)
			animationFrameRef.current = null
		}

		if (sourceRef.current) {
			sourceRef.current.disconnect()
			sourceRef.current = null
		}

		setIsActive(false)
		setMouthOpen(0)
		setVowelWeights({ A: 0, E: 0, I: 0, O: 0, U: 0 })
	}, [])

	// VRM 표정 값 반환
	const getVRMExpressionValues = useCallback((): VRMExpressionValues => {
		return {
			aa: vowelWeights.A,
			ee: vowelWeights.E,
			ih: vowelWeights.I,
			oh: vowelWeights.O,
			ou: vowelWeights.U,
		}
	}, [vowelWeights])

	// 프레임 업데이트
	const update = useCallback(() => {
		if (isActive) {
			analyzeAudio()
		}
	}, [isActive, analyzeAudio])

	// 정리
	useEffect(() => {
		return () => {
			stop()
			if (audioContextRef.current) {
				audioContextRef.current.close()
				audioContextRef.current = null
			}
		}
	}, [stop])

	return {
		isActive,
		mouthOpen,
		vowelWeights,
		connectMicrophone,
		connectAudioSource,
		stop,
		getVRMExpressionValues,
		update,
	}
}
