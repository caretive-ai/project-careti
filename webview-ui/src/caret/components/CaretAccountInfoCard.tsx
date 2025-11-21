// CARET MODIFICATION: Caret Account Info Card - for Settings integration
// Shows Caret account status in Settings page

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"

type CaretAccountInfoCardProps = {
	onViewAccount?: () => void
}

export const CaretAccountInfoCard = ({ onViewAccount }: CaretAccountInfoCardProps) => {
	const { caretUser } = useExtensionState()
	const [isLoading, setIsLoading] = useState(false)
	const [balance, setBalance] = useState<number | null>(null)

	const fetchBalance = useCallback(async () => {
		if (!caretUser?.id) {
			return
		}

		try {
			setIsLoading(true)
			// TODO: Implement actual Caret API call for balance
			// Placeholder implementation
			console.log("[CARET-ACCOUNT-CARD] Fetching balance for:", caretUser.id)

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500))
			setBalance(100.0) // Placeholder
		} catch (error) {
			console.error("Failed to fetch Caret balance:", error)
		} finally {
			setIsLoading(false)
		}
	}, [caretUser?.id])

	useEffect(() => {
		if (caretUser?.id) {
			fetchBalance()
		}
	}, [caretUser?.id, fetchBalance])

	if (!caretUser?.id) {
		return null // Don't show card if no Caret user
	}

	return (
		<div className="border border-[var(--vscode-widget-border)] rounded-md p-4 bg-[var(--vscode-editor-background)]">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-lg text-[var(--vscode-button-foreground)]">
						{caretUser.displayName?.[0] || caretUser.email?.[0] || "C"}
					</div>
					<div className="flex flex-col">
						<div className="text-sm font-medium text-[var(--vscode-foreground)]">
							{caretUser.displayName || caretUser.email}
						</div>
						<div className="text-xs text-[var(--vscode-descriptionForeground)]">
							{t("providers.caret.name", "settings")}
						</div>
					</div>
				</div>

				{onViewAccount && (
					<VSCodeButton appearance="secondary" onClick={onViewAccount}>
						{t("account.viewAccount", "common")}
					</VSCodeButton>
				)}
			</div>

			<div className="flex items-center justify-between text-sm">
				<span className="text-[var(--vscode-descriptionForeground)]">{t("account.creditBalance", "common")}:</span>
				<span className="font-medium text-[var(--vscode-foreground)]">
					{isLoading ? (
						<span className="text-[var(--vscode-descriptionForeground)]">...</span>
					) : (
						`$${balance?.toFixed(2) || "0.00"}`
					)}
				</span>
			</div>

			{caretUser.email && (
				<div className="text-xs text-[var(--vscode-descriptionForeground)] mt-2 truncate">{caretUser.email}</div>
			)}
		</div>
	)
}

export default CaretAccountInfoCard
