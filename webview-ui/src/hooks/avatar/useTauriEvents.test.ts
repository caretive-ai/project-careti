// CARETI MODIFICATION: Tauri 이벤트 훅 테스트
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useTauriEvents } from "./useTauriEvents"

describe("useTauriEvents", () => {
	const mockEmit = vi.fn()
	const mockShow = vi.fn()
	const mockHide = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		// @ts-ignore
		delete window.__TAURI__
	})

	describe("Tauri 미설치 환경", () => {
		it("isAvailable이 false여야 함", () => {
			const { result } = renderHook(() => useTauriEvents())

			expect(result.current.isAvailable).toBe(false)
		})

		it("sendToAvatar가 에러 없이 실행되어야 함", async () => {
			const { result } = renderHook(() => useTauriEvents())

			await expect(
				act(async () => {
					await result.current.sendToAvatar({ type: "commit", data: {} })
				}),
			).resolves.not.toThrow()
		})
	})

	describe("Tauri 설치 환경", () => {
		beforeEach(() => {
			// @ts-ignore
			window.__TAURI__ = {
				event: {
					emit: mockEmit,
					listen: vi.fn(),
				},
				window: {
					WebviewWindow: vi.fn(),
					getByLabel: vi.fn(() => ({
						show: mockShow,
						hide: mockHide,
						emit: mockEmit,
					})),
				},
			}
		})

		it("isAvailable이 true여야 함", () => {
			const { result } = renderHook(() => useTauriEvents())

			expect(result.current.isAvailable).toBe(true)
		})

		it("sendToAvatar가 emit을 호출해야 함", async () => {
			const { result } = renderHook(() => useTauriEvents())

			await act(async () => {
				await result.current.sendToAvatar({ type: "commit", data: { message: "test" } })
			})

			expect(mockEmit).toHaveBeenCalledWith("worklog-event", {
				type: "commit",
				data: { message: "test" },
			})
		})

		it("showAvatarWindow가 show를 호출해야 함", async () => {
			const { result } = renderHook(() => useTauriEvents())

			await act(async () => {
				await result.current.showAvatarWindow()
			})

			expect(mockShow).toHaveBeenCalled()
		})

		it("hideAvatarWindow가 hide를 호출해야 함", async () => {
			const { result } = renderHook(() => useTauriEvents())

			await act(async () => {
				await result.current.hideAvatarWindow()
			})

			expect(mockHide).toHaveBeenCalled()
		})

		it("emitEvent가 지정된 이벤트를 발송해야 함", async () => {
			const { result } = renderHook(() => useTauriEvents())

			await act(async () => {
				await result.current.emitEvent("custom-event", { foo: "bar" })
			})

			expect(mockEmit).toHaveBeenCalledWith("custom-event", { foo: "bar" })
		})
	})
})
