import { CaretEnv } from "@careti/config"
import { IAuthProvider } from "@services/auth/providers/IAuthProvider"
import { LogoutReason } from "@services/auth/types"
import { featureFlagsService } from "@services/feature-flags"
import { CaretAuthState, CaretUserInfo } from "@shared/proto/careti/account"
import { type EmptyRequest, String } from "@shared/proto/cline/common"
import { Controller } from "@/core/controller"
import { getRequestRegistry, type StreamingResponseHandler } from "@/core/controller/grpc-handler"
import { setWelcomeViewCompleted } from "@/core/controller/state/setWelcomeViewCompleted"
import { HostProvider } from "@/hosts/host-provider"
import { telemetryService } from "@/services/telemetry"
import { openExternal } from "@/utils/env"
import { CaretAuthProvider } from "./providers/CaretAuthProvider"

export type ServiceConfig = {
	URI?: string
	[key: string]: any
}

export interface CaretAuthInfo {
	/**
	 * accessToken
	 */
	idToken: string
	/**
	 * Short-lived refresh token
	 */
	refreshToken?: string
	/**
	 * Access token expiration time
	 * When expired, the access token needs to be refreshed using the refresh token.
	 */
	expiresAt?: number
	userInfo: CaretAccountUserInfo
	provider: string
}

export interface CaretAccountUserInfo {
	createdAt: string
	displayName: string
	email: string
	id: string
	organizations: CaretAccountOrganization[]
	/**
	 * Cline app base URL, used for webview UI and other client-side operations
	 */
	appBaseUrl?: string
	/**
	 * WorkOS IDP ID if user logged in via SSO
	 */
	subject?: string
	photoUrl?: string
}

export interface CaretAccountOrganization {
	active: boolean
	memberId: string
	name: string
	organizationId: string
	roles: string[]
}

export class CaretAuthService {
	protected static instance: CaretAuthService | null = null
	protected _authenticated: boolean = false
	protected _caretAuthInfo: CaretAuthInfo | null = null
	protected _provider: IAuthProvider | null = null
	protected _activeAuthStatusUpdateHandlers = new Set<StreamingResponseHandler<CaretAuthState>>()
	protected _handlerToController = new Map<StreamingResponseHandler<CaretAuthState>, Controller>()
	protected _controller: Controller

	/**
	 * Creates an instance of AuthService.
	 * @param controller - Optional reference to the Controller instance.
	 */
	protected constructor(controller: Controller) {
		this._initProvider()
		this._controller = controller
	}

	/**
	 * Gets the singleton instance of AuthService.
	 * @param controller - Optional reference to the Controller instance.
	 * @returns The singleton instance of AuthService.
	 */
	public static getInstance(controller?: Controller): CaretAuthService {
		if (!CaretAuthService.instance) {
			if (!controller) {
				console.warn("Extension context was not provided to AuthService.getInstance, using default context")
				controller = {} as Controller
			}
			CaretAuthService.instance = new CaretAuthService(controller)
		}
		if (controller !== undefined && CaretAuthService.instance) {
			CaretAuthService.instance.controller = controller
		}
		return CaretAuthService.instance!
	}

	set controller(controller: Controller) {
		this._controller = controller
	}

	/**
	 * Returns the current authentication token with the appropriate prefix.
	 * Refreshing it if necessary.
	 */
	async getAuthToken(): Promise<string | null> {
		if (!this._provider) {
			throw new Error("Auth provider is not set")
		}

		return this.internalGetAuthToken(this._provider)
	}

	/**
	 * Gets the active organization ID from the authenticated user's info
	 * @returns The active organization ID, or null if no active organization exists
	 */
	getActiveOrganizationId(): string | null {
		if (!this._caretAuthInfo?.userInfo?.organizations) {
			return null
		}
		const activeOrg = this._caretAuthInfo.userInfo.organizations.find((org) => org.active)
		return activeOrg?.organizationId ?? null
	}

	/**
	 * Gets all organizations from the authenticated user's info
	 * @returns Array of organizations, or undefined if not available
	 */
	getUserOrganizations(): CaretAccountOrganization[] | undefined {
		return this._caretAuthInfo?.userInfo?.organizations
	}

