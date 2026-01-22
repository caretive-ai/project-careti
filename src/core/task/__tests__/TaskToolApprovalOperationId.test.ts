// CARETI MODIFICATION: tool 승인 ask가 progress say와 분리되어 중복 카드가 생기는 문제 회귀 테스트
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

describe("Task.ask tool approval operationId", () => {
	const initHostProvider = () => {
		// CARETI MODIFICATION: Provide a minimal HostProvider stub for Logger usage.
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

	it("should reuse an existing tool message row for approval (no duplicate tool cards)", async () => {
		initHostProvider()
		const task = Object.create(Task.prototype) as Task
		;(task as any).taskState = new TaskState()
		;(task as any).messageStateHandler = new FakeMessageStateHandler()
		;(task as any).postStateToWebview = async () => {}
		;(task as any).askMutex = new SimpleMutex()
		;(task as any).getCurrentProviderInfo = () => ({ providerId: "test", model: { id: "test-model" } })

		const operationId = "op_test_1"
		const sayTs = Date.now()
		await (task as any).messageStateHandler.addToClineMessages({
			ts: sayTs,
			type: "say",
			say: "tool",
			text: JSON.stringify({ tool: "generateImage", status: "pending" }),
			operationId,
			partial: true,
		})

		const completeMessage = JSON.stringify({ tool: "generateImage", status: "generating" })
		const askPromise = task.ask("tool" as any, completeMessage, false, operationId)

		await tick()
		await task.handleWebviewAskResponse("yesButtonClicked" as any)
		await askPromise

		const messages = (task as any).messageStateHandler.getClineMessages()
		messages.length.should.equal(1)
		messages[0].type.should.equal("say")
		messages[0].say.should.equal("tool")
		messages[0].operationId.should.equal(operationId)
		messages[0].text.should.equal(completeMessage)
	})
})

