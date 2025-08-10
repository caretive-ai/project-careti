import type { UsageTransaction as ClineAccountUsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
import type { UserOrganization } from "@shared/proto/cline/account"
import {
	VSCodeButton,
	VSCodeDivider,
	VSCodeDropdown,
	VSCodeOption,
	VSCodeTag,
	VSCodeLink,
} from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useInterval } from "react-use"
import VSCodeButtonLink from "../../components/common/VSCodeButtonLink"
import CountUp from "react-countup"
import CreditsHistoryTable from "../../components/account/CreditsHistoryTable"
import { useExtensionState, ExtensionStateContextType } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/cline/common"
import { type ClineUser, handleSignOut } from "@/context/ClineAuthContext"
import { t, getLink } from "@/caret/utils/i18n"
import { getUrl } from "@/caret/constants/urls"
import { convertProtoUsageTransactions, getClineUris, getMainRole } from "../../components/account/helpers"
import WebviewLogger from "@/caret/utils/webview-logger"

const logger = new WebviewLogger("[CARET-UI-ACCOUNT-VIEW]")

// CARET MODIFICATION: Define types similar to Cline but for Caret
type CaretAccountViewProps = {
	clineUser: ClineUser
	userOrganizations: UserOrganization[] | null
	activeOrganization: UserOrganization | null
}

type CachedData = {
	balance: number | null
	usageData: ClineAccountUsageTransaction[]
	paymentsData: PaymentTransaction[]
	lastFetchTime: number
}

