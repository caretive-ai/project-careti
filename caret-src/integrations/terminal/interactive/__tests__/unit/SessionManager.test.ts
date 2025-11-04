// CARET MODIFICATION: Unit tests for SessionManager (using real InteractiveSession with mock adapter)

import { describe, it, expect, vi, beforeEach } from "vitest"
import { SessionManager } from "../../core/SessionManager"
import type { ITerminalAdapter } from "../../core/interfaces/ITerminalAdapter"
import type { SessionConfig } from "../../core/types"

describe("SessionManager", () => {
	let mockAdapter: ITerminalAdapter
	let adapterFactory: () => ITerminalAdapter
	let manager: SessionManager

	beforeEach(() => {
		vi.clearAllMocks()

		// Create a fresh mock adapter for each test
		mockAdapter = {
			start: vi.fn().mockResolvedValue(undefined),
			sendInput: vi.fn(),
			onOutput: vi.fn().mockReturnValue({ dispose: vi.fn() }),
			onExit: vi.fn().mockReturnValue({ dispose: vi.fn() }),
			dispose: vi.fn(),
		}

		adapterFactory = vi.fn(() => {
			// Return a fresh mock each time
			return {
				start: vi.fn().mockResolvedValue(undefined),
				sendInput: vi.fn(),
				onOutput: vi.fn().mockReturnValue({ dispose: vi.fn() }),
				onExit: vi.fn().mockReturnValue({ dispose: vi.fn() }),
				dispose: vi.fn(),
			}
		})

		manager = new SessionManager(adapterFactory)
	})

	describe("createSession()", () => {
		it("should create a new session with ULID", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const sessionId = await manager.createSession(config)

			expect(sessionId).toBeDefined()
			expect(typeof sessionId).toBe("string")
			expect(sessionId.length).toBeGreaterThan(0)
		})

		it("should create adapter from factory", async () => {
			const config: SessionConfig = {
				command: "node",
				args: [],
				cwd: "/test",
			}

			await manager.createSession(config)

			expect(adapterFactory).toHaveBeenCalled()
		})

		it("should generate unique session IDs", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const id1 = await manager.createSession(config)
			const id2 = await manager.createSession(config)

			expect(id1).not.toBe(id2)
		})

		it("should store session metadata", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const sessionId = await manager.createSession(config)
			const sessions = manager.listSessions()

			expect(sessions).toHaveLength(1)
			expect(sessions[0].id).toBe(sessionId)
			expect(sessions[0].command).toBe("python3")
		})
	})

	describe("getSession()", () => {
		it("should return session by ID", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const sessionId = await manager.createSession(config)
			const session = manager.getSession(sessionId)

			expect(session).toBeDefined()
			expect(session?.config).toBe(config)
		})

		it("should return undefined for non-existent session", () => {
			const session = manager.getSession("non-existent-id")

			expect(session).toBeUndefined()
		})

		it("should update lastActivity timestamp", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const sessionId = await manager.createSession(config)

			// Wait a bit
			await new Promise((resolve) => setTimeout(resolve, 10))

			const initialSessions = manager.listSessions()
			const initialActivity = initialSessions[0].lastActivity

			// Get session (should update lastActivity)
			manager.getSession(sessionId)

			const updatedSessions = manager.listSessions()
			const updatedActivity = updatedSessions[0].lastActivity

			expect(updatedActivity).toBeGreaterThanOrEqual(initialActivity)
		})
	})

	describe("closeSession()", () => {
		it("should remove session from storage", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const sessionId = await manager.createSession(config)
			expect(manager.getSession(sessionId)).toBeDefined()

			manager.closeSession(sessionId)
			expect(manager.getSession(sessionId)).toBeUndefined()
		})

		it("should remove session metadata", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const sessionId = await manager.createSession(config)
			expect(manager.listSessions()).toHaveLength(1)

			manager.closeSession(sessionId)
			expect(manager.listSessions()).toHaveLength(0)
		})

		it("should handle closing non-existent session", () => {
			expect(() => manager.closeSession("non-existent-id")).not.toThrow()
		})
	})

	describe("listSessions()", () => {
		it("should return empty array when no sessions", () => {
			const sessions = manager.listSessions()

			expect(sessions).toEqual([])
		})

		it("should return all active sessions", async () => {
			const config1: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test1",
			}
			const config2: SessionConfig = {
				command: "node",
				args: [],
				cwd: "/test2",
			}

			const id1 = await manager.createSession(config1)
			const id2 = await manager.createSession(config2)

			const sessions = manager.listSessions()

			expect(sessions).toHaveLength(2)
			expect(sessions.map((s) => s.id)).toContain(id1)
			expect(sessions.map((s) => s.id)).toContain(id2)
		})

		it("should include session metadata", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const sessionId = await manager.createSession(config)
			const sessions = manager.listSessions()

			expect(sessions[0]).toMatchObject({
				id: sessionId,
				command: "python3",
			})
			expect(sessions[0].createdAt).toBeGreaterThan(0)
			expect(sessions[0].lastActivity).toBeGreaterThan(0)
		})
	})

	describe("dispose()", () => {
		it("should clear all sessions", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			await manager.createSession(config)
			await manager.createSession(config)

			manager.dispose()

			expect(manager.listSessions()).toEqual([])
		})

		it("should clear all metadata", async () => {
			const config: SessionConfig = {
				command: "python3",
				args: ["-i"],
				cwd: "/test",
			}

			const sessionId = await manager.createSession(config)

			manager.dispose()

			expect(manager.getSession(sessionId)).toBeUndefined()
			expect(manager.listSessions()).toEqual([])
		})
	})
})
