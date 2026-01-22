import { EmptyRequest } from "@shared/proto/cline/common"
import deepEqual from "fast-deep-equal"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { CaretAccountServiceClient } from "@/services/grpc-client"

export interface CaretUser {
	uid: string
	email?: string
	displayName?: string
	photoUrl?: string
	appBaseUrl?: string
}

export interface CaretAuthContextType {
	caretUser: CaretUser | null
}

export const CaretAuthContext = createContext<CaretAuthContextType | undefined>(undefined)

export const CaretAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [caretUser, setCaretUser] = useState<CaretUser | null>(null)

	useEffect(() => {
		const cancelSubscription = CaretAccountServiceClient.subscribeToCaretAuthStatusUpdate(EmptyRequest.create(), {
			onResponse: async (response: any) => {
				if (!response?.user?.uid) {
					setCaretUser((prev) => (prev ? null : prev))
					return
				}
				const mappedUser: CaretUser = {
					uid: response.user.uid,
					email: response.user.email ?? undefined,
					displayName: response.user.displayName ?? undefined,
					photoUrl: response.user.photoUrl ?? undefined,
					appBaseUrl: response.user.appBaseUrl ?? undefined,
				}

				setCaretUser((prev) => {
					if (prev && deepEqual(prev, mappedUser)) {
						return prev
					}
					return mappedUser
				})
			},
			onError: (error: Error) => {
				console.error("Error in Careti auth callback subscription:", error)
			},
			onComplete: () => {
				console.log("Careti auth callback subscription completed")
			},
		})

		return () => {
			cancelSubscription()
		}
	}, [])

	return <CaretAuthContext.Provider value={{ caretUser }}>{children}</CaretAuthContext.Provider>
}

export const useCaretAuth = () => {
	const context = useContext(CaretAuthContext)
	if (context === undefined) {
		throw new Error("useCaretAuth must be used within a CaretAuthProvider")
	}
	return context
}

export const handleSignIn = async () => {
	try {
		CaretAccountServiceClient.caretAccountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	} catch (error) {
		console.error("Error signing in:", error)
		throw error
	}
}

export const handleSignOut = async () => {
	try {
		await CaretAccountServiceClient.caretAccountLogoutClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to logout:", err),
		)
	} catch (error) {
		console.error("Error signing out:", error)
		throw error
	}
}
