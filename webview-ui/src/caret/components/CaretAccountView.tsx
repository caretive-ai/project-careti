// CARET MODIFICATION: Caret Account View component - replacement for ClineAccountView
// Now uses actual gRPC communication with Extension instead of Mock API

import { type CaretUsage, CaretUser } from "@shared/CaretAccount"
import * as proto from "@shared/proto/index"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import deepEqual from "fast-deep-equal"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { caretWebviewLogger } from "@/caret/utils/CaretWebviewLogger"
import { t } from "@/caret/utils/i18n"
import { CaretAccountServiceClient } from "@/services/grpc-client"
import { formatCurrencyAmount, formatLargeNumber } from "@/utils/format"

const fallbackUsage: CaretUsage = {
	spend: 0,
	currency: "USD",
	prompt_tokens: 0,
	completion_tokens: 0,
	total_tokens: 0,
}

const ensureUsage = (usage?: CaretUsage | null): CaretUsage => ({
	spend: usage?.spend ?? 0,
	currency: usage?.currency ?? undefined,
	prompt_tokens: usage?.prompt_tokens ?? 0,
	completion_tokens: usage?.completion_tokens ?? 0,
	total_tokens: usage?.total_tokens ?? 0,
})

const mapSummaryToUsage = (summary?: proto.caret.CaretUsageSummary | null, fallback: CaretUsage = fallbackUsage): CaretUsage => ({
	spend: summary?.spend ?? fallback.spend ?? 0,
	currency: summary?.currency ?? fallback.currency ?? undefined,
	prompt_tokens: summary?.promptTokens ?? fallback.prompt_tokens ?? 0,
	completion_tokens: summary?.completionTokens ?? fallback.completion_tokens ?? 0,
	total_tokens: summary?.totalTokens ?? fallback.total_tokens ?? 0,
})

const areCaretUsersEqual = (a: CaretUser, b: CaretUser) => deepEqual(a, b)

const normalizeCaretUser = (user: CaretUser): CaretUser => ({
	...user,
	dailyUsage: ensureUsage(user.dailyUsage),
	monthlyUsage: ensureUsage(user.monthlyUsage),
	organizations: user.organizations ?? [],
})

const mergeCaretUserWithProfile = (baseUser: CaretUser, profile: proto.caret.CaretUserProfile): CaretUser => {
	const normalizedBase = normalizeCaretUser(baseUser)

	const mappedOrganizations = profile.organizations?.map((organization) => ({
		active: organization.active ?? false,
		memberId: organization.memberId ?? "",
		name: organization.name ?? "",
		organizationId: organization.organizationId ?? "",
		roles: (organization.roles ?? []) as Array<"admin" | "member" | "owner">,
	}))

	return {
		...normalizedBase,
		id: profile.id || normalizedBase.id,
		email: profile.email ?? normalizedBase.email,
		displayName: profile.displayName ?? normalizedBase.displayName,
		photoUrl: profile.photoUrl ?? normalizedBase.photoUrl,
		appBaseUrl: profile.appBaseUrl ?? normalizedBase.appBaseUrl,
		apiKey: profile.apiKey ?? normalizedBase.apiKey,
		models: profile.models?.length ? [...profile.models] : normalizedBase.models,
		dailyUsage: mapSummaryToUsage(profile.dailyUsage, normalizedBase.dailyUsage),
		monthlyUsage: mapSummaryToUsage(profile.monthlyUsage, normalizedBase.monthlyUsage),
		organizations: mappedOrganizations?.length ? mappedOrganizations : normalizedBase.organizations,
	}
}

const formatUsageCost = (usage?: CaretUsage | null) => {
	if (!usage) {
		return "$0.00"
	}

	const currency = usage.currency?.toUpperCase()
	const isUsd = !currency || currency === "USD"

	return `${isUsd ? "$" : `${currency} `}${formatCurrencyAmount(usage.spend)}`
}

type CaretAccountViewProps = {
	caretUser: CaretUser
}

