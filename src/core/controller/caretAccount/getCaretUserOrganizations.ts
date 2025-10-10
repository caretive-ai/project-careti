// CARET MODIFICATION: gRPC handler for fetching Caret user organizations

import { Controller } from "@core/controller"
import { CaretAccountService } from "@services/account/CaretAccountService"
import * as proto from "@shared/proto/index"

/**
 * Fetches all Caret user organizations
 */
export async function getCaretUserOrganizations(
	controller: Controller,
	request: proto.cline.EmptyRequest,
): Promise<proto.caret.CaretUserOrganizationsResponse> {
	console.log("[CARET-HANDLER] 🏢 getCaretUserOrganizations called")

	try {
		const caretAccountService = CaretAccountService.getInstance()
		const organizations = (await caretAccountService.fetchUserOrganizationsRPC()) || []

		const result: proto.caret.CaretUserOrganizationsResponse = {
			organizations: organizations.map((org) => ({
				active: org.active,
				memberId: org.memberId,
				name: org.name,
				organizationId: org.organizationId,
				roles: org.roles,
				planType: "pro", // Default plan type
				currency: "USD", // Default currency
			})),
		}

		console.log("[CARET-HANDLER] ✅ Found", organizations.length, "organizations")
		return result
	} catch (error) {
		console.error("[CARET-HANDLER] ❌ Failed to fetch user organizations:", error)
		return { organizations: [] }
	}
}
