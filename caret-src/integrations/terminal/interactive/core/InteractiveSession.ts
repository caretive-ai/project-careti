// CARET MODIFICATION: Interactive Terminal Session

import { EventEmitter } from "node:events"
import type { ITerminalAdapter } from "./interfaces/ITerminalAdapter"
import type { SessionConfig, Disposable } from "./types"

/**
 * Interactive Terminal 세션
 *
 * 역할:
 * - 어댑터를 통한 프로세스 생명주기 관리
 * - 출력 버퍼링 및 이벤트 발생
 * - 입력 전송
 */
export class InteractiveSession extends EventEmitter {
	private outputBuffer: string[] = []
	private disposables: Disposable[] = []

	constructor(
		private adapter: ITerminalAdapter,
		public readonly config: SessionConfig,
	) {
		super()
	}

	/**
	 * 세션 시작
	 */
	async start(): Promise<void> {
		await this.adapter.start(this.config)

		// 출력 구독
		const outputDisposable = this.adapter.onOutput((data) => {
			this.outputBuffer.push(data)
			this.emit("output", data)
		})
		this.disposables.push(outputDisposable)

		// 종료 구독
		const exitDisposable = this.adapter.onExit((code) => {
			this.emit("exit", code)
		})
		this.disposables.push(exitDisposable)
	}

	/**
	 * 입력 전송 (자동으로 개행 추가)
	 * @param text 전송할 텍스트
	 */
	sendInput(text: string): void {
		this.adapter.sendInput(`${text}\n`)
	}

	/**
	 * 출력 버퍼 읽기
	 * @param since 시작 인덱스 (선택, 기본값: 0)
	 * @returns 출력 라인 배열
	 */
	getOutput(since?: number): string[] {
		return this.outputBuffer.slice(since || 0)
	}

	/**
	 * 새 출력이 도착할 때까지 대기하며 읽기 (비동기)
	 *
	 * 이 메서드는 새로운 출력이 버퍼에 추가될 때까지 대기합니다.
	 * 타임아웃 내에 출력이 도착하면 즉시 반환하고,
	 * 타임아웃이 지나면 빈 배열을 반환합니다.
	 *
	 * @param timeout 최대 대기 시간 (밀리초, 기본값: 2000ms)
	 * @returns 새로 추가된 출력 라인 배열
	 */
	async readOutput(timeout: number = 2000): Promise<string[]> {
		const startLength = this.outputBuffer.length
		const startTime = Date.now()

		return new Promise((resolve) => {
			const checkOutput = () => {
				// 새 출력이 있으면 즉시 반환
				if (this.outputBuffer.length > startLength) {
					resolve(this.outputBuffer.slice(startLength))
				}
				// 타임아웃 도달
				else if (Date.now() - startTime >= timeout) {
					resolve([]) // 빈 배열 반환
				}
				// 계속 대기 (100ms 간격)
				else {
					setTimeout(checkOutput, 100)
				}
			}
			checkOutput()
		})
	}

	/**
	 * 출력 버퍼 초기화
	 */
	clearOutput(): void {
		this.outputBuffer = []
	}

	/**
	 * 리소스 정리
	 */
	dispose(): void {
		for (const disposable of this.disposables) {
			disposable.dispose()
		}
		this.disposables = []
		this.adapter.dispose()
	}
}
