import { ClineMessage } from "@shared/ExtensionMessage"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import { t } from "@/caret/utils/i18n"
import CreditLimitError from "@/components/chat/CreditLimitError"
import { handleSignIn, useClineAuth } from "@/context/ClineAuthContext"
import { ClineError, ClineErrorType } from "../../../../src/services/error/ClineError"

const _errorColor = "var(--vscode-errorForeground)"

interface ErrorRowProps {
	message: ClineMessage
	errorType: "error" | "mistake_limit_reached" | "auto_approval_max_req_reached" | "diff_error" | "clineignore_error"
	apiRequestFailedMessage?: string
	apiReqStreamingFailedMessage?: string
}

const ErrorRow = memo(({ message, errorType, apiRequestFailedMessage, apiReqStreamingFailedMessage }: ErrorRowProps) => {
	const { clineUser } = useClineAuth()

	const renderErrorContent = () => {
		switch (errorType) {
			case "error":
			case "mistake_limit_reached":
			case "auto_approval_max_req_reached":
				// Handle API request errors with special error parsing
				if (apiRequestFailedMessage || apiReqStreamingFailedMessage) {
					// FIXME: ClineError parsing should not be applied to non-Cline providers, but it seems we're using clineErrorMessage below in the default error display
					const clineError = ClineError.parse(apiRequestFailedMessage || apiReqStreamingFailedMessage)
					const clineErrorMessage = clineError?.message
					const requestId = clineError?._error?.request_id
					const isClineProvider = clineError?.providerId === "cline" // FIXME: since we are modifying backend to return generic error, we need to make sure we're not expecting providerId here

					if (clineError) {
						if (clineError.isErrorType(ClineErrorType.Balance)) {
							const errorDetails = clineError._error?.details
							return (
								<CreditLimitError
									currentBalance={errorDetails?.current_balance}
									message={errorDetails?.message}
									totalPromotions={errorDetails?.total_promotions}
									totalSpent={errorDetails?.total_spent}
									// buyCreditsUrl={errorDetails?.buy_credits_url}
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
									{/* The user is signed in or not using cline provider */}
									{clineUser && !isClineProvider ? (
										<span className="mb-4 text-[var(--vscode-descriptionForeground)]">
											{t("errorRow.clickRetryBelow", "chat")}
										</span>
									) : (
										<VSCodeButton className="w-full mb-4" onClick={handleSignIn}>
											{t("errorRow.signInToCline", "chat")}
										</VSCodeButton>
									)}
								</>
							)}
						</p>
					)
				}

				// Regular error message
				return (
					<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">{message.text}</p>
				)

			case "diff_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs opacity-80 bg-[var(--vscode-textBlockQuote-background)] text-[var(--vscode-foreground)]">
						<div>{t("errorRow.diffError", "chat")}</div>
					</div>
				)

			case "clineignore_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs bg-[var(--vscode-textBlockQuote-background)] text-[var(--vscode-foreground)] opacity-80">
						<div>
							{t("errorRow.clineTriedToAccess", "chat")} <code>{message.text}</code>{" "}
							{t("errorRow.isBlockedBy", "chat")} <code>.clineignore</code>
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
