import React from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { t } from "../utils/i18n"
import { caretWebviewLogger } from "../utils/webview-logger"
import CaretFooter from "./CaretFooter"
import { useExtensionState } from "../../context/ExtensionStateContext"
import "../styles/CaretWelcome.css"

interface CaretWelcomeProps {
	onGetStarted?: () => void
}

const CaretWelcome: React.FC<CaretWelcomeProps> = ({ onGetStarted }) => {
	const { caretBanner } = useExtensionState()
	const handleGetStarted = () => {
		caretWebviewLogger.info("Caret Welcome: Get Started clicked")
		caretWebviewLogger.info("[CARET-INFO] [UI] 웰컴 페이지에서 '시작하기' 버튼이 클릭되었습니다")
		if (onGetStarted) {
			onGetStarted()
		}
	}

	return (
		<div className="caret-welcome">
			<div className="caret-welcome-container">
				{/* 메인 배너 */}
				<div className="caret-banner">
					<img src={caretBanner} alt={t("bannerAlt", "welcome")} className="caret-banner-image" />
				</div>

				{/* Caret 로고 및 브랜딩 */}
				<div className="caret-header">
					<p className="caret-subtitle">{t("greeting", "welcome")}</p>
					<p className="caret-description">{t("catchPhrase", "welcome")}</p>
				</div>

				{/* 핵심 기능 소개 */}
				<div className="caret-features">
					<h2>{t("coreFeatures.header", "welcome")}</h2>
					<p dangerouslySetInnerHTML={{ __html: t("coreFeatures.description", "welcome") }} />
				</div>

				{/* 모델 유연성 */}
				<div className="caret-flexibility">
					<h2>{t("modelFlexibility.header", "welcome")}</h2>
					<p dangerouslySetInnerHTML={{ __html: t("modelFlexibility.body", "welcome") }} />
				</div>

				{/* Caret 계정 서비스 */}
				<div className="caret-account">
					<h2>{t("caretAccount.header", "welcome")}</h2>
					<p>{t("caretAccount.body", "welcome")}</p>
				</div>

				{/* 교육 프로그램 & Google Gemini 통합 제안 - 맨 뒤로 이동 */}
				<div className="caret-education">
					<h2>{t("educationOffer.header", "welcome")}</h2>
					<p dangerouslySetInnerHTML={{ __html: t("educationOffer.body", "welcome") }} />
				</div>

				{/* 시작하기 버튼 */}
				<div className="caret-actions">
					<VSCodeButton onClick={handleGetStarted} appearance="primary">
						{t("getStarted.button", "welcome")}
					</VSCodeButton>
				</div>
			</div>

			{/* Footer 컴포넌트 */}
			<CaretFooter />
		</div>
	)
}

export default CaretWelcome
