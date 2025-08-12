import { Controller } from "../index"
import { GetOrganizationCreditsRequest, OrganizationCreditsData } from "../../../shared/proto/account"

/**
 * Get organization credits data
 *
 * @param controller The controller instance.
 * @param request The organization credits request.
 * @returns The organization credits data.
 */
export async function getOrganizationCredits(
	controller: Controller,
	request: GetOrganizationCreditsRequest,
): Promise<OrganizationCreditsData> {
	// Get the CaretAccountService instance
	const accountService = controller.getCaretAccountService()

	if (!accountService) {
		throw new Error("Account service not available")
	}

	// For now, return a mock implementation
	// In a real implementation, this would fetch organization-specific credits data
	const orgCreditsData = OrganizationCreditsData.create({
		balance: { currentBalance: 100.0 },
		organizationId: request.organizationId,
		usageTransactions: [],
	})

	return orgCreditsData
}
