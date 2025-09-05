import { PersonaProfile } from "@shared/proto/index.caret"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useState } from "react"
import { useCaretState } from "@/caret/context/CaretStateContext"
import { t } from "@/caret/utils/i18n"
import { caretWebviewLogger } from "@/caret/utils/webview-logger"
import PersonaAvatar from "./PersonaAvatar"
import { PersonaTemplateSelector } from "./PersonaTemplateSelector"

// CARET MODIFICATION: This component has been refactored to use the dedicated `CaretStateContext`.
// - It consumes `personaProfile` and `updatePersona` from the `useCaretState` hook.
// - This decouples the component from the core `ExtensionStateContext` and centralizes
//   persona logic within its own context, improving modularity and maintainability.
// Ported from caret-compare with path changes: /assets/ → /assets/ (already applied in JSON)

interface PersonaManagementProps {
	className?: string
}

export const PersonaManagement: React.FC<PersonaManagementProps> = ({ className }) => {
	const [isSelectorOpen, setIsSelectorOpen] = useState(false)
	const [uploadMessage, setUploadMessage] = useState<string>("")
	const [isUploading, setIsUploading] = useState<boolean>(false)
	const { personaProfile, updatePersona } = useCaretState()

	const handleSelectPersonaTemplate = () => {
		caretWebviewLogger.debug("Persona template selector button clicked. Opening modal...")
		setIsSelectorOpen(true)
	}

	const handleCloseSelector = () => {
		setIsSelectorOpen(false)
		caretWebviewLogger.debug("Persona template selector modal closed.")
	}

	const handleImageUpload = (imageType: "normal" | "thinking") => {
		const input = document.createElement("input")
		input.type = "file"
		input.accept = "image/*"
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0]
			if (file) {
				const reader = new FileReader()
				reader.onload = () => {
					const base64 = reader.result as string
					setIsUploading(true)
					setUploadMessage("")

					// TODO: Replace with gRPC service call
					// For now, update window variables directly for immediate UI feedback
					try {
						if (imageType === "normal") {
							;(window as any).personaProfile = base64
						} else {
							;(window as any).personaThinking = base64
						}

						setUploadMessage(t("upload.success", "persona") || "Upload successful!")
						caretWebviewLogger.info("Image uploaded successfully", { imageType })
					} catch (error) {
						setUploadMessage(t("upload.error", "persona") || "Upload failed!")
						caretWebviewLogger.error("Image upload failed", error)
					} finally {
						setIsUploading(false)
					}
				}
				reader.readAsDataURL(file)
			}
		}
		input.setAttribute("data-testid", `${imageType}-image-input`)
		input.click()
	}

	const handlePersonaSelected = (profile: PersonaProfile) => {
		caretWebviewLogger.debug("Persona selected via modal:", profile)
		updatePersona(profile)
			.catch((error) => {
				// The context handles the error logging and rollback,
				// but we could add additional UI feedback here if needed.
				caretWebviewLogger.error("handlePersonaSelected failed:", error)
			})
			.finally(() => {
				setIsSelectorOpen(false)
			})
	}

	return (
		<div className={className} data-testid="persona-management">
			<div className="text-sm font-normal mb-2">{t("rules.section.personaManagement", "common")}</div>

			<div className="mb-4 mt-2">
				<div className="flex justify-center space-x-4 mb-2">
					<div className="text-center">
						<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1">
							{t("normalState", "persona")}
						</div>
						<PersonaAvatar isThinking={false} personaProfile={personaProfile} size={80} />
						<VSCodeButton
							appearance="icon"
							className="mt-2"
							disabled={isUploading}
							onClick={() => handleImageUpload("normal")}
							title={t("upload.normal", "persona") || "Upload normal image"}>
							<span className="codicon codicon-cloud-upload"></span>
						</VSCodeButton>
					</div>
					<div className="text-center">
						<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1">
							{t("thinkingState", "persona")}
						</div>
						<PersonaAvatar isThinking={true} personaProfile={personaProfile} size={80} />
						<VSCodeButton
							appearance="icon"
							className="mt-2"
							disabled={isUploading}
							onClick={() => handleImageUpload("thinking")}
							title={t("upload.thinking", "persona") || "Upload thinking image"}>
							<span className="codicon codicon-cloud-upload"></span>
						</VSCodeButton>
					</div>
				</div>

				{(uploadMessage || isUploading) && (
					<div className="text-center mt-2">
						{isUploading ? (
							<span className="text-xs text-[var(--vscode-descriptionForeground)]">
								{t("upload.uploading", "persona") || "Uploading..."}
							</span>
						) : uploadMessage ? (
							<span
								className={`text-xs ${
									uploadMessage.includes("success") || uploadMessage.includes("성공")
										? "text-[var(--vscode-charts-green)]"
										: "text-[var(--vscode-errorForeground)]"
								}`}>
								{uploadMessage}
							</span>
						) : null}
					</div>
				)}
			</div>

			<div className="flex justify-center space-x-2 mb-4">
				<VSCodeButton appearance="secondary" disabled={isUploading} onClick={() => handleImageUpload("normal")}>
					{t("upload.normal", "persona") || "Change Normal Image"}
				</VSCodeButton>
				<VSCodeButton appearance="secondary" disabled={isUploading} onClick={() => handleImageUpload("thinking")}>
					{t("upload.thinking", "persona") || "Change Thinking Image"}
				</VSCodeButton>
			</div>

			<div className="flex justify-end">
				<VSCodeButton appearance="secondary" onClick={handleSelectPersonaTemplate}>
					{t("rules.button.changePersonaTemplate", "common")}
				</VSCodeButton>
			</div>

			{isSelectorOpen && (
				<PersonaTemplateSelector
					isOpen={isSelectorOpen}
					onClose={handleCloseSelector}
					onSelectPersona={handlePersonaSelected}
				/>
			)}
		</div>
	)
}

export default PersonaManagement
