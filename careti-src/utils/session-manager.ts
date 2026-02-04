// CARETI MODIFICATION: Session state manager with AbortController support
// Claude Code style: single string buffer for pending input

/**
 * 세션 상태 타입
 */
export type SessionStatus = "idle" | "busy" | "interrupting"

/**
 * 세션 상태 인터페이스
 */
export interface SessionState {
	abort: AbortController
	pendingInput: string // 단일 문자열 버퍼 (여러 입력이 합쳐짐)
	status: SessionStatus
	interruptCount: number
	interruptTimer?: ReturnType<typeof setTimeout>
}

/**
 * 세션 이벤트 타입
 */
export type SessionEvent =
	| { type: "input.queued"; sessionId: string; input: string }
	| { type: "input.processed"; sessionId: string; input: string }
	| { type: "input.cleared"; sessionId: string }
	| { type: "session.interrupted"; sessionId: string; hasPendingInput: boolean }
	| { type: "session.idle"; sessionId: string }
	| { type: "session.busy"; sessionId: string }

/**
 * 세션 이벤트 리스너 타입
 */
export type SessionEventListener = (event: SessionEvent) => void

/**
 * SessionManager - 세션 상태 및 AbortController 관리
 *
 * Claude Code 스타일:
 * - 단일 문자열 버퍼 (여러 입력이 합쳐짐)
 * - 취소 시 바로 큐 처리
 * - Double-press 안전 인터럽트
 *
 * @example
 * ```typescript
 * const manager = SessionManager.getInstance()
 *
 * // 입력 추가 (기존 입력에 합쳐짐)
 * manager.appendInput("session-1", "첫 번째 지시")
 * manager.appendInput("session-1", "두 번째 지시")
 * // pendingInput = "첫 번째 지시\n두 번째 지시"
 *
 * // 인터럽트 (2회 호출 시 실제 중단 + 큐 처리)
 * manager.tryInterrupt("session-1")
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
				pendingInput: "",
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
	 * 입력을 버퍼에 추가 (기존 입력과 합쳐짐)
	 */
	appendInput(sessionId: string, text: string): void {
		const session = this.getOrCreate(sessionId)

		if (session.pendingInput) {
			session.pendingInput += "\n" + text
		} else {
			session.pendingInput = text
		}

		this.emit({
			type: "input.queued",
			sessionId,
			input: session.pendingInput,
		})
	}

	/**
	 * 대기 중인 입력 가져오기 (버퍼 비우지 않음)
	 */
	getPendingInput(sessionId: string): string {
		return this.sessions.get(sessionId)?.pendingInput || ""
	}

	/**
	 * 대기 중인 입력이 있는지 확인
	 */
	hasPendingInput(sessionId: string): boolean {
		const session = this.sessions.get(sessionId)
		return !!session?.pendingInput
	}

	/**
	 * 대기 중인 입력 가져오고 비우기
	 */
	consumePendingInput(sessionId: string): string {
		const session = this.sessions.get(sessionId)
		if (!session) {
			return ""
		}

		const input = session.pendingInput
		session.pendingInput = ""

		if (input) {
			this.emit({
				type: "input.processed",
				sessionId,
				input,
			})
		}

		return input
	}

	/**
	 * 대기 중인 입력 비우기 (취소)
	 */
	clearPendingInput(sessionId: string): void {
		const session = this.sessions.get(sessionId)
		if (session) {
			session.pendingInput = ""
			this.emit({
				type: "input.cleared",
				sessionId,
			})
		}
	}

	/**
	 * AbortSignal 가져오기
	 */
	getSignal(sessionId: string): AbortSignal {
		return this.getOrCreate(sessionId).abort.signal
	}

	/**
	 * 경고 상태 확인 (첫 번째 인터럽트 후 두 번째 대기 중)
	 */
	isWarningState(sessionId: string): boolean {
		const session = this.sessions.get(sessionId)
		if (!session) {
			return false
		}
		return session.interruptCount > 0 && session.interruptCount < this.INTERRUPT_THRESHOLD
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
	 * 취소 후 대기 중인 입력이 있으면 바로 처리됨
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

		const hasPendingInput = !!session.pendingInput

		this.emit({
			type: "session.interrupted",
			sessionId,
			hasPendingInput,
		})
	}

	/**
	 * 세션 삭제
	 */
	delete(sessionId: string): void {
		const session = this.sessions.get(sessionId)
		if (session) {
			session.abort.abort()
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
	 * 리소스 정리
	 */
	dispose(): void {
		for (const [sessionId] of this.sessions) {
			this.delete(sessionId)
		}
		this.listeners.clear()
	}
}
