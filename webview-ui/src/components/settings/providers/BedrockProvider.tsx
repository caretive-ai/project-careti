import { bedrockDefaultModelId, bedrockModels, CLAUDE_SONNET_4_1M_SUFFIX } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import { DropdownContainer } from "../common/ModelSelector"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

// Z-index constants for proper dropdown layering
const DROPDOWN_Z_INDEX = 1000

interface BedrockProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

export const BedrockProvider = ({ showModelOptions, isPopup, currentMode }: BedrockProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleFieldsChange, handleModeFieldChange, handleModeFieldsChange } = useApiConfigurationHandlers()

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)
	const [awsEndpointSelected, setAwsEndpointSelected] = useState(!!apiConfiguration?.awsBedrockEndpoint)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.bedrock.description", "settings")}
			</p>
			<VSCodeRadioGroup
				onChange={(e) => {
					const value = (e.target as HTMLInputElement)?.value
					handleFieldChange("awsAuthentication", value)
				}}
				value={apiConfiguration?.awsAuthentication ?? (apiConfiguration?.awsProfile ? "profile" : "credentials")}>
				<VSCodeRadio value="apikey">{t("bedrockProvider.apiKey", "settings")}</VSCodeRadio>
				<VSCodeRadio value="profile">{t("bedrockProvider.awsProfile", "settings")}</VSCodeRadio>
				<VSCodeRadio value="credentials">{t("bedrockProvider.awsCredentials", "settings")}</VSCodeRadio>
			</VSCodeRadioGroup>

			{(apiConfiguration?.awsAuthentication === undefined && apiConfiguration?.awsUseProfile) ||
			apiConfiguration?.awsAuthentication === "profile" ? (
				<DebouncedTextField
					initialValue={apiConfiguration?.awsProfile ?? ""}
					key="profile"
					onChange={(value) => handleFieldChange("awsProfile", value)}
					placeholder={t("bedrockProvider.profileNamePlaceholder", "settings")}
					style={{ width: "100%" }}>
					<span style={{ fontWeight: 500 }}>{t("bedrockProvider.profileNameLabel", "settings")}</span>
				</DebouncedTextField>
			) : apiConfiguration?.awsAuthentication === "apikey" ? (
				<DebouncedTextField
					initialValue={apiConfiguration?.awsBedrockApiKey ?? ""}
					key="apikey"
					onChange={(value) => handleFieldChange("awsBedrockApiKey", value)}
					placeholder={t("bedrockProvider.bedrockApiKeyPlaceholder", "settings")}
					style={{ width: "100%" }}
					type="password">
					<span style={{ fontWeight: 500 }}>{t("bedrockProvider.bedrockApiKeyLabel", "settings")}</span>
				</DebouncedTextField>
			) : (
				<>
					<DebouncedTextField
						initialValue={apiConfiguration?.awsAccessKey || ""}
						key="accessKey"
						onChange={(value) => handleFieldChange("awsAccessKey", value)}
						placeholder={t("bedrockProvider.accessKeyPlaceholder", "settings")}
						style={{ width: "100%" }}
						type="password">
						<span style={{ fontWeight: 500 }}>{t("bedrockProvider.accessKeyLabel", "settings")}</span>
					</DebouncedTextField>
					<DebouncedTextField
						initialValue={apiConfiguration?.awsSecretKey || ""}
						onChange={(value) => handleFieldChange("awsSecretKey", value)}
						placeholder={t("bedrockProvider.secretKeyPlaceholder", "settings")}
						style={{ width: "100%" }}
						type="password">
						<span style={{ fontWeight: 500 }}>{t("bedrockProvider.secretKeyLabel", "settings")}</span>
					</DebouncedTextField>
					<DebouncedTextField
						initialValue={apiConfiguration?.awsSessionToken || ""}
						onChange={(value) => handleFieldChange("awsSessionToken", value)}
						placeholder={t("bedrockProvider.sessionTokenPlaceholder", "settings")}
						style={{ width: "100%" }}
						type="password">
						<span style={{ fontWeight: 500 }}>{t("bedrockProvider.sessionTokenLabel", "settings")}</span>
					</DebouncedTextField>
				</>
			)}

			<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 1}>
				<label htmlFor="aws-region-dropdown">
					<span style={{ fontWeight: 500 }}>{t("bedrockProvider.awsRegionLabel", "settings")}</span>
				</label>
				<VSCodeDropdown
					id="aws-region-dropdown"
					onChange={(e: any) => handleFieldChange("awsRegion", e.target.value)}
					style={{ width: "100%" }}
					value={apiConfiguration?.awsRegion || ""}>
					<VSCodeOption value="">{t("bedrockProvider.selectRegionPlaceholder", "settings")}</VSCodeOption>
					{/* The user will have to choose a region that supports the model they use, but this shouldn't be a problem since they'd have to request access for it in that region in the first place. */}
					<VSCodeOption value="us-east-1">us-east-1</VSCodeOption>
					<VSCodeOption value="us-east-2">us-east-2</VSCodeOption>
					{/* <VSCodeOption value="us-west-1">us-west-1</VSCodeOption> */}
					<VSCodeOption value="us-west-2">us-west-2</VSCodeOption>
					{/* <VSCodeOption value="af-south-1">af-south-1</VSCodeOption> */}
					{/* <VSCodeOption value="ap-east-1">ap-east-1</VSCodeOption> */}
					<VSCodeOption value="ap-south-1">ap-south-1</VSCodeOption>
					<VSCodeOption value="ap-northeast-1">ap-northeast-1</VSCodeOption>
					<VSCodeOption value="ap-northeast-2">ap-northeast-2</VSCodeOption>
					<VSCodeOption value="ap-northeast-3">ap-northeast-3</VSCodeOption>
					<VSCodeOption value="ap-southeast-1">ap-southeast-1</VSCodeOption>
					<VSCodeOption value="ap-southeast-2">ap-southeast-2</VSCodeOption>
					<VSCodeOption value="ca-central-1">ca-central-1</VSCodeOption>
					<VSCodeOption value="eu-central-1">eu-central-1</VSCodeOption>
					<VSCodeOption value="eu-central-2">eu-central-2</VSCodeOption>
					<VSCodeOption value="eu-west-1">eu-west-1</VSCodeOption>
					<VSCodeOption value="eu-west-2">eu-west-2</VSCodeOption>
					<VSCodeOption value="eu-west-3">eu-west-3</VSCodeOption>
					<VSCodeOption value="eu-north-1">eu-north-1</VSCodeOption>
					<VSCodeOption value="eu-south-1">eu-south-1</VSCodeOption>
					<VSCodeOption value="eu-south-2">eu-south-2</VSCodeOption>
					{/* <VSCodeOption value="me-south-1">me-south-1</VSCodeOption> */}
					<VSCodeOption value="sa-east-1">sa-east-1</VSCodeOption>
					<VSCodeOption value="us-gov-east-1">us-gov-east-1</VSCodeOption>
					<VSCodeOption value="us-gov-west-1">us-gov-west-1</VSCodeOption>
					{/* <VSCodeOption value="us-gov-east-1">us-gov-east-1</VSCodeOption> */}
				</VSCodeDropdown>
			</DropdownContainer>

			<div style={{ display: "flex", flexDirection: "column" }}>
				<VSCodeCheckbox
					checked={awsEndpointSelected}
					onChange={(e: any) => {
						const isChecked = e.target.checked === true
						setAwsEndpointSelected(isChecked)
						if (!isChecked) {
							handleFieldChange("awsBedrockEndpoint", "")
						}
					}}>
					{t("bedrockProvider.useCustomVpcEndpoint", "settings")}
				</VSCodeCheckbox>

				{awsEndpointSelected && (
					<DebouncedTextField
						initialValue={apiConfiguration?.awsBedrockEndpoint || ""}
						onChange={(value) => handleFieldChange("awsBedrockEndpoint", value)}
						placeholder={t("bedrockProvider.vpcEndpointPlaceholder", "settings")}
						style={{ width: "100%", marginTop: 3, marginBottom: 5 }}
						type="url"
					/>
				)}

				<VSCodeCheckbox
					checked={apiConfiguration?.awsUseCrossRegionInference || false}
					onChange={(e: any) => {
						const isChecked = e.target.checked === true

						handleFieldChange("awsUseCrossRegionInference", isChecked)
					}}>
					{t("bedrockProvider.useCrossRegionInference", "settings")}
				</VSCodeCheckbox>

				{selectedModelInfo.supportsPromptCache && (
					<VSCodeCheckbox
						checked={apiConfiguration?.awsBedrockUsePromptCache || false}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							handleFieldChange("awsBedrockUsePromptCache", isChecked)
						}}>
						{t("bedrockProvider.usePromptCaching", "settings")}
					</VSCodeCheckbox>
				)}
			</div>

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				{apiConfiguration?.awsUseProfile
					? t("bedrockProvider.profileCredentialsHelpText", "settings")
					: t("bedrockProvider.defaultCredentialsHelpText", "settings")}
			</p>

			{showModelOptions && (
				<>
					<label htmlFor="bedrock-model-dropdown">
						<span style={{ fontWeight: 500 }}>{t("bedrockProvider.modelLabel", "settings")}</span>
					</label>
					<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 2}>
						<VSCodeDropdown
							id="bedrock-model-dropdown"
							onChange={(e: any) => {
								const isCustom = e.target.value === "custom"

								handleModeFieldsChange(
									{
										apiModelId: { plan: "planModeApiModelId", act: "actModeApiModelId" },
										awsBedrockCustomSelected: {
											plan: "planModeAwsBedrockCustomSelected",
											act: "actModeAwsBedrockCustomSelected",
										},
										awsBedrockCustomModelBaseId: {
											plan: "planModeAwsBedrockCustomModelBaseId",
											act: "actModeAwsBedrockCustomModelBaseId",
										},
									},
									{
										apiModelId: isCustom ? "" : e.target.value,
										awsBedrockCustomSelected: isCustom,
										awsBedrockCustomModelBaseId: bedrockDefaultModelId,
									},
									currentMode,
								)
							}}
							style={{ width: "100%" }}
							value={modeFields.awsBedrockCustomSelected ? "custom" : selectedModelId}>
							<VSCodeOption value="">{t("bedrockProvider.selectModelPlaceholder", "settings")}</VSCodeOption>
							{Object.keys(bedrockModels).map((modelId) => (
								<VSCodeOption
									key={modelId}
									style={{
										whiteSpace: "normal",
										wordWrap: "break-word",
										maxWidth: "100%",
									}}
									value={modelId}>
									{modelId}
								</VSCodeOption>
							))}
							<VSCodeOption value="custom">{t("bedrockProvider.customModelOption", "settings")}</VSCodeOption>
						</VSCodeDropdown>
					</DropdownContainer>

					{modeFields.awsBedrockCustomSelected && (
						<div>
							<p
								style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								{t("bedrockProvider.customModelDescription", "settings")}
							</p>
							<DebouncedTextField
								id="bedrock-model-input"
								initialValue={modeFields.apiModelId || ""}
								onChange={(value) =>
									handleModeFieldChange(
										{ plan: "planModeApiModelId", act: "actModeApiModelId" },
										value,
										currentMode,
									)
								}
								placeholder={t("bedrockProvider.customModelIdPlaceholder", "settings")}
								style={{ width: "100%", marginTop: 3 }}>
								<span style={{ fontWeight: 500 }}>{t("bedrockProvider.modelIdLabel", "settings")}</span>
							</DebouncedTextField>
							<label htmlFor="bedrock-base-model-dropdown">
								<span style={{ fontWeight: 500 }}>
									{t("bedrockProvider.baseInferenceModelLabel", "settings")}
								</span>
							</label>
							<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 3}>
								<VSCodeDropdown
									id="bedrock-base-model-dropdown"
									onChange={(e: any) =>
										handleModeFieldChange(
											{
												plan: "planModeAwsBedrockCustomModelBaseId",
												act: "actModeAwsBedrockCustomModelBaseId",
											},
											e.target.value,
											currentMode,
										)
									}
									style={{ width: "100%" }}
									value={modeFields.awsBedrockCustomModelBaseId || bedrockDefaultModelId}>
									<VSCodeOption value="">
										{t("bedrockProvider.selectBaseModelPlaceholder", "settings")}
									</VSCodeOption>
									{Object.keys(bedrockModels).map((modelId) => (
										<VSCodeOption
											key={modelId}
											style={{
												whiteSpace: "normal",
												wordWrap: "break-word",
												maxWidth: "100%",
											}}
											value={modelId}>
											{modelId}
										</VSCodeOption>
									))}
								</VSCodeDropdown>
							</DropdownContainer>
						</div>
					)}

					{(selectedModelId === "anthropic.claude-3-7-sonnet-20250219-v1:0" ||
						selectedModelId === "anthropic.claude-sonnet-4-20250514-v1:0" ||
						selectedModelId === `anthropic.claude-sonnet-4-20250514-v1:0${CLAUDE_SONNET_4_1M_SUFFIX}` ||
						selectedModelId === "anthropic.claude-opus-4-1-20250805-v1:0" ||
						selectedModelId === "anthropic.claude-opus-4-20250514-v1:0" ||
						(modeFields.awsBedrockCustomSelected &&
							modeFields.awsBedrockCustomModelBaseId === "anthropic.claude-3-7-sonnet-20250219-v1:0") ||
						(modeFields.awsBedrockCustomSelected &&
							modeFields.awsBedrockCustomModelBaseId === "anthropic.claude-sonnet-4-20250514-v1:0") ||
						(modeFields.awsBedrockCustomSelected &&
							modeFields.awsBedrockCustomModelBaseId ===
								`anthropic.claude-sonnet-4-20250514-v1:0${CLAUDE_SONNET_4_1M_SUFFIX}`) ||
						(modeFields.awsBedrockCustomSelected &&
							modeFields.awsBedrockCustomModelBaseId === "anthropic.claude-opus-4-1-20250805-v1:0") ||
						(modeFields.awsBedrockCustomSelected &&
							modeFields.awsBedrockCustomModelBaseId === "anthropic.claude-opus-4-20250514-v1:0")) && (
						<ThinkingBudgetSlider currentMode={currentMode} />
					)}

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
