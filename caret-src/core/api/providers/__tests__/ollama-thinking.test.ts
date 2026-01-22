/**
 * TDD Tests for Ollama thinking streaming support
 *
 * Validates that Ollama `message.thinking` is surfaced as ApiStream reasoning chunks,
 * and that `think` request param gracefully falls back on older servers.
 */
import { describe, it } from "mocha"
import "should"
import sinon from "sinon"
import { ClineStorageMessage } from "@/shared/messages/content"
import { OllamaHandler } from "@core/api/providers/ollama"

describe("OllamaHandler - thinking", () => {
	it("should yield reasoning chunks from message.thinking", async () => {
		const handler = new OllamaHandler({
			ollamaBaseUrl: "http://localhost:11434",
			ollamaModelId: "llama2",
			thinkingBudgetTokens: 1,
		})

		const client = (handler as any).ensureClient()
		const chatStub = sinon.stub(client, "chat").resolves({
			[Symbol.asyncIterator]: async function* () {
				yield {
					message: { role: "assistant", content: "", thinking: "Thought" },
					done: false,
					done_reason: "",
				}
				yield {
					message: { role: "assistant", content: "Hello" },
					done: false,
					done_reason: "",
				}
				yield {
					message: { role: "assistant", content: "" },
					done: true,
					done_reason: "stop",
					eval_count: 10,
					prompt_eval_count: 20,
				}
			},
		} as any)

		const chunks: any[] = []
		const systemPrompt = "You are a helpful assistant."
		const messages: ClineStorageMessage[] = [{ role: "user", content: "Hello" }]

		for await (const chunk of handler.createMessage(systemPrompt, messages)) {
			chunks.push(chunk)
		}

		const reasoning = chunks.filter((c) => c.type === "reasoning").map((c) => c.reasoning).join("")
		const text = chunks.filter((c) => c.type === "text").map((c) => c.text).join("")
		const usage = chunks.find((c) => c.type === "usage")
		const finish = chunks.find((c) => c.type === "finish")

		reasoning.should.equal("Thought")
		text.should.equal("Hello")
		usage.should.deepEqual({ type: "usage", inputTokens: 20, outputTokens: 10 })
		finish.should.deepEqual({ type: "finish", reason: "stop" })

		chatStub.calledOnce.should.be.true()
		;(chatStub.firstCall.args[0] as any).think.should.equal(true)
		sinon.restore()
	})

	it("should fallback when server rejects `think` param", async () => {
		const handler = new OllamaHandler({
			ollamaBaseUrl: "http://localhost:11434",
			ollamaModelId: "llama2",
			thinkingBudgetTokens: 1,
		})

		const client = (handler as any).ensureClient()
		const chatStub = sinon.stub(client, "chat")
		chatStub.onFirstCall().rejects(new Error('unknown field "think"'))
		chatStub.onSecondCall().resolves({
			[Symbol.asyncIterator]: async function* () {
				yield {
					message: { role: "assistant", content: "OK" },
					done: true,
					done_reason: "stop",
				}
			},
		} as any)

		const chunks: any[] = []
		const systemPrompt = "You are a helpful assistant."
		const messages: ClineStorageMessage[] = [{ role: "user", content: "Hello" }]

		for await (const chunk of handler.createMessage(systemPrompt, messages)) {
			chunks.push(chunk)
		}

		chunks.some((c) => c.type === "text" && c.text === "OK").should.be.true()
		chatStub.calledTwice.should.be.true()
		;(chatStub.firstCall.args[0] as any).think.should.equal(true)
		;("think" in (chatStub.secondCall.args[0] as any)).should.be.false()
		sinon.restore()
	})
})

