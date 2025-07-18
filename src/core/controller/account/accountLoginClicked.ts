import * as vscode from "vscode"
import crypto from "crypto"
import { Controller } from "../index"
import { storeSecret } from "../../storage/state"
import { EmptyRequest, String } from "../../../shared/proto/common"

/**
 * Handles the user clicking the login link in the UI.
 * Generates a secure nonce for state validation, stores it in secrets,
 * and opens the authentication URL in the external browser.
 *
 * @param controller The controller instance.
 * @returns The login URL as a string.
 */
export async function accountLoginClicked(controller: Controller, _: EmptyRequest): Promise<String> {
	// Generate nonce for state validation
	const nonce = crypto.randomBytes(32).toString("hex")
	await storeSecret(controller.context, "authNonce", nonce)

	// Open browser for authentication with state param
	console.log("Login button clicked in account page")
	console.log("Opening auth page with state param")

	const uriScheme = vscode.env.uriScheme
	const audience = process.env.AUTH0_AUDIENCE

	console.log(audience)
	if (!audience) {
		const errorMsg =
			"Auth0 Audience is not defined. Please check your .env file and ensure esbuild.js is injecting environment variables correctly."
		console.error(errorMsg, { audience })
		vscode.window.showErrorMessage(errorMsg)
		throw new Error(errorMsg)
	}

	const vsCodeCallbackUrl = `${uriScheme || "vscode"}://caretive.caret/auth`

	// CARET MODIFICATION: Use environment variables to construct the auth URL, pointing to our backend
	const authUrl = vscode.Uri.parse(
		`${audience}/api/auth?state=${encodeURIComponent(nonce)}&callback_url=${encodeURIComponent(vsCodeCallbackUrl)}`,
	)

	console.log("authUrl", authUrl.toString())
	await vscode.env.openExternal(authUrl)
	return String.create({
		value: authUrl.toString(),
	})
}
