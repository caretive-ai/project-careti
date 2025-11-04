// CARET MODIFICATION: VS Code Terminal Adapter 팩토리

import { SessionManager } from "../../core/SessionManager"
import { VSCodeTerminalAdapter } from "./VSCodeTerminalAdapter"

/**
 * VS Code용 세션 매니저 생성
 */
export function createVSCodeSessionManager(): SessionManager {
	return new SessionManager(() => new VSCodeTerminalAdapter())
}

// 전역 인스턴스 (싱글톤)
let globalSessionManager: SessionManager | null = null

/**
 * 전역 세션 매니저 조회 (싱글톤 패턴)
 */
export function getGlobalSessionManager(): SessionManager {
	if (!globalSessionManager) {
		globalSessionManager = createVSCodeSessionManager()
	}
	return globalSessionManager
}
