import { CaretEnv, EnvironmentConfig } from "@careti/config"
import { CARET_API_ENDPOINT } from "@careti/shared/caret/api"
import { Controller } from "@core/controller"
import { HostProvider } from "@hosts/host-provider"
import { IAuthProvider } from "@services/auth/providers/IAuthProvider"
import { Logger } from "@services/logging/Logger"
import { fetch } from "@shared/net"
import type { CaretAuthInfo } from "../CaretiAuthService"

interface CaretAuthApiUser {
	subject: string | null
	email: string
	name: string
	id: string | null
	photoUrl: string | null
	accounts: string[] | null
}

interface CaretAuthResponseData {
	accessToken: string
	refreshToken?: string
	tokenType: string
	expiresAt: string
	userInfo: CaretAuthApiUser
}

export interface CaretAuthApiTokenExchangeResponse {
	success: boolean
	data: CaretAuthResponseData
}

export interface CaretAuthApiTokenRefreshResponse {
	success: boolean
	data: CaretAuthResponseData
}

// CARETI MODIFICATION: 서버(api.careti.ai)가 아직 구 도메인(caret.team)으로 로그인
// redirect URL을 반환한다. caret.team은 더 이상 서비스되지 않으므로 신 도메인
// careti.ai로 정규화한다. 서버 응답이 갱신되면 자연스럽게 no-op이 된다.
const LEGACY_AUTH_HOSTS: Record<string, string> = {
	"caret.team": "careti.ai",
	"www.caret.team": "careti.ai",
}

export const normalizeAuthRedirectUrl = (rawUrl: string): string => {
	try {
		const url = new URL(rawUrl)
		const replacementHost = LEGACY_AUTH_HOSTS[url.hostname]
		if (replacementHost) {
			Logger.info(`[CaretiAuthProvider] Rewriting legacy auth host ${url.hostname} -> ${replacementHost}`)
			url.hostname = replacementHost
			return url.toString()
		}
	} catch {
		// 상대 경로 등 URL로 파싱되지 않는 값은 그대로 둔다
	}
	return rawUrl
}

export class CaretiAuthProvider implements IAuthProvider {
	readonly name = "careti"

	get config(): EnvironmentConfig {
		return CaretEnv.config()
	}

	/**
	 * Checks if the access token needs to be refreshed (expired or about to expire).
	 * Since the new flow doesn't support refresh tokens, this will return true if token is expired.
	 * @param _refreshToken - The existing refresh token to check.
	 * @returns {Promise<boolean>} True if the token is expired or about to expire.
	 */
	async shouldRefreshIdToken(_refreshToken: string, expiresAt?: number): Promise<boolean> {
		try {
			// expiresAt is in seconds
			const expirationTime = expiresAt || 0
			const currentTime = Date.now() / 1000
			const next5Min = currentTime + 5 * 60

			console.log("expirationTime", expirationTime)
			console.log("currentTime", currentTime)
			console.log("next5Min", next5Min)

			// Check if token is expired or will expire in the next 5 minutes
			return expirationTime < next5Min // Access token is expired or about to expire
		} catch (error) {
			Logger.error("Error checking token expiration:", error)
			return true // If we can't decode the token, assume it needs refresh
		}
	}

