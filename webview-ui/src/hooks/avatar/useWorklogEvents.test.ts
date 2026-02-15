// CARETI MODIFICATION: 작업 로그 이벤트 훅 테스트
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWorklogEvents } from "./useWorklogEvents"

describe("useWorklogEvents", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("초기화", () => {
		it("초기 상태가 올바르게 설정되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			expect(result.current.lastEvent).toBeNull()
			expect(result.current.emotion).toBe("neutral")
			expect(result.current.message).toBe("")
		})
	})

	describe("이벤트 처리", () => {
		it("commit 이벤트 시 happy 감정이 되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			act(() => {
				result.current.handleEvent({
					type: "commit",
					data: { message: "feat: add new feature" },
				})
			})

			expect(result.current.emotion).toBe("happy")
			expect(result.current.lastEvent?.type).toBe("commit")
		})

		it("error 이벤트 시 surprised 감정이 되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			act(() => {
				result.current.handleEvent({
					type: "error",
					data: { message: "Build failed" },
				})
			})

			expect(result.current.emotion).toBe("surprised")
		})

		it("test_pass 이벤트 시 happy 감정이 되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			act(() => {
				result.current.handleEvent({
					type: "test_pass",
					data: { count: 10 },
				})
			})

			expect(result.current.emotion).toBe("happy")
		})

		it("test_fail 이벤트 시 sad 감정이 되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			act(() => {
				result.current.handleEvent({
					type: "test_fail",
					data: { count: 3 },
				})
			})

			expect(result.current.emotion).toBe("sad")
		})

		it("thinking 이벤트 시 thinking 감정이 되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			act(() => {
				result.current.handleEvent({
					type: "thinking",
					data: {},
				})
			})

			expect(result.current.emotion).toBe("thinking")
		})
	})

	describe("메시지 생성", () => {
		it("commit 이벤트 시 축하 메시지가 생성되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			act(() => {
				result.current.handleEvent({
					type: "commit",
					data: { message: "fix: bug" },
				})
			})

			expect(result.current.message).toContain("커밋")
		})

		it("test_pass 이벤트 시 성공 메시지가 생성되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			act(() => {
				result.current.handleEvent({
					type: "test_pass",
					data: { count: 5 },
				})
			})

			expect(result.current.message).toContain("테스트")
		})
	})

	describe("콜백", () => {
		it("onEvent 콜백이 호출되어야 함", () => {
			const onEvent = vi.fn()
			const { result } = renderHook(() => useWorklogEvents({ onEvent }))

			act(() => {
				result.current.handleEvent({
					type: "commit",
					data: { message: "test" },
				})
			})

			expect(onEvent).toHaveBeenCalledTimes(1)
		})
	})

	describe("초기화", () => {
		it("reset 호출 시 상태가 초기화되어야 함", () => {
			const { result } = renderHook(() => useWorklogEvents())

			act(() => {
				result.current.handleEvent({
					type: "commit",
					data: { message: "test" },
				})
			})

			act(() => {
				result.current.reset()
			})

			expect(result.current.lastEvent).toBeNull()
			expect(result.current.emotion).toBe("neutral")
			expect(result.current.message).toBe("")
		})
	})
})
