import { cn, Tooltip } from "@heroui/react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { FoldVerticalIcon } from "lucide-react"
import { t } from "@/careti/utils/i18n"

const CompactTaskButton: React.FC<{
	className?: string
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}> = ({ onClick, className }) => {
	return (
		<Tooltip
			content={
				<div className="flex flex-col gap-1 bg-menu rounded shadow-sm border border-menu-border z-100 max-w-xs py-1 px-2">
					<div className="text-xs font-medium">{t("compactTask.title", "chat")}</div>
					<div className="text-xs text-muted-foreground">{t("compactTask.description", "chat")}</div>
				</div>
			}
			delay={0}
			disableAnimation={true}
			placement="bottom">
			<VSCodeButton
				appearance="icon"
				className={cn(
					"text-foreground flex items-center text-sm font-bold hover:bg-transparent hover:opacity-80",
					className,
				)}
				onClick={onClick}
				type="button">
				<FoldVerticalIcon size={12} />
			</VSCodeButton>
		</Tooltip>
	)
}

export default CompactTaskButton
