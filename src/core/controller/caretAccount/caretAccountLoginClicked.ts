// CARET MODIFICATION: gRPC handler for Caret account login

import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import { Controller } from "@core/controller"
import * as proto from "@shared/proto/index"

/**
 * Handles Caret account login click
 * Initiates Auth0 authentication flow
 */
export async function caretAccountLoginClicked(
	controller: Controller,
	request: proto.cline.EmptyRequest,
): Promise<proto.cline.String> {
	console.log("[CARET-HANDLER] 🚪 Caret account login clicked")

	try {
		// CARET MODIFICATION: Use CaretGlobalManager for Auth0 login
		const loginUrl = await CaretGlobalManager.login()
		console.log("[CARET-HANDLER] ✅ Auth0 login successful")

		return { value: loginUrl || "https://caret.team/dashboard" }
	} catch (error) {
		console.error("[CARET-HANDLER] ❌ Caret login failed:", error)
		return { value: "https://caret.team/login" }
	}
}
