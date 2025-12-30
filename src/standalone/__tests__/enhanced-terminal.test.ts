// CARET MODIFICATION: TDD 회귀 테스트 - Windows cmd.exe에서 큰따옴표 깨짐 방지를 위해 spawn 옵션 shell:true 적용

import { EventEmitter } from "node:events"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { expect } from "chai"
import { describe, it } from "mocha"
import * as sinon from "sinon"

type SpawnArgs = {
	command: string
	args: string[]
	options: Record<string, any>
}

function createFakeChildProcess() {
	const child: any = new EventEmitter()
	child.stdout = new EventEmitter()
	child.stderr = new EventEmitter()
	child.pid = 12345
	return child
}

describe("Standalone enhanced terminal", () => {
	it("cmd.exe일 때 shell 옵션을 활성화하고 cmd.exe로 spawn한다", async () => {
		const captured: SpawnArgs[] = []
		const spawnStub = sinon.stub().callsFake((command: string, args: string[], options: any) => {
			captured.push({ command, args, options })
			return createFakeChildProcess()
		})

		const require = createRequire(import.meta.url)
		const childProcess = require("child_process")
		const originalSpawn = childProcess.spawn
		const modulePath = resolve(
			dirname(fileURLToPath(import.meta.url)),
			"../../../standalone/runtime-files/vscode/enhanced-terminal.js",
		)

		try {
			childProcess.spawn = spawnStub
			delete require.cache[require.resolve(modulePath)]
			const { StandaloneTerminalProcess } = require(modulePath)

			const proc = new StandaloneTerminalProcess()
			await proc.run({ _shellPath: "cmd.exe", _cwd: process.cwd() }, 'echo "hello"')

			expect(spawnStub.called).to.equal(true)
			expect(captured[0].command).to.equal("cmd.exe")
			expect(captured[0].args).to.deep.equal(["/c", 'echo "hello"'])
			expect(captured[0].options.shell).to.equal(true)
		} finally {
			childProcess.spawn = originalSpawn
			delete require.cache[require.resolve(modulePath)]
		}
	})

	it("cmd.exe가 아닐 때는 지정된 shell로 spawn한다", async () => {
		const captured: SpawnArgs[] = []
		const spawnStub = sinon.stub().callsFake((command: string, args: string[], options: any) => {
			captured.push({ command, args, options })
			return createFakeChildProcess()
		})

		const require = createRequire(import.meta.url)
		const childProcess = require("child_process")
		const originalSpawn = childProcess.spawn
		const modulePath = resolve(
			dirname(fileURLToPath(import.meta.url)),
			"../../../standalone/runtime-files/vscode/enhanced-terminal.js",
		)

		try {
			childProcess.spawn = spawnStub
			delete require.cache[require.resolve(modulePath)]
			const { StandaloneTerminalProcess } = require(modulePath)

			const proc = new StandaloneTerminalProcess()
			await proc.run({ _shellPath: "/bin/bash", _cwd: process.cwd() }, 'echo "hello"')

			expect(spawnStub.called).to.equal(true)
			expect(captured[0].command).to.equal("/bin/bash")
			expect(captured[0].options.shell).to.equal(undefined)
		} finally {
			childProcess.spawn = originalSpawn
			delete require.cache[require.resolve(modulePath)]
		}
	})
})
