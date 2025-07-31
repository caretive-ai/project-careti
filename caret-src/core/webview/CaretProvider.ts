// CARET MODIFICATION: CaretProvider is now an independent WebviewProvider, not inheriting from ClineWebviewProvider.
// Original backed up to: caret-src/core/webview/CaretProvider-ts.cline
// Purpose: Ensure CaretProvider's independence and allow custom login/API handling.
import * as vscode from "vscode"
import axios from "axios"
import * as fs from "fs"
import * as path from "path"
import { Auth0Client } from "@auth0/auth0-spa-js" // CARET MODIFICATION: Import Auth0Client
import { WebviewProviderType } from "../../../src/shared/webview/types"
import { getNonce } from "../../../src/core/webview/getNonce"
import { getUri } from "../../../src/core/webview/getUri"
import { getTheme } from "../../utils/caretGetTheme"
import { sendThemeEvent } from "../../../src/core/controller/ui/subscribeToTheme"
import { CaretLogger, logCaretWelcome } from "../../utils/caret-logger" // Import CaretLogger
import { Controller } from "../../../src/core/controller/index"
import { v4 as uuidv4 } from "uuid"

export const CARET_SIDEBAR_ID = "caret.SidebarProvider"
export const CARET_TAB_PANEL_ID = "caret.TabPanelProvider"

export class CaretProvider implements vscode.WebviewViewProvider {
	public view?: vscode.WebviewView | vscode.WebviewPanel
	private disposables: vscode.Disposable[] = []
	public controller: Controller
	private clientId: string
	private outputChannel: vscode.OutputChannel
	private providerType: WebviewProviderType
	private caretLogger: CaretLogger // Add caretLogger as a member
	private auth0Client?: Auth0Client // CARET MODIFICATION: Add Auth0Client field
	private _personaProfileDataUri: string = "" // CARET MODIFICATION: Add persona profile data URI
	private _personaThinkingDataUri: string = "" // CARET MODIFICATION: Add persona thinking data URI
	private static instance: CaretProvider | null = null // CARET MODIFICATION: Add singleton instance

	constructor(
		public readonly context: vscode.ExtensionContext,
		outputChannel: vscode.OutputChannel,
		providerType: WebviewProviderType = WebviewProviderType.SIDEBAR,
		caretLoggerInstance?: CaretLogger, // Make optional and handle default inside
	) {
		this.outputChannel = outputChannel
		this.providerType = providerType
		this.caretLogger = caretLoggerInstance || new CaretLogger() // Assign injected or new instance
		this.clientId = uuidv4()
		// CARET MODIFICATION: Pass the actual outputChannel to the Controller, casting to 'any' to bypass persistent type inference issue.
		this.controller = new Controller(context, outputChannel as any, (message) => this.view?.webview.postMessage(message))

		this.caretLogger.info(`CaretProvider constructor called for ${providerType}.`)
		this.caretLogger.setOutputChannel(outputChannel)
		this.caretLogger.extensionActivated()
		this.caretLogger.welcomePageLoaded() // Use instance method instead of global function

		// CARET MODIFICATION: Set singleton instance
		CaretProvider.instance = this
	}

	public getClientId(): string {
		return this.clientId
	}

	// CARET MODIFICATION: Add getInstance static method
	public static getInstance(): CaretProvider | null {
		return CaretProvider.instance
	}

	// CARET MODIFICATION: Add getVisibleInstance static method for compatibility with extension.ts
	public static getVisibleInstance(): CaretProvider | null {
		// CARET FIX: Return instance even if not visible to handle auth callbacks in the background.
		return CaretProvider.instance
	}

	public async resolveWebviewView(webviewView: vscode.WebviewView | vscode.WebviewPanel) {
		this.caretLogger.info(`resolveWebviewView started for ${this.providerType} with client ID: ${this.getClientId()}`)
		this.view = webviewView
		const isDev = this.context.extensionMode === vscode.ExtensionMode.Development

		const localResourceRoots = [this.context.extensionUri]
		if (isDev) {
			let localServerPort = "5173"
			try {
				const portFilePath = path.join(this.context.extensionPath, "webview-ui", ".vite-port")
				if (fs.existsSync(portFilePath)) {
					localServerPort = fs.readFileSync(portFilePath, "utf-8").trim()
				}
			} catch (error) {
				this.caretLogger.error("Error reading .vite-port file", error)
			}
			localResourceRoots.push(vscode.Uri.parse(`http://localhost:${localServerPort}`))
		}
		localResourceRoots.push(this.context.globalStorageUri)
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: localResourceRoots,
		}

