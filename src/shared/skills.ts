// CARETI MODIFICATION: Skills system support - on-demand agent instructions
// Ported from Cline v3.49.1

/**
 * Skill metadata loaded at startup for discovery.
 * Only name and description are parsed from frontmatter initially.
 */
export interface SkillMetadata {
	name: string
	description: string
	path: string
	source: "global" | "project"
}

/**
 * Full skill content loaded on-demand when skill is activated.
 */
export interface SkillContent extends SkillMetadata {
	instructions: string
}
