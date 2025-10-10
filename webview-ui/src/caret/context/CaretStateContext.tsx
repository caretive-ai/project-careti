import { EmptyRequest } from "@shared/proto/cline/common"
import { PersonaImages, PersonaProfile } from "@shared/proto/index.caret"
import React, { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react"
import { PersonaServiceClient } from "../services/CaretGrpcClient"
import { CaretWebviewLogger } from "../utils/webview-logger"

// CARET MODIFICATION: Add window type definitions for persona images injected by CaretProvider.
declare global {
	interface Window {
		personaProfile?: string
		personaThinking?: string
	}
}

// CARET MODIFICATION: This entire file is a Caret addition ported from caret-compare.
// It creates a dedicated React Context for managing Caret-specific state,
// ensuring separation from Cline's core ExtensionStateContext.
// Path changes: /assets/ → /assets/ handled in asset conversion functions.

export interface FullPersonaProfile {
	name: string
	description: string
	customInstruction: string
	avatarUri?: string
	thinkingAvatarUri?: string
}

interface CaretStateContextType {
	personaProfile?: FullPersonaProfile
	updatePersona: (profile: PersonaProfile) => Promise<void>
	showPersonaSelector: boolean
	setShowPersonaSelector: (show: boolean) => void
}

const logger = new CaretWebviewLogger("CaretStateContext")

const CaretStateContext = createContext<CaretStateContextType | undefined>(undefined)

export const CaretStateContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [showPersonaSelector, setShowPersonaSelector] = useState(false)
	const [personaProfile, setPersonaProfile] = useState<PersonaProfile | undefined>(undefined)
	// CARET MODIFICATION: Initialize personaImages state from window object.
	const [personaImages, setPersonaImages] = useState<PersonaImages | undefined>(() => {
		if (window.personaProfile || window.personaThinking) {
			return PersonaImages.create({
				avatarUri: window.personaProfile,
				thinkingAvatarUri: window.personaThinking,
			})
		}
		return undefined
	})
	const personaSubscriptionRef = useRef<(() => void) | null>(null)

	useEffect(() => {
		// Subscribe to persona changes from the backend
		personaSubscriptionRef.current = PersonaServiceClient.subscribeToPersonaChanges(EmptyRequest.create(), {
			onResponse: (images: PersonaImages) => {
				setPersonaImages(images)
			},
			onError: (error: Error) => {},
			onComplete: () => {},
		})

		// Also, fetch the initial persona profile
		PersonaServiceClient.getPersonaProfile(EmptyRequest.create())
			.then((profile: PersonaProfile) => {
				setPersonaProfile(profile)
			})
			.catch((error: Error) => {
				logger.error("Failed to fetch initial persona profile:", error)
			})

		return () => {
			if (personaSubscriptionRef.current) {
				personaSubscriptionRef.current()
				personaSubscriptionRef.current = null
			}
		}
	}, [])

	const updatePersona = useCallback(
		async (profile: PersonaProfile) => {
			const previousProfile = personaProfile
			setPersonaProfile(profile) // Optimistic update

			try {
				// Pass the entire profile object as per the corrected proto definition
				await PersonaServiceClient.updatePersona({ profile })
			} catch (error) {
				setPersonaProfile(previousProfile) // Rollback on failure
				throw error
			}
		},
		[personaProfile],
	)

	const fullPersonaInfo: FullPersonaProfile | undefined = personaProfile
		? {
				...personaProfile,
				avatarUri: personaImages?.avatarUri,
				thinkingAvatarUri: personaImages?.thinkingAvatarUri,
			}
		: undefined

	const contextValue: CaretStateContextType = {
		personaProfile: fullPersonaInfo,
		updatePersona,
		showPersonaSelector,
		setShowPersonaSelector,
	}

	return <CaretStateContext.Provider value={contextValue}>{children}</CaretStateContext.Provider>
}

export const useCaretState = () => {
	const context = useContext(CaretStateContext)
	if (context === undefined) {
		throw new Error("useCaretState must be used within a CaretStateContextProvider")
	}
	return context
}
