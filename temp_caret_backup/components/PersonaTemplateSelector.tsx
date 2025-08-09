import React, { useState, useEffect } from "react"
import { vscode } from "@/utils/vscode"
import { t } from "@/caret/utils/i18n"
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react"
import styled from "styled-components"
import type { TemplateCharacter, PersonaInstruction } from "../../../../src/shared/persona"

interface PersonaTemplateSelectorProps {
	isOpen: boolean
	onClose: () => void
	// CARET MODIFICATION: Pass the entire TemplateCharacter object instead of just PersonaInstruction
	onSelectPersona: (character: TemplateCharacter) => void
	currentLocale: string
	// For testing purposes
	testCharacters?: TemplateCharacter[]
}

const CharacterTab = styled.button.withConfig({
	shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>`
	border: none;
	background: none;
	padding: 0; /* CARET MODIFICATION: Remove padding to reduce spacing */
	margin: 0;
	cursor: pointer;
	opacity: ${(props) => (props.isActive ? 1 : 0.5)};
	border-bottom: 2px solid ${(props) => (props.isActive ? "var(--vscode-focusBorder)" : "transparent")};
	transition: all 0.2s ease-in-out;

	&:hover {
		opacity: 0.8;
	}

	img {
		border: 2px solid ${(props) => (props.isActive ? "var(--vscode-focusBorder)" : "transparent")};
		transition: all 0.2s ease-in-out;
	}
`

export const PersonaTemplateSelector: React.FC<PersonaTemplateSelectorProps> = ({
	isOpen,
	onClose,
	onSelectPersona,
	currentLocale,
	testCharacters,
}) => {
	const [characters, setCharacters] = useState<TemplateCharacter[]>(testCharacters || [])
	const [selectedInstruction, setSelectedInstruction] = useState<string>("")
	const [activeTab, setActiveTab] = useState<string>("")

	useEffect(() => {
		// For testing, if testCharacters are provided, set initial activeTab
		if (testCharacters && testCharacters.length > 0) {
			const defaultChar = testCharacters.find((c) => c.isDefault) || testCharacters[0]
			if (defaultChar) {
				setActiveTab(defaultChar.character)
			}
		} else {
			vscode.postMessage({
				type: "REQUEST_TEMPLATE_CHARACTERS",
			})
		}
		vscode.postMessage({
			type: "REQUEST_RULE_FILE_CONTENT",
			payload: { ruleName: "custom_instructions.md", isGlobal: true },
		})
	}, [testCharacters])

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "RESPONSE_TEMPLATE_CHARACTERS") {
				const chars = message.payload
				setCharacters(chars)
				// Set default active tab to the first character or the default character
				const defaultChar = chars.find((c: TemplateCharacter) => c.isDefault) || (chars.length > 0 ? chars[0] : null)
				if (defaultChar) {
					setActiveTab(defaultChar.character)
				}
			}
			if (message.type === "RESPONSE_RULE_FILE_CONTENT" && message.payload.ruleName === "custom_instructions.md") {
				setSelectedInstruction(message.payload.content)
			}
		}

		window.addEventListener("message", handleMessage)
		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [])

	if (!isOpen) {
		return null
	}

	const handleSelect = (character: TemplateCharacter) => {
		// CARET MODIFICATION: Pass the entire TemplateCharacter object
		onSelectPersona(character)
		onClose()
	}

	// Find the currently selected character
	const getSelectedCharacter = () => {
		if (!activeTab || characters.length === 0) return null
		return characters.find((char) => char.character === activeTab) || characters[0]
	}

	const activeCharacter = getSelectedCharacter()
	const personaDetails = activeCharacter
		? (activeCharacter[currentLocale as keyof typeof activeCharacter] as any) || activeCharacter.en
		: null
	const isCurrentlySelected = activeCharacter
		? JSON.stringify(personaDetails?.customInstruction, null, 2) === selectedInstruction
		: false

	// 이미지 로드 오류 처리
	const logImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		console.error("이미지 로드 오류:", e)
		console.log("src URL:", (e.target as HTMLImageElement).src)
	}

	return (
		<div className="fixed inset-0 bg-opacity-50 bg-[rgba(0,0,0,0.3)] backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 px-6">
			<div className="bg-[var(--vscode-sideBar-background)] rounded-lg shadow-lg p-6 w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col mx-4">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-lg font-semibold">{t("selector.title", "persona")}</h2>
					<VSCodeButton appearance="icon" aria-label="Close" onClick={onClose}>
						<span className="codicon codicon-close"></span>
					</VSCodeButton>
				</div>
				<p className="text-sm text-[var(--vscode-descriptionForeground)] mb-2">{t("selector.description", "persona")}</p>

				{/* Character Tabs */}
				{/* CARET MODIFICATION: Apply character-tabs class for grid layout */}
				<div className="character-tabs mb-4 border-b border-[var(--vscode-settings-headerBorder)]">
					{characters.map((char) => {
						const isActive = activeTab === char.character
						return (
							<CharacterTab
								key={char.character}
								isActive={isActive}
								onClick={() => setActiveTab(char.character)}
								aria-label={`${char.character} tab`}>
								<img
									src={char.avatarUri}
									alt={char.character}
									className="w-14 h-14 rounded-full object-cover"
									onError={logImageError}
								/>
							</CharacterTab>
						)
					})}
				</div>

				{/* Selected Character Content */}
				{activeCharacter && personaDetails && (
					<div className="flex flex-col items-center overflow-y-auto">
						<h3 className="text-xl font-bold mb-2">{personaDetails.name}</h3>

						{/* Character Illustration */}
						<div className="w-full bg-[var(--vscode-editor-background)] rounded-md mb-4 flex justify-center">
							<img
								src={activeCharacter.introIllustrationUri}
								alt={`${personaDetails.name} illustration`}
								className="max-h-48 object-contain my-2"
								onError={logImageError}
							/>
						</div>

						{/* Description - Fixed height for consistent UI */}
						<div className="h-20 flex items-center justify-center mb-4 px-4">
							<p className="text-sm text-center overflow-y-auto">{personaDetails.description}</p>
						</div>

						{/* Select Button */}
						<VSCodeButton
							onClick={() => handleSelect(activeCharacter)}
							disabled={isCurrentlySelected}
							className="w-full">
							{isCurrentlySelected
								? t("selector.selectedButtonText", "persona")
								: t("selector.selectButtonText", "persona")}
						</VSCodeButton>
					</div>
				)}
			</div>
		</div>
	)
}
