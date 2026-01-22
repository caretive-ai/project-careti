// CARETI MODIFICATION: OpenRouter Featured 모델 목록을 분리해 테스트/재사용 가능하게 유지

import { t } from "@/careti/utils/i18n"

export type OpenRouterFeaturedModel = {
	id: string
	description: string
	label: string
}

export const openRouterFeaturedModels: OpenRouterFeaturedModel[] = [
	{
		id: "anthropic/claude-sonnet-4.5",
		description: t("providers.openrouter.modelPicker.featuredModelDescriptionBest", "settings"),
		label: t("providers.openrouter.modelPicker.featuredModelLabelBest", "settings"),
	},
	{
		id: "google/gemini-3-flash-preview",
		description: t("providers.openrouter.modelPicker.featuredModelDescriptionGemini3FlashPreview", "settings"),
		label: t("providers.openrouter.modelPicker.featuredModelLabelNew", "settings"),
	},
	{
		id: "kwaipilot/kat-coder-pro:free",
		description: t("providers.openrouter.modelPicker.featuredModelDescriptionKatcoder", "settings"),
		label: t("providers.openrouter.modelPicker.featuredModelLabelFree", "settings"),
	},
	{
		id: "x-ai/grok-code-fast-1",
		description: t("providers.openrouter.modelPicker.featuredModelDescriptionFree", "settings"),
		label: t("providers.openrouter.modelPicker.featuredModelLabelFree", "settings"),
	},
	{
		id: "cline/code-supernova-1-million",
		description: t("providers.openrouter.modelPicker.featuredModelDescriptionSupernova", "settings"),
		label: t("providers.openrouter.modelPicker.featuredModelLabelFree", "settings"),
	},
]
