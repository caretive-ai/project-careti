import type { Controller } from "../index"
import type { EmptyRequest } from "@shared/proto/cline/common"
import { UserOrganization, UserOrganizationsResponse } from "@shared/proto/cline/account"

/**
 * Handles fetching all user credits data (balance, usage, payments)
 * @param controller The controller instance
 * @param request Empty request
 * @returns User credits data response
 */
export async function getUserOrganizations(controller: Controller, request: EmptyRequest): Promise<UserOrganizationsResponse> {
	try {
		if (!controller.accountService) {
			throw new Error("Account service not available")
		}

		// CARET MODIFICATION: Temporarily disable organization fetching as it's not yet implemented in CaretAccountService.
		// TODO: Re-enable this feature when the backend API is ready.
		// Fetch user organizations from the account service
		// const organizations = await controller.accountService.fetchUserOrganizationsRPC()

		return UserOrganizationsResponse.create({
			organizations: [],
		})
	} catch (error) {
		throw error
	}
}
