import { VSCodeButton, VSCodeDivider, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { vscode } from "@/utils/vscode"
import VSCodeButtonLink from "../../components/common/VSCodeButtonLink"
import CountUp from "react-countup"
import CreditsHistoryTable from "../../components/account/CreditsHistoryTable"
import { UsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
import { useExtensionState, ExtensionStateContextType } from "@/context/ExtensionStateContext" // CARET MODIFICATION: ExtensionStateContextType 임포트 추가
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/cline/common"
import WebviewLogger from "@/caret/utils/webview-logger"
import { t, getLink } from "@/caret/utils/i18n" // CARET MODIFICATION: getLink 함수 임포트
import { getUrl } from "@/caret/constants/urls"

const logger = new WebviewLogger("[CARET-UI-ACCOUNT-VIEW]")

export const CaretAccountView = () => {
	const { userInfo, apiConfiguration, personaProfile, plan, isPayAsYouGo } = useExtensionState() as ExtensionStateContextType // CARET MODIFICATION: personaProfile 추가 및 타입 명시

	let user = apiConfiguration?.caretApiKey ? userInfo : undefined

	const [balance, setBalance] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [usageData, setUsageData] = useState<UsageTransaction[]>([])
	const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])

	// Listen for balance and transaction data updates from the extension
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "userCreditsBalance" && message.userCreditsBalance) {
				setBalance(message.userCreditsBalance.currentBalance)
				logger.debug("Balance updated", { balance: message.userCreditsBalance.currentBalance })
			} else if (message.type === "userCreditsUsage" && message.userCreditsUsage) {
				setUsageData(message.userCreditsUsage.usageTransactions)
				logger.debug("Usage data updated", { count: message.userCreditsUsage.usageTransactions.length })
			} else if (message.type === "userCreditsPayments" && message.userCreditsPayments) {
				setPaymentsData(message.userCreditsPayments.paymentTransactions)
				logger.debug("Payments data updated", { count: message.userCreditsPayments.paymentTransactions.length })
			}
			setIsLoading(false)
		}

		window.addEventListener("message", handleMessage)

		// Fetch all account data when component mounts
		if (user) {
			setIsLoading(true)
			logger.info("Fetching user credits data for logged in user")
			vscode.postMessage({ type: "fetchUserCreditsData" })
		}

		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [user])

	const handleLogin = () => {
		logger.info("User clicked Caret sign up button")
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) => {
			logger.error("Failed to get login URL:", err)
			console.error("Failed to get login URL:", err)
		})
	}

	const handleLogout = () => {
		logger.info("User clicked logout button")
		// Use gRPC client to notify extension to clear API keys and state
		AccountServiceClient.accountLogoutClicked(EmptyRequest.create()).catch((err) => {
			logger.error("Failed to logout:", err)
			console.error("Failed to logout:", err)
		})
	}

	return (
		<div className="h-full flex flex-col">
			{user ? (
				<div className="flex flex-col pr-3 h-full">
					<div className="flex flex-col w-full">
						<div className="flex items-center mb-6 flex-wrap gap-y-4">
									{user.photoUrl ? (
			<img src={user.photoUrl} alt="Profile" className="size-16 rounded-full mr-4" />
							) : (
								<div className="size-16 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-2xl text-[var(--vscode-button-foreground)] mr-4">
									{user.displayName?.[0] || user.email?.[0] || "?"}
								</div>
							)}

							<div className="flex flex-col">
								{user.displayName && (
									<h2 className="text-[var(--vscode-foreground)] m-0 mb-1 text-lg font-medium">
										{user.displayName}
									</h2>
								)}

								{user.email && (
									<div className="text-sm text-[var(--vscode-descriptionForeground)]">{user.email}</div>
								)}
							</div>
						</div>
					</div>

					{/* CARET MODIFICATION: Display account plan and pay-as-you-go option */}
					{plan && (
						<div className="flex items-center mt-4">
							<span className="text-sm text-[var(--vscode-descriptionForeground)] mr-2">
								{t("account.plan", "common")}:
							</span>
							<span className="text-sm text-[var(--vscode-foreground)] font-medium">
								{t(`account.plan${plan}`, "common")}
							</span>
						</div>
					)}

					{typeof isPayAsYouGo === "boolean" && (
						<div className="flex items-center mt-2">
							<input type="checkbox" id="payAsYouGo" checked={isPayAsYouGo} readOnly className="mr-2" />
							<label htmlFor="payAsYouGo" className="text-sm text-[var(--vscode-foreground)]">
								{t("account.payAsYouGo", "common")}
							</label>
							<span className="text-xs text-[var(--vscode-descriptionForeground)] ml-2">
								{t("account.payAsYouGoDescription", "common")}
							</span>
						</div>
					)}

					<div className="w-full flex gap-2 flex-col min-[225px]:flex-row">
						<div className="w-full min-[225px]:w-1/2">
							<VSCodeButtonLink href={getUrl("CARET_APP_CREDITS")} appearance="primary" className="w-full">
								{t("account.dashboard", "common")}
							</VSCodeButtonLink>
						</div>
						<VSCodeButton appearance="secondary" onClick={handleLogout} className="w-full min-[225px]:w-1/2">
							{t("account.logOut", "common")}
						</VSCodeButton>
					</div>

					<VSCodeDivider className="w-full my-6" />

					<div className="w-full flex flex-col items-center">
						<div className="text-sm text-[var(--vscode-descriptionForeground)] mb-3">
							{t("account.currentBalance", "common").toUpperCase()}
						</div>

						<div className="text-4xl font-bold text-[var(--vscode-foreground)] mb-6 flex items-center gap-2">
							{isLoading ? (
								<div className="text-[var(--vscode-descriptionForeground)]">{t("account.loading", "common")}</div>
							) : (
								<>
									<span>$</span>
									<CountUp end={balance} duration={0.66} decimals={2} />
									<VSCodeButton
										appearance="icon"
										className="mt-1"
										onClick={() => {
											logger.debug("User clicked refresh balance button")
											vscode.postMessage({ type: "fetchUserCreditsData" })
										}}>
										<span className="codicon codicon-refresh"></span>
									</VSCodeButton>
								</>
							)}
						</div>

						<div className="w-full">
							<VSCodeButtonLink href={getUrl("CARET_APP_CREDITS_BUY")} className="w-full">
								{t("account.addCredits", "common")}
							</VSCodeButtonLink>
						</div>
					</div>

					<VSCodeDivider className="mt-6 mb-3 w-full" />

					<div className="flex-grow flex flex-col min-h-0 pb-[0px]">
						<CreditsHistoryTable isLoading={isLoading} usageData={usageData} paymentsData={paymentsData} />
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center pr-3">
					{/* CARET MODIFICATION: personaProfile 이미지로 변경 */}
					<img src={personaProfile} alt="Caret" className="size-16 mb-4" />

					<p style={{}}>{t("account.signUpDescription", "common")}</p>

					<VSCodeButton onClick={handleLogin} className="w-full mb-4">
						{t("account.signUpWithCaret", "common")}
					</VSCodeButton>

					<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
						{t("account.byContining", "common")} {/* CARET MODIFICATION: 풋터와 동일한 약관 링크 사용 */}
						<VSCodeLink href={getLink("CARETIVE_TERMS")}>{t("account.termsOfService", "common")}</VSCodeLink>{" "}
						{t("common.and", "common")}{" "}
						<VSCodeLink href={getLink("CARETIVE_PRIVACY")}>{t("account.privacyPolicy", "common")}</VSCodeLink>.
					</p>
				</div>
			)}
		</div>
	)
}
