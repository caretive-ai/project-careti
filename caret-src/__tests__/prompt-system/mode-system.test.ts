import { describe, expect, it, vi } from "vitest"

vi.mock("@caret/core/prompts/CaretPromptWrapper", () => ({
	CaretPromptWrapper: {
		getCaretSystemPrompt: vi.fn(async () => "caret-prompt"),
	},
}))

const mockRegistryInstance = {
	get: vi.fn(async () => "cline-prompt"),
	nativeTools: ["t1"],
}

vi.mock("@core/prompts/system-prompt/registry/PromptRegistry", () => ({
	PromptRegistry: { getInstance: vi.fn(() => mockRegistryInstance) },
}))

import { getSystemPrompt } from "@core/prompts/system-prompt"

describe("getSystemPrompt modeSystem branching", () => {
	it("routes to CaretPromptWrapper when modeSystem is caret", async () => {
		const result = await getSystemPrompt({
			modeSystem: "caret",
		} as any)

		expect(result.systemPrompt).toBe("caret-prompt")
		expect(result.tools).toEqual([])
		expect(mockRegistryInstance.get).not.toHaveBeenCalled()
	})

	it("uses Cline registry when modeSystem is cline", async () => {
		const result = await getSystemPrompt({
			modeSystem: "cline",
		} as any)

		expect(result.systemPrompt).toBe("cline-prompt")
		expect(result.tools).toEqual(["t1"])
	})
})
