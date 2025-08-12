import { Controller } from "../index"
import { Empty } from "../../../shared/proto/common"
import { UserOrganizationUpdateRequest } from "../../../shared/proto/account"

/**
 * Sets the user's active organization
 *
 * @param controller The controller instance.
 * @param request The organization update request.
 * @returns Empty response.
 */
export async function setUserOrganization(controller: Controller, request: UserOrganizationUpdateRequest): Promise<Empty> {
	// Get the CaretAccountService instance
	const accountService = controller.getCaretAccountService()

	if (!accountService) {
		throw new Error("Account service not available")
	}

	// Set the user organization
	const success = await accountService.setUserOrganization(request.organizationId)

	if (!success) {
		throw new Error("Failed to set user organization")
	}

	return Empty.create()
}
