import { SystemPromptContext as ClineSystemPromptContext } from "@/core/prompts/system-prompt/types";
import { CARET_MODES } from "../../../shared/constants/PromptSystemConstants";

/**
 * Extends the base SystemPromptContext with Caret-specific properties.
 */
export interface CaretSystemPromptContext extends ClineSystemPromptContext {
    modeSystem: "caret"; // Always "caret" for Caret system
    mode: typeof CARET_MODES.CHATBOT | typeof CARET_MODES.AGENT;
    auto_todo?: boolean;
    task_progress?: string;
}
