import { PersonaProfile } from "@shared/proto/index.careti"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useState } from "react"
import styled from "styled-components"
// CARETI MODIFICATION: Inline template character assets (base64) to avoid webview 403
import caretAvatar from "@/careti/assets/template_characters/careti.webp?inline"
import caretIllust from "@/careti/assets/template_characters/careti_illust.webp?inline"
import caretThinking from "@/careti/assets/template_characters/careti-thinking.webp?inline"
import cyanAvatar from "@/careti/assets/template_characters/cyan.webp?inline"
import cyanIllust from "@/careti/assets/template_characters/cyan_illust.webp?inline"
import cyanThinking from "@/careti/assets/template_characters/cyan_thinking.webp?inline"
import ichikaAvatar from "@/careti/assets/template_characters/ichika.webp?inline"
import ichikaIllust from "@/careti/assets/template_characters/ichika_illust.webp?inline"
import ichikaThinking from "@/careti/assets/template_characters/ichika_thinking.webp?inline"
import sarangAvatar from "@/careti/assets/template_characters/sarang.webp?inline"
import sarangIllust from "@/careti/assets/template_characters/sarang_illust.webp?inline"
import sarangThinking from "@/careti/assets/template_characters/sarang_thinking.webp?inline"
import templateCharacters from "@/careti/assets/template_characters/template_characters.json"
import ubuntuAvatar from "@/careti/assets/template_characters/ubuntu.webp?inline"
import ubuntuIllust from "@/careti/assets/template_characters/ubuntu_illust.webp?inline"
import ubuntuThinking from "@/careti/assets/template_characters/ubuntu_thinking.webp?inline"
import { useCaretState } from "@/careti/context/CaretStateContext"
import { t } from "@/careti/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretWebviewLogger } from "../utils/webview-logger"

// Basename map for bare filenames (403 방지)
const filenameMap: Record<string, string> = {
	"careti.webp": caretAvatar,
	"careti.png": caretAvatar,
	"careti-thinking.webp": caretThinking,
	"careti-thinking.png": caretThinking,
	"caret_thinking.webp": caretThinking,
	"caret_thinking.png": caretThinking,
	"careti_illust.webp": caretIllust,
	"careti_illust.png": caretIllust,
	"caret_illust.webp": caretIllust,
	"caret_illust.png": caretIllust,
	"caret_profile.png": caretAvatar,
	"sarang.webp": sarangAvatar,
	"sarang.png": sarangAvatar,
	"sarang_thinking.webp": sarangThinking,
	"sarang_thinking.png": sarangThinking,
	"sarang_illust.webp": sarangIllust,
	"sarang_illust.png": sarangIllust,
	"sarang_profile.png": sarangAvatar,
	"ichika.webp": ichikaAvatar,
	"ichika.png": ichikaAvatar,
	"ichika_thinking.webp": ichikaThinking,
	"ichika_thinking.png": ichikaThinking,
	"ichika_illust.webp": ichikaIllust,
	"ichika_illust.png": ichikaIllust,
	"ichika_profile.png": ichikaAvatar,
	"cyan.webp": cyanAvatar,
	"cyan.png": cyanAvatar,
	"cyan_thinking.webp": cyanThinking,
	"cyan_thinking.png": cyanThinking,
	"cyan_illust.webp": cyanIllust,
	"cyan_illust.png": cyanIllust,
	"cyan_profile.png": cyanAvatar,
	"ubuntu.webp": ubuntuAvatar,
	"ubuntu.png": ubuntuAvatar,
	"ubuntu_thinking.webp": ubuntuThinking,
	"ubuntu_thinking.png": ubuntuThinking,
	"ubuntu_illust.webp": ubuntuIllust,
	"ubuntu_illust.png": ubuntuIllust,
	"ubuntu_profile.png": ubuntuAvatar,
}

