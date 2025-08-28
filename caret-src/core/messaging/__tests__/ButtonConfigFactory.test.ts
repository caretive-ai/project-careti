import { describe, it, expect } from "vitest"
import { ButtonConfigFactory } from "../ButtonConfigFactory"

describe("ButtonConfigFactory", () => {
	describe("getConfig", () => {
		it("should delegate to CaretButtonConfigHandler for caret system", () => {
			const message = { type: "say", say: "text", partial: false }
			const config = ButtonConfigFactory.getConfig(message as any, "act", "caret")

			expect(config).toBeDefined()
			expect(config.sendingDisabled).toBeDefined()
		})

		it("should delegate to ClineButtonConfigHandler for cline system", () => {
			const message = { type: "ask", ask: "tool", partial: false }
			const config = ButtonConfigFactory.getConfig(message as any, "act", "cline")

			expect(config).toBeDefined()
			expect(config.enableButtons).toBeDefined()
		})

		it("should handle agent mode conversation correctly", () => {
			const message = { type: "say", say: "text", partial: false }
			const config = ButtonConfigFactory.getConfig(message as any, "act", "caret")

			// Agent mode should allow free conversation
			expect(config.sendingDisabled).toBe(false)
			expect(config.enableButtons).toBe(false)
		})

		it("should preserve cline tool approval behavior", () => {
			const message = { type: "ask", ask: "tool", text: "{}", partial: false }
			const config = ButtonConfigFactory.getConfig(message as any, "act", "cline")

			// Cline tool approval should require user action
			expect(config.sendingDisabled).toBe(false)
			expect(config.enableButtons).toBe(true)
			expect(config.primaryText).toBe("Approve")
		})
	})
})
