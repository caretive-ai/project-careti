// CARET MODIFICATION: Integration test for Node.js REPL control

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { createVSCodeSessionManager } from "../../adapters/vscode"
import type { SessionManager } from "../../core/SessionManager"

describe("Node.js REPL Integration", () => {
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

	it("should open Node.js REPL", async () => {
		sessionId = await manager.createSession({
			command: "node",
			args: [],
			cwd: process.cwd(),
		})

		expect(sessionId).toBeDefined()
		expect(typeof sessionId).toBe("string")

		const session = manager.getSession(sessionId)
		expect(session).toBeDefined()
	})

	it("should execute JavaScript code", async () => {
		sessionId = await manager.createSession({
			command: "node",
			args: [],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		session.sendInput("console.log('hello from node')")

		await new Promise((resolve) => setTimeout(resolve, 1000))

		const output = session.getOutput().join("")

		expect(output).toContain("hello from node")
	}, 10000)

	it("should handle arithmetic operations", async () => {
		sessionId = await manager.createSession({
			command: "node",
			args: [],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		session.sendInput("2 + 2")

		await new Promise((resolve) => setTimeout(resolve, 1000))

		const output = session.getOutput().join("")

		expect(output).toContain("4")
	}, 10000)

	it("should handle variable assignments", async () => {
		sessionId = await manager.createSession({
			command: "node",
			args: [],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		session.sendInput("const x = 100")
		await new Promise((resolve) => setTimeout(resolve, 500))

		session.sendInput("x * 2")
		await new Promise((resolve) => setTimeout(resolve, 1000))

		const output = session.getOutput().join("")

		expect(output).toContain("200")
	}, 15000)

	it("should handle async operations", async () => {
		sessionId = await manager.createSession({
			command: "node",
			args: [],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		session.sendInput("Promise.resolve(42)")

		await new Promise((resolve) => setTimeout(resolve, 1000))

		const output = session.getOutput().join("")

		expect(output).toContain("42")
	}, 10000)

	it("should handle .exit command", async () => {
		sessionId = await manager.createSession({
			command: "node",
			args: [],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		const exitPromise = new Promise<number>((resolve) => {
			session.on("exit", (code) => resolve(code))
		})

		session.sendInput(".exit")

		const exitCode = await exitPromise

		expect(exitCode).toBe(0)
	}, 10000)

	it("should handle Ctrl+C (stop)", async () => {
		sessionId = await manager.createSession({
			command: "node",
			args: [],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		// Start infinite loop
		session.sendInput("while(true) {}")

		await new Promise((resolve) => setTimeout(resolve, 500))

		// Send Ctrl+C
		session.sendInput("\x03")

		await new Promise((resolve) => setTimeout(resolve, 1000))

		// Should still be alive after Ctrl+C in REPL
		const sessions = manager.listSessions()
		expect(sessions.map((s) => s.id)).toContain(sessionId)
	}, 10000)

	it("should handle multi-line code", async () => {
		sessionId = await manager.createSession({
			command: "node",
			args: [],
			cwd: process.cwd(),
		})

		const session = manager.getSession(sessionId)
		if (!session) throw new Error("Session not found")

		session.sendInput("function greet(name) {")
		await new Promise((resolve) => setTimeout(resolve, 300))

		session.sendInput("  return 'Hello, ' + name")
		await new Promise((resolve) => setTimeout(resolve, 300))

		session.sendInput("}")
		await new Promise((resolve) => setTimeout(resolve, 500))

		session.sendInput("greet('World')")
		await new Promise((resolve) => setTimeout(resolve, 1000))

		const output = session.getOutput().join("")

		expect(output).toContain("Hello, World")
	}, 15000)
})
