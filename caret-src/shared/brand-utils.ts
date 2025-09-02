/**
 * Shared brand utilities for both backend and webview
 * 
 * This module provides brand replacement functionality that can be used
 * across the entire application (backend, webview, etc.)
 * 
 * CARET MODIFICATION: Unified brand replacement system for frontend use
 */

/**
 * Replace brand names in messages with proper case handling
 * 
 * @param message - Original message
 * @param brandName - Target brand name (Caret, CodeCenter, etc.)
 * @returns Message with brand names replaced
 */
export function replaceBrandInMessage(message: string, brandName: string): string {
	if (!message || !brandName) {
		return message
	}
	
	return message
		.replace(/Cline/g, brandName)                    // Exact case: Cline → Caret
		.replace(/cline/g, brandName.toLowerCase())      // Lower case: cline → caret  
		.replace(/CLINE/g, brandName.toUpperCase())      // Upper case: CLINE → CARET
}

/**
 * Get current brand name from webview context
 * This function should be called from webview components to get the current brand
 * 
 * @returns Current brand name
 */
export function getCurrentBrandFromWebview(): string {
	// In webview context, we need to get brand from the provider or context
	// This will be integrated with CaretProvider context
	try {
		// TODO: Get from CaretProvider context when available
		// For now, detect from document title or other webview-accessible info
		const title = document.title || ""
		if (title.includes("CodeCenter")) return "CodeCenter"
		if (title.includes("Caret")) return "Caret"
		if (title.includes("Cline")) return "Cline"
		
		// Default fallback
		return "Caret"
	} catch (error) {
		console.warn("Failed to detect brand in webview context:", error)
		return "Caret"
	}
}

/**
 * Process webview message with brand replacement
 * This is the webview equivalent of processUniversalBackendMessage
 * 
 * @param message - Original message
 * @param currentMode - Current mode ("cline", "caret", "codecenter")
 * @param brandName - Brand name (optional, will detect if not provided)
 * @returns Processed message
 */
export function processWebviewMessage(message: string, currentMode?: string, brandName?: string): string {
	if (!message || typeof message !== "string") {
		return message
	}
	
	// If in Cline mode, return original message
	if (currentMode === "cline") {
		return message
	}
	
	// Get brand name if not provided
	const targetBrandName = brandName || getCurrentBrandFromWebview()
	
	// Apply brand replacement
	return replaceBrandInMessage(message, targetBrandName)
}

/**
 * Brand replacement hook for React components
 * Usage: const processedText = useBrandReplacement(originalText)
 */
export function useBrandReplacement(text: string, currentMode?: string): string {
	return processWebviewMessage(text, currentMode)
}