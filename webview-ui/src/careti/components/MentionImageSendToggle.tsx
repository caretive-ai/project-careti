// CARETI MODIFICATION: Mention image send setting toggle.
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import WebviewLogger from "@/careti/utils/CaretWebviewLogger"
import { t } from "@/careti/utils/i18n"
import { CaretSystemServiceClient } from "@/services/grpc-client"

interface MentionImageSendToggleProps {
	showDescription?: boolean
	className?: string
}

const logger = new WebviewLogger("MentionImageSendToggle")

const MentionImageSendToggle: React.FC<MentionImageSendToggleProps> = ({
	showDescription = true,
	className,
}) => {
	const [enabled, setEnabled] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		let mounted = true
		const loadSetting = async () => {
			try {
				const response = await CaretSystemServiceClient.GetMentionImageSendSetting({})
				if (mounted) {
					setEnabled(response.enabled === true)
				}
			} catch (error) {
				logger.warn("Failed to load mention image setting", error)
			} finally {
				if (mounted) {
					setIsLoading(false)
				}
			}
		}
		void loadSetting()
		return () => {
			mounted = false
		}
	}, [])

	const handleToggle = useCallback(
		async (checked: boolean) => {
			const previous = enabled
			setEnabled(checked)
			try {
				await CaretSystemServiceClient.SetMentionImageSendSetting({ enabled: checked })
			} catch (error) {
				logger.warn("Failed to update mention image setting", error)
				setEnabled(previous)
			}
		},
		[enabled],
	)

	return (
		<div className={className}>
			<VSCodeCheckbox
				checked={enabled}
				disabled={isLoading}
				onChange={(event: any) => {
					const checked = event.target.checked === true
					void handleToggle(checked)
				}}>
				{t("features.mentionImageSend", "settings")}
			</VSCodeCheckbox>
			{showDescription && (
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					{t("features.mentionImageSendDescription", "settings")}
				</p>
			)}
		</div>
	)
}

export default MentionImageSendToggle
