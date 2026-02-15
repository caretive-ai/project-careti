import { EmptyRequest } from "@shared/proto/cline/common"
// CARETI MODIFICATION: Import persona avatar for Home header
import PersonaAvatar from "@/careti/components/PersonaAvatar"
import { useCaretiState } from "@/careti/context/CaretiStateContext"
import { t } from "@/careti/utils/i18n"
import HeroTooltip from "@/components/common/HeroTooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { UiServiceClient } from "@/services/grpc-client"

interface HomeHeaderProps {
	shouldShowQuickWins?: boolean
}

const HomeHeader = ({ shouldShowQuickWins = false }: HomeHeaderProps) => {
	// CARETI MODIFICATION: Use persona avatar instead of Cline logo
	const { personaProfile } = useCaretiState()
	// CARETI MODIFICATION: Get featureConfig to check if 3D avatar is enabled
	const { featureConfig } = useExtensionState()

	const handleTakeATour = async () => {
		try {
			await UiServiceClient.openWalkthrough(EmptyRequest.create())
		} catch (error) {
			console.error("Error opening walkthrough:", error)
		}
	}

	// CARETI MODIFICATION: Hide entire header when 3D avatar is enabled (avatar is shown at app level)
	if (featureConfig?.avatarEnabled) {
		return null
	}

	return (
		<div className="flex flex-col items-center mb-5">
			<div className="my-5">
				{personaProfile && (
					<PersonaAvatar isThinking={false} personaProfile={personaProfile} size={64} />
				)}
			</div>
			<div className="text-center flex items-center justify-center">
				<h2 className="m-0 text-lg">{t("welcome.whatCanIDo", "common")}</h2>
				<HeroTooltip className="max-w-[300px]" content={t("welcome.tooltipContent", "welcome")} placement="bottom">
					<span className="codicon codicon-info ml-2 cursor-pointer text-link text-sm" />
				</HeroTooltip>
			</div>
			{shouldShowQuickWins && (
				<div className="mt-4">
					<button
						className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-panel bg-white/[0.02] hover:bg-list-background-hover transition-colors duration-150 ease-in-out text-code-foreground text-sm font-medium cursor-pointer"
						onClick={handleTakeATour}
						type="button">
						{t("welcome.takeATour", "welcome")}
						<span className="codicon codicon-play scale-90"></span>
					</button>
				</div>
			)}
		</div>
	)
}

export default HomeHeader
