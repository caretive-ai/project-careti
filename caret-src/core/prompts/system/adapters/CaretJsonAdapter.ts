import { IPromptSystem } from "../IPromptSystem";
import { JsonTemplateLoader } from "../JsonTemplateLoader";
import { CARET_MODES } from "@caret/shared/constants/PromptSystemConstants";

// A simplified context type for this adapter's purpose
type CaretContext = {
    mode: 'chatbot' | 'agent';
    [key: string]: any;
};

export class CaretJsonAdapter implements IPromptSystem {
    private loader: JsonTemplateLoader;

    constructor() {
        this.loader = new JsonTemplateLoader();
    }

    /**
     * Assembles a system prompt for Caret's modes (chatbot/agent) using JSON sections.
     * @param context The context containing the current mode.
     * @returns A promise that resolves to the complete system prompt.
     */
    public async getPrompt(context: CaretContext): Promise<string> {
        const isChatbotMode = context.mode === CARET_MODES.CHATBOT;

        // 1. Load all relevant sections
        const baseIntro = await this.loader.loadSection('BASE_PROMPT_INTRO.json');
        const modes = await this.loader.loadSection('CHATBOT_AGENT_MODES.json');
        const tools = await this.loader.loadSection('TOOL_DEFINITIONS.json');
        const todo = await this.loader.loadSection('CARET_TODO_MANAGEMENT.json');
        const progress = await this.loader.loadSection('CARET_TASK_PROGRESS.json');
        const feedback = await this.loader.loadSection('CARET_FEEDBACK_SYSTEM.json');

        // 2. Filter tools based on mode_restriction for chatbot mode
        if (isChatbotMode && tools.tools) {
            tools.tools = Object.entries(tools.tools).reduce((acc, [key, value]: [string, any]) => {
                if (value.mode_restriction !== 'agent_only') {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);
        }

        // 3. Assemble the prompt string (simplified for now)
        const promptParts = [
            baseIntro.add.sections[0].content,
            modes.add.sections[0].content,
            `Current Mode: ${context.mode.toUpperCase()}`,
            isChatbotMode ? todo.chatbot.template : todo.agent.template,
            isChatbotMode ? progress.chatbot.style : progress.agent.style,
            isChatbotMode ? feedback.chatbot.request : feedback.agent.request,
            "# Available Tools",
            JSON.stringify(tools.tools, null, 2)
        ];

        return promptParts.join('\n\n');
    }
}
