// CARET MODIFICATION: This file has been refactored to extend the base WebviewProvider from Cline,
// aligning with the new architecture and reducing code duplication while maintaining Caret-specific features.
import * as vscode from "vscode"
import axios from "axios"
import * as fs from "fs"
import * as path from "path"
import { Auth0Client } from "@auth0/auth0-spa-js"
import { WebviewProviderType } from "../../../src/shared/webview/types"
import { getNonce } from "../../../src/core/webview/getNonce"
import { getUri } from "../../utils/getUri"
import { CaretLogger } from "../../utils/caret-logger"
import { WebviewProvider } from "../../../src/core/webview"
import { v4 as uuidv4 } from "uuid"

export const CARET_SIDEBAR_ID = "caret.SidebarProvider"
export const CARET_TAB_PANEL_ID = "caret.TabPanelProvider"

export class CaretProvider extends WebviewProvider {
	private caretLogger: CaretLogger
	private auth0Client?: Auth0Client
	private _personaProfileDataUri: string = ""
	private _personaThinkingDataUri: string = ""
	private static instance: CaretProvider | null = null

	constructor(
		public override readonly context: vscode.ExtensionContext,
		providerType: WebviewProviderType = WebviewProviderType.SIDEBAR,
		caretLoggerInstance?: CaretLogger,
	) {
		// CARET MODIFICATION: Call super() but override Controller creation
		super(context, providerType)

		// CARET MODIFICATION: Replace Controller with null temporarily to prevent early initialization
		this.controller = null as any

		this.caretLogger = caretLoggerInstance || new CaretLogger()

		this.caretLogger.info(`CaretProvider constructor called for ${providerType}.`)
		this.caretLogger.extensionActivated()
		this.caretLogger.welcomePageLoaded()

		CaretProvider.instance = this

		// CARET MODIFICATION: Delay Controller creation until first use
		this._controllerInitialized = false
	}

	// CARET MODIFICATION: Lazy Controller initialization
	private _controllerInitialized = false

	private async ensureControllerInitialized(): Promise<void> {
		if (!this._controllerInitialized) {
			// CARET MODIFICATION: Ensure HostProvider is initialized before creating Controller
			const { HostProvider } = require("../../../src/hosts/host-provider")
			if (!HostProvider.isInitialized()) {
				this.caretLogger.warn("HostProvider not initialized when creating Controller, waiting...")
				// Wait a bit for src/extension.ts to initialize HostProvider
				return new Promise((resolve) => {
					setTimeout(async () => {
						await this.ensureControllerInitialized()
						resolve()
					}, 100)
				})
			}

			const { Controller } = require("../../../src/core/controller")
			this.controller = new Controller(
				this.context,
				(message: any) => this.view?.webview.postMessage(message),
				this.getClientId(),
			)
			this._controllerInitialized = true
			this.caretLogger.info(`Controller initialized with client ID: ${this.getClientId()}`)
		}
	}

	public static getInstance(): CaretProvider | null {
		return CaretProvider.instance
	}

	public static override getVisibleInstance(): CaretProvider | undefined {
		return CaretProvider.instance || undefined
	}

	public override async resolveWebviewView(webviewView: vscode.WebviewView | vscode.WebviewPanel) {
		this.caretLogger.info(`resolveWebviewView started for ${this.providerType} with client ID: ${this.getClientId()}`)

		// CARET MODIFICATION: Ensure Controller is initialized before proceeding
		await this.ensureControllerInitialized()

		await super.resolveWebviewView(webviewView)
		this.controller.postStateToWebview()
		this.caretLogger.info(
			`resolveWebviewView finished for ${this.providerType} with client ID: ${this.getClientId()}. Controller is ready.`,
		)
	}