		webviewView.webview.html = isDev
			? await this.getHMRHtmlContent(webviewView.webview)
			: this.getHtmlContent(webviewView.webview)

		this.setWebviewMessageListener(webviewView.webview)

		if ("onDidChangeViewState" in webviewView) {
			webviewView.onDidChangeViewState(
				() => {
					if (this.view?.visible) {
						this.controller.postMessageToWebview({ type: "action", action: "didBecomeVisible" })
					}
				},
				null,
				this.disposables,
			)
		} else if ("onDidChangeVisibility" in webviewView) {
			webviewView.onDidChangeVisibility(
				() => {
					if (this.view?.visible) {
						this.controller.postMessageToWebview({ type: "action", action: "didBecomeVisible" })
					}
				},
				null,
				this.disposables,
			)
		}

		webviewView.onDidDispose(() => this.dispose(), null, this.disposables)

		vscode.workspace.onDidChangeConfiguration(
			async (e) => {
				if (e.affectsConfiguration("workbench.colorTheme")) {
					const theme = await getTheme()
					if (theme) {
						await sendThemeEvent(JSON.stringify(theme))
					}
				}
				if (e.affectsConfiguration("caret.mcpMarketplace.enabled")) {
					await this.controller.postStateToWebview()
				}
			},
			null,
			this.disposables,
		)

