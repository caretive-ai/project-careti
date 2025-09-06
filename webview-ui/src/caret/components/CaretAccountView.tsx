// CARET MODIFICATION: Caret Account View component - replacement for ClineAccountView
// Now uses actual gRPC communication with Extension instead of Mock API

import * as proto from "@shared/proto/index"
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react"
import { memo, useCallback, useEffect, useState } from "react"
import { useInterval } from "react-use"
import { caretWebviewLogger } from "@/caret/utils/CaretWebviewLogger"
import { t } from "@/caret/utils/i18n"
import { type CaretUser } from "@/context/ExtensionStateContext"
// CARET MODIFICATION: Use actual gRPC client instead of Mock API
import { CaretAccountServiceClient } from "@/services/grpc-client"
import VSCodeButtonLink from "../../components/common/VSCodeButtonLink"

type CaretAccountViewProps = {
	caretUser: CaretUser
}

const CaretAccountView = memo(({ caretUser }: CaretAccountViewProps) => {
	const { uid, email, displayName } = caretUser

	// State for account data using proto types
	const [creditsData, setCreditsData] = useState<proto.caret.CaretUserCreditsData | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now())
	const [error, setError] = useState<string | null>(null)

	const fetchCaretCredit = useCallback(async () => {
		caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] 🚀 Starting gRPC fetchCaretCredit for user:" + uid)
		caretWebviewLogger.debug("[CARET-ACCOUNT-VIEW] 📊 Current state", { isLoading, hasCreditsData: !!creditsData })

		try {
			setIsLoading(true)
			setError(null)
			caretWebviewLogger.debug("[CARET-ACCOUNT-VIEW] 🔄 Set loading state to true")

			// CARET MODIFICATION: Use gRPC client to call Extension
			caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] 📡 Calling CaretAccountServiceClient.getCaretUserCredits()")
			const request: proto.cline.EmptyRequest = { metadata: undefined }
			const creditsResponse = await CaretAccountServiceClient.getCaretUserCredits(request)

			caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] ✅ gRPC Credits data received", {
				balance: creditsResponse.balance?.currentBalance,
				usageTransactions: creditsResponse.usageTransactions?.length || 0,
				paymentTransactions: creditsResponse.paymentTransactions?.length || 0,
			})

			setCreditsData(creditsResponse)

			const now = Date.now()
			setLastFetchTime(now)
			caretWebviewLogger.debug("[CARET-ACCOUNT-VIEW] ⏰ Updated lastFetchTime:", new Date(now).toISOString())
		} catch (error: any) {
			caretWebviewLogger.error("[CARET-ACCOUNT-VIEW] ❌ gRPC Error in fetchCaretCredit:", error)
			setError(error.message || "Failed to fetch account data via gRPC")
			caretWebviewLogger.error(t("account.failedToFetchUserCredit", "common"), error)
		} finally {
			setIsLoading(false)
			caretWebviewLogger.debug("[CARET-ACCOUNT-VIEW] 🔄 Set loading state to false")
		}
	}, [uid, isLoading, creditsData])

	// Fetch balance every 60 seconds
	useInterval(() => {
		fetchCaretCredit()
	}, 60000)

	// Fetch balance on mount
	useEffect(() => {
		caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] 🎯 Component mounted, fetching initial data via gRPC")
		fetchCaretCredit()
	}, [fetchCaretCredit])

	const handleLogout = useCallback(async () => {
		caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] 🚪 User logout requested via gRPC")
		try {
			// CARET MODIFICATION: Call gRPC logout
			const request: proto.cline.EmptyRequest = { metadata: undefined }
			await CaretAccountServiceClient.caretAccountLogoutClicked(request)

			setCreditsData(null)
			caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] ✅ gRPC logout successful")
		} catch (error) {
			caretWebviewLogger.error("[CARET-ACCOUNT-VIEW] ❌ gRPC logout failed:", error)
		}
	}, [])

	// Log render state
	console.log("[CARET-ACCOUNT-VIEW] 🎨 Rendering with gRPC state:", {
		user: { uid, email, displayName },
		balance: creditsData?.balance?.currentBalance,
		usageEntries: creditsData?.usageTransactions?.length || 0,
		paymentEntries: creditsData?.paymentTransactions?.length || 0,
		isLoading,
		error,
		lastUpdate: new Date(lastFetchTime).toLocaleTimeString(),
	})

	return (
		<div className="max-w-lg mx-auto p-4">
			<div className="text-xl font-semibold mb-4 text-center text-[var(--vscode-foreground)]">
				{t("account.manageAccount", "common")}
			</div>

			<div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)] rounded-lg p-4 mb-4">
				<div className="text-lg font-medium mb-2 text-[var(--vscode-foreground)]">
					{t("account.accountInformation", "common")}
				</div>
				<div className="space-y-1">
					<div className="text-[var(--vscode-foreground)]">
						<span className="text-[var(--vscode-descriptionForeground)]">{t("account.email", "common")}: </span>
						{email || uid}
					</div>
					{displayName && (
						<div className="text-[var(--vscode-foreground)]">
							<span className="text-[var(--vscode-descriptionForeground)]">
								{t("account.displayName", "common")}:{" "}
							</span>
							{displayName}
						</div>
					)}
				</div>
			</div>

			<div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)] rounded-lg p-4 mb-4">
				<div className="text-lg font-medium mb-2 text-[var(--vscode-foreground)]">
					{t("account.currentBalance", "common")}
				</div>
				<div className="flex items-center space-x-2">
					{isLoading ? (
						<div className="text-[var(--vscode-descriptionForeground)]">Loading via gRPC...</div>
					) : error ? (
						<div className="text-[var(--vscode-errorForeground)]">{error}</div>
					) : (
						<>
							<div className="text-lg font-medium text-[var(--vscode-foreground)]">
								${creditsData?.balance?.currentBalance?.toFixed(2) || "0.00"}
							</div>
							{creditsData?.balance?.currency && creditsData.balance.currency !== "USD" && (
								<div className="text-xs text-[var(--vscode-descriptionForeground)]">
									{creditsData.balance.currency}
								</div>
							)}
						</>
					)}
				</div>
				<div className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
					{t("account.lastUpdated", "common")}: {new Date(lastFetchTime).toLocaleTimeString()}
					{creditsData?.balance?.lastUpdated && (
						<span> (Server: {new Date(creditsData.balance.lastUpdated).toLocaleTimeString()})</span>
					)}
				</div>
			</div>

			{/* Usage History */}
			<div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)] rounded-lg p-4 mb-4">
				<div className="text-lg font-medium mb-2 text-[var(--vscode-foreground)]">
					{t("account.usageHistory", "common")}
				</div>
				{isLoading ? (
					<div className="text-[var(--vscode-descriptionForeground)]">Loading usage history via gRPC...</div>
				) : error ? (
					<div className="text-[var(--vscode-errorForeground)]">Failed to load usage history</div>
				) : !creditsData?.usageTransactions || creditsData.usageTransactions.length === 0 ? (
					<div className="text-[var(--vscode-descriptionForeground)]">No usage data available</div>
				) : (
					<div className="space-y-2 max-h-60 overflow-y-auto">
						{creditsData.usageTransactions.slice(0, 10).map((usage, index) => (
							<div className="border border-[var(--vscode-panel-border)] rounded p-2" key={usage.id || index}>
								<div className="flex justify-between">
									<span className="text-[var(--vscode-foreground)] font-medium">
										{usage.model || usage.aiModelName || "Unknown Model"}
									</span>
									<span className="text-[var(--vscode-foreground)] font-medium">
										${usage.totalCost?.toFixed(4) || usage.costUsd?.toFixed(4) || "0.0000"}
									</span>
								</div>
								<div className="flex justify-between text-[var(--vscode-descriptionForeground)]">
									<span>
										{usage.promptTokens}+{usage.completionTokens}
										{usage.cachedTokens && usage.cachedTokens > 0 && `+${usage.cachedTokens}cached`} tokens
									</span>
									<span>{new Date(usage.timestamp || usage.createdAt).toLocaleString()}</span>
								</div>
								{usage.taskId && (
									<div className="text-[var(--vscode-descriptionForeground)] mt-1">Task: {usage.taskId}</div>
								)}
							</div>
						))}
						{creditsData.usageTransactions.length > 10 && (
							<div className="text-[var(--vscode-descriptionForeground)] text-center">
								... and {creditsData.usageTransactions.length - 10} more entries
							</div>
						)}
					</div>
				)}
			</div>

			{/* Payment History */}
			{creditsData?.paymentTransactions && creditsData.paymentTransactions.length > 0 && (
				<div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)] rounded-lg p-4 mb-4">
					<div className="text-lg font-medium mb-2 text-[var(--vscode-foreground)]">Payment History</div>
					<div className="space-y-2 max-h-40 overflow-y-auto">
						{creditsData.paymentTransactions.slice(0, 5).map((payment, index) => (
							<div
								className="border border-[var(--vscode-panel-border)] rounded p-2"
								key={payment.transactionId || index}>
								<div className="flex justify-between">
									<span className="text-[var(--vscode-foreground)]">
										${(payment.amountCents / 100).toFixed(2)} {payment.currency || "USD"}
									</span>
									<span className="text-[var(--vscode-foreground)]">{payment.credits} credits</span>
								</div>
								<div className="text-[var(--vscode-descriptionForeground)] text-sm">
									{new Date(payment.paidAt).toLocaleString()}
									{payment.paymentMethod && ` • ${payment.paymentMethod}`}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="space-y-3">
				<VSCodeButtonLink appearance="primary" className="w-full" href="https://caret.team/dashboard">
					{t("account.viewDashboard", "common")}
				</VSCodeButtonLink>

				<VSCodeButton appearance="secondary" className="w-full" onClick={handleLogout}>
					{t("account.logout", "common")}
				</VSCodeButton>
			</div>

			<VSCodeDivider className="my-4" />

			{/* Debug Information */}
			<div className="text-xs text-[var(--vscode-descriptionForeground)]">
				<div>gRPC Debug Info:</div>
				<div>User ID: {uid}</div>
				<div>Last Fetch: {new Date(lastFetchTime).toISOString()}</div>
				<div>Usage Entries: {creditsData?.usageTransactions?.length || 0}</div>
				<div>Payment Entries: {creditsData?.paymentTransactions?.length || 0}</div>
				<div>Status: {isLoading ? "Loading via gRPC..." : error ? `gRPC Error: ${error}` : "Ready"}</div>
			</div>
		</div>
	)
})

CaretAccountView.displayName = "CaretAccountView"

export default CaretAccountView
