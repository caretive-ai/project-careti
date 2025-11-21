// CARET MODIFICATION: Refactored to use caret-main architecture with improved navigation
// Original Cline backed up to: WelcomeView.tsx.cline

// CARET MODIFICATION: Import feature configuration for redirect behavior
// Frontend는 ExtensionState의 featureConfig 사용
import { BooleanRequest } from "@shared/proto/cline/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useState } from "react"
import CaretApiSetup from "@/caret/components/CaretApiSetup"
import CaretFooter from "@/caret/components/CaretFooter"
import CaretWelcomeSection from "@/caret/components/CaretWelcomeSection"
import UnifiedLanguageSetting from "@/caret/components/UnifiedLanguageSetting"
// CARET MODIFICATION: URL 상수 및 UiServiceClient 임포트
import { CARET_URLS } from "@/caret/constants/urls"
import { useCaretState } from "@/caret/context/CaretStateContext"
import { useCaretI18n } from "@/caret/hooks/useCaretI18n"
import { t } from "@/caret/utils/i18n"
import { CaretWebviewLogger } from "@/caret/utils/webview-logger"
import { useExtensionState } from "@/context/ExtensionStateContext"
// CARET MODIFICATION: UiServiceClient 임포트 추가
import { StateServiceClient, UiServiceClient } from "@/services/grpc-client"
import { validateApiConfiguration } from "@/utils/validate"

const logger = new CaretWebviewLogger("WelcomeView")

const WelcomeView = () => {
	const { apiConfiguration, mode, version, caretBanner, featureConfig } = useExtensionState()
	const { setShowPersonaSelector } = useCaretState()
	const { currentLanguage } = useCaretI18n()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	// CARET MODIFICATION: Dynamically check for window.caretBannerImage (similar to PersonaAvatar pattern)
	const [bannerSrc, setBannerSrc] = useState<string>(caretBanner)

	useEffect(() => {
		const checkBannerImage = () => {
			const windowBanner = (window as any).caretBannerImage
			if (windowBanner && windowBanner.startsWith("data:")) {
				setBannerSrc(windowBanner)
			}
		}

		// Check immediately and then periodically
		checkBannerImage()
		const interval = setInterval(checkBannerImage, 500)

		return () => clearInterval(interval)
	}, [])

	// Update when caretBanner from context changes
	useEffect(() => {
		if (caretBanner && caretBanner.startsWith("data:")) {
			setBannerSrc(caretBanner)
		}
	}, [caretBanner])

	const disableLetsGoButton = !!apiErrorMessage

	const handleSubmitApiKey = async () => {
		try {
			// CARET MODIFICATION: API 설정 완료 후 브랜드 설정에 따라 다른 처리

			if (featureConfig?.redirectAfterApiSetup === "persona") {
				// 페르소나 선택 창을 띄움
				setShowPersonaSelector(true)
				// Welcome view를 완료로 표시 (ChatView로 바로 넘어가지 않도록)
				await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))
			} else {
				// 'home' - 바로 ChatView로 이동
				await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))
				// 페르소나 선택을 건너뛰고 바로 메인 화면으로
			}

			// API 설정 페이지 닫기
			setShowApiOptions(false)
		} catch (error) {
			logger.error("Failed to complete welcome view:", error)
		}
	}

	const handleShowApiOptions = async () => {
		setShowApiOptions(true)
	}

	const handleHideApiOptions = () => {
		setShowApiOptions(false)
	}

	// CARET MODIFICATION: UiServiceClient를 사용하여 외부 링크를 새 창에서 열도록 수정
	const handleOpenLink = async (link: string) => {
		try {
			await UiServiceClient.openUrl({ value: link })
		} catch (error) {
			logger.error(`Failed to open external link ${link}:`, error)
		}
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(mode, apiConfiguration))
	}, [apiConfiguration, mode])

	// Helper to render sections consistently
	const renderSection = (
		headerKey: string,
		bodyKey: string,
		buttonTextKey?: string,
		buttonHandler?: () => void,
		buttonAppearance: "primary" | "secondary" = "secondary",
		children?: React.ReactNode,
	) => (
		<CaretWelcomeSection
			allowHtml={true}
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
			headerKey={headerKey}>
			{children}
		</CaretWelcomeSection>
	)

	// API 설정 페이지를 완전히 별도 페이지로 렌더링
	if (showApiOptions) {
		return (
			<div
				className="caret-api-setup-page"
				data-testid="caret-api-setup-page"
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
						disabled={disableLetsGoButton}
						errorMessage={apiErrorMessage || undefined}
						onBack={handleHideApiOptions}
						onSubmit={handleSubmitApiKey}
					/>
				</div>
			</div>
		)
	}

	// 메인 웰컴 페이지
	return (
		<div
			className="caret-welcome"
			data-testid="caret-welcome-view"
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
					{/* CARET MODIFICATION: Use banner from window.caretBannerImage with dynamic check */}
					<img
						alt={t("imageAlt.caretBanner", "common")}
						src={bannerSrc}
						style={{
							width: "100%",
							maxWidth: "300px",
							height: "auto",
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
						{t("coreFeatures.header", "welcome")}
					</h2>
				</div>

				{renderSection("", "coreFeatures.description")}

				{/* 언어 선택과 시작 섹션 */}
				<CaretWelcomeSection allowHtml={true} bodyKey="" headerKey="">
					{/* CARET MODIFICATION: 언어 설정을 일반설정의 선호언어로 연결 */}
					<div style={{ marginBottom: "20px" }}>
						<UnifiedLanguageSetting />
					</div>

					{/* 시작하기 버튼 */}
					<div style={{ textAlign: "center" }}>
						<VSCodeButton
							appearance="primary"
							onClick={handleShowApiOptions}
							style={{
								width: "90%",
								padding: "8px 6px",
								fontSize: "14px",
								fontWeight: "bold",
							}}>
							{t("getStarted.button", "welcome")}
						</VSCodeButton>
					</div>
				</CaretWelcomeSection>

				{/* CARET MODIFICATION: 하드코딩된 URL을 상수로 변경 */}
				{renderSection(
					"community.header",
					"community.body",
					"community.githubLink",
					() => handleOpenLink(CARET_URLS.GITHUB_REPOSITORY),
					"secondary",
				)}

				{/* Footer 컴포넌트 */}
				<CaretFooter />
			</div>
		</div>
	)
}

export default WelcomeView
