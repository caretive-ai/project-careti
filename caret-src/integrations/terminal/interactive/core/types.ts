// CARET MODIFICATION: Terminal Tool 타입 정의

/**
 * 터미널 세션 설정
 */
export interface SessionConfig {
	command: string // 실행 명령 (예: "python3", "claude")
	args: string[] // 인자 (예: ["-i"], ["code"])
	cwd: string // 작업 디렉토리
	env?: Record<string, string> // 환경 변수 (선택)
}

/**
 * 터미널 세션 정보
 */
export interface SessionInfo {
	id: string // ULID 세션 ID
	command: string // 실행 명령
	createdAt: number // 생성 시간 (타임스탬프)
	lastActivity: number // 마지막 활동 시간 (타임스탬프)
}

/**
 * Terminal Tool 입력
 */
export interface TerminalToolInput {
	action: "open" | "send" | "read" | "stop" | "close" | "list"
	sessionId?: string // open 제외 모두 필요
	command?: string // open 시 필요
	args?: string[] // open 시 선택
	cwd?: string // open 시 선택
	input?: string // send 시 필요
}

/**
 * Terminal Tool 출력
 */
export interface TerminalToolOutput {
	success: boolean
	sessionId?: string // open, send, read에서 반환
	output?: string // read에서 반환
	sessions?: SessionInfo[] // list에서 반환
	error?: string // 실패 시
}

/**
 * Disposable 인터페이스 (이벤트 구독 해제용)
 */
export interface Disposable {
	dispose(): void
}
