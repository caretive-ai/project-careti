// CARET MODIFICATION: gRPC handler for fetching Caret user credits
// Based on ClineAccount getUserCredits but uses CaretAccountService

import { Controller } from "@core/controller"
import { CaretAccountService } from "@services/account/CaretAccountService"
import * as proto from "@shared/proto/index"

/**
 * Fetches Caret user credits (balance, usage transactions, payment transactions)
 * Uses CaretAccountService to communicate with caret.team API
 */
export async function getCaretUserCredits(
	_controller: Controller,
	_request: proto.cline.EmptyRequest,
): Promise<proto.caret.CaretUserCreditsData> {
	console.log("[CARET-HANDLER] 🚀 getCaretUserCredits called")

	try {
		// CARET MODIFICATION: Use CaretAccountService instead of ClineAccountService
		const caretAccountService = CaretAccountService.getInstance()

		// Fetch balance
		console.log("[CARET-HANDLER] 💰 Fetching balance...")
		const balanceResponse = await caretAccountService.fetchBalanceRPC()
		console.log("<--CaretAccountService: getCaretUserCredits: balanceResponse:", balanceResponse)

		// Fetch usage transactions
		console.log("[CARET-HANDLER] 📈 Fetching usage transactions...")
		// const usageTransactions = (await caretAccountService.fetchUsageTransactionsRPC()) || []

		// Fetch payment transactions
		console.log("[CARET-HANDLER] 💳 Fetching payment transactions...")
		// const paymentTransactions = (await caretAccountService.fetchPaymentTransactionsRPC()) || []

		// console.log("[CARET-HANDLER] ✅ Successfully fetched all credits data:", {
		// 	balance: balanceResponse?.balance,
		// 	usageCount: usageTransactions.length,
		// 	paymentCount: paymentTransactions.length,
		// })

		// Convert to proto format
		const result: proto.caret.CaretUserCreditsData = {
			// balance: {
			// 	currentBalance: balanceResponse?.balance || 0,
			// 	currency: balanceResponse?.currency,
			// 	lastUpdated: balanceResponse?.lastUpdated,
			// },
			balance: {
				currentBalance: balanceResponse?.balance || 0,
				currency: balanceResponse?.currency,
				lastUpdated: balanceResponse?.updatedAt,
			},
			usageTransactions: [],
			paymentTransactions: [],
			// usageTransactions: usageTransactions.map((tx) => ({
			// 	aiInferenceProviderName: tx.aiInferenceProviderName,
			// 	aiModelName: tx.aiModelName,
			// 	aiModelTypeName: tx.aiModelTypeName,
			// 	completionTokens: tx.completionTokens,
			// 	costUsd: tx.costUsd,
			// 	createdAt: tx.createdAt,
			// 	creditsUsed: tx.creditsUsed,
			// 	generationId: tx.generationId,
			// 	id: tx.id,
			// 	metadata: tx.metadata || {},
			// 	organizationId: tx.organizationId,
			// 	promptTokens: tx.promptTokens,
			// 	totalTokens: tx.totalTokens,
			// 	userId: tx.userId,
			// 	model: tx.model,
			// 	cachedTokens: tx.cachedTokens,
			// 	totalCost: tx.totalCost,
			// 	timestamp: tx.timestamp,
			// 	taskId: tx.taskId,
			// })),
			// paymentTransactions: paymentTransactions.map((tx) => ({
			// 	paidAt: tx.paidAt,
			// 	creatorId: tx.creatorId,
			// 	amountCents: tx.amountCents,
			// 	credits: tx.credits,
			// 	currency: tx.currency,
			// 	paymentMethod: tx.paymentMethod,
			// 	transactionId: tx.transactionId,
			// })),
		}

		return result
	} catch (error) {
		console.error("[CARET-HANDLER] ❌ Failed to fetch Caret user credits:", error)

		// Return empty data structure on error
		const fallbackResult: proto.caret.CaretUserCreditsData = {
			balance: {
				currentBalance: 0,
				currency: "USD",
				lastUpdated: new Date().toISOString(),
			},
			usageTransactions: [],
			paymentTransactions: [],
		}

		return fallbackResult
	}
}
