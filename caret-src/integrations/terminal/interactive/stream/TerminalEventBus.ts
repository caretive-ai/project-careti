// CARET MODIFICATION: Terminal event bus (JSONL-style) for streaming use-cases

import { EventEmitter } from "node:events"
import type { Disposable } from "../core/types"

const EVENT_NAME = "terminal_event"

export type TerminalEventType =
	| "session_opened"
	| "session_closed"
	| "output"
	| "exit"
	| "error"
	| "command_sent"

export interface SessionOpenedEvent {
	type: "session_opened"
	sessionId: string
	command: string
	args: string[]
	cwd: string
	ts: number
}

export interface SessionClosedEvent {
	type: "session_closed"
	sessionId: string
	ts: number
}

export interface CommandSentEvent {
	type: "command_sent"
	sessionId: string
	input: string
	ts: number
}

export interface OutputEvent {
	type: "output"
	sessionId: string
	data: string
	ts: number
}

export interface ExitEvent {
	type: "exit"
	sessionId: string
	code: number
	ts: number
}

export interface ErrorEvent {
	type: "error"
	sessionId: string
	message: string
	ts: number
}

export type TerminalEvent =
	| SessionOpenedEvent
	| SessionClosedEvent
	| CommandSentEvent
	| OutputEvent
	| ExitEvent
	| ErrorEvent

/**
 * Publish/subscribe bus for terminal events.
 * 기본값으로 비활성 상태이며, 스트리밍 플래그를 켜는 경우 사용된다.
 */
export class TerminalEventBus {
	private emitter = new EventEmitter()

	publish(event: TerminalEvent): void {
		this.emitter.emit(EVENT_NAME, event)
	}

	onEvent(listener: (event: TerminalEvent) => void): Disposable {
		this.emitter.on(EVENT_NAME, listener)
		return {
			dispose: () => {
				this.emitter.off(EVENT_NAME, listener)
			},
		}
	}

	dispose(): void {
		this.emitter.removeAllListeners(EVENT_NAME)
	}
}
