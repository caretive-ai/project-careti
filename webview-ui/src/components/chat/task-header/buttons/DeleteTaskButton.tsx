import { StringArrayRequest } from "@shared/proto/cline/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import HeroTooltip from "@/components/common/HeroTooltip"
import { TaskServiceClient } from "@/services/grpc-client"

const DeleteTaskButton: React.FC<{
	taskSize: string
	taskId?: string
}> = ({ taskSize, taskId }) => (
	<HeroTooltip content={t("task.deleteTask", "common")}>
		<VSCodeButton
			appearance="icon"
			aria-label={t("task.deleteTaskAriaLabel", "common")}
			onClick={() => taskId && TaskServiceClient.deleteTasksWithIds(StringArrayRequest.create({ value: [taskId] }))}
			style={{ padding: "0px 0px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "3px",
					fontSize: "10px",
					fontWeight: "bold",
					opacity: 0.6,
				}}>
				<i className={`codicon codicon-trash`} />
				{taskSize}
			</div>
		</VSCodeButton>
	</HeroTooltip>
)

export default DeleteTaskButton
