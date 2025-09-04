import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import styled from "styled-components"
import { t } from "@/caret/utils/i18n"
import { LINKS } from "@/constants"
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
				<VSCodeLink href={LINKS.DOCUMENTATION.LOCAL_MCP_SERVER_DOCS} style={{ display: "inline" }}>
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
