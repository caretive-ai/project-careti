// CARETI MODIFICATION: Hook row component for hooks tab
// Ported from cline-latest with Careti path standards (.agents/hooks)
import { StringRequest } from "@shared/proto/cline/common"
import { DeleteHookRequest, HooksToggles } from "@shared/proto/cline/file"
import { VSCodeButton, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { FileServiceClient } from "@/services/grpc-client"

interface HookRowProps {
	hookName: string
	enabled: boolean
	absolutePath: string
	isGlobal: boolean
	isWindows: boolean
	workspaceName?: string
	onToggle: (hookName: string, newEnabled: boolean) => void
	onDelete: (hooksToggles: HooksToggles) => void
}

const HookRow: React.FC<HookRowProps> = ({
	hookName,
	enabled,
	absolutePath,
	isGlobal,
	isWindows,
	workspaceName,
	onToggle,
	onDelete,
}) => {
	const handleEditClick = () => {
		FileServiceClient.openFile(StringRequest.create({ value: absolutePath })).catch((err) =>
			console.error("Failed to open file:", err),
		)
	}

	const handleDeleteClick = () => {
		FileServiceClient.deleteHook(
			DeleteHookRequest.create({
				hookName,
				isGlobal,
				workspaceName,
			}),
		)
			.then((response) => {
				if (response.hooksToggles) {
					onDelete(response.hooksToggles)
				}
			})
			.catch((err) => console.error("Failed to delete hook:", err))
	}

	return (
		<div className="mb-2.5">
			<div className="flex items-center px-2 py-1 rounded" style={{ background: "var(--vscode-textBlockQuote-background)" }}>
				<span className="flex-1 overflow-hidden break-all whitespace-normal flex items-center mr-1">
					<span className="ph-no-capture text-sm">{hookName}</span>
				</span>

				{/* Toggle and Actions */}
				<div className="flex items-center gap-2">
					<div
						title={
							isWindows
								? "Hook toggling not supported on Windows. Hooks can be edited and deleted, but won't execute."
								: undefined
						}>
						<VSCodeCheckbox
							checked={enabled}
							disabled={isWindows}
							onChange={() => onToggle(hookName, !enabled)}
							style={isWindows ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
						/>
					</div>
					<VSCodeButton appearance="icon" aria-label="Edit hook file" onClick={handleEditClick} title="Edit hook file">
						<span className="codicon codicon-edit" />
					</VSCodeButton>
					<VSCodeButton
						appearance="icon"
						aria-label="Delete hook file"
						onClick={handleDeleteClick}
						title="Delete hook file">
						<span className="codicon codicon-trash" />
					</VSCodeButton>
				</div>
			</div>
		</div>
	)
}

export default HookRow
