import { IPromptSystem } from "../IPromptSystem";
import { CaretSystemPromptContext } from "../types";
import type { SystemPromptContext as ClineSystemPromptContext } from "@/core/prompts/system-prompt/types";

export class ClineLatestAdapter implements IPromptSystem {
    /**
     * Dynamically imports and uses cline-latest's PromptRegistry to get the system prompt.
     * @param context The context, which will be passed to cline-latest's PromptRegistry.
     * @returns A promise that resolves to the cline-latest system prompt.
     */
    public async getPrompt(context: CaretSystemPromptContext): Promise<string> {
        try {
            // Dynamically import to avoid static dependency issues in the test environment.
            const { PromptRegistry } = await import("@/core/prompts/system-prompt/registry/PromptRegistry");
            const registry = PromptRegistry.getInstance();
            
            // The Caret context is compatible with the Cline context.
            return await registry.get(context as ClineSystemPromptContext);
        } catch (error) {
            console.error("Error dynamically importing or using PromptRegistry:", error);
            return "Error: Could not load cline-latest's prompt system.";
        }
    }
}
