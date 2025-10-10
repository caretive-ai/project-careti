// CARET MODIFICATION: gRPC handler for fetching Caret organization credits

import { Controller } from "@core/controller"
import { CaretAccountService } from "@services/account/CaretAccountService"
import * as proto from "@shared/proto/index"

/**
 * Fetches Caret organization credits
 */
export async function getCaretOrganizationCredits(
	controller: Controller,
	request: proto.caret.GetCaretOrganizationCreditsRequest,
): Promise<proto.caret.CaretOrganizationCreditsData> {
	console.log("[CARET-HANDLER] 🏢 getCaretOrganizationCredits called for org:", request.organizationId)

	try {
		const caretAccountService = CaretAccountService.getInstance()

		const balance = await caretAccountService.fetchOrganizationCreditsRPC(request.organizationId)
		const usageTransactions = (await caretAccountService.fetchOrganizationUsageTransactionsRPC(request.organizationId)) || []

		const result: proto.caret.CaretOrganizationCreditsData = {
			balance: {
				currentBalance: balance?.balance || 0,
				currency: balance?.currency,
				lastUpdated: balance?.lastUpdated,
			},
			organizationId: request.organizationId,
			usageTransactions: usageTransactions.map((tx) => ({
				aiInferenceProviderName: tx.aiInferenceProviderName,
				aiModelName: tx.aiModelName,
				aiModelTypeName: tx.aiModelTypeName,
				completionTokens: tx.completionTokens,
				costUsd: tx.costUsd,
				createdAt: tx.createdAt,
				creditsUsed: tx.creditsUsed,
				generationId: tx.generationId,
				id: tx.id,
				metadata: tx.metadata || {},
				organizationId: tx.organizationId,
				memberId: tx.memberId,
				promptTokens: tx.promptTokens,
				totalTokens: tx.totalTokens,
				userId: tx.userId,
				model: tx.model,
				totalCost: tx.totalCost,
				timestamp: tx.timestamp,
				taskId: tx.taskId,
			})),
		}

		return result
	} catch (error) {
		console.error("[CARET-HANDLER] ❌ Failed to fetch organization credits:", error)
		return {
			balance: { currentBalance: 0 },
			organizationId: request.organizationId,
			usageTransactions: [],
		}
	}
}
