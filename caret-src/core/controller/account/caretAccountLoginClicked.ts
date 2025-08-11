import * as vscode from "vscode"
import crypto from "crypto"
import { Controller } from "../../../../src/core/controller/index"
import { storeSecret } from "../../../../src/core/storage/state"
import { EmptyRequest, String } from "../../../../src/shared/proto/common"

/**
 * CARET MODIFICATION: Caret-specific account login handler
 * Handles the user clicking the login link in the Caret UI.
 * Uses Caret's authentication backend instead of Cline's.
 *
 * @param controller The controller instance.
 * @returns The login URL as a string.
 */
export async function caretAccountLoginClicked(controller: Controller, _: EmptyRequest): Promise<String> {
	// Generate nonce for state validation
	const nonce = crypto.randomBytes(32).toString("hex")
	await storeSecret(controller.context, "authNonce", nonce)

	// Open browser for authentication with state param
	console.log("Caret login button clicked in account page")
	console.log("Opening Caret auth page with state param")

	const uriScheme = vscode.env.uriScheme
	const audience = process.env.AUTH0_AUDIENCE

	console.log("Caret audience:", audience)
	if (!audience) {
		const errorMsg =
			"Caret Auth0 Audience is not defined. Please check your .env file and ensure esbuild.js is injecting environment variables correctly."
		console.error(errorMsg, { audience })
		vscode.window.showErrorMessage(errorMsg)
		throw new Error(errorMsg)
	}

	// CARET MODIFICATION: Use Caret-specific callback URL
	const vsCodeCallbackUrl = `${uriScheme || "vscode"}://caretive.caret/auth`

	// CARET MODIFICATION: Use environment variables to construct the auth URL, pointing to Caret backend
	const authUrl = vscode.Uri.parse(
		`${audience}/api/auth?state=${encodeURIComponent(nonce)}&callback_url=${encodeURIComponent(vsCodeCallbackUrl)}`,
	)

	console.log("Caret authUrl", authUrl.toString())
	await vscode.env.openExternal(authUrl)
	return String.create({
		value: authUrl.toString(),
	})
}
