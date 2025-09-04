import { StringRequest } from "@shared/proto/cline/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import HeroTooltip from "@/components/common/HeroTooltip"
import { FileServiceClient } from "@/services/grpc-client"

const OpenDiskTaskHistoryButton: React.FC<{
	taskId?: string
}> = ({ taskId }) => {
	const handleOpenDiskTaskHistory = () => {
		if (!taskId) {
			return
		}

		FileServiceClient.openTaskHistory(StringRequest.create({ value: taskId })).catch((err) => {
			console.error(err)
		})
	}

	return (
		<HeroTooltip content={t("openDiskTaskHistoryButton.openDiskTaskHistory", "chat")}>
			<VSCodeButton
				appearance="icon"
				aria-label={t("openDiskTaskHistoryButton.openDiskTaskHistory", "chat")}
				className="p-0"
				onClick={handleOpenDiskTaskHistory}
				style={{ padding: "0px 0px" }}>
				<div className="flex items-center gap-[3px] text-[8px] font-bold opacity-60">
					<i className={`codicon codicon-folder`} />
				</div>
			</VSCodeButton>
		</HeroTooltip>
	)
}

export default OpenDiskTaskHistoryButton
