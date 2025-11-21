import React from "react"
import { t } from "@/caret/utils/i18n"
import MarkdownBlock from "../common/MarkdownBlock"

interface ReportBugPreviewProps {
	data: string
}

const ReportBugPreview: React.FC<ReportBugPreviewProps> = ({ data }) => {
	// Parse the JSON data from the context string
	const bugData = React.useMemo(() => {
		try {
			return JSON.parse(data || "{}")
		} catch (e) {
			console.error("Failed to parse bug report data", e)
			return {}
		}
	}, [data])

	return (
		<div className="bg-[var(--vscode-badge-background)] text-[var(--vscode-badge-foreground)] rounded-[3px] p-[14px]">
			<h3 className="font-bold text-base mb-3 mt-0">{bugData.title || t("bugReport.title", "chat")}</h3>

			<div className="space-y-3 text-sm">
				{bugData.what_happened && (
					<div>
						<div className="font-semibold">{t("bugReport.whatHappened", "chat")}</div>
						<MarkdownBlock markdown={bugData.what_happened} />
					</div>
				)}

				{bugData.steps_to_reproduce && (
					<div>
						<div className="font-semibold">{t("bugReport.stepsToReproduce", "chat")}</div>
						<MarkdownBlock markdown={bugData.steps_to_reproduce} />
					</div>
				)}

				{bugData.api_request_output && (
					<div>
						<div className="font-semibold">{t("bugReport.relevantApiRequestOutput", "chat")}</div>
						<MarkdownBlock markdown={bugData.api_request_output} />
					</div>
				)}

				{bugData.provider_and_model && (
					<div>
						<div className="font-semibold">{t("bugReport.providerModel", "chat")}</div>
						<MarkdownBlock markdown={bugData.provider_and_model} />
					</div>
				)}

				{bugData.operating_system && (
					<div>
						<div className="font-semibold">{t("bugReport.operatingSystem", "chat")}</div>
						<MarkdownBlock markdown={bugData.operating_system} />
					</div>
				)}

				{bugData.system_info && (
					<div>
						<div className="font-semibold">{t("bugReport.systemInfo", "chat")}</div>
						<MarkdownBlock markdown={bugData.system_info} />
					</div>
				)}

				{bugData.cline_version && (
					<div>
						<div className="font-semibold">{t("bugReport.clineVersion", "chat")}</div>
						<MarkdownBlock markdown={bugData.cline_version} />
					</div>
				)}

				{bugData.additional_context && (
					<div>
						<div className="font-semibold">{t("bugReport.additionalContext", "chat")}</div>
						<MarkdownBlock markdown={bugData.additional_context} />
					</div>
				)}
			</div>
		</div>
	)
}

export default ReportBugPreview
