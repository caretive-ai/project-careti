import { describe, it } from "mocha"
import { expect } from "chai"

// CARET MODIFICATION: Test for rule priority logic
// Based on caret-main implementation analysis
function addUserInstructions(
	globalClineRulesFileInstructions?: string,
	localClineRulesFileInstructions?: string,
	localCaretRulesFileInstructions?: string,
	localCursorRulesFileInstructions?: string,
	localCursorRulesDirInstructions?: string,
	localWindsurfRulesFileInstructions?: string,
	clineIgnoreInstructions?: string,
	preferredLanguageInstructions?: string,
) {
	let customInstructions = ""
	if (preferredLanguageInstructions) {
		customInstructions += preferredLanguageInstructions + "\n\n"
	}
	if (globalClineRulesFileInstructions) {
		customInstructions += globalClineRulesFileInstructions + "\n\n"
	}

	// CARET MODIFICATION: Priority-based local rules loading
	// Priority: .caretrules > .clinerules > .cursorrules > .windsurfrules
	if (localCaretRulesFileInstructions) {
		// .caretrules has highest priority
		customInstructions += localCaretRulesFileInstructions + "\n\n"
	} else if (localClineRulesFileInstructions) {
		// .clinerules has second priority
		customInstructions += localClineRulesFileInstructions + "\n\n"
	} else if (localCursorRulesFileInstructions || localCursorRulesDirInstructions) {
		// .cursorrules has third priority
		if (localCursorRulesFileInstructions) {
			customInstructions += localCursorRulesFileInstructions + "\n\n"
		}
		if (localCursorRulesDirInstructions) {
			customInstructions += localCursorRulesDirInstructions + "\n\n"
		}
	} else if (localWindsurfRulesFileInstructions) {
		// .windsurfrules has lowest priority
		customInstructions += localWindsurfRulesFileInstructions + "\n\n"
	}

	if (clineIgnoreInstructions) {
		customInstructions += clineIgnoreInstructions
	}

	return `
====

USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

${customInstructions.trim()}`
}

describe("Rule Priority Logic", () => {
	it("should prioritize .caretrules over all other rules", () => {
		const result = addUserInstructions(
			undefined, // globalClineRulesFileInstructions
			"Cline Rules Content", // localClineRulesFileInstructions
			"Caret Rules Content", // localCaretRulesFileInstructions
			"Cursor Rules Content", // localCursorRulesFileInstructions
			undefined, // localCursorRulesDirInstructions
			"Windsurf Rules Content", // localWindsurfRulesFileInstructions
		)

		expect(result).to.contain("Caret Rules Content")
		expect(result).to.not.contain("Cline Rules Content")
		expect(result).to.not.contain("Cursor Rules Content")
		expect(result).to.not.contain("Windsurf Rules Content")
	})

	it("should use .clinerules when .caretrules is not available", () => {
		const result = addUserInstructions(
			undefined, // globalClineRulesFileInstructions
			"Cline Rules Content", // localClineRulesFileInstructions
			undefined, // localCaretRulesFileInstructions
			"Cursor Rules Content", // localCursorRulesFileInstructions
			undefined, // localCursorRulesDirInstructions
			"Windsurf Rules Content", // localWindsurfRulesFileInstructions
		)

		expect(result).to.contain("Cline Rules Content")
		expect(result).to.not.contain("Cursor Rules Content")
		expect(result).to.not.contain("Windsurf Rules Content")
	})

	it("should use .cursorrules when .caretrules and .clinerules are not available", () => {
		const result = addUserInstructions(
			undefined, // globalClineRulesFileInstructions
			undefined, // localClineRulesFileInstructions
			undefined, // localCaretRulesFileInstructions
			"Cursor Rules Content", // localCursorRulesFileInstructions
			undefined, // localCursorRulesDirInstructions
			"Windsurf Rules Content", // localWindsurfRulesFileInstructions
		)

		expect(result).to.contain("Cursor Rules Content")
		expect(result).to.not.contain("Windsurf Rules Content")
	})

	it("should use .windsurfrules when only it is available", () => {
		const result = addUserInstructions(
			undefined, // globalClineRulesFileInstructions
			undefined, // localClineRulesFileInstructions
			undefined, // localCaretRulesFileInstructions
			undefined, // localCursorRulesFileInstructions
			undefined, // localCursorRulesDirInstructions
			"Windsurf Rules Content", // localWindsurfRulesFileInstructions
		)

		expect(result).to.contain("Windsurf Rules Content")
	})

	it("should include both cursor file and directory rules when cursor has priority", () => {
		const result = addUserInstructions(
			undefined, // globalClineRulesFileInstructions
			undefined, // localClineRulesFileInstructions
			undefined, // localCaretRulesFileInstructions
			"Cursor File Rules", // localCursorRulesFileInstructions
			"Cursor Dir Rules", // localCursorRulesDirInstructions
			"Windsurf Rules Content", // localWindsurfRulesFileInstructions
		)

		expect(result).to.contain("Cursor File Rules")
		expect(result).to.contain("Cursor Dir Rules")
		expect(result).to.not.contain("Windsurf Rules Content")
	})

	it("should always include global rules regardless of local rule priority", () => {
		const result = addUserInstructions(
			"Global Rules Content", // globalClineRulesFileInstructions
			"Cline Rules Content", // localClineRulesFileInstructions
			"Caret Rules Content", // localCaretRulesFileInstructions
			"Cursor Rules Content", // localCursorRulesFileInstructions
			undefined, // localCursorRulesDirInstructions
			"Windsurf Rules Content", // localWindsurfRulesFileInstructions
		)

		expect(result).to.contain("Global Rules Content")
		expect(result).to.contain("Caret Rules Content")
		expect(result).to.not.contain("Cline Rules Content")
		expect(result).to.not.contain("Cursor Rules Content")
		expect(result).to.not.contain("Windsurf Rules Content")
	})

	it("should handle empty rules gracefully", () => {
		const result = addUserInstructions()

		expect(result).to.contain("USER'S CUSTOM INSTRUCTIONS")
		expect(result).to.contain("The following additional instructions are provided by the user")
		// When no rules are provided, the result should only contain the header
		expect(result.trim().endsWith("without interfering with the TOOL USE guidelines.")).to.be.true
	})
})
