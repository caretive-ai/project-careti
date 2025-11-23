// CARET MODIFICATION: VS Code Terminal Adapter 팩토리

import { SessionManager } from "../../core/SessionManager"
import { VSCodeTerminalAdapter } from "./VSCodeTerminalAdapter"
import { TerminalEventBus } from "../../stream/TerminalEventBus"
import { TerminalService } from "../../service/TerminalService"

const STREAM_ENV = "CARET_TERMINAL_STREAM"

/**
 * VS Code용 세션 매니저 생성
 */
export function createVSCodeSessionManager(): SessionManager {
	return new SessionManager(() => new VSCodeTerminalAdapter())
}

// 전역 인스턴스 (싱글톤)
let globalSessionManager: SessionManager | null = null
let globalTerminalService: TerminalService | null = null

/**
 * 전역 세션 매니저 조회 (싱글톤 패턴)
 */
export function getGlobalSessionManager(): SessionManager {
	return getTerminalService().getSessionManager()
}

/**
 * 전역 터미널 서비스 조회 (세션 + 이벤트 버스)
 */
export function getTerminalService(): TerminalService {
	if (!globalTerminalService) {
		const useStream = process.env[STREAM_ENV] === "true"
		const eventBus = useStream ? new TerminalEventBus() : undefined
		const sessionManager = createVSCodeSessionManager()
		globalTerminalService = new TerminalService(sessionManager, eventBus)
		globalSessionManager = sessionManager
	}
	return globalTerminalService
}