// CARET MODIFICATION: Props version - follows Cline pattern exactly
export const CaretAccountView = ({ clineUser, userOrganizations, activeOrganization }: CaretAccountViewProps) => {
	const { email, displayName, uid } = clineUser
	const { personaProfile } = useExtensionState() as ExtensionStateContextType

	// Source of truth: Dedicated state for dropdown value that persists through failures
	const [dropdownValue, setDropdownValue] = useState<string>(activeOrganization?.organizationId || uid)
	const [isLoading, setIsLoading] = useState(false)

	// Cache data per organization/user ID to avoid showing empty state when switching
	const dataCache = useRef<Map<string, CachedData>>(new Map())

	// Current displayed data
	const [balance, setBalance] = useState<number | null>(null)
	const [usageData, setUsageData] = useState<ClineAccountUsageTransaction[]>([])
	const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])
	const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now())

	// Load cached data for current dropdown value
	const loadCachedData = useCallback((id: string) => {
		const cached = dataCache.current.get(id)
		if (cached) {
			setBalance(cached.balance)
			setUsageData(cached.usageData)
			setPaymentsData(cached.paymentsData)
			setLastFetchTime(cached.lastFetchTime)
			return true
		}
		return false
	}, [])

	// Simple cache function without dependencies
	const cacheCurrentData = (id: string) => {
		dataCache.current.set(id, {
			balance,
			usageData,
			paymentsData,
			lastFetchTime,
		})
	}

	// Track if manual fetch is in progress to avoid duplicate fetches
	const manualFetchInProgressRef = useRef<boolean>(false)

	const fetchUserCredit = useCallback(async () => {
		try {
			const response = await AccountServiceClient.getUserCredits(EmptyRequest.create())
			const newBalance = response?.balance?.currentBalance
			// Always update balance, even if it's 0 or null - don't skip undefined
			setBalance(newBalance ?? null)
			const newUsage = convertProtoUsageTransactions(response.usageTransactions)
			setUsageData(newUsage)
			const newPaymentsData = response.paymentTransactions
			setPaymentsData(newPaymentsData)
		} catch (error) {
			logger.error("Failed to fetch user credit:", error)
		}
	}, [])

	const fetchCreditBalance = useCallback(
		async (id: string, skipCache = false) => {
			try {
				if (isLoading) return // Prevent multiple concurrent fetches

				// Load cached data immediately if available (unless skipping cache)
				if (!skipCache && loadCachedData(id)) {
					// If we have cached data, show it first, then fetch in background
				}

				setIsLoading(true)
				if (id === uid) {
					await fetchUserCredit()
				} else {
					const response = await AccountServiceClient.getOrganizationCredits({
						organizationId: id,
					})
					// Update balance - handle all values including 0 and null
					const newBalance = response.balance?.currentBalance
					setBalance(newBalance ?? null)

					const newUsage = convertProtoUsageTransactions(response.usageTransactions)
					setUsageData(newUsage)
				}

				// Cache the updated data
				cacheCurrentData(id)
			} catch (error) {
				logger.error("Failed to fetch credit balance:", error)
			} finally {
				setLastFetchTime(Date.now())
				setIsLoading(false)
			}
		},
		[isLoading, uid, fetchUserCredit, loadCachedData],
	)

	// Handle organization change
	const handleOrganizationChange = useCallback(
		async (event: any) => {
			const target = event.target as HTMLSelectElement
			if (!target) return

			const newValue = target.value
			if (newValue !== dropdownValue) {
				// Cache current data before switching
				cacheCurrentData(dropdownValue)
				setDropdownValue(newValue)
				// Load cached data for new selection immediately, or clear if no cache
				if (!loadCachedData(newValue)) {
					setBalance(null)
					setUsageData([])
					setPaymentsData([])
				}
			}
			// Set flag to indicate manual fetch in progress
			manualFetchInProgressRef.current = true
			await fetchCreditBalance(newValue)
			manualFetchInProgressRef.current = false
			// Send the change to the server
			const organizationId = newValue === uid ? undefined : newValue
			AccountServiceClient.setUserOrganization({ organizationId })
		},
		[uid, dropdownValue, loadCachedData, fetchCreditBalance],
	)

	// Fetch balance every 60 seconds
	useInterval(() => {
		fetchCreditBalance(dropdownValue)
	}, 60000)

	// Fetch balance on mount
	useEffect(() => {
		async function initialFetch() {
			await fetchCreditBalance(dropdownValue)
		}
		initialFetch()
	}, [])

	const handleLogin = () => {
		logger.info("User clicked Caret sign up button")
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) => {
			logger.error("Failed to get login URL:", err)
		})
	}

	const handleLogout = () => {
		logger.info("User clicked logout button")
		handleSignOut()
	}

	const caretUrl = "https://app.caret.bot" // CARET MODIFICATION: Caret app URL

	return (
		<div className="h-full flex flex-col">
			{/* CARET MODIFICATION: Follow Cline pattern with user profile and organization dropdown */}
			<div className="flex flex-col pr-3 h-full">
				<div className="flex flex-col w-full">
					<div className="flex items-center mb-6 flex-wrap gap-y-4">
						{/* Profile picture or initial */}
						<div className="size-16 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-2xl text-[var(--vscode-button-foreground)] mr-4">
							{displayName?.[0] || email?.[0] || "?"}
						</div>

						<div className="flex flex-col">
							{displayName && (
								<h2 className="text-[var(--vscode-foreground)] m-0 mb-1 text-lg font-medium">{displayName}</h2>
							)}

							{email && <div className="text-sm text-[var(--vscode-descriptionForeground)]">{email}</div>}
						</div>
					</div>

					{/* Organization dropdown - following Cline pattern */}
					{userOrganizations && userOrganizations.length > 0 && (
						<div className="mb-4">
							<label
								htmlFor="organization-dropdown"
								className="block text-sm font-medium text-[var(--vscode-foreground)] mb-2">
								{t("account.organization", "common")}
							</label>
							<VSCodeDropdown
								id="organization-dropdown"
								value={dropdownValue}
								onChange={handleOrganizationChange}
								className="w-full">
								<VSCodeOption value={uid}>
									{t("account.personalAccount", "common")} ({email})
								</VSCodeOption>
								{userOrganizations.map((org) => (
									<VSCodeOption key={org.organizationId} value={org.organizationId}>
										{org.name} • {getMainRole(org.roles)}
									</VSCodeOption>
								))}
							</VSCodeDropdown>
						</div>
					)}
				</div>

				{/* Action buttons */}
				<div className="w-full flex gap-2 flex-col min-[225px]:flex-row">
					<div className="w-full min-[225px]:w-1/2">
						<VSCodeButtonLink href={caretUrl} appearance="primary" className="w-full">
							{t("account.dashboard", "common")}
						</VSCodeButtonLink>
					</div>
					<VSCodeButton appearance="secondary" onClick={handleLogout} className="w-full min-[225px]:w-1/2">
						{t("account.logOut", "common")}
					</VSCodeButton>
				</div>

				<VSCodeDivider className="w-full my-6" />

				{/* Credit balance section */}
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
								<CountUp end={balance || 0} duration={0.66} decimals={2} />
								<VSCodeButton appearance="icon" className="mt-1" onClick={() => fetchUserCredit()}>
									<span className="codicon codicon-refresh"></span>
								</VSCodeButton>
							</>
						)}
					</div>

					<div className="w-full">
						<VSCodeButtonLink href={caretUrl} className="w-full">
							{t("account.addCredits", "common")}
						</VSCodeButtonLink>
					</div>
				</div>

				<VSCodeDivider className="mt-6 mb-3 w-full" />

				{/* Credits history table */}
				<div className="flex-grow flex flex-col min-h-0 pb-[0px]">
					<CreditsHistoryTable isLoading={isLoading} usageData={usageData} paymentsData={paymentsData} />
				</div>
			</div>
		</div>
	)
}

// CARET MODIFICATION: Keep the no-props version for backward compatibility
export const CaretAccountViewNoProps = () => {
	const { personaProfile } = useExtensionState() as ExtensionStateContextType

	const handleLogin = () => {
		logger.info("User clicked Caret sign up button")
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) => {
			logger.error("Failed to get login URL:", err)
		})
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex flex-col items-center pr-3">
				{/* CARET MODIFICATION: personaProfile 이미지로 변경 */}
				<img src={personaProfile} alt={t("account.caretLogo", "common")} className="size-16 mb-4" />

				<p>{t("account.signUpDescription", "common")}</p>

				<VSCodeButton onClick={handleLogin} className="w-full mb-4">
					{t("account.signUpWithCaret", "common")}
				</VSCodeButton>

				<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
					{t("account.byContining", "common")}{" "}
					<VSCodeLink href={getLink("CARETIVE_TERMS")}>{t("account.termsOfService", "common")}</VSCodeLink>{" "}
					{t("common.and", "common")}{" "}
					<VSCodeLink href={getLink("CARETIVE_PRIVACY")}>{t("account.privacyPolicy", "common")}</VSCodeLink>.
				</p>
			</div>
		</div>
	)
}
