import type { UsageTransaction as ClineAccountUsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react"
import deepEqual from "fast-deep-equal"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { useInterval } from "react-use"
import { t } from "@/careti/utils/i18n"
import { AccountWelcomeView } from "@/components/account/AccountWelcomeView"
import { CreditBalance } from "@/components/account/CreditBalance"
import CreditsHistoryTable from "@/components/account/CreditsHistoryTable"
import { convertProtoUsageTransactions, getCaretUris } from "@/components/account/helpers"
import VSCodeButtonLink from "@/components/common/VSCodeButtonLink"
// CARETI MODIFICATION: Import platform config for standalone mode
import { IS_STANDALONE } from "@/config/platform.config"
import { type CaretUser, handleSignOut } from "@/context/CaretiAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretAccountServiceClient } from "@/services/grpc-client"

type AccountViewProps = {
	caretUser: CaretUser | null
	onDone: () => void
}

type CaretiAccountViewProps = {
	caretUser: CaretUser
}

type CachedData = {
	balance: number | null
	usageData: ClineAccountUsageTransaction[]
	paymentsData: PaymentTransaction[]
	lastFetchTime: number
}

const AccountView = ({ onDone, caretUser }: AccountViewProps) => {
	const { apiConfiguration } = useExtensionState()
	console.log("<===== account view apiConfiguration=====>", apiConfiguration)
	console.log("<===== account view caretUser=====>", caretUser)

	// CARETI MODIFICATION: Use absolute positioning in standalone mode to not cover avatar
	return (
		<div className={`${IS_STANDALONE ? "absolute" : "fixed"} inset-0 flex flex-col overflow-hidden pt-[10px] pl-[20px]`}>
			<div className="flex justify-between items-center mb-[17px] pr-[17px]">
				<h3 className="text-[var(--vscode-foreground)] m-0">{t("account.title", "common")}</h3>
				<VSCodeButton onClick={onDone}>{t("button.done", "common")}</VSCodeButton>
			</div>
			<div className="flex-grow overflow-hidden pr-[8px] flex flex-col">
				<div className="h-full mb-[5px]">
					{caretUser?.uid ? <CaretiAccountView caretUser={caretUser} /> : <AccountWelcomeView />}
				</div>
			</div>
		</div>
	)
}

export const CaretiAccountView = ({ caretUser }: CaretiAccountViewProps) => {
	const { email, displayName, appBaseUrl, uid, photoUrl } = caretUser
	const { featureConfig } = useExtensionState()
	const [dropdownValue, setDropdownValue] = useState<string>(uid)
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

	// Use ref for debounce timeout to avoid re-renders
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	// Track if manual fetch is in progress to avoid duplicate fetches
	const manualFetchInProgressRef = useRef<boolean>(false)

	const fetchUserCredit = useCallback(async () => {
		try {
			const response = await CaretAccountServiceClient.getCaretUserCredits(EmptyRequest.create())
			const newBalance = response?.balance?.currentBalance
			// Always update balance, even if it's 0 or null - don't skip undefined
			setBalance(newBalance ?? null)
			const newUsage = convertProtoUsageTransactions(response.usageTransactions)
			setUsageData((prev) => (deepEqual(newUsage, prev) ? prev : newUsage))
			const newPaymentsData = response.paymentTransactions
			setPaymentsData((prev) => (deepEqual(newPaymentsData, prev) ? prev : newPaymentsData))
		} catch (error) {
			console.error(t("account.failedToFetchUserCredit", "common"), error)
		}
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <cacheCurrentData changes on every re-render>
	const fetchCreditBalance = useCallback(
		async (id: string, skipCache = false) => {
			try {
				if (isLoading) {
					return // Prevent multiple concurrent fetches
				}

				// Load cached data immediately if available (unless skipping cache)
				if (!skipCache && loadCachedData(id)) {
					// If we have cached data, show it first, then fetch in background
				}

				setIsLoading(true)
				if (id === uid) {
					await fetchUserCredit()
				}

				// Cache the updated data
				cacheCurrentData(id)
			} catch (error) {
				console.error(t("account.failedToFetchCreditBalance", "common"), error)
			} finally {
				setLastFetchTime(Date.now())
				setIsLoading(false)
			}
		},
		[isLoading, uid, fetchUserCredit, loadCachedData],
	)

	// Fetch balance every 60 seconds
	useInterval(() => {
		fetchCreditBalance(dropdownValue)
	}, 300000) // 5 minutes

	const caretUrl = appBaseUrl || "https://careti.ai"

	// Fetch balance on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: <Only run once on mount>
	useEffect(() => {
		async function initialFetch() {
			await fetchCreditBalance(dropdownValue)
		}
		initialFetch()
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <cacheCurrentData changes on every re-render>
	useEffect(() => {
		// Handle organization changes with 500ms debounce
		const hasDropdownChanged = dropdownValue !== uid

		if (hasDropdownChanged) {
			// Clear any existing timeout
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current)
			}

			// If dropdown changed, load cached data for the current dropdown value
			if (hasDropdownChanged) {
				// Cache the previous data first
				cacheCurrentData(uid)
				// Load cached data for current dropdown value, or clear if no cache
				if (!loadCachedData(dropdownValue)) {
					// No cached data - clear to avoid showing wrong data
					setBalance(null)
					setUsageData([])
					setPaymentsData([])
				}
			}

			// Only set timeout if manual fetch is not in progress
			if (!manualFetchInProgressRef.current) {
				// Set new timeout to fetch after 500ms
				debounceTimeoutRef.current = setTimeout(() => {
					fetchCreditBalance(dropdownValue)
				}, 500)
			}
		}

		// Cleanup timeout on unmount
		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current)
			}
		}
	}, [dropdownValue, uid])

	return (
		<div className="h-full flex flex-col">
			<div className="flex flex-col pr-3 h-full">
				<div className="flex flex-col w-full">
					<div className="flex items-center mb-6 flex-wrap gap-y-4">
						{photoUrl ? (
							<img alt={t("account.profileAlt", "common")} className="size-16 rounded-full mr-4" src={photoUrl} />
						) : (
							<div className="size-16 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-2xl text-[var(--vscode-button-foreground)] mr-4">
								{displayName?.[0] || email?.[0] || "?"}
							</div>
						)}

						<div className="flex flex-col">
							{displayName && (
								<h2 className="text-[var(--vscode-foreground)] m-0 text-lg font-medium">{displayName}</h2>
							)}

							{/* CARETI MODIFICATION: Hide email and organization dropdown when enableCaretAccountFeatures is false */}
							{featureConfig?.enableCaretAccountFeatures && (
								<>{email && <div className="text-sm text-[var(--vscode-descriptionForeground)]">{email}</div>}</>
							)}
						</div>
					</div>
				</div>

				{/* CARETI MODIFICATION: Hide dashboard and logout buttons when enableCaretAccountFeatures is false */}
				{featureConfig?.enableCaretAccountFeatures && (
					<div className="w-full flex gap-2 flex-col min-[225px]:flex-row">
						<div className="w-full min-[225px]:w-1/2">
							<VSCodeButtonLink
								appearance="primary"
								className="w-full"
								href={getCaretUris(caretUrl, "careti", "profile").href}>
								{t("account.dashboard", "common")}
							</VSCodeButtonLink>
						</div>
						<VSCodeButton appearance="secondary" className="w-full min-[225px]:w-1/2" onClick={() => handleSignOut()}>
							{t("account.logOut", "common")}
						</VSCodeButton>
					</div>
				)}

				<VSCodeDivider className="w-full my-6" />

				<CreditBalance
					balance={balance}
					creditUrl={getCaretUris(caretUrl, "careti", "usage")}
					fetchCreditBalance={() => fetchCreditBalance(dropdownValue)}
					isLoading={isLoading}
					lastFetchTime={lastFetchTime}
				/>

				<VSCodeDivider className="mt-6 mb-3 w-full" />

				<div className="flex-grow flex flex-col min-h-0 pb-[0px]">
					<CreditsHistoryTable
						isLoading={isLoading}
						paymentsData={paymentsData}
						showPayments={dropdownValue === uid}
						usageData={usageData}
					/>
				</div>
			</div>
		</div>
	)
}

export default memo(AccountView)
