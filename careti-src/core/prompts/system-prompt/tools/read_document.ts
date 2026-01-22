// CARETI MODIFICATION: Add read_document tool specification for document reading
// Allows LLMs to read document files (PDF, DOCX, HWPX, PPTX, etc.) by path

import type { ClineToolSpec } from "@core/prompts/system-prompt/spec"
import { TASK_PROGRESS_PARAMETER } from "@core/prompts/system-prompt/types"
import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"

const id = ClineDefaultTool.READ_DOCUMENT

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "read_document",
	description:
		"Read and extract text content from document files (PDF, DOCX, XLSX, PPTX, HWP, HWPX, IPYNB). Use this tool when you need to read the contents of a document file that the user references by path. This tool extracts text from binary document formats. For plain text files, use read_file instead.",
	parameters: [
		{
			name: "path",
			required: true,
			instruction: `The path to the document file to read (relative to the current working directory {{CWD}} or absolute path). Supported formats: PDF, DOCX, XLSX, PPTX, HWP (한글 5.0), HWPX (한글 OOXML), IPYNB.{{MULTI_ROOT_HINT}}`,
			usage: "docs/specification.pdf",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id,
	name: "read_document",
	description:
		"Read document files (PDF, DOCX, XLSX, PPTX, HWP, HWPX, IPYNB). Extracts text from binary documents. Use read_file for plain text.",
	parameters: [
		{
			name: "path",
			required: true,
			instruction: `Document path. Supported: PDF, DOCX, XLSX, PPTX, HWP, HWPX, IPYNB.`,
			usage: "docs/spec.pdf",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const read_document_variants = [GENERIC, NATIVE_GPT_5, NATIVE_NEXT_GEN]
