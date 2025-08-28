// CARET MODIFICATION: WelcomeView wrapper with i18n support
// This component wraps the original WelcomeView and adds internationalization
import React, { useEffect, useState, memo } from "react"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import ApiOptions from "@/components/settings/ApiOptions"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import { AccountServiceClient, StateServiceClient } from "@/services/grpc-client"
import { EmptyRequest, BooleanRequest } from "@shared/proto/cline/common"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t, setGlobalUILanguage } from "../utils/i18n"

interface WelcomeViewWrapperProps {
	uiLanguage?: "ko" | "en" | "ja" | "zh"
}

const WelcomeViewWrapper = memo(({ uiLanguage = "en" }: WelcomeViewWrapperProps) => {
	const { apiConfiguration, mode } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	// CARET MODIFICATION: Initialize i18n with provided UI language
	useEffect(() => {
		setGlobalUILanguage(uiLanguage)
	}, [uiLanguage])

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleSubmit = async () => {
		try {
			await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))
		} catch (error) {
			console.error("Failed to update API configuration or complete welcome view:", error)
		}
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(mode, apiConfiguration))
	}, [apiConfiguration, mode])

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto">
				{/* CARET MODIFICATION: Dynamic greeting with i18n */}
				<h2>{t("greeting", "welcome")}</h2>

				<div className="flex justify-center my-5">
					<ClineLogoWhite className="size-16" />
				</div>

				{/* CARET MODIFICATION: Internationalized description */}
				<p>{t("coreFeatures.description", "welcome")}</p>

				<p className="text-[var(--vscode-descriptionForeground)]">{t("description", "welcome")}</p>

				{/* CARET MODIFICATION: Internationalized buttons */}
				<VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					{t("button.freeStart", "common")}
				</VSCodeButton>

				{!showApiOptions && (
					<VSCodeButton
						appearance="secondary"
						onClick={() => setShowApiOptions(!showApiOptions)}
						className="mt-2.5 w-full">
						{t("button.useOwnKey", "common")}
					</VSCodeButton>
				)}

				<div className="mt-4.5">
					{showApiOptions && (
						<div>
							<ApiOptions showModelOptions={false} currentMode={mode} />
							<VSCodeButton onClick={handleSubmit} disabled={disableLetsGoButton} className="mt-0.75">
								{t("button.letsGo", "common")}
							</VSCodeButton>
						</div>
					)}
				</div>

				{/* CARET MODIFICATION: Add community section if available */}
				<div className="mt-8 p-4 bg-[var(--vscode-editor-background)] rounded-lg">
					<h3 className="mb-3 text-[var(--vscode-editor-foreground)]">{t("community.header", "welcome")}</h3>
					<div
						className="text-sm text-[var(--vscode-descriptionForeground)]"
						dangerouslySetInnerHTML={{ __html: t("community.body", "welcome") }}
					/>
					<VSCodeButton
						appearance="secondary"
						className="mt-3"
						onClick={() => window.open("https://github.com/cline/cline", "_blank")}>
						{t("community.githubLink", "welcome")}
					</VSCodeButton>
				</div>

				{/* CARET MODIFICATION: Add education offer section */}
				<div className="mt-6 p-4 bg-[var(--vscode-textBlockQuote-background)] border-l-4 border-[var(--vscode-textBlockQuote-border)] rounded-r-lg">
					<h3 className="mb-3 text-[var(--vscode-editor-foreground)]">{t("educationOffer.header", "welcome")}</h3>
					<div
						className="text-sm text-[var(--vscode-descriptionForeground)]"
						dangerouslySetInnerHTML={{ __html: t("educationOffer.body", "welcome") }}
					/>
				</div>
			</div>
		</div>
	)
})

WelcomeViewWrapper.displayName = "WelcomeViewWrapper"

export default WelcomeViewWrapper
