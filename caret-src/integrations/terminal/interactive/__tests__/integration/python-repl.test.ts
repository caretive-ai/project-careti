// CARET MODIFICATION: Integration test for Python REPL control

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { createVSCodeSessionManager } from "../../adapters/vscode"
import type { SessionManager } from "../../core/SessionManager"

describe("Python REPL Integration", () => {
	let manager: SessionManager
	let sessionId: string

	beforeEach(async () => {
		manager = createVSCodeSessionManager()
	})

	afterEach(() => {
		if (sessionId) {
			manager.closeSession(sessionId)
		}
		manager.dispose()
	})

	it("should open Python REPL", async () => {
		sessionId = await manager.createSession({
			command: "python3",
			args: ["-i"],
			cwd: process.cwd(),
		})

		expect(sessionId).toBeDefined()
		expect(typeof sessionId).toBe("string")

		const session = manager.getSession(sessionId)
		expect(session).toBeDefined()
	})

	it("should execute Python code", async () => {
		sessionId = await manager.createSession({
			command: "python3",
			args: ["-i"],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		// Send command
		session.sendInput("print('hello from test')")

		// Wait for output
		await new Promise((resolve) => setTimeout(resolve, 1000))

		const output = session.getOutput().join("")

		expect(output).toContain("hello from test")
	}, 10000)

	it("should handle arithmetic operations", async () => {
		sessionId = await manager.createSession({
			command: "python3",
			args: ["-i"],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		session.sendInput("2 + 2")

		await new Promise((resolve) => setTimeout(resolve, 1000))

		const output = session.getOutput().join("")

		expect(output).toContain("4")
	}, 10000)

	it("should handle multiple commands", async () => {
		sessionId = await manager.createSession({
			command: "python3",
			args: ["-i"],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		session.sendInput("x = 10")
		await new Promise((resolve) => setTimeout(resolve, 500))

		session.sendInput("y = 20")
		await new Promise((resolve) => setTimeout(resolve, 500))

		session.sendInput("print(x + y)")
		await new Promise((resolve) => setTimeout(resolve, 1000))

		const output = session.getOutput().join("")

		expect(output).toContain("30")
	}, 15000)

	it("should handle exit command", async () => {
		sessionId = await manager.createSession({
			command: "python3",
			args: ["-i"],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		const exitPromise = new Promise<number>((resolve) => {
			session.on("exit", (code) => resolve(code))
		})

		session.sendInput("exit()")

		const exitCode = await exitPromise

		expect(exitCode).toBe(0)
	}, 10000)

	it("should list active sessions", async () => {
		const id1 = await manager.createSession({
			command: "python3",
			args: ["-i"],
			cwd: process.cwd(),
		})

		const id2 = await manager.createSession({
			command: "python3",
			args: ["-i"],
			cwd: process.cwd(),
		})

		const sessions = manager.listSessions()

		expect(sessions).toHaveLength(2)
		expect(sessions.map((s) => s.id)).toContain(id1)
		expect(sessions.map((s) => s.id)).toContain(id2)

		// Cleanup
		manager.closeSession(id1)
		manager.closeSession(id2)
	}, 10000)

	it("should close session properly", async () => {
		sessionId = await manager.createSession({
			command: "python3",
			args: ["-i"],
			cwd: process.cwd(),
		})

		expect(manager.getSession(sessionId)).toBeDefined()

		manager.closeSession(sessionId)

		expect(manager.getSession(sessionId)).toBeUndefined()
	})
})
