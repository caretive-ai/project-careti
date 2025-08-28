import { describe, it, expect } from "vitest"
import { MessageHandlerFactory } from "../MessageHandlerFactory"

describe("MessageHandlerFactory", () => {
	describe("create", () => {
		it("should create handler for caret system", () => {
			const handler = MessageHandlerFactory.create("caret")
			expect(handler).toBeDefined()
			expect(handler.constructor.name).toBe("CaretMessageHandler")
		})

		it("should create handler for cline system", () => {
			const handler = MessageHandlerFactory.create("cline")
			expect(handler).toBeDefined()
			expect(handler.constructor.name).toBe("ClineMessageHandler")
		})

		it("should have handleSendMessage method", () => {
			const caretHandler = MessageHandlerFactory.create("caret")
			const clineHandler = MessageHandlerFactory.create("cline")

			expect(typeof caretHandler.handleSendMessage).toBe("function")
			expect(typeof clineHandler.handleSendMessage).toBe("function")
		})
	})
})
