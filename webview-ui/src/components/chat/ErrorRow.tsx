import { ClineMessage } from "@shared/ExtensionMessage"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import { getBrandIgnoreFileName } from "@/caret/utils/brand-utils"
import { t } from "@/caret/utils/i18n"
import CreditLimitError from "@/components/chat/CreditLimitError"
import { handleSignIn, useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ClineError, ClineErrorType } from "../../../../src/services/error/ClineError"
import { handleLogin as handleCaretLogin } from "../settings/CaretAuthHandler"
import { normalizeApiConfiguration } from "../settings/utils/providerUtils"

const _errorColor = "var(--vscode-errorForeground)"

interface ErrorRowProps {
	message: ClineMessage
	errorType: "error" | "mistake_limit_reached" | "auto_approval_max_req_reached" | "diff_error" | "clineignore_error"
	apiRequestFailedMessage?: string
	apiReqStreamingFailedMessage?: string
}

const ErrorRow = memo(({ message, errorType, apiRequestFailedMessage, apiReqStreamingFailedMessage }: ErrorRowProps) => {
	const { clineUser } = useClineAuth()
	const { apiConfiguration, mode } = useExtensionState()
	const { selectedProvider } = normalizeApiConfiguration(apiConfiguration, mode as any)

	const renderProviderLoginCTA = () => {
		if (selectedProvider === "caret") {
			return (
				<VSCodeButton className="w-full mb-4" onClick={handleCaretLogin}>
					{t("providers.caret.login", "settings")}
				</VSCodeButton>
			)
		}
		if (selectedProvider === "cline" && !clineUser) {
			return (
				<VSCodeButton className="w-full mb-4" onClick={handleSignIn}>
					{t("errorRow.signInToCline", "chat")}
				</VSCodeButton>
			)
		}
		return null
	}

	console.log("message", message)
	console.log("errorType", errorType)
	console.log("apiRequestFailedMessage", apiRequestFailedMessage)
	console.log("apiReqStreamingFailedMessage", apiReqStreamingFailedMessage)

	const renderErrorContent = () => {
		switch (errorType) {
			case "error":
			case "mistake_limit_reached":
			case "auto_approval_max_req_reached": {
				const isAuthErrorMessage = message.text
					? (ClineError.parse(message.text)?.isErrorType(ClineErrorType.Auth) ?? false)
					: false
				// Handle API request errors with special error parsing
				if (apiRequestFailedMessage || apiReqStreamingFailedMessage) {
					// FIXME: ClineError parsing should not be applied to non-Cline providers, but it seems we're using clineErrorMessage below in the default error display
					const clineError = ClineError.parse(apiRequestFailedMessage || apiReqStreamingFailedMessage)
					const caretError = JSON.parse(apiRequestFailedMessage || apiReqStreamingFailedMessage || "{}") // caret specific error
					const clineErrorMessage =
						caretError?.type === "budget_exceeded" ? t("errorRow.budgetExceeded", "chat") : clineError?.message // caret language error message
					const requestId = clineError?._error?.request_id
					const isClineProvider = clineError?.providerId === "cline" // FIXME: since we are modifying backend to return generic error, we need to make sure we're not expecting providerId here

					if (clineError) {
						if (clineError.isErrorType(ClineErrorType.Balance)) {
							const errorDetails = clineError._error?.details
							return (
								<CreditLimitError
									buyCreditsUrl={errorDetails?.buy_credits_url}
									currentBalance={errorDetails?.current_balance}
									message={errorDetails?.message}
									totalPromotions={errorDetails?.total_promotions}
									totalSpent={errorDetails?.total_spent}
								/>
							)
						}
					}

					if (clineError?.isErrorType(ClineErrorType.RateLimit)) {
						return (
							<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
								{clineErrorMessage}
								{requestId && (
									<span className="block">{t("errorRow.requestId", "chat", { requestId: requestId })}</span>
								)}
							</p>
						)
					}

					// Default error display
					return (
						<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
							{clineErrorMessage}
							{requestId && (
								<span className="block">{t("errorRow.requestId", "chat", { requestId: requestId })}</span>
							)}
							{clineErrorMessage?.toLowerCase()?.includes("powershell") && (
								<>
									<br />
									<br />
									{t("errorRow.powershellIssue", "chat")}{" "}
									<a
										className="underline text-inherit"
										href="https://github.com/cline/cline/wiki/TroubleShooting-%E2%80%90-%22PowerShell-is-not-recognized-as-an-internal-or-external-command%22">
										{t("errorRow.troubleshootingGuide", "chat")}
									</a>
									{t("errorRow.period", "chat")}
								</>
							)}
							{clineError?.isErrorType(ClineErrorType.Auth) && (
								<>
									<br />
									<br />
									{/* Provider-specific CTA */}
									{/* Provider-specific CTA fallback */}
									{selectedProvider === "caret" || (clineUser && selectedProvider === "cline") ? (
										<span className="mb-4 text-[var(--vscode-descriptionForeground)]">
											{t("errorRow.clickRetryBelow", "chat")}
										</span>
									) : (
										renderProviderLoginCTA()
									)}
								</>
							)}
						</p>
					)
				}

				// Regular error message
				return (
					<>
						<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
							{message.text}
						</p>
						{isAuthErrorMessage ? renderProviderLoginCTA() : null}
					</>
				)
			}

			case "diff_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs opacity-80 bg-[var(--vscode-textBlockQuote-background)] text-[var(--vscode-foreground)]">
						<div>{t("errorRow.diffError", "chat")}</div>
					</div>
				)

			case "clineignore_error":
				// CARET MODIFICATION: Show .caretignore as primary ignore file (legacy .clineignore supported)
				return (
					<div className="flex flex-col p-2 rounded text-xs bg-[var(--vscode-textBlockQuote-background)] text-[var(--vscode-foreground)] opacity-80">
						<div>
							{t("errorRow.clineTriedToAccess", "chat")} <code>{message.text}</code>{" "}
							{t("errorRow.isBlockedBy", "chat")} <code>{getBrandIgnoreFileName()}</code>
							{t("errorRow.file", "chat")}
						</div>
					</div>
				)

			default:
				return null
		}
	}

	// For diff_error and clineignore_error, we don't show the header separately
	if (errorType === "diff_error" || errorType === "clineignore_error") {
		return <>{renderErrorContent()}</>
	}

	// For other error types, show header + content
	return <>{renderErrorContent()}</>
})

export default ErrorRow