	protected override getHtmlContent(webview: vscode.Webview): string {
		const stylesUri = getUri(webview, this.context.extensionUri, ["caret-webview-ui", "build", "assets", "index.css"])
		const scriptUri = getUri(webview, this.context.extensionUri, ["caret-webview-ui", "build", "assets", "index.js"])
		const codiconsUri = getUri(webview, this.context.extensionUri, [
			"node_modules",
			"@vscode",
			"codicons",
			"dist",
			"codicon.css",
		])
		const katexCssUri = getUri(webview, this.context.extensionUri, [
			"caret-webview-ui",
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
			if (fs.existsSync(bannerPath)) {
				const fileBuffer = fs.readFileSync(bannerPath)
				caretBannerDataUri = `data:image/webp;base64,${fileBuffer.toString("base64")}`
			}
			const iconPath = path.join(this.context.extensionPath, "caret-assets", "icons", "icon.png")
			if (fs.existsSync(iconPath)) {
				const iconBuffer = fs.readFileSync(iconPath)
				caretIconDataUri = `data:image/png;base64,${iconBuffer.toString("base64")}`
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
			}

			if (fs.existsSync(thinkingPath)) {
				const thinkingBuffer = fs.readFileSync(thinkingPath)
				personaThinkingDataUri = `data:image/png;base64,${thinkingBuffer.toString("base64")}`
			}
		} catch (e) {
			this.caretLogger.debug(`[CaretProvider] No persona images found or error loading:`, e)
		}

		return /*html*/ `
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
                    window.clineClientId = "${this.getClientId()}";
                    window.caretBanner = "${caretBannerDataUri}";
                    window.caretIcon = "${caretIconDataUri}";
                    window.personaProfile = "${personaProfileDataUri}";
                    window.personaThinking = "${personaThinkingDataUri}";
                </script>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</body>
		</html>
		`
	}

	protected override async getHMRHtmlContent(webview: vscode.Webview): Promise<string> {
		const localPort = await super["getDevServerPort"]()
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
		const stylesUri = getUri(webview, this.context.extensionUri, ["caret-webview-ui", "build", "assets", "index.css"])
		const codiconsUri = getUri(webview, this.context.extensionUri, [
			"node_modules",
			"@vscode",
			"codicons",
			"dist",
			"codicon.css",
		])
		const katexCssUri = getUri(webview, this.context.extensionUri, [
			"caret-webview-ui",
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
			`img-src ${webview.cspSource} https: data: blob: asset: vscode-resource: *`,
			`script-src 'unsafe-eval' https://* http://${localServerUrl} http://0.0.0.0:${localPort} 'nonce-${nonce}' https://data.cline.bot`,
			`connect-src https://* ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort} https://data.cline.bot`,
		]

		let caretBannerDataUri = ""
		let caretIconDataUri = ""
		try {
			const bannerPath = path.join(this.context.extensionPath, "caret-assets", "caret-main-banner.webp")
			if (fs.existsSync(bannerPath)) {
				const fileBuffer = fs.readFileSync(bannerPath)
				caretBannerDataUri = `data:image/webp;base64,${fileBuffer.toString("base64")}`
			}
			const iconPath = path.join(this.context.extensionPath, "caret-assets", "icons", "icon.png")
			if (fs.existsSync(iconPath)) {
				const iconBuffer = fs.readFileSync(iconPath)
				caretIconDataUri = `data:image/png;base64,${iconBuffer.toString("base64")}`
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
			}

			if (fs.existsSync(thinkingPath)) {
				const thinkingBuffer = fs.readFileSync(thinkingPath)
				personaThinkingDataUri = `data:image/png;base64,${thinkingBuffer.toString("base64")}`
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
						window.clineClientId = "${this.getClientId()}";
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

	protected async forTest_loadEnvironmentVariables(): Promise<Record<string, string>> {
		const envFileName = this.context.extensionMode === vscode.ExtensionMode.Development ? ".env.dev" : ".env.prod"
		const envFilePath = path.join(this.context.extensionPath, "caret-webview-ui", envFileName)

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
			return {}
		}
	}

	public async login(): Promise<void> {
		this.caretLogger.info("Initiating login process...", "AUTH")
		try {
			await this.initializeAuth0Client()
			const authorizeUrl = await this.generateLoginUrl()

			this.caretLogger.info(`Opening browser for authentication: ${authorizeUrl}`, "AUTH")
			await vscode.env.openExternal(vscode.Uri.parse(authorizeUrl))
			this.caretLogger.info("Browser opened for authentication.", "AUTH")
		} catch (error) {
			this.caretLogger.error(`Login process failed: ${error}`, "AUTH")
			this.handleAuthError(error)
		}
	}

	private async initializeAuth0Client(): Promise<void> {
		await this.forTest_initializeAuth0Client()
	}

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
				audience: "",
				scope: "openid profile email",
			},
			useRefreshTokens: true,
			cacheLocation: "localstorage",
		})
		this.caretLogger.info("Auth0 client initialized successfully.", "AUTH")
	}

	public async generateLoginUrl(): Promise<string> {
		await this.initializeAuth0Client()
		if (!this.auth0Client) {
			throw new Error("Auth0 client not initialized.")
		}

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

	public async handleAuthCallback(url: string): Promise<void> {
		this.caretLogger.info(`Handling authentication callback for URL: ${url}`, "AUTH")
		await this.initializeAuth0Client()
		if (!this.auth0Client) {
			throw new Error("Auth0 client not initialized.")
		}
		try {
			await this.auth0Client.handleRedirectCallback(url)
			this.caretLogger.info("Authentication callback processed successfully.", "AUTH")
			const user = await this.auth0Client.getUser()
			this.caretLogger.info(`Logged in user: ${user?.email}`, "AUTH")
			vscode.window.showInformationMessage(`Caret: Logged in as ${user?.email}`)
		} catch (error) {
			this.caretLogger.error(`Error processing authentication callback: ${error}`, "AUTH")
			this.handleAuthError(error)
		}
	}

	public handleAuthError(error: any): void {
		this.caretLogger.error(`Authentication error: ${error}`, "AUTH")
		vscode.window.showErrorMessage(`Caret: Authentication failed. ${error?.message || error}`)
	}

	public notifyPersonaImagesChanged(): void {
		try {
			const personaDir = path.join(this.context.globalStorageUri.fsPath, "personas")
			const profilePath = path.join(personaDir, "agent_profile.png")
			const thinkingPath = path.join(personaDir, "agent_thinking.png")

			let personaProfileDataUri = ""
			let personaThinkingDataUri = ""

			if (fs.existsSync(profilePath)) {
				const profileBuffer = fs.readFileSync(profilePath)
				personaProfileDataUri = `data:image/png;base64,${profileBuffer.toString("base64")}`
				this._personaProfileDataUri = personaProfileDataUri
			}

			if (fs.existsSync(thinkingPath)) {
				const thinkingBuffer = fs.readFileSync(thinkingPath)
				personaThinkingDataUri = `data:image/png;base64,${thinkingBuffer.toString("base64")}`
				this._personaThinkingDataUri = personaThinkingDataUri
			}

			if (personaProfileDataUri && personaThinkingDataUri) {
				this.controller.postMessageToWebview({
					type: "RESPONSE_PERSONA_IMAGES",
					payload: {
						avatarUri: personaProfileDataUri,
						thinkingAvatarUri: personaThinkingDataUri,
					},
				})
			}
		} catch (e) {
			this.caretLogger.error(`[CaretProvider] 페르소나 이미지 업데이트 알림 실패: ${e}`)
		}
	}
}
