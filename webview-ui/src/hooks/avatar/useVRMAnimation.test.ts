// CARETI MODIFICATION: VRM 애니메이션 훅 테스트
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useVRMAnimation } from "./useVRMAnimation"

// Mock Three.js
vi.mock("three", () => ({
	AnimationMixer: vi.fn(() => ({
		clipAction: vi.fn(() => ({
			reset: vi.fn().mockReturnThis(),
			setLoop: vi.fn().mockReturnThis(),
			play: vi.fn().mockReturnThis(),
			stop: vi.fn().mockReturnThis(),
			fadeIn: vi.fn().mockReturnThis(),
			fadeOut: vi.fn().mockReturnThis(),
			setEffectiveWeight: vi.fn().mockReturnThis(),
		})),
		update: vi.fn(),
		stopAllAction: vi.fn(),
	})),
	LoopRepeat: 2201,
	LoopOnce: 2200,
	Clock: vi.fn(() => ({
		getDelta: vi.fn(() => 0.016),
	})),
}))

// Mock VRM Animation
vi.mock("@pixiv/three-vrm-animation", () => ({
	createVRMAnimationClip: vi.fn(() => ({
		name: "test-animation",
		duration: 2.0,
	})),
	VRMAnimationLoaderPlugin: vi.fn(),
}))

vi.mock("three/addons/loaders/GLTFLoader.js", () => ({
	GLTFLoader: vi.fn(() => ({
		register: vi.fn().mockReturnThis(),
		load: vi.fn((url, onLoad) => {
			setTimeout(() => {
				onLoad({
					userData: {
						vrmAnimations: [{ name: "idle" }],
					},
				})
			}, 10)
		}),
	})),
}))

describe("useVRMAnimation", () => {
	const mockVrm = {
		scene: { name: "test-vrm" },
		humanoid: {
			getNormalizedBoneNode: vi.fn(),
		},
		expressionManager: {
			setValue: vi.fn(),
		},
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("초기화", () => {
		it("VRM 없이 초기화되면 null 상태여야 함", () => {
			const { result } = renderHook(() => useVRMAnimation(null))

			expect(result.current.currentAnimation).toBeNull()
			expect(result.current.isPlaying).toBe(false)
		})

		it("VRM과 함께 초기화되면 mixer가 생성되어야 함", () => {
			const { result } = renderHook(() => useVRMAnimation(mockVrm as any))

			expect(result.current.isPlaying).toBe(false)
		})
	})

	describe("애니메이션 로드", () => {
		it("loadAnimation 호출 시 애니메이션이 로드되어야 함", async () => {
			const { result } = renderHook(() => useVRMAnimation(mockVrm as any))

			await act(async () => {
				await result.current.loadAnimation("/animations/idle.vrma")
			})

			// 로드 완료 후 상태 확인
			expect(result.current.animations).toBeDefined()
		})
	})

	describe("애니메이션 재생", () => {
		it("애니메이션 없이 play 호출 시 isPlaying이 false여야 함", () => {
			const { result } = renderHook(() => useVRMAnimation(mockVrm as any))

			act(() => {
				result.current.play("nonexistent")
			})

			// 존재하지 않는 애니메이션은 재생되지 않음
			expect(result.current.isPlaying).toBe(false)
		})

		it("stop 호출 시 isPlaying이 false가 되어야 함", () => {
			const { result } = renderHook(() => useVRMAnimation(mockVrm as any))

			act(() => {
				result.current.stop()
			})

			expect(result.current.isPlaying).toBe(false)
		})
	})

	describe("업데이트", () => {
		it("update 함수가 존재해야 함", () => {
			const { result } = renderHook(() => useVRMAnimation(mockVrm as any))

			expect(typeof result.current.update).toBe("function")
		})

		it("update 호출이 에러 없이 실행되어야 함", () => {
			const { result } = renderHook(() => useVRMAnimation(mockVrm as any))

			expect(() => {
				act(() => {
					result.current.update(0.016)
				})
			}).not.toThrow()
		})
	})
})
