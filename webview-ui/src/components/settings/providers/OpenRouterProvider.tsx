import { EmptyRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { useOpenRouterKeyInfo } from "../../ui/hooks/useOpenRouterKeyInfo"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { DropdownContainer } from "../common/ModelSelector"
import OpenRouterModelPicker, { OPENROUTER_MODEL_PICKER_Z_INDEX } from "../OpenRouterModelPicker"
import { formatPrice } from "../utils/pricingUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Component to display OpenRouter balance information
 */
const OpenRouterBalanceDisplay = ({ apiKey }: { apiKey: string }) => {
	const { data: keyInfo, isLoading, error } = useOpenRouterKeyInfo(apiKey)

	if (isLoading) {
		return (
			<span style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
				{t("openRouterProvider.balanceDisplay.loading", "settings")}
			</span>
		)
	}

	if (error || !keyInfo || keyInfo.limit === null) {
		// Don't show anything if there's an error, no info, or no limit set
		return null
	}

	// Calculate remaining balance
	const remainingBalance = keyInfo.limit - keyInfo.usage
	const formattedBalance = formatPrice(remainingBalance)

	return (
		<VSCodeLink
			href="https://openrouter.ai/settings/keys"
			style={{
				fontSize: "12px",
				color: "var(--vscode-foreground)",
				textDecoration: "none",
				fontWeight: 500,
				paddingLeft: 4,
				cursor: "pointer",
			}}
			title={t("openRouterProvider.balanceDisplay.tooltip", "settings", {
				remainingBalance: formattedBalance,
				limit: formatPrice(keyInfo.limit),
				usage: formatPrice(keyInfo.usage),
			})}>
			{t("openRouterProvider.balanceDisplay.label", "settings", { formattedBalance })}
		</VSCodeLink>
	)
}

/**
 * Props for the OpenRouterProvider component
 */
interface OpenRouterProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The OpenRouter provider configuration component
 */
export const OpenRouterProvider = ({ showModelOptions, isPopup, currentMode }: OpenRouterProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	const [providerSortingSelected, setProviderSortingSelected] = useState(!!apiConfiguration?.openRouterProviderSorting)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.openrouter.description", "settings")}
			</p>
			<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
				<DebouncedTextField
					initialValue={apiConfiguration?.openRouterApiKey || ""}
					onChange={(value) => handleFieldChange("openRouterApiKey", value)}
					placeholder={t("openRouterProvider.apiKeyPlaceholder", "settings")}
					style={{ width: "100%" }}
					type="password">
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
						<span style={{ fontWeight: 500 }}>{t("openRouterProvider.apiKeyLabel", "settings")}</span>
						{apiConfiguration?.openRouterApiKey && (
							<OpenRouterBalanceDisplay apiKey={apiConfiguration.openRouterApiKey} />
						)}
					</div>
				</DebouncedTextField>
				{!apiConfiguration?.openRouterApiKey && (
					<VSCodeButton
						appearance="secondary"
						onClick={async () => {
							try {
								await AccountServiceClient.openrouterAuthClicked(EmptyRequest.create())
							} catch (error) {
								console.error(t("openRouterProvider.authError", "settings"), error)
							}
						}}
						style={{ margin: "5px 0 0 0" }}>
						{t("openRouterProvider.getApiKeyButton", "settings")}
					</VSCodeButton>
				)}
				<p
					style={{
						fontSize: "12px",
						marginTop: "5px",
						color: "var(--vscode-descriptionForeground)",
					}}>
					{t("openRouterProvider.apiKeyHelpText", "settings")}
				</p>
			</div>

			{showModelOptions && (
				<>
					<VSCodeCheckbox
						checked={providerSortingSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setProviderSortingSelected(isChecked)
							if (!isChecked) {
								handleFieldChange("openRouterProviderSorting", "")
							}
						}}
						style={{ marginTop: -10 }}>
						{t("openRouterProvider.sortUnderlyingProviderRoutingCheckbox", "settings")}
					</VSCodeCheckbox>

					{providerSortingSelected && (
						<div style={{ marginBottom: -6 }}>
							<DropdownContainer className="dropdown-container" zIndex={OPENROUTER_MODEL_PICKER_Z_INDEX + 1}>
								<VSCodeDropdown
									onChange={(e: any) => {
										handleFieldChange("openRouterProviderSorting", e.target.value)
									}}
									style={{ width: "100%", marginTop: 3 }}
									value={apiConfiguration?.openRouterProviderSorting}>
									<VSCodeOption value="">{t("openRouterProvider.defaultOption", "settings")}</VSCodeOption>
									<VSCodeOption value="price">{t("openRouterProvider.priceOption", "settings")}</VSCodeOption>
									<VSCodeOption value="throughput">
										{t("openRouterProvider.throughputOption", "settings")}
									</VSCodeOption>
									<VSCodeOption value="latency">
										{t("openRouterProvider.latencyOption", "settings")}
									</VSCodeOption>
								</VSCodeDropdown>
							</DropdownContainer>
							<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
								{!apiConfiguration?.openRouterProviderSorting &&
									t("openRouterProvider.defaultSortingDescription", "settings")}
								{apiConfiguration?.openRouterProviderSorting === "price" &&
									t("openRouterProvider.priceSortingDescription", "settings")}
								{apiConfiguration?.openRouterProviderSorting === "throughput" &&
									t("openRouterProvider.throughputSortingDescription", "settings")}
								{apiConfiguration?.openRouterProviderSorting === "latency" &&
									t("openRouterProvider.latencySortingDescription", "settings")}
							</p>
						</div>
					)}

					<OpenRouterModelPicker currentMode={currentMode} isPopup={isPopup} />
				</>
			)}
		</div>
	)
}
