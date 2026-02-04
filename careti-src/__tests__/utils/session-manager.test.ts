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
			expect(session.pendingMessages).toBeDefined()
			expect(session.interruptCount).toBe(0)
		})

		it("should return existing session", () => {
			const session1 = manager.getOrCreate("session-1")
			const session2 = manager.getOrCreate("session-1")
			expect(session1).toBe(session2)
		})
	})

	describe("queueMessage", () => {
		it("should add message to queue", () => {
			const message = manager.queueMessage("session-1", { text: "Hello" })

			expect(message.id).toBeDefined()
			expect(message.text).toBe("Hello")
			expect(message.timestamp).toBeDefined()
		})

		it("should emit message.queued event", () => {
			const events: SessionEvent[] = []
			manager.on((event) => events.push(event))

			manager.queueMessage("session-1", { text: "Hello" })

			expect(events).toHaveLength(1)
			expect(events[0].type).toBe("message.queued")
		})

		it("should queue multiple messages", async () => {
			const session = manager.getOrCreate("session-1")

			manager.queueMessage("session-1", { text: "First" })
			manager.queueMessage("session-1", { text: "Second" })

			expect(session.pendingMessages.length).toBe(2)

			const msg1 = await session.pendingMessages.next()
			const msg2 = await session.pendingMessages.next()

			expect(msg1?.text).toBe("First")
			expect(msg2?.text).toBe("Second")
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

		it("should close pending messages queue", () => {
			const session = manager.getOrCreate("session-1")
			manager.delete("session-1")
			expect(session.pendingMessages.isClosed()).toBe(true)
		})
	})

	describe("event listeners", () => {
		it("should add and remove listeners", () => {
			const events: SessionEvent[] = []
			const unsubscribe = manager.on((event) => events.push(event))

			manager.queueMessage("session-1", { text: "Hello" })
			expect(events).toHaveLength(1)

			unsubscribe()

			manager.queueMessage("session-1", { text: "World" })
			expect(events).toHaveLength(1) // No new events
		})

		it("should handle listener errors gracefully", () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

			manager.on(() => {
				throw new Error("Listener error")
			})

			// Should not throw
			expect(() => {
				manager.queueMessage("session-1", { text: "Hello" })
			}).not.toThrow()

			expect(consoleSpy).toHaveBeenCalled()
			consoleSpy.mockRestore()
		})
	})
})
