/**
 * Backend i18n message filtering for OS notifications
 * 
 * This module processes backend messages for OS native notifications in Caret mode.
 * Unlike webview messages, OS notifications are user-only and benefit from full i18n.
 * 
 * CARET MODIFICATION: Backend message i18n system for OS notifications
 */

// Simple message mappings for backend use (core patterns only)
const BACKEND_MESSAGE_PATTERNS = {
	wants_to_edit: {
		pattern: "wants to (create|write|edit)",
		translations: {
			ko: "파일을 편집하려고 합니다",
			en: "wants to edit file"
		}
	},
	wants_to_read: {
		pattern: "wants to read",
		translations: {
			ko: "파일을 읽으려고 합니다", 
			en: "wants to read file"
		}
	},
	wants_to_execute: {
		pattern: "wants to (execute|run)",
		translations: {
			ko: "명령을 실행하려고 합니다",
			en: "wants to execute command"
		}
	},
	wants_to_search: {
		pattern: "wants to search",
		translations: {
			ko: "파일을 검색하려고 합니다",
			en: "wants to search files"
		}
	},
	wants_to_fetch: {
		pattern: "wants to fetch",
		translations: {
			ko: "웹 콘텐츠를 가져오려고 합니다",
			en: "wants to fetch content"
		}
	},
	wants_to_use_tool: {
		pattern: "wants to use.*on",
		translations: {
			ko: "도구를 사용하려고 합니다",
			en: "wants to use tool"
		}
	},
	wants_to_analyze: {
		pattern: "wants to analyze",
		translations: {
			ko: "코드를 분석하려고 합니다",
			en: "wants to analyze code"
		}
	}
} as const

type MessagePatternKey = keyof typeof BACKEND_MESSAGE_PATTERNS
type SupportedLanguage = "ko" | "en"

/**
 * Processes backend message for OS notification display
 * 
 * @param message - Original backend message
 * @param brandName - Brand name to use (Caret/Cline)
 * @param language - Target language
 * @returns Processed message with brand and language applied
 */
export function processBackendNotificationMessage(
	message: string, 
	brandName: string = "Caret", 
	language: SupportedLanguage = "ko"
): string {
	if (!message || typeof message !== "string") {
		return message
	}

	// Find matching pattern
	const patternKey = findMatchingPattern(message)
	if (!patternKey) {
		// No pattern match - apply simple brand replacement for fallback
		return message.replace(/Cline/gi, brandName)
	}

	// Get translation
	const pattern = BACKEND_MESSAGE_PATTERNS[patternKey]
	const translation = pattern.translations[language] || pattern.translations.en

	// Apply brand name
	const finalMessage = language === "ko" ? 
		`${brandName}이 ${translation}` : 
		`${brandName} ${translation}`

	return finalMessage
}

/**
 * Find pattern key that matches the message
 */
function findMatchingPattern(message: string): MessagePatternKey | null {
	const lowerMessage = message.toLowerCase()
	
	for (const [key, pattern] of Object.entries(BACKEND_MESSAGE_PATTERNS)) {
		const regex = new RegExp(pattern.pattern, "i")
		if (regex.test(lowerMessage)) {
			return key as MessagePatternKey
		}
	}
	
	return null
}

/**
 * Universal message processor for all backend messages
 * Handles both OS notifications (full i18n) and webview/error messages (brand replacement)
 * 
 * @param message - Original message
 * @param isOSNotification - true for OS notifications (needs full i18n), false for webview/error (brand only)
 * @returns Processed message based on current mode and settings
 */
export function processUniversalBackendMessage(message: string, isOSNotification: boolean = false): string {
	if (!message || typeof message !== "string") {
		return message
	}

	try {
		// Import utilities for global access
		const { CaretProvider } = require("../providers/CaretProvider")
		const { getCurrentBrandName } = require("../utils/brand-utils")
		
		// Get current mode and brand settings
		const currentMode = CaretProvider.currentMode
		const brandName = getCurrentBrandName() // Use package.json displayName as source of truth
		const isI18nEnabled = CaretProvider.isI18nEnabled

		// If in Cline mode, return original message
		if (currentMode === "cline") {
			return message
		}

		// Caret mode processing
		if (isOSNotification && isI18nEnabled) {
			// OS notifications: Full i18n translation
			const patternKey = findMatchingPattern(message)
			if (patternKey) {
				const pattern = BACKEND_MESSAGE_PATTERNS[patternKey]
				const translation = pattern.translations["ko"] || pattern.translations["en"]
				return `${brandName}이 ${translation}`
			}
		}
		
		// Fallback or webview/error messages: Simple brand replacement
		return message.replace(/Cline/gi, brandName)
		
	} catch (error) {
		console.warn("Failed to process universal backend message:", error)
		// Safe fallback: simple brand replacement
		return message.replace(/Cline/gi, "Caret")
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