	private async internalGetAuthToken(provider: IAuthProvider): Promise<string | null> {
		try {
			let caretAccountAuthToken = this._caretAuthInfo?.idToken
			if (!this._caretAuthInfo || !caretAccountAuthToken || this._caretAuthInfo.provider !== provider.name) {
				// Not authenticated
				return null
			}

			// Check if token has expired
			if (await provider.shouldRefreshIdToken(caretAccountAuthToken, this._caretAuthInfo.expiresAt)) {
				const updatedAuthInfo = await provider.retrieveClineAuthInfo(this._controller)
				if (updatedAuthInfo) {
					this._caretAuthInfo = updatedAuthInfo
					this._authenticated = true
					caretAccountAuthToken = updatedAuthInfo.idToken
				} else if (this.shouldClearAuthInfo(provider)) {
					this._caretAuthInfo = null
					this._authenticated = false
					telemetryService.captureAuthLoggedOut(this._provider?.name, LogoutReason.ERROR_RECOVERY)
				}
				await this.sendAuthStatusUpdate()
			}

			return caretAccountAuthToken ? caretAccountAuthToken : null
		} catch (error) {
			console.error("Error getting auth token:", error)
			return null
		}
	}

	private shouldClearAuthInfo(provider: IAuthProvider) {
		return this._caretAuthInfo?.provider === provider.name
	}

	protected _initProvider(): void {
		// Only CaretAuthProvider is supported going forward
		this._provider = new CaretAuthProvider()
	}

	/**
	 * Gets the provider name for the current authentication
	 * @returns The provider name (e.g., "cline", "firebase"), or null if not authenticated
	 */
	getProviderName(): string | null {
		return this._caretAuthInfo?.provider ?? null
	}

	getInfo(): CaretAuthState {
		// TODO: this logic should be cleaner, but this will determine the authentication state for the webview -- if a user object is returned then the webview assumes authenticated, otherwise it assumes logged out (we previously returned a UserInfo object with empty fields, and this represented a broken logged in state)
		let user: any = null
		if (this._caretAuthInfo && this._authenticated) {
			const userInfo = this._caretAuthInfo.userInfo
			this._caretAuthInfo.userInfo.appBaseUrl = CaretEnv.config()?.appBaseUrl

			user = CaretUserInfo.create({
				// TODO: create proto for new user info type
				uid: userInfo?.id,
				displayName: userInfo?.displayName,
				email: userInfo?.email,
				photoUrl: userInfo?.photoUrl,
				appBaseUrl: userInfo?.appBaseUrl,
			})
		}

		return CaretAuthState.create({
			user,
		})
	}

	async createAuthRequest(strict = false): Promise<String> {
		// In strict mode, we do not open a new auth window if already authenticated
		if (strict && this._authenticated) {
			this.sendAuthStatusUpdate()
			return String.create({ value: "Already authenticated" })
		}

		if (!this._provider) {
			return String.create({
				value: "Authentication provider is not configured",
			})
		}

		const callbackHost = await HostProvider.get().getCallbackUrl()
		const callbackUrl = `${callbackHost}/auth`

		const authUrl = await this._provider.getAuthRequest(callbackUrl)
		const authUrlString = authUrl.toString()

		await openExternal(authUrlString)
		telemetryService.captureAuthStarted(this._provider.name)
		return String.create({ value: authUrlString })
	}

	async handleDeauth(reason: LogoutReason = LogoutReason.UNKNOWN): Promise<void> {
		if (!this._provider) {
			throw new Error("Auth provider is not set")
		}

		try {
			telemetryService.captureAuthLoggedOut(this._provider.name, reason)
			this._caretAuthInfo = null
			this._authenticated = false
			this.destroyTokens()
			this.sendAuthStatusUpdate()
		} catch (error) {
			console.error("Error signing out:", error)
			throw error
		}
	}

	async handleAuthCallback(authorizationCode: string, provider: string): Promise<void> {
		if (!this._provider) {
			throw new Error("Auth provider is not set")
		}

		try {
			console.log("handleAuthCallback", authorizationCode, provider)
			this._caretAuthInfo = await this._provider.signIn(this._controller, authorizationCode, provider)
			this._authenticated = this._caretAuthInfo?.idToken !== undefined

			telemetryService.captureAuthSucceeded(this._provider.name)
			await setWelcomeViewCompleted(this._controller, { value: true })
		} catch (error) {
			console.error("Error signing in with custom token:", error)
			telemetryService.captureAuthFailed(this._provider.name)
			throw error
		} finally {
			await this.sendAuthStatusUpdate()
		}
	}

	/**
	 * @deprecated Use handleDeauth() instead. Storage clearing is now handled consistently within the auth domain.
	 * Clear the authentication token from the extension's storage.
	 * This is typically called when the user logs out.
	 */
	async clearAuthToken(): Promise<void> {
		this.destroyTokens()
	}

