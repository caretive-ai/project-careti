/**
 * CARET MODULE: Caret State Extensions
 * 
 * Purpose: ExtensionStateContext에 추가되는 Caret 고유 상태들을 별도 모듈로 분리
 * Usage: ExtensionStateContext.tsx에서 import하여 사용
 */

import React, { useState, useCallback } from "react"
import type { ChatSettings } from "@shared/storage/types"

// CARET MODIFICATION: Caret 고유 상태 타입 정의
export interface CaretStateExtensions {
	// 페르소나 이미지 직접 주입 방식
	personaProfile: string
	personaThinking: string
	// UI 언어 설정
	uiLanguage: string
	// Caret 배너
	caretBanner: string
}

// CARET MODIFICATION: Caret 고유 액션 타입 정의
export interface CaretStateActions {
	setPersonaProfile: (profile: string) => void
	setPersonaThinking: (thinking: string) => void
	setUILanguage: (language: string) => void
	setModeSystem: (modeSystem: string) => void
}

// CARET MODIFICATION: Caret 상태 관리 훅
export const useCaretStateExtensions = (): CaretStateExtensions & CaretStateActions => {
	// 페르소나 이미지 상태
	const [personaProfile, setPersonaProfile] = useState<string>(
		(window as any).personaProfile || ""
	)
	const [personaThinking, setPersonaThinking] = useState<string>(
		(window as any).personaThinking || ""
	)
	
	// UI 언어 상태
	const [uiLanguage] = useState<string>("en") // Will be overwritten by backend state
	
	// Caret 배너 상태
	const [caretBanner] = useState<string>((window as any).caretBanner || "")

	// CARET MODIFICATION: UI 언어만 업데이트하는 별도 함수
	const setUILanguage = useCallback((language: string) => {
		// 실제 구현은 ExtensionStateContext에서 처리
		console.log("setUILanguage called with:", language)
	}, [])

	// CARET MODIFICATION: Mode system (Caret/Cline interface) setter  
	const setModeSystem = useCallback((modeSystem: string) => {
		// 실제 구현은 ExtensionStateContext에서 처리
		console.log("setModeSystem called with:", modeSystem)
	}, [])

	return {
		// 상태
		personaProfile,
		personaThinking,
		uiLanguage,
		caretBanner,
		// 액션
		setPersonaProfile,
		setPersonaThinking,
		setUILanguage,
		setModeSystem,
	}
}

// CARET MODIFICATION: 페르소나 업데이트 메시지 처리
export const handlePersonaUpdate = (
	message: any,
	setPersonaProfile: (profile: string) => void,
	setPersonaThinking: (thinking: string) => void
) => {
	if (message.payload?.avatarUri) {
		setPersonaProfile(message.payload.avatarUri)
	}
	if (message.payload?.thinkingAvatarUri) {
		setPersonaThinking(message.payload.thinkingAvatarUri)
	}
}

// CARET MODIFICATION: 모드 변경 감지 로깅
export const logModeChange = async (prevMode: string | undefined, newMode: string | undefined) => {
	if (prevMode !== newMode) {
		try {
			const { caretWebviewLogger } = await import("../utils/webview-logger")
			caretWebviewLogger.info("🔄 [MODE-CHANGE] Chat mode changed", {
				from: prevMode,
				to: newMode,
			})
		} catch (error) {
			console.warn("Failed to log mode change:", error)
		}
	}
}

// CARET MODIFICATION: 채팅 설정 로깅
export const logChatSettingsChange = async (currentMode: string, newMode: string) => {
	try {
		const { caretWebviewLogger } = await import("../utils/webview-logger")
		caretWebviewLogger.info("📤 [SEND] setChatSettings called", {
			currentMode,
			newMode,
			modeChanged: currentMode !== newMode,
		})
	} catch (error) {
		console.warn("Failed to log chat settings change:", error)
	}
}
