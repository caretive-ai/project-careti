// CARET MODIFICATION: TerminalService wraps SessionManager with optional event bus

import type { InteractiveSession } from "../core/InteractiveSession"
import type {
	SessionConfig,
	SessionInfo,
	TerminalToolOutput,
} from "../core/types"
import type { SessionManager } from "../core/SessionManager"
import type {
	CommandSentEvent,
	ExitEvent,
	OutputEvent,
	SessionClosedEvent,
	SessionOpenedEvent,
	TerminalEventBus,
} from "../stream/TerminalEventBus"

type SubscriptionCleanup = () => void

export class TerminalService {
	private cleanupMap: Map<string, SubscriptionCleanup[]> = new Map()

	constructor(
		private readonly sessionManager: SessionManager,
		private readonly eventBus?: TerminalEventBus,
	) {}

	getSessionManager(): SessionManager {
		return this.sessionManager
	}

	private getSessionOrThrow(sessionId: string): InteractiveSession {
		const session = this.sessionManager.getSession(sessionId)
		if (!session) {
			throw new Error(`Session not found: ${sessionId}`)
		}
		return session
	}

	async createSession(config: SessionConfig): Promise<string> {
		const sessionId = await this.sessionManager.createSession(config)
		const session = this.sessionManager.getSession(sessionId)
		if (session && this.eventBus) {
			this.eventBus.publish(this.makeSessionOpened(sessionId, config))
			const outputHandler = (data: string) => {
				this.eventBus?.publish(this.makeOutput(sessionId, data))
			}
			const exitHandler = (code: number) => {
				this.eventBus?.publish(this.makeExit(sessionId, code))
			}
			session.on("output", outputHandler)
			session.on("exit", exitHandler)
			this.cleanupMap.set(sessionId, [
				() => session.off("output", outputHandler),
				() => session.off("exit", exitHandler),
			])
		}
		return sessionId
	}

	async sendInput(sessionId: string, input: string): Promise<void> {
		const session = this.getSessionOrThrow(sessionId)
		session.sendInput(input)
		if (this.eventBus) {
			this.eventBus.publish(this.makeCommandSent(sessionId, input))
		}
	}

	async readOutput(sessionId: string, timeoutMs = 1000): Promise<TerminalToolOutput> {
		const session = this.getSessionOrThrow(sessionId)
		const newOutput = await session.readOutput(timeoutMs)
		return {
			success: true,
			sessionId,
			output: newOutput.join(""),
		}
	}

	closeSession(sessionId: string): TerminalToolOutput {
		this.cleanup(sessionId)
		this.sessionManager.closeSession(sessionId)
		if (this.eventBus) {
			this.eventBus.publish(this.makeSessionClosed(sessionId))
		}
		return {
			success: true,
			output: `Terminal session closed: ${sessionId}`,
		}
	}

	listSessions(): SessionInfo[] {
		return this.sessionManager.listSessions()
	}

	dispose(): void {
		for (const sessionId of this.cleanupMap.keys()) {
			this.cleanup(sessionId)
		}
		this.sessionManager.dispose()
		this.eventBus?.dispose()
	}

	private cleanup(sessionId: string): void {
		const cleaners = this.cleanupMap.get(sessionId)
		if (cleaners) {
			for (const clean of cleaners) {
				clean()
			}
		}
		this.cleanupMap.delete(sessionId)
	}

	private makeSessionOpened(sessionId: string, config: SessionConfig): SessionOpenedEvent {
		return {
			type: "session_opened",
			sessionId,
			command: config.command,
			args: config.args,
			cwd: config.cwd,
			ts: Date.now(),
		}
	}

	private makeSessionClosed(sessionId: string): SessionClosedEvent {
		return {
			type: "session_closed",
			sessionId,
			ts: Date.now(),
		}
	}

	private makeCommandSent(sessionId: string, input: string): CommandSentEvent {
		return {
			type: "command_sent",
			sessionId,
			input,
			ts: Date.now(),
		}
	}

	private makeOutput(sessionId: string, data: string): OutputEvent {
		return {
			type: "output",
			sessionId,
			data,
			ts: Date.now(),
		}
	}

	private makeExit(sessionId: string, code: number): ExitEvent {
		return {
			type: "exit",
			sessionId,
			code,
			ts: Date.now(),
		}
	}
}
