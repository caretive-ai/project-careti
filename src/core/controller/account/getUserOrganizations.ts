import { Controller } from "../index"
import { EmptyRequest } from "../../../shared/proto/common"
import { UserOrganizationsResponse } from "../../../shared/proto/account"

/**
 * Fetches user's organizations data
 *
 * @param controller The controller instance.
 * @returns The user organizations data.
 */
export async function getUserOrganizations(controller: Controller, _: EmptyRequest): Promise<UserOrganizationsResponse> {
	// Get the CaretAccountService instance
	const accountService = controller.getCaretAccountService()

	if (!accountService) {
		throw new Error("Account service not available")
	}

	// Fetch the user organizations data
	const organizationsData = await accountService.getUserOrganizations()

	if (!organizationsData) {
		throw new Error("Failed to fetch user organizations data")
	}

	return organizationsData
}