const convertAssetToBase64 = async (assetUri: string): Promise<string> => {
	// Direct URL or data URL (handle bare filenames by mapping below)
	if (!assetUri.startsWith("asset:") && !assetUri.startsWith("asset://")) {
		// Try basename mapping for bare filenames
		const basename = assetUri.split("/").pop() || assetUri
		const mappedFromName = filenameMap[basename]
		if (mappedFromName) {
			return mappedFromName
		}
		return assetUri
	}

	const assetMap: Record<string, string> = {
		"asset:/assets/template_characters/careti.webp": caretAvatar,
		"asset:/assets/template_characters/careti.png": caretAvatar,
		"asset:/assets/template_characters/careti-thinking.webp": caretThinking,
		"asset:/assets/template_characters/careti-thinking.png": caretThinking,
		"asset:/assets/template_characters/caret_thinking.webp": caretThinking,
		"asset:/assets/template_characters/caret_thinking.png": caretThinking,
		"asset:/assets/template_characters/careti_illust.webp": caretIllust,
		"asset:/assets/template_characters/careti_illust.png": caretIllust,
		"asset://template_characters/careti.webp": caretAvatar,
		"asset://template_characters/careti.png": caretAvatar,
		"asset://template_characters/caret_profile.png": caretAvatar,
		"asset://template_characters/careti-thinking.webp": caretThinking,
		"asset://template_characters/careti-thinking.png": caretThinking,
		"asset://template_characters/caret_thinking.webp": caretThinking,
		"asset://template_characters/caret_thinking.png": caretThinking,
		"asset:/assets/template_characters/sarang.webp": sarangAvatar,
		"asset:/assets/template_characters/sarang.png": sarangAvatar,
		"asset:/assets/template_characters/sarang_thinking.webp": sarangThinking,
		"asset:/assets/template_characters/sarang_thinking.png": sarangThinking,
		"asset:/assets/template_characters/sarang_illust.webp": sarangIllust,
		"asset:/assets/template_characters/sarang_illust.png": sarangIllust,
		"asset://template_characters/sarang_profile.png": sarangAvatar,
		"asset://template_characters/sarang_thinking.png": sarangThinking,
		"asset:/assets/template_characters/ichika.webp": ichikaAvatar,
		"asset:/assets/template_characters/ichika.png": ichikaAvatar,
		"asset:/assets/template_characters/ichika_thinking.webp": ichikaThinking,
		"asset:/assets/template_characters/ichika_thinking.png": ichikaThinking,
		"asset:/assets/template_characters/ichika_illust.webp": ichikaIllust,
		"asset:/assets/template_characters/ichika_illust.png": ichikaIllust,
		"asset://template_characters/ichika_profile.png": ichikaAvatar,
		"asset://template_characters/ichika_thinking.png": ichikaThinking,
		"asset:/assets/template_characters/cyan.webp": cyanAvatar,
		"asset:/assets/template_characters/cyan.png": cyanAvatar,
		"asset:/assets/template_characters/cyan_thinking.webp": cyanThinking,
		"asset:/assets/template_characters/cyan_thinking.png": cyanThinking,
		"asset:/assets/template_characters/cyan_illust.webp": cyanIllust,
		"asset:/assets/template_characters/cyan_illust.png": cyanIllust,
		"asset://template_characters/cyan_profile.png": cyanAvatar,
		"asset://template_characters/cyan_thinking.png": cyanThinking,
		"asset:/assets/template_characters/ubuntu.webp": ubuntuAvatar,
		"asset:/assets/template_characters/ubuntu.png": ubuntuAvatar,
		"asset:/assets/template_characters/ubuntu_thinking.webp": ubuntuThinking,
		"asset:/assets/template_characters/ubuntu_thinking.png": ubuntuThinking,
		"asset:/assets/template_characters/ubuntu_illust.webp": ubuntuIllust,
		"asset:/assets/template_characters/ubuntu_illust.png": ubuntuIllust,
		"asset://template_characters/ubuntu_profile.png": ubuntuAvatar,
		"asset://template_characters/ubuntu_thinking.png": ubuntuThinking,
	}

	// If starts with asset:, convert
	if (assetUri in assetMap) {
		return assetMap[assetUri]
	}

	// Fallback by basename for asset:// or bare filenames
	const basename = assetUri.split("/").pop() || ""
	if (filenameMap[basename]) {
		return filenameMap[basename]
	}

	for (const char of templateCharacters) {
		if (char.avatarUri === assetUri) {
			const windowKey = `templateImage_${char.character}`
			if ((window as any)[windowKey]) {
				return (window as any)[windowKey]
			}
		}
		if (char.thinkingAvatarUri === assetUri) {
			const windowKey = `templateImage_${char.character}thinking`
			if ((window as any)[windowKey]) {
				return (window as any)[windowKey]
			}
		}
		if (char.introIllustrationUri === assetUri) {
			const windowKey = `templateImage_${char.character}illust`
			if ((window as any)[windowKey]) {
				return (window as any)[windowKey]
			}
		}
	}
	if (
		(assetUri.includes("careti.webp") ||
			assetUri.includes("careti.png") ||
			assetUri.includes("careti_profile") ||
			assetUri.includes("careti.webp") ||
			assetUri.includes("careti.png") ||
			assetUri.includes("caret_profile")) &&
		(window as any).personaProfile
	) {
		return (window as any).personaProfile
	}
	if (
		(assetUri.includes("careti-thinking") || assetUri.includes("careti_thinking") || assetUri.includes("caret_thinking")) &&
		(window as any).personaThinking
	) {
		return (window as any).personaThinking
	}
	return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iI2RkZGRkZCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSI0IiBmaWxsPSIjNjY2NjY2Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSIyNCIgcj0iNCIgZmlsbD0iIzY2NjY2NiIvPjxwYXRoIGQ9Ik0yMCA0NCFRM0MgNTAgNDQgNDQiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="
}

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
				setImageUrl(
					"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iI2RkZGRkZCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSI0IiBmaWxsPSIjNjY2NjY2Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSIyNCIgcj0iNCIgZmlsbD0iIzY2NjY2NiIvPjxwYXRoIGQ9Ik0yMCA0NCFRM0MgNTAgNDQgNDQiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=",
				)
			})
	}, [assetUri])
	return imageUrl
}

