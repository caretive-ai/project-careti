// CARET MODIFICATION: Integration test to verify Cline Act compatibility
// Tests that Caret Agent mode behaves identically to Cline Act mode
// Addresses user feedback about different UI behavior

import { ModeSystemRegistry } from "../ModeSystemRegistry"

describe("Cline Compatibility Integration Tests", () => {
	let registry: ModeSystemRegistry

	beforeEach(() => {
		registry = ModeSystemRegistry.getInstance()
	})

	describe("System prompt compatibility", () => {
		test("should include detailed browser_action usage instructions", async () => {
			const context = {
				supportsBrowserUse: true,
				extensionPath: process.cwd(),
				mcpHub: null,
			}

			const prompt = await registry.buildSystemPrompt("caret", "act", context)

			// Verify browser_action instructions are present
			expect(prompt).toContain("browser_action")
			expect(prompt).toContain("action parameter")
			expect(prompt).toContain("<action>launch</action>")
			expect(prompt).toContain("<action>click</action>")
			expect(prompt).toContain("<action>type</action>")
			expect(prompt).toContain("<action>close</action>")

			// Verify specific usage examples
			expect(prompt).toContain("<url>")
			expect(prompt).toContain("<coordinate>")
			expect(prompt).toContain("<text>")
		})

		test("should not include browser tool info when not supported", async () => {
			const context = {
				supportsBrowserUse: false,
				extensionPath: process.cwd(),
				mcpHub: null,
			}

			const prompt = await registry.buildSystemPrompt("caret", "act", context)

			// Should not contain browser-specific usage instructions (even though tool definition exists)
			expect(prompt).not.toContain("Launch browser with action parameter")
			expect(prompt).not.toContain('Always start with action "launch"')
		})
	})

	describe("Tool compatibility", () => {
		test("should provide same tool availability as Cline Act", async () => {
			// This test ensures Caret Agent mode has same tool access as Cline Act
			const context = {
				supportsBrowserUse: true,
				extensionPath: process.cwd(),
				mcpHub: { connectedServers: [] },
			}

			const prompt = await registry.buildSystemPrompt("caret", "act", context)

			// Verify all major tool categories are mentioned
			expect(prompt).toContain("file operations")
			expect(prompt).toContain("terminal commands")
			expect(prompt).toContain("browser_action")
		})
	})

	describe("Error handling robustness", () => {
		test("should provide useful fallback when JSON system fails", async () => {
			const context = {
				extensionPath: "/invalid/path",
				supportsBrowserUse: true,
				mcpHub: null,
			}

			const prompt = await registry.buildSystemPrompt("caret", "act", context)

			// Should still provide basic functionality
			expect(prompt).toContain("AGENT MODE") // Capital case as in fallback
			expect(prompt).toContain("development")
			expect(prompt.length).toBeGreaterThan(50)
		})
	})
})
