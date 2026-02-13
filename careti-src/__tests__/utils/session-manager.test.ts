// CARETI MODIFICATION: Unit tests for SessionManager
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { SessionManager, type SessionEvent } from "../../utils/session-manager"

describe("SessionManager", () => {
	let manager: SessionManager

	beforeEach(() => {
		SessionManager.resetInstance()
		manager = SessionManager.getInstance()
	})

	afterEach(() => {
		SessionManager.resetInstance()
	})

	describe("singleton", () => {
		it("should return same instance", () => {
			const instance1 = SessionManager.getInstance()
			const instance2 = SessionManager.getInstance()
			expect(instance1).toBe(instance2)
		})

		it("should create new instance after reset", () => {
			const instance1 = SessionManager.getInstance()
			SessionManager.resetInstance()
			const instance2 = SessionManager.getInstance()
			expect(instance1).not.toBe(instance2)
		})
	})

	describe("getOrCreate", () => {
		it("should create new session state", () => {
			const session = manager.getOrCreate("session-1")

			expect(session).toBeDefined()
			expect(session.status).toBe("idle")
			expect(session.abort).toBeInstanceOf(AbortController)
			expect(session.pendingInput).toBe("")
			expect(session.interruptCount).toBe(0)
		})

		it("should return existing session", () => {
			const session1 = manager.getOrCreate("session-1")
			const session2 = manager.getOrCreate("session-1")
			expect(session1).toBe(session2)
		})
	})

	describe("appendInput", () => {
		it("should add input to buffer", () => {
			manager.appendInput("session-1", "Hello")
			expect(manager.getPendingInput("session-1")).toBe("Hello")
		})

		it("should emit input.queued event", () => {
			const events: SessionEvent[] = []
			manager.on((event) => events.push(event))

			manager.appendInput("session-1", "Hello")

			expect(events).toHaveLength(1)
			expect(events[0].type).toBe("input.queued")
		})

		it("should combine multiple inputs with newline", () => {
			manager.appendInput("session-1", "First")
			manager.appendInput("session-1", "Second")

			expect(manager.getPendingInput("session-1")).toBe("First\nSecond")
		})

		it("should combine three inputs correctly", () => {
			manager.appendInput("session-1", "One")
			manager.appendInput("session-1", "Two")
			manager.appendInput("session-1", "Three")

			expect(manager.getPendingInput("session-1")).toBe("One\nTwo\nThree")
		})
	})

	describe("hasPendingInput", () => {
		it("should return false when no input", () => {
			expect(manager.hasPendingInput("session-1")).toBe(false)
		})

		it("should return true when input exists", () => {
			manager.appendInput("session-1", "Hello")
			expect(manager.hasPendingInput("session-1")).toBe(true)
		})
	})

	describe("consumePendingInput", () => {
		it("should return and clear input", () => {
			manager.appendInput("session-1", "Hello")

			const input = manager.consumePendingInput("session-1")

			expect(input).toBe("Hello")
			expect(manager.getPendingInput("session-1")).toBe("")
		})

		it("should emit input.processed event", () => {
			manager.appendInput("session-1", "Hello")

			const events: SessionEvent[] = []
			manager.on((event) => events.push(event))

			manager.consumePendingInput("session-1")

			expect(events.some((e) => e.type === "input.processed")).toBe(true)
		})

		it("should return empty string for non-existent session", () => {
			expect(manager.consumePendingInput("non-existent")).toBe("")
		})
	})

	describe("clearPendingInput", () => {
		it("should clear input without returning", () => {
			manager.appendInput("session-1", "Hello")
			manager.clearPendingInput("session-1")

			expect(manager.getPendingInput("session-1")).toBe("")
		})

		it("should emit input.cleared event", () => {
			manager.appendInput("session-1", "Hello")

			const events: SessionEvent[] = []
			manager.on((event) => events.push(event))

			manager.clearPendingInput("session-1")

			expect(events.some((e) => e.type === "input.cleared")).toBe(true)
		})
	})

	describe("setStatus", () => {
		it("should update session status", () => {
			manager.setStatus("session-1", "busy")
			const session = manager.get("session-1")
			expect(session?.status).toBe("busy")
		})

		it("should emit session.busy event", () => {
			const events: SessionEvent[] = []
			manager.on((event) => events.push(event))

			manager.setStatus("session-1", "busy")

			expect(events.some((e) => e.type === "session.busy")).toBe(true)
		})

		it("should emit session.idle event", () => {
			const events: SessionEvent[] = []
			manager.on((event) => events.push(event))

			manager.setStatus("session-1", "idle")

			expect(events.some((e) => e.type === "session.idle")).toBe(true)
		})
	})

	describe("getSignal", () => {
		it("should return AbortSignal", () => {
			const signal = manager.getSignal("session-1")
			expect(signal).toBeInstanceOf(AbortSignal)
			expect(signal.aborted).toBe(false)
		})
	})

	describe("tryInterrupt", () => {
		it("should return false on first call", () => {
			const result = manager.tryInterrupt("session-1")
			expect(result).toBe(false)
		})

		it("should return true on second call within timeout", () => {
			manager.tryInterrupt("session-1")
			const result = manager.tryInterrupt("session-1")
			expect(result).toBe(true)
		})

		it("should reset count after timeout", async () => {
			vi.useFakeTimers()

			manager.tryInterrupt("session-1")

			// Advance past timeout
			vi.advanceTimersByTime(3100)

			const result = manager.tryInterrupt("session-1")
			expect(result).toBe(false)

			vi.useRealTimers()
		})

		it("should emit session.interrupted on actual interrupt", () => {
			const events: SessionEvent[] = []
			manager.on((event) => events.push(event))

			manager.tryInterrupt("session-1")
			manager.tryInterrupt("session-1")

			expect(events.some((e) => e.type === "session.interrupted")).toBe(true)
		})
	})

	describe("isWarningState", () => {
		it("should return false for non-existent session", () => {
			expect(manager.isWarningState("non-existent")).toBe(false)
		})

		it("should return false when no interrupt pressed", () => {
			manager.getOrCreate("session-1")
			expect(manager.isWarningState("session-1")).toBe(false)
		})

		it("should return true after first interrupt", () => {
			manager.tryInterrupt("session-1")
			expect(manager.isWarningState("session-1")).toBe(true)
		})

		it("should return false after second interrupt (threshold reached)", () => {
			manager.tryInterrupt("session-1")
			manager.tryInterrupt("session-1")
			expect(manager.isWarningState("session-1")).toBe(false)
		})
	})

	describe("forceInterrupt", () => {
		it("should abort the signal", () => {
			const signal = manager.getSignal("session-1")
			expect(signal.aborted).toBe(false)

			manager.forceInterrupt("session-1")

			// Old signal should be aborted
			expect(signal.aborted).toBe(true)

			// New signal should not be aborted
			const newSignal = manager.getSignal("session-1")
			expect(newSignal.aborted).toBe(false)
		})

		it("should reset interrupt count", () => {
			const session = manager.getOrCreate("session-1")
			manager.tryInterrupt("session-1")
			expect(session.interruptCount).toBe(1)

			manager.forceInterrupt("session-1")
			expect(session.interruptCount).toBe(0)
		})

		it("should set status back to idle", () => {
			manager.setStatus("session-1", "busy")
			manager.forceInterrupt("session-1")

			const session = manager.get("session-1")
			expect(session?.status).toBe("idle")
		})

		it("should include hasPendingInput in event", () => {
			manager.appendInput("session-1", "Hello")

			const events: SessionEvent[] = []
			manager.on((event) => events.push(event))

			manager.forceInterrupt("session-1")

			const interruptEvent = events.find((e) => e.type === "session.interrupted")
			expect(interruptEvent).toBeDefined()
			if (interruptEvent?.type === "session.interrupted") {
				expect(interruptEvent.hasPendingInput).toBe(true)
			}
		})
	})

	describe("delete", () => {
		it("should remove session", () => {
			manager.getOrCreate("session-1")
			expect(manager.has("session-1")).toBe(true)

			manager.delete("session-1")
			expect(manager.has("session-1")).toBe(false)
		})

		it("should abort signal on delete", () => {
			const signal = manager.getSignal("session-1")
			manager.delete("session-1")
			expect(signal.aborted).toBe(true)
		})
	})

	describe("event listeners", () => {
		it("should add and remove listeners", () => {
			const events: SessionEvent[] = []
			const unsubscribe = manager.on((event) => events.push(event))

			manager.appendInput("session-1", "Hello")
			expect(events).toHaveLength(1)

			unsubscribe()

			manager.appendInput("session-1", "World")
			expect(events).toHaveLength(1) // No new events
		})

		it("should handle listener errors gracefully", () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

			manager.on(() => {
				throw new Error("Listener error")
			})

			// Should not throw
			expect(() => {
				manager.appendInput("session-1", "Hello")
			}).not.toThrow()

			expect(consoleSpy).toHaveBeenCalled()
			consoleSpy.mockRestore()
		})
	})
})
