import { IPromptSystem } from "../IPromptSystem";
import { JsonTemplateLoader } from "../JsonTemplateLoader";
import { CARET_MODES } from "../../../../shared/constants/PromptSystemConstants";
import { CaretSystemPromptContext } from "../types";
import { PromptBuilder } from "../../../../../src/core/prompts/system-prompt/registry/PromptBuilder";
import { PromptRegistry } from "../../../../../src/core/prompts/system-prompt/registry/PromptRegistry";
import { getModelFamily } from "../../../../../src/core/prompts/system-prompt";
import { ModelFamily } from "../../../../../src/shared/prompts";
import { ClineDefaultTool } from "../../../../../src/shared/tools";
import { ClineToolSet } from "../../../../../src/core/prompts/system-prompt/registry/ClineToolSet";
import { Logger } from "../../../../../src/services/logging/Logger";
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
        
        // CARET MODIFICATION: Add debug logging for mode verification
        Logger.debug(`[CaretJsonAdapter] 🎯 Mode: ${context.mode}, isChatbotMode: ${isChatbotMode}`);

        const sectionNames = [
            'BASE_PROMPT_INTRO',
            'CHATBOT_AGENT_MODES',
            'CARET_SYSTEM_INFO',
            'CARET_CAPABILITIES', 
            'CARET_USER_INSTRUCTIONS',
            // CARET_TOOL_SYSTEM removed - replaced with Cline original tool system (inserted after CARET_USER_INSTRUCTIONS)
            'CARET_FILE_EDITING',
            'CARET_BEHAVIOR_RULES',
            'CARET_TASK_OBJECTIVE',
            'CARET_ACTION_STRATEGY',
            context.auto_todo || context.task_progress ? 'CARET_TODO_MANAGEMENT' : null,
            context.task_progress ? 'CARET_TASK_PROGRESS' : null,
            'CARET_FEEDBACK_SYSTEM',
            context.mcpHub?.getServers()?.length ? 'CARET_MCP_INTEGRATION' : null,
        ].filter(Boolean) as string[];

        Logger.debug(`[CaretJsonAdapter] 📋 Selected sections: ${JSON.stringify(sectionNames)}`);

        const promptParts: string[] = [];

        Logger.debug(`[CaretJsonAdapter] 🔧 Starting prompt generation...`);

        // Process JSON sections first
        for (const name of sectionNames) {
            const template = this.loader.getTemplate<any>(name);
            if (!template) {
                Logger.debug(`[CaretJsonAdapter] ❌ Template not found: ${name}`);
                continue;
            }
            
            const sectionContent = this.getDynamicSection(template, isChatbotMode, context);
            if (sectionContent.trim()) {
                promptParts.push(sectionContent);
                Logger.debug(`[CaretJsonAdapter] ✅ ${name}: loaded (${sectionContent.length} chars)`);
            } else {
                Logger.debug(`[CaretJsonAdapter] ⚠️ ${name}: empty content`);
            }
            
            // Insert Cline tools section after CARET_USER_INSTRUCTIONS
            if (name === 'CARET_USER_INSTRUCTIONS') {
                Logger.debug(`[CaretJsonAdapter] 🎯 About to insert Cline tools after ${name}`);
                const clineToolsSection = await this.getClineToolsSection(context, isChatbotMode);
                if (clineToolsSection) {
                    promptParts.push(clineToolsSection);
                    Logger.debug(`[CaretJsonAdapter] ✅ Cline tools section inserted after ${name} (${clineToolsSection.length} chars)`);
                } else {
                    Logger.debug(`[CaretJsonAdapter] ❌ Failed to generate Cline tools section`);
                }
            }
        }
        
        // If tools weren't added yet (no CARET_USER_INSTRUCTIONS), add them now
        Logger.debug(`[CaretJsonAdapter] 🔍 Checking if tools were added...`);
        const hasToolsSection = promptParts.some(p => p.includes('# TOOL USAGE SYSTEM'));
        Logger.debug(`[CaretJsonAdapter] Tools section exists: ${hasToolsSection}`);
        
        if (!hasToolsSection) {
            Logger.debug(`[CaretJsonAdapter] 🎯 Adding Cline tools at end as backup`);
            const clineToolsSection = await this.getClineToolsSection(context, isChatbotMode);
            if (clineToolsSection) {
                promptParts.push(clineToolsSection);
                Logger.debug(`[CaretJsonAdapter] ✅ Cline tools section added at end (${clineToolsSection.length} chars)`);
            } else {
                Logger.debug(`[CaretJsonAdapter] ❌ Backup tools section also failed!`);
            }
        }

        const finalPrompt = promptParts.filter(Boolean).join('\n\n');
        Logger.debug(`[CaretJsonAdapter] 🎉 Final prompt generated: ${finalPrompt.length} characters, ${promptParts.length} sections`);
        
        return finalPrompt;
    }

    /**
     * Gets Cline's original tool system with Caret mode restrictions applied.
     * This replaces the inadequate CARET_TOOL_SYSTEM.json with full Cline tool functionality.
     */
    private async getClineToolsSection(context: CaretSystemPromptContext, isChatbotMode: boolean): Promise<string | null> {
        try {
            // CARET MODIFICATION: Fixed cline-latest compatibility
            
            // CRITICAL: Ensure PromptRegistry is loaded first to register all tools
            const registry = PromptRegistry.getInstance();
            await registry.load();
            
            // FIXED: Use minimal mockVariant with tools: undefined 
            // This triggers Cline's automatic tool loading (ClineToolSet.getTools())
            const mockVariant = {
                id: 'caret-tools',
                version: 1,
                tags: [] as readonly string[],
                labels: {} as Readonly<Record<string, number>>,
                // CARET MODIFICATION: Force GENERIC family to ensure all tools are loaded
                // next-gen and other new families don't have tools registered yet
                family: ModelFamily.GENERIC,
                description: 'Caret tools integration',
                config: { tools: [] } as any,
                baseTemplate: '',
                componentOrder: [] as readonly any[],
                componentOverrides: {} as any,
                placeholders: {} as Readonly<Record<string, string>>,
                // FIXED: tools: [] for cline-latest compatibility - triggers automatic loading of all tools for family
                tools: [] as readonly ClineDefaultTool[],
                toolOverrides: undefined
            } as const;

            Logger.debug(`[DEBUG CaretJsonAdapter] Using mockVariant with automatic tool loading: family=${mockVariant.family}, tools=${JSON.stringify(mockVariant.tools)}`);
            
            const toolPrompts = await PromptBuilder.getToolsPrompts(mockVariant, context);
            
            Logger.debug(`[DEBUG CaretJsonAdapter] PromptBuilder returned: toolPrompts=${toolPrompts ? toolPrompts.length : 'null/undefined'}, firstTool=${toolPrompts?.[0]?.substring(0, 100) + '...'}`);
            
            if (!toolPrompts || toolPrompts.length === 0) {
                Logger.debug(`[CaretJsonAdapter] ❌ No tools available from Cline system - investigating...`);
                Logger.debug(`[DEBUG CaretJsonAdapter] Context details: contextKeys=${JSON.stringify(Object.keys(context))}, providerInfo=${context.providerInfo?.providerId}, model=${context.providerInfo?.model}`);
                
                // Additional debugging: Check ClineToolSet directly
                try {
                    const directTools = ClineToolSet.getTools(mockVariant.family);
                    Logger.debug(`[DEBUG CaretJsonAdapter] Direct ClineToolSet.getTools returned: toolsCount=${directTools.length}, toolIds=${JSON.stringify(directTools.map(t => t.config.id))}, family=${mockVariant.family}`);
                    
                    // Check if browser_action specifically is available
                    const browserTool = ClineToolSet.getToolByName('browser_action', mockVariant.family);
                    Logger.debug(`[DEBUG CaretJsonAdapter] Browser tool lookup: found=${!!browserTool}, toolId=${browserTool?.config.id}, toolName=${browserTool?.config.name}`);
                } catch (error) {
                    Logger.debug(`[DEBUG CaretJsonAdapter] ClineToolSet direct access error: ${error}`);
                }
                
                // CARET MODIFICATION: Provide fallback tool information when Cline tools are unavailable
                return this.getFallbackToolsSection(isChatbotMode);
            }

            let toolsContent = '# TOOL USAGE SYSTEM\n\n';
            
            // Add Caret-specific mode restrictions info
            if (isChatbotMode) {
                toolsContent += '**CURRENT MODE: CHATBOT** - Limited tool access for conversational assistance\n\n';
                toolsContent += 'Available tools in CHATBOT mode:\n';
                toolsContent += '- read_file: Read file contents\n';
                toolsContent += '- list_files: List directory contents\n';
                toolsContent += '- search_files: Search for files and content\n';
                toolsContent += '- ask_followup_question: Ask clarifying questions\n';
                toolsContent += '- web_fetch: Fetch web content for research\n';
                toolsContent += '\n**RESTRICTED in CHATBOT mode:** file editing, command execution, browser automation\n\n';
            } else {
                toolsContent += '**CURRENT MODE: AGENT** - Full autonomous tool access\n\n';
                toolsContent += 'All tools available in AGENT mode for autonomous task execution.\n\n';
            }
            
            // CARET MODIFICATION: Enhanced tool filtering with detailed logging
            let filteredTools = toolPrompts;
            if (isChatbotMode) {
                // In CHATBOT mode, restrict to read-only and research tools
                const allowedInChatbot = [
                    'read_file', 'list_files', 'search_files', 'list_code_definition_names',
                    'ask_followup_question', 'web_fetch', 'attempt_completion'
                ];
                filteredTools = toolPrompts.filter((toolPrompt: string) => {
                    const toolMatch = allowedInChatbot.some(allowed => toolPrompt.includes(`## ${allowed}`));
                    return toolMatch;
                });
            }
            
            toolsContent += filteredTools.join('\n\n');
            
            console.log(`[CaretJsonAdapter] ✅ Generated Cline tools section: ${filteredTools.length}/${toolPrompts.length} tools (${toolsContent.length} chars)`);
            return toolsContent;
            
        } catch (error) {
            console.error(`[CaretJsonAdapter] ❌ Error generating Cline tools section:`, error);
            return null;
        }
    }

    /**
     * Processes and formats the tools section, applying mode restrictions.
     * @deprecated - This is for legacy TOOL_DEFINITIONS.json support only
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
    private getDynamicSection(template: any, isChatbotMode: boolean, context?: CaretSystemPromptContext): string {
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
            // DEPRECATED: CARET_TOOL_SYSTEM.json is no longer used - Cline original tools used instead
            console.warn(`[CaretJsonAdapter] ⚠️ DEPRECATED: tool_system template found - using Cline original instead`);
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
        return this.substituteTemplateVars(content, isChatbotMode, context);
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
    private substituteTemplateVars(content: string, isChatbotMode: boolean, context?: CaretSystemPromptContext): string {
        const currentMode = isChatbotMode ? 'CHATBOT' : 'AGENT';
        const modeSystem = isChatbotMode ? 'chatbot' : 'agent';
        const modeDescription = isChatbotMode 
            ? 'conversational assistance and planning'
            : 'autonomous task execution';
        const modeCapabilities = isChatbotMode
            ? 'Focused on analysis, guidance, and planning without file modifications'
            : 'Full autonomous capabilities with complete tool access';
        
        console.log(`[CaretJsonAdapter] 🔧 Template substitution: isChatbotMode=${isChatbotMode}, currentMode=${currentMode}`);
        
        const result = content
            .replace(/\{\{current_mode\}\}/g, currentMode)
            .replace(/\{\{mode_system\}\}/g, modeSystem)
            .replace(/\{\{mode_description\}\}/g, modeDescription)
            .replace(/\{\{mode_capabilities\}\}/g, modeCapabilities)
            .replace(/\{\{working_dir\}\}/g, process.cwd())
            .replace(/\{\{os\}\}/g, process.platform)
            .replace(/\{\{shell\}\}/g, process.env.SHELL || '/bin/bash')
            .replace(/\{\{home_dir\}\}/g, process.env.HOME || process.env.USERPROFILE || '~')
            .replace(/\{\{custom_instructions\}\}/g, this.getCustomInstructions(context))
            .replace(/\{\{mcp_servers_list\}\}/g, 'No MCP servers currently connected');
            
        if (content.includes('{{current_mode}}')) {
            console.log(`[CaretJsonAdapter] ✅ Template substitution completed: {{current_mode}} → ${currentMode}`);
        }
        
        return result;
    }

    /**
     * Build custom instructions from various sources (same logic as Cline's user_instructions.ts)
     */
    private getCustomInstructions(context?: CaretSystemPromptContext): string {
        if (!context) {
            return 'None provided';
        }

        const customInstructions: string[] = [];
        
        // CARET MODIFICATION: Enhanced language support - prioritize preferredLanguageInstructions
        if ((context as any).preferredLanguageInstructions) {
            customInstructions.push((context as any).preferredLanguageInstructions);
            console.log(`[CaretJsonAdapter] 🌐 Language instruction added: ${(context as any).preferredLanguageInstructions}`);
        }

        if ((context as any).globalClineRulesFileInstructions) {
            customInstructions.push((context as any).globalClineRulesFileInstructions);
        }

        if ((context as any).localClineRulesFileInstructions) {
            customInstructions.push((context as any).localClineRulesFileInstructions);
        }

        if ((context as any).localCursorRulesFileInstructions) {
            customInstructions.push((context as any).localCursorRulesFileInstructions);
        }

        if ((context as any).localCursorRulesDirInstructions) {
            customInstructions.push((context as any).localCursorRulesDirInstructions);
        }

        if ((context as any).localWindsurfRulesFileInstructions) {
            customInstructions.push((context as any).localWindsurfRulesFileInstructions);
        }

        if ((context as any).clineIgnoreInstructions) {
            customInstructions.push((context as any).clineIgnoreInstructions);
        }

        if (customInstructions.length === 0) {
            return 'None provided';
        }

        const result = customInstructions.join('\n\n');
        console.log(`[CaretJsonAdapter] 📋 Custom instructions built: ${customInstructions.length} sections, ${result.length} chars`);
        return result;
    }

    /**
     * Fallback tool section when Cline tools system is unavailable.
     * Provides basic tool information to ensure prompt generation continues.
     */
    private getFallbackToolsSection(isChatbotMode: boolean): string {
        console.log(`[CaretJsonAdapter] 🔧 Using fallback tool section for mode: ${isChatbotMode ? 'CHATBOT' : 'AGENT'}`);
        
        let toolsContent = '# TOOL USAGE SYSTEM\n\n';
        
        if (isChatbotMode) {
            toolsContent += '**CURRENT MODE: CHATBOT** - Limited tool access for conversational assistance\n\n';
            toolsContent += 'Available tools in CHATBOT mode:\n';
            toolsContent += '- read_file: Read and analyze file contents\n';
            toolsContent += '- list_files: List directory contents and explore file structures\n';
            toolsContent += '- search_files: Search for files and content across the workspace\n';
            toolsContent += '- ask_followup_question: Ask clarifying questions to better understand requirements\n';
            toolsContent += '- web_fetch: Fetch web content for research and information gathering\n';
            toolsContent += '- attempt_completion: Complete tasks when objectives are met\n\n';
            toolsContent += '**RESTRICTED in CHATBOT mode:** File editing, command execution, browser automation are disabled for safety.\n\n';
            toolsContent += 'Focus on understanding, analysis, and providing helpful guidance without making changes.\n';
        } else {
            toolsContent += '**CURRENT MODE: AGENT** - Full autonomous tool access\n\n';
            toolsContent += 'Available tools in AGENT mode:\n';
            toolsContent += '- File Operations: read_file, write_to_file, replace_in_file\n';
            toolsContent += '- Directory Navigation: list_files, search_files, list_code_definition_names\n';
            toolsContent += '- Command Execution: execute_command (for terminal commands)\n';
            toolsContent += '- Web Research: web_fetch\n';
            toolsContent += '- Browser Automation: browser_action (for web interactions)\n';
            toolsContent += '- Communication: ask_followup_question, attempt_completion\n';
            toolsContent += '- MCP Tools: use_mcp_tool, access_mcp_resource\n\n';
            toolsContent += 'Use tools autonomously to complete tasks efficiently and effectively.\n';
        }
        
        toolsContent += '\n**IMPORTANT:** Always verify tool availability before use and handle errors gracefully.\n';
        
        return toolsContent;
    }
}
