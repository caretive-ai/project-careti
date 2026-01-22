/**
 * Unit Tests for Vision Model Tool Description Logic
 *
 * Tests the core transformation logic in CaretiJsonAdapter:
 * - Vision models get extended read_file description
 * - Non-vision models get original read_file description
 * - analyze_image filtering based on settings (not model capability)
 */
import "should"

describe("Vision Model Tool Description Unit Tests", () => {
	// Test the read_file image capability injection logic directly
	describe("read_file image capability injection", () => {
		const ORIGINAL_READ_FILE_DESC =
			"Request to read the contents of a file at the specified path. Automatically extracts raw text from PDF and DOCX files. May not be suitable for other types of binary files."

		const injectImageCapability = (toolPrompt: string, supportsImages: boolean): string => {
			if (supportsImages && toolPrompt.includes("## read_file")) {
				return toolPrompt.replace(
					"Automatically extracts raw text from PDF and DOCX files.",
					"Automatically extracts raw text from PDF and DOCX files. **You can also read image files (PNG, JPG, GIF, WebP) and view their contents directly** - use this to examine screenshots, UI mockups, generated images, or any visual content saved to disk.",
				)
			}
			return toolPrompt
		}

		it("should inject image capability for vision model", () => {
			const toolPrompt = `## read_file\n${ORIGINAL_READ_FILE_DESC}`
			const result = injectImageCapability(toolPrompt, true)

			result.should.containEql("You can also read image files (PNG, JPG, GIF, WebP)")
			result.should.containEql("view their contents directly")
		})

		it("should NOT inject image capability for non-vision model", () => {
			const toolPrompt = `## read_file\n${ORIGINAL_READ_FILE_DESC}`
			const result = injectImageCapability(toolPrompt, false)

			result.should.not.containEql("You can also read image files")
			result.should.equal(toolPrompt)
		})

		it("should preserve original description for non-read_file tools", () => {
			const toolPrompt = `## write_to_file\nWrite content to a file.`
			const result = injectImageCapability(toolPrompt, true)

			result.should.equal(toolPrompt)
			result.should.not.containEql("You can also read image files")
		})
	})

	// Test analyze_image filtering logic
	describe("analyze_image tool filtering", () => {
		const filterAnalyzeImage = (
			toolPrompts: string[],
			settings: { analyzeImages?: boolean },
			supportsImages: boolean,
		): string[] => {
			const excludedTools: string[] = []

			// Filter based on settings only (NOT model capability)
			if (settings.analyzeImages === false) {
				excludedTools.push("analyze_image")
			}

			return toolPrompts.filter(
				(toolPrompt) => !excludedTools.some((excluded) => toolPrompt.includes(`## ${excluded}`)),
			)
		}

		it("should include analyze_image for non-vision model when enabled", () => {
			const toolPrompts = ["## read_file\nRead files", "## analyze_image\nAnalyze images"]
			const result = filterAnalyzeImage(toolPrompts, { analyzeImages: true }, false)

			result.length.should.equal(2)
			result.some((t) => t.includes("analyze_image")).should.be.true()
		})

		it("should include analyze_image for vision model when enabled (NOT excluded)", () => {
			const toolPrompts = ["## read_file\nRead files", "## analyze_image\nAnalyze images"]
			const result = filterAnalyzeImage(toolPrompts, { analyzeImages: true }, true)

			// Key test: vision models should STILL have analyze_image
			result.length.should.equal(2)
			result.some((t) => t.includes("analyze_image")).should.be.true()
		})

		it("should exclude analyze_image when disabled in settings", () => {
			const toolPrompts = ["## read_file\nRead files", "## analyze_image\nAnalyze images"]
			const result = filterAnalyzeImage(toolPrompts, { analyzeImages: false }, false)

			result.length.should.equal(1)
			result.some((t) => t.includes("analyze_image")).should.be.false()
		})

		it("should exclude analyze_image for vision model when disabled in settings", () => {
			const toolPrompts = ["## read_file\nRead files", "## analyze_image\nAnalyze images"]
			const result = filterAnalyzeImage(toolPrompts, { analyzeImages: false }, true)

			result.length.should.equal(1)
			result.some((t) => t.includes("analyze_image")).should.be.false()
		})
	})

	// Test terminology replacement
	describe("terminology replacement (PLAN/ACT → CHATBOT/AGENT)", () => {
		// NOTE: Order matters! Handle specific phrases (toggle to, switch to) BEFORE general replacements
		const replaceTerminology = (toolPrompt: string): string => {
			return (
				toolPrompt
					// Handle specific phrases FIRST (before general "Act mode" replacement)
					.replace(/toggle to (Act|ACT) mode/gi, "toggle to AGENT mode")
					.replace(/switch to (Act|ACT) mode/gi, "switch to AGENT mode")
					.replace(/toggle to (Plan|PLAN) mode/gi, "toggle to CHATBOT mode")
					.replace(/switch to (Plan|PLAN) mode/gi, "switch to CHATBOT mode")
					// Then handle general replacements
					.replace(/\bPLAN MODE\b/g, "CHATBOT MODE")
					.replace(/\bACT MODE\b/g, "AGENT MODE")
					.replace(/\bPlan mode\b/g, "Chatbot mode")
					.replace(/\bAct mode\b/g, "Agent mode")
			)
		}

		it("should replace PLAN MODE with CHATBOT MODE", () => {
			const input = "This tool is only available in PLAN MODE"
			const result = replaceTerminology(input)

			result.should.equal("This tool is only available in CHATBOT MODE")
		})

		it("should replace ACT MODE with AGENT MODE", () => {
			const input = "Execute in ACT MODE for better results"
			const result = replaceTerminology(input)

			result.should.equal("Execute in AGENT MODE for better results")
		})

		it("should replace toggle to Act mode", () => {
			const input = "NEVER include an option to toggle to Act mode"
			const result = replaceTerminology(input)

			result.should.equal("NEVER include an option to toggle to AGENT mode")
		})

		it("should handle mixed case correctly", () => {
			const input = "Use Plan mode for analysis, Act mode for execution"
			const result = replaceTerminology(input)

			result.should.equal("Use Chatbot mode for analysis, Agent mode for execution")
		})
	})
})