	/**
	 * Restores the authentication data from the extension's storage.
	 * This is typically called when the extension is activated.
	 */
	async restoreRefreshTokenAndRetrieveAuthInfo(): Promise<void> {
		if (!this._provider) {
			throw new Error("Auth provider is not set")
		}

		console.log("restoreRefreshTokenAndRetrieveAuthInfo")

		try {
			this._caretAuthInfo = await this.retrieveAuthInfo()
			console.log("restoreRefreshTokenAndRetrieveAuthInfo", this._caretAuthInfo)
			if (this._caretAuthInfo) {
				this._authenticated = true
				await this.sendAuthStatusUpdate()
			} else {
				console.warn("No user found after restoring auth token")
				this._authenticated = false
				this._caretAuthInfo = null
				telemetryService.captureAuthLoggedOut(this._provider?.name, LogoutReason.ERROR_RECOVERY)
			}
		} catch (error) {
			console.error("Error restoring auth token:", error)
			this._authenticated = false
			this._caretAuthInfo = null
			telemetryService.captureAuthLoggedOut(this._provider?.name, LogoutReason.ERROR_RECOVERY)
			return
		}
	}

	private async retrieveAuthInfo(): Promise<CaretAuthInfo | null> {
		if (!this._provider) {
			console.log("Auth provider is not set")
			throw new Error("Auth provider is not set")
		}
		console.log("Retrieving auth info")

		return this._provider.retrieveClineAuthInfo(this._controller)
	}

	/**
	 * Subscribe to authStatusUpdate events
	 * @param controller The controller instance
	 * @param request The empty request
	 * @param responseStream The streaming response handler
	 * @param requestId The ID of the request (passed by the gRPC handler)
	 */
	async subscribeToAuthStatusUpdate(
		controller: Controller,
		_request: EmptyRequest,
		responseStream: StreamingResponseHandler<CaretAuthState>,
		requestId?: string,
	): Promise<void> {
		// Add this subscription to the active subscriptions
		this._activeAuthStatusUpdateHandlers.add(responseStream)
		this._handlerToController.set(responseStream, controller)
		// Register cleanup when the connection is closed
		const cleanup = () => {
			this._activeAuthStatusUpdateHandlers.delete(responseStream)
			this._handlerToController.delete(responseStream)
		}
		// Register the cleanup function with the request registry if we have a requestId
		if (requestId) {
			getRequestRegistry().registerRequest(requestId, cleanup, { type: "authStatusUpdate_subscription" }, responseStream)
		}

		// Send the current authentication status immediately
		try {
			await this.sendAuthStatusUpdate()
		} catch (error) {
			console.error("Error sending initial auth status:", error)
			// Remove the subscription if there was an error
			this._activeAuthStatusUpdateHandlers.delete(responseStream)
			this._handlerToController.delete(responseStream)
		}
	}

	/**
	 * Send an authStatusUpdate event to all active subscribers
	 */
	async sendAuthStatusUpdate(): Promise<void> {
		// Compute once per broadcast
		const authInfo: CaretAuthState = this.getInfo()
		const uniqueControllers = new Set<Controller>()

		// Send the event to all active subscribers
		const streamSends = Array.from(this._activeAuthStatusUpdateHandlers).map(async (responseStream) => {
			const controller = this._handlerToController.get(responseStream)
			if (controller) {
				uniqueControllers.add(controller)
			}
			try {
				await responseStream(
					authInfo,
					false, // Not the last message
				)
			} catch (error) {
				console.error("Error sending authStatusUpdate event:", error)
				// Remove the subscription if there was an error
				this._activeAuthStatusUpdateHandlers.delete(responseStream)
				this._handlerToController.delete(responseStream)
			}
		})

		await Promise.all(streamSends)
		// Identify the user in telemetry if available
		if (this._caretAuthInfo?.userInfo?.id) {
			telemetryService.identifyAccount(this._caretAuthInfo.userInfo)
			// Reset feature flags to ensure they are fetched for the new/logged in user
			featureFlagsService.reset(this._caretAuthInfo?.userInfo?.id)
		}
		// Poll feature flags to ensure they are up to date for all users
		await featureFlagsService.poll(this._caretAuthInfo?.userInfo?.id)

		// Update state in webviews once per unique controller
		await Promise.all(Array.from(uniqueControllers).map((c) => c.postStateToWebview()))
	}

	private destroyTokens() {
		this._controller.stateManager.setSecret("caretAccountId", undefined)
		this._controller.stateManager.setSecret("careti:caretAccountId", undefined)
	}
}
