// CARET MODIFICATION: gRPC handler for Caret account logout

import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import { Controller } from "@core/controller"
import * as proto from "@shared/proto/index"

/**
 * Handles Caret account logout click
 * Clears Auth0 tokens and user state
 */
export async function caretAccountLogoutClicked(
	controller: Controller,
	request: proto.cline.EmptyRequest,
): Promise<proto.cline.Empty> {
	console.log("[CARET-HANDLER] 🚪 Caret account logout clicked")

	try {
		// CARET MODIFICATION: Use CaretGlobalManager for Auth0 logout
		await CaretGlobalManager.logout()
		console.log("[CARET-HANDLER] ✅ Auth0 logout successful")
	} catch (error) {
		console.error("[CARET-HANDLER] ❌ Caret logout failed:", error)
	}

	return {}
}