		this.controller.clearTask()
		this.controller.postStateToWebview()
		this.outputChannel.appendLine("Caret Webview view resolved successfully.")
		this.caretLogger.info(
			`resolveWebviewView finished for ${this.providerType} with client ID: ${this.getClientId()}. Controller is ready.`,
		)
	}

	protected getHtmlContent(webview: vscode.Webview): string {
		const stylesUri = getUri(webview, this.context.extensionUri, ["webview-ui", "build", "assets", "index.css"])
		const scriptUri = getUri(webview, this.context.extensionUri, ["webview-ui", "build", "assets", "index.js"])
		const codiconsUri = getUri(webview, this.context.extensionUri, [
			"node_modules",
			"@vscode",
			"codicons",
			"dist",
			"codicon.css",
		])
		const katexCssUri = getUri(webview, this.context.extensionUri, [
			"webview-ui",
			"node_modules",
			"katex",
			"dist",
			"katex.min.css",
		])

		const nonce = getNonce()

		let caretBannerDataUri = ""
		let caretIconDataUri = ""
		try {
			const bannerPath = path.join(this.context.extensionPath, "caret-assets", "caret-main-banner.webp")
			this.caretLogger.info(`[CaretProvider] Attempting to load banner from: ${bannerPath}`)
			if (fs.existsSync(bannerPath)) {
				const fileBuffer = fs.readFileSync(bannerPath)
				caretBannerDataUri = `data:image/webp;base64,${fileBuffer.toString("base64")}`
				this.caretLogger.info(`[CaretProvider] Banner loaded successfully, size: ${fileBuffer.length} bytes`)
			} else {
				this.caretLogger.error(`[CaretProvider] Banner file not found: ${bannerPath}`)
			}

			const iconPath = path.join(this.context.extensionPath, "caret-assets", "icons", "icon.png")
			this.caretLogger.info(`[CaretProvider] Attempting to load caret icon from: ${iconPath}`)
			if (fs.existsSync(iconPath)) {
				const iconBuffer = fs.readFileSync(iconPath)
				caretIconDataUri = `data:image/png;base64,${iconBuffer.toString("base64")}`
				this.caretLogger.info(`[CaretProvider] Caret icon loaded successfully, size: ${iconBuffer.length} bytes`)
			} else {
				this.caretLogger.error(`[CaretProvider] Caret icon file not found: ${iconPath}`)
			}
		} catch (e) {
			this.caretLogger.error(`[CaretProvider] Error loading banner image:`, e)
		}

		let personaProfileDataUri = ""
		let personaThinkingDataUri = ""
		try {
			const personaDir = path.join(this.context.globalStorageUri.fsPath, "personas")
			const profilePath = path.join(personaDir, "agent_profile.png")
			const thinkingPath = path.join(personaDir, "agent_thinking.png")

			if (fs.existsSync(profilePath)) {
				const profileBuffer = fs.readFileSync(profilePath)
				personaProfileDataUri = `data:image/png;base64,${profileBuffer.toString("base64")}`
				this.caretLogger.debug(`[CaretProvider] Persona profile loaded, size: ${profileBuffer.length} bytes`)
			}

			if (fs.existsSync(thinkingPath)) {
				const thinkingBuffer = fs.readFileSync(thinkingPath)
				personaThinkingDataUri = `data:image/png;base64,${thinkingBuffer.toString("base64")}`
				this.caretLogger.debug(`[CaretProvider] Persona thinking loaded, size: ${thinkingBuffer.length} bytes`)
			}
		} catch (e) {
			this.caretLogger.debug(`[CaretProvider] No persona images found or error loading:`, e)
		}

		let updatedHtml = /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
				<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<link rel="stylesheet" type="text/css" href="${stylesUri}">
				<link href="${codiconsUri}" rel="stylesheet" />
				<link href="${katexCssUri}" rel="stylesheet" />
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src https://*.posthog.com https://*.firebaseauth.com https://*.firebaseio.com https://*.googleapis.com https://*.firebase.com; font-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https: data: blob: asset: vscode-resource: *; script-src 'nonce-${nonce}' 'unsafe-eval';">
				<title>Caret</title>
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				 <script type="text/javascript" nonce="${nonce}">
                    window.WEBVIEW_PROVIDER_TYPE = ${JSON.stringify(this.providerType)};
                    window.clineClientId = "${this.clientId}";
                    window.caretBanner = "${caretBannerDataUri}";
                    window.caretIcon = "${caretIconDataUri}";
                    window.personaProfile = "${personaProfileDataUri}";
                    window.personaThinking = "${personaThinkingDataUri}";
                </script>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</body>
		</html>
		`
		return updatedHtml
	}

	private getDevServerPort(): Promise<number> {
		const DEFAULT_PORT = 25463
		const portFilePath = path.join(this.context.extensionPath, "webview-ui", ".vite-port")

		return fs.promises
			.readFile(portFilePath, "utf8")
			.then((portFile) => {
				const port = parseInt(portFile.trim()) || DEFAULT_PORT
				this.caretLogger.info(`[getDevServerPort] Using dev server port ${port} from .vite-port file`)
				return port
			})
			.catch((err) => {
				this.caretLogger.warn(
					`[getDevServerPort] Port file not found or couldn't be read at ${portFilePath}, using default port: ${DEFAULT_PORT}`,
				)
				return DEFAULT_PORT
			})
	}

	protected async getHMRHtmlContent(webview: vscode.Webview): Promise<string> {
		const localPort = await this.getDevServerPort()
		const localServerUrl = `localhost:${localPort}`

		try {
			await axios.get(`http://${localServerUrl}`)
		} catch (error) {
			vscode.window.showErrorMessage(
				"Caret: Local webview dev server is not running, HMR will not work. Please run 'npm run dev:webview' before launching the extension to enable HMR. Using bundled assets.",
			)
			return this.getHtmlContent(webview)
		}

		const nonce = getNonce()
		const stylesUri = getUri(webview, this.context.extensionUri, ["webview-ui", "build", "assets", "index.css"])
		const codiconsUri = getUri(webview, this.context.extensionUri, [
			"node_modules",
			"@vscode",
			"codicons",
			"dist",
			"codicon.css",
		])
		const katexCssUri = getUri(webview, this.context.extensionUri, [
			"webview-ui",
			"node_modules",
			"katex",
			"dist",
			"katex.min.css",
		])

		const scriptEntrypoint = "src/main.tsx"
		const scriptUri = `http://${localServerUrl}/${scriptEntrypoint}`

		const reactRefresh = /*html*/ `
			<script nonce="${nonce}" type="module">
				import RefreshRuntime from "http://${localServerUrl}/@react-refresh"
				RefreshRuntime.injectIntoGlobalHook(window)
				window.$RefreshReg$ = () => {}
				window.$RefreshSig$ = () => (type) => type
				window.__vite_plugin_react_preamble_installed__ = true
			</script>
		`

		const csp = [
			"default-src 'none'",
			`font-src ${webview.cspSource} data:`,
			`style-src ${webview.cspSource} 'unsafe-inline' https://* http://${localServerUrl} http://0.0.0.0:${localPort}`,
			`img-src ${webview.cspSource} https: data: blob: asset: vscode-resource: *`, // CARET MODIFICATION: Added blob: asset: vscode-resource: * for persona images
			`script-src 'unsafe-eval' https://* http://${localServerUrl} http://0.0.0.0:${localPort} 'nonce-${nonce}' https://data.cline.bot`,
			`connect-src https://* ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort} https://data.cline.bot`,
		]

		let caretBannerDataUri = ""
		let caretIconDataUri = ""
		try {
			const bannerPath = path.join(this.context.extensionPath, "caret-assets", "caret-main-banner.webp")
			this.caretLogger.info(`[CaretProvider] HMR - Attempting to load banner from: ${bannerPath}`)
			if (fs.existsSync(bannerPath)) {
				const fileBuffer = fs.readFileSync(bannerPath)
				caretBannerDataUri = `data:image/webp;base64,${fileBuffer.toString("base64")}`
				this.caretLogger.info(`[CaretProvider] HMR - Banner loaded successfully, size: ${fileBuffer.length} bytes`)
			} else {
				this.caretLogger.error(`[CaretProvider] HMR - Banner file not found: ${bannerPath}`)
			}

			const iconPath = path.join(this.context.extensionPath, "caret-assets", "icons", "icon.png")
			this.caretLogger.info(`[CaretProvider] HMR - Attempting to load caret icon from: ${iconPath}`)
			if (fs.existsSync(iconPath)) {
				const iconBuffer = fs.readFileSync(iconPath)
				caretIconDataUri = `data:image/png;base64,${iconBuffer.toString("base64")}`
				this.caretLogger.info(`[CaretProvider] HMR - Caret icon loaded successfully, size: ${iconBuffer.length} bytes`)
			} else {
				this.caretLogger.error(`[CaretProvider] HMR - Caret icon file not found: ${iconPath}`)
			}
		} catch (e) {
			this.caretLogger.error(`[CaretProvider] HMR - Error loading banner image:`, e)
		}

		let personaProfileDataUri = ""
		let personaThinkingDataUri = ""
		try {
			const personaDir = path.join(this.context.globalStorageUri.fsPath, "personas")
			const profilePath = path.join(personaDir, "agent_profile.png")
			const thinkingPath = path.join(personaDir, "agent_thinking.png")

			if (fs.existsSync(profilePath)) {
				const profileBuffer = fs.readFileSync(profilePath)
				personaProfileDataUri = `data:image/png;base64,${profileBuffer.toString("base64")}`
				this.caretLogger.debug(`[CaretProvider] HMR - Persona profile loaded, size: ${profileBuffer.length} bytes`)
			}

			if (fs.existsSync(thinkingPath)) {
				const thinkingBuffer = fs.readFileSync(thinkingPath)
				personaThinkingDataUri = `data:image/png;base64,${thinkingBuffer.toString("base64")}`
				this.caretLogger.debug(`[CaretProvider] HMR - Persona thinking loaded, size: ${thinkingBuffer.length} bytes`)
			}
		} catch (e) {
			this.caretLogger.debug(`[CaretProvider] HMR - No persona images found or error loading:`, e)
		}

		return /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<script src="http://localhost:8097"></script> 
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
					<meta http-equiv="Content-Security-Policy" content="${csp.join("; ")}">
					<link rel="stylesheet" type="text/css" href="${stylesUri}">
					<link href="${codiconsUri}" rel="stylesheet" />
					<link href="${katexCssUri}" rel="stylesheet" />
					<title>Caret</title>
				</head>
				<body>
					<div id="root"></div>
					<script type="text/javascript" nonce="${nonce}">
						window.WEBVIEW_PROVIDER_TYPE = ${JSON.stringify(this.providerType)};
						window.clineClientId = "${this.clientId}";
						window.caretBanner = "${caretBannerDataUri}";
						window.caretIcon = "${caretIconDataUri}";
						window.personaProfile = "${personaProfileDataUri}";
						window.personaThinking = "${personaThinkingDataUri}";
					</script>
					${reactRefresh}
					<script type="module" src="${scriptUri}"></script>
				</body>
			</html>
		`
	}

	private setWebviewMessageListener(webview: vscode.Webview) {
		webview.onDidReceiveMessage(
			(message) => {
				this.controller.handleWebviewMessage(message)
			},
			null,
			this.disposables,
		)
	}

	public async dispose() {
		this.caretLogger.info(`Disposing CaretProvider for ${this.providerType} with client ID: ${this.getClientId()}.`)
		while (this.disposables.length) {
			const x = this.disposables.pop()
			if (x) {
				x.dispose()
			}
		}
		await this.controller.dispose()
	}

	/**
	 * Loads environment variables from .env.dev or .env.prod based on extension mode.
	 * @returns A promise that resolves to an object containing environment variables.
	 */
	// CARET MODIFICATION: Changed to protected for testing purposes, following forTest_ prefix rule.
	protected async forTest_loadEnvironmentVariables(): Promise<Record<string, string>> {
		const envFileName = this.context.extensionMode === vscode.ExtensionMode.Development ? ".env.dev" : ".env.prod"
		const envFilePath = path.join(this.context.extensionPath, "webview-ui", envFileName)

		this.caretLogger.info(`Attempting to load environment variables from: ${envFilePath}`, "ENV_LOAD")

		try {
			const fileContent = await fs.promises.readFile(envFilePath, "utf8")
			const envVars: Record<string, string> = {}
			fileContent.split("\n").forEach((line) => {
				const trimmedLine = line.trim()
				if (trimmedLine && !trimmedLine.startsWith("#")) {
					const [key, value] = trimmedLine.split("=")
					if (key && value) {
						envVars[key.trim()] = value.trim()
					}
				}
			})
			this.caretLogger.info(`Successfully loaded environment variables from ${envFileName}`, "ENV_LOAD")
			return envVars
		} catch (error) {
			this.caretLogger.error(`Failed to load environment variables from ${envFileName}: ${error}`, "ENV_LOAD")
			return {} // Return empty object on error
		}
	}

	// CARET MODIFICATION: Add login method for Auth0 authentication
	public async login(): Promise<void> {
		this.caretLogger.info("Initiating login process...", "AUTH")
		try {
			await this.initializeAuth0Client() // CARET MODIFICATION: Ensure client is initialized
			const authorizeUrl = await this.generateLoginUrl() // CARET MODIFICATION: Use new method to get URL

			this.caretLogger.info(`Opening browser for authentication: ${authorizeUrl}`, "AUTH")
			await vscode.env.openExternal(vscode.Uri.parse(authorizeUrl))
			this.caretLogger.info("Browser opened for authentication.", "AUTH")
		} catch (error) {
			this.caretLogger.error(`Login process failed: ${error}`, "AUTH")
			this.handleAuthError(error) // CARET MODIFICATION: Use new error handling method
		}
	}

	// CARET MODIFICATION: Public method to initialize Auth0 client
	private async initializeAuth0Client(): Promise<void> {
		await this.forTest_initializeAuth0Client()
	}

	// CARET MODIFICATION: Initializes the Auth0 client for testing purposes, following forTest_ prefix rule.
	protected async forTest_initializeAuth0Client(): Promise<void> {
		if (this.auth0Client) {
			this.caretLogger.info("Auth0 client already initialized.", "AUTH")
			return
		}

		const envVars = await this.forTest_loadEnvironmentVariables()
		const auth0Domain = envVars.AUTH0_DOMAIN
		const auth0ClientId = envVars.AUTH0_CLIENT_ID
		const auth0CallbackUrl = envVars.AUTH0_CALLBACK_URL

		if (!auth0Domain || !auth0ClientId || !auth0CallbackUrl) {
			this.caretLogger.error("Missing Auth0 environment variables for client initialization.", "AUTH")
			throw new Error("Auth0 configuration incomplete.")
		}

		this.auth0Client = new Auth0Client({
			domain: auth0Domain,
			clientId: auth0ClientId,
			authorizationParams: {
				redirect_uri: auth0CallbackUrl,
				audience: "", // Optional: specify API audience
				scope: "openid profile email",
			},
			useRefreshTokens: true,
			cacheLocation: "localstorage", // Or 'memory' depending on requirements
		})
		this.caretLogger.info("Auth0 client initialized successfully.", "AUTH")
	}

	// CARET MODIFICATION: Generates the login URL using Auth0 SPA JS approach
	public async generateLoginUrl(): Promise<string> {
		await this.initializeAuth0Client()
		if (!this.auth0Client) {
			throw new Error("Auth0 client not initialized.")
		}

		// CARET MODIFICATION: Use Auth0 SPA JS approach to build authorize URL
		const envVars = await this.forTest_loadEnvironmentVariables()
		const auth0Domain = envVars.AUTH0_DOMAIN
		const auth0ClientId = envVars.AUTH0_CLIENT_ID
		const auth0CallbackUrl = envVars.AUTH0_CALLBACK_URL

		const state = uuidv4()
		const nonce = uuidv4()

		const authorizeUrl =
			`https://${auth0Domain}/authorize?` +
			`client_id=${encodeURIComponent(auth0ClientId)}&` +
			`response_type=code&` +
			`redirect_uri=${encodeURIComponent(auth0CallbackUrl)}&` +
			`scope=${encodeURIComponent("openid profile email").replace(/%20/g, "+")}&` +
			`audience=${encodeURIComponent("")}&` +
			`state=${encodeURIComponent(state)}&` +
			`nonce=${encodeURIComponent(nonce)}`

		this.caretLogger.info(`Generated login URL: ${authorizeUrl}`, "AUTH")
		return authorizeUrl
	}

	// CARET MODIFICATION: Handles the authentication callback
	public async handleAuthCallback(url: string): Promise<void> {
		this.caretLogger.info(`Handling authentication callback for URL: ${url}`, "AUTH")
		await this.initializeAuth0Client()
		if (!this.auth0Client) {
			throw new Error("Auth0 client not initialized.")
		}
		try {
			// CARET MODIFICATION: Use Auth0 SPA JS approach - handle redirect callback
			await this.auth0Client.handleRedirectCallback(url)
			this.caretLogger.info("Authentication callback processed successfully.", "AUTH")
			const user = await this.auth0Client.getUser()
			this.caretLogger.info(`Logged in user: ${user?.email}`, "AUTH")
			vscode.window.showInformationMessage(`Caret: Logged in as ${user?.email}`)
			// TODO: Save user session/tokens securely
		} catch (error) {
			this.caretLogger.error(`Error processing authentication callback: ${error}`, "AUTH")
			this.handleAuthError(error)
		}
	}

	// CARET MODIFICATION: Handles authentication errors gracefully
	public handleAuthError(error: any): void {
		this.caretLogger.error(`Authentication error: ${error}`, "AUTH")
		vscode.window.showErrorMessage(`Caret: Authentication failed. ${error?.message || error}`)
	}

	/**
	 * CARET MODIFICATION: 페르소나 이미지 변경 알림 메서드
	 * 페르소나 이미지가 변경될 때 웹뷰에 알리고 전역 변수를 업데이트합니다.
	 * 이 메서드는 PersonaInitializer와 컨트롤러의 이미지 업로드 핸들러에서 호출됩니다.
	 */
	public notifyPersonaImagesChanged(): void {
		try {
			// 1. globalStorage에서 최신 이미지 로드
			const personaDir = path.join(this.context.globalStorageUri.fsPath, "personas")
			const profilePath = path.join(personaDir, "agent_profile.png")
			const thinkingPath = path.join(personaDir, "agent_thinking.png")

			let personaProfileDataUri = ""
			let personaThinkingDataUri = ""

			if (fs.existsSync(profilePath)) {
				const profileBuffer = fs.readFileSync(profilePath)
				personaProfileDataUri = `data:image/png;base64,${profileBuffer.toString("base64")}`
				this._personaProfileDataUri = personaProfileDataUri
				this.caretLogger.debug(`[CaretProvider] Persona profile updated, size: ${profileBuffer.length} bytes`)
			}

			if (fs.existsSync(thinkingPath)) {
				const thinkingBuffer = fs.readFileSync(thinkingPath)
				personaThinkingDataUri = `data:image/png;base64,${thinkingBuffer.toString("base64")}`
				this._personaThinkingDataUri = personaThinkingDataUri
				this.caretLogger.debug(`[CaretProvider] Persona thinking updated, size: ${thinkingBuffer.length} bytes`)
			}

			// 2. 웹뷰에 메시지 전송
			if (personaProfileDataUri && personaThinkingDataUri) {
				this.controller.postMessageToWebview({
					type: "RESPONSE_PERSONA_IMAGES",
					payload: {
						avatarUri: personaProfileDataUri,
						thinkingAvatarUri: personaThinkingDataUri,
					},
				})

				this.caretLogger.info("[CaretProvider] 페르소나 이미지 업데이트 알림 전송 완료")
			} else {
				this.caretLogger.warn("[CaretProvider] 페르소나 이미지를 찾을 수 없어 업데이트 알림을 보내지 않았습니다.")
			}
		} catch (e) {
			this.caretLogger.error(`[CaretProvider] 페르소나 이미지 업데이트 알림 실패: ${e}`)
		}
	}
}
