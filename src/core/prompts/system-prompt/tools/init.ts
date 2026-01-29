// Import all tool variants
import { ClineToolSet } from "../registry/ClineToolSet"
import { access_mcp_resource_variants } from "./access_mcp_resource"
import { act_mode_respond_variants } from "./act_mode_respond"
import { apply_patch_variants } from "./apply_patch"
import { ask_followup_question_variants } from "./ask_followup_question"
import { attempt_completion_variants } from "./attempt_completion"
import { browser_action_variants } from "./browser_action"
import { execute_command_variants } from "./execute_command"
import { focus_chain_variants } from "./focus_chain"
import { generate_explanation_variants } from "./generate_explanation" // CARETI MODIFICATION: Added for Cline v3.49.1 parity
// CARETI MODIFICATION: load careti image tool variants from careti-src
import { generate_image_variants } from "@careti/core/prompts/system-prompt/tools/generate_image"
// CARETI MODIFICATION: load analyze_image tool variants for models that don't support images
import { analyze_image_variants } from "@careti/core/prompts/system-prompt/tools/analyze_image"
// CARETI MODIFICATION: load read_document tool variants for document reading
import { read_document_variants } from "@careti/core/prompts/system-prompt/tools/read_document"
import { list_code_definition_names_variants } from "./list_code_definition_names"
import { list_files_variants } from "./list_files"
import { load_mcp_documentation_variants } from "./load_mcp_documentation"
import { new_task_variants } from "./new_task"
import { plan_mode_respond_variants } from "./plan_mode_respond"
import { read_file_variants } from "./read_file"
import { replace_in_file_variants } from "./replace_in_file"
import { search_files_variants } from "./search_files"
import { use_mcp_tool_variants } from "./use_mcp_tool"
import { use_skill_variants } from "./use_skill" // CARETI MODIFICATION: Skills system
import { web_fetch_variants } from "./web_fetch"
import { web_search_variants } from "./web_search" // CARETI MODIFICATION: SerpAPI web search
import { write_to_file_variants } from "./write_to_file"

/**
 * Registers all tool variants with the ClineToolSet provider.
 * This function must be called at prompt registry
 * to allow all tool sets be available at build time.
 */
export function registerClineToolSets(): void {
	// Collect all variants from all tools
	const allToolVariants = [
		...access_mcp_resource_variants,
		...act_mode_respond_variants,
		...ask_followup_question_variants,
		...attempt_completion_variants,
		...browser_action_variants,
		...execute_command_variants,
		...focus_chain_variants,
		...generate_explanation_variants, // CARETI MODIFICATION: Added for Cline v3.49.1 parity
		...generate_image_variants,
		...analyze_image_variants,
		...read_document_variants,
		...list_code_definition_names_variants,
		...list_files_variants,
		...load_mcp_documentation_variants,
		...new_task_variants,
		...plan_mode_respond_variants,
		...read_file_variants,
		...replace_in_file_variants,
		...search_files_variants,
		...use_mcp_tool_variants,
		...use_skill_variants, // CARETI MODIFICATION: Skills system
		...web_fetch_variants,
		...web_search_variants, // CARETI MODIFICATION: SerpAPI web search
		...write_to_file_variants,
		...apply_patch_variants,
	]

	// Register each variant
	allToolVariants.forEach((v) => {
		ClineToolSet.register(v)
	})
}
