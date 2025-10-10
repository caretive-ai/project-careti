import { UpdateBrowserSettingsRequest } from "@shared/proto/cline/browser"
import { Empty } from "@shared/proto/cline/common"
import { DEFAULT_BROWSER_SETTINGS } from "../../../shared/BrowserSettings"
import type { Controller } from "../../controller"

/**
 * Update browser settings
 * @param controller The controller instance
 * @param request The browser settings request message
 * @returns Empty response
 */
export async function updateBrowserSettings(controller: Controller, request: UpdateBrowserSettingsRequest): Promise<Empty> {
	try {
		// Get current browser settings to preserve fields not in the request
		const currentSettings = controller.stateManager.getGlobalSettingsKey("browserSettings")
		const mergedWithDefaults = { ...DEFAULT_BROWSER_SETTINGS, ...currentSettings }

		// Convert from protobuf format to shared format, merging with existing settings
		const newBrowserSettings = {
			...mergedWithDefaults, // Start with existing settings (and defaults)
			viewport: {
				// Apply updates from request
				width: request.viewport?.width || mergedWithDefaults.viewport.width,
				height: request.viewport?.height || mergedWithDefaults.viewport.height,
			},
			// Explicitly handle optional boolean and string fields from the request
			remoteBrowserEnabled:
				request.remoteBrowserEnabled === undefined
					? mergedWithDefaults.remoteBrowserEnabled
					: request.remoteBrowserEnabled,
			remoteBrowserHost:
				request.remoteBrowserHost === undefined ? mergedWithDefaults.remoteBrowserHost : request.remoteBrowserHost,
			chromeExecutablePath:
				// If chromeExecutablePath is explicitly in the request (even as ""), use it.
				// Otherwise, fall back to mergedWithDefaults.
				"chromeExecutablePath" in request ? request.chromeExecutablePath : mergedWithDefaults.chromeExecutablePath,
			disableToolUse: request.disableToolUse === undefined ? mergedWithDefaults.disableToolUse : request.disableToolUse,
			customArgs: "customArgs" in request ? request.customArgs : mergedWithDefaults.customArgs,
		}

		// Update global settings with new browser settings
		controller.stateManager.setGlobalState("browserSettings", newBrowserSettings)

		// Update task browser settings if task exists
		if (controller.task) {
			// Note: Task and BrowserSession types may not have browserSettings property
			// This is kept for compatibility but may need adjustment based on actual types
			;(controller.task as any).browserSettings = newBrowserSettings
			;(controller.task.browserSession as any).browserSettings = newBrowserSettings
		}

		// Post updated state to webview
		await controller.postStateToWebview()

		return Empty.create({})
	} catch (error) {
		console.error("Error updating browser settings:", error)
		throw error
	}
}
