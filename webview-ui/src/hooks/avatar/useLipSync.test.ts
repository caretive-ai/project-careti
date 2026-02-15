// CARETI MODIFICATION: 립싱크 훅 테스트
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useLipSync } from "./useLipSync"

// Mock wlipsync
vi.mock("wlipsync", () => ({
	wLipSync: vi.fn(() => ({
		getVowelWeights: vi.fn(() => ({
			A: 0.5,
			E: 0.2,
			I: 0.1,
			O: 0.1,
			U: 0.1,
		})),
		getVolume: vi.fn(() => 0.7),
	})),
	wLipSyncNode: vi.fn(),
}))

// Mock AudioContext
class MockAudioContext {
	state = "running"
	createGain = vi.fn(() => ({
		connect: vi.fn(),
		gain: { value: 1 },
	}))
	createAnalyser = vi.fn(() => ({
		connect: vi.fn(),
		fftSize: 256,
		getByteFrequencyData: vi.fn(),
	}))
	createMediaStreamSource = vi.fn(() => ({
		connect: vi.fn(),
	}))
	resume = vi.fn()
	close = vi.fn()
}

// @ts-ignore
global.AudioContext = MockAudioContext

describe("useLipSync", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("초기화", () => {
		it("초기 상태가 올바르게 설정되어야 함", () => {
			const { result } = renderHook(() => useLipSync())

			expect(result.current.isActive).toBe(false)
			expect(result.current.mouthOpen).toBe(0)
			expect(result.current.vowelWeights).toEqual({
				A: 0,
				E: 0,
				I: 0,
				O: 0,
				U: 0,
			})
		})
	})

	describe("마이크 연결", () => {
		it("connectMicrophone이 함수로 존재해야 함", () => {
			const { result } = renderHook(() => useLipSync())

			expect(typeof result.current.connectMicrophone).toBe("function")
		})
	})

	describe("오디오 소스 연결", () => {
		it("connectAudioSource가 함수로 존재해야 함", () => {
			const { result } = renderHook(() => useLipSync())

			expect(typeof result.current.connectAudioSource).toBe("function")
		})
	})

	describe("정지", () => {
		it("stop 호출 시 isActive가 false가 되어야 함", () => {
			const { result } = renderHook(() => useLipSync())

			act(() => {
				result.current.stop()
			})

			expect(result.current.isActive).toBe(false)
		})
	})

	describe("VRM 표정 매핑", () => {
		it("getVRMExpressionValues가 올바른 형식을 반환해야 함", () => {
			const { result } = renderHook(() => useLipSync())

			const values = result.current.getVRMExpressionValues()

			expect(values).toHaveProperty("aa")
			expect(values).toHaveProperty("ee")
			expect(values).toHaveProperty("ih")
			expect(values).toHaveProperty("oh")
			expect(values).toHaveProperty("ou")
		})
	})
})
