// CARET MODIFICATION: ask()/say() 동시성 레이스(ask 무효화) 회귀 테스트
import { describe, it } from "mocha"
import "should"
import { Task } from "../index"
import { TaskState } from "../TaskState"
import { HostProvider } from "@/hosts/host-provider"

class SimpleMutex {
	private queue = Promise.resolve<void>(undefined)
	withLock<T>(fn: () => T | Promise<T>): Promise<T> {
		const run = this.queue.then(() => fn())
		this.queue = run.then(
			() => undefined,
			() => undefined,
		)
		return run
	}
}

class FakeMessageStateHandler {
	private messages: any[] = []
	getClineMessages() {
		return this.messages
	}
	async addToClineMessages(message: any) {
		this.messages.push(message)
	}
	async updateClineMessage(index: number, updates: any) {
		this.messages[index] = { ...this.messages[index], ...updates }
	}
}

const tick = async () => new Promise((resolve) => setTimeout(resolve, 0))

describe("Task.ask concurrency", () => {
	const initHostProvider = () => {
		// CARET MODIFICATION: Provide a minimal HostProvider stub for Logger usage.
		if (HostProvider.isInitialized()) {
			HostProvider.reset()
		}
		HostProvider.initialize(
			() => ({} as any),
			() => ({} as any),
			{
				workspaceClient: {} as any,
				envClient: {} as any,
				windowClient: {} as any,
				diffClient: {} as any,
			},
			() => {},
			async () => "",
			async () => "",
			"",
			"",
		)
	}

	it("should not ignore an ask when lastMessageTs changes (e.g. say() during ask)", async () => {
		initHostProvider()
		const task = Object.create(Task.prototype) as Task
		;(task as any).taskState = new TaskState()
		;(task as any).messageStateHandler = new FakeMessageStateHandler()
		;(task as any).postStateToWebview = async () => {}
		;(task as any).askMutex = new SimpleMutex()

		const askPromise = task.ask("tool" as any, "approve?")
		await tick()

		const askTs = (task as any).taskState.lastMessageTs as number
		;(task as any).taskState.lastMessageTs = askTs + 1

		await tick()
		await task.handleWebviewAskResponse("yesButtonClicked" as any)

		const result = await askPromise
		result.response.should.equal("yesButtonClicked")
	})

	it("should still ignore the previous ask when a new ask starts before responding", async () => {
		initHostProvider()
		const task = Object.create(Task.prototype) as Task
		;(task as any).taskState = new TaskState()
		;(task as any).messageStateHandler = new FakeMessageStateHandler()
		;(task as any).postStateToWebview = async () => {}
		;(task as any).askMutex = new SimpleMutex()

		const ask1 = task.ask("tool" as any, "first?")
		await tick()
		const ask2 = task.ask("tool" as any, "second?")
		await tick()

		// 기대 동작: ask는 직렬화되어 ask1 → ask2 순으로 처리되어야 한다.
		await task.handleWebviewAskResponse("yesButtonClicked" as any)
		const result1 = await ask1
		result1.response.should.equal("yesButtonClicked")

		await tick()
		await task.handleWebviewAskResponse("yesButtonClicked" as any)
		const result2 = await ask2
		result2.response.should.equal("yesButtonClicked")
	})
})
