/**
 * Backend message filtering for brand replacement
 * 
 * This module processes backend messages to replace brand names dynamically.
 * Supports Cline mode (original messages) and Caret/CodeCenter modes (brand replacement).
 * 
 * CARET MODIFICATION: Simplified brand replacement system using centralized brand-utils
 */

import { getCurrentBrandName, replaceBrandInMessage } from "../utils/brand-utils"

/**
 * Universal message processor for all backend messages
 * Handles both OS notifications and webview messages with brand replacement
 * 
 * @param message - Original message
 * @param isOSNotification - true for OS notifications, false for webview messages
 * @returns Processed message with appropriate brand replacement
 */
export function processUniversalBackendMessage(message: string, isOSNotification: boolean = false): string {
	if (!message || typeof message !== "string") {
		return message
	}

	try {
		// Import utilities for global access
		const { CaretProvider } = require("../providers/CaretProvider")
		
		// Get current mode and brand settings
		const currentMode = CaretProvider.currentMode
		const brandName = getCurrentBrandName() // Use package.json displayName as source of truth

		// Cline mode: return original message
		if (currentMode === "cline") {
			return message
		}

		// Caret/CodeCenter mode: Simple brand replacement (대소문자 모두)
		return replaceBrandInMessage(message, brandName)
		
	} catch (error) {
		console.warn("Failed to process universal backend message:", error)
		// Safe fallback: replace with Caret
		return replaceBrandInMessage(message, "Caret")
	}
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use processUniversalBackendMessage instead
 */
export async function isCaretMode(): Promise<boolean> {
	try {
		const { CaretProvider } = require("../providers/CaretProvider")
		return CaretProvider.currentMode === "caret"
	} catch (error) {
		console.warn("Failed to access Caret mode system:", error)
		return false
	}
}