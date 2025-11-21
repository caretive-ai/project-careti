import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import styled from "styled-components"
// CARET MODIFICATION: 다국어 URL 지원을 위해 getLocalizedUrl 및 getCurrentLanguage 임포트
import { getLocalizedUrl } from "@/caret/constants/urls"
import { getCurrentLanguage, t } from "@/caret/utils/i18n"
import { McpServiceClient } from "@/services/grpc-client"

type AddLocalServerFormProps = {
	onServerAdded: () => void
}

const AddLocalServerForm = ({ onServerAdded }: AddLocalServerFormProps) => {
	return (
		<FormContainer>
			<div className="text-[var(--vscode-foreground)]">
				{t("addLocalServerForm.addLocalServerDescriptionPart1", "chat")}{" "}
				<code>{t("addLocalServerForm.clineMcpSettingsJson", "chat")}</code>
				{t("addLocalServerForm.addLocalServerDescriptionPart2", "chat")}
				{/* CARET MODIFICATION: 다국어 문서 URL을 동적으로 가져오도록 수정 */}
				<VSCodeLink href={getLocalizedUrl("LOCAL_MCP_SERVER_DOCS", getCurrentLanguage())} style={{ display: "inline" }}>
					{t("addLocalServerForm.here", "chat")}
				</VSCodeLink>
			</div>

			<VSCodeButton
				appearance="primary"
				onClick={() => {
					McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
						console.error("Error opening MCP settings:", error)
					})
				}}
				style={{ width: "100%", marginBottom: "5px", marginTop: 8 }}>
				{t("addLocalServerForm.openClineMcpSettingsJson", "chat")}
			</VSCodeButton>
		</FormContainer>
	)
}

const FormContainer = styled.div`
	padding: 16px 20px;
	display: flex;
	flex-direction: column;
	gap: 8px;
`

export default AddLocalServerForm
