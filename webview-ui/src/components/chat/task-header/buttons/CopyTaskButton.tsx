import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { t } from "@/caret/utils/i18n"
import HeroTooltip from "@/components/common/HeroTooltip"

const CopyTaskButton: React.FC<{
	taskText?: string
}> = ({ taskText }) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = () => {
		if (!taskText) {
			return
		}

		navigator.clipboard.writeText(taskText).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		})
	}

	return (
		<HeroTooltip content={t("task.copyTask", "common")}>
			<VSCodeButton
				appearance="icon"
				aria-label={t("task.copyTask", "common")}
				className="p-0"
				onClick={handleCopy}
				style={{ padding: "0px 0px" }}>
				<div className="flex items-center gap-[3px] text-[8px] font-bold opacity-60">
					<i className={`codicon codicon-${copied ? "check" : "copy"}`} />
				</div>
			</VSCodeButton>
		</HeroTooltip>
	)
}

export default CopyTaskButton
