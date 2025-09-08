import { IPromptSystem } from "../IPromptSystem";
import { JsonTemplateLoader } from "../JsonTemplateLoader";
import { CARET_MODES } from "../../../../shared/constants/PromptSystemConstants";
import { CaretSystemPromptContext } from "../types";
import * as path from "path";

/**
 * Adapter for Caret's JSON-based prompt system.
 * It assembles a system prompt by dynamically selecting and combining
 * JSON sections based on the provided context.
 */
export class CaretJsonAdapter implements IPromptSystem {
    private loader: JsonTemplateLoader;

    constructor() {
        this.loader = JsonTemplateLoader.getInstance();
    }

    /**
     * Assembles a system prompt using JSON templates.
     * @param context The context driving prompt generation.
     * @returns A promise resolving to the complete system prompt string.
     */
    public async getPrompt(context: CaretSystemPromptContext): Promise<string> {
        const isChatbotMode = context.mode === CARET_MODES.CHATBOT;

        const sectionNames = [
            'BASE_PROMPT_INTRO',
            'CHATBOT_AGENT_MODES',
            'TOOL_DEFINITIONS',
            context.auto_todo || context.task_progress ? 'CARET_TODO_MANAGEMENT' : null,
            context.task_progress ? 'CARET_TASK_PROGRESS' : null,
            'CARET_FEEDBACK_SYSTEM',
        ].filter(Boolean) as string[];

        const promptParts: string[] = [];

        for (const name of sectionNames) {
            const template = this.loader.getTemplate<any>(name);
            if (!template) {
                console.warn(`[CaretJsonAdapter] Template not found: ${name}`);
                continue;
            }

            if (name === 'TOOL_DEFINITIONS') {
                promptParts.push(this.getToolsSection(template, isChatbotMode));
            } else {
                promptParts.push(this.getDynamicSection(template, isChatbotMode));
            }
        }

        return promptParts.filter(Boolean).join('\n\n');
    }

    /**
     * Processes and formats the tools section, applying mode restrictions.
     */
    private getToolsSection(template: any, isChatbotMode: boolean): string {
        let tools = { ...template.tools };
        if (isChatbotMode) {
            tools = Object.entries(tools).reduce((acc, [key, value]: [string, any]) => {
                if (value.mode_restriction !== 'agent_only') {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);
        }
        
        return JSON.stringify(tools, null, 2);
    }

    /**
     * Gets content from a section based on its structure and the current mode.
     */
    private getDynamicSection(template: any, isChatbotMode: boolean): string {
        if (template.add?.sections) {
            return template.add.sections.map((s: any) => s.content).join('\n\n');
        }
        if (isChatbotMode && template.chatbot) {
            return template.chatbot.template || template.chatbot.style || template.chatbot.request;
        }
        if (!isChatbotMode && template.agent) {
            return template.agent.template || template.agent.style || template.agent.request;
        }
        return template.content || '';
    }
}
