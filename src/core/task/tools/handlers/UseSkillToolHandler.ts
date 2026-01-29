// CARETI MODIFICATION: Skills system - on-demand agent instructions handler
// Ported from Cline v3.49.1 with Claude Code compatible preprocessing and fork execution

import type { ToolUse } from "@core/assistant-message"
import { discoverSkills, getAvailableSkills, getSkillContent } from "@core/context/instructions/user-instructions/skills"
import { hasPreprocessingDirectives, preprocessShellCommands } from "@core/context/instructions/user-instructions/preprocessing"
import { executeSkillInFork, shouldForkSkill } from "@core/task/agents/SkillForkExecutor"
import type { SkillMetadata } from "@shared/skills"
import { ClineDefaultTool } from "@shared/tools"
import type { ToolResponse } from "../../index"
import type { IPartialBlockHandler, IToolHandler } from "../ToolExecutorCoordinator"
import type { TaskConfig } from "../types/TaskConfig"
import type { StronglyTypedUIHelpers } from "../types/UIHelpers"

export class UseSkillToolHandler implements IToolHandler, IPartialBlockHandler {
	readonly name = ClineDefaultTool.USE_SKILL

	constructor() {}

	getDescription(block: ToolUse): string {
		const skillName = block.params.skill_name
		return skillName ? `[${block.name} for "${skillName}"]` : `[${block.name}]`
	}

	async handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void> {
		const skillName = block.params.skill_name
		const message = JSON.stringify({ tool: "useSkill", path: skillName || "" })
		await uiHelpers.say("tool", message, undefined, undefined, true)
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		const skillName: string | undefined = block.params.skill_name

		if (!skillName) {
			config.taskState.consecutiveMistakeCount++
			return `Error: Missing required parameter 'skill_name'. Please provide the name of the skill to activate.`
		}

		// Discover skills on-demand (lazy loading)
		const allSkills = await discoverSkills(config.cwd)
		const resolvedSkills = getAvailableSkills(allSkills)

		// Filter by toggle state
		// CARETI MODIFICATION: source "global" renamed to "personal" for Claude Code compatibility
		const stateManager = config.services.stateManager
		const personalSkillsToggles = (stateManager.getGlobalSettingsKey("globalSkillsToggles") as Record<string, boolean>) ?? {}
		const localSkillsToggles = (stateManager.getWorkspaceStateKey("localSkillsToggles") as Record<string, boolean>) ?? {}
		const availableSkills = resolvedSkills.filter((skill) => {
			const toggles = skill.source === "personal" ? personalSkillsToggles : localSkillsToggles
			return toggles[skill.path] !== false
		})

		if (availableSkills.length === 0) {
			return `Error: No skills are available. Skills may be disabled or not configured.`
		}

		// Show tool message
		const message = JSON.stringify({ tool: "useSkill", path: skillName })
		await config.callbacks.say("tool", message, undefined, undefined, false)

		config.taskState.consecutiveMistakeCount = 0

		try {
			const skillContent = await getSkillContent(skillName, availableSkills)

			if (!skillContent) {
				const availableNames = availableSkills.map((s: SkillMetadata) => s.name).join(", ")
				return `Error: Skill "${skillName}" not found. Available skills: ${availableNames || "none"}`
			}

			// CARETI MODIFICATION: Handle context: fork mode
			if (shouldForkSkill(skillContent)) {
				// Get user prompt from block params or use default
				const userPrompt = block.params.prompt || "Execute the skill"

				const forkResult = await executeSkillInFork({
					cwd: config.cwd,
					agentType: skillContent.agent,
					skillContent,
					userPrompt,
				})

				if (forkResult.success) {
					return `# Skill "${skillContent.name}" executed in isolated context

## Result
${forkResult.output}

---
The skill has completed execution in a forked context. The results above are from the isolated execution.`
				} else {
					return `Error executing skill "${skillContent.name}" in fork mode: ${forkResult.error}

Output: ${forkResult.output || "(none)"}`
				}
			}

			// CARETI MODIFICATION: Set activeSkill for allowed-tools constraint (inline mode only)
			config.taskState.activeSkill = {
				name: skillContent.name,
				allowedTools: skillContent.allowedTools,
			}

			// CARETI MODIFICATION: Preprocess !`command` syntax in skill instructions
			let processedInstructions = skillContent.instructions
			if (hasPreprocessingDirectives(processedInstructions)) {
				processedInstructions = await preprocessShellCommands(processedInstructions, config.cwd)
			}

			// Build response with tool restriction notice if applicable
			let response = `# Skill "${skillContent.name}" is now active

${processedInstructions}

---
IMPORTANT: The skill is now loaded. Do NOT call use_skill again for this task. Simply follow the instructions above to complete the user's request. You may access other files in the skill directory at: ${skillContent.path.replace(/SKILL\.md$/, "")}`

			// CARETI MODIFICATION: Notify about tool restrictions
			if (skillContent.allowedTools && skillContent.allowedTools.length > 0) {
				response += `

NOTE: This skill restricts you to the following tools only: ${skillContent.allowedTools.join(", ")}`
			}

			return response
		} catch (error) {
			return `Error loading skill "${skillName}": ${(error as Error)?.message}`
		}
	}
}
