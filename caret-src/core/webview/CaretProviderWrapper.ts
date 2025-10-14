import { getUri } from "@caret/utils/getUri"
import { existsSync } from "fs"
import * as fs from "fs/promises"
import * as path from "path"
import * as vscode from "vscode"
import { Controller } from "@/core/controller/index"
import { VscodeWebviewProvider } from "@/hosts/vscode/VscodeWebviewProvider"
import { Logger } from "@/services/logging/Logger"

/**
 * CaretProviderWrapper - Wrapper Pattern Implementation
 *
 * This class wraps the original Cline VscodeWebviewProvider to inject Caret-specific
 * functionality while maintaining full compatibility with the Cline initialization flow.
 *
 * Key Design Principles:
 * - Minimal modification to Cline source code
 * - Full compatibility with Cline's initialization sequence
 * - Proper separation of concerns between Caret and Cline features
 * - Maintainability for future upstream merges
 */
export class CaretProviderWrapper implements vscode.WebviewViewProvider {
	private clineProvider: VscodeWebviewProvider
	private disposables: vscode.Disposable[] = []
	private _onDidReceiveMessage = new vscode.EventEmitter<any>()
	public readonly onMessage = this._onDidReceiveMessage.event
	private _onDidResolveWebviewView = new vscode.EventEmitter<vscode.WebviewView>()
	public readonly onWebviewViewResolved = this._onDidResolveWebviewView.event

	constructor(
		private context: vscode.ExtensionContext,
		clineWebviewProvider: VscodeWebviewProvider,
	) {
		this.clineProvider = clineWebviewProvider
		Logger.info("[CaretProviderWrapper] Initialized with Cline WebviewProvider")
	}

	/**
	 * Implements the VS Code WebviewViewProvider interface
	 * Delegates to the Cline provider while adding Caret enhancements
	 */
	async resolveWebviewView(webviewView: vscode.WebviewView) {
		Logger.info("[CaretProviderWrapper] Resolving webview view with Caret enhancements")

		try {
			// Emit our own resolve event
			this._onDidResolveWebviewView.fire(webviewView)

			// 1. First, let Cline handle the core webview setup
			await this.clineProvider.resolveWebviewView(webviewView)

			// 2. Then add Caret-specific enhancements
			await this.enhanceWebviewWithCaretFeatures(webviewView)

			// 3. Set up Caret-specific message handling
			this.setupCaretMessageHandling(webviewView)

			Logger.info("[CaretProviderWrapper] Successfully resolved webview with Caret features")
		} catch (error) {
			Logger.error(`[CaretProviderWrapper] Failed to resolve webview: ${error}`)
			throw error
		}
	}

	/**
	 * Enhance the webview with Caret-specific features
	 * Following caret-main pattern: inject Base64 images as window variables
	 */
	public async enhanceWebviewWithCaretFeatures(webviewView: vscode.WebviewView): Promise<void> {
		Logger.info("[CaretProviderWrapper] 🔵 START enhanceWebviewWithCaretFeatures")
		try {
			// Enhance webview options for Caret-specific resources
			const originalOptions = webviewView.webview.options
			webviewView.webview.options = {
				...originalOptions,
				localResourceRoots: [
					...(originalOptions.localResourceRoots || []),
					vscode.Uri.joinPath(this.context.extensionUri, "assets"),
				],
			}

			// Wait for HTML to be actually set by Cline
			Logger.info("[CaretProviderWrapper] 🔵 Waiting for HTML to be generated...")
			await this.waitForHtmlReady(webviewView)

			Logger.info("[CaretProviderWrapper] 🔵 About to inject template images")
			// Inject template character images and banner as Base64 data URIs following caret-main pattern
			await this.injectTemplateImagesAsBase64(webviewView)

			Logger.info("[CaretProviderWrapper] 🔵 About to inject banner image")
			await this.injectBannerImageAsBase64(webviewView)

			Logger.info("[CaretProviderWrapper] Webview enhanced with Caret features - all images injected as Base64")
		} catch (error) {
			Logger.warn(`[CaretProviderWrapper] Failed to enhance webview: ${error}`)
		}
	}

