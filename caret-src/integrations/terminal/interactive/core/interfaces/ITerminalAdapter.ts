// CARET MODIFICATION: Terminal Adapter 인터페이스 (플랫폼 독립)

import type { SessionConfig, Disposable } from "../types"

/**
 * 플랫폼 독립적인 터미널 어댑터 인터페이스
 *
 * 구현체:
 * - VSCodeTerminalAdapter (현재)
 * - IntelliJTerminalAdapter (향후)
 */
export interface ITerminalAdapter {
	/**
	 * 터미널 세션 시작
	 * @param config 세션 설정
	 */
	start(config: SessionConfig): Promise<void>

	/**
	 * 입력 전송 (stdin)
	 * @param data 전송할 데이터
	 */
	sendInput(data: string): void

	/**
	 * 출력 이벤트 구독 (stdout/stderr)
	 * @param callback 출력 데이터를 받을 콜백
	 * @returns 구독 해제를 위한 Disposable
	 */
	onOutput(callback: (data: string) => void): Disposable

	/**
	 * 종료 이벤트 구독
	 * @param callback 종료 코드를 받을 콜백
	 * @returns 구독 해제를 위한 Disposable
	 */
	onExit(callback: (code: number) => void): Disposable

	/**
	 * 리소스 정리 (프로세스 종료 등)
	 */
	dispose(): void
}
