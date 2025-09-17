// CARET MODIFICATION: Refactored to use caret-main architecture with improved navigation
// Original Cline backed up to: WelcomeView.tsx.cline

import { BooleanRequest } from "@shared/proto/cline/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useState } from "react"
import CaretApiSetup from "@/caret/components/CaretApiSetup"
import CaretFooter from "@/caret/components/CaretFooter"
import CaretWelcomeSection from "@/caret/components/CaretWelcomeSection"
import { useCaretI18n } from "@/caret/hooks/useCaretI18n"
import { t } from "@/caret/utils/i18n"
import PreferredLanguageSetting from "@/components/settings/PreferredLanguageSetting"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { validateApiConfiguration } from "@/utils/validate"

const WelcomeView = () => {
	const { apiConfiguration, mode, version, caretBanner } = useExtensionState()
	const { currentLanguage } = useCaretI18n()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = !!apiErrorMessage

	const handleSubmitApiKey = async () => {
		try {
			// CARET MODIFICATION: API 설정 완료 후 History/Home으로 이동 (Cline의 Settings 페이지 대신)
			console.log("[WelcomeView] API configuration saved, completing welcome flow")

			// Welcome view를 완료로 표시
			await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))

			// API 설정 페이지 닫기
			setShowApiOptions(false)

			console.log("[WelcomeView] Welcome view completed, user will see History/Home")
		} catch (error) {
			console.error("Failed to complete welcome view:", error)
		}
	}

	const handleShowApiOptions = async () => {
		console.log("[WelcomeView] Starting API setup")
		setShowApiOptions(true)
	}

	const handleHideApiOptions = () => {
		setShowApiOptions(false)
	}

	const handleOpenLink = (link: string) => {
		console.log(`Opening external link: ${link}`)
		// TODO: Implement proper external link opening
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
					{/* CARET MODIFICATION: Use persona profile image from CaretProviderWrapper */}
					<img
						alt={t("imageAlt.caretBanner", "common")}
						src={caretBanner}
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
						<PreferredLanguageSetting />
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

				{renderSection(
					"community.header",
					"community.body",
					"community.githubLink",
					() => handleOpenLink("https://github.com/aicoding-caret/caret"),
					"secondary",
				)}

				{/* Footer 컴포넌트 */}
				<CaretFooter />
			</div>
		</div>
	)
}

export default WelcomeView
