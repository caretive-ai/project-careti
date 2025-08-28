// CARET MODIFICATION: CreditLimitError wrapper with i18n support
// This component wraps the original CreditLimitError and adds internationalization
import React from "react"
import VSCodeButtonLink from "@/components/common/VSCodeButtonLink"
import { TaskServiceClient } from "@/services/grpc-client"
import { AskResponseRequest } from "@shared/proto/cline/task"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useClineAuth } from "@/context/ClineAuthContext"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"

interface CreditLimitErrorWrapperProps {
	currentBalance: number
	totalSpent?: number
	totalPromotions?: number
	message?: string
}

const CreditLimitErrorWrapper: React.FC<CreditLimitErrorWrapperProps> = ({
	currentBalance = 0,
	totalSpent = 0,
	totalPromotions = 0,
	message,
}) => {
	const { uriScheme } = useExtensionState()
	const { activeOrganization } = useClineAuth()
	const { currentLanguage } = useCaretI18n()

	// Use i18n message with fallback to prop
	const errorMessage = message ?? t("error.creditLimit.message", "common")

	const isPersonal = !activeOrganization?.organizationId
	const buyCreditsUrl = isPersonal
		? "https://app.cline.bot/dashboard/account?tab=credits&redirect=true"
		: "https://app.cline.bot/dashboard/organization?tab=credits&redirect=true"

	const callbackUrl = `${uriScheme || "vscode"}://saoudrizwan.claude-dev`
	const fullPurchaseUrl = new URL(buyCreditsUrl)
	fullPurchaseUrl.searchParams.set("callback_url", callbackUrl)

	return (
		<div className="p-2 border-none rounded-md mb-2 bg-[var(--vscode-textBlockQuote-background)]">
			<div className="mb-3 font-azeret-mono">
				<div style={{ color: "var(--vscode-errorForeground)", marginBottom: "8px" }}>{errorMessage}</div>
			</div>

			<VSCodeButtonLink
				href={fullPurchaseUrl.toString()}
				style={{
					width: "100%",
					marginBottom: "8px",
				}}>
				<span className="codicon codicon-credit-card mr-[6px] text-[14px]" />
				{t("error.creditLimit.buyCredits", "common")}
			</VSCodeButtonLink>

			<VSCodeButton
				onClick={async () => {
					try {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "yesButtonClicked",
								text: "",
								images: [],
							}),
						)
					} catch (error) {
						console.error("Error invoking action:", error)
					}
				}}
				appearance="secondary"
				style={{
					width: "100%",
				}}>
				<span className="codicon codicon-refresh" style={{ fontSize: "14px", marginRight: "6px" }} />
				{t("error.creditLimit.retryRequest", "common")}
			</VSCodeButton>
		</div>
	)
}

export default CreditLimitErrorWrapper
