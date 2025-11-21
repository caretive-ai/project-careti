import { TelemetrySettingEnum, TelemetrySettingRequest } from "@shared/proto/cline/state"
import { useCallback } from "react"
// CARET MODIFICATION: Import i18n for telemetry banner translation
import { t } from "@/caret/utils/i18n"
import { StateServiceClient } from "@/services/grpc-client"

const telemetryRequest = TelemetrySettingRequest.create({
	setting: TelemetrySettingEnum.ENABLED,
})

export const TelemetryBanner: React.FC = () => {
	const handleClose = useCallback(() => {
		StateServiceClient.updateTelemetrySetting(telemetryRequest).catch(console.error)
	}, [])

	// CARET MODIFICATION: Open Caret GitHub instead of settings (telemetry not implemented)
	const handleOpenGitHub = useCallback(() => {
		window.open("https://github.com/aicoding-caret/caret", "_blank")
	}, [])

	return (
		<div className="bg-banner-background text-banner-foreground px-3 py-2 flex flex-col gap-1 shrink-0 mb-1 relative text-sm m-4">
			<h3 className="m-0">{t("telemetry.helpImprove", "common")}</h3>
			<p className="m-0">{t("telemetry.description", "common")}</p>
			<p className="m-0">
				<span>{t("telemetry.githubLinkPrefix", "common")} </span>
				<span className="text-link cursor-pointer" onClick={handleOpenGitHub}>
					{t("telemetry.githubLink", "common")}
				</span>
				.
			</p>

			{/* Close button */}
			<button
				aria-label={t("telemetry.closeBannerAria", "common")}
				className="absolute top-3 right-3 opacity-70 hover:opacity-100 cursor-pointer border-0 bg-transparent p-0 text-inherit"
				onClick={handleClose}
				type="button">
				✕
			</button>
		</div>
	)
}

export default TelemetryBanner
