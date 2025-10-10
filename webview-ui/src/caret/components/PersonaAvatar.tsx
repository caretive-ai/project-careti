import React, { useCallback, useEffect, useState } from "react"
import { FullPersonaProfile } from "../context/CaretStateContext"
import { caretWebviewLogger } from "../utils/webview-logger"

// CARET MODIFICATION: Convert asset:// URIs to Base64 data URIs to fix CSP violations
// This implementation is ported from caret-compare with path changes: /assets/ → /assets/
const convertAssetToBase64 = async (assetUri: string): Promise<string> => {
	if (!assetUri.startsWith("asset:")) {
		return assetUri
	}

	caretWebviewLogger.info("Converting asset URI", { assetUri })

	// Check if we have window template images injected by CaretProviderWrapper
	if (assetUri.includes("caret.png")) {
		if ((window as any).templateImage_caret) {
			caretWebviewLogger.info("Found window.templateImage_caret")
			return (window as any).templateImage_caret
		}
		if ((window as any).personaProfile) {
			caretWebviewLogger.info("Found window.personaProfile")
			return (window as any).personaProfile
		}
	}
	if (assetUri.includes("caret_thinking.png")) {
		if ((window as any).templateImage_caretthinking) {
			return (window as any).templateImage_caretthinking
		}
		if ((window as any).personaThinking) {
			caretWebviewLogger.info("Found window.personaThinking")
			return (window as any).personaThinking
		}
	}
	if (assetUri.includes("sarang.png") && (window as any).templateImage_sarang) {
		return (window as any).templateImage_sarang
	}
	if (assetUri.includes("sarang_thinking.png") && (window as any).templateImage_sarangthinking) {
		return (window as any).templateImage_sarangthinking
	}
	// Add more characters as needed...

	// Log all available window properties for debugging
	const windowProps = Object.keys(window).filter((key) => key.startsWith("templateImage") || key.startsWith("persona"))
	caretWebviewLogger.warn("No Base64 conversion available for asset URI", { assetUri, windowProps })

	return assetUri
}

// CARET MODIFICATION: Refactored this component to be more reusable and align with Cline's standards.
// It now receives 'personaProfile' directly via props instead of relying on ExtensionStateContext,
// and uses the 'FullPersonaProfile' combined type.

interface PersonaAvatarProps {
	personaProfile: FullPersonaProfile | undefined | null
	isThinking?: boolean
	size?: number
	className?: string
	style?: React.CSSProperties
}

// CARET MODIFICATION: This loading persona is simplified as it's a fallback.
const LOADING_PERSONA_AVATAR =
	"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0iI2RkZGRkZCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIiBmaWxsPSIjNjY2NjY2Ii8+PGNpcmNsZSBjeD0iMjAiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzY2NjY2NiIvPjxwYXRoIGQ9Ik0xMCAyMCBRMTYgMjUgMjIgMjAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48dGV4dCB4PSIxNiIgeT0iNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2NjY2NjYiPz88L3RleHQ+PC9zdmc+"
const LOADING_PERSONA_THINKING_AVATAR =
	"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0iI2VmZjRmZiIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIiBmaWxsPSIjNjY2NjY2Ii8+PGNpcmNsZSBjeD0iMjAiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzY2NjY2NiIvPjxwYXRoIGQ9Ik0xMCAyMCBRMTYgMjIgMjIgMjAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjYiIHI9IjEiIGZpbGw9IiM2NjY2NjYiIG9wYWNpdHk9IjAuOCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iNSIgcj0iMS41IiBmaWxsPSIjNjY2NjY2IiBvcGFjaXR5PSIwLjYiLz48Y2lyY2xlIGN4PSIyMiIgY3k9IjciIHI9IjAuNSIgZmlsbD0iIzY2NjY2NiIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+"

export const PersonaAvatar: React.FC<PersonaAvatarProps> = ({
	personaProfile,
	isThinking = false,
	size = 32,
	className = "",
	style = {},
}) => {
	const [imageError, setImageError] = useState<boolean>(false)
	const [convertedUri, setConvertedUri] = useState<string | undefined>()

	// Determine the correct image URI from the context
	const rawImageUri = isThinking ? personaProfile?.thinkingAvatarUri : personaProfile?.avatarUri

	// Convert asset:// URI to Base64 when URI changes
	useEffect(() => {
		if (rawImageUri) {
			convertAssetToBase64(rawImageUri)
				.then(setConvertedUri)
				.catch((error) => {
					caretWebviewLogger.error("PersonaAvatar: Failed to convert asset URI", error)
					setConvertedUri(rawImageUri) // Fallback to original
				})
		} else {
			setConvertedUri(undefined)
		}
	}, [rawImageUri])

	// Listen for window variable changes (for uploaded images)
	useEffect(() => {
		const checkWindowVariables = () => {
			if (isThinking && (window as any).personaThinking) {
				const newUri = (window as any).personaThinking
				if (newUri !== convertedUri && newUri.startsWith("data:")) {
					setConvertedUri(newUri)
				}
			} else if (!isThinking && (window as any).personaProfile) {
				const newUri = (window as any).personaProfile
				if (newUri !== convertedUri && newUri.startsWith("data:")) {
					setConvertedUri(newUri)
				}
			}
		}

		// Check immediately and then periodically
		checkWindowVariables()
		const interval = setInterval(checkWindowVariables, 500)

		return () => clearInterval(interval)
	}, [isThinking, convertedUri])

	// Use the converted URI
	const imageUri = convertedUri

	// Handle image loading errors
	const handleImageError = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			caretWebviewLogger.warn("PersonaAvatar: Image load error", {
				src: (e.target as HTMLImageElement).src,
				isThinking,
			})
			setImageError(true)
		},
		[isThinking],
	)

	// Reset image errors when the source URI changes
	useEffect(() => {
		setImageError(false)
	}, [imageUri])

	// Use a fallback image if there's an error or the URI is not available
	let finalImageUri = imageUri
	if (imageError || !finalImageUri) {
		finalImageUri = isThinking ? LOADING_PERSONA_THINKING_AVATAR : LOADING_PERSONA_AVATAR
	}

	const personaName = personaProfile?.name || "persona"
	const altText = `${personaName} ${isThinking ? "thinking" : "normal"}`

	return (
		<img
			alt={altText} // Ensure src is not null
			className={`persona-avatar ${className}`}
			data-persona={personaName}
			data-testid="persona-avatar"
			data-thinking={isThinking}
			onError={handleImageError}
			src={finalImageUri || undefined}
			style={{
				width: size,
				height: size,
				borderRadius: "50%",
				objectFit: "cover",
				border: "1px solid var(--vscode-settings-headerBorder)",
				flexShrink: 0,
				transition: "all 0.3s ease-in-out",
				...style,
			}}
		/>
	)
}

export default PersonaAvatar
