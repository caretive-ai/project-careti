// CARET MODIFICATION: gRPC handler for setting active Caret organization

import { Controller } from "@core/controller"
import { CaretAccountService } from "@services/account/CaretAccountService"
import * as proto from "@shared/proto/index"

/**
 * Sets the active Caret organization for the user
 */
export async function setCaretUserOrganization(
	_controller: Controller,
	request: proto.caret.CaretUserOrganizationUpdateRequest,
): Promise<proto.cline.Empty> {
	console.log("[CARET-HANDLER] 🔄 setCaretUserOrganization called for org:", request.organizationId)

	try {
		const caretAccountService = CaretAccountService.getInstance()
		await caretAccountService.switchAccount(request.organizationId)

		console.log("[CARET-HANDLER] ✅ Successfully switched to organization:", request.organizationId)
		return {}
	} catch (error) {
		console.error("[CARET-HANDLER] ❌ Failed to set user organization:", error)
		return {}
	}
}
