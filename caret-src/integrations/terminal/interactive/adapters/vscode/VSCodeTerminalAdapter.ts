// CARET MODIFICATION: VS Code Terminal Adapter (Node.js ChildProcess 기반)

import { spawn } from "node:child_process"
import type { ChildProcess } from "node:child_process"
import type { ITerminalAdapter } from "../../core/interfaces/ITerminalAdapter"
import type { SessionConfig, Disposable } from "../../core/types"

/**
 * VS Code용 터미널 어댑터
 *
 * Node.js ChildProcess를 사용하여 실제 프로세스 실행
 */
export class VSCodeTerminalAdapter implements ITerminalAdapter {
	private process?: ChildProcess
	private outputCallback?: (data: string) => void
	private exitCallback?: (code: number) => void

	async start(config: SessionConfig): Promise<void> {
		this.process = spawn(config.command, config.args, {
			cwd: config.cwd,
			env: { ...process.env, ...config.env },
			shell: false,
		})

		// stdout 리스닝
		this.process.stdout?.on("data", (data: Buffer) => {
			const text = data.toString()
			this.outputCallback?.(text)
		})

		// stderr 리스닝 (stdout과 동일하게 처리)
		this.process.stderr?.on("data", (data: Buffer) => {
			const text = data.toString()
			this.outputCallback?.(text)
		})

		// 종료 리스닝
		this.process.on("exit", (code) => {
			this.exitCallback?.(code ?? 0)
		})

		// 프로세스 시작 대기
		await new Promise<void>((resolve, reject) => {
			if (!this.process) {
				reject(new Error("Process not initialized"))
				return
			}

			this.process.on("spawn", () => resolve())
			this.process.on("error", (err) => reject(err))
		})
	}

	sendInput(data: string): void {
		if (!this.process?.stdin) {
			throw new Error("Process not started or stdin not available")
		}
		this.process.stdin.write(data)
	}

	onOutput(callback: (data: string) => void): Disposable {
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
		if (this.process) {
			this.process.kill()
			this.process = undefined
		}
	}
}
