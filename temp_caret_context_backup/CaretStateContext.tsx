import React, { createContext, useContext, useState, useCallback } from "react"
import type { ChatSettings } from "@shared/ChatSettings"
import { vscode } from "@/utils/vscode"

// CARET MODIFICATION: Caret 전용 상태 관리를 위한 별도 컨텍스트
interface CaretStateContextType {
	// Persona 관련 상태
	personaProfile: string
	personaThinking: string
	setPersonaProfile: (profile: string) => void
	setPersonaThinking: (thinking: string) => void
	
	// UI 언어 설정
	uiLanguage: string
	setUILanguage: (language: string) => void
	
	// Caret 배너 표시 상태
	caretBanner: boolean
	
	// Chat Settings 관련
	chatSettings?: ChatSettings
	setChatSettings: (settings: ChatSettings) => void
	
	// Mode System 관련
	setModeSystem: (system: string) => void
}

const CaretStateContext = createContext<CaretStateContextType | undefined>(undefined)

export const useCaretState = () => {
	const context = useContext(CaretStateContext)
	if (context === undefined) {
		throw new Error("useCaretState must be used within a CaretStateProvider")
	}
	return context
}

interface CaretStateProviderProps {
	children: React.ReactNode
}

export const CaretStateProvider: React.FC<CaretStateProviderProps> = ({ children }) => {
	// Persona 상태
	const [personaProfile, setPersonaProfile] = useState<string>((window as any).personaProfile || "")
	const [personaThinking, setPersonaThinking] = useState<string>((window as any).personaThinking || "")
	
	// UI 언어 설정 (VSCode 설정 또는 기본값 'en')
	const [uiLanguage, setUILanguageState] = useState<string>("en")
	
	// Caret 배너 상태
	const [caretBanner] = useState<boolean>(true)
	
	// Chat Settings 상태  
	const [chatSettings, setChatSettingsState] = useState<ChatSettings | undefined>(undefined)
	
	// UI 언어 업데이트 함수
	const setUILanguage = useCallback((language: string) => {
		setUILanguageState(language)
		vscode.postMessage({
			type: "setUILanguage",
			language
		})
	}, [])
	
	// Chat Settings 업데이트 함수
	const setChatSettings = useCallback((settings: ChatSettings) => {
		setChatSettingsState(settings)
		vscode.postMessage({
			type: "setChatSettings", 
			chatSettings: settings
		})
	}, [])
	
	// Mode System 설정 함수
	const setModeSystem = useCallback((system: string) => {
		vscode.postMessage({
			type: "setModeSystem",
			modeSystem: system
		})
	}, [])

	const value: CaretStateContextType = {
		personaProfile,
		personaThinking,
		setPersonaProfile,
		setPersonaThinking,
		uiLanguage,
		setUILanguage,
		caretBanner,
		chatSettings,
		setChatSettings,
		setModeSystem
	}

	return (
		<CaretStateContext.Provider value={value}>
			{children}
		</CaretStateContext.Provider>
	)
}

export { CaretStateContext }
