import { WebviewProvider } from "@core/webview"
import { Logger } from "@services/logging/Logger"
import * as vscode from "vscode"

export class SharedUriHandler implements vscode.UriHandler {
	public async handleUri(uri: vscode.Uri) {
		Logger.log("SharedUriHandler: Received URI:", uri.toString())

		// Get a visible webview instance
		const visibleWebview = WebviewProvider.getVisibleInstance()
		if (!visibleWebview || !visibleWebview.controller) {
			Logger.log("SharedUriHandler: No active Cline instance found")
			return
		}

		// Parse the query parameters from the URI
		const query = new URLSearchParams(uri.query)

		switch (uri.path) {
			case "/auth/callback": {
				try {
					console.log("SharedUriHandler: Auth callback received:", { path: uri.path, provider: query.get("provider") })

					const token = query.get("token")
					const state = query.get("state")
					const provider = query.get("provider")

					if (token) {
						const { CaretGlobalManager } = await import("@caret/managers/CaretGlobalManager")

						// TODO: Validate state parameter against stored nonce
						console.log("SharedUriHandler: State validation:", state)

						// Set token in CaretGlobalManager (will initialize Apollo Client)
						await CaretGlobalManager.setTokenFromCallback(token)

						// Notify webview of successful authentication
						await visibleWebview.controller.handleAuthCallback(token, provider || "caret")
					}
				} catch (error) {
					Logger.log("Error handling auth callback:", error)
					vscode.window.showErrorMessage(`Error handling auth callback: ${error}`)
				}
				break
			}
			default:
				Logger.log(`SharedUriHandler: Unknown URI path: ${uri.path}`)
		}
	}
}
