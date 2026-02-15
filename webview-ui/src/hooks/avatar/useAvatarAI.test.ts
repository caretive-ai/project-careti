// CARETI MODIFICATION: 아바타 AI 연동 훅 테스트
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useAvatarAI } from "./useAvatarAI"

// Mock fetch
global.fetch = vi.fn()

describe("useAvatarAI", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("초기화", () => {
		it("API 키 없이 초기화되면 에러 상태여야 함", () => {
			const { result } = renderHook(() => useAvatarAI({ apiKey: "" }))

			expect(result.current.isReady).toBe(false)
		})

		it("API 키와 함께 초기화되면 준비 상태여야 함", () => {
			const { result } = renderHook(() =>
				useAvatarAI({ apiKey: "test-api-key" }),
			)

			expect(result.current.isReady).toBe(true)
		})
	})

	describe("메시지 전송", () => {
		it("sendMessage 호출 시 isLoading이 true가 되어야 함", async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						candidates: [
							{
								content: {
									parts: [{ text: "안녕하세요!" }],
								},
							},
						],
					}),
			} as Response)

			const { result } = renderHook(() =>
				useAvatarAI({ apiKey: "test-api-key" }),
			)

			act(() => {
				result.current.sendMessage("안녕")
			})

			expect(result.current.isLoading).toBe(true)
		})

		it("응답 수신 시 response가 설정되어야 함", async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						candidates: [
							{
								content: {
									parts: [{ text: "안녕하세요! 반가워요." }],
								},
							},
						],
					}),
			} as Response)

			const { result } = renderHook(() =>
				useAvatarAI({ apiKey: "test-api-key" }),
			)

			await act(async () => {
				await result.current.sendMessage("안녕")
			})

			await waitFor(() => {
				expect(result.current.response).toBe("안녕하세요! 반가워요.")
			})
		})
	})

	describe("감정 분석", () => {
		it("긍정적 응답에서 happy 감정이 추출되어야 함", async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						candidates: [
							{
								content: {
									parts: [{ text: "정말 기뻐요! 잘 됐네요!" }],
								},
							},
						],
					}),
			} as Response)

			const { result } = renderHook(() =>
				useAvatarAI({ apiKey: "test-api-key" }),
			)

			await act(async () => {
				await result.current.sendMessage("좋은 소식이야")
			})

			await waitFor(() => {
				expect(result.current.emotion).toBe("happy")
			})
		})

		it("부정적 응답에서 sad 감정이 추출되어야 함", async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						candidates: [
							{
								content: {
									parts: [{ text: "그건 정말 슬퍼요... 😢" }],
								},
							},
						],
					}),
			} as Response)

			const { result } = renderHook(() =>
				useAvatarAI({ apiKey: "test-api-key" }),
			)

			await act(async () => {
				await result.current.sendMessage("나쁜 소식이야")
			})

			await waitFor(() => {
				expect(result.current.emotion).toBe("sad")
			})
		})
	})

	describe("에러 처리", () => {
		it("API 에러 시 error가 설정되어야 함", async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"))

			const { result } = renderHook(() =>
				useAvatarAI({ apiKey: "test-api-key" }),
			)

			await act(async () => {
				await result.current.sendMessage("테스트")
			})

			await waitFor(() => {
				expect(result.current.error).not.toBeNull()
			})
		})
	})
})
