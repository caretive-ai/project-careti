// CARET MODIFICATION: Refactored to use component-based architecture while preserving original Cline structure patterns
// Original backed up to: WelcomeView-tsx.caret-backup
import React from "react"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@utils/validate"
import { vscode } from "@utils/vscode"
import CaretWelcomeSection from "@/caret/components/CaretWelcomeSection"
import CaretApiSetup from "@/caret/components/CaretApiSetup"
import { ModelsServiceClient } from "@/services/grpc-client"
import { UpdateApiConfigurationRequest } from "@shared/proto/cline/models"
import { convertApiConfigurationToProto } from "@shared/proto-conversions/models/api-configuration-conversion"

import CaretFooter from "@/caret/components/CaretFooter"
import { t } from "@/caret/utils/i18n"
import { useCurrentLanguage } from "@/caret/hooks/useCurrentLanguage"
import { CARET_URLS, getLocalizedUrl } from "@/caret/constants/urls"
import PreferredLanguageSetting from "@/components/settings/PreferredLanguageSetting"
import CaretUILanguageSetting from "@/caret/components/CaretUILanguageSetting"

const WelcomeView = () => {
	const { apiConfiguration, caretBanner, chatSettings, setChatSettings } = useExtensionState()
	const currentLanguage = useCurrentLanguage()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = !!apiErrorMessage

	const handleOpenLink = (link: string, linkName: string) => {
		vscode.postMessage({ type: "openExternalLink", link })
	}

	const handleSubmitApiKey = async () => {
		try {
			if (!apiConfiguration) return

			// gRPC를 통해 API configuration 저장 (원래 Cline 방식)
			const protoConfig = convertApiConfigurationToProto(apiConfiguration)
			await ModelsServiceClient.updateApiConfigurationProto(
				UpdateApiConfigurationRequest.create({
					apiConfiguration: protoConfig,
				}),
			)

			// CARET MODIFICATION: 웰컴 페이지 완료 시 페르소나 초기화
			// 사용자가 언어를 선택하지 않고 넘어가도 현재 언어로 페르소나 초기화
			try {
				// 현재 UI 언어 가져오기 (chatSettings.uiLanguage 또는 현재 언어)
				const currentUILanguage = chatSettings?.uiLanguage || currentLanguage

				console.log("[WelcomeView] 🎯 Preparing to initialize default persona")
				console.log("[WelcomeView] 📋 Current language:", currentLanguage)
				console.log("[WelcomeView] 📋 ChatSettings uiLanguage:", chatSettings?.uiLanguage)
				console.log("[WelcomeView] 📋 Final language for persona:", currentUILanguage)

				// 백엔드에 페르소나 초기화 요청
				vscode.postMessage({
					type: "initializeDefaultPersona",
					language: currentUILanguage,
				})

				console.log("[WelcomeView] 🚀 Default persona initialization requested for language:", currentUILanguage)
			} catch (personaError) {
				console.warn("[WelcomeView] ❌ Failed to initialize default persona:", personaError)
			}

			// API 설정 완료 후 자동으로 채팅 화면으로 이동
			// API 설정 페이지 닫기
			setShowApiOptions(false)
			console.log("[WelcomeView] API configuration saved successfully, closing setup page")
		} catch (error) {
			console.error("Failed to save API configuration:", error)
		}
	}

	const handleShowApiOptions = async () => {
		// Always show API setup when "시작하기" button is clicked
		console.log("[WelcomeView] 시작하기 button clicked, showing API setup")
		setShowApiOptions(true)
	}

	const handleHideApiOptions = () => {
		setShowApiOptions(false)
	}

	const handleGitHubLink = () => {
		handleOpenLink(CARET_URLS.CARET_GITHUB, "GitHub")
	}

	useEffect(() => {
		// CARET MODIFICATION: 다국어 에러 메시지 적용
		setApiErrorMessage(validateApiConfiguration(apiConfiguration, currentLanguage))
	}, [apiConfiguration, currentLanguage])

	// CARET DEBUG: Add console.log to check the value of caretBanner
	useEffect(() => {
		console.log("🖼️ [WelcomeView] caretBanner value:", caretBanner)
		if (caretBanner) {
			console.log(
				`🖼️ [WelcomeView] caretBanner length: ${caretBanner.length}, starts with: ${caretBanner.substring(0, 30)}`,
			)
		} else {
			console.log("🖼️ [WelcomeView] caretBanner is empty or undefined.")
		}
	}, [caretBanner])

	// Helper to render sections consistently (preserving original Cline pattern)
	const renderSection = (
		headerKey: string,
		bodyKey: string,
		buttonTextKey?: string,
		buttonHandler?: () => void,
		buttonAppearance: "primary" | "secondary" = "secondary",
		children?: React.ReactNode,
	) => (
		<CaretWelcomeSection
			headerKey={headerKey}
			bodyKey={bodyKey}
			buttonConfig={
				buttonTextKey && buttonHandler
					? {
							textKey: buttonTextKey,
							handler: buttonHandler,
							appearance: buttonAppearance,
						}
					: undefined
			}
			allowHtml={true}>
			{children}
		</CaretWelcomeSection>
	)

	// API 설정 페이지를 완전히 별도 페이지로 렌더링
	if (showApiOptions) {
		return (
			<div
				data-testid="caret-api-setup-page"
				data-overlay-version="caret"
				className="caret-api-setup-page"
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					display: "flex",
					flexDirection: "column",
					backgroundColor: "var(--vscode-editor-background)",
				}}>
				<div
					style={{
						flex: 1,
						padding: "20px",
						overflowY: "auto",
					}}>
					{/* API 설정 컴포넌트 - 페이지 전체 */}
					<CaretApiSetup
						onSubmit={handleSubmitApiKey}
						onBack={handleHideApiOptions}
						disabled={disableLetsGoButton}
						errorMessage={apiErrorMessage || undefined}
					/>
				</div>
			</div>
		)
	}

	// 메인 웰컴 페이지
	return (
		<div
			data-testid="caret-welcome-view"
			data-overlay-version="caret"
			className="caret-welcome"
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
			}}>
			<div
				style={{
					flex: 1,
					padding: "15px",
					overflowY: "auto",
				}}>
				<center style={{ marginBottom: "20px" }}>
					{/* Use caretBanner from ExtensionStateContext */}
					<img
						src={caretBanner}
						alt={t("bannerAlt", "welcome", currentLanguage)}
						style={{
							maxWidth: "320px",
							margin: "5px 0 15px",
						}}
					/>
				</center>

				{/* 첫 줄 타이틀 가운데 정렬 */}
				<div style={{ textAlign: "center", marginBottom: "15px" }}>
					<h2
						style={{
							fontSize: "16px",
							fontWeight: "500",
							margin: "0",
							color: "var(--vscode-foreground)",
						}}>
						{t("coreFeatures.header", "welcome", currentLanguage)}
					</h2>
				</div>

				{renderSection("", "coreFeatures.description")}
				{/* 언어 선택과 시작 섹션 - 검은색 박스로 섹션화 */}
				<CaretWelcomeSection headerKey="" bodyKey="" allowHtml={true} data-testid="language-selection-section">
					{/* 언어 선택을 가로 2단 배치 */}
					<div
						style={{
							display: "flex",
							gap: "20px",
							marginBottom: "20px",
							flexWrap: "wrap",
						}}>
						{/* UI 언어 (왼쪽) */}
						<div style={{ flex: "1", minWidth: "200px" }}>
							<label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
								{t("getStarted.uiLanguage", "welcome", currentLanguage)}
							</label>
							<CaretUILanguageSetting
								chatSettings={chatSettings}
								setChatSettings={setChatSettings}
								hideLabel={true}
							/>
						</div>
						{/* AI 응답 언어 (오른쪽) */}
						<div style={{ flex: "1", minWidth: "200px" }}>
							<label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
								{t("getStarted.preferredLanguage", "welcome", currentLanguage)}
							</label>
							<PreferredLanguageSetting
								chatSettings={chatSettings}
								setChatSettings={setChatSettings}
								hideLabel={true}
							/>
						</div>
					</div>
					{/* 시작하기 버튼 - 컨테이너 안에서 적당히 넓게, 높이만 GitHub 저장소 버튼과 같게 */}
					<div style={{ textAlign: "center" }}>
						<VSCodeButton
							appearance="primary"
							onClick={handleShowApiOptions}
							style={{
								width: "90%",
								padding: "8px 6px",
								fontSize: "14px",
								fontWeight: "bold",
								color: "black",
							}}>
							{t("getStarted.button", "welcome", currentLanguage)}
						</VSCodeButton>
					</div>
				</CaretWelcomeSection>

				{renderSection("community.header", "community.body", "community.githubLink", handleGitHubLink, "secondary")}

				{renderSection("educationOffer.header", "educationOffer.body")}

				{/* Footer 컴포넌트 - 일반 페이지 하단 */}
				<CaretFooter />
			</div>
		</div>
	)
}

export default WelcomeView
