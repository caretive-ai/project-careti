import { EmptyRequest } from "@shared/proto/cline/common"
// CARET MODIFICATION: Import persona avatar for Home header
import PersonaAvatar from "@/caret/components/PersonaAvatar"
import { useCaretState } from "@/caret/context/CaretStateContext"
import { t } from "@/caret/utils/i18n"
import HeroTooltip from "@/components/common/HeroTooltip"
import { UiServiceClient } from "@/services/grpc-client"

interface HomeHeaderProps {
	shouldShowQuickWins?: boolean
}

const HomeHeader = ({ shouldShowQuickWins = false }: HomeHeaderProps) => {
	// CARET MODIFICATION: Use persona avatar instead of Cline logo
	const { personaProfile } = useCaretState()

	const handleTakeATour = async () => {
		try {
			await UiServiceClient.openWalkthrough(EmptyRequest.create())
		} catch (error) {
			console.error("Error opening walkthrough:", error)
		}
	}

	return (
		<div className="flex flex-col items-center mb-5">
			<div className="my-5">
				{/* CARET MODIFICATION: Show persona avatar only, no fallback to Cline logo */}
				{personaProfile && <PersonaAvatar isThinking={false} personaProfile={personaProfile} size={64} />}
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
