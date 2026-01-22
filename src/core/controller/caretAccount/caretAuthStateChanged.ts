import { CaretAuthState, CaretAuthStateChangedRequest } from "@shared/proto/careti/account"
import type { Controller } from "../index"

/**
 * Handles authentication state changes from the Firebase context.
 * Updates the user info in global state and returns the updated value.
 * @param controller The controller instance
 * @param request The auth state change request
 * @returns The updated user info
 */
export async function caretAuthStateChanged(
	controller: Controller,
	request: CaretAuthStateChangedRequest,
): Promise<CaretAuthState> {
	try {
		// Store the user info directly in global state
		controller.stateManager.setGlobalState("userInfo", request.user)

		console.log("[CARET-HANDLER] 🔄 Careti auth state changed:", {
			uid: request.user?.uid,
			email: request.user?.email,
		})

		// Return the same user info
		return CaretAuthState.create({ user: request.user })
	} catch (error) {
		console.error(`Failed to update auth state: ${error}`)
		throw error
	}
}
