import { ToggleCaretRuleRequest, ClineRulesToggles } from "@shared/proto/caret/rules"

export async function toggleCaretRule(request: ToggleCaretRuleRequest): Promise<ClineRulesToggles> {
	// TODO: Implement Caret rule toggle logic
	console.log("toggleCaretRule called:", request.ruleName, request.enabled)

	return ClineRulesToggles.create({
		enabledRules: request.enabled ? [request.ruleName] : [],
		disabledRules: request.enabled ? [] : [request.ruleName],
	})
}
