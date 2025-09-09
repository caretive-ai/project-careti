import { PersonaProfile } from "@shared/proto/index.caret"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useState } from "react"
import styled from "styled-components"
import templateCharacters from "@/caret/assets/persona/template_characters.json"
import { useCaretState } from "@/caret/context/CaretStateContext"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"

// CARET MODIFICATION: Convert asset:// URIs to Base64 data URIs using templateCharacters data
const convertAssetToBase64 = async (assetUri: string): Promise<string> => {
	if (!assetUri.startsWith("asset:")) {
		return assetUri
	}

	console.log("🔍 convertAssetToBase64 called with:", assetUri)

	// Find matching character from templateCharacters JSON
	for (const char of templateCharacters) {
		// Check avatar URI
		if (char.avatarUri === assetUri) {
			const windowKey = `templateImage_${char.character}`
			console.log(`✅ Found avatar match for ${char.character}, looking for window.${windowKey}`)
			console.log(`Window key exists:`, !!(window as any)[windowKey])
			if ((window as any)[windowKey]) {
				return (window as any)[windowKey]
			}
		}

		// Check thinking avatar URI
		if (char.thinkingAvatarUri === assetUri) {
			const windowKey = `templateImage_${char.character}thinking`
			console.log(`✅ Found thinking avatar match for ${char.character}, looking for window.${windowKey}`)
			console.log(`Window key exists:`, !!(window as any)[windowKey])
			if ((window as any)[windowKey]) {
				return (window as any)[windowKey]
			}
		}

		// Check illustration URI
		if (char.introIllustrationUri === assetUri) {
			const windowKey = `templateImage_${char.character}illust`
			console.log(`✅ Found illustration match for ${char.character}, looking for window.${windowKey}`)
			console.log(`Window key exists:`, !!(window as any)[windowKey])
			if ((window as any)[windowKey]) {
				return (window as any)[windowKey]
			}
		}
	}

	console.log("❌ No match found for:", assetUri)
	const templateKeys = Object.keys(window).filter((k) => k.startsWith("templateImage_"))
	console.log("Available window keys:", templateKeys)

	// Also check for persona keys
	const personaKeys = Object.keys(window).filter((k) => k.includes("persona") || k.includes("template"))
	console.log("Available persona/template keys:", personaKeys)

	// Special handling for caret (backwards compatibility)
	if (assetUri.includes("caret.png") && (window as any).personaProfile) {
		return (window as any).personaProfile
	}
	if (assetUri.includes("caret_thinking.png") && (window as any).personaThinking) {
		return (window as any).personaThinking
	}

	// Fallback to placeholder
	return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iI2RkZGRkZCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSI0IiBmaWxsPSIjNjY2NjY2Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSIyNCIgcj0iNCIgZmlsbD0iIzY2NjY2NiIvPjxwYXRoIGQ9Ik0yMCA0NCFRM0MgNTAgNDQgNDQiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="
}

// Hook to handle asset:// URI conversion using Base64 logic
const useAssetImage = (assetUri: string) => {
	const [imageUrl, setImageUrl] = useState<string>("")

	useEffect(() => {
		if (!assetUri) {
			setImageUrl("")
			return
		}

		convertAssetToBase64(assetUri)
			.then(setImageUrl)
			.catch(() => {
				// Fallback to placeholder on error
				setImageUrl(
					"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iI2RkZGRkZCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSI0IiBmaWxsPSIjNjY2NjY2Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSIyNCIgcj0iNCIgZmlsbD0iIzY2NjY2NiIvPjxwYXRoIGQ9Ik0yMCA0NCFRM0MgNTAgNDQgNDQiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=",
				)
			})
	}, [assetUri])

	return imageUrl
}

// CARET MODIFICATION: This component has been refactored to be a "dumb component" that
// receives all its data via props and communicates selections via callbacks.
// All direct backend communication (postMessage) has been removed to align with Cline's architecture.

interface PersonaTemplateSelectorProps {
	isOpen: boolean
	onClose: () => void
	onSelectPersona: (profile: PersonaProfile) => void
}

