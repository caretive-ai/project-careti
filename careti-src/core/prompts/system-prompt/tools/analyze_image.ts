// CARETI MODIFICATION: Add analyze_image tool specification for image analysis.
// This tool is available for ALL models to analyze file-based images.
// Even vision models need this because generated images are saved to disk, not in conversation.
// It uses Careti API (Gemini 2.5 Flash) to analyze images.

import type { ClineToolSpec } from "@core/prompts/system-prompt/spec"
import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"

const id = ClineDefaultTool.ANALYZE_IMAGE

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "analyze_image",
	description: `Analyze an image file using vision AI. Use this tool to examine images saved on disk, including images created by generate_image.

**When to use this tool:**
- UI/UX analysis: Check for misalignment, layout issues, visual bugs, responsive design problems
- Text extraction: Extract text from screenshots, dialogs, error messages, logs that cannot be copy-pasted
- Code review: Analyze screenshots of code, identify issues or patterns
- Design comparison: Compare UI implementations with design mockups
- Error analysis: Interpret error dialogs, stack traces, or debug output shown in images
- Verifying generated images: Check if generate_image output contains expected elements

**CRITICAL USAGE GUIDELINES:**
1. NEVER claim to have analyzed an image without actually calling this tool
2. Be SPECIFIC in your question - include exact details of what you're looking for
3. If verifying objects in an image, LIST each expected object explicitly in the question
4. Analysis results may not be 100% accurate - treat them as guidance, not absolute truth
5. If results seem incomplete, you can call the tool again with a more specific question

**Example for verifying tarot card objects:**
Bad: "What's in this image?"
Good: "Check if this Magician tarot card contains: infinity symbol above head, wand, cup, sword, pentacle on the altar table, white robe, red cloak, and garden flowers."

**Using with generate_image:** When generate_image returns "Image file: .agents/generated-assets/img_xxx.png", use that exact path for the image parameter. Do NOT use shell commands to find the file.

**Reporting results to user:** After analysis, ALWAYS clearly show the user: (1) The exact question you asked, (2) The analysis response received. This transparency helps users verify the analysis was performed correctly and understand what was checked.

The analysis is performed by Careti's vision AI (Gemini 2.5 Flash). Requires Careti account login.`,
	parameters: [
		{
			name: "image",
			required: true,
			instruction:
				"Path to the image file to analyze. Can be a relative path from workspace root, absolute path, or file:// URL. Also accepts data: URLs for inline images.",
			usage: "screenshots/error-dialog.png",
		},
		{
			name: "question",
			required: true,
			instruction:
				"Your specific question about the image. Be DETAILED - include exact elements, objects, or text you want to verify. Vague questions lead to vague answers. For verification tasks, explicitly list what should be present.",
			usage: "Check if this UI contains: login button in top-right, email input field, password field with show/hide toggle, and 'Forgot password?' link below.",
		},
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id,
	name: "analyze_image",
	description: `Analyze an image using vision AI. Use for UI analysis, text extraction, code review, design comparison, error interpretation, and verifying generated images.

**IMPORTANT:** Be SPECIFIC in your question - list exact elements to verify. Results may not be 100% accurate. NEVER claim analysis results without calling this tool.`,
	parameters: [
		{
			name: "image",
			required: true,
			instruction: "Path to the image file (relative/absolute/file:// URL) or data: URL.",
		},
		{
			name: "question",
			required: true,
			instruction:
				"Your SPECIFIC question. For verification, explicitly list expected elements (e.g., 'Check if image contains: X, Y, Z').",
		},
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const analyze_image_variants = [GENERIC, NATIVE_GPT_5, NATIVE_NEXT_GEN]
