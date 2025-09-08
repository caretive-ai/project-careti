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
            'CARET_SYSTEM_INFO',
            'CARET_CAPABILITIES', 
            'CARET_USER_INSTRUCTIONS',
            'CARET_TOOL_SYSTEM',  // Use new comprehensive tool system instead of TOOL_DEFINITIONS
            'CARET_FILE_EDITING',
            'CARET_BEHAVIOR_RULES',
            'CARET_TASK_OBJECTIVE',
            'CARET_ACTION_STRATEGY',
            context.auto_todo || context.task_progress ? 'CARET_TODO_MANAGEMENT' : null,
            context.task_progress ? 'CARET_TASK_PROGRESS' : null,
            'CARET_FEEDBACK_SYSTEM',
            context.mcpHub?.getServers()?.length ? 'CARET_MCP_INTEGRATION' : null,
        ].filter(Boolean) as string[];

        const promptParts: string[] = [];

        for (const name of sectionNames) {
            const template = this.loader.getTemplate<any>(name);
            if (!template) {
                console.warn(`[CaretJsonAdapter] Template not found: ${name}`);
                continue;
            }

            if (name === 'CARET_TOOL_SYSTEM') {
                // New comprehensive tool system format - already includes mode restrictions in content
                promptParts.push(this.getDynamicSection(template, isChatbotMode));
            } else if (name === 'TOOL_DEFINITIONS') {
                // Legacy format support (if still present)  
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
     * Supports template variable substitution for dynamic content.
     */
    private getDynamicSection(template: any, isChatbotMode: boolean): string {
        let content = '';
        
        // Handle new comprehensive JSON structure
        if (template.system_context?.sections) {
            content = this.processTemplateSections(template.system_context.sections, isChatbotMode);
        } else if (template.capabilities?.sections) {
            content = this.processTemplateSections(template.capabilities.sections, isChatbotMode);
        } else if (template.file_editing?.sections) {
            content = this.processTemplateSections(template.file_editing.sections, isChatbotMode);
        } else if (template.user_instructions?.sections) {
            content = this.processTemplateSections(template.user_instructions.sections, isChatbotMode);
        } else if (template.task_objective?.sections) {
            content = this.processTemplateSections(template.task_objective.sections, isChatbotMode);
        } else if (template.behavior_rules?.sections) {
            content = this.processTemplateSections(template.behavior_rules.sections, isChatbotMode);
        } else if (template.action_strategy?.sections) {
            content = this.processTemplateSections(template.action_strategy.sections, isChatbotMode);
        } else if (template.tool_system?.sections) {
            content = this.processTemplateSections(template.tool_system.sections, isChatbotMode);
        } else if (template.mcp_integration?.sections) {
            content = this.processTemplateSections(template.mcp_integration.sections, isChatbotMode);
        }
        // Legacy format support
        else if (template.add?.sections) {
            content = template.add.sections.map((s: any) => s.content).join('\n\n');
        }
        // Mode-specific content
        else if (isChatbotMode && template.chatbot) {
            content = template.chatbot.template || template.chatbot.style || template.chatbot.request;
        } else if (!isChatbotMode && template.agent) {
            content = template.agent.template || template.agent.style || template.agent.request;
        } else {
            content = template.content || '';
        }
        
        // Apply template variable substitution
        return this.substituteTemplateVars(content, isChatbotMode);
    }

    /**
     * Processes template sections with mode filtering.
     */
    private processTemplateSections(sections: any[], isChatbotMode: boolean): string {
        return sections
            .filter(section => {
                const mode = section.mode;
                if (!mode || mode === 'both') return true;
                return isChatbotMode ? mode === 'chatbot' : mode === 'agent';
            })
            .map(section => section.content)
            .join('\n\n');
    }

    /**
     * Substitutes template variables with appropriate values.
     */
    private substituteTemplateVars(content: string, isChatbotMode: boolean): string {
        const currentMode = isChatbotMode ? 'CHATBOT' : 'AGENT';
        const modeSystem = isChatbotMode ? 'chatbot' : 'agent';
        const modeDescription = isChatbotMode 
            ? 'conversational assistance and planning'
            : 'autonomous task execution';
        const modeCapabilities = isChatbotMode
            ? 'Focused on analysis, guidance, and planning without file modifications'
            : 'Full autonomous capabilities with complete tool access';
        
        return content
            .replace(/\{\{mode_system\}\}/g, modeSystem)
            .replace(/\{\{mode_description\}\}/g, modeDescription)
            .replace(/\{\{mode_capabilities\}\}/g, modeCapabilities)
            .replace(/\{\{working_dir\}\}/g, process.cwd())
            .replace(/\{\{os\}\}/g, process.platform)
            .replace(/\{\{shell\}\}/g, process.env.SHELL || '/bin/bash')
            .replace(/\{\{home_dir\}\}/g, process.env.HOME || process.env.USERPROFILE || '~')
            .replace(/\{\{custom_instructions\}\}/g, 'None provided')
            .replace(/\{\{mcp_servers_list\}\}/g, 'No MCP servers currently connected');
    }
}