interface PersonaTemplateSelectorProps {
	isOpen?: boolean
	onClose?: () => void
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

const TabAvatarImage: React.FC<{ characterId: string; avatarUri: string; altText: string }> = ({
	characterId,
	avatarUri,
	altText,
}) => {
	const avatarImageUrl = useAssetImage(avatarUri)
	return <img alt={altText} className="w-14 h-14 rounded-full object-cover" src={avatarImageUrl} />
}

const IllustrationImage: React.FC<{ characterId: string; illustrationUri: string; altText: string }> = ({
	characterId,
	illustrationUri,
	altText,
}) => {
	const illustrationImageUrl = useAssetImage(illustrationUri)
	return <img alt={altText} className="max-h-48 object-contain my-2" src={illustrationImageUrl} />
}

const logger = new CaretWebviewLogger("PersonaTemplateSelector")

export const PersonaTemplateSelector: React.FC<PersonaTemplateSelectorProps> = ({ isOpen, onClose, onSelectPersona }) => {
	const [activeTab, setActiveTab] = useState<string>("")
	const { caretSettings } = useExtensionState()
	const { updatePersona, setShowPersonaSelector } = useCaretState()
	const currentLocale = caretSettings?.uiLanguage || "en"

	useEffect(() => {
		const defaultChar = templateCharacters.find((c: any) => c.isDefault) || templateCharacters[0]
		if (defaultChar) {
			setActiveTab(defaultChar.character)
		}
	}, [])

	const handleSelect = async (character: any) => {
		const localeData = (character as any)[currentLocale] || character.en
		const profile: PersonaProfile = {
			name: localeData.name,
			description: localeData.description,
			customInstruction: JSON.stringify(localeData.customInstruction, null, 2),
			avatarUri: character.avatarUri || "",
			thinkingAvatarUri: character.thinkingAvatarUri || "",
		}
		try {
			const normalBase64 = await convertAssetToBase64(character.avatarUri || "")
			const thinkingBase64 = await convertAssetToBase64(character.thinkingAvatarUri || "")
			;(window as any).personaProfile = normalBase64
			;(window as any).personaThinking = thinkingBase64
			await updatePersona(profile)
			onSelectPersona(profile)
			if (onClose) {
				onClose()
			} else {
				setShowPersonaSelector(false)
			}
		} catch (error) {
			logger.error("Failed to select persona:", error)
		}
	}

	const getSelectedCharacter = () => {
		if (!activeTab || templateCharacters.length === 0) {
			return null
		}
		return templateCharacters.find((char: any) => char.character === activeTab) || templateCharacters[0]
	}

	if (isOpen === false) {
		return null
	}

	const activeCharacter = getSelectedCharacter()
	const personaDetails = activeCharacter ? (activeCharacter as any)[currentLocale] || (activeCharacter as any).en : null

	const SelectorContent = () => (
		<div className="bg-[var(--vscode-sideBar-background)] rounded-lg shadow-lg p-6 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-lg font-semibold">{t("selector.title", "persona") || "Select Persona Template"}</h2>
				{onClose && (
					<VSCodeButton appearance="icon" aria-label="Close" onClick={onClose}>
						<span className="codicon codicon-close"></span>
					</VSCodeButton>
				)}
			</div>
			<p className="text-sm text-[var(--vscode-descriptionForeground)] mb-2">
				{t("selector.description", "persona") || "Choose a persona template"}
			</p>
			<div className="character-tabs mb-4 border-b border-[var(--vscode-settings-headerBorder)]">
				{templateCharacters.map((char: any) => (
					<CharacterTab
						aria-label={`${char.character} tab`}
						isActive={activeTab === char.character}
						key={char.character}
						onClick={() => setActiveTab(char.character)}>
						<TabAvatarImage altText={char.character} avatarUri={char.avatarUri || ""} characterId={char.character} />
					</CharacterTab>
				))}
			</div>
			{activeCharacter && personaDetails && (
				<div className="flex flex-col items-center overflow-y-auto">
					<h3 className="text-xl font-bold mb-2">{personaDetails.name}</h3>
					<div className="w-full bg-[var(--vscode-editor-background)] rounded-md mb-4 flex justify-center">
						<IllustrationImage
							altText={`${personaDetails.name} illustration`}
							characterId={activeCharacter.character}
							illustrationUri={activeCharacter.introIllustrationUri || ""}
						/>
					</div>
					<div className="h-20 flex items-center justify-center mb-4 px-4">
						<p className="text-sm text-center overflow-y-auto">{personaDetails.description}</p>
					</div>
					<VSCodeButton className="w-full" onClick={() => handleSelect(activeCharacter)}>
						{t("selector.selectButtonText", "persona") || "Select This Persona"}
					</VSCodeButton>
				</div>
			)}
		</div>
	)

	if (isOpen) {
		return (
			<div className="fixed inset-0 bg-opacity-50 bg-[rgba(0,0,0,0.3)] backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 px-6">
				<SelectorContent />
			</div>
		)
	}

	return (
		<div className="flex items-center justify-center w-full h-screen bg-[var(--vscode-editor-background)]">
			<SelectorContent />
		</div>
	)
}

export default PersonaTemplateSelector
