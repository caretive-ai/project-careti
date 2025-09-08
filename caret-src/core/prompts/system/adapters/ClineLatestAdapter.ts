import { IPromptSystem } from "../IPromptSystem";

import type { SystemPromptContext } from '../../../../../cline-latest/src/core/prompts/system-prompt/types';

export class ClineLatestAdapter implements IPromptSystem {
    /**
     * Dynamically imports and uses cline-latest's PromptRegistry to get the system prompt.
     * @param context The context required by cline-latest's PromptRegistry.
     * @returns A promise that resolves to the cline-latest system prompt.
     */
    public async getPrompt(context: SystemPromptContext): Promise<string> {
        try {
            // Dynamically import to avoid static dependency issues
            const { PromptRegistry } = await import('../../../../../cline-latest/src/core/prompts/system-prompt/registry/PromptRegistry');
            const registry = PromptRegistry.getInstance();
            // Note: The context object needs to match what the original get() method expects.
            // This might require mapping/transformation in a real scenario.
            return await registry.get(context);
        } catch (error) {
            console.error("Error dynamically importing or using PromptRegistry:", error);
            return "Error: Could not load cline-latest's prompt system.";
        }
    }
}
