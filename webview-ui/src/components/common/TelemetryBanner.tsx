import { TelemetrySettingEnum, TelemetrySettingRequest } from "@shared/proto/cline/state"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import styled from "styled-components"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"

const BannerContainer = styled.div`
	background-color: var(--vscode-banner-background);
	padding: 12px 20px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	flex-shrink: 0;
	margin-bottom: 6px;
	position: relative;
`

const CloseButton = styled.button`
	position: absolute;
	top: 12px;
	right: 12px;
	background: none;
	border: none;
	color: var(--vscode-foreground);
	cursor: pointer;
	font-size: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
	opacity: 0.7;
	&:hover {
		opacity: 1;
	}
`

const _ButtonContainer = styled.div`
	display: flex;
	gap: 8px;
	width: 100%;

	& > vscode-button {
		flex: 1;
	}
`

const TelemetryBanner = () => {
	const { navigateToSettings } = useExtensionState()

	const handleOpenSettings = () => {
		handleClose()
		navigateToSettings()
	}

	const handleClose = async () => {
		try {
			await StateServiceClient.updateTelemetrySetting(
				TelemetrySettingRequest.create({
					setting: TelemetrySettingEnum.ENABLED,
				}),
			)
		} catch (error) {
			console.error("Error updating telemetry setting:", error)
		}
	}

	return (
		<BannerContainer>
			<CloseButton aria-label={t("telemetryBanner.closeAndEnable", "chat")} onClick={handleClose}>
				✕
			</CloseButton>
			<div>
				<strong>{t("telemetryBanner.helpImproveCline", "chat")}</strong>
				<i>
					<br />
					{t("telemetryBanner.accessExperimentalFeatures", "chat")}
				</i>
				<div style={{ marginTop: 4 }}>
					{t("telemetryBanner.dataCollectionInfo", "chat")}
					<div style={{ marginTop: 4 }}>
						{t("telemetryBanner.turnOffSetting", "chat")}{" "}
						<VSCodeLink href="#" onClick={handleOpenSettings}>
							{t("telemetryBanner.settings", "chat")}
						</VSCodeLink>
						.
					</div>
				</div>
			</div>
		</BannerContainer>
	)
}

export default memo(TelemetryBanner)
