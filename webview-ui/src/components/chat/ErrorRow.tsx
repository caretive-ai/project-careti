import { ClineMessage } from "@shared/ExtensionMessage"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import { getBrandIgnoreFileName, getBrandInfo } from "@/careti/utils/brand-utils"
import { t } from "@/careti/utils/i18n"
import CreditLimitError from "@/components/chat/CreditLimitError"
import { handleSignIn, useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ClineError, ClineErrorType } from "../../../../src/services/error/ClineError"
import { handleLogin as handleCaretLogin } from "../settings/CaretiAuthHandler"
import { normalizeApiConfiguration } from "../settings/utils/providerUtils"

// CARETI MODIFICATION: Type for auth_required error from image tools
interface AuthRequiredError {
	type: "auth_required"
	action: string
	toolName: string
	brandName: string
}

// Helper to build i18n auth required message
const buildAuthRequiredMessage = (authError: AuthRequiredError): string => {
	const brandInfo = getBrandInfo()
	const brandName = brandInfo.displayName
	const lines = [
		t("imageTools.loginRequired.title", "chat", { action: authError.action, brandName }),
		"",
		t("imageTools.loginRequired.toUseFeature", "chat"),
		t("imageTools.loginRequired.loginStep", "chat", { brandName }),
		"",
		t("imageTools.loginRequired.toDisableTool", "chat"),
		t("imageTools.loginRequired.disableStep", "chat", { toolName: authError.toolName }),
	]
	return lines.join("\n")
}

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
		if (selectedProvider === "careti") {
			return (
				<VSCodeButton className="w-full mb-4" onClick={handleCaretLogin}>
					{t("providers.careti.login", "settings")}
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
					// CARETI MODIFICATION: Safely parse JSON error message, handle non-JSON strings gracefully
					let caretError: { type?: string; action?: string; toolName?: string; brandName?: string } | null = null
					try {
						caretError = JSON.parse(apiRequestFailedMessage || apiReqStreamingFailedMessage || "{}") // careti specific error
					} catch {
						// Not a JSON string, ignore parsing error
						caretError = null
					}

					// CARETI MODIFICATION: Handle auth_required type with i18n
					if (caretError?.type === "auth_required") {
						const authError = caretError as AuthRequiredError
						const translatedMessage = buildAuthRequiredMessage(authError)
						return (
							<>
								<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
									{translatedMessage}
								</p>
								<br />
								{renderProviderLoginCTA()}
							</>
						)
					}

					const clineErrorMessage =
						caretError?.type === "budget_exceeded" ? t("errorRow.budgetExceeded", "chat") : clineError?.message // careti language error message
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
									{selectedProvider === "careti" || (clineUser && selectedProvider === "cline") ? (
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
				// CARETI MODIFICATION: Show .caretignore as primary ignore file (legacy .clineignore supported)
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
