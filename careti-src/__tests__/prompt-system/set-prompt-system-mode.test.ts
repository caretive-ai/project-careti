import { describe, expect, it, beforeEach, vi } from "vitest"

import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"
import { SetPromptSystemMode } from "@core/controller/persona/SetPromptSystemMode"

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
		CaretiGlobalManager.reset()
		CaretiGlobalManager.initialize("cline")
	})

	it("persists caretModeSystem to globalState and updates manager", async () => {
		const controller = createMockController()

		const response = await SetPromptSystemMode(
			controller,
			{
				mode: "careti",
			} as any,
		)

		expect(response.success).toBe(true)
		expect(response.currentMode).toBe("careti")
		expect(CaretiGlobalManager.currentMode).toBe("careti")
		expect(controller.stateManager.setGlobalStateBatch).toHaveBeenCalledWith({ caretModeSystem: "careti" })
		expect(controller.postStateToWebview).toHaveBeenCalled()
	})

	it("rejects invalid mode without persisting state", async () => {
		const controller = createMockController()

		const response = await SetPromptSystemMode(
			controller,
			{
				mode: "invalid",
			} as any,
		)

		expect(response.success).toBe(false)
		expect(controller.stateManager.setGlobalStateBatch).not.toHaveBeenCalled()
		expect(controller.postStateToWebview).not.toHaveBeenCalled()
		// manager should remain cline
		expect(CaretiGlobalManager.currentMode).toBe("cline")
	})
})
