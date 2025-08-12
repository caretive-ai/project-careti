import { Controller } from "../index"
import { AuthStateChangedRequest, AuthState } from "../../../shared/proto/account"

/**
 * Handles authentication state changes from the Firebase context.
 * Updates the user info in global state and returns the updated value.
 *
 * @param controller The controller instance.
 * @param request The auth state change request.
 * @returns The updated auth state.
 */
export async function authStateChanged(controller: Controller, request: AuthStateChangedRequest): Promise<AuthState> {
	// Get the CaretAccountService instance
	const accountService = controller.getCaretAccountService()

	if (!accountService) {
		throw new Error("Account service not available")
	}

	// For now, just return the auth state from the request
	// In a real implementation, this would update internal state and validate the user
	const authState = AuthState.create({
		user: request.user,
	})

	return authState
}
