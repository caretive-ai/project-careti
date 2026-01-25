// CARETI MODIFICATION: Commands system - on-demand agent instructions (Claude Code/OpenCode style)
// Replaces legacy skills system with unified command format

/**
 * Command metadata loaded at startup for discovery.
 * Supports both legacy skill format and new command format.
 *
 * YAML Frontmatter fields (Claude Code/OpenCode style):
 * - description: Command description (required)
 * - argument-hint: Hint for arguments (optional, Claude Code style)
 * - model: Preferred model for this command (optional, OpenCode style)
 * - subtask: Whether this is a subtask (optional, OpenCode style)
 */
export interface CommandMetadata {
	/** Command name (derived from filename or frontmatter) */
	name: string
	/** Command description from frontmatter */
	description: string
	/** Path to the command file */
	path: string
	/** Source: global or project */
	source: "global" | "project"
	/** Argument hint (Claude Code style) */
	argumentHint?: string
	/** Preferred model (OpenCode style) */
	model?: string
	/** Whether this is a subtask (OpenCode style) */
	subtask?: boolean
}

/**
 * Full command content loaded on-demand when command is activated.
 */
export interface CommandContent extends CommandMetadata {
	/** Command instructions (body after frontmatter) */
	instructions: string
}

// Legacy aliases for backward compatibility
/** @deprecated Use CommandMetadata instead */
export type SkillMetadata = CommandMetadata
/** @deprecated Use CommandContent instead */
export type SkillContent = CommandContent
