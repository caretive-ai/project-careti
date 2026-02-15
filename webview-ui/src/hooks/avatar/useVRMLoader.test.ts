// CARETI MODIFICATION: VRM 로더 훅 테스트
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useVRMLoader } from "./useVRMLoader"

// Mock Three.js and VRM
vi.mock("three", () => ({
	WebGLRenderer: vi.fn(),
	Scene: vi.fn(),
	PerspectiveCamera: vi.fn(),
	AnimationMixer: vi.fn(() => ({
		clipAction: vi.fn(() => ({
			play: vi.fn(),
			stop: vi.fn(),
		})),
		update: vi.fn(),
	})),
	Clock: vi.fn(() => ({
		getDelta: vi.fn(() => 0.016),
	})),
}))

vi.mock("three/addons/loaders/GLTFLoader.js", () => ({
	GLTFLoader: vi.fn(() => ({
		register: vi.fn().mockReturnThis(),
		load: vi.fn((url, onLoad, onProgress, onError) => {
			// 테스트용 모의 VRM 데이터
			setTimeout(() => {
				onLoad({
					userData: {
						vrm: {
							scene: { name: "test-vrm" },
							expressionManager: {
								setValue: vi.fn(),
								getValue: vi.fn(() => 0),
							},
							lookAt: {
								target: null,
							},
						},
					},
				})
			}, 10)
		}),
	})),
}))

vi.mock("@pixiv/three-vrm", () => ({
	VRMLoaderPlugin: vi.fn(),
	VRMUtils: {
		removeUnnecessaryVertices: vi.fn(),
		removeUnnecessaryJoints: vi.fn(),
		combineSkeletons: vi.fn(),
		deepDispose: vi.fn(),
	},
}))

describe("useVRMLoader", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe("초기 상태", () => {
		it("로딩 전 상태가 올바르게 초기화되어야 함", () => {
			const { result } = renderHook(() => useVRMLoader())

			expect(result.current.vrm).toBeNull()
			expect(result.current.isLoading).toBe(false)
			expect(result.current.error).toBeNull()
			expect(result.current.progress).toBe(0)
		})
	})

	describe("VRM 로딩", () => {
		it("loadVRM 호출 시 isLoading이 true가 되어야 함", async () => {
			const { result } = renderHook(() => useVRMLoader())

			act(() => {
				result.current.loadVRM("/test-model.vrm")
			})

			expect(result.current.isLoading).toBe(true)
		})

		it("VRM 로딩 성공 시 vrm 객체가 설정되어야 함", async () => {
			const { result } = renderHook(() => useVRMLoader())

			act(() => {
				result.current.loadVRM("/test-model.vrm")
			})

			await waitFor(() => {
				expect(result.current.vrm).not.toBeNull()
			})

			expect(result.current.isLoading).toBe(false)
			expect(result.current.error).toBeNull()
		})

		it("로딩 중 progress가 업데이트되어야 함", async () => {
			const { result } = renderHook(() => useVRMLoader())

			act(() => {
				result.current.loadVRM("/test-model.vrm")
			})

			// progress는 onProgress 콜백에서 업데이트됨
			await waitFor(() => {
				expect(result.current.vrm).not.toBeNull()
			})
		})
	})

	describe("VRM 해제", () => {
		it("dispose 호출 시 vrm이 null이 되어야 함", async () => {
			const { result } = renderHook(() => useVRMLoader())

			act(() => {
				result.current.loadVRM("/test-model.vrm")
			})

			await waitFor(() => {
				expect(result.current.vrm).not.toBeNull()
			})

			act(() => {
				result.current.dispose()
			})

			expect(result.current.vrm).toBeNull()
		})
	})

	describe("표정 제어", () => {
		it("setExpression으로 표정을 설정할 수 있어야 함", async () => {
			const { result } = renderHook(() => useVRMLoader())

			act(() => {
				result.current.loadVRM("/test-model.vrm")
			})

			await waitFor(() => {
				expect(result.current.vrm).not.toBeNull()
			})

			act(() => {
				result.current.setExpression("happy", 1.0)
			})

			// expressionManager.setValue가 호출되었는지 확인
			expect(result.current.vrm?.expressionManager?.setValue).toHaveBeenCalledWith(
				"happy",
				1.0,
			)
		})
	})
})
