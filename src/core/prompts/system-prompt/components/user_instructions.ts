// CARETI MODIFICATION: 이중 디렉토리 아키텍처 (Dual-directory Architecture) 지원
// .agents/ - AI용 (시스템 컨텍스트, 영어, 토큰 최적화)
// .users/ - 사람용 (사용자 컨텍스트, 네이티브 언어, 상세 설명)
import { ContextSeparator } from "@core/context/context-separator"
import { getAgentsStandardStatus } from "@core/context/instructions/user-instructions/agents-init"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const USER_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT = `USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

{{CUSTOM_INSTRUCTIONS}}`

// CARETI MODIFICATION: 이중 디렉토리 아키텍처 사상 (Dual-directory Architecture Philosophy)
const CONTEXT_STRUCTURE_PHILOSOPHY = `# Context Structure Philosophy (Dual-directory Architecture)

This project uses a dual-directory architecture for context management:

## Directory Structure
- \`.agents/\` - AI-optimized context (system rules, English, token-efficient)
  - \`context/\` - System rules in JSON/YAML format
  - \`workflows/\` - Task workflows and protocols
    - \`atoms/\` - Reusable small protocols (building blocks)
  - \`skills/\` - AI skills and capabilities
  - \`hooks/\` - Event hooks and triggers
- \`.users/\` - Human-readable context (native language, detailed explanations)
  - \`context/\` - Project context in Markdown format
  - \`workflows/\` - Human-readable workflow guides
    - \`atoms/\` - Human-readable atom descriptions
  - \`skills/\` - Human-readable skill guides
  - \`hooks/\` - Human-readable hook documentation
- \`AGENTS.md\` - Entry point for AI, contains project overview

## Key Principles
1. **1:1 Mirroring**: .users/ structure mirrors .agents/ exactly
2. **Language Optimization**: .agents/ uses English for token efficiency, .users/ uses team's native language
3. **Workflows vs Atoms**: Workflows are complete task flows, atoms are reusable building blocks
4. **AI reads .agents/, humans read .users/**: Clear separation of concerns

When creating or modifying context files, follow this architecture.`

export async function getUserInstructions(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	// CARETI MODIFICATION: Only include .agents/context + AGENTS.md instructions.
	const customInstructions = buildUserInstructions(
		context.globalClineRulesFileInstructions,
		context.localClineRulesFileInstructions,
		context.localAgentsRulesFileInstructions,
		context.clineIgnoreInstructions,
		context.preferredLanguageInstructions,
	)

	// CARETI MODIFICATION: M02 - Add separated user context from .users/context/ (or legacy .agents/context-for-user/)
	const userContext = await ContextSeparator.loadUserContext(context.cwd || process.cwd())

	const agentsInitNotice = await buildAgentsInitNotice(context)

	// CARETI MODIFICATION: Add context structure philosophy for AI understanding
	let combinedInstructions = [CONTEXT_STRUCTURE_PHILOSOPHY, customInstructions, agentsInitNotice].filter(Boolean).join("\n\n")

	// Add user context section if exists
	if (userContext) {
		combinedInstructions += `\n\n# User Context (from .users/context/)\n\n${userContext}`
	}

	if (!combinedInstructions) {
		return undefined
	}

	const template =
		variant.componentOverrides?.[SystemPromptSection.USER_INSTRUCTIONS]?.template || USER_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT

	return new TemplateEngine().resolve(template, context, {
		CUSTOM_INSTRUCTIONS: combinedInstructions,
	})
}

function buildUserInstructions(
	globalClineRulesFileInstructions?: string,
	localClineRulesFileInstructions?: string,
	localAgentsRulesFileInstructions?: string,
	clineIgnoreInstructions?: string,
	preferredLanguageInstructions?: string,
): string | undefined {
	const customInstructions = []
	if (preferredLanguageInstructions) {
		customInstructions.push(preferredLanguageInstructions)
	}
	if (globalClineRulesFileInstructions) {
		customInstructions.push(globalClineRulesFileInstructions)
	}
	if (localClineRulesFileInstructions) {
		customInstructions.push(localClineRulesFileInstructions)
	}
	if (localAgentsRulesFileInstructions) {
		customInstructions.push(localAgentsRulesFileInstructions)
	}
	if (clineIgnoreInstructions) {
		customInstructions.push(clineIgnoreInstructions)
	}
	if (customInstructions.length === 0) {
		return undefined
	}
	return customInstructions.join("\n\n")
}

async function buildAgentsInitNotice(context: SystemPromptContext): Promise<string | undefined> {
	// CARETI MODIFICATION: Only show init notice when workspace folder is actually open
	if (context.modeSystem !== "careti" || !context.cwd || !context.hasOpenWorkspace) {
		return undefined
	}

	const status = await getAgentsStandardStatus(context.cwd)
	if (status.isStandard || status.missing.length === 0) {
		return undefined
	}

	const missingItems = status.missing.map((item) => `- ${item}`).join("\n")

	return [
		"# AGENTS 표준 초기화 안내",
		"현재 작업공간에서 표준 구조가 누락되었습니다:",
		missingItems,
		"사용자에게 표준 스캐폴드 적용 여부를 먼저 확인하세요.",
		"동의하면 `/init`을 실행해 assets 템플릿을 복사하고, 프로젝트 컨텍스트를 채웁니다.",
		"기존 파일은 덮어쓰지 않습니다.",
	].join("\n")
}
