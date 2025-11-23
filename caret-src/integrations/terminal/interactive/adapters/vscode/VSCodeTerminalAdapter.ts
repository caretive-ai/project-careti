// CARET MODIFICATION: VS Code Terminal Adapter (node-pty PTY 기반)

import * as pty from "node-pty"
import type { IPty } from "node-pty"
import type { ITerminalAdapter } from "../../core/interfaces/ITerminalAdapter"
import type { SessionConfig, Disposable } from "../../core/types"

/**
 * VS Code용 터미널 어댑터
 *
 * node-pty를 사용하여 실제 PTY (Pseudo-Terminal) 실행
 * - TTY 환경 제공으로 Node.js REPL, Claude Code CLI 등 완벽 지원
 * - 터미널 제어 시퀀스, 색상, 포맷팅 지원
 */
export class VSCodeTerminalAdapter implements ITerminalAdapter {
	private ptyProcess?: IPty
	private outputCallback?: (data: string) => void
	private exitCallback?: (code: number) => void
	private outputBuffer: string[] = [] // 임시 버퍼 (callback 등록 전 출력 저장)

	async start(config: SessionConfig): Promise<void> {
		// PTY 프로세스 생성 (TTY 환경 제공)
		this.ptyProcess = pty.spawn(config.command, config.args, {
			name: "xterm-color", // 터미널 타입
			cols: 80, // 터미널 너비
			rows: 30, // 터미널 높이
			cwd: config.cwd,
			env: { ...process.env, ...config.env },
		})

		// 출력 리스닝 (stdout + stderr 통합)
		this.ptyProcess.onData((data: string) => {
			if (this.outputCallback) {
				// callback이 등록되어 있으면 즉시 전달
				this.outputCallback(data)
			} else {
				// callback이 아직 없으면 버퍼에 저장
				this.outputBuffer.push(data)
			}
		})

		// 종료 리스닝
		this.ptyProcess.onExit(({ exitCode }) => {
			this.exitCallback?.(exitCode)
		})

		// PTY는 즉시 시작되므로 짧은 대기만 필요
		await new Promise<void>((resolve) => {
			setTimeout(resolve, 100)
		})
	}

	sendInput(data: string): void {
		if (!this.ptyProcess) {
			throw new Error("PTY process not started")
		}
		this.ptyProcess.write(data)
	}

	onOutput(callback: (data: string) => void): Disposable {
		// 버퍼에 쌓인 출력을 먼저 전달
		for (const data of this.outputBuffer) {
			callback(data)
		}
		this.outputBuffer = []

		// 이후 출력은 callback으로 직접 전달
		this.outputCallback = callback
		return {
			dispose: () => {
				this.outputCallback = undefined
			},
		}
	}

	onExit(callback: (code: number) => void): Disposable {
		this.exitCallback = callback
		return {
			dispose: () => {
				this.exitCallback = undefined
			},
		}
	}

	dispose(): void {
		if (this.ptyProcess) {
			this.ptyProcess.kill()
			this.ptyProcess = undefined
		}
	}
}