	/**
	 * Wait for HTML to be ready (non-empty and contains expected markers)
	 */
	private async waitForHtmlReady(webviewView: vscode.WebviewView, maxAttempts = 10): Promise<void> {
		for (let i = 0; i < maxAttempts; i++) {
			const html = webviewView.webview.html
			Logger.info(`[CaretProviderWrapper] 🔵 Attempt ${i + 1}: HTML length = ${html.length}`)

			if (html.length > 1000 && (html.includes("window.clineClientId") || html.includes("</head>"))) {
				Logger.info(`[CaretProviderWrapper] 🔵 HTML is ready! Length: ${html.length}`)
				return
			}

			Logger.info(`[CaretProviderWrapper] 🔵 HTML not ready yet, waiting 100ms...`)
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		Logger.warn(`[CaretProviderWrapper] 🔴 HTML still not ready after ${maxAttempts} attempts!`)
	}

	/**
	 * Inject template character images as Base64 data URIs following caret-main pattern
	 * This follows the exact pattern from caret-main/caret-src/core/webview/CaretProvider.ts
	 */
	private async injectTemplateImagesAsBase64(webviewView: vscode.WebviewView): Promise<void> {
		try {
			let html = webviewView.webview.html
			Logger.info(`[CaretProviderWrapper] 🔵 Starting template images injection. Original HTML length: ${html.length}`)
			Logger.info(`[CaretProviderWrapper] 🔵 HTML preview (first 1000 chars): ${html.substring(0, 1000)}`)

			// Find the exact location and format of window.clineClientId
			const clientIdIndex = html.indexOf("window.clineClientId")
			if (clientIdIndex !== -1) {
				const snippet = html.substring(Math.max(0, clientIdIndex - 50), Math.min(html.length, clientIdIndex + 200))
				Logger.info(`[CaretProviderWrapper] 🔵 Found window.clineClientId at index ${clientIdIndex}`)
				Logger.info(`[CaretProviderWrapper] 🔵 Snippet around it: ${snippet}`)
			}

			Logger.info(
				`[CaretProviderWrapper] 🔵 HTML contains "window.clineClientId": ${html.includes("window.clineClientId")}`,
			)
			Logger.info(`[CaretProviderWrapper] 🔵 HTML contains "</head>": ${html.includes("</head>")}`)

			// Part 1: Inject all template character images (e.g., for the selector UI)
			const templateDir = path.join(this.context.extensionUri.fsPath, "assets", "template_characters")
			const allFiles = await fs.readdir(templateDir)
			const imageFiles = allFiles.filter((file) => file.endsWith(".png"))

			let templateInjectionScript = "\n"
			for (const file of imageFiles) {
				try {
					const imagePath = path.join(templateDir, file)
					const imageBuffer = await fs.readFile(imagePath)
					const base64 = imageBuffer.toString("base64")
					const dataUri = `data:image/png;base64,${base64}`
					const varName = file.replace(".png", "").replace("_", "")
					templateInjectionScript += `window.templateImage_${varName} = "${dataUri}";\n`
				} catch (error) {
					Logger.error(`[CaretProviderWrapper] Failed to load template image ${file}: ${error}`)
				}
			}

			// Part 2: Determine and inject the ACTIVE persona images (from storage or default)
			let profileBase64: string | null = null
			let thinkingBase64: string | null = null

			const personaDir = path.join(this.context.globalStorageUri.fsPath, "personas")
			const profilePath = path.join(personaDir, "agent_profile.png")
			const thinkingPath = path.join(personaDir, "agent_thinking.png")

			if (existsSync(profilePath) && existsSync(thinkingPath)) {
				try {
					const profileBuffer = await fs.readFile(profilePath)
					thinkingBase64 = (await fs.readFile(thinkingPath)).toString("base64")
					profileBase64 = profileBuffer.toString("base64")
					Logger.info("[CaretProviderWrapper] Successfully loaded persona images from globalStorage.")
				} catch (error) {
					Logger.error(
						`[CaretProviderWrapper] Failed to read persona images from globalStorage, falling back to default: ${error}`,
					)
				}
			}

			if (!profileBase64 || !thinkingBase64) {
				try {
					Logger.info("[CaretProviderWrapper] Loading default Caret persona images as fallback.")
					const caretProfilePath = path.join(templateDir, "caret.png")
					const caretThinkingPath = path.join(templateDir, "caret_thinking.png")
					profileBase64 = (await fs.readFile(caretProfilePath)).toString("base64")
					thinkingBase64 = (await fs.readFile(caretThinkingPath)).toString("base64")
				} catch (error) {
					Logger.error(`[CaretProviderWrapper] CRITICAL: Failed to load default Caret images: ${error}`)
				}
			}

			let personaInjectionScript = "\n"
			if (profileBase64) {
				personaInjectionScript += `window.personaProfile = "data:image/png;base64,${profileBase64}";\n`
			}
			if (thinkingBase64) {
				personaInjectionScript += `window.personaThinking = "data:image/png;base64,${thinkingBase64}";\n`
			}

			// Part 3: Inject all scripts into the HTML
			const finalInjectionScript = templateInjectionScript + personaInjectionScript
			Logger.info(`[CaretProviderWrapper] 🔵 Final injection script length: ${finalInjectionScript.length}`)

			const beforeReplace = html.length
			if (html.includes("window.clineClientId")) {
				Logger.info(`[CaretProviderWrapper] 🔵 Using window.clineClientId injection point`)

				// 정규식 매칭 테스트 - 세미콜론 선택적으로 변경
				const regex = /(window\.clineClientId = "[^"]*";?)/
				const match = html.match(regex)
				Logger.info(`[CaretProviderWrapper] 🔵 Regex match found: ${match !== null}`)
				if (match) {
					Logger.info(`[CaretProviderWrapper] 🔵 Matched string: ${match[0]}`)
					Logger.info(`[CaretProviderWrapper] 🔵 Match index: ${match.index}`)
				}

				// Replace 시도
				const newHtml = html.replace(regex, `$1${finalInjectionScript}`)
				Logger.info(
					`[CaretProviderWrapper] 🔵 New HTML length after replace: ${newHtml.length} (delta: ${newHtml.length - beforeReplace})`,
				)
				Logger.info(`[CaretProviderWrapper] 🔵 HTML actually changed: ${html !== newHtml}`)

				html = newHtml
				Logger.info(
					`[CaretProviderWrapper] 🔵 HTML length AFTER replace: ${html.length} (delta: ${html.length - beforeReplace})`,
				)
			} else if (html.includes("</head>")) {
				Logger.info(`[CaretProviderWrapper] 🔵 Using </head> injection point`)
				html = html.replace("</head>", `<script>${finalInjectionScript}</script></head>`)
				Logger.info(
					`[CaretProviderWrapper] 🔵 HTML length AFTER replace: ${html.length} (delta: ${html.length - beforeReplace})`,
				)
			} else {
				Logger.warn(`[CaretProviderWrapper] 🔴 No injection point found in template injection!`)
			}

			webviewView.webview.html = html
			Logger.info(`[CaretProviderWrapper] 🔵 Template images injection complete. New HTML length: ${html.length}`)
		} catch (error) {
			Logger.error(`[CaretProviderWrapper] Failed to inject images: ${error}`)
		}
	}

	/**
	 * Set up Caret-specific message handling
	 */
	private setupCaretMessageHandling(webviewView: vscode.WebviewView): void {
		const messageDisposable = webviewView.webview.onDidReceiveMessage(async (message) => {
			// CARET MODIFICATION: Suppress noisy getBrowserConnectionInfo logs
			if (!(message.type === "grpc_request" && message.grpc_request?.method === "getBrowserConnectionInfo")) {
				Logger.debug(`[CaretProviderWrapper] Received message: ${JSON.stringify(message)}`)
			}

			// Fire our own event
			this._onDidReceiveMessage.fire(message)
			try {
				await this.handleCaretMessage(message, webviewView)
			} catch (error) {
				Logger.error(`[CaretProviderWrapper] Error handling Caret message: ${error}`)
			}
		})

		this.disposables.push(messageDisposable)
	}

	/**
	 * Handle Caret-specific messages
	 */
	private async handleCaretMessage(message: any, webviewView: vscode.WebviewView): Promise<void> {
		// CARET MODIFICATION: Suppress noisy grpc_request logs
		if (message.type !== "grpc_request") {
			Logger.debug(`[CaretProviderWrapper] Processing message type: ${message.type}`)
		}
		switch (message.type) {
			case "caret_load_persona_image":
				await this.handleLoadPersonaImage(message, webviewView)
				break
			default:
				// CARET MODIFICATION: Suppress noisy grpc_request logs
				if (message.type !== "grpc_request") {
					Logger.debug(`[CaretProviderWrapper] Passing message to Cline: ${message.type}`)
				}
				// Let Cline handle non-Caret messages
				break
		}
	}

	/**
	 * Inject banner image as Base64 data URI
	 */
	private async injectBannerImageAsBase64(webviewView: vscode.WebviewView): Promise<void> {
		try {
			const bannerPath = path.join(this.context.extensionUri.fsPath, "assets", "welcome-banner.webp")
			Logger.info(`[CaretProviderWrapper] 🟢 Banner path: ${bannerPath}`)
			Logger.info(`[CaretProviderWrapper] 🟢 Banner exists: ${existsSync(bannerPath)}`)

			if (existsSync(bannerPath)) {
				const imageBuffer = await fs.readFile(bannerPath)
				Logger.info(`[CaretProviderWrapper] 🟢 Banner buffer loaded: ${imageBuffer.length} bytes`)

				const base64 = imageBuffer.toString("base64")
				Logger.info(`[CaretProviderWrapper] 🟢 Banner Base64 length: ${base64.length}`)

				const dataUri = `data:image/webp;base64,${base64}`
				Logger.info(`[CaretProviderWrapper] 🟢 Banner data URI created: ${dataUri.substring(0, 50)}...`)

				let html = webviewView.webview.html
				Logger.info(`[CaretProviderWrapper] 🟢 HTML length BEFORE banner injection: ${html.length}`)
				Logger.info(
					`[CaretProviderWrapper] 🟢 HTML contains "window.clineClientId": ${html.includes("window.clineClientId")}`,
				)
				Logger.info(`[CaretProviderWrapper] 🟢 HTML contains "</head>": ${html.includes("</head>")}`)

				// Inject banner image as window variable
				const imageInjectionScript = `\n                    window.caretBannerImage = "${dataUri}";\n`
				Logger.info(`[CaretProviderWrapper] 🟢 Injection script created, length: ${imageInjectionScript.length}`)

				// Find where to inject the script - look for existing window assignments
				if (html.includes("window.clineClientId")) {
					Logger.info(`[CaretProviderWrapper] 🟢 Using window.clineClientId injection point`)
					const beforeReplace = html.length

					// 정규식 매칭 테스트 - 세미콜론 선택적으로 변경
					const regex = /(window\.clineClientId = "[^"]*";?)/
					const match = html.match(regex)
					Logger.info(`[CaretProviderWrapper] 🟢 Regex match found: ${match !== null}`)
					if (match) {
						Logger.info(`[CaretProviderWrapper] 🟢 Matched string: ${match[0]}`)
						Logger.info(`[CaretProviderWrapper] 🟢 Match index: ${match.index}`)
					}

					// Replace 시도
					const newHtml = html.replace(regex, `$1${imageInjectionScript}`)
					Logger.info(
						`[CaretProviderWrapper] 🟢 New HTML length after replace: ${newHtml.length} (delta: ${newHtml.length - beforeReplace})`,
					)
					Logger.info(`[CaretProviderWrapper] 🟢 HTML actually changed: ${html !== newHtml}`)

					html = newHtml
					Logger.info(
						`[CaretProviderWrapper] 🟢 HTML length AFTER replace: ${html.length} (delta: ${html.length - beforeReplace})`,
					)
				} else if (html.includes("</head>")) {
					Logger.info(`[CaretProviderWrapper] 🟢 Using </head> injection point`)
					const scriptTag = `<script>${imageInjectionScript}</script>`
					const beforeReplace = html.length
					html = html.replace("</head>", `${scriptTag}</head>`)
					Logger.info(
						`[CaretProviderWrapper] 🟢 HTML length AFTER replace: ${html.length} (delta: ${html.length - beforeReplace})`,
					)
				} else {
					Logger.warn(`[CaretProviderWrapper] 🔴 No injection point found!`)
				}

				webviewView.webview.html = html
				Logger.info(`[CaretProviderWrapper] 🟢 Banner injection complete. Final HTML length: ${html.length}`)
				Logger.info(`[CaretProviderWrapper] 🟢 Banner image injected successfully (${imageBuffer.length} bytes)`)
			} else {
				Logger.warn(`[CaretProviderWrapper] 🔴 Banner file not found at: ${bannerPath}`)
			}
		} catch (error) {
			Logger.error(`[CaretProviderWrapper] 🔴 Failed to inject banner image: ${error}`)
		}
	}

	/**
	 * Handle persona image loading requests
	 */
	private async handleLoadPersonaImage(message: any, webviewView: vscode.WebviewView): Promise<void> {
		try {
			const { personaId, imagePath } = message
			const fullPath = path.join(this.context.extensionUri.fsPath, "assets", "template_characters", imagePath)

			if (existsSync(fullPath)) {
				const imageUri = getUri(webviewView.webview, this.context.extensionUri, [
					"assets",
					"template_characters",
					imagePath,
				])

				webviewView.webview.postMessage({
					type: "caret_persona_image_loaded",
					personaId,
					imageUri: imageUri.toString(),
				})
			} else {
				Logger.warn(`[CaretProviderWrapper] Persona image not found: ${fullPath}`)
			}
		} catch (error) {
			Logger.error(`[CaretProviderWrapper] Failed to load persona image: ${error}`)
		}
	}

	/**
	 * Get the underlying Cline controller
	 */
	public get controller(): Controller {
		return this.clineProvider.controller
	}

	/**
	 * Get the webview instance
	 */
	public getWebview(): vscode.Webview | undefined {
		const webviewInstance = this.clineProvider.getWebview()
		// Handle different webview types returned by Cline provider
		if (!webviewInstance) {
			return undefined
		}

		// If it's a WebviewView, return its webview property
		if ("webview" in webviewInstance) {
			return (webviewInstance as vscode.WebviewView).webview
		}

		// If it's already a Webview, return it directly
		return webviewInstance as vscode.Webview
	}

	/**
	 * Get the client ID
	 */
	public getClientId(): string {
		return this.clineProvider.getClientId()
	}

	/**
	 * Dispose of resources
	 */
	async dispose(): Promise<void> {
		// Dispose Caret-specific resources
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []

		// Delegate to Cline provider
		await this.clineProvider.dispose()

		Logger.info("[CaretProviderWrapper] Disposed successfully")
	}
}
