// CARET MODIFICATION: Add generate_image tool specification for image generation.
import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import type { ClineToolSpec } from "../spec"
import { TASK_PROGRESS_PARAMETER } from "../types"

const id = ClineDefaultTool.GENERATE_IMAGE

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "generate_image",
	description:
		"Generate a single image from a text prompt. The image will be shown in the UI as a single card. Do not request or include raw image data in your own response.",
	parameters: [
		{
			name: "prompt",
			required: true,
			instruction: "A clear text prompt describing the image to generate.",
			usage: "A neon city skyline at dusk, cinematic lighting",
		},
		{
			name: "model",
			required: false,
			instruction: "Optional image model id. If omitted, the default image model will be used.",
			usage: "gemini-3-pro-image-preview",
		},
		{
			name: "aspect_ratio",
			required: false,
			instruction: "Optional aspect ratio for the output image (e.g., 16:9, 1:1, 4:3).",
			usage: "16:9",
		},
		{
			name: "image_size",
			required: false,
			instruction: "Optional image size preset (e.g., 1K, 2K).",
			usage: "1K",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id,
	name: "generate_image",
	description: "Generate a single image from a text prompt. The image will be shown in the UI.",
	parameters: [
		{
			name: "prompt",
			required: true,
			instruction: "A clear text prompt describing the image to generate.",
		},
		{
			name: "model",
			required: false,
			instruction: "Optional image model id.",
		},
		{
			name: "aspect_ratio",
			required: false,
			instruction: "Optional aspect ratio for the output image.",
		},
		{
			name: "image_size",
			required: false,
			instruction: "Optional image size preset.",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const generate_image_variants = [GENERIC, NATIVE_GPT_5, NATIVE_NEXT_GEN]
