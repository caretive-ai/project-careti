// CARET MODIFICATION: Terminal Session Manager

import { ulid } from "ulid"
import { InteractiveSession } from "./InteractiveSession"
import type { ITerminalAdapter } from "./interfaces/ITerminalAdapter"
import type { SessionConfig, SessionInfo } from "./types"

/**
 * 터미널 세션 관리자
 *
 * 역할:
 * - 세션 생명주기 관리 (생성, 조회, 종료)
 * - ULID 기반 세션 ID 발급
 * - 다중 세션 추적
 */
export class SessionManager {
	private sessions: Map<string, InteractiveSession> = new Map()
	private sessionMetadata: Map<string, { createdAt: number; lastActivity: number }> = new Map()

	constructor(private adapterFactory: () => ITerminalAdapter) {}

	/**
	 * 새 세션 생성
	 * @param config 세션 설정
	 * @returns 세션 ID (ULID)
	 */
	async createSession(config: SessionConfig): Promise<string> {
		const id = ulid()
		const adapter = this.adapterFactory()
		const session = new InteractiveSession(adapter, config)

		await session.start()

		this.sessions.set(id, session)
		this.sessionMetadata.set(id, {
			createdAt: Date.now(),
			lastActivity: Date.now(),
		})

		return id
	}

	/**
	 * 세션 조회
	 * @param id 세션 ID
	 * @returns 세션 인스턴스 또는 undefined
	 */
	getSession(id: string): InteractiveSession | undefined {
		// 활동 시간 업데이트
		const metadata = this.sessionMetadata.get(id)
		if (metadata) {
			metadata.lastActivity = Date.now()
		}

		return this.sessions.get(id)
	}

	/**
	 * 세션 종료
	 * @param id 세션 ID
	 */
	closeSession(id: string): void {
		const session = this.sessions.get(id)
		if (session) {
			session.dispose()
			this.sessions.delete(id)
			this.sessionMetadata.delete(id)
		}
	}

	/**
	 * 활성 세션 목록 조회
	 * @returns 세션 정보 배열
	 */
	listSessions(): SessionInfo[] {
		return Array.from(this.sessions.entries()).map(([id, session]) => {
			const metadata = this.sessionMetadata.get(id)
			return {
				id,
				command: session.config.command,
				createdAt: metadata?.createdAt ?? 0,
				lastActivity: metadata?.lastActivity ?? 0,
			}
		})
	}

	/**
	 * 모든 세션 종료 및 리소스 정리
	 */
	dispose(): void {
		for (const [id, session] of this.sessions.entries()) {
			session.dispose()
		}
		this.sessions.clear()
		this.sessionMetadata.clear()
	}
}
