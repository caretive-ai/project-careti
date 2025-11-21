// CARET MODIFICATION: gRPC handler for fetching the current Caret user profile

import { Controller } from "@core/controller"
import { CaretAccountService } from "@services/account/CaretAccountService"
import type { CaretUsage } from "@shared/CaretAccount"
import * as proto from "@shared/proto/index"

const defaultUsage: proto.caret.CaretUsageSummary = {
	spend: 0,
	currency: "USD",
	promptTokens: 0,
	completionTokens: 0,
	totalTokens: 0,
}

const mapUsage = (usage?: CaretUsage | null): proto.caret.CaretUsageSummary => {
	if (!usage) {
		return { ...defaultUsage }
	}

	return {
		spend: usage.spend ?? 0,
		currency: usage.currency ?? undefined,
		promptTokens: usage.prompt_tokens ?? 0,
		completionTokens: usage.completion_tokens ?? 0,
		totalTokens: usage.total_tokens ?? 0,
	}
}

export async function getCaretUserProfile(
	_controller: Controller,
	_request: proto.cline.EmptyRequest,
): Promise<proto.caret.CaretUserProfile> {
	try {
		const caretAccountService = CaretAccountService.getInstance()
		const profile = await caretAccountService.fetchMe()

		if (!profile) {
			return {
				id: "",
				email: undefined,
				displayName: undefined,
				photoUrl: undefined,
				appBaseUrl: undefined,
				apiKey: undefined,
				models: [],
				dailyUsage: { ...defaultUsage },
				monthlyUsage: { ...defaultUsage },
				organizations: [],
				createdAt: undefined,
				updatedAt: undefined,
			}
		}

		return {
			id: profile.id ?? "",
			email: profile.email ?? undefined,
			displayName: profile.displayName ?? undefined,
			photoUrl: profile.photoUrl ?? undefined,
			appBaseUrl: profile.appBaseUrl ?? undefined,
			apiKey: profile.apiKey ?? undefined,
			models: profile.models ?? [],
			dailyUsage: mapUsage(profile.dailyUsage),
			monthlyUsage: mapUsage(profile.monthlyUsage),
			organizations:
				profile.organizations?.map((organization) => ({
					active: organization.active,
					memberId: organization.memberId,
					name: organization.name,
					organizationId: organization.organizationId,
					roles: organization.roles ?? [],
					planType: undefined,
					currency: undefined,
				})) ?? [],
			createdAt: profile.createdAt ?? undefined,
			updatedAt: profile.updatedAt ?? undefined,
		}
	} catch (error) {
		console.error("[CARET-HANDLER] ❌ Failed to fetch Caret user profile:", error)
		return {
			id: "",
			email: undefined,
			displayName: undefined,
			photoUrl: undefined,
			appBaseUrl: undefined,
			apiKey: undefined,
			models: [],
			dailyUsage: { ...defaultUsage },
			monthlyUsage: { ...defaultUsage },
			organizations: [],
			createdAt: undefined,
			updatedAt: undefined,
		}
	}
}
