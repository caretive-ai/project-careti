import { CaretUserCreditsData } from "@shared/proto/careti/account"
import type { EmptyRequest } from "@shared/proto/cline/common"
import type { Controller } from "../index"

/**
 * Handles fetching all user credits data (balance, usage, payments)
 * @param controller The controller instance
 * @param request Empty request
 * @returns User credits data response
 */
export async function getCaretUserCredits(controller: Controller, _request: EmptyRequest): Promise<CaretUserCreditsData> {
	try {
		if (!controller.caretAccountService) {
			throw new Error("Account service not available")
		}

		// Call the individual RPC variants in parallel
		const [balance, usageTransactions, paymentTransactions] = await Promise.all([
			controller.caretAccountService.fetchBalanceRPC(),
			controller.caretAccountService.fetchUsageTransactionsRPC(),
			controller.caretAccountService.fetchPaymentTransactionsRPC(),
		])

		// If either call fails (returns undefined), throw an error
		if (balance === undefined) {
			throw new Error("Failed to fetch user credits data")
		}

		return CaretUserCreditsData.create({
			balance: balance ? { currentBalance: balance.balance / 100 } : { currentBalance: 0 },
			usageTransactions: usageTransactions,
			paymentTransactions: paymentTransactions,
		})
	} catch (error) {
		console.error(`Failed to fetch user credits data: ${error}`)
		throw error
	}
}
