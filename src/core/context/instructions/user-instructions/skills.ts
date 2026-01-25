// CARETI MODIFICATION: Legacy skills module - re-exports from commands
// @deprecated Use commands.ts instead

export {
	discoverCommands as discoverSkills,
	getAvailableCommands as getAvailableSkills,
	getCommandContent as getSkillContent,
} from "./commands"

// Re-export types for backward compatibility
export type { CommandMetadata as SkillMetadata, CommandContent as SkillContent } from "@shared/commands"
