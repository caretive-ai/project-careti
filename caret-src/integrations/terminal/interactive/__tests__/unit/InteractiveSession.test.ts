// CARET MODIFICATION: Unit tests for InteractiveSession

import { describe, it, expect, vi, beforeEach } from "vitest"
import { InteractiveSession } from "../../core/InteractiveSession"
import type { ITerminalAdapter } from "../../core/interfaces/ITerminalAdapter"
import type { SessionConfig } from "../../core/types"

describe("InteractiveSession", () => {
	let mockAdapter: ITerminalAdapter
	let config: SessionConfig

	beforeEach(() => {
		config = {
			command: "python3",
			args: ["-i"],
			cwd: "/test/dir",
		}

		// Mock adapter
		mockAdapter = {
			start: vi.fn().mockResolvedValue(undefined),
			sendInput: vi.fn(),
			onOutput: vi.fn().mockReturnValue({ dispose: vi.fn() }),
			onExit: vi.fn().mockReturnValue({ dispose: vi.fn() }),
			dispose: vi.fn(),
		}
	})

	describe("start()", () => {
		it("should start the adapter", async () => {
			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			expect(mockAdapter.start).toHaveBeenCalledWith(config)
		})

		it("should subscribe to output events", async () => {
			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			expect(mockAdapter.onOutput).toHaveBeenCalled()
		})

		it("should subscribe to exit events", async () => {
			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			expect(mockAdapter.onExit).toHaveBeenCalled()
		})

		it("should buffer output data", async () => {
			let outputCallback: ((data: string) => void) | undefined = undefined
			mockAdapter.onOutput = vi.fn().mockImplementation((cb: (data: string) => void) => {
				outputCallback = cb
				return { dispose: vi.fn() }
			})

			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			// Simulate output
			outputCallback?.("hello\n")
			outputCallback?.("world\n")

			const output = session.getOutput()
			expect(output).toEqual(["hello\n", "world\n"])
		})

		it("should emit output events", async () => {
			let outputCallback: ((data: string) => void) | undefined = undefined
			mockAdapter.onOutput = vi.fn().mockImplementation((cb: (data: string) => void) => {
				outputCallback = cb
				return { dispose: vi.fn() }
			})

			const session = new InteractiveSession(mockAdapter, config)
			const outputListener = vi.fn()
			session.on("output", outputListener)

			await session.start()

			// Simulate output
			outputCallback?.("test output")

			expect(outputListener).toHaveBeenCalledWith("test output")
		})

		it("should emit exit events", async () => {
			let exitCallback: ((code: number) => void) | undefined = undefined
			mockAdapter.onExit = vi.fn().mockImplementation((cb: (code: number) => void) => {
				exitCallback = cb
				return { dispose: vi.fn() }
			})

			const session = new InteractiveSession(mockAdapter, config)
			const exitListener = vi.fn()
			session.on("exit", exitListener)

			await session.start()

			// Simulate exit
			exitCallback?.(0)

			expect(exitListener).toHaveBeenCalledWith(0)
		})
	})

	describe("sendInput()", () => {
		it("should send input with newline", async () => {
			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			session.sendInput("print('hello')")

			expect(mockAdapter.sendInput).toHaveBeenCalledWith("print('hello')\n")
		})

		it("should handle empty input", async () => {
			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			session.sendInput("")

			expect(mockAdapter.sendInput).toHaveBeenCalledWith("\n")
		})
	})

	describe("getOutput()", () => {
		it("should return all buffered output", async () => {
			let outputCallback: ((data: string) => void) | undefined = undefined
			mockAdapter.onOutput = vi.fn().mockImplementation((cb: (data: string) => void) => {
				outputCallback = cb
				return { dispose: vi.fn() }
			})

			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			outputCallback?.("line1\n")
			outputCallback?.("line2\n")
			outputCallback?.("line3\n")

			expect(session.getOutput()).toEqual(["line1\n", "line2\n", "line3\n"])
		})

		it("should return output from specific index", async () => {
			let outputCallback: ((data: string) => void) | undefined = undefined
			mockAdapter.onOutput = vi.fn().mockImplementation((cb: (data: string) => void) => {
				outputCallback = cb
				return { dispose: vi.fn() }
			})

			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			outputCallback?.("line1\n")
			outputCallback?.("line2\n")
			outputCallback?.("line3\n")

			expect(session.getOutput(1)).toEqual(["line2\n", "line3\n"])
		})

		it("should return empty array when no output", async () => {
			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			expect(session.getOutput()).toEqual([])
		})
	})

	describe("clearOutput()", () => {
		it("should clear output buffer", async () => {
			let outputCallback: ((data: string) => void) | undefined = undefined
			mockAdapter.onOutput = vi.fn().mockImplementation((cb: (data: string) => void) => {
				outputCallback = cb
				return { dispose: vi.fn() }
			})

			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			outputCallback?.("test\n")
			expect(session.getOutput()).toHaveLength(1)

			session.clearOutput()
			expect(session.getOutput()).toEqual([])
		})
	})

	describe("dispose()", () => {
		it("should dispose all subscriptions", async () => {
			const outputDispose = vi.fn()
			const exitDispose = vi.fn()

			mockAdapter.onOutput = vi.fn().mockReturnValue({ dispose: outputDispose })
			mockAdapter.onExit = vi.fn().mockReturnValue({ dispose: exitDispose })

			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			session.dispose()

			expect(outputDispose).toHaveBeenCalled()
			expect(exitDispose).toHaveBeenCalled()
		})

		it("should dispose the adapter", async () => {
			const session = new InteractiveSession(mockAdapter, config)
			await session.start()

			session.dispose()

			expect(mockAdapter.dispose).toHaveBeenCalled()
		})
	})

	describe("config property", () => {
		it("should expose session config", () => {
			const session = new InteractiveSession(mockAdapter, config)

			expect(session.config).toBe(config)
		})
	})
})
