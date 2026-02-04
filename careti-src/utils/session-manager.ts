// CARETI MODIFICATION: Session state manager with AbortController support
// Reference: ref-opencode/packages/opencode/src/session/prompt.ts

import { AsyncQueue } from "./async-queue"

/**
 * 세션 상태 타입
 */
export type SessionStatus = "idle" | "busy" | "interrupting"

/**
 * 사용자 메시지 인터페이스
 */
export interface UserMessage {
	id: string
	text: string
	timestamp: number
	metadata?: Record<string, unknown>
}

/**
 * 세션 상태 인터페이스
 */
export interface SessionState {
	abort: AbortController
	pendingMessages: AsyncQueue<UserMessage>
	status: SessionStatus
	interruptCount: number
	interruptTimer?: ReturnType<typeof setTimeout>
}

/**
 * 세션 이벤트 타입
 */
export type SessionEvent =
	| { type: "message.queued"; sessionId: string; message: UserMessage }
	| { type: "message.processing"; sessionId: string; messageId: string }
	| { type: "message.completed"; sessionId: string; messageId: string }
	| { type: "message.failed"; sessionId: string; messageId: string; error: Error }
	| { type: "session.interrupted"; sessionId: string }
	| { type: "session.idle"; sessionId: string }
	| { type: "session.busy"; sessionId: string }

/**
 * 세션 이벤트 리스너 타입
 */
export type SessionEventListener = (event: SessionEvent) => void

/**
 * SessionManager - 세션 상태 및 AbortController 관리
 *
 * 특징:
 * - 세션별 AbortController 관리
 * - 메시지 큐잉 지원
 * - Double-press 안전 인터럽트
 * - 이벤트 버스 내장
 *
 * @example
 * ```typescript
 * const manager = SessionManager.getInstance()
 *
 * // 메시지 큐잉
 * manager.queueMessage("session-1", { text: "Hello" })
 *
 * // 인터럽트 (2회 호출 시 실제 중단)
 * manager.tryInterrupt("session-1")
 *
 * // 이벤트 구독
 * manager.on((event) => {
 *   if (event.type === "session.interrupted") {
 *     console.log("Session interrupted:", event.sessionId)
 *   }
 * })
 * ```
 */
export class SessionManager {
	private static instance: SessionManager | null = null

	private sessions = new Map<string, SessionState>()
	private listeners = new Set<SessionEventListener>()

	// 인터럽트 설정
	private readonly INTERRUPT_TIMEOUT_MS = 3000
	private readonly INTERRUPT_THRESHOLD = 2

	private constructor() {}

	/**
	 * 싱글톤 인스턴스 획득
	 */
	static getInstance(): SessionManager {
		if (!SessionManager.instance) {
			SessionManager.instance = new SessionManager()
		}
		return SessionManager.instance
	}

	/**
	 * 테스트용 인스턴스 초기화
	 */
	static resetInstance(): void {
		if (SessionManager.instance) {
			SessionManager.instance.dispose()
			SessionManager.instance = null
		}
	}

	/**
	 * 세션 상태 가져오기 (없으면 생성)
	 */
	getOrCreate(sessionId: string): SessionState {
		if (!this.sessions.has(sessionId)) {
			this.sessions.set(sessionId, {
				abort: new AbortController(),
				pendingMessages: new AsyncQueue<UserMessage>(),
				status: "idle",
				interruptCount: 0,
			})
		}
		return this.sessions.get(sessionId)!
	}

	/**
	 * 세션 상태 가져오기 (없으면 undefined)
	 */
	get(sessionId: string): SessionState | undefined {
		return this.sessions.get(sessionId)
	}

	/**
	 * 세션 존재 여부 확인
	 */
	has(sessionId: string): boolean {
		return this.sessions.has(sessionId)
	}

	/**
	 * 세션 상태 설정
	 */
	setStatus(sessionId: string, status: SessionStatus): void {
		const session = this.getOrCreate(sessionId)
		session.status = status

		this.emit({
			type: status === "idle" ? "session.idle" : "session.busy",
			sessionId,
		})
	}

	/**
	 * 메시지 큐에 추가
	 */
	queueMessage(sessionId: string, message: Omit<UserMessage, "id" | "timestamp">): UserMessage {
		const session = this.getOrCreate(sessionId)

		const fullMessage: UserMessage = {
			id: this.generateMessageId(),
			timestamp: Date.now(),
			...message,
		}

		session.pendingMessages.push(fullMessage)

		this.emit({
			type: "message.queued",
			sessionId,
			message: fullMessage,
		})

		return fullMessage
	}

	/**
	 * AbortSignal 가져오기
	 */
	getSignal(sessionId: string): AbortSignal {
		return this.getOrCreate(sessionId).abort.signal
	}

	/**
	 * 인터럽트 시도 (Double-press 패턴)
	 *
	 * @returns true면 실제 인터럽트 발생, false면 경고 상태
	 */
	tryInterrupt(sessionId: string): boolean {
		const session = this.getOrCreate(sessionId)

		session.interruptCount++

		// 기존 타이머 초기화
		if (session.interruptTimer) {
			clearTimeout(session.interruptTimer)
		}

		// 새 타이머 설정
		session.interruptTimer = setTimeout(() => {
			session.interruptCount = 0
			session.interruptTimer = undefined
		}, this.INTERRUPT_TIMEOUT_MS)

		// 임계값 도달 시 실제 인터럽트
		if (session.interruptCount >= this.INTERRUPT_THRESHOLD) {
			this.forceInterrupt(sessionId)
			return true
		}

		return false
	}

	/**
	 * 강제 인터럽트 (즉시 실행)
	 */
	forceInterrupt(sessionId: string): void {
		const session = this.sessions.get(sessionId)
		if (!session) {
			return
		}

		session.status = "interrupting"

		// AbortController 트리거
		session.abort.abort()

		// 새 AbortController로 교체 (다음 요청용)
		session.abort = new AbortController()

		// 인터럽트 카운트 초기화
		session.interruptCount = 0
		if (session.interruptTimer) {
			clearTimeout(session.interruptTimer)
			session.interruptTimer = undefined
		}

		// 상태 복원
		session.status = "idle"

		this.emit({
			type: "session.interrupted",
			sessionId,
		})
	}

	/**
	 * 세션 삭제
	 */
	delete(sessionId: string): void {
		const session = this.sessions.get(sessionId)
		if (session) {
			session.abort.abort()
			session.pendingMessages.close()
			if (session.interruptTimer) {
				clearTimeout(session.interruptTimer)
			}
			this.sessions.delete(sessionId)
		}
	}

	/**
	 * 이벤트 리스너 등록
	 */
	on(listener: SessionEventListener): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	/**
	 * 이벤트 발행
	 */
	private emit(event: SessionEvent): void {
		for (const listener of this.listeners) {
			try {
				listener(event)
			} catch (error) {
				console.error("[SessionManager] Event listener error:", error)
			}
		}
	}

	/**
	 * 메시지 ID 생성
	 */
	private generateMessageId(): string {
		return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
	}

	/**
	 * 리소스 정리
	 */
	dispose(): void {
		for (const [sessionId] of this.sessions) {
			this.delete(sessionId)
		}
		this.listeners.clear()
	}
}
