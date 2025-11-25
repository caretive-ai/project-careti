import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import { SetPromptSystemMode } from "@core/controller/persona/SetPromptSystemMode"
import { beforeEach, describe, expect, it, vi } from "vitest"

const createMockController = () => {
	const stateManager = {
		setGlobalStateBatch: vi.fn(),
	}
	return {
		stateManager,
		postStateToWebview: vi.fn(),
	} as any
}

describe("SetPromptSystemMode", () => {
	beforeEach(() => {
		CaretGlobalManager.reset()
		CaretGlobalManager.initialize("cline")
	})

	it("persists caretModeSystem to globalState and updates manager", async () => {
		const controller = createMockController()

		const response = await SetPromptSystemMode(controller, {
			mode: "caret",
		} as any)

		expect(response.success).toBe(true)
		expect(response.currentMode).toBe("caret")
		expect(CaretGlobalManager.currentMode).toBe("caret")
		expect(controller.stateManager.setGlobalStateBatch).toHaveBeenCalledWith({ caretModeSystem: "caret" })
		expect(controller.postStateToWebview).toHaveBeenCalled()
	})

	it("rejects invalid mode without persisting state", async () => {
		const controller = createMockController()

		const response = await SetPromptSystemMode(controller, {
			mode: "invalid",
		} as any)

		expect(response.success).toBe(false)
		expect(controller.stateManager.setGlobalStateBatch).not.toHaveBeenCalled()
		expect(controller.postStateToWebview).not.toHaveBeenCalled()
		// manager should remain cline
		expect(CaretGlobalManager.currentMode).toBe("cline")
	})
})
