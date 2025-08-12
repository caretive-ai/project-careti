import { Controller } from "../index"
import { EmptyRequest } from "../../../shared/proto/common"
import { UserCreditsData } from "../../../shared/proto/account"

/**
 * Fetches comprehensive user credits data including balance, usage, and payment history
 *
 * @param controller The controller instance.
 * @returns The user credits data.
 */
export async function getUserCredits(controller: Controller, _: EmptyRequest): Promise<UserCreditsData> {
	// Get the CaretAccountService instance
	const accountService = controller.getCaretAccountService()

	if (!accountService) {
		throw new Error("Account service not available")
	}

	// Fetch the user credits data
	const creditsData = await accountService.getUserCredits()

	if (!creditsData) {
		throw new Error("Failed to fetch user credits data")
	}

	return creditsData
}
