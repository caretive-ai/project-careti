import React, { useState, useContext, useEffect } from "react"
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import { caretWebviewLogger } from "@/caret/utils/webview-logger"
import { PersonaTemplateSelector } from "./PersonaTemplateSelector"
import type { PersonaInstruction, TemplateCharacter } from "../../../../src/shared/persona"
import { ExtensionStateContext } from "../../context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { WebviewMessage } from "../../../../src/shared/WebviewMessage"
import PersonaAvatar from "./PersonaAvatar"

interface PersonaManagementProps {
	className?: string
}

export const PersonaManagement: React.FC<PersonaManagementProps> = ({ className }) => {
	const [isSelectorOpen, setIsSelectorOpen] = useState(false)
	const [selectedPersona, setSelectedPersona] = useState<TemplateCharacter | null>(null)
	const [currentInstruction, setCurrentInstruction] = useState<string>("")
	const [uploadMessage, setUploadMessage] = useState<string>("")
	const [isUploading, setIsUploading] = useState<boolean>(false)
	const extensionState = useContext(ExtensionStateContext)
	const currentLocale = extensionState?.chatSettings?.uiLanguage || "en"

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

					vscode.postMessage({
						type: "UPLOAD_CUSTOM_PERSONA_IMAGE",
						payload: {
							imageType,
							imageData: base64,
							personaCharacter: selectedPersona?.character,
						},
					} as WebviewMessage)
				}
				reader.readAsDataURL(file)
			}
		}
		input.setAttribute("data-testid", `${imageType}-image-input`)
		input.click()
	}

	useEffect(() => {
		vscode.postMessage({
			type: "REQUEST_TEMPLATE_CHARACTERS",
		})

		vscode.postMessage({
			type: "REQUEST_RULE_FILE_CONTENT",
			payload: { ruleName: "custom_instructions.md", isGlobal: true },
		})
	}, [])

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data

			if (message.type === "RESPONSE_TEMPLATE_CHARACTERS") {
				const characters: TemplateCharacter[] = message.payload
				caretWebviewLogger.debug("Received template characters:", characters)

				if (currentInstruction && currentInstruction.trim() && characters.length > 0) {
					caretWebviewLogger.debug("Current instruction:", currentInstruction)

					const matchedPersona = characters.find((char) => {
						const localeDetails = (char[currentLocale as keyof typeof char] as any) || char.en
						const personaJson = JSON.stringify(localeDetails.customInstruction, null, 2)
						caretWebviewLogger.debug(`Comparing with ${char.character}:`, personaJson)
						return personaJson === currentInstruction
					})

					if (matchedPersona) {
						caretWebviewLogger.debug("Found matched persona:", matchedPersona.character)
						setSelectedPersona(matchedPersona)
					} else {
						caretWebviewLogger.debug("No matched persona found, using default")
						const defaultPersona = characters.find((c) => c.isDefault) || characters[0]
						if (defaultPersona) setSelectedPersona(defaultPersona)
					}
				} else if (characters.length > 0) {
					const defaultPersona = characters.find((c) => c.isDefault) || characters[0]
					if (defaultPersona) setSelectedPersona(defaultPersona)
				}
			}

			if (message.type === "RESPONSE_RULE_FILE_CONTENT" && message.payload.ruleName === "custom_instructions.md") {
				setCurrentInstruction(message.payload.content)
			}

			if (message.type === "UPLOAD_CUSTOM_PERSONA_IMAGE_RESPONSE") {
				setIsUploading(false)
				if (message.payload?.success) {
					setUploadMessage(t("upload.success", "persona"))

					// CARET MODIFICATION: Improved upload response handling with savedPath
					if (message.payload.savedPath) {
						caretWebviewLogger.info(`Custom persona image saved to: ${message.payload.savedPath}`)
					}

					// Also refresh persona templates
					vscode.postMessage({
						type: "REQUEST_TEMPLATE_CHARACTERS",
					})
				} else {
					const errorMsg = message.payload?.error || "Unknown error"
					caretWebviewLogger.error(`Persona image upload failed: ${errorMsg}`)
					setUploadMessage(t("upload.error", "persona"))
				}
			}

			if (message.type === "PERSONA_UPDATED") {
				vscode.postMessage({
					type: "REQUEST_TEMPLATE_CHARACTERS",
				})
				vscode.postMessage({
					type: "REQUEST_RULE_FILE_CONTENT",
					payload: { ruleName: "custom_instructions.md", isGlobal: true },
				})
			}
		}

		window.addEventListener("message", handleMessage)
		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [currentLocale, currentInstruction])

	useEffect(() => {
		if (currentInstruction && currentInstruction.trim()) {
			vscode.postMessage({
				type: "REQUEST_TEMPLATE_CHARACTERS",
			})
		}
	}, [currentInstruction])

	// CARET MODIFICATION: Receive TemplateCharacter and send image URIs to backend
	const handlePersonaSelected = (character: TemplateCharacter) => {
		caretWebviewLogger.debug("Persona selected:", character)
		const localeDetails = (character[currentLocale as keyof typeof character] as any) || character.en

		vscode.postMessage({
			type: "UPDATE_PERSONA_CUSTOM_INSTRUCTION",
			payload: {
				personaInstruction: localeDetails.customInstruction,
				// CARET MODIFICATION: Add avatarUri and thinkingAvatarUri to the payload
				avatarUri: character.avatarUri,
				thinkingAvatarUri: character.thinkingAvatarUri,
			},
		} as WebviewMessage)

		setCurrentInstruction(JSON.stringify(localeDetails.customInstruction, null, 2))

		setIsSelectorOpen(false)

		// CARET MODIFICATION: 글로벌 변수 업데이트로 새로 마운트되는 컴포넌트가 최신 이미지를 즉시 사용
		;(window as any).personaProfile = character.avatarUri
		;(window as any).personaThinking = character.thinkingAvatarUri

		// Let other components know that the persona has been updated
		window.postMessage({ type: "PERSONA_UPDATED" }, "*")
	}

	const getPersonaName = () => {
		if (!selectedPersona) return ""
		const localeDetails = (selectedPersona[currentLocale as keyof typeof selectedPersona] as any) || selectedPersona.en
		return localeDetails?.name || ""
	}

	return (
		<div className={className} data-testid="persona-management">
			<div className="text-sm font-normal mb-2">{t("rules.section.personaManagement", "common")}</div>

			<div className="mb-4 mt-2">
				<div className="flex justify-center space-x-4 mb-2">
					<div className="text-center">
						<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1">{t("normalState", "persona")}</div>
						<PersonaAvatar isThinking={false} size={80} />
						<VSCodeButton
							appearance="icon"
							className="mt-2"
							onClick={() => handleImageUpload("normal")}
							disabled={isUploading}
							title={t("upload.normal", "persona")}>
							<span className="codicon codicon-cloud-upload"></span>
						</VSCodeButton>
					</div>
					<div className="text-center">
						<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1">
							{t("thinkingState", "persona")}
						</div>
						<PersonaAvatar isThinking={true} size={80} />
						<VSCodeButton
							appearance="icon"
							className="mt-2"
							onClick={() => handleImageUpload("thinking")}
							disabled={isUploading}
							title={t("upload.thinking", "persona")}>
							<span className="codicon codicon-cloud-upload"></span>
						</VSCodeButton>
					</div>
				</div>

				{(uploadMessage || isUploading) && (
					<div className="text-center mt-2">
						{isUploading ? (
							<span className="text-xs text-[var(--vscode-descriptionForeground)]">Uploading...</span>
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
				<VSCodeButton appearance="secondary" onClick={() => handleImageUpload("normal")} disabled={isUploading}>
					{t("upload.normal", "persona")}
				</VSCodeButton>
				<VSCodeButton appearance="secondary" onClick={() => handleImageUpload("thinking")} disabled={isUploading}>
					{t("upload.thinking", "persona")}
				</VSCodeButton>
			</div>

			<div className="flex justify-end">
				<VSCodeButton appearance="secondary" onClick={handleSelectPersonaTemplate}>
					{selectedPersona
						? t("rules.button.changePersonaTemplate", "common")
						: t("rules.button.selectPersonaTemplate", "common")}
				</VSCodeButton>
			</div>

			{isSelectorOpen && (
				<PersonaTemplateSelector
					isOpen={isSelectorOpen}
					onClose={handleCloseSelector}
					onSelectPersona={handlePersonaSelected}
					currentLocale={currentLocale}
				/>
			)}
		</div>
	)
}

export default PersonaManagement
