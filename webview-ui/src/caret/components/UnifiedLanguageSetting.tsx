// CARET MODIFICATION: 통합 언어 설정 컴포넌트 - LLM과 UI 언어 자동 동기화

import { getLanguageKey, getLanguageSettings, type LanguageDisplay, type LanguageKey, languageOptions } from "@shared/Languages"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { TaskServiceClient } from "@/services/grpc-client"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"

interface UnifiedLanguageSettingProps {
	hideLabel?: boolean
}

/**
 * CARET MODIFICATION: 통합 언어 설정 컴포넌트
 *
 * 기존 "Preferred Language"를 "Language"로 변경하고
 * LLM 언어와 UI 언어를 자동 동기화하는 통합 컴포넌트
 *
 * 동작 방식:
 * 1. 사용자가 언어 선택 (예: 한국어)
 * 2. LLM 대답 언어: 한국어로 설정 (백엔드 전송)
 * 3. UI 언어 확인: 한국어 지원? → YES
 * 4. UI 자동 변경: UI도 한국어로 변경
 * 5. 지원하지 않는 언어: LLM만 변경, UI는 영어 유지
 */
const UnifiedLanguageSetting: React.FC<UnifiedLanguageSettingProps> = ({ hideLabel = false }) => {
	const { preferredLanguage } = useExtensionState()
	const { changeLanguage } = useCaretI18n()

	// 현재 설정된 언어의 키 값 가져오기
	const currentLanguageKey = getLanguageKey(preferredLanguage as LanguageDisplay)

	const handleLanguageChange = async (event: any) => {
		const target = event.target || event.detail?.target
		const newLanguageKey = target.value as LanguageKey

		// 선택된 언어 옵션 찾기
		const selectedOption = languageOptions.find((option) => option.key === newLanguageKey)
		if (!selectedOption) {
			console.error("❌ Invalid language selected:", newLanguageKey)
			return
		}

		console.log("🌐 Unified Language change requested:", {
			key: newLanguageKey,
			display: selectedOption.display,
		})

		try {
			// 1. 언어 설정 분석
			const languageConfig = getLanguageSettings(newLanguageKey)
			console.log("📋 Language configuration:", languageConfig)

			// 2. LLM 언어 설정 (백엔드 전송)
			updateSetting("preferredLanguage", selectedOption.display)
			console.log("🤖 LLM Language updated:", selectedOption.display)

			// 3. UI 언어 자동 동기화 (지원하는 경우만)
			if (languageConfig.isUISupported) {
				await changeLanguage(languageConfig.caretLanguage)
				console.log(`✅ UI Language also changed to: ${languageConfig.caretLanguage}`)
			} else {
				console.log(`ℹ️ UI Language not supported for: ${newLanguageKey}, keeping English UI`)
			}

			// 4. 언어 변경 시 새 작업 시작 (기존 동작 유지)
			TaskServiceClient.clearTask({})
			console.log("🆕 Starting new task due to language change")

			console.log("✅ Unified Language setting completed:", {
				llm: selectedOption.display,
				ui: languageConfig.isUISupported ? languageConfig.caretLanguage : "en (unchanged)",
			})
		} catch (error) {
			console.error("❌ Failed to change unified language:", error)
		}
	}

	return (
		<div className="setting-container">
			{!hideLabel && (
				<label htmlFor="unified-language-select">{t("settings.unifiedLanguage.label", "settings") || "Language"}</label>
			)}
			<p>
				<VSCodeDropdown
					id="unified-language-select"
					onChange={handleLanguageChange}
					style={{ width: "100%" }}
					value={currentLanguageKey}>
					{languageOptions.map((option) => {
						const isUISupported = getLanguageSettings(option.key).isUISupported
						return (
							<VSCodeOption key={option.key} value={option.key}>
								{option.display} {isUISupported ? "🎨" : ""}
							</VSCodeOption>
						)
					})}
				</VSCodeDropdown>
			</p>
			<p
				className="setting-description"
				style={{
					fontSize: "11px",
					color: "var(--vscode-descriptionForeground)",
					opacity: 0.8,
					marginTop: "4px",
				}}>
				{t("settings.unifiedLanguage.description", "settings") ||
					"Set language for AI responses and interface. Languages with 🎨 support both AI and UI."}
			</p>
		</div>
	)
}

export default React.memo(UnifiedLanguageSetting)