	/**
	 * Retrieves Cline auth info using the stored access token.
	 * @param controller - The controller instance to access stored secrets.
	 * @returns {Promise<CaretAuthInfo | null>} A promise that resolves with the auth info or null.
	 */
	async retrieveClineAuthInfo(controller: Controller): Promise<CaretAuthInfo | null> {
		console.log("Retrieving auth info22222222")
		try {
			// Get the stored auth data from secure storage
			const storedAuthDataString = controller.stateManager.getSecretKey("careti:caretAccountId")
			console.log("storedAuthDataString", storedAuthDataString)

			if (!storedAuthDataString) {
				Logger.debug("No stored authentication data found")
				return null
			}

			// Parse the stored auth data
			let storedAuthData: CaretAuthInfo
			try {
				storedAuthData = JSON.parse(storedAuthDataString)
			} catch (e) {
				console.error("Failed to parse stored auth data:", e)
				controller.stateManager.setSecret("careti:caretAccountId", undefined)
				return null
			}

			console.log("storedAuthData", storedAuthData)

			if (!storedAuthData.refreshToken || !storedAuthData?.idToken) {
				console.error("No valid token found in stored authentication data")
				controller.stateManager.setSecret("careti:caretAccountId", undefined)
				return null
			}

			if (await this.shouldRefreshIdToken(storedAuthData.refreshToken, storedAuthData.expiresAt)) {
				console.log("shouldRefreshIdToken", storedAuthData.refreshToken, storedAuthData.expiresAt)
				// Try to refresh the token using the refresh token
				const authInfo = await this.refreshToken(storedAuthData.refreshToken)
				const newAuthInfoString = JSON.stringify(authInfo)
				if (newAuthInfoString !== storedAuthDataString) {
					controller.stateManager.setSecret("caretAccountId", undefined) // cleanup old key
					controller.stateManager.setSecret("careti:caretAccountId", newAuthInfoString)
				}
				return authInfo || null
			}

			// Is the token valid?
			if (storedAuthData.idToken && storedAuthData.refreshToken && storedAuthData.userInfo.id) {
				return storedAuthData
			}

			// Verify the token structure
			const tokenParts = storedAuthData.idToken.split(".")
			if (tokenParts.length !== 3) {
				throw new Error("Invalid token format")
			}

			// Decode the token to verify it's a valid JWT
			const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString("utf-8"))
			if (payload.external_id) {
				storedAuthData.userInfo.id = payload.external_id
			}

			console.log("Successfully retrieved and validated stored auth token")
			return storedAuthData
		} catch (error) {
			console.error("Error retrieving stored authentication credential:", error)
			return null
		}
	}

	/**
	 * Refreshes an access token using a refresh token.
	 * @param refreshToken - The refresh token.
	 * @returns {Promise<CaretAuthInfo>} The new access token and user info.
	 */
	async refreshToken(refreshToken: string): Promise<CaretAuthInfo> {
		try {
			// Get the callback URL that was used during the initial auth request
			const endpoint = new URL(CARET_API_ENDPOINT.REFRESH_TOKEN, this.config.apiBaseUrl)
			const response = await fetch(endpoint.toString(), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					refreshToken, // short_lived_auth_code
				}),
			})

			if (!response.ok) {
				if (response.status === 400) {
					const errorData = await response.json().catch(() => ({}))
					const errorMessage = errorData?.error || "Invalid or expired authorization code"
					throw new Error(errorMessage)
				}
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data: CaretAuthApiTokenExchangeResponse = await response.json()

			if (!data.success || !data.data.refreshToken || !data.data.accessToken) {
				throw new Error("Failed to exchange authorization code for access token")
			}

			// const userInfo = await this.fetchRemoteUserInfo(data.data)

			return {
				idToken: data.data.accessToken,
				expiresAt: new Date(data.data.expiresAt).getTime() / 1000,
				refreshToken: data.data.refreshToken || refreshToken,
				userInfo: {
					createdAt: new Date().toISOString(),
					email: data.data.userInfo.email || "",
					id: data.data.userInfo.id || "",
					displayName: data.data.userInfo.name || "",
					photoUrl: data.data.userInfo.photoUrl || "",
					organizations: [],
					appBaseUrl: this.config.appBaseUrl,
					subject: data.data.userInfo.subject || "",
				},
				provider: this.name,
			}
		} catch (error: any) {
			throw error
		}
	}

	async getAuthRequest(callbackUrl: string): Promise<string> {
		const authUrl = new URL(CARET_API_ENDPOINT.AUTH, this.config.apiBaseUrl)
		authUrl.searchParams.set("client_type", "extension")
		authUrl.searchParams.set("callback_url", callbackUrl)
		// Ensure the redirect_uri is properly encoded and included
		authUrl.searchParams.set("redirect_uri", callbackUrl)

		console.log("authUrl", authUrl)

		// The server will respond with a 302 redirect to the OAuth provider
		// We need to follow the redirect and get the final URL
		let response: Response
		try {
			// Set redirect: 'manual' to handle the redirect manually
			response = await fetch(authUrl.toString(), {
				method: "GET",
				redirect: "manual",
				credentials: "include", // Important for cookies if needed
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			})

			// If we get a redirect status (3xx), get the Location header
			if (response.status >= 300 && response.status < 400) {
				const redirectUrl = response.headers.get("Location")
				if (!redirectUrl) {
					throw new Error("No redirect URL found in the response")
				}

				return normalizeAuthRedirectUrl(redirectUrl) // CARETI MODIFICATION: 구 도메인 정규화
			}

			// If we didn't get a redirect, try to parse the response as JSON
			const responseData = await response.json()
			if (responseData.redirect_url) {
				return normalizeAuthRedirectUrl(responseData.redirect_url) // CARETI MODIFICATION: 구 도메인 정규화
			}

			throw new Error("Unexpected response from auth server")
		} catch (error) {
			console.error("Error during authentication request:", error)
			throw new Error(`Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`)
		}
	}

	async signIn(controller: Controller, authorizationCode: string, provider: string): Promise<CaretAuthInfo | null> {
		try {
			// Get the callback URL that was used during the initial auth request
			const callbackHost = await HostProvider.get().getCallbackUrl()
			// CARETI MODIFICATION: Caret API uses /auth/callback for standalone mode
			const callbackUrl = `${callbackHost}/auth/callback`

			// Exchange the authorization code for tokens
			const tokenUrl = new URL(CARET_API_ENDPOINT.TOKEN_EXCHANGE, this.config.apiBaseUrl)

			const response = await fetch(tokenUrl.toString(), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					code: authorizationCode,
					client_type: "extension",
					redirect_uri: callbackUrl,
					provider: provider,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.error_description || "Failed to exchange authorization code for tokens")
			}

			const responseJSON = await response.json()
			console.log("Token data received:", responseJSON)

			const responseType: CaretAuthApiTokenExchangeResponse = responseJSON
			const tokenData = responseType.data

			if (!tokenData.accessToken || !tokenData.refreshToken || !tokenData.userInfo) {
				throw new Error("Invalid token response from server")
			}

			// const userInfo = await this.fetchRemoteUserInfo(tokenData)
			const caretAuthInfo = {
				idToken: tokenData.accessToken,
				refreshToken: tokenData.refreshToken,
				userInfo: {
					id: tokenData.userInfo.id || "",
					email: tokenData.userInfo.email || "",
					displayName: tokenData.userInfo.name || "",
					photoUrl: tokenData.userInfo.photoUrl || "",
					createdAt: new Date().toISOString(),
					organizations: [],
				},
				expiresAt: new Date(tokenData.expiresAt).getTime() / 1000,
				provider: this.name,
			}

			console.log("CaretAuthInfo", caretAuthInfo)

			controller.stateManager.setSecret("careti:caretAccountId", JSON.stringify(caretAuthInfo))

			return caretAuthInfo
		} catch (error) {
			console.error("Error handling auth callback:", error)
			throw error
		}
	}

	// 	private async fetchRemoteUserInfo(tokenData: CaretAuthApiTokenExchangeResponse["data"]): Promise<CaretAccountUserInfo> {
	// 		try {
	// 			const userResponse = await axios.get(`${CaretEnv.config().apiBaseUrl}/api/v1/users/me`, {
	// 				headers: {
	// 					Authorization: `Bearer workos:${tokenData.accessToken}`,
	// 				},
	// 				...getAxiosSettings(),
	// 			})

	// 			return userResponse.data.data
	// 		} catch (error) {
	// 			console.error("Error fetching user info:", error)

	// 			// If fetching user info fail for whatever reason, fallback to the token data and refetch on token expiry (10 minutes)
	// 			return {
	// 				id: tokenData.userInfo.id || "",
	// 				email: tokenData.userInfo.email || "",
	// 				displayName: tokenData.userInfo.name || "",
	// 				createdAt: new Date().toISOString(),
	// 				organizations: [],
	// 			}
	// 		}
	// 	}
}
