// CARET MODIFICATION: Context provider for Caret i18n system
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import {
	convertPreferredLanguageToSupported,
	type SupportedLanguage,
	setExtensionLanguageProvider,
	setGlobalUILanguage,
} from "../utils/i18n"

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
	const { preferredLanguage } = useExtensionState()
	const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage)
	const [isLoading, setIsLoading] = useState(false)

	// 초기화 로그는 한 번만 출력
	const [hasInitialized, setHasInitialized] = useState(false)

	if (!hasInitialized) {
		console.log(
			`🚀 [CaretI18nProvider] Initializing i18n system: defaultLang="${defaultLanguage}", ExtensionState="${preferredLanguage}"`,
		)
		setHasInitialized(true)
	}

	// ExtensionState의 preferredLanguage를 i18n으로 변환하는 함수
	const getLanguageFromExtensionState = useCallback((): SupportedLanguage => {
		return convertPreferredLanguageToSupported(preferredLanguage)
	}, [preferredLanguage])

	// i18n 시스템에 ExtensionState 언어 제공자 등록
	useEffect(() => {
		setExtensionLanguageProvider(getLanguageFromExtensionState)
	}, [getLanguageFromExtensionState])

	// ExtensionState의 preferredLanguage가 변경될 때마다 UI 언어 업데이트
	useEffect(() => {
		const newLanguage = getLanguageFromExtensionState()
		if (newLanguage !== language) {
			setLanguageState(newLanguage)
			setGlobalUILanguage(newLanguage)
		}
	}, [preferredLanguage, language, getLanguageFromExtensionState])

	// Initialize language on mount
	useEffect(() => {
		const initialLanguage = getLanguageFromExtensionState()
		console.log(`🎯 [CaretI18nProvider] Initial language: "${initialLanguage}"`)
		setLanguageState(initialLanguage)
		setGlobalUILanguage(initialLanguage)
	}, [])

	const setLanguage = useCallback(
		async (newLanguage: SupportedLanguage) => {
			if (newLanguage === language) {
				return
			}

			console.log(`🔄 [CaretI18nProvider] Language change requested: "${language}" → "${newLanguage}"`)
			setIsLoading(true)
			try {
				// Update global i18n state first
				setGlobalUILanguage(newLanguage)

				// Force immediate state update
				setLanguageState(newLanguage)

				console.log(`✅ [CaretI18nProvider] Language change completed: "${newLanguage}"`)
			} catch (error) {
				console.error(`❌ [CaretI18nProvider] Language change failed:`, error)
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
