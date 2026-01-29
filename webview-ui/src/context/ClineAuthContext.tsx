import type { UserOrganization } from "@shared/proto/cline/account"
import { EmptyRequest } from "@shared/proto/cline/common"
import deepEqual from "fast-deep-equal"
import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AccountServiceClient } from "@/services/grpc-client"

// Define User type (you may need to adjust this based on your actual User type)
export interface ClineUser {
	uid: string
	email?: string
	displayName?: string
	photoUrl?: string
	appBaseUrl?: string
}

export interface ClineAuthContextType {
	clineUser: ClineUser | null
	organizations: UserOrganization[] | null
	activeOrganization: UserOrganization | null
}

export const ClineAuthContext = createContext<ClineAuthContextType | undefined>(undefined)

export const ClineAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [clineUser, setClineUser] = useState<ClineUser | null>(null)
	const [userOrganizations, setUserOrganizations] = useState<UserOrganization[] | null>(null)
	// CARETI MODIFICATION: Track last fetched user to prevent duplicate organization fetches
	const lastFetchedUserRef = useRef<string | null>(null)
	const isFetchingRef = useRef(false)

	// CARETI MODIFICATION: Remove userOrganizations from dependencies to prevent infinite loop
	// Use functional update to compare with previous state
	const getUserOrganizations = useCallback(async () => {
		// Prevent concurrent fetches
		if (isFetchingRef.current) {
			return
		}
		isFetchingRef.current = true
		try {
			const response = await AccountServiceClient.getUserOrganizations(EmptyRequest.create())
			setUserOrganizations((prev) => {
				if (!deepEqual(response.organizations, prev)) {
					return response.organizations
				}
				return prev
			})
		} catch (error) {
			console.error("Failed to fetch user organizations:", error)
		} finally {
			isFetchingRef.current = false
		}
	}, [])

	const activeOrganization = useMemo(() => {
		return userOrganizations?.find((org) => org.active) ?? null
	}, [userOrganizations])

	useEffect(() => {
		console.log("Extension: ClineAuthContext: user updated:", clineUser?.uid)
	}, [clineUser?.uid])

	// Handle auth status update events
	useEffect(() => {
		const cancelSubscription = AccountServiceClient.subscribeToAuthStatusUpdate(EmptyRequest.create(), {
			onResponse: async (response: any) => {
				if (!response?.user?.uid) {
					setClineUser(null)
					lastFetchedUserRef.current = null
					return
				}

				const newUserId = response.user.uid
				const userChanged = lastFetchedUserRef.current !== newUserId

				setClineUser((prev) => {
					if (prev?.uid === newUserId && deepEqual(prev, response.user)) {
						return prev
					}
					return response.user
				})

				// CARETI MODIFICATION: Only fetch organizations when user actually changes
				// This prevents infinite loop when subscription sends repeated events
				if (userChanged) {
					lastFetchedUserRef.current = newUserId
					await getUserOrganizations()
				}
			},
			onError: (error: Error) => {
				console.error("Error in auth callback subscription:", error)
			},
			onComplete: () => {
				console.log("Auth callback subscription completed")
			},
		})

		// Cleanup function to cancel subscription when component unmounts
		return () => {
			cancelSubscription()
		}
	}, [getUserOrganizations])

	return (
		<ClineAuthContext.Provider
			value={{
				clineUser,
				organizations: userOrganizations,
				activeOrganization,
			}}>
			{children}
		</ClineAuthContext.Provider>
	)
}

export const useClineAuth = () => {
	const context = useContext(ClineAuthContext)
	if (context === undefined) {
		throw new Error("useClineAuth must be used within a ClineAuthProvider")
	}
	return context
}

export const handleSignIn = async () => {
	try {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	} catch (error) {
		console.error("Error signing in:", error)
		throw error
	}
}

export const handleSignOut = async () => {
	try {
		await AccountServiceClient.accountLogoutClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to logout:", err),
		)
	} catch (error) {
		console.error("Error signing out:", error)
		throw error
	}
}