const CaretAccountView = memo(({ caretUser }: CaretAccountViewProps) => {
	const [resolvedUser, setResolvedUser] = useState<CaretUser>(() => normalizeCaretUser(caretUser))
	const lastFetchedProfileIdRef = useRef<string | null>(null)
	const fetchedProfileKeysRef = useRef<Set<string>>(new Set())
	const profileFetchPromisesRef = useRef<Map<string, Promise<proto.caret.CaretUserProfile | undefined>>>(new Map())

	useEffect(() => {
		setResolvedUser(normalizeCaretUser(caretUser))
	}, [caretUser])

	useEffect(() => {
		const incomingId = caretUser.id ?? ""
		const profileKey = incomingId || "__missing__"
		if (fetchedProfileKeysRef.current.has(profileKey)) {
			return
		}

		let promise = profileFetchPromisesRef.current.get(profileKey)
		if (!promise) {
			caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] 🔄 Resolving Caret user profile", {
				incomingId,
				lastFetchedId: lastFetchedProfileIdRef.current,
			})

			promise = CaretAccountServiceClient.getCaretUserProfile(proto.cline.EmptyRequest.create({}))
				.then((response) => {
					if (response) {
						fetchedProfileKeysRef.current.add(profileKey)
						if (response.id) {
							fetchedProfileKeysRef.current.add(response.id)
						}
					}
					return response
				})
				.catch((error) => {
					fetchedProfileKeysRef.current.delete(profileKey)
					throw error
				})
				.finally(() => {
					profileFetchPromisesRef.current.delete(profileKey)
				})

			profileFetchPromisesRef.current.set(profileKey, promise)
		}

		let isActive = true
		promise
			.then((response) => {
				if (!isActive || !response) {
					return
				}

				setResolvedUser((prev) => {
					const next = mergeCaretUserWithProfile(prev, response)
					return areCaretUsersEqual(prev, next) ? prev : next
				})
				lastFetchedProfileIdRef.current = response.id || incomingId || null
				caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] ✅ Caret profile resolved", {
					id: response.id,
					email: response.email,
				})
			})
			.catch((error) => {
				if (isActive) {
					caretWebviewLogger.error("[CARET-ACCOUNT-VIEW] ❌ Failed to fetch Caret profile", error)
				}
			})

		return () => {
			isActive = false
		}
	}, [caretUser.id])

	const { id, email, displayName, dailyUsage, monthlyUsage } = resolvedUser
	const usageRows = useMemo(
		() => [
			{ key: "daily", label: t("account.dailyUsage", "common"), usage: dailyUsage },
			{ key: "monthly", label: t("account.monthlyUsage", "common"), usage: monthlyUsage },
		],
		[dailyUsage, monthlyUsage],
	)

	const handleLogout = useCallback(async () => {
		caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] 🚪 User logout requested via gRPC")
		try {
			// CARET MODIFICATION: Call gRPC logout
			const request: proto.cline.EmptyRequest = { metadata: undefined }
			await CaretAccountServiceClient.caretAccountLogoutClicked(request)

			caretWebviewLogger.info("[CARET-ACCOUNT-VIEW] ✅ gRPC logout successful")
		} catch (error) {
			caretWebviewLogger.error("[CARET-ACCOUNT-VIEW] ❌ gRPC logout failed:", error)
		}
	}, [])

	// Log render state
	console.log("[CARET-ACCOUNT-VIEW] 🎨 Rendering with gRPC state:", {
		user: { id, email, displayName },
		usage: {
			daily: {
				promptTokens: dailyUsage.prompt_tokens,
				completionTokens: dailyUsage.completion_tokens,
				totalTokens: dailyUsage.total_tokens,
				totalCost: dailyUsage.spend,
			},
			monthly: {
				promptTokens: monthlyUsage.prompt_tokens,
				completionTokens: monthlyUsage.completion_tokens,
				totalTokens: monthlyUsage.total_tokens,
				totalCost: monthlyUsage.spend,
			},
		},
	})

	return (
		<div className="max-w-lg mx-auto p-4">
			<div className="text-xl font-semibold mb-4 text-center text-[var(--vscode-foreground)]">
				{t("account.manageAccount", "common")}
			</div>

			<div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)] rounded-lg p-4 mb-4">
				<div className="space-y-1">
					<div className="text-[var(--vscode-foreground)]">
						<span className="text-[var(--vscode-descriptionForeground)]">{t("account.email", "common")}: </span>
						{email || id}
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
				<div className="text-sm font-semibold uppercase tracking-wide text-[var(--vscode-descriptionForeground)]">
					{t("account.usageSummary", "common")}
				</div>
				<div className="mt-3">
					<div className="grid grid-cols-3 gap-3 border-b border-[var(--vscode-panel-border)] pb-2 text-xs uppercase tracking-wide text-[var(--vscode-descriptionForeground)]">
						<div>{t("account.timeframe", "common")}</div>
						<div className="text-right">{t("account.totalTokens", "common")}</div>
						<div className="text-right">{t("account.totalCost", "common")}</div>
					</div>
					<div className="divide-y divide-[var(--vscode-panel-border)] text-sm text-[var(--vscode-foreground)]">
						{usageRows.map(({ key, label, usage }) => (
							<div className="grid grid-cols-3 gap-3 py-2" key={key}>
								<div className="font-medium">{label}</div>
								<div className="text-right">{formatLargeNumber(usage?.total_tokens)}</div>
								<div className="text-right">{formatUsageCost(usage)}</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="space-y-3">
				<VSCodeButton appearance="secondary" className="w-full" onClick={handleLogout}>
					{t("account.logout", "common")}
				</VSCodeButton>
			</div>
		</div>
	)
})

CaretAccountView.displayName = "CaretAccountView"

export default CaretAccountView
