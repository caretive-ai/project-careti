// CARET MODIFICATION: Context provider for Caret i18n system
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { getCurrentLanguage, type SupportedLanguage, setGlobalUILanguage } from "../utils/i18n"

interface CaretI18nContextType {
	language: SupportedLanguage
	setLanguage: (language: SupportedLanguage) => Promise<void>
	isLoading: boolean
}

const CaretI18nContext = createContext<CaretI18nContextType | undefined>(undefined)

interface CaretI18nProviderProps {
	children: ReactNode
	defaultLanguage?: SupportedLanguage
}

// CARET MODIFICATION: Provider component for Caret i18n context
export const CaretI18nProvider: React.FC<CaretI18nProviderProps> = ({ children, defaultLanguage = "en" }) => {
	const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage)
	const [isLoading, setIsLoading] = useState(false)

	// Initialize language on mount
	useEffect(() => {
		const currentLang = getCurrentLanguage()
		if (currentLang !== language) {
			setLanguageState(currentLang)
		}
	}, [])

	const setLanguage = useCallback(
		async (newLanguage: SupportedLanguage) => {
			if (newLanguage === language) {
				return
			}

			setIsLoading(true)
			try {
				// Update global i18n state first
				setGlobalUILanguage(newLanguage)

				// Force immediate state update
				setLanguageState(newLanguage)

				console.log(`Caret i18n: Language changed to ${newLanguage}`)
			} catch (error) {
				console.error("Failed to change language:", error)
				throw error // Re-throw to handle in component
			} finally {
				setIsLoading(false)
			}
		},
		[language],
	)

	const contextValue: CaretI18nContextType = {
		language,
		setLanguage,
		isLoading,
	}

	return <CaretI18nContext.Provider value={contextValue}>{children}</CaretI18nContext.Provider>
}

// CARET MODIFICATION: Hook to use Caret i18n context
export const useCaretI18nContext = (): CaretI18nContextType => {
	const context = useContext(CaretI18nContext)
	if (context === undefined) {
		throw new Error("useCaretI18nContext must be used within a CaretI18nProvider")
	}
	return context
}

export default CaretI18nProvider
