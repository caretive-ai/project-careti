// CARET MODIFICATION: TaskFeedbackButtons wrapper with i18n support
// This component wraps the original TaskFeedbackButtons and adds internationalization
import React, { useEffect, useState } from "react"
import { TaskServiceClient } from "@/services/grpc-client"
import { TaskFeedbackType } from "@shared/WebviewMessage"
import { StringRequest } from "@shared/proto/cline/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import styled from "styled-components"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"

interface TaskFeedbackButtonsWrapperProps {
	messageTs: number
	isFromHistory?: boolean
	style?: React.CSSProperties
}

const IconWrapper = styled.span`
	color: var(--vscode-descriptionForeground);
`

const ButtonWrapper = styled.div`
	transform: scale(0.85);
`

const Container = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
`

const ButtonsContainer = styled.div`
	display: flex;
	gap: 0px;
	opacity: 0.5;

	&:hover {
		opacity: 1;
	}
`

const TaskFeedbackButtonsWrapper: React.FC<TaskFeedbackButtonsWrapperProps> = ({ messageTs, isFromHistory = false, style }) => {
	const [feedback, setFeedback] = useState<TaskFeedbackType | null>(null)
	const [shouldShow, setShouldShow] = useState<boolean>(true)
	const { currentLanguage } = useCaretI18n()

	// Check localStorage on mount to see if feedback was already given for this message
	useEffect(() => {
		try {
			const feedbackHistory = localStorage.getItem("taskFeedbackHistory") || "{}"
			const history = JSON.parse(feedbackHistory)
			// Check if this specific message timestamp has received feedback
			if (history[messageTs]) {
				setShouldShow(false)
			}
		} catch (e) {
			console.error("Error checking feedback history:", e)
		}
	}, [messageTs])

	// Don't show buttons if this is from history or feedback was already given
	if (isFromHistory || !shouldShow) {
		return null
	}

	const handleFeedback = async (type: TaskFeedbackType) => {
		if (feedback !== null) return // Already provided feedback

		setFeedback(type)

		try {
			await TaskServiceClient.taskFeedback(
				StringRequest.create({
					value: type,
				}),
			)

			// Store in localStorage that feedback was provided for this message
			try {
				const feedbackHistory = localStorage.getItem("taskFeedbackHistory") || "{}"
				const history = JSON.parse(feedbackHistory)
				history[messageTs] = true
				localStorage.setItem("taskFeedbackHistory", JSON.stringify(history))
			} catch (e) {
				console.error("Error updating feedback history:", e)
			}
		} catch (error) {
			console.error("Error sending task feedback:", error)
		}
	}

	return (
		<Container style={style}>
			<ButtonsContainer>
				<ButtonWrapper>
					<VSCodeButton
						appearance="icon"
						onClick={() => handleFeedback("thumbs_up")}
						disabled={feedback !== null}
						title={t("feedback.helpful", "common")}
						aria-label={t("feedback.helpful", "common")}>
						<IconWrapper>
							<span
								className={`codicon ${feedback === "thumbs_up" ? "codicon-thumbsup-filled" : "codicon-thumbsup"}`}
							/>
						</IconWrapper>
					</VSCodeButton>
				</ButtonWrapper>
				<ButtonWrapper>
					<VSCodeButton
						appearance="icon"
						onClick={() => handleFeedback("thumbs_down")}
						disabled={feedback !== null && feedback !== "thumbs_down"}
						title={t("feedback.notHelpful", "common")}
						aria-label={t("feedback.notHelpful", "common")}>
						<IconWrapper>
							<span
								className={`codicon ${
									feedback === "thumbs_down" ? "codicon-thumbsdown-filled" : "codicon-thumbsdown"
								}`}
							/>
						</IconWrapper>
					</VSCodeButton>
				</ButtonWrapper>
			</ButtonsContainer>
		</Container>
	)
}

export default TaskFeedbackButtonsWrapper
