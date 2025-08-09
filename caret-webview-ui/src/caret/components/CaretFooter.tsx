import React from "react"
import { t, getGlobalLink, getLink } from "../utils/i18n"
import { useExtensionState } from "../../context/ExtensionStateContext"

const CaretFooter: React.FC = () => {
	const { version } = useExtensionState()

	const rawVersionText = t("footer.copyright.version", "welcome")
	const dynamicVersionText = version
		? rawVersionText.replace(/v[0-9A-Za-z.-]+/, `v${version}`)
		: rawVersionText

	return (
		<footer className="caret-footer">
			<div className="caret-footer-container">
				{/* 회사 정보 */}
				<div className="caret-footer-company-info">
					<p className="caret-footer-company-name">
						<strong>{t("footer.company.name", "welcome")}</strong>
					</p>
					<p className="caret-footer-business-info">{t("footer.company.businessNumber", "welcome")}</p>
					<p className="caret-footer-address">{t("footer.company.address", "welcome")}</p>
				</div>

				{/* 링크들을 가로로 배치 */}
				<div className="caret-footer-links-horizontal">
					<a
						href={getGlobalLink("CARET_GITHUB")}
						target="_blank"
						rel="noopener noreferrer"
						className="caret-footer-link">
						{t("footer.links.caretGithub", "welcome")}
					</a>
					<span className="caret-footer-separator"> • </span>
					<a
						href={getGlobalLink("CARET_SERVICE")}
						target="_blank"
						rel="noopener noreferrer"
						className="caret-footer-link">
						{t("footer.links.caretService", "welcome")}
					</a>
					<span className="caret-footer-separator"> • </span>
					<a
						href={getGlobalLink("CARETIVE_COMPANY")}
						target="_blank"
						rel="noopener noreferrer"
						className="caret-footer-link">
						{t("footer.links.caretiveInc", "welcome")}
					</a>
					<span className="caret-footer-separator"> • </span>
					<a
						href={getLink("CARETIVE_TERMS")}
						target="_blank"
						rel="noopener noreferrer"
						className="caret-footer-link">
						{t("footer.links.terms", "welcome")}
					</a>
					<span className="caret-footer-separator"> • </span>
					<a
						href={getLink("CARETIVE_PRIVACY")}
						target="_blank"
						rel="noopener noreferrer"
						className="caret-footer-link">
						{t("footer.links.privacy", "welcome")}
					</a>
				</div>

				<div className="caret-footer-links-horizontal">
					{/* CARET MODIFICATION: 고객센터 링크를 mailto로 변경 */}
					<a
						href="mailto:support@caretive.ai"
						target="_blank"
						rel="noopener noreferrer"
						className="caret-footer-link">
						{t("footer.links.support", "welcome")}
					</a>
					<span className="caret-footer-separator"> • </span>					
				</div>

				{/* 저작권 정보 */}
				<div className="caret-footer-copyright">
					<p>{t("footer.copyright.builtWith", "welcome")}</p>
					<p className="caret-footer-version">
						<small>{dynamicVersionText}</small>
					</p>
				</div>
			</div>
		</footer>
	)
}

export default CaretFooter