const CharacterTab = styled.button.withConfig({
	shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>`
	border: none;
	background: none;
	padding: 0;
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

interface TabAvatarImageProps {
	characterId: string
	avatarUri: string
	altText: string
}

const TabAvatarImage: React.FC<TabAvatarImageProps> = ({ characterId, avatarUri, altText }) => {
	const avatarImageUrl = useAssetImage(avatarUri)
	return <img alt={altText} className="w-14 h-14 rounded-full object-cover" src={avatarImageUrl} />
}

interface IllustrationImageProps {
	characterId: string
	illustrationUri: string
	altText: string
}

const IllustrationImage: React.FC<IllustrationImageProps> = ({ characterId, illustrationUri, altText }) => {
	const illustrationImageUrl = useAssetImage(illustrationUri)
	return <img alt={altText} className="max-h-48 object-contain my-2" src={illustrationImageUrl} />
}

export const PersonaTemplateSelector: React.FC<PersonaTemplateSelectorProps> = ({ isOpen, onClose, onSelectPersona }) => {
	const [activeTab, setActiveTab] = useState<string>("")
	const { caretSettings } = useExtensionState()
	const { personaProfile, updatePersona } = useCaretState()
	const currentLocale = caretSettings?.uiLanguage || "en"

	// Set default active tab on component mount
	useEffect(() => {
		const defaultChar = templateCharacters.find((c: any) => c.isDefault) || templateCharacters[0]
		if (defaultChar) {
			setActiveTab(defaultChar.character)
		}
	}, [])

	const handleSelect = async (character: any) => {
		const localeData = (character as any)[currentLocale] || character.en

		// Create PersonaProfile with image URIs
		const profile: PersonaProfile = {
			name: localeData.name,
			description: localeData.description,
			customInstruction: JSON.stringify(localeData.customInstruction, null, 2),
			avatarUri: character.avatarUri || "",
			thinkingAvatarUri: character.thinkingAvatarUri || "",
		}

		try {
			// Update window variables for immediate UI feedback (same as manual upload)
			const normalBase64 = await convertAssetToBase64(character.avatarUri || "")
			const thinkingBase64 = await convertAssetToBase64(character.thinkingAvatarUri || "")

			;(window as any).personaProfile = normalBase64
			;(window as any).personaThinking = thinkingBase64

			// Update persona profile
			await updatePersona(profile)

			onSelectPersona(profile)
			onClose()
		} catch (error) {
			console.error("Failed to select persona:", error)
		}
	}

	// Get selected character
	const getSelectedCharacter = () => {
		if (!activeTab || templateCharacters.length === 0) return null
		return templateCharacters.find((char: any) => char.character === activeTab) || templateCharacters[0]
	}

	if (!isOpen) return null

	const activeCharacter = getSelectedCharacter()
	const personaDetails = activeCharacter ? (activeCharacter as any)[currentLocale] || (activeCharacter as any).en : null

	const logImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		console.error("이미지 로드 오류:", e)
		console.log("src URL:", (e.target as HTMLImageElement).src)
	}

	return (
		<div className="fixed inset-0 bg-opacity-50 bg-[rgba(0,0,0,0.3)] backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 px-6">
			<div className="bg-[var(--vscode-sideBar-background)] rounded-lg shadow-lg p-6 w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col mx-4">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-lg font-semibold">{t("selector.title", "persona") || "Select Persona Template"}</h2>
					<VSCodeButton appearance="icon" aria-label="Close" onClick={onClose}>
						<span className="codicon codicon-close"></span>
					</VSCodeButton>
				</div>
				<p className="text-sm text-[var(--vscode-descriptionForeground)] mb-2">
					{t("selector.description", "persona") || "Choose a persona template"}
				</p>

				{/* Character Tabs */}
				<div className="character-tabs mb-4 border-b border-[var(--vscode-settings-headerBorder)]">
					{templateCharacters.map((char: any) => {
						const isActive = activeTab === char.character
						return (
							<CharacterTab
								aria-label={`${char.character} tab`}
								isActive={isActive}
								key={char.character}
								onClick={() => setActiveTab(char.character)}>
								<TabAvatarImage
									altText={char.character}
									avatarUri={char.avatarUri || ""}
									characterId={char.character}
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
							<IllustrationImage
								altText={`${personaDetails.name} illustration`}
								characterId={activeCharacter.character}
								illustrationUri={activeCharacter.introIllustrationUri || ""}
							/>
						</div>

						{/* Description */}
						<div className="h-20 flex items-center justify-center mb-4 px-4">
							<p className="text-sm text-center overflow-y-auto">{personaDetails.description}</p>
						</div>

						{/* Select Button */}
						<VSCodeButton className="w-full" onClick={() => handleSelect(activeCharacter)}>
							{t("selector.selectButtonText", "persona") || "Select This Persona"}
						</VSCodeButton>
					</div>
				)}
			</div>
		</div>
	)
}

export default PersonaTemplateSelector
