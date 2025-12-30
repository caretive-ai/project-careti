import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"
import { getAgentsStandardStatus } from "@core/context/instructions/user-instructions/agents-init"

const USER_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT = `USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

{{CUSTOM_INSTRUCTIONS}}`

export async function getUserInstructions(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	// CARET MODIFICATION: Only include .agents/context + AGENTS.md instructions.
	const customInstructions = buildUserInstructions(
		context.globalClineRulesFileInstructions,
		context.localClineRulesFileInstructions,
		context.localAgentsRulesFileInstructions,
		context.clineIgnoreInstructions,
		context.preferredLanguageInstructions,
	)

	const agentsInitNotice = await buildAgentsInitNotice(context)
	const combinedInstructions = [customInstructions, agentsInitNotice].filter(Boolean).join("\n\n")

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
	if (context.modeSystem !== "caret" || !context.cwd) {
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
