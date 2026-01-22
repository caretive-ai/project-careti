import type { EmptyRequest } from "@shared/proto/cline/common"
import { Empty } from "@shared/proto/cline/common"
import { CaretAuthService } from "@careti/services/auth/CaretAuthService"
import { LogoutReason } from "@/services/auth/types"
import type { Controller } from "../index"

/**
 * Handles the account logout action
 * @param controller The controller instance
 * @param _request The empty request object
 * @returns Empty response
 */
export async function caretAccountLogoutClicked(controller: Controller, _request: EmptyRequest): Promise<Empty> {
	await controller.handleSignOut()
	await CaretAuthService.getInstance().handleDeauth(LogoutReason.USER_INITIATED)
	return Empty.create({})
}
