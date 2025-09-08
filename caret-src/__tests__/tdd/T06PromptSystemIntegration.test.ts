import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import { PromptSystemManager } from '../../core/prompts/system/PromptSystemManager';
import { JsonTemplateLoader } from '../../core/prompts/system/JsonTemplateLoader';
import { CaretSystemPromptContext } from '../../core/prompts/system/types';
import { CARET_MODES } from '../../shared/constants/PromptSystemConstants';
import { ModelFamily } from '../../../src/shared/prompts';

describe('T06 - Prompt System Integration Test', () => {

    // Initialize the JsonTemplateLoader before any tests run.
    beforeAll(async () => {
        const sectionsDirPath = path.resolve(__dirname, '../../core/prompts/sections');
        await JsonTemplateLoader.getInstance().initialize(sectionsDirPath);
    });

    describe('CaretJsonAdapter', () => {
        it('should generate a CHATBOT prompt that excludes agent_only tools', async () => {
            const manager = new PromptSystemManager();
            const context: CaretSystemPromptContext & { modeSystem: 'caret' } = {
                modeSystem: 'caret',
                mode: CARET_MODES.CHATBOT,
                providerInfo: { providerId: 'test', model: { id: 'test', info: { supportsPromptCache: false } } },
            };
            const prompt = await manager.getPrompt(context);

            expect(prompt).toContain("You are Caret, a skilled software engineer."); // From BASE_PROMPT_INTRO
            expect(prompt).toContain("CHATBOT/AGENT MODE SYSTEM"); // From CHATBOT_AGENT_MODES
            expect(prompt).not.toContain('"execute_command"'); // Tool restriction
        });

        it('should generate an AGENT prompt that includes agent_only tools', async () => {
            const manager = new PromptSystemManager();
            const context: CaretSystemPromptContext & { modeSystem: 'caret' } = {
                modeSystem: 'caret',
                mode: CARET_MODES.AGENT,
                providerInfo: { providerId: 'test', model: { id: 'test', info: { supportsPromptCache: false } } },
            };
            const prompt = await manager.getPrompt(context);
            
            expect(prompt).toContain("CHATBOT/AGENT MODE SYSTEM"); // From CHATBOT_AGENT_MODES
            expect(prompt).toContain('"execute_command"'); // Tool restriction lifted
        });

        it('should include TODO management content when auto_todo is enabled', async () => {
            const manager = new PromptSystemManager();
            const context: CaretSystemPromptContext & { modeSystem: 'caret' } = {
                modeSystem: 'caret',
                mode: CARET_MODES.AGENT,
                auto_todo: true,
                providerInfo: { providerId: 'test', model: { id: 'test', info: { supportsPromptCache: false } } },
            };
            const prompt = await manager.getPrompt(context);

            expect(prompt).toContain("Task sequence:"); // From CARET_TODO_MANAGEMENT
        });
    });

    describe('ClineLatestAdapter', () => {
        it('should generate a prompt containing core Cline concepts like ACT MODE', async () => {
            const manager = new PromptSystemManager();
            const context = {
                modeSystem: 'cline' as const,
                mode: CARET_MODES.AGENT, // Even if mode is agent, cline adapter should produce its own prompt
                providerInfo: { providerId: 'anthropic', model: { id: 'claude-3-opus-20240229', info: { supportsPromptCache: true, maxTokens: 4096 } } },
                // Add other properties required by the original SystemPromptContext
                cwd: '/mock/cwd',
            };
            const prompt = await manager.getPrompt(context);
            
            // Check for a key phrase from the actual cline-latest prompt.
            // This confirms the dynamic import and prompt generation is working.
            expect(prompt).toContain("ACT MODE V.S. PLAN MODE");
            expect(prompt).not.toContain("Error: Could not load cline-latest's prompt system.");
        });
    });
});
